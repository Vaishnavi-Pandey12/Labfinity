import ColorimetryProcedure from "@/components/experiment/ColorimetryProcedure";
import ColorimetrySimulator from "@/components/experiment/ColorimetrySimulator";
import ExperimentLayout from "@/components/experiment/ExperimentLayout";
import TheorySection from "@/components/experiment/TheorySection";

const Experiment2 = () => {
  return (
    <ExperimentLayout
      subjectLabel="Experiment 2 • Colorimetry"
      title="Beer-Lambert Law Verification"
      theory={<TheorySection />}
      procedure={<ColorimetryProcedure />}
      simulator={<ColorimetrySimulator />}
      lockOrder
    />
  );
};

export default Experiment2;
