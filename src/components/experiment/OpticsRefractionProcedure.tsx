import ProcedureCard from "./ProcedureCard";

const OpticsRefractionProcedure = () => {
  const steps = [
    {
      title: "Set Up Apparatus",
      content:
        "Place glass slab or prism on table and align incident ray.",
    },
    {
      title: "Measure Angles",
      content:
        "Measure angle of incidence and angle of refraction.",
    },
    {
      title: "Apply Snell's Law",
      content:
        "Calculate refractive index using n = sin(i)/sin(r).",
    },
    {
      title: "Repeat for Multiple Angles",
      content:
        "Repeat experiment for different angles of incidence.",
    },
    {
      title: "Verification",
      content:
        "Verify Snell's law by plotting sin(i) vs sin(r).",
    },
  ];

  return <ProcedureCard steps={steps} />;
};

export default OpticsRefractionProcedure;