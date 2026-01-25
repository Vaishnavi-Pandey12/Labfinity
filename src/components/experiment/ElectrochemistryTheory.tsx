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
            To construct a Daniell cell and measure its Electromotive Force (EMF). 
            To verify the Nernst equation by studying the effect of concentration on cell potential.
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
              spontaneous redox reactions. The Daniell cell is a classic example consisting of 
              a zinc electrode in ZnSO₄ solution and a copper electrode in CuSO₄ solution.
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

      {/* Procedure */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display">
            <ListChecks className="w-5 h-5 text-primary" />
            Procedure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="step1">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">1</span>
                  Setting Up the Half-Cells
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pl-11">
                Take two clean beakers. Pour ZnSO₄ solution in one beaker and CuSO₄ solution 
                in the other. Immerse the zinc electrode in ZnSO₄ and copper electrode in CuSO₄.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step2">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">2</span>
                  Connecting the Salt Bridge
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pl-11">
                Connect the two half-cells using a salt bridge filled with KCl or KNO₃ solution. 
                The salt bridge allows ion flow while preventing direct mixing of solutions.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step3">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">3</span>
                  Measuring EMF
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pl-11">
                Connect the electrodes to a digital voltmeter. Connect zinc to negative terminal 
                and copper to positive terminal. Record the EMF reading.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step4">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">4</span>
                  Varying Concentration
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pl-11">
                Change the concentration of ZnSO₄ or CuSO₄ and measure EMF for each concentration. 
                Record observations to verify the Nernst equation.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step5">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">5</span>
                  Data Analysis
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pl-11">
                Plot EMF vs log([Zn²⁺]/[Cu²⁺]). The graph should be linear with slope = -0.0591/n. 
                Calculate the slope and compare with theoretical value.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
