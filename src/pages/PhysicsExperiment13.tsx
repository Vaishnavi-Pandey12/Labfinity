import ExperimentLayout from "@/components/experiment/ExperimentLayout";
import ObservationsSection from "@/components/experiment/ObservationsSection";
import QuizSection from "@/components/experiment/QuizSection";
import HeisenbergTheory from "@/components/experiment/HeisenbergTheory";
import HeisenbergProcedure from "@/components/experiment/HeisenbergProcedure";
import HeisenbergSimulator from "@/components/experiment/HeisenbergSimulator";

const PhysicsExperiment13 = () => {
  return (
    <ExperimentLayout
      subjectLabel="Experiment 13 • Physics"
      title="Verification of Heisenberg's Uncertainty Principle"
      subjectPath="/subjects/physics"
      theory={<HeisenbergTheory />}
      procedure={<HeisenbergProcedure />}
      simulator={<HeisenbergSimulator />}
      observations={<ObservationsSection />}
      quiz={<QuizSection />}
    />
  );
};

export default PhysicsExperiment13;
