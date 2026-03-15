import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Target,
  BookOpen,
  Beaker,
  Lightbulb,
  Zap,
} from "lucide-react";

const LEDTheory = () => {
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
            To study the V-I characteristics of different Light Emitting Diodes
            (LEDs), determine the knee voltage for each colour, and calculate
            the wavelength of emitted light using the relation λ = hc / eVK.
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
            <h4 className="font-semibold mb-2">Light Emitting Diode (LED)</h4>
            <p className="text-muted-foreground leading-relaxed">
              A Light Emitting Diode is a special type of p-n junction
              semiconductor diode made from a direct band gap semiconductor.
              When forward biased, electrons from the N-region migrate into the
              P-region and recombine with holes. This electron-hole
              recombination releases energy in the form of photons — a process
              called electroluminescence. The energy of the emitted photon
              equals the band gap energy of the semiconductor material.
            </p>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Key Equations
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-background rounded-lg">
                <p className="font-mono text-sm font-semibold text-center">E = hν = hc / λ</p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Energy of emitted photon
                </p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="font-mono text-sm font-semibold text-center">eVK = hc / λ</p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  At knee voltage VK, electrical energy equals photon energy
                </p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="font-mono text-sm font-semibold text-center">λ = hc / eVK</p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Wavelength from knee voltage — h = 6.63×10⁻³⁴ J·s, c = 3×10⁸ m/s, e = 1.602×10⁻¹⁹ C
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Knee Voltage</h4>
            <p className="text-muted-foreground leading-relaxed">
              The knee voltage (VK) is the forward voltage at which the LED
              starts conducting significantly and emitting light. It is
              determined from the V-I characteristic curve by drawing a tangent
              at the bend (knee) of the curve and noting where it intersects
              the voltage axis. Different LED colours have different knee
              voltages because they use different semiconductor materials with
              different band gaps.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Semiconductor Materials and LED Colours</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li><strong>GaAs (Gallium Arsenide):</strong> Infrared emission</li>
              <li><strong>GaAsP (Gallium Arsenide Phosphide):</strong> Red, Orange, Yellow</li>
              <li><strong>GaN (Gallium Nitride):</strong> Green and Blue</li>
              <li><strong>InGaN (Indium Gallium Nitride):</strong> Blue, Green, White</li>
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
              "LED characteristics trainer kit",
              "Red LED",
              "Yellow LED",
              "Green LED",
              "Blue LED",
              "Digital voltmeter",
              "Milliammeter",
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
              Keep the voltage knob at minimum before switching on to protect
              the LED from excessive current.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Increase voltage slowly in small steps — sudden large voltage
              changes can permanently damage the LED.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Draw the tangent carefully at the knee of the V-I curve for an
              accurate knee voltage reading — errors here directly affect the
              calculated wavelength.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Switch off all appliances when not taking readings to prevent
              overheating.
            </li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LEDTheory;
