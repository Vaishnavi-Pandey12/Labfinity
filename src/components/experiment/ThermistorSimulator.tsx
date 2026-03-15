import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, Flame, Thermometer, Download } from "lucide-react";

interface Row {
  sNo:number
  temperature:number
  current:number
  resistance:number
}

const ThermistorSimulator = () => {

  const [heater,setHeater] = useState(false)
  const [temperature,setTemperature] = useState(25)
  const [current,setCurrent] = useState(0)
  const voltage = 2

  const [rows,setRows] = useState<Row[]>([])

  useEffect(()=>{

    if(!heater) return

    const interval = setInterval(()=>{
      setTemperature(t => Math.min(t+1,90))
    },1000)

    return ()=>clearInterval(interval)

  },[heater])

  useEffect(()=>{

    const resistance = 10000 * Math.exp(-0.05*(temperature-25))
    const current = voltage / resistance

    setCurrent(current)

  },[temperature])

  const resistance = voltage/current

  const record = () => {

    setRows(prev=>[
      ...prev,
      {
        sNo:prev.length+1,
        temperature,
        current:Number((current*1000).toFixed(4)),
        resistance:Number(resistance.toFixed(2))
      }
    ])

  }

  const reset = () => {

    setHeater(false)
    setTemperature(25)
    setRows([])

  }

  const downloadCSV = () => {

    const headers = ["S.No","Temperature","Current","Resistance"]

    const csv = [
      headers.join(","),
      ...rows.map(r =>
        [r.sNo,r.temperature,r.current,r.resistance].join(",")
      )
    ].join("\n")

    const blob = new Blob([csv],{type:"text/csv"})
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "thermistor_data.csv"
    link.click()

  }

  return (

    <div className="space-y-6">

      {/* Controls */}

      <Card className="glass-card border-0">

        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <Flame className="w-5 h-5 text-primary"/>
            Controls
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <div className="flex gap-3">

            <Button
              onClick={()=>setHeater(true)}
              disabled={heater}
            >
              Turn Heater ON
            </Button>

            <Button
              variant="outline"
              onClick={reset}
            >
              <RotateCcw className="w-4 h-4 mr-2"/>
              Reset
            </Button>

          </div>

          <div>
            Temperature Control
            <Slider
              value={[temperature]}
              min={20}
              max={90}
              step={1}
              onValueChange={([v])=>setTemperature(v)}
            />
          </div>

        </CardContent>

      </Card>

      {/* Apparatus */}

      <Card className="glass-card border-0">

        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <Thermometer className="w-5 h-5 text-primary"/>
            Thermistor Setup
          </CardTitle>
        </CardHeader>

        <CardContent>

          <div className="relative w-full aspect-[16/9] bg-white rounded-xl border">

            <svg viewBox="0 0 800 400" className="w-full h-full">

              {/* Power supply */}
              <rect x="80" y="160" width="80" height="60" fill="#64748b"/>
              <text x="120" y="235" textAnchor="middle">
                Power
              </text>

              {/* Thermistor */}
              <rect x="320" y="170" width="60" height="40" fill="#ef4444"/>
              <text x="350" y="230" textAnchor="middle">
                Thermistor
              </text>

              {/* Ammeter */}
              <circle cx="520" cy="190" r="25" fill="white" stroke="black"/>

              <text
                x="520"
                y="195"
                textAnchor="middle"
                fontSize="11"
              >
                {(current*1000).toFixed(3)} mA
              </text>

              {/* Wires */}

              <line x1="160" y1="190" x2="320" y2="190" stroke="black"/>
              <line x1="380" y1="190" x2="495" y2="190" stroke="black"/>

              {/* Thermometer */}

              <rect x="650" y="100" width="20" height="200" fill="#e5e7eb"/>

              <motion.rect
                x="650"
                y={300-temperature*2}
                width="20"
                height={temperature*2}
                fill="#ef4444"
              />

              <text x="660" y="320" textAnchor="middle">
                {temperature}°C
              </text>

            </svg>

          </div>

        </CardContent>

      </Card>

      {/* Observation Table */}

      <Card className="glass-card border-0">

        <CardHeader>
          <CardTitle>
            Observations
          </CardTitle>
        </CardHeader>

        <CardContent>

          <div className="flex gap-3 mb-4">

            <Button onClick={record}>
              Record Reading
            </Button>

            <Button
              variant="outline"
              onClick={downloadCSV}
            >
              <Download className="w-4 h-4 mr-2"/>
              Download CSV
            </Button>

          </div>

          <table className="w-full text-sm">

            <thead>
              <tr className="border-b">
                <th>S.No</th>
                <th>Temperature</th>
                <th>Current (mA)</th>
                <th>Resistance (Ω)</th>
              </tr>
            </thead>

            <tbody>

              {rows.map(r => (

                <motion.tr
                  key={r.sNo}
                  initial={{opacity:0,y:10}}
                  animate={{opacity:1,y:0}}
                  className="text-center border-b"
                >

                  <td>{r.sNo}</td>
                  <td>{r.temperature}</td>
                  <td>{r.current}</td>
                  <td>{r.resistance}</td>

                </motion.tr>

              ))}

            </tbody>

          </table>

        </CardContent>

      </Card>

    </div>

  )

}

export default ThermistorSimulator