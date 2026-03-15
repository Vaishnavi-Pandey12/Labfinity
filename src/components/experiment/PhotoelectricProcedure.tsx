import ProcedureCard from "./ProcedureCard";

const PhotoelectricProcedure = () => {
  const steps = [
    {
      title: "Insert the Color Filter",
      content:
        "Select and insert a color filter (e.g., Red – 635 nm) into the drawtube of the Planck's constant measuring set-up.",
    },
    {
      title: "Zero the Instrument",
      content:
        "Switch off the light intensity. Adjust the voltage and current controls to zero. Set the current range selector to ×0.001 position.",
    },
    {
      title: "Set Up for Measurement",
      content:
        "Set the light intensity switch to Strong Light, voltage direction switch to negative (−) side, and display mode switch to current display.",
    },
    {
      title: "Determine Stopping Potential",
      content:
        "Gradually increase the decelerating voltage until the photocurrent drops to zero. Record this voltage as the stopping potential (Vs) for the selected filter.",
    },
    {
      title: "Repeat for All Filters",
      content:
        "Repeat the procedure for Yellow I (570 nm), Yellow II (540 nm), Green (500 nm), and Blue (460 nm) filters. Record Vs for each.",
    },
    {
      title: "Calculate Frequency and Plot Graph",
      content:
        "Calculate the frequency ν = c/λ for each filter. Plot a graph of stopping potential (Vs) on the Y-axis versus frequency (ν) on the X-axis and determine the slope (ΔVs/Δν) to find Planck's constant h = e × slope.",
    },
  ];

  return <ProcedureCard steps={steps} />;
};

export default PhotoelectricProcedure;
