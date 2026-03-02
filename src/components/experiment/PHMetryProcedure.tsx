import ProcedureCard from "./ProcedureCard";

const PHMetryProcedure = () => {
  const steps = [
    {
      title: "Prepare the Burette",
      content:
        "Clean and rinse a 25 mL burette with standard 0.1 M NaOH solution. Fill it with NaOH and remove any air bubbles from the tip. Note the initial burette reading.",
    },
    {
      title: "Prepare the Analyte Solution",
      content:
        "Pipette exactly 10 mL of the given dilute HCl solution into a clean 250 mL beaker. Add 90 mL of deionised water to dilute it for better electrode response.",
    },
    {
      title: "Set Up the pH Meter",
      content:
        "Calibrate the pH meter using pH 4 and pH 7 buffer solutions. Rinse the electrode with deionised water, then immerse it in the beaker solution. Record the initial pH.",
    },
    {
      title: "Begin Titration",
      content:
        "Add NaOH from the burette in 1.0 mL increments up to 15 mL total. After each addition, stir gently and wait for the pH reading to stabilise. Record the volume added and the corresponding pH.",
    },
    {
      title: "Identify the End Point",
      content:
        "Note the volume at which the pH shows a sharp jump (inflection point near pH 7). Add NaOH in smaller increments (0.5 mL or less) in this region for greater accuracy.",
    },
    {
      title: "Plot the pH Curve",
      content:
        "Plot volume of NaOH (x-axis) vs pH (y-axis). Draw a smooth S-shaped curve. Also plot ΔpH/ΔV vs volume — the peak of this derivative curve gives the exact equivalence point.",
    },
    {
      title: "Calculate Molarity",
      content:
        "Read the end point volume (V₂) from the graph. Use M₁V₁ = M₂V₂ to calculate the molarity of HCl. Multiply by equivalent weight of HCl (36.45 g/mol) to find the amount in g/L.",
    },
  ];

  return <ProcedureCard steps={steps} />;
};

export default PHMetryProcedure;
