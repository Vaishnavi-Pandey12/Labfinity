import math
from typing import List, Dict, Any, Literal
from pydantic import BaseModel

SolutionType = Literal["KMnO4", "CuSO4", "NiSO4", "CrystalViolet", "MethyleneBlue"]

class WavelengthDataPoint(BaseModel):
    wavelength: int
    absorbance: float

# Molar absorptivity and λmax for different solutions
# Ported from ColorimetrySimulator.tsx
SOLUTION_DATA = {
    "KMnO4": {"lambda_max": 525, "epsilon": 2400},
    "CuSO4": {"lambda_max": 800, "epsilon": 12},
    "NiSO4": {"lambda_max": 394, "epsilon": 5},
    "CrystalViolet": {"lambda_max": 590, "epsilon": 87000},
    "MethyleneBlue": {"lambda_max": 664, "epsilon": 95000},
}

def calculate_absorbance(solution: SolutionType, concentration: float, wavelength: int) -> float:
    """
    Calculate absorbance using Beer-Lambert Law with Gaussian distribution around lambda_max.
    """
    data = SOLUTION_DATA.get(solution)
    if not data:
        return 0.0
        
    lambda_max = data["lambda_max"]
    epsilon = data["epsilon"]
    path_length = 1.0  # 1 cm
    sigma = 40.0
    
    # Calculate absorbance at lambda_max
    # Original: epsilon * pathLength * concentration * 0.001
    absorbance_max = epsilon * path_length * concentration * 0.001
    
    # Apply Gaussian distribution
    # Original: absorbanceMax * Math.exp(-Math.pow(wavelength - lambdaMax, 2) / (2 * sigma * sigma))
    exponent = -pow(wavelength - lambda_max, 2) / (2 * sigma * sigma)
    absorbance = absorbance_max * math.exp(exponent)
    
    return min(absorbance, 2.5)

def generate_spectrum(solution: SolutionType, concentration: float) -> List[WavelengthDataPoint]:
    """
    Generate absorption spectrum from 400nm to 700nm.
    """
    points = []
    # Range 400 to 700 inclusive, step 10
    for wavelength in range(400, 701, 10):
        absorbance = calculate_absorbance(solution, concentration, wavelength)
        points.append(WavelengthDataPoint(wavelength=wavelength, absorbance=absorbance))
    return points
