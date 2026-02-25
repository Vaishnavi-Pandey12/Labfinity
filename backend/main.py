from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from datetime import datetime
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
import uuid
from chem_tables import electrochemistry_cell_table, generate_lambda_max_table, generate_concentration_absorbance_table, generate_ph_titration_table

# ---------------- Load Environment ----------------
load_dotenv()

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
