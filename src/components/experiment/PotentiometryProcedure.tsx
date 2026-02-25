import ProcedureCard from "./ProcedureCard";

const PotentiometryProcedure = () => {
    const steps = [
        {
        title: "Calibration of pH Electrode",
        content: " Calibrate the glass electrode using standard buffer solutions (pH 4.0, 7.0, and 10.0). Rinse the electrode with distilled water between measurements. Allow the reading to stabilize after each buffer immersion."
        },
        {
            title: "Setting Up the Titration Apparatus",
            content: "Place a known volume of analyte solution (e.g., 20 mL of HCl) in a clean beaker. Insert the glass electrode and reference electrode into the solution. Position a magnetic stir bar in the beaker and activate the stirrer at moderate speed to ensure thorough mixing. ",
        },
        {
            title: "Initial pH Reading",
            content: "Record the initial pH of the analyte solution. This is the starting point for the titration curve. Note the exact volume of titrant in the burette at the start."
        },
        {
            title: "Adding Titrant in Increments",
            content: "Add titrant (e.g., NaOH solution) in small increments (1-2 mL) from the burette. After each addition, allow the solution to equilibrate for a few seconds and then record the pH reading. Continue adding titrant until pH passes the equivalence point. Near the equivalence point, use smaller increments (0.5 mL)."
        },
        {
            title: "Data Collection and Analysis",
            content: "Record the volume of titrant added and corresponding pH for each point. Create a titration curve by plotting pH vs. volume of titrant. The equivalence point is located at the inflection point (maximum slope) of the curve. Calculate the first derivative (ΔpH/ΔV) to find the exact equivalence point."
        },
    ];
    return <ProcedureCard steps={steps} />;
}

export default PotentiometryProcedure;