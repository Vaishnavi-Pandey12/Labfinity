import ProcedureCard from "./ProcedureCard";

const physicsthermoprocedure = () => {
  const steps = [
    {
      title: "Boyle’s Law Verification",
      content:
        "Adjust the piston volume while keeping temperature constant. Record pressure values and verify that PV remains constant.",
    },
    {
      title: "Charles’ Law Verification",
      content:
        "Keep pressure constant and vary temperature. Observe the change in volume and verify V/T remains constant.",
    },
    {
      title: "Carnot Engine Analysis",
      content:
        "Set hot and cold reservoir temperatures. Calculate efficiency using η = 1 − (Tc / Th) and verify theoretical behavior.",
    },
    {
      title: "Graphical Analysis",
      content:
        "Plot the observed values on the graph and verify linear or inverse relationships as applicable.",
    },
  ];

  return <ProcedureCard steps={steps} />;
};

export default physicsthermoprocedure;