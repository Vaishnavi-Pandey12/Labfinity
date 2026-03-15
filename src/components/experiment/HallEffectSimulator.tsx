import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Magnet, Download, RotateCcw } from "lucide-react";

interface Row {
  sNo: number;
  current: number;
  field: number;
  hallVoltage: number;
}

const HallEffectSimulator = () => {

  const [current,setCurrent] = useState(2)
  const [field,setField] = useState(0.5)

  const [rows,setRows] = useState<Row[]>([])

  const thickness = 0.5

  const hallVoltage = (current * field * thickness) * 0.02

  const record = () => {

    setRows(prev=>[
      ...prev,
      {
        sNo:prev.length+1,
        current,
        field,
        hallVoltage:Number(hallVoltage.toFixed(4))
      }
    ])

  }

  const reset = () => {
    setRows([])
  }

  const downloadCSV = () => {

    const headers=["S.No","Current","Magnetic Field","Hall Voltage"]

    const csv = [
      headers.join(","),
      ...rows.map(r =>
        [r.sNo,r.current,r.field,r.hallVoltage].join(",")
      )
    ].join("\n")

    const blob = new Blob([csv],{type:"text/csv"})
    const link = document.createElement("a")

    link.href = URL.createObjectURL(blob)
    link.download="hall_effect_observations.csv"
    link.click()

  }

  return (

    <div className="space-y-6">

      {/* Controls */}

      <Card className="glass-card border-0">

        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Magnet className="w-5 h-5 text-primary"/>
            Controls
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <div>
            Current (A)

            <Slider
              value={[current]}
              min={0.5}
              max={5}
              step={0.1}
              onValueChange={([v])=>setCurrent(v)}
            />

          </div>

          <div>
            Magnetic Field (Tesla)

            <Slider
              value={[field]}
              min={0}
              max={2}
              step={0.1}
              onValueChange={([v])=>setField(v)}
            />

          </div>

        </CardContent>

      </Card>


      {/* Apparatus Visualization */}

      <Card className="glass-card border-0">

        <CardHeader>
          <CardTitle>Hall Effect Apparatus</CardTitle>
        </CardHeader>

        <CardContent>

          <div className="relative w-full aspect-[16/9] bg-black rounded-xl">

            <svg viewBox="0 0 800 400" className="w-full h-full">

              {/* instrument box */}

              <rect x="40" y="60" width="720" height="280" rx="12" fill="#111827"/>

              {/* electromagnet */}

              <rect x="240" y="140" width="60" height="120" fill="#64748b"/>
              <rect x="500" y="140" width="60" height="120" fill="#64748b"/>

              <text x="270" y="130" fill="white">N</text>
              <text x="530" y="130" fill="white">S</text>

              {/* semiconductor */}

              <rect x="300" y="180" width="200" height="40" fill="#ef4444"/>

              {/* current direction */}

              <line x1="300" y1="200" x2="500" y2="200" stroke="white" strokeWidth="2"/>
              <text x="400" y="170" fill="white" textAnchor="middle">
                Current
              </text>

              {/* hall voltage */}

              <line x1="400" y1="180" x2="400" y2="140" stroke="cyan" strokeWidth="2"/>

              <text x="400" y="120" fill="cyan" textAnchor="middle">
                VH = {hallVoltage.toFixed(4)} V
              </text>

              {/* magnetic field */}

              <text x="400" y="100" fill="white" textAnchor="middle">
                Magnetic Field = {field} T
              </text>

            </svg>


            {/* animated electrons */}

            {[...Array(6)].map((_,i)=>(
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                initial={{x:320,y:190}}
                animate={{x:480}}
                transition={{
                  duration:2,
                  repeat:Infinity,
                  delay:i*0.3
                }}
              />
            ))}

          </div>

        </CardContent>

      </Card>


      {/* Observation Table */}

      <Card className="glass-card border-0">

        <CardHeader>
          <CardTitle>Observation Table</CardTitle>
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

            <Button variant="outline" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-2"/>
              Reset
            </Button>

          </div>


          <table className="w-full text-sm">

            <thead>
              <tr className="border-b">
                <th>S.No</th>
                <th>Current (A)</th>
                <th>Magnetic Field (T)</th>
                <th>Hall Voltage (V)</th>
              </tr>
            </thead>

            <tbody>

              {rows.map(r=>(
                <tr key={r.sNo} className="text-center border-b">
                  <td>{r.sNo}</td>
                  <td>{r.current}</td>
                  <td>{r.field}</td>
                  <td>{r.hallVoltage}</td>
                </tr>
              ))}

            </tbody>

          </table>

        </CardContent>

      </Card>

    </div>

  )

}

export default HallEffectSimulator