import { useState } from "react";
import { motion } from "framer-motion";
import { Card,CardContent,CardHeader,CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Triangle,Download } from "lucide-react";

interface Row{
sNo:number
angle:number
weight:number
force:number
}

const InclinedPlaneSimulator=()=>{

const [angle,setAngle]=useState(10)
const [weight,setWeight]=useState(20)

const [rows,setRows]=useState<Row[]>([])

const g=9.8
const m=2

const force = m*g*Math.sin(angle*Math.PI/180)

const record=()=>{

setRows(prev=>[
...prev,
{
sNo:prev.length+1,
angle,
weight,
force:Number(force.toFixed(3))
}
])

}

const download=()=>{

const csv=[
["S.No","Angle","Weight","Force"],
...rows.map(r=>[r.sNo,r.angle,r.weight,r.force])
].map(r=>r.join(",")).join("\n")

const blob=new Blob([csv],{type:"text/csv"})
const url=URL.createObjectURL(blob)

const a=document.createElement("a")
a.href=url
a.download="inclined_plane_data.csv"
a.click()

}

return(

<div className="space-y-6">

<Card className="glass-card border-0">

<CardHeader>
<CardTitle className="flex gap-2 items-center">
<Triangle className="w-5 h-5 text-primary"/>
Controls
</CardTitle>
</CardHeader>

<CardContent className="space-y-4">

<div>

Angle

<Slider
value={[angle]}
min={0}
max={60}
step={1}
onValueChange={([v])=>setAngle(v)}
/>

<p>{angle}°</p>

</div>

<div>

Hanging Weight

<Slider
value={[weight]}
min={5}
max={100}
step={5}
onValueChange={([v])=>setWeight(v)}
/>

<p>{weight} g</p>

</div>

</CardContent>

</Card>


<Card className="glass-card border-0">

<CardHeader>
<CardTitle>Inclined Plane Setup</CardTitle>
</CardHeader>

<CardContent>

<div className="bg-white border rounded-xl p-4">

<svg viewBox="0 0 800 350" className="w-full">

{/* plane */}

<line
x1="200"
y1="250"
x2="600"
y2={250-angle*2}
stroke="brown"
strokeWidth="6"
/>

{/* block */}

<motion.rect
x="350"
y="200"
width="40"
height="30"
fill="gray"
animate={{x:angle*2}}
transition={{duration:1}}
/>

{/* pulley */}

<circle cx="600" cy={250-angle*2} r="15" stroke="black" fill="white"/>

{/* hanging mass */}

<line
x1="600"
y1={250-angle*2}
x2="600"
y2="300"
stroke="black"
/>

<circle cx="600" cy="320" r="10" fill="black"/>

</svg>

</div>

</CardContent>

</Card>


<Card className="glass-card border-0">

<CardHeader>
<CardTitle>Observations</CardTitle>
</CardHeader>

<CardContent>

<div className="flex gap-3 mb-4">

<Button onClick={record}>
Record Reading
</Button>

<Button variant="outline" onClick={download}>
<Download className="w-4 h-4 mr-2"/>
CSV
</Button>

</div>

<table className="w-full text-sm">

<thead>

<tr className="border-b">
<th>S.No</th>
<th>Angle</th>
<th>Weight</th>
<th>Force</th>
</tr>

</thead>

<tbody>

{rows.map(r=>(
<tr key={r.sNo} className="text-center border-b">
<td>{r.sNo}</td>
<td>{r.angle}</td>
<td>{r.weight}</td>
<td>{r.force}</td>
</tr>
))}

</tbody>

</table>

</CardContent>

</Card>

</div>

)

}

export default InclinedPlaneSimulator;