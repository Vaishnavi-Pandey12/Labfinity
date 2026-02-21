# chemistry_tables.py
import math


# --------------------------------------------------
# 1️⃣ pH Titration
# --------------------------------------------------

def generate_ph_titration_table(trials):
    """
    trials = [
        {"volume_added": 5, "pH": 3.2},
        {"volume_added": 10, "pH": 5.8}
    ]
    """

    table = []

    for i, trial in enumerate(trials, start=1):
        table.append({
            "Trial": i,
            "Volume of Titrant Added (mL)": trial["volume_added"],
            "Measured pH": trial["pH"]
        })

    return table


# --------------------------------------------------
# 2️⃣ Acid–Base Titration (Phenolphthalein)
# --------------------------------------------------

def generate_acid_base_titration_table(trials):
    """
    trials = [
        {"initial_burette": 0, "final_burette": 18.5}
    ]
    """

    table = []

    for i, trial in enumerate(trials, start=1):
        titre = trial["final_burette"] - trial["initial_burette"]

        table.append({
            "Trial": i,
            "Initial Burette Reading (mL)": trial["initial_burette"],
            "Final Burette Reading (mL)": trial["final_burette"],
            "Titre Value (mL)": round(titre, 2)
        })

    return table


# --------------------------------------------------
# 3️⃣ Hardness (EDTA Method – Part 1 & 2)
# --------------------------------------------------

def generate_hardness_table(trials):
    """
    trials = [
        {"initial": 0, "final": 12.5}
    ]
    """

    table = []

    for i, trial in enumerate(trials, start=1):
        edta_used = trial["final"] - trial["initial"]

        table.append({
            "Trial": i,
            "Initial Reading (mL)": trial["initial"],
            "Final Reading (mL)": trial["final"],
            "EDTA Used (mL)": round(edta_used, 2)
        })

    return table


# --------------------------------------------------
# 4️⃣ Redox Titration (KMnO4 + Oxalic Acid)
# --------------------------------------------------

def generate_redox_titration_table(trials):
    """
    trials = [
        {"initial": 0, "final": 20.3}
    ]
    """

    table = []

    for i, trial in enumerate(trials, start=1):
        titre = trial["final"] - trial["initial"]

        table.append({
            "Trial": i,
            "Initial KMnO4 Reading (mL)": trial["initial"],
            "Final KMnO4 Reading (mL)": trial["final"],
            "Titre Value (mL)": round(titre, 2)
        })

    return table


# --------------------------------------------------
# 5️⃣ Colorimetry (Beer–Lambert Law)
# A = ε * l * c
# --------------------------------------------------

def generate_beer_lambert_table(trials):
    """
    trials = [
        {"epsilon": 100, "path_length": 1, "concentration": 0.02}
    ]
    """

    table = []

    for i, trial in enumerate(trials, start=1):
        A = trial["epsilon"] * trial["path_length"] * trial["concentration"]

        table.append({
            "Trial": i,
            "Molar Absorptivity (ε)": trial["epsilon"],
            "Path Length (cm)": trial["path_length"],
            "Concentration (mol/L)": trial["concentration"],
            "Absorbance (A)": round(A, 4)
        })

    return table


# --------------------------------------------------
# 6️⃣ Conductance
# κ = (1 / R) * cell_constant
# --------------------------------------------------

def generate_conductance_table(trials):
    """
    trials = [
        {"resistance": 100, "cell_constant": 1}
    ]
    """

    table = []

    for i, trial in enumerate(trials, start=1):
        conductance = (1 / trial["resistance"]) * trial["cell_constant"]

        table.append({
            "Trial": i,
            "Resistance (Ohm)": trial["resistance"],
            "Cell Constant": trial["cell_constant"],
            "Specific Conductance (κ)": round(conductance, 6)
        })

    return table


# --------------------------------------------------
# 7️⃣ Electrochemistry – Daniel Cell
# E = E°cathode - E°anode
# --------------------------------------------------

def generate_daniel_cell_table(trials):
    """
    trials = [
        {"E0_cathode": 0.34, "E0_anode": -0.76}
    ]
    """

    table = []

    for i, trial in enumerate(trials, start=1):
        E_cell = trial["E0_cathode"] - trial["E0_anode"]

        table.append({
            "Trial": i,
            "E° Cathode (V)": trial["E0_cathode"],
            "E° Anode (V)": trial["E0_anode"],
            "Cell Potential (V)": round(E_cell, 3)
        })

    return table


# --------------------------------------------------
# Example Testing Block
# --------------------------------------------------

if __name__ == "__main__":

    print("1️⃣ pH Titration:")
    print(generate_ph_titration_table([
        {"volume_added": 5, "pH": 3.2}
    ]))

    print("\n2️⃣ Acid Base Titration:")
    print(generate_acid_base_titration_table([
        {"initial_burette": 0, "final_burette": 18.5}
    ]))

    print("\n3️⃣ Hardness:")
    print(generate_hardness_table([
        {"initial": 0, "final": 12.5}
    ]))

    print("\n4️⃣ Redox Titration:")
    print(generate_redox_titration_table([
        {"initial": 0, "final": 20.3}
    ]))

    print("\n5️⃣ Beer-Lambert:")
    print(generate_beer_lambert_table([
        {"epsilon": 120, "path_length": 1, "concentration": 0.01}
    ]))

    print("\n6️⃣ Conductance:")
    print(generate_conductance_table([
        {"resistance": 100, "cell_constant": 1}
    ]))

    print("\n7️⃣ Daniel Cell:")
    print(generate_daniel_cell_table([
        {"E0_cathode": 0.34, "E0_anode": -0.76}
    ]))