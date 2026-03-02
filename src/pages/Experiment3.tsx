import ExperimentLayout from "@/components/experiment/ExperimentLayout";
import ObservationsSection from "@/components/experiment/ObservationsSection";
import PotentiometryProcedure from "@/components/experiment/PotentiometryProcedure";
import PotentiometrySimulator from "@/components/experiment/PotentiometrySimulator";
import PotentiometryTheory from "@/components/experiment/PotentiometryTheory";
import QuizSection from "@/components/experiment/QuizSection";

const Experiment3 = () => {
  return (
    <ExperimentLayout
      subjectLabel="Experiment 3 • Potentiometry"
      title="Potentiometric Titration"
      theory={<PotentiometryTheory />}
      procedure={<PotentiometryProcedure />}
      simulator={<PotentiometrySimulator />}
      observations={<ObservationsSection />}
      quiz={<QuizSection />}
    />
  );
};

export default Experiment3;
