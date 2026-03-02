import ExperimentLayout from "@/components/experiment/ExperimentLayout";
import ObservationsSection from "@/components/experiment/ObservationsSection";
import QuizSection from "@/components/experiment/QuizSection";
import HardnessTheory from "@/components/experiment/HardnessTheory";
import HardnessProcedure from "@/components/experiment/HardnessProcedure";
import HardnessSimulator from "@/components/experiment/HardnessSimulator";

const Experiment7 = () => {
  return (
    <ExperimentLayout
      subjectLabel="Experiment 7 • Water Hardness"
      title="Estimation of Hardness of Water — EDTA Method & Ion Exchange"
      theory={<HardnessTheory />}
      procedure={<HardnessProcedure />}
      simulator={<HardnessSimulator />}
      observations={<ObservationsSection />}
      quiz={<QuizSection />}
    />
  );
};

export default Experiment7;
