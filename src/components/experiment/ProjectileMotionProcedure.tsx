import ProcedureCard from "./ProcedureCard";

const ProjectileMotionProcedure = () => {
  const steps = [
    {
      title: "Set Initial Conditions",
      content:
        "Enter initial velocity and angle of projection.",
    },
    {
      title: "Launch Projectile",
      content:
        "Start simulation and observe trajectory.",
    },
    {
      title: "Record Observations",
      content:
        "Measure maximum height, time of flight, and horizontal range.",
    },
    {
      title: "Repeat with Variations",
      content:
        "Change angle or velocity and compare results.",
    },
    {
      title: "Graphical Analysis",
      content:
        "Plot trajectory and verify projectile motion equations.",
    },
  ];

  return <ProcedureCard steps={steps} />;
};

export default ProjectileMotionProcedure;