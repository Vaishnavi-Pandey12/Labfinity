import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, Download, CircuitBoard, Lightbulb } from "lucide-react";
import AbsorbanceGraph from "./AbsorbanceGraph";

// ─── Constants ────────────────────────────────────────────────────────────────

const h_J = 6.63e-34;
const c   = 3e8;
const e   = 1.602e-19;

// ─── LED Data ────────────────────────────────────────────────────────────────

type LEDKey = "red" | "yellow" | "green" | "blue";

const ledDatabase: Record<LEDKey, {
  name: string; color: string; glowColor: string;
  kneeVoltage: number; standardWavelength: number;
  Is: number; Vt: number;
}> = {
  red:    { name: "Red",    color: "#ef4444", glowColor: "rgba(239,68,68,0.7)",    kneeVoltage: 1.8, standardWavelength: 660, Is: 1e-12, Vt: 0.065 },
  yellow: { name: "Yellow", color: "#eab308", glowColor: "rgba(234,179,8,0.7)",    kneeVoltage: 2.1, standardWavelength: 590, Is: 1e-13, Vt: 0.072 },
  green:  { name: "Green",  color: "#22c55e", glowColor: "rgba(34,197,94,0.7)",    kneeVoltage: 2.2, standardWavelength: 565, Is: 1e-13, Vt: 0.075 },
  blue:   { name: "Blue",   color: "#3b82f6", glowColor: "rgba(59,130,246,0.7)",   kneeVoltage: 3.0, standardWavelength: 450, Is: 1e-14, Vt: 0.095 },
};

interface Row {
  sNo: number; led: string; voltage: number; current: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

const LEDSimulator = () => {
  const [led, setLed]       = useState<LEDKey>("red");
  const [voltage, setVoltage] = useState(0);
  const [rows, setRows]     = useState<Row[]>([]);
  const [showResults, setShowResults] = useState(false);

  const ld = ledDatabase[led];

  // Diode current (mA)
  const current_mA = parseFloat(
    Math.min(ld.Is * (Math.exp(voltage / ld.Vt) - 1) * 1000, 25).toFixed(3)
  );

  // Is LED glowing?
  const isGlowing = voltage >= ld.kneeVoltage * 0.85;

  // Calculated wavelength from knee voltage
  const calcWavelength = parseFloat(((h_J * c) / (e * ld.kneeVoltage) * 1e9).toFixed(1));

  // Graph data — current vs voltage (V-I curve)
  const graphData = rows
    .filter(r => r.led === ld.name)
    .map(r => ({ x: r.voltage, y: parseFloat(r.current) }));

  const recordReading = () => {
    setRows(prev => [
      ...prev,
      { sNo: prev.length + 1, led: ld.name, voltage, current: current_mA.toFixed(3) }
    ]);
    if (rows.length >= 4) setShowResults(true);
  };

  const reset = () => {
    setLed("red"); setVoltage(0); setRows([]); setShowResults(false);
  };

  const downloadCSV = () => {
    const csv = [
      ["S.No","LED","Voltage (V)","Current (mA)"],
      ...rows.map(r => [r.sNo, r.led, r.voltage, r.current]),
    ].map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "led_observations.csv";
    a.click();
  };

  return (
    <div className="space-y-6">

      {/* ── 1. Controls ── */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display">
            <CircuitBoard className="w-5 h-5 text-primary" />
            Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="space-y-2">
            <label className="text-sm font-medium">Select LED Colour</label>
            <Select value={led} onValueChange={v => {
              setLed(v as LEDKey); setVoltage(0); setRows([]); setShowResults(false);
            }}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card z-50">
                {Object.entries(ledDatabase).map(([k, d]) => (
                  <SelectItem key={k} value={k}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name} LED
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Forward Voltage: {voltage.toFixed(2)} V</label>
            <Slider value={[voltage]} min={0} max={ld.kneeVoltage + 0.6} step={0.05}
              onValueChange={([v]) => setVoltage(v)} />
          </div>

          <div className="bg-muted/50 p-4 rounded-xl text-sm space-y-1">
            <p className="font-semibold">{ld.name} LED</p>
            <p className="text-muted-foreground">Applied voltage: <span className="font-mono">{voltage.toFixed(2)} V</span></p>
            <p className="text-muted-foreground">Current (I): <span className="font-mono">{current_mA.toFixed(3)} mA</span></p>
            <p className="text-muted-foreground">Knee voltage (VK): <span className="font-mono">{ld.kneeVoltage} V</span></p>
            <p className="text-muted-foreground">Status:
              <span className={`font-semibold ml-1 ${isGlowing ? "text-yellow-500" : "text-muted-foreground"}`}>
                {isGlowing ? "✦ Emitting light" : "Not emitting"}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={recordReading}>Record Reading</Button>
            <Button onClick={downloadCSV} disabled={rows.length === 0} variant="outline">
              <Download className="w-4 h-4 mr-2" />Download CSV
            </Button>
            <Button variant="outline" onClick={reset}><RotateCcw className="w-4 h-4 mr-2" />Reset</Button>
          </div>

        </CardContent>
      </Card>

      {/* ── 2. Apparatus ── */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display">
            <Lightbulb className="w-5 h-5 text-primary" />
            LED Circuit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-80 bg-[#0f172a] rounded-xl overflow-hidden flex items-center justify-center px-8">

            {/* Top-right display */}
            <div className="absolute top-4 right-4 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2 flex flex-col items-center z-30 min-w-[120px]">
              <span className="text-xs text-slate-400 mb-1">Wavelength</span>
              <span className="text-2xl font-bold font-mono tracking-wider"
                style={{ color: rows.length > 0 ? ld.color : "#64748b" }}>
                {rows.length > 0 ? `${calcWavelength} nm` : "--- nm"}
              </span>
            </div>

            <div className="flex flex-col items-center gap-6 w-full relative z-10">

              {/* Circuit row */}
              <div className="flex items-center justify-center gap-3 w-full max-w-xl">

                {/* Power supply */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-14 h-16 bg-slate-800 border border-slate-600 rounded-lg flex flex-col items-center justify-center gap-1">
                    <span className="text-[9px] text-slate-400">PSU</span>
                    <span className="text-xs font-mono text-yellow-400">{voltage.toFixed(2)}V</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Supply</p>
                </div>

                {/* Wire */}
                <div className="h-0.5 flex-1 rounded"
                  style={{ backgroundColor: isGlowing ? ld.color : "#334155", opacity: 0.7 }} />

                {/* Ammeter */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center">
                    <span className="text-[9px] font-mono text-green-400 text-center leading-tight">
                      {current_mA.toFixed(2)}<br />mA
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">mA</p>
                </div>

                {/* Wire */}
                <div className="h-0.5 flex-1 rounded"
                  style={{ backgroundColor: isGlowing ? ld.color : "#334155", opacity: 0.7 }} />

                {/* LED */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <motion.div
                    className="w-12 h-12 rounded-full flex items-center justify-center border-2"
                    style={{
                      borderColor: ld.color,
                      backgroundColor: isGlowing ? ld.color : "#1e293b",
                    }}
                    animate={isGlowing ? {
                      boxShadow: [
                        `0 0 12px ${ld.glowColor}`,
                        `0 0 40px ${ld.glowColor}`,
                        `0 0 12px ${ld.glowColor}`,
                      ],
                    } : {}}
                    transition={{ duration: 0.7, repeat: Infinity }}
                  >
                    {isGlowing && (
                      <motion.div className="w-6 h-6 rounded-full bg-white"
                        style={{ opacity: 0.9 }}
                        animate={{ scale: [0.8, 1.1, 0.8] }}
                        transition={{ duration: 0.7, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                  <p className="text-[10px] text-slate-500 mt-1">LED</p>
                </div>

                {/* Wire */}
                <div className="h-0.5 flex-1 rounded"
                  style={{ backgroundColor: isGlowing ? ld.color : "#334155", opacity: 0.7 }} />

                {/* Voltmeter */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-16 h-12 bg-slate-800 border border-slate-600 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-mono text-blue-400">{voltage.toFixed(2)}V</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Voltmeter</p>
                </div>

              </div>

              {/* LED glow halo */}
              {isGlowing && (
                <motion.div className="rounded-full"
                  style={{
                    width: "90px", height: "90px",
                    background: `radial-gradient(circle, ${ld.glowColor} 0%, transparent 70%)`,
                  }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}

              <p className="text-sm font-medium"
                style={{ color: isGlowing ? ld.color : "#64748b" }}>
                {isGlowing ? `✦ ${ld.name} LED emitting light` : "Increase voltage to observe emission"}
              </p>

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
                    {["S.No","LED","Voltage (V)","Current (mA)"].map(h => (
                      <th key={h} className="py-2 text-left text-muted-foreground font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <motion.tr key={r.sNo} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="border-b border-border/30">
                      <td className="py-2">{r.sNo}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: ledDatabase[r.led.toLowerCase() as LEDKey]?.color ?? "#888" }} />
                          {r.led}
                        </div>
                      </td>
                      <td className="py-2 font-mono">{r.voltage}</td>
                      <td className="py-2 font-mono">{r.current}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── 4. Graph ── */}
      <AbsorbanceGraph
        title="V-I Characteristic Curve"
        subtitle={`Forward current (mA) vs voltage (V) — ${ld.name} LED. Increase voltage in steps and record.`}
        data={graphData}
        xLabel="Voltage (V)"
        yLabel="Current (mA)"
        xDomain={[0, ld.kneeVoltage + 0.7]}
        yDomain={[0, 27]}
        showPoints={true}
        highlightX={ld.kneeVoltage}
        lineColor={ld.color}
      />

      {/* ── 5. Results ── */}
      <AnimatePresence>
        {showResults && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="glass-card border-0">
              <CardHeader><CardTitle className="font-display">Spectral Analysis Results</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">All LED Wavelengths</h4>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="py-2 text-left text-muted-foreground font-medium">LED</th>
                          <th className="py-2 text-left text-muted-foreground font-medium">VK (V)</th>
                          <th className="py-2 text-left text-muted-foreground font-medium">λ calc (nm)</th>
                          <th className="py-2 text-left text-muted-foreground font-medium">λ std (nm)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(ledDatabase).map(([k, d]) => {
                          const lc = parseFloat(((h_J * c) / (e * d.kneeVoltage) * 1e9).toFixed(1));
                          return (
                            <tr key={k} className="border-b border-border/30">
                              <td className="py-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                  {d.name}
                                </div>
                              </td>
                              <td className="py-2 font-mono">{d.kneeVoltage}</td>
                              <td className="py-2 font-mono">{lc}</td>
                              <td className="py-2 font-mono">{d.standardWavelength}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Calculation for {ld.name} LED</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Knee voltage (VK)</p>
                        <p className="font-mono font-semibold text-sm">{ld.kneeVoltage} V</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">λ = hc / eVK</p>
                        <p className="font-mono font-semibold text-sm">{calcWavelength} nm</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Standard wavelength</p>
                        <p className="font-mono font-semibold text-sm">{ld.standardWavelength} nm</p>
                      </div>
                    </div>
                  </div>
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    ✓ Observations recorded! The V-I curve shows the characteristic
                    forward-bias behaviour. Knee voltage VK = {ld.kneeVoltage} V gives
                    λ = {calcWavelength} nm (standard: {ld.standardWavelength} nm).
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

export default LEDSimulator;
