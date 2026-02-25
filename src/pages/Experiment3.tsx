import ExperimentLayout from "@/components/experiment/ExperimentLayout";
import GraphUpload from "@/components/experiment/GraphUpload";
import PotentiometryProcedure from "@/components/experiment/PotentiometryProcedure";
import PotentiometrySimulator from "@/components/experiment/PotentiometrySimulator";
import PotentiometryTheory from "@/components/experiment/PotentiometryTheory";

const Experiment3 = () => {
  return (
    <ExperimentLayout
      subjectLabel="Experiment 3 • Potentiometry"
      title="Potentiometric Titration"
      theory={<PotentiometryTheory />}
      procedure={<PotentiometryProcedure />}
      simulator={<PotentiometrySimulator />}
      upload={<GraphUpload studentId="student-1" experimentId="experiment-3" onUploadSuccess={() => {}} />}
      lockOrder
    />
  );
};

export default Experiment3;
