import InclinedPlaneTheory from "@/components/experiment/PlaneTheory";
import InclinedPlaneProcedure from "@/components/experiment/PlaneProcedure";
import InclinedPlaneSimulator from "@/components/experiment/PlaneSimulator";

import ExperimentLayout from "@/components/experiment/ExperimentLayout";
import ObservationsSection from "@/components/experiment/ObservationsSection";
import QuizSection from "@/components/experiment/QuizSection";

const PhysicsExperiment10 = () => {

return(

<ExperimentLayout
subjectLabel="Experiment 10 • Physics"
title="Inclined Plane"
subjectPath="/subjects/physics"
theory={<InclinedPlaneTheory/>}
procedure={<InclinedPlaneProcedure/>}
simulator={<InclinedPlaneSimulator/>}
observations={<ObservationsSection/>}
quiz={<QuizSection/>}
/>

)

}

export default PhysicsExperiment10;