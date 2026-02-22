import ProcedureCard from "./ProcedureCard";

const ElectrochemistryProcedure = () => {
  const steps = [
    {
      title: "Setting Up the Half-Cells",
      content:
        "Take two clean beakers. Pour ZnSO₄ in one and CuSO₄ in the other. Immerse zinc and copper electrodes respectively.",
    },
    {
      title: "Connecting the Salt Bridge",
      content:
        "Connect the two half-cells using a salt bridge filled with KCl or KNO₃ solution.",
    },
    {
      title: "Measuring EMF",
      content:
        "Connect electrodes to voltmeter. Zinc to negative terminal and copper to positive terminal.",
    },
    {
      title: "Varying Concentration",
      content:
        "Change concentration and measure EMF. Record observations to verify Nernst equation.",
    },
    {
      title: "Data Analysis",
      content:
        "Plot EMF vs log([Zn²⁺]/[Cu²⁺]). Compare slope with theoretical value.",
    },
  ];

  return <ProcedureCard steps={steps} />;
};

export default ElectrochemistryProcedure;
