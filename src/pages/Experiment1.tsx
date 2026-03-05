import ElectrochemistryProcedure from "@/components/experiment/ElectrochemistryProcedure";
import ExperimentLayout from "@/components/experiment/ExperimentLayout";
import ObservationsSection from "@/components/experiment/ObservationsSection";
import QuizSection from "@/components/experiment/QuizSection";
import ElectrochemistrySimulator from "@/components/experiment/ElectrochemistrySimulator";
import ElectrochemistryTheory from "@/components/experiment/ElectrochemistryTheory";

const Experiment1 = () => {
  return (
    <ExperimentLayout
      subjectLabel="Experiment 1 • Electrochemistry"
      title="EMF Measurement - Daniell Cell"
      theory={<ElectrochemistryTheory />}
      procedure={<ElectrochemistryProcedure />}
      simulator={<ElectrochemistrySimulator />}
      observations={<ObservationsSection />}
      quiz={<QuizSection experimentId={7} />}
    />
  );
};

export default Experiment1;
