from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.electrochemistry import calculate_emf
from app.services.colorimetry import calculate_absorbance, generate_spectrum, SolutionType, WavelengthDataPoint
from typing import List

router = APIRouter()

# --- Electrochemistry Schemas ---
class EMFRequest(BaseModel):
    zn_conc: float
    cu_conc: float

class EMFResponse(BaseModel):
    emf: float

# --- Colorimetry Schemas ---
class AbsorbanceRequest(BaseModel):
    solution: SolutionType
    concentration: float
    wavelength: int

class AbsorbanceResponse(BaseModel):
    absorbance: float

class SpectrumRequest(BaseModel):
    solution: SolutionType
    concentration: float

# --- Routes ---

@router.post("/electrochemistry/calculate", response_model=EMFResponse)
async def get_emf(request: EMFRequest):
    try:
        emf = calculate_emf(request.zn_conc, request.cu_conc)
        return EMFResponse(emf=emf)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/colorimetry/calculate", response_model=AbsorbanceResponse)
async def get_absorbance(request: AbsorbanceRequest):
    try:
        absorbance = calculate_absorbance(request.solution, request.concentration, request.wavelength)
        return AbsorbanceResponse(absorbance=absorbance)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/colorimetry/spectrum", response_model=List[WavelengthDataPoint])
async def get_spectrum(request: SpectrumRequest):
    try:
        spectrum = generate_spectrum(request.solution, request.concentration)
        return spectrum
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
