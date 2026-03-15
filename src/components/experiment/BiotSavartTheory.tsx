import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, BookOpen, Beaker, Lightbulb } from "lucide-react";

const BiotSavartTheory = () => {

return(

<motion.div
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
className="space-y-6"
>

<Card className="glass-card border-0">

<CardHeader>
<CardTitle className="flex gap-2 items-center">
<Target className="w-5 h-5 text-primary"/>
Objective
</CardTitle>
</CardHeader>

<CardContent>
To verify Biot–Savart law and study the magnetic field produced by a circular current carrying coil.
</CardContent>

</Card>


<Card className="glass-card border-0">

<CardHeader>
<CardTitle className="flex gap-2 items-center">
<BookOpen className="w-5 h-5 text-primary"/>
Theory
</CardTitle>
</CardHeader>

<CardContent className="space-y-4">

<p>
Biot–Savart law states that the magnetic field produced by a current element
is proportional to the current and inversely proportional to the square of
the distance from the element.
</p>

<div className="bg-muted p-4 rounded-lg text-center font-mono text-lg">
B = μ₀ I / (2R)
</div>

<p>
Where B is magnetic field, I is current and R is radius of the coil.
</p>

</CardContent>

</Card>


<Card className="glass-card border-0">

<CardHeader>
<CardTitle className="flex gap-2 items-center">
<Beaker className="w-5 h-5 text-primary"/>
Apparatus
</CardTitle>
</CardHeader>

<CardContent>

<ul className="grid md:grid-cols-2 gap-2">

<li>Circular coil</li>
<li>DC power supply</li>
<li>Ammeter</li>
<li>Rheostat</li>
<li>Compass</li>
<li>Connecting wires</li>

</ul>

</CardContent>

</Card>


<Card className="glass-card border-0 bg-amber-500/5 border-amber-500/20">

<CardHeader>
<CardTitle className="flex gap-2 items-center text-amber-600">
<Lightbulb className="w-5 h-5"/>
Tips
</CardTitle>
</CardHeader>

<CardContent>

Ensure the compass is placed exactly at the centre of the coil.

</CardContent>

</Card>

</motion.div>

)

}

export default BiotSavartTheory