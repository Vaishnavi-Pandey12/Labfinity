import ExperimentLayout from "@/components/experiment/ExperimentLayout";
import ObservationsSection from "@/components/experiment/ObservationsSection";
import QuizSection from "@/components/experiment/QuizSection";
import LEDTheory from "@/components/experiment/LEDTheory";
import LEDProcedure from "@/components/experiment/LEDProcedure";
import LEDSimulator from "@/components/experiment/LEDSimulator";

const PhysicsExperiment15 = () => {
  return (
    <ExperimentLayout
      subjectLabel="Experiment 15 • Physics"
      title="PN Junction LED Characteristics"
      subjectPath="/subjects/physics"
      theory={<LEDTheory />}
      procedure={<LEDProcedure />}
      simulator={<LEDSimulator />}
      observations={<ObservationsSection />}
      quiz={<QuizSection />}
    />
  );
};

export default PhysicsExperiment15;
