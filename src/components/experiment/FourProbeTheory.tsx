import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Target,
  BookOpen,
  Beaker,
  Lightbulb,
  Zap,
} from "lucide-react";

const FourProbeTheory = () => {
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
            To determine the energy band gap of a semiconductor (Germanium)
            using the four-probe method by studying the temperature dependence
            of its electrical resistivity.
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
            <h4 className="font-semibold mb-2">Semiconductors and Band Gap</h4>
            <p className="text-muted-foreground leading-relaxed">
              Semiconductors have electrical conductivity intermediate between
              conductors and insulators. Unlike metals, their resistivity
              decreases with increasing temperature. According to band theory,
              electrons must cross an energy gap (Eg) from the valence band to
              the conduction band to participate in electrical conduction. At
              absolute zero, the conduction band is empty and resistance is
              infinite. As temperature rises, more electrons are thermally
              excited across this gap, increasing conductivity.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Four-Probe Method</h4>
            <p className="text-muted-foreground leading-relaxed">
              The four-probe method eliminates contact resistance errors that
              occur in two-probe measurements. The outer two probes pass a
              constant current through the sample, while the inner two probes
              measure the voltage drop across it. Since no current flows through
              the voltage probes, contact resistance does not affect the
              measurement.
            </p>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Key Equations
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-background rounded-lg">
                <p className="font-mono text-sm font-semibold text-center">ρ = ρ₀ · exp(Eg / 2kT)</p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Temperature dependence of resistivity in semiconductors
                </p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="font-mono text-sm font-semibold text-center">ln R = (Eg / 2k) · (1/T) + ln R₀</p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Linear equation — slope = Eg / 2k from ln R vs 1/T graph
                </p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="font-mono text-sm font-semibold text-center">Eg = 2k × slope</p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  k = Boltzmann's constant = 8.617 × 10⁻⁵ eV/K
                </p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="font-mono text-sm font-semibold text-center">R = V / I</p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Resistance from measured voltage and constant current (I = 5 mA)
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Energy Band Gap</h4>
            <p className="text-muted-foreground leading-relaxed">
              The energy band gap Eg is the minimum energy required for an
              electron to jump from the valence band to the conduction band. By
              plotting ln R on the Y-axis against 1/T on the X-axis, a straight
              line is obtained. The slope of this line equals Eg/2k, from which
              Eg can be calculated. For Germanium, the expected value is
              approximately 0.67 eV.
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
              "Four-probe setup",
              "Semiconductor sample (Germanium)",
              "Constant current power supply",
              "Digital panel meter (mA / mV)",
              "Oven (0–100°C)",
              "Thermometer",
              "Connecting wires",
              "Four-probe set-up unit",
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
              Apply gentle, uniform pressure on the four probes onto the
              semiconductor sample — excessive pressure can damage the sample.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Keep the current constant at 5 mA throughout all measurements
              to ensure consistent resistance calculations.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Record voltage readings only after the temperature has
              stabilized at each step to avoid transient errors.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Switch off the oven power after all readings are complete and
              allow the setup to cool before disassembling.
            </li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FourProbeTheory;
