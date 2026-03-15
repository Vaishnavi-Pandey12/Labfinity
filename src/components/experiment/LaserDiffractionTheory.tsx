import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Target,
  BookOpen,
  Beaker,
  Lightbulb,
  Zap,
} from "lucide-react";

const LaserDiffractionTheory = () => {
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
            To determine the wavelength of a given laser source by studying the
            diffraction pattern produced by a diffraction grating, using the
            grating equation nλ = d sinθ.
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
            <h4 className="font-semibold mb-2">Diffraction</h4>
            <p className="text-muted-foreground leading-relaxed">
              Diffraction is the bending and spreading of waves around sharp
              edges, corners, or through small openings. The diffraction effect
              is significant when the size of the obstacle or aperture is
              comparable to the wavelength of the light. When laser light passes
              through a diffraction grating, it produces a pattern of bright
              spots (maxima) on a screen.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Diffraction Grating</h4>
            <p className="text-muted-foreground leading-relaxed">
              A diffraction grating consists of many parallel, equidistant,
              equally-sized lines ruled on glass or polished metal with a
              diamond point. When monochromatic light falls on it, constructive
              interference occurs at specific angles, producing discrete bright
              fringes of different orders symmetrically about the zeroth order.
            </p>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Key Equations
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-background rounded-lg">
                <p className="font-mono text-sm font-semibold text-center">nλ = d sinθ</p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Grating equation — n: order, d: grating spacing, θ: diffraction angle
                </p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="font-mono text-sm font-semibold text-center">θ = tan⁻¹(y / D)</p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  y: distance from central max to nth order spot, D: grating-to-screen distance
                </p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="font-mono text-sm font-semibold text-center">d = 1 / (lines per cm)</p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Grating spacing from number of lines per unit length
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">LASER</h4>
            <p className="text-muted-foreground leading-relaxed">
              LASER stands for Light Amplification by the Stimulated Emission
              of Radiation. Laser light is monochromatic (single wavelength),
              coherent, and highly directional, making it ideal for diffraction
              experiments as it produces sharp, well-defined diffraction
              patterns.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Diffraction Spectrum Characteristics</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li><strong>Symmetry:</strong> Orders appear symmetrically on both sides of the zeroth order</li>
              <li><strong>Sharpness:</strong> Spectral lines are straight and sharp</li>
              <li><strong>Dispersion:</strong> Lines become more spread out at higher orders</li>
              <li><strong>Intensity:</strong> Most intensity is in the zeroth order; higher orders are dimmer</li>
            </ul>
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
              "Laser source",
              "Diffraction grating (2500 lines/inch)",
              "Optical rail / test bench",
              "Screen with mm graph paper",
              "Grating stand",
              "Measuring scale",
              "Graph sheets",
              "Soft pencil for marking spots",
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
              Never look directly into the laser beam — it is extremely
              dangerous for the eyes.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Ensure the laser beam falls exactly perpendicular to the grating
              surface for accurate results.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Measure y carefully as the distance from the zeroth order to each
              bright spot, not between spots.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Switch off the laser after completing the experiment to prevent
              accidental exposure.
            </li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LaserDiffractionTheory;
