import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, BookOpen, Beaker, Lightbulb } from "lucide-react";

const ThomsonTheory = () => {

return(

<motion.div
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
className="space-y-6"
>

<Card className="glass-card border-0">

<CardHeader>
<CardTitle className="flex items-center gap-2">
<Target className="w-5 h-5 text-primary"/>
Objective
</CardTitle>
</CardHeader>

<CardContent>
To determine the charge to mass ratio (e/m) of an electron using Thomson method.
</CardContent>

</Card>


<Card className="glass-card border-0">

<CardHeader>
<CardTitle className="flex items-center gap-2">
<BookOpen className="w-5 h-5 text-primary"/>
Theory
</CardTitle>
</CardHeader>

<CardContent className="space-y-4">

<p>
When electrons move through perpendicular electric and magnetic fields,
they experience Lorentz force causing circular motion.
</p>

<div className="bg-muted p-4 rounded-lg text-center font-mono text-lg">
e/m = 2V / (B² r²)
</div>

<p>
Where V is accelerating voltage, B magnetic field and r radius of electron path.
</p>

</CardContent>

</Card>


<Card className="glass-card border-0">

<CardHeader>
<CardTitle className="flex items-center gap-2">
<Beaker className="w-5 h-5 text-primary"/>
Apparatus
</CardTitle>
</CardHeader>

<CardContent>

<ul className="grid md:grid-cols-2 gap-2">

<li>CRT tube</li>
<li>Helmholtz coils</li>
<li>Power supply</li>
<li>Voltmeter</li>
<li>Ammeter</li>
<li>Connecting wires</li>

</ul>

</CardContent>

</Card>


<Card className="glass-card border-0 bg-amber-500/5 border-amber-500/20">

<CardHeader>
<CardTitle className="flex items-center gap-2 text-amber-600">
<Lightbulb className="w-5 h-5"/>
Tips
</CardTitle>
</CardHeader>

<CardContent>
Ensure the electron beam forms a clear circular path before recording readings.
</CardContent>

</Card>

</motion.div>

)

}

export default ThomsonTheory