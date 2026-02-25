import ProcedureCard from "./ProcedureCard";

const ColorimetryProcedure = () => {
  const steps = [
    {
      title: "Prepare Standard Solutions",
      content:
        "Prepare different known concentrations of metal ion solution.",
    },
    {
      title: "Select Wavelength",
      content:
        "Select appropriate wavelength for maximum absorbance.",
    },
    {
      title: "Measure Absorbance",
      content:
        "Place cuvette in spectrophotometer and record absorbance.",
    },
    {
      title: "Create Calibration Curve",
      content:
        "Plot absorbance vs concentration graph.",
    },
    {
      title: "Determine Unknown",
      content:
        "Use calibration graph to determine unknown concentration.",
    },
  ];

  return <ProcedureCard steps={steps} />;
};

export default ColorimetryProcedure;