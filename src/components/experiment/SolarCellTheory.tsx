import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Target,
  BookOpen,
  Beaker,
  Lightbulb,
  Zap
} from "lucide-react";

const SolarCellTheory = () => {
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
            To study the V-I characteristics of a solar cell and determine its 
            Fill Factor (FF), which indicates the efficiency of the solar cell 
            in converting light energy into electrical energy.
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
            <h4 className="font-semibold mb-2">Solar Cell</h4>
            <p className="text-muted-foreground leading-relaxed">
              A solar cell is a semiconductor device that converts light energy 
              directly into electrical energy using the photovoltaic effect. 
              It consists of a p-n junction diode made from semiconductor materials 
              such as silicon.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Working Principle</h4>
            <p className="text-muted-foreground leading-relaxed">
              When light photons strike the p-n junction, they transfer energy 
              to electrons, creating electron-hole pairs. These charge carriers 
              are separated by the built-in electric field of the junction, 
              producing a voltage known as the photo-voltage. When a load is 
              connected, current flows through the external circuit.
            </p>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Fill Factor Equation
            </h4>

            <div className="font-mono text-center text-lg my-4 p-4 bg-background rounded-lg">
              FF = (Vmax × Imax) / (Voc × Isc)
            </div>

            <p className="text-sm text-muted-foreground">
              Where Voc is open-circuit voltage, Isc is short-circuit current, 
              Vmax and Imax correspond to the voltage and current at maximum power output.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">V-I Characteristics</h4>
            <p className="text-muted-foreground leading-relaxed">
              The V-I characteristic curve of a solar cell shows how the voltage 
              varies with current for different load conditions. From this curve 
              we determine the maximum power point which is used to calculate 
              the fill factor.
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
              "Solar cell module",
              "Lamp (100W or 200W)",
              "Variable load resistance",
              "Digital voltmeter",
              "Milliammeter",
              "Connecting wires",
              "Trainer kit for solar cell",
              "Wooden scale for distance measurement"
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
              Ensure the lamp light falls directly on the solar cell.
            </li>

            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Maintain constant distance between lamp and solar cell.
            </li>

            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Record readings only after the voltmeter stabilizes.
            </li>

            <li className="flex items-start gap-2">
              <span className="text-amber-500">•</span>
              Avoid overheating the solar cell during the experiment.
            </li>
          </ul>
        </CardContent>
      </Card>

    </motion.div>
  );
};

export default SolarCellTheory;