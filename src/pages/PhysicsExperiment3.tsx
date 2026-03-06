import ExperimentLayout from "@/components/experiment/ExperimentLayout";

import PhysicsThermoTheory from "@/components/experiment/physicsthermotheory";
import PhysicsThermoProcedure from "@/components/experiment/physicsthermoprocedure";
import PhysicsThermoSimulator from "@/components/experiment/physicsthermosimulator";

import ObservationsSection from "@/components/experiment/ObservationsSection";
import QuizSections from "@/components/experiment/QuizSection";

const PhysicsExperiment3 = () => {
  return (
   <ExperimentLayout
  title="Gas Laws & Carnot Engine"
  subjectLabel="Experiment 3 • Thermodynamics"
  subjectPath="/subjects/physics"
  theory={<PhysicsThermoTheory />}
  procedure={<PhysicsThermoProcedure />}
  simulator={<PhysicsThermoSimulator />}
  observations={<ObservationsSection />}
  quiz={<QuizSections />}
/>
  );
};

export default PhysicsExperiment3;