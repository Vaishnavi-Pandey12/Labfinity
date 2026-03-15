import { motion } from "framer-motion";
import { Card,CardContent,CardHeader,CardTitle } from "@/components/ui/card";
import { Target,BookOpen,Beaker,Lightbulb } from "lucide-react";

const InclinedPlaneTheory = ()=>{

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
To study motion of a body on an inclined plane and verify the relation between force and angle of inclination.
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
An inclined plane is a flat surface tilted at an angle.
When an object is placed on the plane, gravity causes it to move downward.
</p>

<div className="bg-muted p-4 rounded-lg text-center font-mono text-lg">
F = mg sinθ
</div>

<p>
Where m is mass, g is acceleration due to gravity and θ is angle of incline.
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
<li>Inclined plane</li>
<li>Wooden block</li>
<li>Pulley</li>
<li>Hanging weights</li>
<li>Thread</li>
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
Ensure the block moves smoothly and friction is minimal during observations.
</CardContent>

</Card>

</motion.div>

)

}

export default InclinedPlaneTheory;