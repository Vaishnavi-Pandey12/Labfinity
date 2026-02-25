import ProcedureCard from "./ProcedureCard";

const PotentiometryProcedure = () => {
  const steps = [
    {
      title: "Setup of Titration Cell",
      content:
        "Take a clean beaker containing the analyte solution (e.g., 0.1 M HCl). Insert the indicator electrode (glass/pH electrode) and reference electrode (Ag/AgCl).",
    },
    {
      title: "Preparation of Burette",
      content:
        "Fill the burette with titrant solution (e.g., 0.1 M NaOH). Ensure no air bubbles are present and initial reading is noted.",
    },
    {
      title: "Stepwise Addition",
      content:
        "Add titrant in small increments (0.5 mL). After each addition, record the potential (mV) or pH value.",
    },
    {
      title: "Equivalence Point Detection",
      content:
        "Continue titration until a sharp change in potential/pH is observed indicating equivalence point.",
    },
    {
      title: "Graph Plotting",
      content:
        "Plot Potential (or pH) vs Volume of titrant. Determine equivalence point from graph.",
    },
  ];

  return <ProcedureCard steps={steps} />;
};

export default PotentiometryProcedure;