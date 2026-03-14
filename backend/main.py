"""
Labfinity Backend — FastAPI application with Neon PostgreSQL authentication.

Supports:
  - Sign Up (username + email + password)
  - Sign In (email + password → JWT)
  - Google OAuth Login
  - Current-user info (/api/me)
  - Sign Out
  - Chemistry experiment endpoints (electrochemistry, potentiometry, colorimetry)
  - File uploads
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional
from supabase import create_client, Client
import os
import shutil
import uuid
import jwt
import bcrypt
import random
import string
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text

# --------------- Local imports ---------------
from db import engine, get_db, init_db, Base
from models import User, Classroom, ClassroomStudent, Assignment, Submission
from chem_tables import (
    electrochemistry_cell_table,
    generate_lambda_max_table,
    generate_concentration_absorbance_table,
    generate_ph_titration_table,
)
from chatbotai import generate_response

# --------------- Environment ---------------
# Try loading .env from the project root (one level up from backend/)
_root_env = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env")
load_dotenv(dotenv_path=_root_env)
load_dotenv()  # also load local .env if present

SECRET_KEY = os.getenv("SECRET_KEY", "please-set-a-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
# Accept either GOOGLE_CLIENT_ID or the Vite-prefixed variant from the root .env
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID") or os.getenv("VITE_GOOGLE_CLIENT_ID", "")

# --------------- App ---------------
app = FastAPI(title="Labfinity API")

# Create tables on startup
@app.on_event("startup")
def on_startup():
    init_db()

# --------------- CORS ---------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------- Upload folder ---------------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# ================================================================
#  JWT helpers
# ================================================================

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token invalid or expired")


# ================================================================
#  Auth endpoints
# ================================================================

# ---- Health ----
@app.get("/")
def root_health(db: Session = Depends(get_db)):
    """Database health check."""
    result = db.execute(text("SELECT NOW()"))
    return {"database_time": str(result.scalar())}


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


# ---- Sign Up ----
class SignUpRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = "student"  # one of 'student','faculty'
    registration_no: Optional[str] = None


@app.post("/api/signup")
def sign_up(req: SignUpRequest, db: Session = Depends(get_db)):
    """Register a new user. Prevents duplicate email or username."""

    # ensure role is valid
    if req.role not in ("student", "faculty"):
        raise HTTPException(status_code=400, detail="Invalid role")

    # Validate email domain based on role
    if req.role == "student":
        if not req.email.endswith("@vitapstudent.ac.in"):
            raise HTTPException(status_code=400, detail="Invalid domain. Students must use @vitapstudent.ac.in")
    elif req.role == "faculty":
        if not req.email.endswith("@vitap.ac.in"):
            raise HTTPException(status_code=400, detail="Invalid domain. Faculty must use @vitap.ac.in")


    # Check duplicate email or username
    existing_email = db.query(User).filter(User.email == req.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    existing_username = db.query(User).filter(User.name == req.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed = bcrypt.hashpw(req.password.encode(), bcrypt.gensalt()).decode()

    user = User(
        name=req.username,
        email=req.email,
        password=hashed,
        role=req.role,
        registration_no=req.registration_no,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"user_id": user.id, "email": user.email, "role": req.role})
    return {
        "message": "Account created",
        "access_token": token,
        "user_id": user.id,
        "email": user.email,
        "username": user.name,
        "role": req.role,
        "registration_no": user.registration_no,
    }


# ---- Sign In ----
class SignInRequest(BaseModel):
    email: str
    password: str


@app.post("/api/signin")
def sign_in(req: SignInRequest, db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT token."""

    user = db.query(User).filter(User.email == req.email).first()
    if not user or not user.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not bcrypt.checkpw(req.password.encode(), user.password.encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"user_id": user.id, "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "user_id": user.id,
        "email": user.email,
        "username": user.name,
        "role": user.role,
        "registration_no": user.registration_no,
    }


# ---- Google OAuth Login ----
class GoogleLoginRequest(BaseModel):
    token: str


@app.post("/api/auth/google")
def google_login(req: GoogleLoginRequest, db: Session = Depends(get_db)):
    """
    Verify a Google ID token, create the user if they don't exist,
    and return a JWT.
    """
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests

        if not GOOGLE_CLIENT_ID:
            raise Exception("GOOGLE_CLIENT_ID not set in environment")

        idinfo = id_token.verify_oauth2_token(
            req.token, google_requests.Request(), GOOGLE_CLIENT_ID
        )
        google_id = idinfo["sub"]
        email = idinfo.get("email", "")
        name = idinfo.get("name", "")
        picture = idinfo.get("picture")

    except Exception as e:
        error_msg = str(e)
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {error_msg}")

    user = db.query(User).filter(User.email == email).first()
    if user:
        # User already exists
        pass
    else:
        # create new account, default to student role
        user = User(
            name=email.split("@")[0] or name,
            email=email,
            password="",  # no password for Google-only users
            role="student",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"user_id": user.id, "email": user.email, "role": user.role})
    return {
        "message": "Login successful",
        "access_token": token,
        "user_id": user.id,
        "email": user.email,
        "username": user.name,
        "role": user.role,
    }


# ---- Chatbot ----
class ChatMessage(BaseModel):
    message: str

@app.post("/api/chat")
def chat_endpoint(req: ChatMessage):
    """Chatbot endpoint for STEM experiment assistance."""
    try:
        response_text = generate_response(req.message)
        return {"response": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---- Current User ----
@app.get("/api/me")
def get_me(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Return current user info from the Bearer token."""

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split(" ", 1)[1]
    payload = verify_token(token)
    user_id = payload.get("user_id")
    role = payload.get("role", "student")  # Default to student for backward compatibility
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "user_id": user.id,
        "email": user.email,
        "username": user.name,
        "role": user.role,
        "registration_no": user.registration_no,
    }


# ---- Sign Out ----
@app.post("/api/signout")
def sign_out():
    """Client should delete stored token; server just confirms."""
    return {"message": "Signed out successfully"}


# ================================================================
#  Classroom endpoints
# ================================================================

def generate_join_code(db: Session, length=8):
    """Generate a random unique join code."""
    characters = string.ascii_uppercase + string.digits
    while True:
        code = ''.join(random.choice(characters) for _ in range(length))
        existing = db.query(Classroom).filter(Classroom.join_code == code).first()
        if not existing:
            return code

class CreateClassroomRequest(BaseModel):
    class_name: str
    subject: str

class ClassroomResponse(BaseModel):
    id: int
    class_name: str
    subject: str
    join_code: str
    created_at: datetime
    student_count: int

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Extract the current user from the Authorization: Bearer <token> header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token missing or invalid format")
    token = authorization.split(" ", 1)[1]
    payload = verify_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@app.post("/api/classrooms")
def create_classroom(req: CreateClassroomRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "faculty":
        raise HTTPException(status_code=403, detail="Only faculty can create classrooms")
    
    join_code = generate_join_code(db)
    classroom = Classroom(
        class_name=req.class_name,
        subject=req.subject,
        faculty_id=user.id,
        join_code=join_code
    )
    db.add(classroom)
    db.commit()
    db.refresh(classroom)
    student_count = 0  # newly created classroom has no students yet
    return {
        "message": "Classroom created",
        "classroom": {
            "id": classroom.id,
            "class_name": classroom.class_name,
            "subject": classroom.subject,
            "join_code": classroom.join_code,
            "created_at": classroom.created_at.isoformat() if classroom.created_at else None,
            "student_count": student_count,
        }
    }

@app.get("/api/classrooms")
def get_classrooms(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role == "faculty":
        classrooms = db.query(Classroom).filter(Classroom.faculty_id == user.id).all()
    else:
        # For students, get classrooms they joined
        classrooms = db.query(Classroom).join(ClassroomStudent).filter(ClassroomStudent.student_id == user.id).all()
    
    result = []
    for c in classrooms:
        student_count = db.query(ClassroomStudent).filter(ClassroomStudent.classroom_id == c.id).count()
        faculty_user = db.query(User).filter(User.id == c.faculty_id).first()
        result.append({
            "id": c.id,
            "class_name": c.class_name,
            "subject": c.subject,
            "join_code": c.join_code,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "student_count": student_count,
            "faculty_name": faculty_user.name if faculty_user else "Unknown",
        })
    return result


class JoinClassroomRequest(BaseModel):
    join_code: str


@app.post("/api/classrooms/join")
def join_classroom(
    req: JoinClassroomRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Allow a student to join a classroom by its join code."""
    if user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can join classrooms")

    classroom = db.query(Classroom).filter(Classroom.join_code == req.join_code).first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Invalid join code – classroom not found")

    # Check if already a member
    already_joined = (
        db.query(ClassroomStudent)
        .filter(
            ClassroomStudent.classroom_id == classroom.id,
            ClassroomStudent.student_id == user.id,
        )
        .first()
    )
    if already_joined:
        raise HTTPException(status_code=400, detail="You have already joined this classroom")

    entry = ClassroomStudent(classroom_id=classroom.id, student_id=user.id)
    db.add(entry)
    db.commit()
    return {
        "message": f"Successfully joined '{classroom.class_name}'",
        "classroom_id": classroom.id,
        "class_name": classroom.class_name,
        "subject": classroom.subject,
    }


# ================================================================
#  Classroom student management endpoints
# ================================================================

class AddStudentsRequest(BaseModel):
    emails: List[str]


@app.post("/api/classrooms/{classroom_id}/add-students")
def add_students_to_classroom(
    classroom_id: int,
    req: AddStudentsRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Faculty can bulk-add students to a classroom by email."""
    if user.role != "faculty":
        raise HTTPException(status_code=403, detail="Only faculty can add students")

    classroom = db.query(Classroom).filter(
        Classroom.id == classroom_id,
        Classroom.faculty_id == user.id,
    ).first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found or not yours")

    results = []
    added_count = 0

    for raw_email in req.emails:
        email = raw_email.strip().lower()
        if not email:
            continue

        student = db.query(User).filter(User.email == email).first()
        if not student:
            results.append({"email": email, "status": "not_found"})
            continue
        if student.role != "student":
            results.append({"email": email, "status": "not_a_student"})
            continue

        existing = db.query(ClassroomStudent).filter(
            ClassroomStudent.classroom_id == classroom_id,
            ClassroomStudent.student_id == student.id,
        ).first()
        if existing:
            results.append({"email": email, "status": "already_enrolled", "name": student.name})
            continue

        db.add(ClassroomStudent(classroom_id=classroom_id, student_id=student.id))
        added_count += 1
        results.append({"email": email, "status": "added", "name": student.name})

    db.commit()

    student_count = db.query(ClassroomStudent).filter(
        ClassroomStudent.classroom_id == classroom_id
    ).count()

    return {
        "added": added_count,
        "student_count": student_count,
        "results": results,
    }


@app.get("/api/classrooms/{classroom_id}/students")
def get_classroom_students(
    classroom_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return list of students enrolled in a classroom."""
    # Faculty: must own the classroom. Student: must be enrolled.
    if user.role == "faculty":
        classroom = db.query(Classroom).filter(
            Classroom.id == classroom_id,
            Classroom.faculty_id == user.id,
        ).first()
        if not classroom:
            raise HTTPException(status_code=404, detail="Classroom not found or not yours")
    else:
        enrolled = db.query(ClassroomStudent).filter(
            ClassroomStudent.classroom_id == classroom_id,
            ClassroomStudent.student_id == user.id,
        ).first()
        if not enrolled:
            raise HTTPException(status_code=403, detail="You are not enrolled in this classroom")

    entries = (
        db.query(ClassroomStudent, User)
        .join(User, User.id == ClassroomStudent.student_id)
        .filter(ClassroomStudent.classroom_id == classroom_id)
        .all()
    )

    return [
        {
            "student_id": u.id,
            "name": u.name,
            "email": u.email,
            "registration_no": u.registration_no,
            "joined_at": cs.joined_at.isoformat() if cs.joined_at else None,
        }
        for cs, u in entries
    ]


# ================================================================
#  Classwork / Assignment endpoints
# ================================================================

class CreateAssignmentRequest(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None  # ISO date string e.g. "2026-04-01"


@app.post("/api/classrooms/{classroom_id}/assignments")
def create_assignment(
    classroom_id: int,
    req: CreateAssignmentRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Faculty creates a new classwork/assignment."""
    if user.role != "faculty":
        raise HTTPException(status_code=403, detail="Only faculty can create assignments")

    classroom = db.query(Classroom).filter(
        Classroom.id == classroom_id,
        Classroom.faculty_id == user.id,
    ).first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found or not yours")

    from datetime import date as _date
    parsed_due = None
    if req.due_date:
        try:
            parsed_due = _date.fromisoformat(req.due_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid due_date format. Use YYYY-MM-DD")

    assignment = Assignment(
        classroom_id=classroom_id,
        title=req.title,
        description=req.description,
        due_date=parsed_due,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return {
        "id": assignment.id,
        "title": assignment.title,
        "description": assignment.description,
        "due_date": assignment.due_date.isoformat() if assignment.due_date else None,
        "created_at": assignment.created_at.isoformat() if assignment.created_at else None,
    }


@app.get("/api/classrooms/{classroom_id}/assignments")
def list_assignments(
    classroom_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all assignments for a classroom (faculty owner or enrolled student)."""
    if user.role == "faculty":
        classroom = db.query(Classroom).filter(
            Classroom.id == classroom_id,
            Classroom.faculty_id == user.id,
        ).first()
        if not classroom:
            raise HTTPException(status_code=404, detail="Classroom not found or not yours")
    else:
        enrolled = db.query(ClassroomStudent).filter(
            ClassroomStudent.classroom_id == classroom_id,
            ClassroomStudent.student_id == user.id,
        ).first()
        if not enrolled:
            raise HTTPException(status_code=403, detail="You are not enrolled in this classroom")

    assignments = (
        db.query(Assignment)
        .filter(Assignment.classroom_id == classroom_id)
        .order_by(Assignment.created_at.desc())
        .all()
    )

    result = []
    for a in assignments:
        submission_count = db.query(Submission).filter(Submission.assignment_id == a.id).count()
        # If student, include their own submission status
        my_submission = None
        if user.role == "student":
            sub = db.query(Submission).filter(
                Submission.assignment_id == a.id,
                Submission.student_id == user.id,
            ).first()
            if sub:
                my_submission = {
                    "id": sub.id,
                    "file_url": sub.file_url,
                    "submitted_at": sub.submitted_at.isoformat() if sub.submitted_at else None,
                }
        result.append({
            "id": a.id,
            "title": a.title,
            "description": a.description,
            "due_date": a.due_date.isoformat() if a.due_date else None,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "submission_count": submission_count,
            "my_submission": my_submission,
        })
    return result


@app.post("/api/assignments/{assignment_id}/submit")
async def submit_assignment(
    assignment_id: int,
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    """Student uploads a file for an assignment."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token missing")
    token = authorization.split(" ", 1)[1]
    payload = verify_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    student = db.query(User).filter(User.id == user_id).first()
    if not student or student.role != "student":
        raise HTTPException(status_code=403, detail="Only students can submit")

    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Verify student is enrolled
    enrolled = db.query(ClassroomStudent).filter(
        ClassroomStudent.classroom_id == assignment.classroom_id,
        ClassroomStudent.student_id == user_id,
    ).first()
    if not enrolled:
        raise HTTPException(status_code=403, detail="You are not enrolled in this classroom")

    # Save file
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    file_url = f"/uploads/{unique_filename}"

    # Upsert: replace previous submission if exists
    existing = db.query(Submission).filter(
        Submission.assignment_id == assignment_id,
        Submission.student_id == user_id,
    ).first()
    if existing:
        existing.file_url = file_url
        existing.submitted_at = datetime.utcnow()
    else:
        db.add(Submission(
            assignment_id=assignment_id,
            student_id=user_id,
            file_url=file_url,
        ))
    db.commit()

    return {"message": "Submitted successfully", "file_url": file_url}


@app.get("/api/assignments/{assignment_id}/submissions")
def list_submissions(
    assignment_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Faculty views all submissions for an assignment."""
    if user.role != "faculty":
        raise HTTPException(status_code=403, detail="Only faculty can view submissions")

    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    entries = (
        db.query(Submission, User)
        .join(User, User.id == Submission.student_id)
        .filter(Submission.assignment_id == assignment_id)
        .all()
    )

    return [
        {
            "student_id": u.id,
            "name": u.name,
            "email": u.email,
            "file_url": s.file_url,
            "submitted_at": s.submitted_at.isoformat() if s.submitted_at else None,
        }
        for s, u in entries
    ]


# ================================================================
#  Chemistry experiment endpoints
# ================================================================

# ---- Electrochemistry ----
class ElectrochemistryTableRequest(BaseModel):
    anode_metal: str = "Zn"
    cathode_metal: str = "Cu"
    anode_concentration: float = 1.0
    cathode_concentrations: List[float] = [0.01, 0.05, 0.10, 0.50, 1.00]
    unknown_concentration: Optional[float] = None
    n: int = 2


@app.post("/api/electrochemistry-table")
def get_electrochemistry_table(req: ElectrochemistryTableRequest):
    result = electrochemistry_cell_table(
        anode_metal=req.anode_metal,
        cathode_metal=req.cathode_metal,
        anode_concentration=req.anode_concentration,
        cathode_concentrations=req.cathode_concentrations,
        unknown_emf=None,
        n=req.n,
    )
    table = result["table"]

    unknown_emf = None
    if req.unknown_concentration is not None and req.unknown_concentration > 0:
        import math
        E0_cell = result["E0_cell"]
        ratio = req.anode_concentration / req.unknown_concentration
        log_ratio = math.log10(ratio)
        unknown_emf = round(max(0, E0_cell - (0.0591 / req.n) * log_ratio), 4)

    return {"table": table, "E0_cell": result["E0_cell"], "unknown_emf": unknown_emf}


# ---- Potentiometry ----
class PotentiometryTrialRow(BaseModel):
    volume: float
    pH: Optional[float] = None


class PotentiometryTableRequest(BaseModel):
    acid: str = "HCl"
    base: str = "NaOH"
    acid_volume: float = 20.0
    trials: List[PotentiometryTrialRow]


@app.post("/api/potentiometry-table")
def get_potentiometry_table(req: PotentiometryTableRequest):
    trials_input = [
        {"volume": row.volume, "pH": row.pH if row.pH is not None else 0.0}
        for row in req.trials
    ]
    table = generate_ph_titration_table(trials_input)

    base_col = f"Volume of {req.base} (mL)"
    for row in table:
        row[base_col] = row.pop("Addition of NaOH (mL)", row.get("Volume of NaOH added (mL)", ""))
        row.pop("Volume of NaOH added (mL)", None)

    acid_col = f"Volume of {req.acid} (mL)"
    return {
        "acid": req.acid,
        "base": req.base,
        "acid_volume": req.acid_volume,
        "acid_col": acid_col,
        "base_col": base_col,
        "table": table,
    }


# ---- Colorimetry ----
SOLUTION_COLORIMETRY_DATA = {
    "KMnO4":         {"lambda_max": 525, "conc_range": [0.005, 0.01, 0.02, 0.03, 0.04, 0.05, 0.07, 0.10]},
    "CuSO4":         {"lambda_max": 800, "conc_range": [0.01, 0.02, 0.04, 0.06, 0.08, 0.10, 0.15, 0.20]},
    "NiSO4":         {"lambda_max": 394, "conc_range": [0.01, 0.02, 0.04, 0.06, 0.08, 0.10, 0.15, 0.20]},
    "CrystalViolet": {"lambda_max": 590, "conc_range": [0.000002, 0.000005, 0.00001, 0.00002, 0.00005, 0.0001, 0.0002, 0.0005]},
    "MethyleneBlue": {"lambda_max": 664, "conc_range": [0.000002, 0.000005, 0.00001, 0.00002, 0.00005, 0.0001, 0.0002, 0.0005]},
}


def _generate_wavelengths_around_lambda_max(lambda_max: int, n: int = 8) -> list:
    half = n // 2
    step = 25
    wavelengths = {lambda_max}
    for i in range(1, half + 2):
        w_low = lambda_max - i * step
        w_high = lambda_max + i * step
        if 380 <= w_low <= 780:
            wavelengths.add(w_low)
        if 380 <= w_high <= 780:
            wavelengths.add(w_high)
        if len(wavelengths) >= n:
            break
    return sorted(wavelengths)[:n]


@app.get("/api/colorimetry-lambda-max-table")
def get_colorimetry_lambda_max_table(solution: str = "KMnO4"):
    data = SOLUTION_COLORIMETRY_DATA.get(solution, SOLUTION_COLORIMETRY_DATA["KMnO4"])
    lambda_max = data["lambda_max"]
    wavelengths = _generate_wavelengths_around_lambda_max(lambda_max, n=8)
    rows = [{"s_no": i + 1, "wavelength": w} for i, w in enumerate(wavelengths)]
    return {"solution": solution, "lambda_max": lambda_max, "rows": rows}


@app.get("/api/colorimetry-concentration-table")
def get_colorimetry_concentration_table(solution: str = "KMnO4"):
    data = SOLUTION_COLORIMETRY_DATA.get(solution, SOLUTION_COLORIMETRY_DATA["KMnO4"])
    concentrations = data["conc_range"]
    rows = [{"s_no": i + 1, "concentration": c} for i, c in enumerate(concentrations)]
    return {"solution": solution, "lambda_max": data["lambda_max"], "rows": rows}


# ================================================================
#  Quiz endpoint
# ================================================================

import json
import random as _random

_QUIZ_JSON_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "quiz_questions.json")

def _load_quiz_data():
    with open(_QUIZ_JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/api/quiz/{experiment_id}")
def get_quiz(experiment_id: int, count: int = 7):
    """
    Return `count` random questions for the given experiment_id.
    Each question has its options shuffled so the correct answer is
    not always in the first position.
    """
    data = _load_quiz_data()
    experiments = data.get("experiments", [])

    # Find the experiment
    experiment = next((e for e in experiments if e["id"] == experiment_id), None)
    if experiment is None:
        raise HTTPException(
            status_code=404,
            detail=f"No experiment found with id={experiment_id}",
        )

    all_questions = experiment.get("questions", [])
    if not all_questions:
        raise HTTPException(status_code=404, detail="No questions found for this experiment")

    # Pick `count` random questions (or all if fewer exist)
    picked = _random.sample(all_questions, min(count, len(all_questions)))

    # Shuffle each question's options (keep correct_answer reference intact)
    result = []
    for q in picked:
        options = list(q["options"])
        _random.shuffle(options)
        result.append({
            "id": q["id"],
            "question": q["question"],
            "options": options,
            "correct_answer": q["correct_answer"],
        })

    return {
        "experiment_id": experiment_id,
        "title": experiment.get("title", ""),
        "questions": result,
    }


# ================================================================
#  File Upload
# ================================================================

@app.post("/api/upload")
async def upload_graph(
    file: UploadFile = File(...),
    studentId: str = Form(...),
    experimentId: str = Form(...),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")

    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "message": "Upload successful",
        "fileUrl": f"http://localhost:8000/uploads/{unique_filename}",
    }

# ---- Pydantic Models ----
# class ChatRequest(BaseModel):
#     message: str

# class ChatResponse(BaseModel):
#     response: str

# ---- Chatbot Endpoint ----
# @app.post("/api/chat")
# async def chat_endpoint(request: ChatRequest):
#     """
#     Chat with the AI assistant for experiment help
#     """
#     try:
#         response = generate_response(request.message)
#         return ChatResponse(response=response)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
