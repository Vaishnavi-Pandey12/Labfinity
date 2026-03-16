import ExperimentLayout from "@/components/experiment/ExperimentLayout";
import ObservationsSection from "@/components/experiment/ObservationsSection";
import QuizSection from "@/components/experiment/QuizSection";
import LaserDiffractionTheory from "@/components/experiment/LaserDiffractionTheory";
import LaserDiffractionProcedure from "@/components/experiment/LaserDiffractionProcedure";
import LaserDiffractionSimulator from "@/components/experiment/LaserDiffractionSimulator";

const PhysicsExperiment12 = () => {
  return (
    <ExperimentLayout
      subjectLabel="Experiment 12 • Physics"
      title="Determination of Wavelength of Laser using Diffraction Grating"
      subjectPath="/subjects/physics"
      theory={<LaserDiffractionTheory />}
      procedure={<LaserDiffractionProcedure />}
      simulator={<LaserDiffractionSimulator />}
      observations={<ObservationsSection />}
      quiz={<QuizSection />}
    />
  );
};

export default PhysicsExperiment12;
