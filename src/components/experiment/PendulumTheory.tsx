import { motion } from "framer-motion";
import { Card,CardContent,CardHeader,CardTitle } from "@/components/ui/card";
import { Target,BookOpen,Beaker,Lightbulb } from "lucide-react";

const PendulumTheory = () => {

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
To determine the acceleration due to gravity using a simple pendulum.
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
A simple pendulum consists of a small bob suspended by a light string.
When displaced slightly it oscillates with a definite time period.
</p>

<div className="bg-muted p-4 rounded-lg text-center font-mono text-lg">
T = 2π √(L / g)
</div>

<p>
Where T is time period, L is length of pendulum and g is acceleration due to gravity.
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

<li>Pendulum stand</li>
<li>Bob</li>
<li>Thread</li>
<li>Stopwatch</li>
<li>Meter scale</li>

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
Ensure oscillations are small so motion remains simple harmonic.
</CardContent>

</Card>

</motion.div>

)

}

export default PendulumTheory