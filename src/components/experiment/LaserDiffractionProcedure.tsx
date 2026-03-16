import ProcedureCard from "./ProcedureCard";

const LaserDiffractionProcedure = () => {
  const steps = [
    {
      title: "Set Up the Optical Bench",
      content:
        "Switch on the laser source. Place the diffraction grating on a stand at a known distance from the laser. Fix a screen with mm graph paper at a suitable distance D from the grating.",
    },
    {
      title: "Align the Laser Beam",
      content:
        "Adjust the grating position so the laser beam passes through it and diffracts to produce bright spots on the graph paper. Ensure the beam is perpendicular to the grating surface.",
    },
    {
      title: "Mark the Diffraction Spots",
      content:
        "Mark the positions of the bright spots on the graph paper using a soft pencil. Identify the zeroth order (central maximum) and the first, second, and third order maxima on both sides.",
    },
    {
      title: "Measure y and D",
      content:
        "Measure the distance y from the zeroth order spot to each nth order spot. Also measure D, the distance between the grating and the screen.",
    },
    {
      title: "Calculate the Diffraction Angle",
      content:
        "Calculate θ = tan⁻¹(y / D) for each order of diffraction. Record all values in the observation table.",
    },
    {
      title: "Calculate the Wavelength",
      content:
        "Calculate the grating spacing d = 1 / (number of lines per cm). Use the formula λ = d sinθ / n to find the wavelength for each order and take the mean value.",
    },
  ];

  return <ProcedureCard steps={steps} />;
};

export default LaserDiffractionProcedure;
