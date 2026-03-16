import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Target,
  BookOpen,
  Beaker,
  Lightbulb,
  Zap,
} from "lucide-react";

const HeisenbergTheory = () => {
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
            To observe the single-slit diffraction pattern produced by a laser,
            calculate the slit width from the pattern, and verify Heisenberg's
            Uncertainty Principle by confirming that Δy · Δp ≈ h.
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
            <h4 className="font-semibold mb-2">Heisenberg's Uncertainty Principle</h4>
            <p className="text-muted-foreground leading-relaxed">
              The Heisenberg Uncertainty Principle states that it is
              fundamentally impossible to know simultaneously both the exact
              position and the exact momentum of a particle. The more precisely
              one is known, the less precisely the other can be determined. This
              is not a limitation of measurement instruments — it is an inherent
              property of quantum systems.
            </p>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Key Equations
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-background rounded-lg">
                <p className="font-mono text-sm font-semibold text-center">Δx · Δp ≥ h / 4π</p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Heisenberg's uncertainty relation
                </p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="font-mono text-sm font-semibold text-center">d sinθₘ = nλ</p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Single-slit diffraction minima condition
                </p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="font-mono text-sm font-semibold text-center">Δpᵧ = (h/λ) sin(tan⁻¹(a/D))</p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Uncertainty in momentum from diffraction spread
                </p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="font-mono text-sm font-semibold text-center">Δy · Δpᵧ = h</p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Verified result confirming the uncertainty principle
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Single-Slit Diffraction and Uncertainty</h4>
            <p className="text-muted-foreground leading-relaxed">
              When a monochromatic laser beam passes through a single slit of
              width d, the position of the photon in the vertical direction is
              uncertain by Δy = d (the slit width). The diffraction that results
              shows that the photon acquires an uncertainty in vertical momentum
              Δpᵧ. The angle θ₁ of the first minimum is given by sinθ₁ = λ/d.
              Combining with de Broglie's relation λ = h/pₓ, it can be shown
              that Δy · Δpᵧ = h, verifying the uncertainty principle.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Slit Width Calculation</h4>
            <p className="text-muted-foreground leading-relaxed">
              The slit width d is determined from the diffraction pattern using
              d = nλ / sinθₘ, where θₘ = tan⁻¹(a/D), a is the distance from
              the central maximum to the nth minimum, and D is the distance from
              the slit to the detector screen.
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
              "Optical rail",
              "Diode laser (λ = 655 nm)",
              "Kinematic laser mount",
              "Power supply for laser",
              "Cell mount with single-slit box",
              "Pinhole photodetector",
              "Output measurement unit",
              "Linear translation stage with micrometer",
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
              Never look directly into the laser beam — serious eye damage can
              result.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Place the slit vertically on the rail track so that the
              diffraction pattern spreads horizontally.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Scan the full pattern slowly from one extreme to the other using
              the micrometer stage for accurate minima positions.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Repeat the experiment with slits of different widths to observe
              how momentum distribution changes with position uncertainty.
            </li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HeisenbergTheory;
