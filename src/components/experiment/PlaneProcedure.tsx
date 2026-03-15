import ProcedureCard from "./ProcedureCard";

const InclinedPlaneProcedure = ()=>{

const steps=[

{
title:"Set the Incline",
content:"Adjust the inclined plane to a small angle."
},

{
title:"Place the Block",
content:"Place wooden block on the inclined surface."
},

{
title:"Attach Pulley",
content:"Connect block with hanging mass using thread over pulley."
},

{
title:"Adjust Weight",
content:"Change hanging mass until the block just moves."
},

{
title:"Record Readings",
content:"Note angle of incline and hanging mass."
},

{
title:"Repeat Experiment",
content:"Repeat experiment for different angles."
}

]

return <ProcedureCard steps={steps}/>

}

export default InclinedPlaneProcedure;