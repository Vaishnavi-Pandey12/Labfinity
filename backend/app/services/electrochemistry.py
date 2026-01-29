import math

def calculate_emf(zn_conc: float, cu_conc: float) -> float:
    """
    Calculate EMF using Nernst equation for Daniell Cell.
    E = E0 - (0.0591 / n) * log10([Zn2+] / [Cu2+])
    """
    e0 = 1.10  # Standard EMF for Daniell cell
    n = 2      # Number of electrons transferred
    
    if cu_conc == 0:
        return 0.0 # Avoid division by zero
        
    ratio = zn_conc / cu_conc
    
    # Handle cases where log might be undefined (though conc shouldn't be <= 0)
    if ratio <= 0:
        return 0.0
        
    emf = e0 - (0.0591 / n) * math.log10(ratio)
    
    # Clamp result between 0 and 1.5V as per original frontend logic
    return max(0.0, min(1.5, emf))
