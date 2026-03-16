import HallEffectTheory from "@/components/experiment/HallEffectTheory";
import HallEffectProcedure from "@/components/experiment/HallEffectProcedure";
import HallEffectSimulator from "@/components/experiment/HallEffectSimulator";

import ExperimentLayout from "@/components/experiment/ExperimentLayout";
import ObservationsSection from "@/components/experiment/ObservationsSection";
import QuizSection from "@/components/experiment/QuizSection";

const PhysicsExperiment6 = () => {

  return (
    <ExperimentLayout
      subjectLabel="Experiment 6 • Physics"
      title="Hall Effect - Determination of Hall Coefficient"
      subjectPath="/subjects/physics"
      theory={<HallEffectTheory />}
      procedure={<HallEffectProcedure />}
      simulator={<HallEffectSimulator />}
      observations={<ObservationsSection />}
      quiz={<QuizSection />}
    />
  );

};

export default PhysicsExperiment6;