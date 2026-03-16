import ProcedureCard from "./ProcedureCard";

const LEDProcedure = () => {
  const steps = [
    {
      title: "Connect the Circuit",
      content:
        "Connect the LED, milliammeter, voltmeter, and variable voltage supply as shown in the circuit diagram of the LED characteristics trainer kit. Ensure connections are tight.",
    },
    {
      title: "Set Initial Conditions",
      content:
        "Keep the voltage knob at the minimum position before switching on the supply. Select the LED colour to be tested (Red, Yellow, Green, or Blue).",
    },
    {
      title: "Record V-I Readings",
      content:
        "Switch on the supply. Increase the voltage in small steps (0.1 V increments) and record the corresponding current readings in milliamperes. Continue until the current rises sharply.",
    },
    {
      title: "Plot the V-I Characteristic Curve",
      content:
        "Plot a graph of current (mA) on the Y-axis versus voltage (V) on the X-axis for the selected LED. The graph will show the characteristic forward bias curve with a distinct knee.",
    },
    {
      title: "Determine the Knee Voltage",
      content:
        "Draw a tangent to the steeply rising portion of the V-I curve and extend it to intersect the voltage axis. The voltage at this intersection point is the knee voltage VK.",
    },
    {
      title: "Calculate Wavelength and Repeat",
      content:
        "Calculate the wavelength using λ = hc / eVK (h = 6.63×10⁻³⁴ J·s, c = 3×10⁸ m/s, e = 1.602×10⁻¹⁹ C). Repeat steps 1–5 for all four LED colours and compare the calculated wavelengths with standard values.",
    },
  ];

  return <ProcedureCard steps={steps} />;
};

export default LEDProcedure;
