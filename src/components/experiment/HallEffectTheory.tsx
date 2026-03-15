import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, BookOpen, Beaker, Lightbulb } from "lucide-react";

const HallEffectTheory = () => {
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
          To determine the Hall coefficient of a semiconductor and identify the type of charge carriers.
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
            When a current carrying semiconductor is placed in a magnetic field,
            a potential difference is produced across the material.
          </p>

          <div className="bg-muted p-4 rounded-lg text-center font-mono text-lg">
            RH = (VH × t) / (I × B)
          </div>

          <p>
            Where RH is Hall coefficient, VH is Hall voltage, I is current,
            B is magnetic field and t is thickness of the semiconductor.
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
            <li>Hall probe</li>
            <li>Electromagnet</li>
            <li>Current source</li>
            <li>Gauss meter</li>
            <li>Voltmeter</li>
            <li>Semiconductor sample</li>
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
          Ensure the magnetic field is stable before recording Hall voltage.
        </CardContent>
      </Card>

    </motion.div>
  );
};

export default HallEffectTheory;