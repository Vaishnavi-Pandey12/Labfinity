import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Sun, Download, RotateCcw, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Observation {
  sNo: number;
  resistance: number;
  voltage: number;
  current: number;
  power: number;
}

const SolarCellSimulator = () => {
  const [lightIntensity, setLightIntensity] = useState(120);
  const [distance, setDistance] = useState(15);
  const [panelAngle, setPanelAngle] = useState(20);
  const [resistance, setResistance] = useState(50);
  const [connected, setConnected] = useState(false);
  const [rows, setRows] = useState<Observation[]>([]);

  const metrics = useMemo(() => {
    const distanceFactor = (10 * 10) / (distance * distance);
    const angleFactor = Math.max(0, Math.cos((panelAngle * Math.PI) / 180));
    const effectiveIntensity = lightIntensity * distanceFactor * angleFactor;
    const intensityNorm = Math.min(1.4, effectiveIntensity / 100);

    const Isc = 28 * intensityNorm; // mA
    const Voc = 0.48 + 0.24 * intensityNorm; // V
    const current = Isc / (1 + resistance / 45);
    const voltage = Math.min(Voc, (current * resistance) / 1000);
    const power = (voltage * current) / 1000; // W

    return {
      effectiveIntensity,
      current: Number(current.toFixed(3)),
      voltage: Number(voltage.toFixed(3)),
      power: Number(power.toFixed(4)),
    };
  }, [lightIntensity, distance, panelAngle, resistance]);

  const recordObservation = () => {
    if (!connected) return;
    setRows((prev) => [
      ...prev,
      {
        sNo: prev.length + 1,
        resistance,
        voltage: metrics.voltage,
        current: metrics.current,
        power: metrics.power,
      },
    ]);
  };

  const resetExperiment = () => {
    setRows([]);
    setConnected(false);
    setLightIntensity(120);
    setDistance(15);
    setPanelAngle(20);
    setResistance(50);
  };

  const downloadCSV = () => {
    const csv = [
      ["S.No", "Resistance", "Voltage", "Current", "Power"],
      ...rows.map((r) => [r.sNo, r.resistance, r.voltage, r.current, r.power]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "solar_cell_data.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-primary" />
            Solar Cell Controls
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <p className="text-sm font-medium">Light Intensity: {lightIntensity} a.u.</p>
            <Slider value={[lightIntensity]} min={20} max={200} step={1} onValueChange={([v]) => setLightIntensity(v)} />
          </div>

          <div>
            <p className="text-sm font-medium">Lamp Distance: {distance} cm</p>
            <Slider value={[distance]} min={5} max={50} step={1} onValueChange={([v]) => setDistance(v)} />
          </div>

          <div>
            <p className="text-sm font-medium">Panel Angle: {panelAngle}°</p>
            <Slider value={[panelAngle]} min={0} max={80} step={1} onValueChange={([v]) => setPanelAngle(v)} />
          </div>

          <div>
            <p className="text-sm font-medium">Rheostat (Load): {resistance} Ω</p>
            <Slider value={[resistance]} min={1} max={250} step={1} onValueChange={([v]) => setResistance(v)} />
          </div>

          <div className="flex gap-3">
            <Button onClick={() => setConnected(true)} disabled={connected}>Connect Circuit</Button>
            <Button variant="outline" onClick={resetExperiment}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Virtual Solar Cell Setup
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="bg-white border rounded-xl p-4 md:p-6">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[900px] flex items-center justify-center gap-8">
                <div className="flex flex-col items-center gap-2 w-32">
                  <div className="relative w-20 h-20 rounded-full bg-yellow-400 border-4 border-yellow-300 shadow-inner">
                    {connected && [...Array(8)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute h-[2px] bg-yellow-300 rounded"
                        style={{ width: `${10 + metrics.effectiveIntensity / 10}px`, top: `${8 + i * 8}px`, left: "72px" }}
                        animate={{ x: [0, 190], opacity: [0.3, 1, 0.2] }}
                        transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium">Lamp</p>
                </div>

                <div className="h-0.5 w-14 bg-slate-400" />

                <div className="flex flex-col items-center gap-2 w-36">
                  <div
                    className="w-28 h-20 rounded bg-blue-900 border-4 border-blue-700 shadow-md origin-bottom"
                    style={{ transform: `rotate(${-panelAngle}deg)` }}
                  />
                  <p className="text-sm font-medium">Solar Panel</p>
                </div>

                <div className="h-0.5 w-14 bg-slate-400" />

                <div className="flex flex-col items-center gap-2 w-24">
                  <div className="w-16 h-16 rounded-full border-2 border-black bg-white flex items-center justify-center text-[11px] font-medium">
                    {connected ? `${metrics.current} mA` : "0 mA"}
                  </div>
                  <p className="text-sm font-medium">Ammeter</p>
                </div>

                <div className="h-0.5 w-14 bg-slate-400" />

                <div className="flex flex-col items-center gap-2 w-24">
                  <div className="relative w-20 h-8 rounded bg-slate-400 border border-slate-500">
                    {connected && [...Array(4)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full bg-blue-700 top-1/2 -translate-y-1/2"
                        animate={{ x: [4, 68], opacity: [0.3, 1, 0.2] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium">Rheostat</p>
                </div>

                <div className="h-0.5 w-14 bg-slate-400" />

                <div className="flex flex-col items-center gap-2 w-24">
                  <div className="w-16 h-16 rounded-full border-2 border-black bg-white flex items-center justify-center text-[11px] font-medium">
                    {connected ? `${metrics.voltage} V` : "0 V"}
                  </div>
                  <p className="text-sm font-medium">Voltmeter</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {connected && (
        <>
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>I-V Curve</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={rows}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="voltage" label={{ value: "Voltage (V)", position: "insideBottom", offset: -5 }} />
                  <YAxis label={{ value: "Current (mA)", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="current" stroke="#2563eb" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>Record Observations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 mb-4">
                <Button onClick={recordObservation}>Record Reading</Button>
                <Button variant="outline" onClick={downloadCSV}>
                  <Download className="w-4 h-4 mr-2" />
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
                  {rows.map((r) => (
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
        </>
      )}
    </div>
  );
};

export default SolarCellSimulator;
