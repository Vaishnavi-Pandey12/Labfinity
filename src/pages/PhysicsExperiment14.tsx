import ExperimentLayout from "@/components/experiment/ExperimentLayout";
import ObservationsSection from "@/components/experiment/ObservationsSection";
import QuizSection from "@/components/experiment/QuizSection";
import FourProbeTheory from "@/components/experiment/FourProbeTheory";
import FourProbeProcedure from "@/components/experiment/FourProbeProcedure";
import FourProbeSimulator from "@/components/experiment/FourProbeSimulator";

const PhysicsExperiment14 = () => {
  return (
    <ExperimentLayout
      subjectLabel="Experiment 14 • Physics"
      title="Determination of Energy Band Gap using Four-Probe Method"
      subjectPath="/subjects/physics"
      theory={<FourProbeTheory />}
      procedure={<FourProbeProcedure />}
      simulator={<FourProbeSimulator />}
      observations={<ObservationsSection />}
      quiz={<QuizSection />}
    />
  );
};

export default PhysicsExperiment14;
