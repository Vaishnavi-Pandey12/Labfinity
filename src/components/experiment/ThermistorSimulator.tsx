import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RotateCcw, Flame, Thermometer, Download } from "lucide-react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";

interface Row {
  sNo: number;
  temperature: number;
  current: number;
  resistance: number;
}

const ThermistorSimulator = () => {
  const [heating, setHeating] = useState(false);
  const [stir, setStir] = useState(false);
  const [heatIntensity, setHeatIntensity] = useState(60);

  const [temperature, setTemperature] = useState(25);
  const [rows, setRows] = useState<Row[]>([]);
  const [liveSeries, setLiveSeries] = useState<{ temperature: number; resistance: number }[]>([]);

  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const ambientTemp = 25;
  const voltage = 2;

  const resistance = useMemo(() => {
    const R0 = 10000;
    const B = 3950;
    const T0 = 298.15;
    const Tk = temperature + 273.15;
    return R0 * Math.exp(B * (1 / Tk - 1 / T0));
  }, [temperature]);

  const current = voltage / resistance;

  useEffect(() => {
    const animate = (now: number) => {
      if (!lastRef.current) lastRef.current = now;
      const dt = Math.min((now - lastRef.current) / 1000, 1 / 20);
      lastRef.current = now;

      setTemperature((prev) => {
        const heatingPower = heating ? (heatIntensity / 100) * (stir ? 3.4 : 2.4) : 0;
        const cooling = 0.05 * (prev - ambientTemp);
        const next = Math.max(ambientTemp, Math.min(95, prev + (heatingPower - cooling) * dt));
        return next;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [heating, heatIntensity, stir]);

  useEffect(() => {
    setLiveSeries((prev) => {
      const next = [...prev, { temperature: Number(temperature.toFixed(2)), resistance: Number(resistance.toFixed(2)) }];
      return next.length > 90 ? next.slice(next.length - 90) : next;
    });
  }, [temperature, resistance]);

  const record = () => {
    setRows((prev) => [
      ...prev,
      {
        sNo: prev.length + 1,
        temperature: Number(temperature.toFixed(2)),
        current: Number((current * 1000).toFixed(4)),
        resistance: Number(resistance.toFixed(2)),
      },
    ]);
  };

  const reset = () => {
    setHeating(false);
    setStir(false);
    setHeatIntensity(60);
    setTemperature(25);
    setRows([]);
    setLiveSeries([]);
  };

  const downloadCSV = () => {
    const headers = ["S.No", "Temperature", "Current", "Resistance"];
    const csv = [headers.join(","), ...rows.map((r) => [r.sNo, r.temperature, r.current, r.resistance].join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "thermistor_data.csv";
    link.click();
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <Flame className="w-5 h-5 text-primary" />
            Controls
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>Heat Intensity: {heatIntensity}%</Label>
            <Slider value={[heatIntensity]} min={0} max={100} step={1} onValueChange={([v]) => setHeatIntensity(v)} />
          </div>

          <div className="flex items-center justify-between border rounded-md p-2">
            <Label htmlFor="stir-toggle">Stir</Label>
            <Switch id="stir-toggle" checked={stir} onCheckedChange={setStir} />
          </div>

          <div className="flex gap-3">
            <Button onClick={() => setHeating(true)} disabled={heating}>Start Heating</Button>
            <Button variant="outline" onClick={() => setHeating(false)}>Stop Heating</Button>
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <Thermometer className="w-5 h-5 text-primary" />
            Thermistor Heating Setup
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="relative mx-auto max-w-3xl h-[390px] rounded-xl border bg-white overflow-hidden">
            <div className="absolute left-1/2 -translate-x-1/2 bottom-6 w-24 h-14 bg-slate-700 rounded-md" />
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 bottom-[64px] w-10 h-16"
              animate={{ opacity: heating ? 1 : 0.2, scaleY: heating ? 1 + heatIntensity / 180 : 0.5 }}
            >
              <div className="w-full h-full bg-gradient-to-t from-orange-500 via-yellow-400 to-transparent rounded-full" />
            </motion.div>

            <div className="absolute left-1/2 -translate-x-1/2 bottom-[130px] w-56 h-[170px]">
              <div className="absolute left-0 right-0 bottom-0 h-44 border-4 border-slate-500 rounded-b-2xl rounded-t-md bg-transparent" />
              <motion.div
                className="absolute left-2 right-2 bottom-2 rounded-b-xl bg-sky-300/70 border-t border-sky-500"
                animate={{ height: [120, 124, 120] }}
                transition={{ repeat: Infinity, duration: stir ? 0.8 : 2.2 }}
              />
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 bottom-[180px] w-3 h-[130px] bg-slate-300 rounded-full border border-slate-500" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[170px] w-10 h-10 rounded-full bg-rose-500 border-2 border-rose-700" />

            <div className="absolute right-8 top-10 w-20 h-[232px] border-4 border-slate-300 rounded-full bg-white">
              <motion.div
                className="absolute bottom-1 left-1 right-1 bg-red-500 rounded-full"
                animate={{ height: `${Math.min(220, ((temperature - 20) / 75) * 220)}px` }}
              />
              <p className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-medium">{temperature.toFixed(1)}°C</p>
            </div>

            <div className="absolute left-8 top-12 w-28 h-28 rounded-full border-4 border-slate-600 bg-white flex items-center justify-center">
              <span className="text-xs text-center font-semibold leading-tight">{resistance.toFixed(0)} Ω</span>
              <p className="absolute -bottom-5 text-[11px] font-medium">Ohmmeter</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle>Live Temp vs Resistance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={liveSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="temperature" label={{ value: "Temperature (°C)", position: "insideBottom", offset: -6 }} />
              <YAxis label={{ value: "Resistance (Ω)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Line type="monotone" dataKey="resistance" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle>Observations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-4">
            <Button onClick={record}>Record Reading</Button>
            <Button variant="outline" onClick={downloadCSV}>
              <Download className="w-4 h-4 mr-2" />
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
              {rows.map((r) => (
                <motion.tr key={r.sNo} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center border-b">
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
  );
};

export default ThermistorSimulator;
