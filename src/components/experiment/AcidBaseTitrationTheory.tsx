import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Target,
  BookOpen,
  Beaker,
  Lightbulb,
  Zap,
} from "lucide-react";

const AcidBaseTitrationTheory = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Objective */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display">
            <Target className="w-5 h-5 text-primary" />
            Objective
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            To determine the molarity of a given dilute HCl acid solution by
            volumetric titration using a standard 0.1 M NaOH solution with
            phenolphthalein as the indicator.
          </p>
        </CardContent>
      </Card>

      {/* Theory */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display">
            <BookOpen className="w-5 h-5 text-primary" />
            Theory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Volumetric Titration</h4>
            <p className="text-muted-foreground leading-relaxed">
              Volumetric titration determines the concentration of an unknown
              solution (analyte) by reacting it with a standard solution of
              known concentration (titrant). The volume of titrant required to
              completely react with the analyte is measured, and the
              concentration is calculated using the stoichiometry of the
              reaction.
            </p>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Key Equations
            </h4>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-background rounded-lg text-center">
                <p className="font-mono text-sm font-semibold">NaOH + HCl → NaCl + H₂O</p>
                <p className="text-xs text-muted-foreground mt-1">Neutralisation reaction</p>
              </div>
              <div className="p-3 bg-background rounded-lg text-center">
                <p className="font-mono text-sm font-semibold">M₁V₁ = M₂V₂</p>
                <p className="text-xs text-muted-foreground mt-1">At equivalence point</p>
              </div>
              <div className="p-3 bg-background rounded-lg text-center">
                <p className="font-mono text-sm font-semibold">HPh ⇌ H⁺ + Ph⁻</p>
                <p className="text-xs text-muted-foreground mt-1">Phenolphthalein equilibrium</p>
              </div>
              <div className="p-3 bg-background rounded-lg text-center">
                <p className="font-mono text-sm font-semibold">g/L = M × 36.45</p>
                <p className="text-xs text-muted-foreground mt-1">HCl strength (mol. wt. 36.45)</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Phenolphthalein Indicator</h4>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Phenolphthalein (HPh) is a weak acid indicator. In its unionised
              form it is colourless; its anion (Ph⁻) is pink. In acidic
              solution the equilibrium lies to the left — the solution is
              colourless. As NaOH is added, OH⁻ ions remove H⁺, shifting the
              equilibrium right and forming the pink Ph⁻ anion. The first
              permanent pale-pink colour that persists for 30 seconds marks the
              end point (pH ≈ 8.2–10).
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Calculation of Molarity</h4>
            <p className="text-sm text-muted-foreground">
              At the equivalence point the moles of NaOH added exactly equal
              the moles of HCl present. Applying M₁V₁ = M₂V₂ gives:
            </p>
            <div className="font-mono text-sm text-center p-3 bg-muted rounded-lg mt-2">
              M(HCl) = [M(NaOH) × V(NaOH)] / V(HCl)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apparatus */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display">
            <Beaker className="w-5 h-5 text-primary" />
            Apparatus Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid md:grid-cols-2 gap-3">
            {[
              "Burette (25 mL) with stand",
              "Conical flask (250 mL)",
              "Pipette (10 mL)",
              "Standard 0.1 M NaOH solution",
              "Dilute HCl solution (unknown molarity)",
              "Phenolphthalein indicator solution",
              "Deionised water (for rinsing)",
              "White tile (for colour observation)",
            ].map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="glass-card border-0 bg-amber-500/5 border-amber-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display text-amber-600 dark:text-amber-400">
            <Lightbulb className="w-5 h-5" />
            Important Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Rinse the burette with NaOH solution and the pipette with HCl
              solution before use to avoid dilution errors.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Add only 1–2 drops of phenolphthalein; excess indicator can
              affect the sharpness of the end point.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Near the end point, add NaOH drop by drop and swirl after each
              addition — the end point is the first permanent pale-pink colour.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Perform at least three concordant titrations (values within
              0.1 mL of each other) and take their average.
            </li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AcidBaseTitrationTheory;
