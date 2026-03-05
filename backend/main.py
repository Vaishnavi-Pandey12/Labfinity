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
from sqlalchemy import text
from sqlalchemy.orm import Session

import os
import shutil
import uuid
import bcrypt
import jwt
from datetime import datetime, timedelta

# --------------- Local imports ---------------
# Support both `uvicorn backend.main:app` (from repo root) and
# `uvicorn main:app` (from backend/ directory).
try:
    from backend.db import engine, get_db, init_db, Base
    from backend.models import User
    from backend.chem_tables import (
        electrochemistry_cell_table,
        generate_lambda_max_table,
        generate_concentration_absorbance_table,
        generate_ph_titration_table,
    )
except ImportError:
    from db import engine, get_db, init_db, Base
    from models import User
    from chem_tables import (
        electrochemistry_cell_table,
        generate_lambda_max_table,
        generate_concentration_absorbance_table,
        generate_ph_titration_table,
    )

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


@app.post("/api/signup")
def sign_up(req: SignUpRequest, db: Session = Depends(get_db)):
    """Register a new user. Prevents duplicate email or username."""

    # Check duplicate email
    existing_email = db.query(User).filter(User.email == req.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check duplicate username
    existing_username = db.query(User).filter(User.username == req.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed = bcrypt.hashpw(req.password.encode(), bcrypt.gensalt()).decode()

    user = User(
        username=req.username,
        email=req.email,
        hashed_password=hashed,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"user_id": user.id, "email": user.email})
    return {
        "message": "Account created",
        "access_token": token,
        "user_id": user.id,
        "email": user.email,
        "username": user.username,
    }


# ---- Sign In ----
class SignInRequest(BaseModel):
    email: str
    password: str


@app.post("/api/signin")
def sign_in(req: SignInRequest, db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT token."""

    user = db.query(User).filter(User.email == req.email).first()
    if not user or not user.hashed_password:
        # either the user doesn't exist, or they signed up with Google only
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not bcrypt.checkpw(req.password.encode(), user.hashed_password.encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"user_id": user.id, "email": user.email})
    return {
        "access_token": token,
        "user_id": user.id,
        "email": user.email,
        "username": user.username,
    }


# ---- Google OAuth Login ----
class GoogleLoginRequest(BaseModel):
    token: str


@app.post("/auth/google")
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

        print(f"[DEBUG] Verifying token with CLIENT_ID: {GOOGLE_CLIENT_ID}")
        
        idinfo = id_token.verify_oauth2_token(
            req.token, google_requests.Request(), GOOGLE_CLIENT_ID
        )

        print(f"[DEBUG] Token verified successfully. Email: {idinfo.get('email')}")
        
        google_id = idinfo["sub"]
        email = idinfo.get("email", "")
        name = idinfo.get("name", "")
        picture = idinfo.get("picture")

    except Exception as e:
        error_msg = str(e)
        print(f"[ERROR] Google token verification failed: {error_msg}")
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {error_msg}")

    # Try to find user by google_id first, then by email
    user = db.query(User).filter(User.google_id == google_id).first()

    if not user:
        user = db.query(User).filter(User.email == email).first()
        if user:
            # Link existing account to Google
            user.google_id = google_id
            if picture:
                user.profile_picture = picture
            db.commit()
            db.refresh(user)
        else:
            # Create brand-new user
            user = User(
                username=email.split("@")[0],   # derive username from email
                email=email,
                hashed_password=None,              # no password for Google-only users
                google_id=google_id,
                profile_picture=picture,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    token = create_access_token({"user_id": user.id, "email": user.email})
    return {
        "message": "Login successful",
        "access_token": token,
        "user_id": user.id,
        "email": user.email,
        "username": user.username,
        "profile_picture": user.profile_picture,
    }


# ---- Current User ----
@app.get("/api/me")
def get_me(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Return current user info from the Bearer token."""

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split(" ", 1)[1]
    payload = verify_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "user_id": user.id,
        "email": user.email,
        "username": user.username,
        "profile_picture": user.profile_picture,
    }


# ---- Sign Out ----
@app.post("/api/signout")
def sign_out():
    """Client should delete stored token; server just confirms."""
    return {"message": "Signed out successfully"}


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
