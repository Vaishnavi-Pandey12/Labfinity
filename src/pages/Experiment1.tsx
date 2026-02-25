import ElectrochemistryProcedure from "@/components/experiment/ElectrochemistryProcedure";
import ExperimentLayout from "@/components/experiment/ExperimentLayout";
import ElectrochemistrySimulator from "@/components/experiment/ElectrochemistrySimulator";
import ElectrochemistryTheory from "@/components/experiment/ElectrochemistryTheory";
import GraphUpload from "@/components/experiment/GraphUpload";

const Experiment1 = () => {
  return (
    <ExperimentLayout
      subjectLabel="Experiment 1 • Electrochemistry"
      title="EMF Measurement - Daniell Cell"
      theory={<ElectrochemistryTheory />}
      procedure={<ElectrochemistryProcedure />}
      simulator={<ElectrochemistrySimulator />}
      upload={<GraphUpload studentId="student-1" experimentId="experiment-1" onUploadSuccess={() => {}} />}
      lockOrder
    />
  );
};

export default Experiment1;
