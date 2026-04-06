import { useState } from "react";

const ElectrochemistryProcedure = () => {
  const steps = [
    {
      title: "Setting Up the Half-Cells",
      image: "🧪",
      content: "Take two clean beakers. Pour ZnSO₄ in one and CuSO₄ in the other. Immerse zinc and copper electrodes respectively.",
    },
    {
      title: "Connecting the Salt Bridge",
      image: "🔗",
      content: "Connect the two half-cells using a salt bridge filled with KCl or KNO₃ solution.",
    },
    {
      title: "Measuring EMF",
      image: "📟",
      content: "Connect electrodes to voltmeter. Zinc to negative terminal and copper to positive terminal.",
    },
    {
      title: "Varying Concentration",
      image: "⚗️",
      content: "Change concentration and measure EMF. Record observations to verify Nernst equation.",
    },
    {
      title: "Data Analysis",
      image: "📈",
      content: "Plot EMF vs log([Zn²⁺]/[Cu²⁺]). Compare slope with theoretical value.",
    },
  ];

  const [index, setIndex] = useState(0);
  const step = steps[index];

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground font-medium">Step {index + 1} of {steps.length}</div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2 rounded-xl border bg-white min-h-[220px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl">{step.image}</div>
            <p className="text-xs text-muted-foreground mt-2">Illustration</p>
          </div>
        </div>
        <div className="md:w-1/2 rounded-xl border bg-card p-5">
          <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
          <p className="text-muted-foreground">{step.content}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          className="px-4 py-2 rounded-md border disabled:opacity-50"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          Previous
        </button>
        <button
          className="px-4 py-2 rounded-md border disabled:opacity-50"
          disabled={index === steps.length - 1}
          onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ElectrochemistryProcedure;
