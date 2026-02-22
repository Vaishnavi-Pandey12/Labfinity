import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown, ListChecks, ClipboardList, AlertCircle } from "lucide-react";

const ProjectileMotionTheory = () => {
  const [activeStep, setActiveStep] = useState<number | null>(1);

  const toggleStep = (step: number) => {
    setActiveStep(activeStep === step ? null : step);
  };

  return (
    <div className="space-y-6">

      {/* Theory */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="font-display text-lg">
            Projectile Motion – Theory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p>
            Projectile motion is the motion of an object projected into the air
            under the influence of gravity alone.
          </p>
          <p>
            The horizontal velocity remains constant while vertical motion is
            uniformly accelerated due to gravity.
          </p>

          <div className="space-y-2">
            <p className="font-semibold">Important Equations:</p>
            <div className="font-mono bg-muted p-2 rounded">
              T = (2u sinθ) / g
            </div>
            <div className="font-mono bg-muted p-2 rounded">
              H = (u² sin²θ) / (2g)
            </div>
            <div className="font-mono bg-muted p-2 rounded">
              R = (u² sin2θ) / g
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apparatus Required */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <ListChecks className="w-5 h-5 text-primary" />
            Apparatus Required
          </CardTitle>
        </CardHeader>

        <CardContent className="text-sm">
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="list-disc ml-6 space-y-2">
              <li>Projectile launcher (virtual)</li>
              <li>Protractor</li>
              <li>Measuring scale</li>
            </ul>
            <ul className="list-disc ml-6 space-y-2">
              <li>Stopwatch (virtual timer)</li>
              <li>Graph sheet / observation table</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Procedure (Accordion Style like Optics) */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <ClipboardList className="w-5 h-5 text-primary" />
            Procedure
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-sm">

          {[ 
            {
              title: "Setup",
              content: "Open the simulator and set an initial velocity and projection angle."
            },
            {
              title: "Measurement",
              content: "Run the simulation and record Time of Flight, Maximum Height and Range."
            },
            {
              title: "Verification",
              content: "Repeat for multiple angles and verify maximum range at 45°."
            }
          ].map((step, index) => {
            const stepNumber = index + 1;
            const isOpen = activeStep === stepNumber;

            return (
              <div key={stepNumber} className="border-b border-border/50 pb-3">
                <div
                  className="flex items-center justify-between cursor-pointer group"
                  onClick={() => toggleStep(stepNumber)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      {stepNumber}
                    </div>
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {step.title}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-11 mt-2 text-muted-foreground"
                    >
                      {step.content}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="glass-card border-0 bg-orange-50 dark:bg-orange-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg text-orange-600 dark:text-orange-400">
            <AlertCircle className="w-5 h-5" />
            Important Notes
          </CardTitle>
        </CardHeader>

        <CardContent className="text-sm space-y-2">
          <ul className="list-disc ml-6 space-y-2">
            <li>Air resistance is neglected.</li>
            <li>Acceleration due to gravity is 9.8 m/s².</li>
            <li>Maximum range occurs at 45°.</li>
            <li>Complementary angles give equal range.</li>
          </ul>
        </CardContent>
      </Card>

    </div>
  );
};

export default ProjectileMotionTheory;