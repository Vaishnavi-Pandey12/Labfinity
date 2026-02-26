from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional
from supabase import create_client, Client
import os
import shutil
import uuid
from chem_tables import electrochemistry_cell_table, generate_lambda_max_table, generate_concentration_absorbance_table, generate_ph_titration_table

# ---------------- Load Environment ----------------
load_dotenv()

# ---------------- Supabase Client ----------------
SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ---------------- App ----------------
app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Upload Folder ----------------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ---------------- Routes ----------------

@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/supabase-test")
def supabase_test():
    """Test the Supabase client connection by querying the students table."""
    try:
        response = supabase.table("students").select("*").limit(1).execute()
        return {
            "status": "connected",
            "supabase_url": SUPABASE_URL,
            "sample_data": response.data,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase connection failed: {str(e)}")


# ---------------- Auth: Sign Up ----------------

class SignUpRequest(BaseModel):
    full_name: str
    email: str
    password: str

@app.post("/api/signup")
def sign_up(req: SignUpRequest):
    """
    Create a new student via Supabase Auth.
    full_name is stored in user metadata AND in the students table.
    """
    try:
        # 1. Create auth user — store full_name in metadata so it's always available
        auth_response = supabase.auth.sign_up({
            "email": req.email,
            "password": req.password,
            "options": {
                "data": {"full_name": req.full_name}
            }
        })
        user = auth_response.user
        if not user:
            raise HTTPException(status_code=400, detail="Sign-up failed. Email may already be registered.")

        # 2. Try to insert profile row into students table (may fail if email confirmation pending)
        try:
            supabase.table("students").insert({
                "id": user.id,
                "full_name": req.full_name,
            }).execute()
        except Exception as table_err:
            print(f"[SIGNUP] students table insert failed (non-fatal): {table_err}")
            # Auth user was created; students table will be populated via trigger if set up

        return {
            "message": "Account created successfully",
            "user_id": user.id,
            "email": user.email,
            "full_name": req.full_name,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[SIGNUP ERROR] {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------- Auth: Sign In ----------------

class SignInRequest(BaseModel):
    email: str
    password: str

@app.post("/api/signin")
def sign_in(req: SignInRequest):
    """
    Sign in an existing student via Supabase Auth.
    Returns access_token and student info.
    """
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password,
        })
        user = auth_response.user
        session = auth_response.session
        if not user or not session:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        # Fetch full_name — try students table first, fall back to user metadata
        full_name = ""
        try:
            profile = supabase.table("students").select("full_name").eq("id", user.id).single().execute()
            full_name = profile.data.get("full_name", "") if profile.data else ""
        except Exception:
            pass
        if not full_name:
            # Fallback: read from auth user metadata set during sign_up
            full_name = (user.user_metadata or {}).get("full_name", "")

        return {
            "access_token": session.access_token,
            "user_id": user.id,
            "email": user.email,
            "full_name": full_name,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[SIGNIN ERROR] {e}")
        raise HTTPException(status_code=401, detail="Invalid email or password.")


# ---------------- Auth: Get Current User ----------------

@app.get("/api/me")
def get_me(authorization: Optional[str] = Header(None)):
    """
    Return current user info using the Bearer token from the Authorization header.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        if not user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        profile = supabase.table("students").select("full_name").eq("id", user.id).single().execute()
        full_name = profile.data.get("full_name", "") if profile.data else ""
        return {"user_id": user.id, "email": user.email, "full_name": full_name}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ---------------- Auth: Sign Out ----------------

@app.post("/api/signout")
def sign_out(authorization: Optional[str] = Header(None)):
    """
    Sign out the current user (invalidate server-side session if possible).
    """
    # Client should delete stored token; this just confirms logout
    return {"message": "Signed out successfully"}


# ---------------- Electrochemistry Table ----------------

class ElectrochemistryTableRequest(BaseModel):
    anode_metal: str = "Zn"
    cathode_metal: str = "Cu"
    anode_concentration: float = 1.0
    cathode_concentrations: List[float] = [0.01, 0.05, 0.10, 0.50, 1.00]
    unknown_concentration: Optional[float] = None
    n: int = 2

@app.post("/api/electrochemistry-table")
def get_electrochemistry_table(req: ElectrochemistryTableRequest):
    """
    Generate electrochemistry observation table using Nernst equation.
    If unknown_concentration is provided, also returns the theoretical EMF for that concentration.
    """
    result = electrochemistry_cell_table(
        anode_metal=req.anode_metal,
        cathode_metal=req.cathode_metal,
        anode_concentration=req.anode_concentration,
        cathode_concentrations=req.cathode_concentrations,
        unknown_emf=None,
        n=req.n
    )

    table = result["table"]

    # Compute EMF for the unknown concentration if provided
    unknown_emf = None
    if req.unknown_concentration is not None and req.unknown_concentration > 0:
        import math
        E0_cell = result["E0_cell"]
        ratio = req.anode_concentration / req.unknown_concentration
        log_ratio = math.log10(ratio)
        unknown_emf = round(max(0, E0_cell - (0.0591 / req.n) * log_ratio), 4)

    return {
        "table": table,
        "E0_cell": result["E0_cell"],
        "unknown_emf": unknown_emf
    }



# ---------------- Potentiometry Table ----------------

class PotentiometryTrialRow(BaseModel):
    volume: float          # volume of base added (mL)
    pH: Optional[float] = None   # pH / potential entered by student

class PotentiometryTableRequest(BaseModel):
    acid: str = "HCl"
    base: str = "NaOH"
    acid_volume: float = 20.0
    trials: List[PotentiometryTrialRow]

@app.post("/api/potentiometry-table")
def get_potentiometry_table(req: PotentiometryTableRequest):
    """
    Generate a potentiometric titration observation table.
    Accepts up to 6 rows submitted by the student (volume of base + pH).
    Returns the processed table with ΔpH, ΔV, ΔpH/ΔV and equivalence point remark.
    """
    trials_input = [
        {"volume": row.volume, "pH": row.pH if row.pH is not None else 0.0}
        for row in req.trials
    ]
    table = generate_ph_titration_table(trials_input)

    # Rename the base-volume column to match the chosen base
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
        "table": table
    }


# ---------------- Colorimetry Tables ----------------

# Per-solution λmax and concentration ranges
SOLUTION_COLORIMETRY_DATA = {
    "KMnO4":         {"lambda_max": 525, "conc_range": [0.005, 0.01, 0.02, 0.03, 0.04, 0.05, 0.07, 0.10]},
    "CuSO4":         {"lambda_max": 800, "conc_range": [0.01, 0.02, 0.04, 0.06, 0.08, 0.10, 0.15, 0.20]},
    "NiSO4":         {"lambda_max": 394, "conc_range": [0.01, 0.02, 0.04, 0.06, 0.08, 0.10, 0.15, 0.20]},
    "CrystalViolet": {"lambda_max": 590, "conc_range": [0.000002, 0.000005, 0.00001, 0.00002, 0.00005, 0.0001, 0.0002, 0.0005]},
    "MethyleneBlue": {"lambda_max": 664, "conc_range": [0.000002, 0.000005, 0.00001, 0.00002, 0.00005, 0.0001, 0.0002, 0.0005]},
}

def _generate_wavelengths_around_lambda_max(lambda_max: int, n: int = 8) -> list:
    """Generate n wavelengths spread around lambda_max, always including lambda_max itself."""
    half = n // 2
    step = 25  # 25 nm step
    wavelengths = set()
    wavelengths.add(lambda_max)
    for i in range(1, half + 2):
        w_low = lambda_max - i * step
        w_high = lambda_max + i * step
        if 380 <= w_low <= 780:
            wavelengths.add(w_low)
        if 380 <= w_high <= 780:
            wavelengths.add(w_high)
        if len(wavelengths) >= n:
            break
    sorted_wl = sorted(wavelengths)[:n]
    return sorted_wl


@app.get("/api/colorimetry-lambda-max-table")
def get_colorimetry_lambda_max_table(solution: str = "KMnO4"):
    """
    Return 8 wavelengths spanning around the solution's λmax.
    Each row: S.No, Wavelength, (student fills Absorbance).
    """
    data = SOLUTION_COLORIMETRY_DATA.get(solution, SOLUTION_COLORIMETRY_DATA["KMnO4"])
    lambda_max = data["lambda_max"]
    wavelengths = _generate_wavelengths_around_lambda_max(lambda_max, n=8)
    rows = [{"s_no": i + 1, "wavelength": w} for i, w in enumerate(wavelengths)]
    return {
        "solution": solution,
        "lambda_max": lambda_max,
        "rows": rows
    }


@app.get("/api/colorimetry-concentration-table")
def get_colorimetry_concentration_table(solution: str = "KMnO4"):
    """
    Return 8 pre-defined concentrations for the solution.
    Each row: S.No, Concentration, (student fills Absorbance).
    """
    data = SOLUTION_COLORIMETRY_DATA.get(solution, SOLUTION_COLORIMETRY_DATA["KMnO4"])
    concentrations = data["conc_range"]
    rows = [{"s_no": i + 1, "concentration": c} for i, c in enumerate(concentrations)]
    return {
        "solution": solution,
        "lambda_max": data["lambda_max"],
        "rows": rows
    }


# ---------------- File Upload ----------------

@app.post("/api/upload")
async def upload_graph(
    file: UploadFile = File(...),
    studentId: str = Form(...),
    experimentId: str = Form(...)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")

    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "message": "Upload successful",
        "fileUrl": f"http://localhost:8000/uploads/{unique_filename}"
    }
