import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Target,
  BookOpen,
  Beaker,
  Lightbulb,
  FlaskConical,
} from "lucide-react";

const PHMetryTheory = () => {
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
            To determine the molarity of the given dilute HCl acid by pH-metry
            using 0.1 M NaOH standard solution, and to plot the pH titration
            curve to identify the equivalence point.
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
            <h4 className="font-semibold mb-2">What is pH?</h4>
            <p className="text-muted-foreground leading-relaxed">
              pH is a measure of the hydrogen ion concentration in a solution.
              It is defined as the negative logarithm of the hydrogen ion
              concentration:
            </p>
            <div className="bg-primary/5 p-4 rounded-xl mt-3 text-center">
              <p className="font-mono text-sm font-semibold">
                pH = −log[H⁺] = log(1/[H⁺])
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Principle of pH-Metry Titration</h4>
            <p className="text-muted-foreground leading-relaxed">
              When standard NaOH solution is added slowly to the dilute HCl
              solution, the OH⁻ ions combine with H⁺ ions to form water
              molecules. This decreases the H⁺ concentration in solution, and
              therefore the pH increases. At the equivalence point (end point),
              all H⁺ ions are consumed and the pH rises sharply. Further
              addition of NaOH pushes the solution into the alkaline range.
            </p>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-primary" />
              pH Regions During Titration
            </h4>
            <div className="grid grid-cols-3 gap-3 mt-2">
              <div className="p-3 bg-background rounded-lg text-center">
                <p className="font-semibold text-sm text-red-500">Before End Point</p>
                <p className="text-xs text-muted-foreground mt-1">pH ≈ 2–4 (acidic)</p>
                <p className="text-xs text-muted-foreground">Gradual pH rise</p>
              </div>
              <div className="p-3 bg-background rounded-lg text-center">
                <p className="font-semibold text-sm text-green-500">At End Point</p>
                <p className="text-xs text-muted-foreground mt-1">pH ≈ 7 (neutral)</p>
                <p className="text-xs text-muted-foreground">Sharp pH jump</p>
              </div>
              <div className="p-3 bg-background rounded-lg text-center">
                <p className="font-semibold text-sm text-blue-500">After End Point</p>
                <p className="text-xs text-muted-foreground mt-1">pH ≈ 9–11 (alkaline)</p>
                <p className="text-xs text-muted-foreground">Excess NaOH</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Determining the End Point</h4>
            <p className="text-muted-foreground leading-relaxed text-sm">
              The end point is identified as the inflection point of the pH vs
              volume curve. A more accurate method is to plot the first
              derivative (ΔpH/ΔV) against the volume of NaOH added — the
              maximum of this derivative curve corresponds to the exact
              equivalence point.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Calculation of Molarity</h4>
            <div className="bg-primary/5 p-4 rounded-xl space-y-2">
              <p className="text-sm text-muted-foreground">Using the relation at equivalence point:</p>
              <p className="font-mono text-sm font-semibold text-center">M₁V₁ = M₂V₂</p>
              <p className="text-xs text-muted-foreground text-center">
                where M₁ = molarity of HCl, V₁ = volume of HCl (10 mL),
                M₂ = molarity of NaOH (0.1 M), V₂ = end point volume from graph
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apparatus */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display">
            <Beaker className="w-5 h-5 text-primary" />
            Apparatus & Materials Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid md:grid-cols-2 gap-3">
            {[
              "pH meter with electrode",
              "0.1 M NaOH standard solution",
              "Dilute HCl sample solution (~0.025 M)",
              "25 mL burette",
              "20 mL pipette",
              "250 mL beaker",
              "Deionised water",
              "Graph paper / plotting tool",
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
              Calibrate the pH meter with buffer solutions (pH 4 and 7) before starting.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Rinse the pH electrode with deionised water between readings.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Add NaOH in smaller increments (0.5 mL or less) near the expected end point for accuracy.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Stir the solution gently after each addition and wait for the pH reading to stabilise.
            </li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PHMetryTheory;
