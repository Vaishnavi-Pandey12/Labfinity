import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Target, BookOpen, Beaker, ListChecks, Lightbulb, Zap } from "lucide-react";

const RefractionTheory = () => {
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
          To study the refraction of light when it passes from one medium to
          another and verify Snell’s Law by observing the relationship between
          sin θ₁ and sin θ₂.
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
          <p className="text-muted-foreground leading-relaxed">
            Refraction occurs when light travels from one medium to another
            because its speed changes. The bending of light depends on the
            refractive indices of the two media.
          </p>

          <div className="bg-primary/5 p-4 rounded-xl">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Snell’s Law
            </h4>

            <div className="font-mono text-center text-lg my-4 p-4 bg-background rounded-lg">
              n₁ sin θ₁ = n₂ sin θ₂
            </div>

            <p className="text-sm text-muted-foreground">
              Where n₁ and n₂ are refractive indices of the two media,
              θ₁ is the angle of incidence and θ₂ is the angle of refraction.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Refractive Index</h4>
            <p className="text-muted-foreground">
              Refractive index (n) is defined as the ratio of the speed of light
              in vacuum to its speed in a medium.
            </p>
            <div className="font-mono text-center p-4 bg-muted rounded-lg">
              n = c / v
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
          <ul className="grid md:grid-cols-2 gap-3 text-muted-foreground">
            <li>• Ray box / laser source</li>
            <li>• Glass slab or acrylic block</li>
            <li>• Protractor</li>
            <li>• White sheet of paper</li>
            <li>• Pencil & scale</li>
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
              <AccordionTrigger>
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    1
                  </span>
                  Setup
                </span>
              </AccordionTrigger>
              <AccordionContent className="pl-11 text-muted-foreground">
                Place the glass slab on paper and draw its outline. Shine a ray
                of light at a chosen angle of incidence.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step2">
              <AccordionTrigger>
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    2
                  </span>
                  Measure Angles
                </span>
              </AccordionTrigger>
              <AccordionContent className="pl-11 text-muted-foreground">
                Measure angle of incidence and angle of refraction using a protractor.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step3">
              <AccordionTrigger>
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    3
                  </span>
                  Verification
                </span>
              </AccordionTrigger>
              <AccordionContent className="pl-11 text-muted-foreground">
                Calculate sin θ₁ and sin θ₂ and verify that their ratio remains constant.
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="glass-card border-0 bg-amber-500/5 border-amber-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display text-amber-600">
            <Lightbulb className="w-5 h-5" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2">
          <p>• Light bends towards normal when entering denser medium.</p>
          <p>• Light bends away from normal in rarer medium.</p>
          <p>• If θ₁ exceeds critical angle, total internal reflection occurs.</p>
        </CardContent>
      </Card>

    </motion.div>
  );
};

export default RefractionTheory;
