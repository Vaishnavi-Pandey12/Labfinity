import ExperimentLayout from "@/components/experiment/ExperimentLayout";

import RefractionTheory from "@/components/experiment/OpticsRefractionTheory";
import RefractionSimulator from "@/components/experiment/OpticsRefractionSimulator";
import OpticsRefractionProcedure from "@/components/experiment/OpticsRefractionProcedure";

import ObservationsSection from "@/components/experiment/ObservationsSection";
import QuizSections from "@/components/experiment/QuizSection";

const PhysicsExperiment2 = () => {
  return (
    <ExperimentLayout
  title="Refraction of Light (Snell's Law)"
  subjectLabel="Experiment 2 • Optics"
  subjectPath="/subjects/physics"
  theory={<RefractionTheory />}
  procedure={<OpticsRefractionProcedure />}
  simulator={<RefractionSimulator />}
  observations={<ObservationsSection />}
  quiz={<QuizSections />}
/>
  );
};

export default PhysicsExperiment2;