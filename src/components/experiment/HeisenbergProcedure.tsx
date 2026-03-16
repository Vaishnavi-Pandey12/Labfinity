import ProcedureCard from "./ProcedureCard";

const HeisenbergProcedure = () => {
  const steps = [
    {
      title: "Set Up the Optical Rail",
      content:
        "Fix the kinematic laser mount on the rail and insert the diode laser module. Fix the detector mount with translation stage on the other end. Mount the pinhole photodetector and connect it to the output measurement unit.",
    },
    {
      title: "Align the Laser Beam",
      content:
        "Switch on the laser power supply and output measurement unit. Adjust the laser beam using the kinematic knobs so it falls exactly at the center of the pinhole detector, giving maximum output reading.",
    },
    {
      title: "Insert the Single Slit",
      content:
        "Insert the cell mount between the laser and detector. Fix it on the rail and insert the single slit cell, aligning the laser beam to fall directly on the slit and the diffracted beam on the detector.",
    },
    {
      title: "Scan the Diffraction Pattern",
      content:
        "Use the micrometer on the x-translation stage to scan the full pattern from the left extreme to the right. Note the micrometer reading and corresponding output current at regular intervals.",
    },
    {
      title: "Identify Minima and Record Readings",
      content:
        "From the output vs micrometer graph, identify the central maximum and the positions of the first-order minima on both sides. Record the distance 'a' from the central maximum to the first minimum, and the distance D from slit to screen.",
    },
    {
      title: "Calculate Slit Width and Verify Uncertainty Principle",
      content:
        "Calculate θ₁ = tan⁻¹(a/D) and slit width d = nλ/sinθ₁ (λ = 655 nm). Then calculate Δpᵧ = (h/λ) sin(θ₁) and verify that Δy · Δpᵧ ≈ h. Repeat with different slit widths.",
    },
  ];

  return <ProcedureCard steps={steps} />;
};

export default HeisenbergProcedure;
