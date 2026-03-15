import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, BookOpen, Beaker, Lightbulb } from "lucide-react";

const ThermistorTheory = () => {
  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="space-y-6">

      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex gap-3 items-center">
            <Target className="w-5 h-5 text-primary"/>
            Objective
          </CardTitle>
        </CardHeader>
        <CardContent>
          To study the temperature vs resistance characteristics of a thermistor.
        </CardContent>
      </Card>

      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex gap-3 items-center">
            <BookOpen className="w-5 h-5 text-primary"/>
            Theory
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <p>
            A thermistor is a temperature sensitive resistor whose resistance
            varies significantly with temperature.
          </p>

          <p>
            Thermistors are made from semiconductor materials such as
            oxides of nickel, cobalt and manganese.
          </p>

          <div className="bg-muted p-4 rounded-lg text-center font-mono text-lg">
            R = V / I
          </div>

          <p>
            Most thermistors used in experiments are NTC thermistors,
            meaning their resistance decreases as temperature increases.
          </p>

        </CardContent>
      </Card>

      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex gap-3 items-center">
            <Beaker className="w-5 h-5 text-primary"/>
            Apparatus Required
          </CardTitle>
        </CardHeader>

        <CardContent>
          <ul className="grid md:grid-cols-2 gap-2">
            <li>Thermistor kit</li>
            <li>Thermometer</li>
            <li>Voltmeter</li>
            <li>Ammeter</li>
            <li>Power supply</li>
            <li>Connecting wires</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="glass-card border-0 bg-amber-500/5 border-amber-500/20">
        <CardHeader>
          <CardTitle className="flex gap-3 items-center text-amber-600">
            <Lightbulb className="w-5 h-5"/>
            Tips
          </CardTitle>
        </CardHeader>

        <CardContent>
          Do not exceed temperature beyond 90°C to avoid damaging the thermistor.
        </CardContent>
      </Card>

    </motion.div>
  );
};

export default ThermistorTheory;