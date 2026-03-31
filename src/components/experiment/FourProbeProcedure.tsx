import ProcedureCard from "./ProcedureCard";

const FourProbeProcedure = () => {
  const steps = [
    {
      title: "Set Up the Four-Probe Arrangement",
      content:
        "Place the semiconductor sample on the base plate. Unscrew the pipe holding the four probes, apply gentle pressure on the probes against the sample, and tighten. Check continuity between probes for proper electrical contact.",
    },
    {
      title: "Connect the Circuit",
      content:
        "Connect the outer pair of probes (yellow/green leads) to the constant current power supply. Connect the inner pair (red/black leads) to the voltage terminals of the digital panel meter.",
    },
    {
      title: "Place in Oven",
      content:
        "Place the four-probe arrangement inside the oven. Fix the thermometer through the hole provided in the oven lid.",
    },
    {
      title: "Set Current and Initial Reading",
      content:
        "Switch on the AC mains. Set the digital panel meter to current mode and adjust the current to 5 mA. Switch to voltage mode to read the initial voltage at room temperature.",
    },
    {
      title: "Heat and Record Readings",
      content:
        "Switch on the oven power. At every rise of 5°C, note down the temperature (°C and K), the voltage reading (mV), and calculate R = V/I. Continue until the temperature reaches ~100°C.",
    },
    {
      title: "Plot Graph and Calculate Band Gap",
      content:
        "Calculate ln R and 1/T (K⁻¹) for each reading. Plot ln R on the Y-axis vs 1/T on the X-axis. Determine the slope of the straight line and calculate Eg = 2 × k × slope (k = 8.617 × 10⁻⁵ eV/K).",
    },
  ];

  return <ProcedureCard steps={steps} />;
};

export default FourProbeProcedure;
