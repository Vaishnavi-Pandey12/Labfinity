import ColorimetryProcedure from "@/components/experiment/ColorimetryProcedure";
import ColorimetrySimulator from "@/components/experiment/ColorimetrySimulator";
import ExperimentLayout from "@/components/experiment/ExperimentLayout";
import ObservationsSection from "@/components/experiment/ObservationsSection";
import QuizSection from "@/components/experiment/QuizSection";
import TheorySection from "@/components/experiment/TheorySection";

const Experiment2 = () => {
  return (
    <ExperimentLayout
      subjectLabel="Experiment 2 • Colorimetry"
      title="Beer-Lambert Law Verification"
      theory={<TheorySection />}
      procedure={<ColorimetryProcedure />}
      simulator={<ColorimetrySimulator />}
      observations={<ObservationsSection />}
      quiz={<QuizSection experimentId={5} />}
    />
  );
};

export default Experiment2;
