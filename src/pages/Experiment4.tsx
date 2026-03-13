import ExperimentLayout from "@/components/experiment/ExperimentLayout";
import ObservationsSection from "@/components/experiment/ObservationsSection";
import QuizSection from "@/components/experiment/QuizSection";
import UVVisProcedure from "@/components/experiment/UVVisProcedure";
import UVVisSimulator from "@/components/experiment/UVVisSimulator";
import UVVisTheory from "@/components/experiment/UVVisTheory";

const Experiment4 = () => {
  return (
    <ExperimentLayout
      subjectLabel="Experiment 4 • Spectroscopy"
      title="UV-Visible Spectroscopy"
      theory={<UVVisTheory />}
      procedure={<UVVisProcedure />}
      simulator={<UVVisSimulator />}
      observations={<ObservationsSection />}
      quiz={<QuizSection experimentId={5} />}
    />
  );
};

export default Experiment4;
