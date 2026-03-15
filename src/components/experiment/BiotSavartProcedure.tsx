import ProcedureCard from "./ProcedureCard";

const BiotSavartProcedure = () => {

const steps = [

{
title:"Connect the Circuit",
content:"Connect circular coil with power supply, rheostat and ammeter."
},

{
title:"Place Compass",
content:"Place compass at the center of the coil."
},

{
title:"Pass Current",
content:"Pass current through the coil using rheostat."
},

{
title:"Observe Deflection",
content:"Note the compass needle deflection."
},

{
title:"Repeat Readings",
content:"Take readings for different current values."
},

{
title:"Verify Law",
content:"Plot magnetic field vs current graph."
}

]

return <ProcedureCard steps={steps}/>

}

export default BiotSavartProcedure