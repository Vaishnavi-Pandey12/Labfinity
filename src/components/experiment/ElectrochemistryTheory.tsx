import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Target, 
  BookOpen, 
  Beaker,
  Lightbulb,
  Zap
} from "lucide-react";

const ElectrochemistryTheory = () => {
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
            To assemble an electrochemical cell with zinc and copper electrodes and measure its Electromotive Force (EMF).
            To verify the Nernst equation by studying how concentration changes affect the cell potential.
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
            <h4 className="font-semibold mb-2">Electrochemical Cell</h4>
            <p className="text-muted-foreground leading-relaxed">
              An electrochemical cell converts chemical energy into electrical energy through
              spontaneous redox reactions. In this experiment, zinc and copper electrodes are used
              in ZnSO₄ and CuSO₄ solutions to study how concentration changes affect EMF.
            </p>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Nernst Equation
            </h4>
            <div className="font-mono text-center text-lg my-4 p-4 bg-background rounded-lg">
              E = E° - (RT/nF) ln Q
            </div>
            <p className="text-sm text-muted-foreground">
              Where E is cell potential, E° is standard cell potential, R is gas constant, 
              T is temperature, n is number of electrons transferred, F is Faraday's constant, 
              and Q is reaction quotient.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">At 25°C (298 K):</h4>
            <div className="font-mono text-center text-lg my-4 p-4 bg-muted rounded-lg">
              E = E° - (0.0591/n) log Q
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Cell Representation</h4>
            <div className="font-mono text-center p-4 bg-muted rounded-lg">
              Zn | ZnSO₄ (aq) || CuSO₄ (aq) | Cu
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Anode (oxidation): Zn → Zn²⁺ + 2e⁻<br />
              Cathode (reduction): Cu²⁺ + 2e⁻ → Cu<br />
              Standard EMF (E°) = E°cathode - E°anode = 0.34 - (-0.76) = 1.10 V
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
              "Zinc electrode",
              "Copper electrode",
              "ZnSO₄ solution (various concentrations)",
              "CuSO₄ solution (various concentrations)",
              "Salt bridge (KCl/KNO₃)",
              "Digital voltmeter/potentiometer",
              "Beakers (250 mL)",
              "Connecting wires",
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
              Clean electrodes with sandpaper before use to remove oxide layers.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Ensure the salt bridge makes good contact with both solutions.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Allow the EMF reading to stabilize before recording.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Temperature affects EMF - maintain constant temperature during measurements.
            </li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ElectrochemistryTheory;
