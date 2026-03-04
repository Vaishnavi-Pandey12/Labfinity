import ProcedureCard from "./ProcedureCard";

const AcidBaseTitrationProcedure = () => {
  const steps = [
    {
      title: "Rinse All Glassware",
      content:
        "Rinse the burette (2–3 times) with the standard NaOH solution, the pipette with the given HCl solution, and the conical flask with deionised water. This prevents contamination and dilution errors.",
    },
    {
      title: "Fill the Burette with NaOH",
      content:
        "Fill the burette with 0.1 M NaOH solution beyond the zero mark. Open the stopcock briefly to expel any air bubble from the tip, then adjust to exactly 0.00 mL. Note the initial burette reading.",
    },
    {
      title: "Pipette Out HCl into Conical Flask",
      content:
        "Using a 10 mL pipette, transfer exactly 10 mL of the given dilute HCl solution into a clean 250 mL conical flask. Place the flask on a white tile to help observe the colour change clearly.",
    },
    {
      title: "Add Phenolphthalein Indicator",
      content:
        "Add 1–2 drops of phenolphthalein indicator to the HCl solution in the conical flask. The solution will remain colourless at this stage since it is acidic.",
    },
    {
      title: "Titrate with NaOH",
      content:
        "Start adding NaOH from the burette while swirling the conical flask continuously. Initially add NaOH in 1 mL portions, then reduce to drop-by-drop addition as the pink colour starts to appear and disappear slowly.",
    },
    {
      title: "Identify the End Point",
      content:
        "The end point is reached when a faint, permanent pale-pink colour appears throughout the solution and persists for at least 30 seconds without fading. Stop immediately at this point and note the final burette reading.",
    },
    {
      title: "Record and Repeat",
      content:
        "Calculate the volume of NaOH used (final − initial reading). Repeat the titration at least two more times to obtain three concordant readings — values that agree within 0.1 mL of each other.",
    },
    {
      title: "Calculate Molarity of HCl",
      content:
        "Take the average of the concordant NaOH volumes (V₂). Apply M₁V₁ = M₂V₂: M(HCl) = [0.1 × V₂] / 10. Multiply the molarity by 36.45 g/mol to find the amount of HCl in grams per litre.",
    },
  ];

  return <ProcedureCard steps={steps} />;
};

export default AcidBaseTitrationProcedure;
