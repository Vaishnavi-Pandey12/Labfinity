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

<div className="bg-white border rounded-xl p-4 md:p-6">
  <div className="w-full overflow-x-auto">
    <div className="min-w-[760px] flex items-center justify-center gap-8 md:gap-12">
      <div className="flex flex-col items-center justify-center gap-3 w-36 h-36">
        <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-yellow-400 border-4 border-yellow-300 shadow-inner">
          {connected && [...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-yellow-200"
              initial={{ x: -12, y: -20 + i * 6, opacity: 0.2 }}
              animate={{ x: 18, opacity: 1 }}
              transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
        <p className="text-sm font-medium text-center">Lamp</p>
      </div>

      <div className="h-0.5 w-12 md:w-16 bg-slate-400 shrink-0" />

      <div className="flex flex-col items-center justify-center gap-3 w-36 h-36">
        <div className="w-28 h-20 rounded-md bg-blue-900 border-4 border-blue-700 shadow-md" />
        <p className="text-sm font-medium text-center">Solar Cell</p>
      </div>

      <div className="h-0.5 w-12 md:w-16 bg-slate-400 shrink-0" />

      <div className="flex flex-col items-center justify-center gap-3 w-36 h-36">
        <div className="relative flex items-center justify-center w-28 h-8 rounded bg-slate-400 border border-slate-500">
          {connected && [...Array(4)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-blue-600"
              initial={{ x: -48, opacity: 0.3 }}
              animate={{ x: 48, opacity: 1 }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </div>
        <p className="text-sm font-medium text-center">Rheostat</p>
      </div>

      <div className="h-0.5 w-12 md:w-16 bg-slate-400 shrink-0" />

      <div className="flex flex-col items-center justify-center gap-3 w-44 h-36">
        <div className="flex items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-black bg-white flex items-center justify-center text-[11px] font-medium">
            {connected ? `${voltage} V` : "0 V"}
          </div>
          <div className="w-16 h-16 rounded-full border-2 border-black bg-white flex items-center justify-center text-[11px] font-medium">
            {connected ? `${current} mA` : "0 mA"}
          </div>
        </div>
        <p className="text-sm font-medium text-center">Meters</p>
      </div>
    </div>
  </div>
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
