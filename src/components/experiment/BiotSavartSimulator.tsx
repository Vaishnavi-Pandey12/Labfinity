import { useState } from "react";
import { motion } from "framer-motion";
import { Card,CardContent,CardHeader,CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Compass,Download } from "lucide-react";

interface Row{
sNo:number
current:number
field:number
}

const BiotSavartSimulator = ()=>{

const [current,setCurrent] = useState(2)

const [rows,setRows] = useState<Row[]>([])

const field = current * 0.05

const record=()=>{

setRows(prev=>[
...prev,
{
sNo:prev.length+1,
current,
field:Number(field.toFixed(4))
}
])

}

const downloadCSV=()=>{

const csv=[
["S.No","Current","Magnetic Field"],
...rows.map(r=>[r.sNo,r.current,r.field])
].map(r=>r.join(",")).join("\n")

const blob=new Blob([csv],{type:"text/csv"})
const url=URL.createObjectURL(blob)

const a=document.createElement("a")
a.href=url
a.download="biot_savart_data.csv"
a.click()

}

return(

<div className="space-y-6">

<Card className="glass-card border-0">

<CardHeader>
<CardTitle className="flex items-center gap-2">
<Compass className="w-5 h-5 text-primary"/>
Current Control
</CardTitle>
</CardHeader>

<CardContent>

<Slider
value={[current]}
min={0}
max={10}
step={0.1}
onValueChange={([v])=>setCurrent(v)}
/>

<p className="text-sm mt-2">
Current: {current} A
</p>

</CardContent>

</Card>


<Card className="glass-card border-0">

<CardHeader>
<CardTitle>Biot Savart Setup</CardTitle>
</CardHeader>

<CardContent>

<div className="bg-white rounded-xl border p-4">

<svg viewBox="0 0 800 350" className="w-full">

{/* circular coil */}

<circle
cx="400"
cy="170"
r="100"
stroke="black"
strokeWidth="4"
fill="none"
/>

{/* compass */}

<circle cx="400" cy="170" r="30" fill="white" stroke="black"/>

<motion.line
x1="400"
y1="170"
x2="400"
y2="140"
stroke="red"
strokeWidth="3"
animate={{rotate:field*20}}
style={{originX:"400px",originY:"170px"}}
/>

{/* current label */}

<text x="400" y="60" textAnchor="middle">
Current {current} A
</text>

{/* magnetic field */}

<text x="400" y="310" textAnchor="middle">
Magnetic Field {field.toFixed(4)} T
</text>

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
<th>Current</th>
<th>Magnetic Field</th>

</tr>

</thead>

<tbody>

{rows.map(r=>(
<tr key={r.sNo} className="text-center border-b">
<td>{r.sNo}</td>
<td>{r.current}</td>
<td>{r.field}</td>
</tr>
))}

</tbody>

</table>

</CardContent>

</Card>

</div>

)

}

export default BiotSavartSimulator