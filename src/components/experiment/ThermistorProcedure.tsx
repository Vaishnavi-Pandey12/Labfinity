import ProcedureCard from "./ProcedureCard";

const ThermistorProcedure = () => {

  const steps = [
    {
      title:"Connect the Circuit",
      content:"Connect the thermistor kit using patch cords."
    },
    {
      title:"Initial Setup",
      content:"Switch on the instrument and keep heater OFF."
    },
    {
      title:"Record Temperature",
      content:"Note the temperature using thermometer."
    },
    {
      title:"Heat the Thermistor",
      content:"Switch ON heater and allow temperature to increase gradually."
    },
    {
      title:"Take Readings",
      content:"Record current and calculate resistance using R = V/I."
    },
    {
      title:"Plot Graph",
      content:"Plot Temperature vs Resistance graph."
    }
  ];

  return <ProcedureCard steps={steps}/>;
};

export default ThermistorProcedure;