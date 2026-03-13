import ExperimentLayout from "@/components/experiment/ExperimentLayout";
import ObservationsSection from "@/components/experiment/ObservationsSection";
import QuizSection from "@/components/experiment/QuizSection";
import AcidBaseTitrationTheory from "@/components/experiment/AcidBaseTitrationTheory";
import AcidBaseTitrationProcedure from "@/components/experiment/AcidBaseTitrationProcedure";
import AcidBaseTitrationSimulator from "@/components/experiment/AcidBaseTitrationSimulator";

const Experiment6 = () => {
  return (
    <ExperimentLayout
      subjectLabel="Experiment 6 • Acid-Base Titration"
      title="Determination of Molarity of HCl by Acid-Base Titration"
      theory={<AcidBaseTitrationTheory />}
      procedure={<AcidBaseTitrationProcedure />}
      simulator={<AcidBaseTitrationSimulator />}
      observations={<ObservationsSection />}
      quiz={<QuizSection experimentId={2} />}
    />
  );
};

export default Experiment6;
