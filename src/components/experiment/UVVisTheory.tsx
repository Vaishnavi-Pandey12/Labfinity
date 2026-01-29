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

const UVVisTheory = () => {
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
            To study the absorption spectrum of various compounds in the UV-Visible region 
            (200-800 nm), identify characteristic absorption bands, and understand electronic 
            transitions in molecules.
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
            <h4 className="font-semibold mb-2">UV-Visible Spectroscopy</h4>
            <p className="text-muted-foreground leading-relaxed">
              UV-Vis spectroscopy studies the absorption of ultraviolet (200-400 nm) and 
              visible (400-800 nm) light by molecules. When light is absorbed, electrons 
              are promoted from ground state to excited electronic states.
            </p>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Electronic Transitions
            </h4>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-background rounded-lg">
                <p className="font-mono text-sm font-semibold">σ → σ*</p>
                <p className="text-xs text-muted-foreground">High energy, &lt;200 nm</p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="font-mono text-sm font-semibold">n → σ*</p>
                <p className="text-xs text-muted-foreground">150-250 nm</p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="font-mono text-sm font-semibold">π → π*</p>
                <p className="text-xs text-muted-foreground">200-500 nm (conjugated systems)</p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="font-mono text-sm font-semibold">n → π*</p>
                <p className="text-xs text-muted-foreground">250-600 nm (C=O, N=O)</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Key Terms</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li><strong>Chromophore:</strong> Group responsible for absorption (C=C, C=O, N=N)</li>
              <li><strong>Auxochrome:</strong> Group that modifies absorption (-OH, -NH₂, -Cl)</li>
              <li><strong>Bathochromic shift:</strong> Red shift - absorption moves to longer wavelength</li>
              <li><strong>Hypsochromic shift:</strong> Blue shift - absorption moves to shorter wavelength</li>
              <li><strong>Hyperchromic effect:</strong> Increase in absorption intensity</li>
              <li><strong>Hypochromic effect:</strong> Decrease in absorption intensity</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Woodward-Fieser Rules</h4>
            <p className="text-sm text-muted-foreground">
              Empirical rules to predict λmax for conjugated dienes and enones based on 
              the base value plus increments for substituents, ring residues, and solvent effects.
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
              "UV-Vis Spectrophotometer",
              "Quartz cuvettes (for UV region)",
              "Glass cuvettes (for visible region)",
              "Sample solutions",
              "Reference solvent (blank)",
              "Volumetric flasks",
              "Pipettes",
              "Spectroscopy-grade solvents",
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
                  Instrument Setup
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pl-11">
                Switch on the UV-Vis spectrophotometer and allow it to warm up for 15-20 minutes. 
                Set the wavelength range (typically 200-800 nm) and scan parameters.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step2">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">2</span>
                  Baseline Correction
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pl-11">
                Fill a cuvette with pure solvent (blank) and run a baseline scan. 
                This corrects for solvent absorption and instrument artifacts.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step3">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">3</span>
                  Sample Preparation
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pl-11">
                Prepare sample solutions at appropriate concentrations (absorbance between 0.1-1.0). 
                Use spectroscopy-grade solvents. Filter if necessary to remove particles.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step4">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">4</span>
                  Record Spectrum
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pl-11">
                Place sample in cuvette and record the absorption spectrum. 
                Note λmax values and absorbance. Repeat for different compounds.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step5">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">5</span>
                  Analysis
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pl-11">
                Identify absorption bands and assign them to specific electronic transitions. 
                Compare λmax with literature values. Calculate molar absorptivity if needed.
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
              Use quartz cuvettes for UV region (&lt;350 nm); glass cuvettes absorb UV light.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Keep absorbance values between 0.1-1.0 for accurate measurements.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Handle cuvettes by frosted sides only; fingerprints affect readings.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Solvent choice affects λmax - use the same solvent as literature data.
            </li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UVVisTheory;
