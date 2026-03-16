import ProcedureCard from "./ProcedureCard";

const PendulumProcedure = () => {

const steps = [

{
title:"Setup Pendulum",
content:"Suspend a small metallic bob using a thread on a stand."
},

{
title:"Measure Length",
content:"Measure the length from pivot to center of bob."
},

{
title:"Displace Bob",
content:"Displace bob slightly and release."
},

{
title:"Measure Time",
content:"Measure time for 10 oscillations using stopwatch."
},

{
title:"Repeat Readings",
content:"Repeat experiment for different lengths."
},

{
title:"Calculate g",
content:"Use T = 2π√(L/g) to calculate gravitational acceleration."
}

]

return <ProcedureCard steps={steps}/>

}

export default PendulumProcedure