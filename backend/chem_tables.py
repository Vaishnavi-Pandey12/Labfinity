# chemistry_tables.py
import math


# --------------------------------------------------
# 1️⃣ pH Titration
# --------------------------------------------------

def generate_ph_titration_table(trials):
    """
    trials = [
        {"volume": 0, "pH": 2.1},
        {"volume": 2, "pH": 2.3},
        {"volume": 4, "pH": 2.6}
    ]
    """

    table = []
    previous_pH = None
    previous_volume = None

    max_slope = -1
    equivalence_index = None

    # First pass to compute values
    for i, trial in enumerate(trials, start=1):
        volume = trial["volume"]
        pH = trial["pH"]

        if previous_pH is None:
            delta_pH = "-"
            delta_V = "-"
            slope = "-"
        else:
            delta_pH = round(pH - previous_pH, 3)
            delta_V = round(volume - previous_volume, 3)
            slope = round(delta_pH / delta_V, 3) if delta_V != 0 else "-"

            if slope != "-" and slope > max_slope:
                max_slope = slope
                equivalence_index = i

        table.append({
            "S. No.": i,
            "Addition of NaOH (mL)": volume,
            "Volume of NaOH added (mL)": volume,
            "pH measured": pH,
            "ΔpH": delta_pH,
            "ΔV": delta_V,
            "ΔpH / ΔV": slope,
            "Remark": ""
        })

        previous_pH = pH
        previous_volume = volume

    # Mark equivalence point
    if equivalence_index is not None:
        table[equivalence_index - 1]["Remark"] = "Equivalence Point Region"

    return table

# --------------------------------------------------
# 2️⃣ Acid–Base Titration (Phenolphthalein)
# --------------------------------------------------

def generate_acid_base_titration_table(trials, include_rough=False):
    """
    trials = [
        {"V1": 10, "initial": 0.0, "final": 18.5},
        {"V1": 10, "initial": 0.2, "final": 18.7},
        {"V1": 10, "initial": 0.1, "final": 18.6}
    ]

    include_rough = False → first trial excluded from average
    """

    table = []
    titre_values = []

    for i, trial in enumerate(trials, start=1):
        V1 = trial["V1"]
        initial = trial["initial"]
        final = trial["final"]

        volume_used = round(final - initial, 2)

        table.append({
            "S. No": i,
            "Volume of HCl taken (V1) (mL)": V1,
            "Burette Initial Reading (mL)": initial,
            "Burette Final Reading (mL)": final,
            "Volume of NaOH used (mL)": volume_used,
            "Average Volume of NaOH solution (mL)": ""
        })

        # Add for averaging
        if include_rough or i != 1:
            titre_values.append(volume_used)

    # Calculate average
    if titre_values:
        avg = round(sum(titre_values) / len(titre_values), 2)

        # Put average in last row
        table[-1]["Average Volume of NaOH solution (mL)"] = avg

    return table

# --------------------------------------------------
# 3️⃣ Hardness (EDTA Method – Part 1 & 2)
# --------------------------------------------------

def generate_hardness_table_v1(trials):
    """
    trials = [
        {"sample_volume": 50, "initial": 0.0, "final": 12.5},
        {"sample_volume": 50, "initial": 0.2, "final": 12.7}
    ]
    """

    table = []

    for i, trial in enumerate(trials, start=1):
        sample_volume = trial["sample_volume"]
        initial = trial["initial"]
        final = trial["final"]

        V1 = round(final - initial, 2)

        table.append({
            "S. No.": i,
            "Volume of hard water sample (mL)": sample_volume,
            "Initial Burette Reading (mL)": initial,
            "Final Burette Reading (mL)": final,
            "Volume of EDTA (V1) (mL)": V1
        })

    return table

def generate_hardness_table_v2(trials):
    """
    trials = [
        {"sample_volume": 50, "initial": 0.0, "final": 15.3},
        {"sample_volume": 50, "initial": 0.1, "final": 15.1}
    ]
    """

    table = []

    for i, trial in enumerate(trials, start=1):
        sample_volume = trial["sample_volume"]
        initial = trial["initial"]
        final = trial["final"]

        V2 = round(final - initial, 2)

        table.append({
            "S. No.": i,
            "Volume of hard water sample (mL)": sample_volume,
            "Initial Burette Reading (mL)": initial,
            "Final Burette Reading (mL)": final,
            "Volume of EDTA (V2) (mL)": V2
        })

    return table

# --------------------------------------------------
# 4️⃣ Redox Titration (KMnO4 + Oxalic Acid)
# --------------------------------------------------

def generate_redox_kmno4_table(trials, include_rough=False):
    """
    trials = [
        {"oxalic_volume": 10, "initial": 0.0, "final": 15.2},
        {"oxalic_volume": 10, "initial": 0.2, "final": 15.4},
        {"oxalic_volume": 10, "initial": 0.1, "final": 15.3}
    ]

    include_rough = False → excludes first trial from average
    """

    table = []
    titre_values = []

    for i, trial in enumerate(trials, start=1):
        oxalic_volume = trial["oxalic_volume"]
        initial = trial["initial"]
        final = trial["final"]

        kmno4_volume = round(final - initial, 2)

        table.append({
            "S. No.": i,
            "Volume of Oxalic Acid (mL)": oxalic_volume,
            "Initial Burette Reading (mL)": initial,
            "Final Burette Reading (mL)": final,
            "Volume of KMnO4 (mL)": kmno4_volume
        })

        if include_rough or i != 1:
            titre_values.append(kmno4_volume)

    # Calculate average
    if titre_values:
        average = round(sum(titre_values) / len(titre_values), 2)
        table.append({
            "S. No.": "",
            "Volume of Oxalic Acid (mL)": "",
            "Initial Burette Reading (mL)": "",
            "Final Burette Reading (mL)": "Average",
            "Volume of KMnO4 (mL)": average
        })

    return table

# --------------------------------------------------
# 5️⃣ Colorimetry (Beer–Lambert Law)
# A = ε * l * c
# --------------------------------------------------

def generate_lambda_max_table(trials):
    """
    trials = [
        {"wavelength": 400, "absorbance": 0.12},
        {"wavelength": 450, "absorbance": 0.35},
        {"wavelength": 500, "absorbance": 0.80}
    ]
    """

    table = []
    max_absorbance = -1
    lambda_max = None

    for i, trial in enumerate(trials, start=1):
        wavelength = trial["wavelength"]
        absorbance = trial["absorbance"]

        table.append({
            "Trial": i,
            "Wavelength (nm)": wavelength,
            "Absorbance": absorbance
        })

        # Find λmax
        if absorbance > max_absorbance:
            max_absorbance = absorbance
            lambda_max = wavelength

    return {
        "table": table,
        "lambda_max": lambda_max,
        "max_absorbance": max_absorbance
    }

def generate_concentration_absorbance_table(trials):
    """
    trials = [
        {"concentration": 0.01, "absorbance": 0.12},
        {"concentration": 0.02, "absorbance": 0.25}
    ]
    """

    table = []

    for i, trial in enumerate(trials, start=1):
        table.append({
            "Trial": i,
            "Concentration (mol/L)": trial["concentration"],
            "Absorbance": trial["absorbance"]
        })

    return table

# --------------------------------------------------
# 6️⃣ Conductance
# κ = (1 / R) * cell_constant
# --------------------------------------------------

def generate_conductance_table_concentration(trials):
    """
    trials = [
        {"concentration": 0.01, "conductance": 120, "temperature": 298},
        {"concentration": 0.02, "conductance": 110, "temperature": 298}
    ]
    """

    table = []

    for i, trial in enumerate(trials, start=1):
        table.append({
            "S. No.": i,
            "Concentration (C) (mol/L)": trial["concentration"],
            "Conductance (Λ)": trial["conductance"],
            "Temperature (T) (K)": trial["temperature"]
        })

    return table

def generate_conductance_table_volume(trials):
    """
    trials = [
        {"volume": 10, "concentration": 0.05, "conductance": 150, "temperature": 298},
        {"volume": 20, "concentration": 0.025, "conductance": 170, "temperature": 298}
    ]
    """

    table = []

    for i, trial in enumerate(trials, start=1):
        table.append({
            "S. No.": i,
            "Solution Volume (mL)": trial["volume"],
            "Concentration (C) (mol/L)": trial["concentration"],
            "Conductance (Λ)": trial["conductance"],
            "Temperature (T) (K)": trial["temperature"]
        })

    return table

# --------------------------------------------------
# 7️⃣ Electrochemistry – Daniell Cell (Observation Table)
# E_cell = E°_cathode - E°_anode - (0.0591/n) * log([anode]/[cathode])
# --------------------------------------------------

# Standard reduction potentials (V)
STANDARD_POTENTIALS = {
    "Zn": -0.76,
    "Cu": 0.34,
    "Ag": 0.80,
    "Ni": -0.26,
}

def electrochemistry_cell_table(
    anode_metal="Zn",
    cathode_metal="Cu",
    anode_concentration=1.0,
    cathode_concentrations=None,
    unknown_emf=None,
    n=2
):
    """
    Generate observation table for electrochemistry experiment.

    Parameters:
        anode_metal: Symbol of the anode metal (e.g. "Zn")
        cathode_metal: Symbol of the cathode metal (e.g. "Cu")
        anode_concentration: Fixed concentration of anode solution (M)
        cathode_concentrations: List of cathode concentrations to test (M)
        unknown_emf: EMF value (V) for the unknown concentration row
        n: Number of electrons transferred (default 2)

    Returns:
        dict with "table" (list of row dicts), "E0_cell", and "unknown_concentration"
    """

    if cathode_concentrations is None:
        cathode_concentrations = [0.01, 0.05, 0.10, 0.50, 1.00]

    E0_anode = STANDARD_POTENTIALS.get(anode_metal, -0.76)
    E0_cathode = STANDARD_POTENTIALS.get(cathode_metal, 0.34)
    E0_cell = round(E0_cathode - E0_anode, 3)

    table = []

    for i, c_conc in enumerate(cathode_concentrations, start=1):
        ratio = anode_concentration / c_conc
        log_ratio = math.log10(ratio)
        emf = E0_cell - (0.0591 / n) * log_ratio
        emf = round(max(0, emf), 4)

        table.append({
            "S. No.": i,
            "Anode Concentration (M)": anode_concentration,
            "Cathode Concentration (M)": c_conc,
            "log([Anode]/[Cathode])": round(log_ratio, 4),
            "EMF (V)": emf,
            "Remark": ""
        })

    # Calculate unknown concentration from given EMF
    unknown_concentration = None
    if unknown_emf is not None:
        # E = E0_cell - (0.0591/n) * log(anode/cathode)
        # log(anode/cathode) = (E0_cell - E) * n / 0.0591
        log_val = (E0_cell - unknown_emf) * n / 0.0591
        ratio_val = 10 ** log_val
        if ratio_val != 0:
            unknown_concentration = round(anode_concentration / ratio_val, 4)

        table.append({
            "S. No.": len(cathode_concentrations) + 1,
            "Anode Concentration (M)": anode_concentration,
            "Cathode Concentration (M)": unknown_concentration if unknown_concentration else "?",
            "log([Anode]/[Cathode])": round(log_val, 4) if unknown_concentration else "?",
            "EMF (V)": unknown_emf,
            "Remark": "Unknown (Calculated)"
        })

    return {
        "table": table,
        "E0_cell": E0_cell,
        "unknown_concentration": unknown_concentration
    }


if __name__ == "__main__":
    # Test 1: pH Titration
    print("\n" + "="*60)
    print("1️⃣  pH TITRATION TEST")
    print("="*60)
    ph_result = generate_ph_titration_table([
        {"volume": 0, "pH": 2.1},
        {"volume": 2, "pH": 2.3},
        {"volume": 4, "pH": 2.6},
        {"volume": 6, "pH": 3.2},
        {"volume": 8, "pH": 5.8}
    ])
    for row in ph_result:
        print(row)

    # Test 2: Acid-Base Titration
    print("\n" + "="*60)
    print("2️⃣  ACID-BASE TITRATION (Phenolphthalein) TEST")
    print("="*60)
    ab_result = generate_acid_base_titration_table([
        {"V1": 10, "initial": 0.0, "final": 18.5},
        {"V1": 10, "initial": 0.2, "final": 18.7},
        {"V1": 10, "initial": 0.1, "final": 18.6}
    ], include_rough=False)
    for row in ab_result:
        print(row)

    # Test 3: Hardness V1
    print("\n" + "="*60)
    print("3️⃣  HARDNESS - EDTA METHOD (Part 1/V1) TEST")
    print("="*60)
    hardness_v1_result = generate_hardness_table_v1([
        {"sample_volume": 50, "initial": 0.0, "final": 12.5},
        {"sample_volume": 50, "initial": 0.2, "final": 12.7}
    ])
    for row in hardness_v1_result:
        print(row)

    # Test 3b: Hardness V2
    print("\n" + "="*60)
    print("3️⃣  HARDNESS - EDTA METHOD (Part 2/V2) TEST")
    print("="*60)
    hardness_v2_result = generate_hardness_table_v2([
        {"sample_volume": 50, "initial": 0.1, "final": 15.3},
        {"sample_volume": 50, "initial": 0.0, "final": 15.1}
    ])
    for row in hardness_v2_result:
        print(row)

    # Test 4: Redox Titration
    print("\n" + "="*60)
    print("4️⃣  REDOX TITRATION (KMnO4 + Oxalic Acid) TEST")
    print("="*60)
    redox_result = generate_redox_kmno4_table([
        {"oxalic_volume": 10, "initial": 0.0, "final": 15.2},
        {"oxalic_volume": 10, "initial": 0.2, "final": 15.4},
        {"oxalic_volume": 10, "initial": 0.1, "final": 15.3}
    ], include_rough=False)
    for row in redox_result:
        print(row)

    # Test 5a: Colorimetry - Lambda Max
    print("\n" + "="*60)
    print("5️⃣  COLORIMETRY - LAMBDA MAX TEST")
    print("="*60)
    lambda_result = generate_lambda_max_table([
        {"wavelength": 400, "absorbance": 0.12},
        {"wavelength": 450, "absorbance": 0.35},
        {"wavelength": 500, "absorbance": 0.80},
        {"wavelength": 550, "absorbance": 0.45}
    ])
    print(f"Table: {lambda_result['table']}")
    print(f"λ_max = {lambda_result['lambda_max']} nm")
    print(f"Max Absorbance = {lambda_result['max_absorbance']}")

    # Test 5b: Colorimetry - Concentration vs Absorbance
    print("\n" + "="*60)
    print("5️⃣  COLORIMETRY - CONCENTRATION vs ABSORBANCE TEST")
    print("="*60)
    conc_abs_result = generate_concentration_absorbance_table([
        {"concentration": 0.01, "absorbance": 0.12},
        {"concentration": 0.02, "absorbance": 0.25},
        {"concentration": 0.03, "absorbance": 0.38},
        {"concentration": 0.04, "absorbance": 0.50}
    ])
    for row in conc_abs_result:
        print(row)

    # Test 6a: Conductance - Concentration
    print("\n" + "="*60)
    print("6️⃣  CONDUCTANCE - CONCENTRATION TEST")
    print("="*60)
    cond_conc_result = generate_conductance_table_concentration([
        {"concentration": 0.01, "conductance": 120, "temperature": 298},
        {"concentration": 0.02, "conductance": 110, "temperature": 298},
        {"concentration": 0.03, "conductance": 95, "temperature": 298}
    ])
    for row in cond_conc_result:
        print(row)

    # Test 6b: Conductance - Volume
    print("\n" + "="*60)
    print("6️⃣  CONDUCTANCE - SOLUTION VOLUME TEST")
    print("="*60)
    cond_vol_result = generate_conductance_table_volume([
        {"volume": 10, "concentration": 0.05, "conductance": 150, "temperature": 298},
        {"volume": 20, "concentration": 0.025, "conductance": 170, "temperature": 298},
        {"volume": 30, "concentration": 0.0167, "conductance": 185, "temperature": 298}
    ])
    for row in cond_vol_result:
        print(row)

    # Test 7: Electrochemistry Cell Table
    print("\n" + "="*60)
    print("7️⃣  ELECTROCHEMISTRY - OBSERVATION TABLE TEST")
    print("="*60)
    echem_result = electrochemistry_cell_table(
        anode_metal="Zn",
        cathode_metal="Cu",
        anode_concentration=1.0,
        cathode_concentrations=[0.01, 0.05, 0.10, 0.50, 1.00],
        unknown_emf=1.05
    )
    print(f"E°_cell = {echem_result['E0_cell']} V")
    print(f"Unknown Concentration = {echem_result['unknown_concentration']} M")
    for row in echem_result["table"]:
        print(row)

    print("\n" + "="*60)
    print("✅ ALL TESTS COMPLETED SUCCESSFULLY!")
    print("="*60)


