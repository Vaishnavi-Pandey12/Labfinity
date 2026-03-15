import ProcedureCard from "./ProcedureCard";

const HallEffectProcedure = () => {

  const steps = [
    {
      title:"Setup the Circuit",
      content:"Connect the Hall probe and semiconductor sample properly."
    },
    {
      title:"Apply Current",
      content:"Pass a constant current through the semiconductor."
    },
    {
      title:"Apply Magnetic Field",
      content:"Switch ON electromagnet to create magnetic field."
    },
    {
      title:"Measure Hall Voltage",
      content:"Measure the voltage developed across the sample."
    },
    {
      title:"Repeat Observations",
      content:"Take readings for different magnetic field values."
    },
    {
      title:"Calculate Hall Coefficient",
      content:"Use formula RH = (VH × t) / (I × B)."
    }
  ];

  return <ProcedureCard steps={steps}/>;

};

export default HallEffectProcedure;