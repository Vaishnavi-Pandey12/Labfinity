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
from chem_tables import electrochemistry_cell_table

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
