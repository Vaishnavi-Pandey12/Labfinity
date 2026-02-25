import ExperimentLayout from "@/components/experiment/ExperimentLayout";
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
      lockOrder
    />
  );
};

export default Experiment4;
