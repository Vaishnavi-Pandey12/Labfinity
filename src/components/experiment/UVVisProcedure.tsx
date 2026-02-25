import ProcedureCard from "./ProcedureCard";

const UVVisProcedure = () => {
  const steps = [
    {
      title: "Selection of Solution",
      content:
        "Select a colored solution (e.g., KMnO4, CuSO4, Crystal Violet) from dropdown.",
    },
    {
      title: "Determine λmax",
      content:
        "Keep concentration constant. Vary wavelength from 400–700 nm. Observe absorbance and identify wavelength of maximum absorbance.",
    },
    {
      title: "Fix the Wavelength",
      content:
        "Fix the wavelength at λmax. Lock wavelength control for further measurements.",
    },
    {
      title: "Vary Concentration",
      content:
        "Change concentration values stepwise. Record absorbance for each concentration.",
    },
    {
      title: "Plot Calibration Curve",
      content:
        "Plot Absorbance vs Concentration. Verify Beer–Lambert law (A = εlc).",
    },
  ];

  return <ProcedureCard steps={steps} />;
};

export default UVVisProcedure;