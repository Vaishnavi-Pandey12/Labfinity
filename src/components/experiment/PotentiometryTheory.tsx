import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Target, 
  BookOpen, 
  Beaker,
  Lightbulb,
  Zap
} from "lucide-react";

const PotentiometryTheory = () => {
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
            To perform acid-base, redox, and precipitation titrations using potentiometric measurement. 
            To determine the equivalence point of a titration by measuring potential (EMF) changes and analyze titration curves.
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
            <h4 className="font-semibold mb-2">Potentiometry Principle</h4>
            <p className="text-muted-foreground leading-relaxed">
              Potentiometry is an electrochemical analytical technique that measures the potential difference 
              (voltage) between an indicator electrode and a reference electrode. This measurement is used to 
              determine the concentration of ions, pH, or the endpoint of a titration.
            </p>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Nernst Equation
            </h4>
            <div className="font-mono text-center text-lg my-4 p-4 bg-background rounded-lg">
              E = E° - (RT/nF) ln(Q)
            </div>
            <p className="text-sm text-muted-foreground">
              At 25°C: <span className="font-mono">E = E° - (0.0592/n) log(Q)</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Where E is cell potential, E° is standard cell potential, n is number of electrons transferred, 
              Q is reaction quotient, R is gas constant, T is temperature, and F is Faraday's constant.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">EMF Measurement with Glass Electrode</h4>
            <div className="font-mono text-center my-3 p-4 bg-muted rounded-lg">
              E = E° - 0.0592 × pH
            </div>
            <p className="text-sm text-muted-foreground">
              The glass electrode produces a potential that varies linearly with pH. At 25°C, the potential 
              changes by approximately 59 mV per pH unit. This relationship allows direct measurement and 
              display of potential (EMF) values, which correlate to the pH of the solution.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Potentiometric Titration Curve</h4>
            <p className="text-sm text-muted-foreground">
              The titration curve shows three distinct regions: (1) <strong>Before equivalence point</strong> - 
              gradual potential change with gentle slope; (2) <strong>Near equivalence point</strong> - rapid potential change 
              with maximum slope (inflection point); (3) <strong>After equivalence point</strong> - gradual potential change 
              with gentle slope again. The equivalence point is located at the inflection point where dE/dV is maximum.
            </p>
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
              "Glass electrode (indicator electrode)",
              "Reference electrode (Ag/AgCl or calomel)",
              "Potentiometer / Digital millivoltmeter",
              "Burette (25 mL or 50 mL)",
              "Beaker (100-250 mL)",
              "Magnetic stirrer & stir bar",
              "Analyte solution (acid or base)",
              "Titrant solution (standard solution)",
              "Distilled water",
              "Connecting wires with alligator clips",
            ].map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Observations */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display">
            <Beaker className="w-5 h-5 text-primary" />
            Key Observations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm font-semibold mb-1">Titration Curve Shape</p>
            <p className="text-sm text-muted-foreground">
              The S-shaped titration curve shows a sharp vertical section at the equivalence point where potential (EMF) changes rapidly 
              with small additions of titrant.
            </p>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm font-semibold mb-1">Equivalence Point Location</p>
            <p className="text-sm text-muted-foreground">
              For strong acid-strong base titrations, the equivalence point occurs at pH ≈ 7.0. For weak acid-strong base 
              titrations, it occurs at pH &gt; 7.0 (basic), and for strong acid-weak base titrations, at pH &lt; 7.0 (acidic).
            </p>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm font-semibold mb-1">Calculation: Molarity Determination</p>
            <p className="text-sm text-muted-foreground font-mono">
              M₁V₁ = M₂V₂<br />
              Where M is molarity and V is volume at equivalence point
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Important Tips */}
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
              Always calibrate the potentiometer with standard references before starting measurements.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Keep the electrode clean and store it properly in distilled water when not in use.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Allow sufficient time for the EMF reading to stabilize after each titrant addition.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Use small increments near the equivalence point for accurate determination of the endpoint.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Maintain constant temperature as EMF readings are temperature-dependent.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Avoid direct handling of the electrode bulb to prevent damage and contamination.
            </li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PotentiometryTheory;
