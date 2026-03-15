import ThermistorTheory from "@/components/experiment/ThermistorTheory";
import ThermistorProcedure from "@/components/experiment/ThermistorProcedure";
import ThermistorSimulator from "@/components/experiment/ThermistorSimulator";

import ExperimentLayout from "@/components/experiment/ExperimentLayout";
import ObservationsSection from "@/components/experiment/ObservationsSection";
import QuizSection from "@/components/experiment/QuizSection";

const PhysicsExperiment5 = () => {

  return (
    <ExperimentLayout
      subjectLabel="Experiment 5 • Physics"
      title="Thermistor - Temperature vs Resistance"
      subjectPath="/subjects/physics"
      theory={<ThermistorTheory />}
      procedure={<ThermistorProcedure />}
      simulator={<ThermistorSimulator />}
      observations={<ObservationsSection />}
      quiz={<QuizSection />}
    />
  );

};

export default PhysicsExperiment5;