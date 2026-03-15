import SolarCellProcedure from "@/components/experiment/SolarCellProcedure";
import ExperimentLayout from "@/components/experiment/ExperimentLayout";
import ObservationsSection from "@/components/experiment/ObservationsSection";
import QuizSection from "@/components/experiment/QuizSection";
import SolarCellSimulator from "@/components/experiment/SolarCellSimulator";
import SolarCellTheory from "@/components/experiment/SolarCellTheory";

const PhysicsExperiment4 = () => {
  return (
    <ExperimentLayout
      subjectLabel="Experiment 4 • Physics"
      title="Solar Cell - V-I Characteristics and Fill Factor"
      subjectPath="/subjects/physics"
      theory={<SolarCellTheory />}
      procedure={<SolarCellProcedure />}
      simulator={<SolarCellSimulator />}
      observations={<ObservationsSection />}
      quiz={<QuizSection />}
    />
  );
};

export default PhysicsExperiment4;