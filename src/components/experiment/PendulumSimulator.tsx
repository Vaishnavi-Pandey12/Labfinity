import { useState } from "react";
import { motion } from "framer-motion";
import { Card,CardContent,CardHeader,CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Clock,Download,RotateCcw } from "lucide-react";

interface Row{
sNo:number
length:number
time:number
period:number
}

const PendulumSimulator = ()=>{

const [length,setLength]=useState(1)
const [time,setTime]=useState(0)
const [running,setRunning]=useState(false)

const [rows,setRows]=useState<Row[]>([])

const g = 9.8

const period = 2*Math.PI*Math.sqrt(length/g)

const start=()=>{

setRunning(true)

let t=0

const interval=setInterval(()=>{

t+=0.1
setTime(Number(t.toFixed(2)))

if(t>=10){

clearInterval(interval)
setRunning(false)

}

},100)

}

const reset=()=>{

setTime(0)
setRunning(false)

}

const record=()=>{

setRows(prev=>[
...prev,
{
sNo:prev.length+1,
length,
time,
period:Number(period.toFixed(3))
}
])

}

const download=()=>{

const csv=[
["S.No","Length","Time","Period"],
...rows.map(r=>[r.sNo,r.length,r.time,r.period])
].map(r=>r.join(",")).join("\n")

const blob=new Blob([csv],{type:"text/csv"})
const url=URL.createObjectURL(blob)

const a=document.createElement("a")
a.href=url
a.download="pendulum_data.csv"
a.click()

}

return(

<div className="space-y-6">

<Card className="glass-card border-0">

<CardHeader>
<CardTitle className="flex gap-2 items-center">
<Clock className="w-5 h-5 text-primary"/>
Pendulum Controls
</CardTitle>
</CardHeader>

<CardContent className="space-y-3">

<Slider
value={[length]}
min={0.5}
max={2}
step={0.1}
onValueChange={([v])=>setLength(v)}
/>

<p className="text-sm mt-2">
Length: {length} m
</p>

</CardContent>

</Card>


<Card className="glass-card border-0">

<CardHeader>
<CardTitle>Pendulum Setup</CardTitle>
</CardHeader>

<CardContent>

<div className="bg-white rounded-xl border p-4 md:p-6">
  <div className="flex flex-col items-center justify-center gap-6">
    <div className="w-44 h-3 rounded-full bg-slate-700" />

    <div className="relative w-64 h-[320px] flex justify-center items-start">
      <motion.div
        className="relative flex flex-col items-center origin-top"
        animate={running ? { x: [-80, 80, -80] } : { x: 0 }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div
          className="w-[2px] bg-black"
          style={{ height: `${length * 150}px` }}
        />
        <div className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-500 border-2 border-slate-700 -bottom-4" />
      </motion.div>
    </div>
  </div>
</div>

</CardContent>

</Card>


<Card className="glass-card border-0">

<CardHeader>
<CardTitle>Observations</CardTitle>
</CardHeader>

<CardContent>

<div className="flex flex-wrap items-center justify-center gap-4 mb-4">

<Button onClick={start}>
Start
</Button>

<Button variant="outline" disabled>
Stop
</Button>

<Button variant="outline" onClick={reset}>
<RotateCcw className="w-4 h-4 mr-2"/>
Reset
</Button>

<Button onClick={record}>
Record
</Button>

<Button variant="outline" onClick={download}>
<Download className="w-4 h-4 mr-2"/>
CSV
</Button>

<p className="text-sm font-medium px-3 py-2 rounded-md bg-muted">
Time: {time} s
</p>

</div>

<table className="w-full text-sm mt-4">

<thead>

<tr className="border-b">

<th>S.No</th>
<th>Length</th>
<th>Time</th>
<th>Period</th>

</tr>

</thead>

<tbody>

{rows.map(r=>(
<tr key={r.sNo} className="text-center border-b">
<td>{r.sNo}</td>
<td>{r.length}</td>
<td>{r.time}</td>
<td>{r.period}</td>
</tr>
))}

</tbody>

</table>

</CardContent>

</Card>

</div>

)

}

export default PendulumSimulator
