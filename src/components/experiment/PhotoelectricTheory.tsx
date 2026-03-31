import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Target,
  BookOpen,
  Beaker,
  Lightbulb,
  Zap,
} from "lucide-react";

const PhotoelectricTheory = () => {
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
            To determine Planck's constant by studying the phenomenon of the
            photoelectric effect, using the relationship between the stopping
            potential and the frequency of incident light.
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
            <h4 className="font-semibold mb-2">Photoelectric Effect</h4>
            <p className="text-muted-foreground leading-relaxed">
              When light of sufficient frequency strikes a metal surface,
              electrons are emitted from the surface. This phenomenon is called
              the photoelectric effect. The emitted electrons are called
              photoelectrons. The number of photoelectrons depends on the
              intensity of light, while their maximum kinetic energy depends
              only on the frequency of incident light.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Einstein's Photoelectric Equation</h4>
            <p className="text-muted-foreground leading-relaxed">
              Einstein explained this effect by treating light as consisting of
              discrete quanta (photons), each carrying energy E = hν. When a
              photon is absorbed by an electron, part of its energy is used to
              overcome the work function (eφ) and the rest appears as the
              kinetic energy of the emitted electron.
            </p>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Key Equations
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-background rounded-lg">
                <p className="font-mono text-sm font-semibold text-center">hν = eVs + eφ</p>
                <p className="text-xs text-muted-foreground text-center mt-1">Einstein's photoelectric equation</p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="font-mono text-sm font-semibold text-center">Vs = (h/e)ν − φ</p>
                <p className="text-xs text-muted-foreground text-center mt-1">Stopping potential vs frequency (linear)</p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="font-mono text-sm font-semibold text-center">h = e × (ΔVs / Δν)</p>
                <p className="text-xs text-muted-foreground text-center mt-1">Planck's constant from slope of Vs-ν graph</p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="font-mono text-sm font-semibold text-center">ν = c / λ</p>
                <p className="text-xs text-muted-foreground text-center mt-1">Frequency from wavelength (c = 3×10⁸ m/s)</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Stopping Potential</h4>
            <p className="text-muted-foreground leading-relaxed">
              The stopping potential (Vs) is the minimum negative voltage
              applied to the collector that brings the photocurrent to zero. It
              measures the maximum kinetic energy of the emitted
              photoelectrons: Ee = eVs. By plotting Vs against frequency ν,
              the slope gives h/e, from which Planck's constant h can be
              determined.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Work Function</h4>
            <p className="text-muted-foreground leading-relaxed">
              The work function (φ) is the minimum energy required to liberate
              an electron from the metal surface. When the graph of Vs vs ν is
              extrapolated to Vs = 0, the x-intercept gives the threshold
              frequency ν₀, below which no emission occurs. The work function
              is eφ = hν₀.
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
              "Planck's constant measuring instrument",
              "Planck's constant measuring set-up",
              "Red filter (635 nm)",
              "Yellow I filter (570 nm)",
              "Yellow II filter (540 nm)",
              "Green filter (500 nm)",
              "Blue filter (460 nm)",
              "Lens cover cap",
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
              Operate the instrument in a dry, cool indoor space away from
              direct sunlight.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              The phototube should never be exposed to bright light; dim the
              room before installation.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Ensure voltage and current are zeroed before inserting each
              color filter.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              After the experiment, switch off the power and cover the
              drawtube with the lens cap.
            </li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PhotoelectricTheory;
