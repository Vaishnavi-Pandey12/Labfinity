import ExperimentLayout from "@/components/experiment/ExperimentLayout";
import ObservationsSection from "@/components/experiment/ObservationsSection";
import QuizSection from "@/components/experiment/QuizSection";
import PHMetryTheory from "@/components/experiment/PHMetryTheory";
import PHMetryProcedure from "@/components/experiment/PHMetryProcedure";
import PHMetrySimulator from "@/components/experiment/PHMetrySimulator";

const Experiment5 = () => {
  return (
    <ExperimentLayout
      subjectLabel="Experiment 5 • pH-Metry"
      title="Determination of Molarity of HCl by pH-Metry"
      theory={<PHMetryTheory />}
      procedure={<PHMetryProcedure />}
      simulator={<PHMetrySimulator />}
      observations={<ObservationsSection />}
      quiz={<QuizSection experimentId={1} />}
    />
  );
};

export default Experiment5;
