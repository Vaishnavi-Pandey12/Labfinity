import ProcedureCard from "./ProcedureCard";

const ElectrochemistryProcedure = () => {
  const steps = [
    {
      title: "Prepare the Electrodes and Solutions",
      content:
        "Clean the zinc and copper electrodes with sandpaper to remove oxide. Pour ZnSO₄ solution into one beaker and CuSO₄ solution into the other.",
    },
    {
      title: "Assemble the Half-Cells",
      content:
        "Place the zinc electrode into the ZnSO₄ beaker and the copper electrode into the CuSO₄ beaker. Keep the two beakers close enough to connect them with the salt bridge.",
    },
    {
      title: "Connect the Salt Bridge",
      content:
        "Insert the salt bridge soaked in KCl or KNO₃ solution between the two beakers. Ensure the bridge connects both solutions without mixing them directly.",
    },
    {
      title: "Attach the Voltmeter",
      content:
        "Connect the zinc electrode to the negative terminal of the voltmeter and the copper electrode to the positive terminal. Allow the reading to stabilize before recording.",
    },
    {
      title: "Record Observation Table Values",
      content:
        "For each trial, enter the measured concentrations, calculate log([Zn²⁺]/[Cu²⁺]), and record the observed EMF from the voltmeter.",
    },
    {
      title: "Analyze the Results",
      content:
        "Compare the recorded EMF values against the Nernst equation. Plot EMF versus log([Zn²⁺]/[Cu²⁺]) to verify the expected trend.",
    },
  ];

  return <ProcedureCard steps={steps} />;
};

export default ElectrochemistryProcedure;
