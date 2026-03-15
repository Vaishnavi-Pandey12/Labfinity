import ExperimentLayout from "@/components/experiment/ExperimentLayout";
import ObservationsSection from "@/components/experiment/ObservationsSection";
import QuizSection from "@/components/experiment/QuizSection";
import PhotoelectricTheory from "@/components/experiment/PhotoelectricTheory";
import PhotoelectricProcedure from "@/components/experiment/PhotoelectricProcedure";
import PhotoelectricSimulator from "@/components/experiment/PhotoelectricSimulator";

const PhysicsExperiment11 = () => {
  return (
    <ExperimentLayout
      subjectLabel="Experiment 11 • Physics"
      title="Determination of Planck's Constant by Photoelectric Effect"
      subjectPath="/subjects/physics"
      theory={<PhotoelectricTheory />}
      procedure={<PhotoelectricProcedure />}
      simulator={<PhotoelectricSimulator />}
      observations={<ObservationsSection />}
      quiz={<QuizSection />}
    />
  );
};

export default PhysicsExperiment11;
