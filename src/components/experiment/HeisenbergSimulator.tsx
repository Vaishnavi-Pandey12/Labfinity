import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, Download, Microscope, Lightbulb } from "lucide-react";
import AbsorbanceGraph from "./AbsorbanceGraph";

// ─── Constants ────────────────────────────────────────────────────────────────

const LAMBDA   = 655e-9;   // m — diode laser from lab manual
const H        = 6.626e-34; // J·s
const D_m      = 0.50;     // m — fixed slit-to-screen distance

// ─── Data ────────────────────────────────────────────────────────────────────

type SlitKey = "slit1" | "slit2" | "slit3";

const slitDatabase: Record<SlitKey, { label: string; width: number; description: string }> = {
  slit1: { label: "Slit 1", width: 80,  description: "Narrow — large momentum spread" },
  slit2: { label: "Slit 2", width: 150, description: "Medium — moderate momentum spread" },
  slit3: { label: "Slit 3", width: 300, description: "Wide — small momentum spread" },
};

// Generate sinc² diffraction pattern for graph
const generatePattern = (widthMicron: number): { x: number; y: number }[] => {
  const d = widthMicron * 1e-6;
  const points: { x: number; y: number }[] = [];
  for (let xmm = -15; xmm <= 15; xmm += 0.3) {
    const beta = (Math.PI * d * xmm * 1e-3) / (LAMBDA * D_m);
    const I = beta === 0 ? 1 : Math.pow(Math.sin(beta) / beta, 2);
    points.push({ x: parseFloat(xmm.toFixed(1)), y: parseFloat(I.toFixed(4)) });
  }
  return points;
};

interface Row {
  sNo: number; slit: string; slitWidth: number;
  a: string; theta: string; deltaY: string;
  deltaPy: string; product: string; ratio: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

const HeisenbergSimulator = () => {
  const [slit, setSlit]       = useState<SlitKey>("slit1");
  const [D_cm, setD_cm]       = useState(50);   // cm — student-adjustable
  const [rows, setRows]       = useState<Row[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [patternData, setPatternData] = useState<{ x: number; y: number }[]>([]);
  const [scanning, setScanning] = useState(false);

  const sd = slitDatabase[slit];
  const d  = sd.width * 1e-6; // m

  // First minimum position: a = λD/d (mm → cm)
  const D_use   = D_cm * 1e-2; // m
  const a_m     = (LAMBDA * D_use) / d; // m
  const a_cm    = parseFloat((a_m * 100).toFixed(3)); // cm
  const theta1  = Math.atan(a_m / D_use); // rad
  const deltaY  = d;
  const deltaPy = (H / LAMBDA) * Math.sin(theta1);
  const product = deltaY * deltaPy;
  const ratio   = product / H;

  const observePattern = () => {
    setScanning(true);
    const points = generatePattern(sd.width);
    let i = 0;
    const interval = setInterval(() => {
      if (i < points.length) {
        setPatternData(prev => [...prev, points[i]]);
        i++;
      } else {
        clearInterval(interval);
        setScanning(false);
      }
    }, 12);
  };

  const recordReading = () => {
    if (patternData.length === 0) return;
    setRows(prev => [
      ...prev,
      {
        sNo: prev.length + 1,
        slit: sd.label,
        slitWidth: sd.width,
        a: a_cm.toFixed(3),
        theta: ((theta1 * 180) / Math.PI).toFixed(3),
        deltaY: (deltaY * 1e6).toFixed(1),
        deltaPy: deltaPy.toExponential(3),
        product: product.toExponential(3),
        ratio: ratio.toFixed(4),
      }
    ]);
    if (rows.length >= 1) setShowResults(true);
  };

  const reset = () => {
    setSlit("slit1"); setD_cm(50); setRows([]);
    setShowResults(false); setPatternData([]); setScanning(false);
  };

  const downloadCSV = () => {
    const csv = [
      ["S.No","Slit","Width (μm)","a (cm)","θ (°)","Δy (μm)","Δpᵧ (kg·m/s)","Δy·Δpᵧ (J·s)","Ratio to h"],
      ...rows.map(r => [r.sNo, r.slit, r.slitWidth, r.a, r.theta, r.deltaY, r.deltaPy, r.product, r.ratio]),
    ].map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "heisenberg_observations.csv";
    a.click();
  };

  return (
    <div className="space-y-6">

      {/* ── 1. Controls ── */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display">
            <Microscope className="w-5 h-5 text-primary" />
            Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Slit</label>
            <Select value={slit} onValueChange={v => {
              setSlit(v as SlitKey); setPatternData([]); setScanning(false);
            }}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card z-50">
                {Object.entries(slitDatabase).map(([k, s]) => (
                  <SelectItem key={k} value={k}>
                    {s.label} — {s.width} μm ({s.description})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Slit-to-Screen Distance (D): {D_cm} cm</label>
            <Slider value={[D_cm]} min={30} max={100} step={5}
              onValueChange={([v]) => { setD_cm(v); setPatternData([]); setScanning(false); }} />
          </div>

          <div className="bg-muted/50 p-4 rounded-xl text-sm space-y-1">
            <p className="font-semibold">{sd.label} — {sd.width} μm</p>
            <p className="text-muted-foreground">Laser wavelength (λ): <span className="font-mono">655 nm</span></p>
            <p className="text-muted-foreground">Screen distance (D): <span className="font-mono">{D_cm} cm</span></p>
            <p className="text-muted-foreground">1st minimum at (a): <span className="font-mono">±{a_cm} cm</span></p>
            <p className="text-muted-foreground">θ₁: <span className="font-mono">{((theta1 * 180) / Math.PI).toFixed(3)}°</span></p>
            <p className="text-muted-foreground">Δy · Δpᵧ / h: <span className="font-mono">{ratio.toFixed(4)}</span></p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={observePattern} disabled={scanning}>
              {scanning ? "Scanning..." : "Observe Pattern"}
            </Button>
            <Button onClick={recordReading} disabled={patternData.length === 0} variant="outline">
              Record Reading
            </Button>
            <Button onClick={downloadCSV} disabled={rows.length === 0} variant="outline">
              <Download className="w-4 h-4 mr-2" />Download CSV
            </Button>
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-2" />Reset
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* ── 2. Apparatus ── */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display">
            <Lightbulb className="w-5 h-5 text-primary" />
            Single-Slit Diffraction Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-80 bg-[#0f172a] rounded-xl overflow-hidden flex items-center justify-center px-6">

            {/* Top-right display */}
            <div className="absolute top-4 right-4 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2 flex flex-col items-center z-30 min-w-[110px]">
              <span className="text-xs text-slate-400 mb-1">Slit Width</span>
              <span className="text-2xl font-bold text-red-400 font-mono tracking-wider">
                {sd.width} μm
              </span>
            </div>

            <div className="w-full flex items-center justify-between relative z-10 max-w-3xl mx-auto">

              {/* 1. Laser */}
              <div className="flex flex-col items-center z-20 flex-shrink-0 w-16">
                <motion.div
                  className="w-14 h-10 rounded-lg flex items-center justify-center border-2 border-red-500"
                  style={{ backgroundColor: "#1e293b" }}
                  animate={{ boxShadow: ["0 0 8px rgba(239,68,68,0.4)", "0 0 24px rgba(239,68,68,0.8)", "0 0 8px rgba(239,68,68,0.4)"] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                </motion.div>
                <p className="text-[11px] text-slate-400 mt-2 text-center">Diode<br />Laser</p>
              </div>

              {/* Beam to slit */}
              <div className="flex-1 h-3 relative">
                <motion.div className="w-full h-full rounded bg-red-500"
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </div>

              {/* 2. Single Slit */}
              <div className="flex flex-col items-center z-20 flex-shrink-0">
                <div className="relative flex flex-col items-center">
                  <div className="w-5 h-14 bg-slate-500 rounded-t" />
                  {/* Slit gap — scales with selected slit width */}
                  <div
                    className="w-5 border-x-2 border-slate-500"
                    style={{
                      height: `${Math.max(3, sd.width / 18)}px`,
                      boxShadow: "0 0 8px rgba(239,68,68,0.6)",
                    }}
                  />
                  <div className="w-5 h-14 bg-slate-500 rounded-b" />
                </div>
                <p className="text-[11px] text-slate-400 mt-2 text-center">Slit<br />{sd.width}μm</p>
              </div>

              {/* Diffracted beams */}
              <div className="flex-1 relative" style={{ height: "140px" }}>
                {/* Central max */}
                <motion.div className="absolute h-2 rounded bg-red-400"
                  style={{ width: "100%", top: "50%", transform: "translateY(-50%)" }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
                {/* ±1st order lobes */}
                {[-1, 1].map((sign, i) => (
                  <motion.div key={i} className="absolute h-1 rounded origin-left bg-red-400"
                    style={{
                      width: "80%",
                      top: sign < 0 ? "27%" : "70%",
                      transform: `rotate(${sign * 13}deg)`,
                    }}
                    animate={{ opacity: [0.25, 0.5, 0.25] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
                {/* ±2nd order lobes */}
                {[-1, 1].map((sign, i) => (
                  <motion.div key={i} className="absolute h-0.5 rounded origin-left bg-red-300"
                    style={{
                      width: "55%",
                      top: sign < 0 ? "10%" : "87%",
                      transform: `rotate(${sign * 26}deg)`,
                      opacity: 0.18,
                    }}
                  />
                ))}
              </div>

              {/* 3. Detector/Screen */}
              <div className="flex flex-col items-center z-20 flex-shrink-0">
                <div className="w-4 h-36 bg-slate-700 rounded border border-slate-600 overflow-hidden relative">
                  {/* Intensity pattern */}
                  {scanning || patternData.length > 0 ? (
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: "radial-gradient(ellipse at 50% 50%, rgba(239,68,68,0.9) 0%, rgba(239,68,68,0.25) 35%, transparent 65%)",
                      }}
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-full bg-slate-600 rounded" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-2 text-center">Detector<br />Screen</p>
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
                    {["S.No","Slit","Width (μm)","a (cm)","θ (°)","Δy (μm)","Δpᵧ (kg·m/s)","Δy·Δpᵧ (J·s)","/ h"].map(h => (
                      <th key={h} className="py-2 text-left text-muted-foreground font-medium text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <motion.tr key={r.sNo} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="border-b border-border/30">
                      <td className="py-2">{r.sNo}</td>
                      <td className="py-2">{r.slit}</td>
                      <td className="py-2 font-mono">{r.slitWidth}</td>
                      <td className="py-2 font-mono">{r.a}</td>
                      <td className="py-2 font-mono">{r.theta}</td>
                      <td className="py-2 font-mono">{r.deltaY}</td>
                      <td className="py-2 font-mono">{r.deltaPy}</td>
                      <td className="py-2 font-mono">{r.product}</td>
                      <td className="py-2 font-mono">{r.ratio}</td>
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
        title="Single-Slit Diffraction Intensity Pattern"
        subtitle={`Relative intensity vs screen position — slit width = ${sd.width} μm, D = ${D_cm} cm`}
        data={patternData}
        xLabel="Screen Position (mm)"
        yLabel="Relative Intensity"
        xDomain={[-15, 15]}
        yDomain={[0, 1.1]}
        lineColor="#ef4444"
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
                    <h4 className="font-semibold mb-3">Uncertainty Calculations</h4>
                    <table className="w-full text-sm">
                      <tbody>
                        {[
                          ["Slit width (Δy)", `${sd.width} μm`],
                          ["1st minimum (a)", `±${a_cm} cm`],
                          ["θ₁", `${((theta1 * 180) / Math.PI).toFixed(3)}°`],
                          ["Δpᵧ = (h/λ) sinθ₁", `${deltaPy.toExponential(3)} kg·m/s`],
                          ["Δy · Δpᵧ", `${product.toExponential(3)} J·s`],
                          ["h (standard)", "6.626 × 10⁻³⁴ J·s"],
                          ["Δy · Δpᵧ / h", ratio.toFixed(4)],
                        ].map(([label, val]) => (
                          <tr key={label} className="border-b border-border/50">
                            <td className="py-2 text-muted-foreground">{label}</td>
                            <td className="py-2 font-mono font-semibold">{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Physical Interpretation</h4>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium text-foreground mb-1">Position Uncertainty (Δy)</p>
                        <p>The slit width constrains where we know the photon is. Narrow slit = small Δy = precise position.</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium text-foreground mb-1">Momentum Uncertainty (Δpᵧ)</p>
                        <p>Narrow slit → wider diffraction spread → larger Δpᵧ. Try Slit 1 vs Slit 3 to see this.</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium text-foreground mb-1">The Product ≈ h</p>
                        <p>Δy · Δpᵧ ≈ h confirms the uncertainty principle — the ratio to h is ≈ 1.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    ✓ Observations recorded! Δy · Δpᵧ = {product.toExponential(3)} J·s ≈ h = 6.626 × 10⁻³⁴ J·s.
                    Ratio = {ratio.toFixed(4)} ≈ 1, verifying Heisenberg's Uncertainty Principle.
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

export default HeisenbergSimulator;
