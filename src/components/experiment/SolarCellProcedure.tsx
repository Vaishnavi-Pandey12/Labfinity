import ProcedureCard from "./ProcedureCard";

const SolarCellProcedure = () => {

  const steps = [
    {
      title: "Setting Up the Circuit",
      content:
        "Connect the solar cell, voltmeter, milliammeter, and variable load resistance as shown in the circuit diagram."
    },

    {
      title: "Illumination of Solar Cell",
      content:
        "Place the solar cell facing the lamp at a distance of about 10 cm so that the light falls normally on the surface."
    },

    {
      title: "Measuring Short Circuit Current",
      content:
        "Set the load resistance to zero and measure the short circuit current (Isc) using the milliammeter."
    },

    {
      title: "Measuring Open Circuit Voltage",
      content:
        "Disconnect the milliammeter from the circuit and measure the open circuit voltage (Voc) using the voltmeter."
    },

    {
      title: "Recording V-I Characteristics",
      content:
        "Vary the load resistance gradually and record the corresponding voltage and current values."
    },

    {
      title: "Plotting the Graph",
      content:
        "Plot the V-I characteristics curve and determine Vmax and Imax for calculating the fill factor."
    }
  ];

  return <ProcedureCard steps={steps} />;

};

export default SolarCellProcedure;