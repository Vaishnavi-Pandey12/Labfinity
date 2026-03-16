import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, Download, FlaskConical, Lightbulb } from "lucide-react";
import AbsorbanceGraph from "./AbsorbanceGraph";

// ─── Data ────────────────────────────────────────────────────────────────────

type FilterKey = "red" | "yellow1" | "yellow2" | "green" | "blue";

const filterDatabase: Record<FilterKey, {
  name: string; wavelength: number; frequency: number;
  stoppingPotential: number; color: string; beamColor: string;
}> = {
  red:     { name: "Red",       wavelength: 635, frequency: 4.724e14, stoppingPotential: 0.38, color: "#ef4444", beamColor: "rgba(239,68,68,0.65)"   },
  yellow1: { name: "Yellow I",  wavelength: 570, frequency: 5.263e14, stoppingPotential: 0.58, color: "#eab308", beamColor: "rgba(234,179,8,0.65)"    },
  yellow2: { name: "Yellow II", wavelength: 540, frequency: 5.556e14, stoppingPotential: 0.72, color: "#facc15", beamColor: "rgba(250,204,21,0.65)"   },
  green:   { name: "Green",     wavelength: 500, frequency: 6.000e14, stoppingPotential: 0.92, color: "#22c55e", beamColor: "rgba(34,197,94,0.65)"    },
  blue:    { name: "Blue",      wavelength: 460, frequency: 6.522e14, stoppingPotential: 1.15, color: "#3b82f6", beamColor: "rgba(59,130,246,0.65)"   },
};

interface Row {
  sNo: number; filter: string; wavelength: number;
  frequency: string; voltage: number; current: string; stoppingPotential: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

const PhotoelectricSimulator = () => {
  const [filter, setFilter]       = useState<FilterKey>("red");
  const [voltage, setVoltage]     = useState(0);
  const [lightOn, setLightOn]     = useState(false);
  const [rows, setRows]           = useState<Row[]>([]);
  const [showResults, setShowResults] = useState(false);

  const fd = filterDatabase[filter];

  // Photocurrent decreases as retarding voltage approaches stopping potential
  const photocurrent = lightOn
    ? Math.max(0, ((fd.stoppingPotential - voltage) / fd.stoppingPotential) * 85)
    : 0;
  const isStopped = lightOn && voltage >= fd.stoppingPotential;

  // Graph data: all recorded (ν, Vs) pairs
  const graphData = rows.map(r => ({ x: parseFloat(r.frequency), y: r.stoppingPotential }));

  const recordReading = () => {
    if (!lightOn) return;
    setRows(prev => [
      ...prev,
      {
        sNo: prev.length + 1,
        filter: fd.name,
        wavelength: fd.wavelength,
        frequency: (fd.frequency / 1e14).toFixed(3),
        voltage: parseFloat(voltage.toFixed(2)),
        current: photocurrent.toFixed(2),
        stoppingPotential: fd.stoppingPotential,
      }
    ]);
    if (rows.length >= 4) setShowResults(true);
  };

  const reset = () => {
    setFilter("red"); setVoltage(0); setLightOn(false);
    setRows([]); setShowResults(false);
  };

  const downloadCSV = () => {
    const csv = [
      ["S.No","Filter","λ (nm)","ν (×10¹⁴ Hz)","Voltage (V)","Current (μA)","Vs (V)"],
      ...rows.map(r => [r.sNo, r.filter, r.wavelength, r.frequency, r.voltage, r.current, r.stoppingPotential]),
    ].map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "photoelectric_observations.csv";
    a.click();
  };

  // Calculated h from slope of graph
  const calcH = (() => {
    if (graphData.length < 2) return null;
    const slope = (graphData[graphData.length - 1].y - graphData[0].y)
                / ((graphData[graphData.length - 1].x - graphData[0].x) * 1e14);
    return (slope * 1.602e-19).toExponential(3);
  })();

  return (
    <div className="space-y-6">

      {/* ── 1. Controls Card ── */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display">
            <FlaskConical className="w-5 h-5 text-primary" />
            Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Color Filter</label>
            <Select value={filter} onValueChange={v => { setFilter(v as FilterKey); setVoltage(0); setLightOn(false); }}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card z-50">
                {Object.entries(filterDatabase).map(([k, d]) => (
                  <SelectItem key={k} value={k}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name} ({d.wavelength} nm)
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 p-4 rounded-xl text-sm space-y-1">
            <p className="font-semibold">{fd.name} Filter</p>
            <p className="text-muted-foreground">Wavelength: <span className="font-mono">{fd.wavelength} nm</span></p>
            <p className="text-muted-foreground">Frequency: <span className="font-mono">{(fd.frequency / 1e14).toFixed(3)} × 10¹⁴ Hz</span></p>
            <p className="text-muted-foreground">Stopping Potential: <span className="font-mono">{fd.stoppingPotential} V</span></p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Retarding Voltage: {voltage.toFixed(2)} V</label>
            <Slider value={[voltage]} min={0} max={1.5} step={0.01}
              onValueChange={([v]) => setVoltage(v)} disabled={!lightOn} />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setLightOn(true)} disabled={lightOn}>Switch On Light</Button>
            <Button onClick={recordReading} disabled={!lightOn} variant="outline">Record Reading</Button>
            <Button onClick={downloadCSV} disabled={rows.length === 0} variant="outline">
              <Download className="w-4 h-4 mr-2" />Download CSV
            </Button>
            <Button variant="outline" onClick={reset}><RotateCcw className="w-4 h-4 mr-2" />Reset</Button>
          </div>

        </CardContent>
      </Card>

      {/* ── 2. Apparatus Card (UVVis style) ── */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display">
            <Lightbulb className="w-5 h-5 text-primary" />
            Photoelectric Apparatus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-80 bg-[#0f172a] rounded-xl overflow-hidden flex items-center justify-center px-6">

            {/* Top-right display — like UVVis wavelength display */}
            <div className="absolute top-4 right-4 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2 flex flex-col items-center z-30 min-w-[120px]">
              <span className="text-xs text-slate-400 mb-1">Photocurrent</span>
              <span className="text-2xl font-bold text-green-400 font-mono tracking-wider">
                {lightOn ? photocurrent.toFixed(1) : "---"}
              </span>
              <span className="text-xs text-slate-500">μA</span>
            </div>

            {/* Apparatus row */}
            <div className="w-full flex items-center justify-between relative z-10 max-w-3xl mx-auto">

              {/* 1. Hg Lamp */}
              <div className="flex flex-col items-center z-20 w-20 flex-shrink-0">
                <motion.div
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    background: lightOn
                      ? `radial-gradient(circle, white 20%, ${fd.color})`
                      : "radial-gradient(circle, #fde68a, #f59e0b)",
                  }}
                  animate={lightOn ? { boxShadow: [`0 0 20px ${fd.beamColor}`, `0 0 50px ${fd.beamColor}`, `0 0 20px ${fd.beamColor}`] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Lightbulb className="w-7 h-7 text-white drop-shadow" />
                </motion.div>
                <p className="text-[12px] text-center mt-4 text-slate-400 font-medium">Hg<br />Source</p>
              </div>

              {/* Connector */}
              <div className="w-8 h-3 bg-gradient-to-b from-gray-400 to-gray-500 rounded-sm flex-shrink-0" />

              {/* 2. Color Filter */}
              <div className="flex flex-col items-center z-20 flex-shrink-0">
                <div
                  className="w-5 h-[110px] rounded-sm"
                  style={{
                    backgroundColor: fd.color,
                    opacity: 0.9,
                    boxShadow: lightOn ? `0 0 16px ${fd.beamColor}` : "none",
                  }}
                />
                <p className="text-[12px] text-center mt-4 text-slate-400 font-medium">Filter<br />{fd.wavelength}nm</p>
              </div>

              {/* Beam: Filter → Phototube */}
              <div className="flex-1 h-3 relative min-w-[40px]">
                <motion.div
                  className="w-full h-full rounded"
                  style={{
                    background: lightOn
                      ? `linear-gradient(90deg, ${fd.beamColor}, ${fd.beamColor})`
                      : "transparent",
                  }}
                  animate={lightOn ? { opacity: [0.5, 1, 0.5] } : { opacity: 0 }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </div>

              {/* 3. Phototube */}
              <div className="flex flex-col items-center z-20 w-28 flex-shrink-0">
                <div className="w-24 h-[110px] bg-[#1e293b] rounded-xl border border-slate-600 relative overflow-hidden flex items-center justify-center">
                  {/* Cathode plate */}
                  <div className="w-3 h-20 bg-slate-400 rounded absolute left-3" />
                  {/* Anode plate */}
                  <div className="w-3 h-20 bg-slate-400 rounded absolute right-3" />
                  {/* Photoelectrons */}
                  {lightOn && !isStopped && [0, 1, 2].map(i => (
                    <motion.div key={i}
                      className="w-2 h-2 rounded-full bg-yellow-300 absolute"
                      style={{ left: "22%", top: `${22 + i * 22}%` }}
                      animate={{ x: [0, 52, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.35 }}
                    />
                  ))}
                  {isStopped && (
                    <p className="text-green-400 text-[10px] font-bold text-center z-10">STOPPED</p>
                  )}
                </div>
                <p className="text-[12px] text-center mt-4 text-slate-400 font-medium">Phototube</p>
              </div>

              {/* Beam: Phototube → Detector */}
              <div className="flex-1 h-3 relative min-w-[40px]">
                {lightOn && !isStopped && (
                  <motion.div
                    className="w-full h-full rounded"
                    style={{ background: "linear-gradient(90deg, rgba(250,204,21,0.5), transparent)" }}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.7 }}
                  />
                )}
              </div>

              {/* 4. Detector */}
              <div className="flex flex-col items-center z-20 w-20 flex-shrink-0">
                <div className="w-[72px] h-[72px] bg-[#2d3748] rounded-[1.5rem] shadow-xl flex items-center justify-center border border-slate-600 relative -top-1">
                  <div className="w-9 h-9 rounded-full bg-[#171923] flex items-center justify-center border border-slate-700">
                    <motion.div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: lightOn && !isStopped ? "#22c55e" : "#4a5568",
                        boxShadow: lightOn && !isStopped ? "0 0 10px #22c55e" : "none",
                      }}
                    />
                  </div>
                </div>
                <p className="text-[12px] text-center mt-4 text-slate-400 font-medium">Detector</p>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Observation Table ── */}
      {rows.length > 0 && (
        <Card className="glass-card border-0">
          <CardHeader><CardTitle className="font-display">Observation Table</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    {["S.No","Filter","λ (nm)","ν (×10¹⁴ Hz)","Voltage (V)","Current (μA)","Vs (V)"].map(h => (
                      <th key={h} className="py-2 text-left text-muted-foreground font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <motion.tr key={r.sNo} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="border-b border-border/30">
                      <td className="py-2">{r.sNo}</td>
                      <td className="py-2">{r.filter}</td>
                      <td className="py-2 font-mono">{r.wavelength}</td>
                      <td className="py-2 font-mono">{r.frequency}</td>
                      <td className="py-2 font-mono">{r.voltage}</td>
                      <td className="py-2 font-mono">{r.current}</td>
                      <td className="py-2 font-mono">{r.stoppingPotential}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── 4. Graph (AbsorbanceGraph — like UVVis) ── */}
      <AbsorbanceGraph
        title="Stopping Potential vs Frequency"
        subtitle="Plot Vs vs ν — slope = h/e. Record at least 3 filters to see the trend."
        data={graphData}
        xLabel="Frequency (×10¹⁴ Hz)"
        yLabel="Stopping Potential (V)"
        xDomain={[4.5, 6.8]}
        yDomain={[0, 1.4]}
        showPoints={true}
        showTrendline={graphData.length >= 2}
        lineColor="#8b5cf6"
      />

      {/* ── 5. Results (AnimatePresence — like UVVis) ── */}
      <AnimatePresence>
        {showResults && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="glass-card border-0">
              <CardHeader><CardTitle className="font-display">Spectral Analysis Results</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Recorded Data Summary</h4>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-border/50">
                          <td className="py-2 text-muted-foreground">Filters used</td>
                          <td className="py-2 font-medium">{rows.length}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 text-muted-foreground">Frequency range</td>
                          <td className="py-2 font-mono">{rows[0]?.frequency} – {rows[rows.length-1]?.frequency} × 10¹⁴ Hz</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 text-muted-foreground">Vs range</td>
                          <td className="py-2 font-mono">{rows[0]?.stoppingPotential} – {rows[rows.length-1]?.stoppingPotential} V</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Planck's Constant</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Calculated h = e × slope</p>
                        <p className="font-mono font-semibold text-sm">{calcH ?? "—"} J·s</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Standard value of h</p>
                        <p className="font-mono font-semibold text-sm">6.626 × 10⁻³⁴ J·s</p>
                      </div>
                    </div>
                  </div>
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    ✓ Observations recorded! The linear Vs vs ν graph confirms Einstein's photoelectric
                    equation. The slope gives h/e, from which Planck's constant h is determined.
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PhotoelectricSimulator;
