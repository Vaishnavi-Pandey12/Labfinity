import ThomsonTheory from "@/components/experiment/ThomsonTheory";
import ThomsonProcedure from "@/components/experiment/ThomsonProcedure";
import ThomsonSimulator from "@/components/experiment/ThomsonSimulator";

import ExperimentLayout from "@/components/experiment/ExperimentLayout";
import ObservationsSection from "@/components/experiment/ObservationsSection";
import QuizSection from "@/components/experiment/QuizSection";

const PhysicsExperiment8 = () => {

return(

<ExperimentLayout
subjectLabel="Experiment 8 • Physics"
title="Determination of e/m by Thomson Method"
subjectPath="/subjects/physics"
theory={<ThomsonTheory/>}
procedure={<ThomsonProcedure/>}
simulator={<ThomsonSimulator/>}
observations={<ObservationsSection/>}
quiz={<QuizSection/>}
/>

)

}

export default PhysicsExperiment8