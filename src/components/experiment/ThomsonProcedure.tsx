import ProcedureCard from "./ProcedureCard";

const ThomsonProcedure = () => {

const steps = [

{
title:"Power ON the Apparatus",
content:"Switch on the CRT tube and power supply."
},

{
title:"Adjust Voltage",
content:"Apply accelerating voltage to produce electron beam."
},

{
title:"Apply Magnetic Field",
content:"Pass current through Helmholtz coils."
},

{
title:"Observe Electron Path",
content:"Observe circular electron trajectory inside CRT tube."
},

{
title:"Measure Radius",
content:"Measure radius of electron beam path."
},

{
title:"Calculate e/m",
content:"Use formula e/m = 2V / (B² r²)."
}

]

return <ProcedureCard steps={steps}/>

}

export default ThomsonProcedure