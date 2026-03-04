import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Target,
  BookOpen,
  Beaker,
  Lightbulb,
  Zap,
} from "lucide-react";

const HardnessTheory = () => {
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
        <CardContent className="space-y-3">
          <p className="text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Part 1 — </span>
            To estimate the total hardness of a given water sample by EDTA
            complexometric titration and express the result in ppm of CaCO₃.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Part 2 — </span>
            To remove Ca²⁺ and Mg²⁺ ions from hard water using an Amberlite
            IR120 cation-exchange resin column, determine the residual hardness
            of the purified water, and calculate the percent purification.
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
            <h4 className="font-semibold mb-2">Water Hardness</h4>
            <p className="text-muted-foreground leading-relaxed">
              Water hardness is the total concentration of polyvalent cations —
              primarily Ca²⁺ and Mg²⁺ — dissolved in water. It is reported as
              ppm (mg/L) of equivalent CaCO₃. Hard water reacts with fatty acids
              in soap to form insoluble scum, and causes scale deposits in
              boilers and pipes.
            </p>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Key Equations
            </h4>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-background rounded-lg text-center">
                <p className="font-mono text-sm font-semibold">Ca²⁺ + EDTA⁴⁻ → [Ca·EDTA]²⁻</p>
                <p className="text-xs text-muted-foreground mt-1">Stable 1:1 chelate (colourless)</p>
              </div>
              <div className="p-3 bg-background rounded-lg text-center">
                <p className="font-mono text-sm font-semibold">1 mL 0.01 M EDTA ≡ 1 mg CaCO₃</p>
                <p className="text-xs text-muted-foreground mt-1">Equivalence factor</p>
              </div>
              <div className="p-3 bg-background rounded-lg text-center">
                <p className="font-mono text-sm font-semibold">Hardness = (V × 1000) / 20 ppm</p>
                <p className="text-xs text-muted-foreground mt-1">For 20 mL water sample</p>
              </div>
              <div className="p-3 bg-background rounded-lg text-center">
                <p className="font-mono text-sm font-semibold">Resin·H⁺ + Ca²⁺ → Resin·Ca²⁺ + 2H⁺</p>
                <p className="text-xs text-muted-foreground mt-1">Ion exchange reaction (Part 2)</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Part 1 — EDTA Complexometric Titration</h4>
            <p className="text-muted-foreground leading-relaxed text-sm">
              EDTA forms stable 1:1 chelate complexes with Ca²⁺ and Mg²⁺ at
              pH 9–10, maintained by an NH₄Cl/NH₄OH buffer. Calmagite indicator
              initially forms unstable wine-red complexes with the metal ions.
              As EDTA is added from the burette it strips metals away from the
              indicator, causing a sharp colour change from wine-red → violet →
              pure blue at the end point.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Part 2 — Ion Exchange Method</h4>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Amberlite IR120 is a sulfonated cation-exchange resin. As hard
              water passes slowly through the column, Ca²⁺ and Mg²⁺ displace
              H⁺ ions from the resin's sulfonic acid groups. The effluent is
              softer water. It is then titrated with EDTA (same as Part 1) to
              find residual hardness. Comparing this with the original hardness
              gives the percent purification achieved.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Percent Purification</h4>
            <div className="font-mono text-sm text-center p-3 bg-muted rounded-lg">
              % Purification = [(H_sample − H_purified) / H_sample] × 100
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
              "Pipette (20 mL)",
              "0.01 M EDTA standard solution",
              "Hard water sample",
              "NH₄Cl / NH₄OH buffer (pH 9–10)",
              "Calmagite indicator solution",
              "Amberlite IR120 ion-exchange column (Part 2)",
              "Distilled water (50 mL + 100 mL for Part 2)",
              "Beaker (250 mL)",
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
              Maintain pH 9–10 strictly using the buffer — EDTA complexation
              is incomplete outside this range.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              The end point is a sharp wine-red → blue change; add EDTA
              drop-by-drop near the end point to avoid overshooting.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              In Part 2, pass water through the column slowly — rapid flow
              prevents complete ion exchange equilibrium from establishing.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Always condition the column with 50 mL distilled water first
              and discard that effluent before passing the hard water sample.
            </li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HardnessTheory;
