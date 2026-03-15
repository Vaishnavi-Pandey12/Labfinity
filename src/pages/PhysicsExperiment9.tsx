        import PendulumTheory from "@/components/experiment/PendulumTheory";
import PendulumProcedure from "@/components/experiment/PendulumProcedure";
import PendulumSimulator from "@/components/experiment/PendulumSimulator";

import ExperimentLayout from "@/components/experiment/ExperimentLayout";
import ObservationsSection from "@/components/experiment/ObservationsSection";
import QuizSection from "@/components/experiment/QuizSection";

const PhysicsExperiment9 = () => {

return(

<ExperimentLayout
subjectLabel="Experiment 9 • Physics"
title="Simple Pendulum"
subjectPath="/subjects/physics"
theory={<PendulumTheory/>}
procedure={<PendulumProcedure/>}
simulator={<PendulumSimulator/>}
observations={<ObservationsSection/>}
quiz={<QuizSection/>}
/>

)

}

export default PhysicsExperiment9