import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Sun, Download, RotateCcw, Zap } from "lucide-react";

interface Observation {
  sNo: number
  resistance: number
  voltage: number
  current: number
  power: number
}

const SolarCellSimulator = () => {

const [distance,setDistance] = useState(15)
const [resistance,setResistance] = useState(50)

const [voltage,setVoltage] = useState(0)
const [current,setCurrent] = useState(0)

const [rows,setRows] = useState<Observation[]>([])
const [connected,setConnected] = useState(false)

useEffect(()=>{

if(!connected) return

const intensity = 200/(distance*distance)

const Voc = 0.65 * intensity
const Isc = 40 * intensity

const V = Voc * (resistance/(resistance+40))
const I = Isc * (40/(resistance+40))

setVoltage(Number(V.toFixed(3)))
setCurrent(Number(I.toFixed(3)))

},[distance,resistance,connected])

const recordObservation = ()=>{

const power = voltage*current

setRows(prev=>[
...prev,
{
sNo:prev.length+1,
resistance,
voltage,
current,
power:Number(power.toFixed(3))
}
])

}

const resetExperiment = ()=>{
setRows([])
setConnected(false)
setVoltage(0)
setCurrent(0)
setDistance(15)
setResistance(50)
}

const downloadCSV = ()=>{

const csv=[
["S.No","Resistance","Voltage","Current","Power"],
...rows.map(r=>[r.sNo,r.resistance,r.voltage,r.current,r.power])
].map(r=>r.join(",")).join("\n")

const blob=new Blob([csv],{type:"text/csv"})
const url=URL.createObjectURL(blob)

const a=document.createElement("a")
a.href=url
a.download="solar_cell_data.csv"
a.click()

}

return(

<div className="space-y-6">

<Card className="glass-card border-0">

<CardHeader>
<CardTitle className="flex items-center gap-2">
<Sun className="w-5 h-5 text-primary"/>
Solar Cell Controls
</CardTitle>
</CardHeader>

<CardContent className="space-y-6">

<div>
<p className="text-sm font-medium">Lamp Distance</p>

<Slider
value={[distance]}
min={5}
max={50}
step={1}
onValueChange={([v])=>setDistance(v)}
/>

<p className="text-xs text-muted-foreground">
{distance} cm
</p>
</div>

<div>
<p className="text-sm font-medium">Load Resistance</p>

<Slider
value={[resistance]}
min={1}
max={200}
step={1}
onValueChange={([v])=>setResistance(v)}
/>

<p className="text-xs text-muted-foreground">
{resistance} Ω
</p>
</div>

<div className="flex gap-3">

<Button onClick={()=>setConnected(true)} disabled={connected}>
Connect Circuit
</Button>

<Button variant="outline" onClick={resetExperiment}>
<RotateCcw className="w-4 h-4 mr-2"/>
Reset
</Button>

</div>

</CardContent>

</Card>


<Card className="glass-card border-0">

<CardHeader>
<CardTitle className="flex items-center gap-2">
<Zap className="w-5 h-5 text-primary"/>
Virtual Solar Cell Setup
</CardTitle>
</CardHeader>

<CardContent>

<div className="bg-white border rounded-xl p-4">

<svg viewBox="0 0 800 350" className="w-full">

{/* lamp */}
<circle cx="120" cy="100" r="40" fill="#facc15"/>
<text x="120" y="160" textAnchor="middle">Lamp</text>

{/* photon animation */}

{connected && [...Array(6)].map((_,i)=>(
<motion.circle
key={i}
cx="160"
cy={90+i*10}
r="3"
fill="#facc15"
initial={{x:0}}
animate={{x:200}}
transition={{duration:1.5,repeat:Infinity,delay:i*0.3}}
/>
))}

{/* solar panel */}

<rect x="350" y="120" width="120" height="80" fill="#1e3a8a"/>
<text x="410" y="220" textAnchor="middle">Solar Cell</text>

{/* wire */}

<line x1="470" y1="160" x2="520" y2="160" stroke="black"/>

{/* rheostat */}

<rect x="520" y="150" width="60" height="20" fill="#9ca3af"/>
<text x="550" y="185" textAnchor="middle" fontSize="10">
Rheostat
</text>

{/* electron animation */}

{connected && [...Array(4)].map((_,i)=>(
<motion.circle
key={i}
cx="470"
cy="160"
r="3"
fill="blue"
initial={{x:0}}
animate={{x:180}}
transition={{duration:2,repeat:Infinity,delay:i*0.4}}
/>
))}

{/* ammeter */}

<circle cx="650" cy="160" r="25" fill="white" stroke="black"/>
<text x="650" y="165" textAnchor="middle" fontSize="11">
{connected?`${current} mA`:"0"}
</text>

{/* voltmeter */}

<circle cx="550" cy="70" r="25" fill="white" stroke="black"/>
<text x="550" y="75" textAnchor="middle" fontSize="11">
{connected?`${voltage} V`:"0"}
</text>

</svg>

</div>

</CardContent>

</Card>


{connected && (

<Card className="glass-card border-0">

<CardHeader>
<CardTitle>Record Observations</CardTitle>
</CardHeader>

<CardContent>

<div className="flex gap-3 mb-4">

<Button onClick={recordObservation}>
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
<th>Resistance</th>
<th>Voltage</th>
<th>Current</th>
<th>Power</th>
</tr>
</thead>

<tbody>

{rows.map(r=>(
<tr key={r.sNo} className="text-center border-b">
<td>{r.sNo}</td>
<td>{r.resistance}</td>
<td>{r.voltage}</td>
<td>{r.current}</td>
<td>{r.power}</td>
</tr>
))}

</tbody>

</table>

</CardContent>

</Card>

)}

</div>

)

}

export default SolarCellSimulator