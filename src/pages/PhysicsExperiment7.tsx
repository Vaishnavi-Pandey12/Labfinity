import BiotSavartTheory from "@/components/experiment/BiotSavartTheory";
import BiotSavartProcedure from "@/components/experiment/BiotSavartProcedure";
import BiotSavartSimulator from "@/components/experiment/BiotSavartSimulator";

import ExperimentLayout from "@/components/experiment/ExperimentLayout";
import ObservationsSection from "@/components/experiment/ObservationsSection";
import QuizSection from "@/components/experiment/QuizSection";

const PhysicsExperiment7 = () => {

return(

<ExperimentLayout
subjectLabel="Experiment 7 • Physics"
title="Verification of Biot–Savart Law"
subjectPath="/subjects/physics"
theory={<BiotSavartTheory/>}
procedure={<BiotSavartProcedure/>}
simulator={<BiotSavartSimulator/>}
observations={<ObservationsSection/>}
quiz={<QuizSection/>}
/>

)

}

export default PhysicsExperiment7