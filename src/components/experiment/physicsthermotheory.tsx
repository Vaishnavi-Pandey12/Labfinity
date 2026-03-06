import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Target,
  BookOpen,
  Beaker,
  ListChecks,
  Lightbulb,
  Flame,
} from "lucide-react";

const physicsthermotheory= () => {
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
            To verify Boyle’s Law and Charles’ Law experimentally and to study
            the efficiency of a Carnot engine using thermodynamic principles.
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
            <h4 className="font-semibold mb-2">Boyle’s Law</h4>
            <p className="text-muted-foreground">
              At constant temperature, the pressure of a gas is inversely
              proportional to its volume.
            </p>
            <div className="bg-muted p-3 rounded-lg font-mono text-sm mt-2">
              P ∝ 1/V &nbsp;&nbsp; or &nbsp;&nbsp; PV = constant
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Charles’ Law</h4>
            <p className="text-muted-foreground">
              At constant pressure, the volume of a gas is directly proportional
              to its absolute temperature.
            </p>
            <div className="bg-muted p-3 rounded-lg font-mono text-sm mt-2">
              V ∝ T &nbsp;&nbsp; or &nbsp;&nbsp; V/T = constant
            </div>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary" />
              Carnot Engine Efficiency
            </h4>
            <p className="text-muted-foreground text-sm">
              The efficiency of an ideal Carnot engine depends only on the
              temperatures of the hot and cold reservoirs.
            </p>
            <div className="bg-background p-3 rounded-lg font-mono text-sm mt-3">
              η = 1 − (Tc / Th)
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
              "Gas container (virtual piston)",
              "Pressure gauge",
              "Temperature controller",
              "Heat reservoir (Hot)",
              "Cold reservoir",
              "Graph sheet / Observation table",
            ].map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
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
            <li>Always use temperature in Kelvin.</li>
            <li>Ensure one parameter remains constant during verification.</li>
            <li>Efficiency of Carnot engine is always less than 1.</li>
            <li>Ideal gas behavior is assumed.</li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default physicsthermotheory;