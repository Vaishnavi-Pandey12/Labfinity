import { useState } from "react";
import { motion } from "framer-motion";
import { Card,CardContent,CardHeader,CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Atom,Download } from "lucide-react";

interface Row{
sNo:number
voltage:number
field:number
radius:number
em:number
}

const ThomsonSimulator = ()=>{

const [voltage,setVoltage]=useState(200)
const [field,setField]=useState(0.5)

const [rows,setRows]=useState<Row[]>([])

const radius = voltage/(field*20)

const em = (2*voltage)/(field*field*radius*radius)

const record=()=>{

setRows(prev=>[
...prev,
{
sNo:prev.length+1,
voltage,
field,
radius:Number(radius.toFixed(3)),
em:Number(em.toFixed(4))
}
])

}

const downloadCSV=()=>{

const csv=[
["S.No","Voltage","Magnetic Field","Radius","e/m"],
...rows.map(r=>[r.sNo,r.voltage,r.field,r.radius,r.em])
].map(r=>r.join(",")).join("\n")

const blob=new Blob([csv],{type:"text/csv"})
const url=URL.createObjectURL(blob)

const a=document.createElement("a")
a.href=url
a.download="thomson_em_data.csv"
a.click()

}

return(

<div className="space-y-6">

<Card className="glass-card border-0">

<CardHeader>
<CardTitle className="flex items-center gap-2">
<Atom className="w-5 h-5 text-primary"/>
Controls
</CardTitle>
</CardHeader>

<CardContent className="space-y-4">

<div>

Voltage

<Slider
value={[voltage]}
min={100}
max={500}
step={10}
onValueChange={([v])=>setVoltage(v)}
/>

<p>{voltage} V</p>

</div>


<div>

Magnetic Field

<Slider
value={[field]}
min={0.1}
max={2}
step={0.1}
onValueChange={([v])=>setField(v)}
/>

<p>{field} T</p>

</div>

</CardContent>

</Card>


<Card className="glass-card border-0">

<CardHeader>
<CardTitle>CRT Tube</CardTitle>
</CardHeader>

<CardContent>

<div className="bg-black rounded-xl p-4">

<svg viewBox="0 0 800 350" className="w-full">

<rect x="50" y="80" width="700" height="200" rx="50" fill="#111827"/>

<motion.circle
cx="400"
cy="180"
r={radius}
stroke="lime"
strokeWidth="2"
fill="none"
/>

<motion.circle
cx={400+radius}
cy="180"
r="5"
fill="lime"
animate={{rotate:360}}
transition={{repeat:Infinity,duration:3}}
style={{originX:"400px",originY:"180px"}}
/>

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

<Button variant="outline" onClick={downloadCSV}>
<Download className="w-4 h-4 mr-2"/>
Download CSV
</Button>

</div>

<table className="w-full text-sm">

<thead>

<tr className="border-b">

<th>S.No</th>
<th>Voltage</th>
<th>Magnetic Field</th>
<th>Radius</th>
<th>e/m</th>

</tr>

</thead>

<tbody>

{rows.map(r=>(
<tr key={r.sNo} className="text-center border-b">
<td>{r.sNo}</td>
<td>{r.voltage}</td>
<td>{r.field}</td>
<td>{r.radius}</td>
<td>{r.em}</td>
</tr>
))}

</tbody>

</table>

</CardContent>

</Card>

</div>

)

}

export default ThomsonSimulator