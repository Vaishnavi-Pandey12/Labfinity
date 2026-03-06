import ExperimentLayout from "@/components/experiment/ExperimentLayout";

import ProjectileMotionSimulator from "@/components/experiment/ProjectileMotionSimulator";
import ProjectileMotionTheory from "@/components/experiment/ProjectileMotionTheory";
import ProjectileMotionProcedure from "@/components/experiment/ProjectileMotionProcedure";

import ObservationsSection from "@/components/experiment/ObservationsSection";
import QuizSections from "@/components/experiment/QuizSection";

const PhysicsExperiment1 = () => {
  return (
    <ExperimentLayout
  title="Verification of Projectile Motion Equations"
  subjectLabel="Experiment 1 • Projectile Motion"
  subjectPath="/subjects/physics"
  theory={<ProjectileMotionTheory />}
  procedure={<ProjectileMotionProcedure />}
  simulator={<ProjectileMotionSimulator />}
  observations={<ObservationsSection />}
  quiz={<QuizSections />}
/>
  );
};

export default PhysicsExperiment1;