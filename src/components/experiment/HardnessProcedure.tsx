import ProcedureCard from "./ProcedureCard";

const HardnessProcedure = () => {
  const steps = [
    {
      title: "Part 1 — Fill the Burette with EDTA",
      content:
        "Rinse a clean 25 mL burette with 0.01 M EDTA solution, then fill it above the zero mark. Remove air bubbles from the tip and adjust to exactly 0.00 mL. Note the initial reading.",
    },
    {
      title: "Part 1 — Prepare the Hard Water Sample",
      content:
        "Pipette out exactly 20 mL of the given hard water sample into a clean 250 mL conical flask.",
    },
    {
      title: "Part 1 — Add Buffer and Indicator",
      content:
        "Add 5 mL of NH₄Cl / NH₄OH buffer solution (pH 9–10) to the flask. Then add 2–3 drops of calmagite indicator. The solution turns wine-red as calmagite forms unstable complexes with Ca²⁺ and Mg²⁺.",
    },
    {
      title: "Part 1 — Titrate with EDTA",
      content:
        "Add 0.01 M EDTA from the burette slowly while swirling the flask continuously. The wine-red colour shifts gradually to violet as EDTA chelates the metal ions. Near the end point, add EDTA drop-by-drop.",
    },
    {
      title: "Part 1 — Identify the End Point",
      content:
        "The end point is reached when the last trace of red/violet disappears and the solution turns a clear, pure blue. This change should be sharp. Note the final burette reading (V₁ mL).",
    },
    {
      title: "Part 1 — Repeat and Calculate Hardness",
      content:
        "Repeat the titration at least twice more to obtain concordant readings (within 0.1 mL). Calculate: Sample water hardness (ppm) = (V₁ × 1000) / 20.",
    },
    {
      title: "Part 2 — Condition the Ion Exchange Column",
      content:
        "Pass 50 mL of distilled water slowly through the Amberlite IR120 cation-exchange column. Collect the effluent and discard it. This regenerates and conditions the resin before use.",
    },
    {
      title: "Part 2 — Pass Hard Water Through the Column",
      content:
        "Pipette out 20 mL of hard water into a beaker. Slowly pass it over the Amberlite IR120 column, collecting all drops in a clean 250 mL conical flask. Ca²⁺ and Mg²⁺ exchange with H⁺ ions on the resin.",
    },
    {
      title: "Part 2 — Wash the Column",
      content:
        "Pass 100 mL of distilled water slowly over the column and collect the entire effluent in the same conical flask. This ensures complete elution of exchanged ions from the resin bed.",
    },
    {
      title: "Part 2 — Titrate Effluent and Calculate Purification",
      content:
        "Add buffer and calmagite to the collected effluent, then titrate with 0.01 M EDTA as in Part 1. Record V₂ mL. Calculate: Purified water hardness = (V₂ × 1000) / 20 ppm. Then: % Purification = [(H_sample − H_purified) / H_sample] × 100.",
    },
  ];

  return <ProcedureCard steps={steps} />;
};

export default HardnessProcedure;
