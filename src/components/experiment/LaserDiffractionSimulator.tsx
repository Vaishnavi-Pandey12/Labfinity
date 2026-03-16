import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, Download, ScanLine, Lightbulb } from "lucide-react";
import AbsorbanceGraph from "./AbsorbanceGraph";

// ─── Data ────────────────────────────────────────────────────────────────────

type LaserKey = "red" | "green" | "blue";

const laserDatabase: Record<LaserKey, { name: string; wavelength: number; color: string; beamColor: string }> = {
  red:   { name: "Red Laser",   wavelength: 650, color: "#ef4444", beamColor: "rgba(239,68,68,0.7)"  },
  green: { name: "Green Laser", wavelength: 532, color: "#22c55e", beamColor: "rgba(34,197,94,0.7)"  },
  blue:  { name: "Blue Laser",  wavelength: 450, color: "#3b82f6", beamColor: "rgba(59,130,246,0.7)" },
};

const LINES_PER_INCH = 2500;
const d = (1 / (LINES_PER_INCH / 2.54)) * 1e-2; // grating spacing in meters

const computeY = (n: number, lambdaNm: number, D_cm: number): number => {
  const lambda = lambdaNm * 1e-9;
  const sinT = (n * lambda) / d;
  if (Math.abs(sinT) > 1) return -1;
  return parseFloat((D_cm * Math.tan(Math.asin(sinT))).toFixed(2));
};

interface Row {
  sNo: number; order: number; D: number; y: number;
  theta: string; sinTheta: string; lambda: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

const LaserDiffractionSimulator = () => {
  const [laser, setLaser]   = useState<LaserKey>("red");
  const [order, setOrder]   = useState(1);
  const [D, setD]           = useState(50); // cm
  const [rows, setRows]     = useState<Row[]>([]);
  const [showResults, setShowResults] = useState(false);

  const ld = laserDatabase[laser];

  const y = computeY(order, ld.wavelength, D);
  const theta = y > 0 ? Math.atan(y / D) : 0;
  const sinTheta = Math.sin(theta);
  const lambdaCalc = order > 0 && sinTheta > 0 ? (sinTheta * d * 1e9) / order : 0;

  // Graph data: sinθ vs order
  const graphData = rows
    .filter(r => r.order > 0)
    .map(r => ({ x: r.order, y: parseFloat(r.sinTheta) }));

  const recordReading = () => {
    if (y <= 0) return;
    setRows(prev => [
      ...prev,
      {
        sNo: prev.length + 1,
        order,
        D,
        y,
        theta: ((theta * 180) / Math.PI).toFixed(3),
        sinTheta: sinTheta.toFixed(5),
        lambda: lambdaCalc.toFixed(1),
      }
    ]);
    if (rows.length >= 2) setShowResults(true);
  };

  const reset = () => { setLaser("red"); setOrder(1); setD(50); setRows([]); setShowResults(false); };

  const downloadCSV = () => {
    const csv = [
      ["S.No","Order (n)","D (cm)","y (cm)","θ (°)","sin θ","λ (nm)"],
      ...rows.map(r => [r.sNo, r.order, r.D, r.y, r.theta, r.sinTheta, r.lambda]),
    ].map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "laser_diffraction_observations.csv";
    a.click();
  };

  const meanLambda = rows.length > 0
    ? (rows.reduce((s, r) => s + parseFloat(r.lambda), 0) / rows.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6">

      {/* ── 1. Controls ── */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display">
            <ScanLine className="w-5 h-5 text-primary" />
            Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Laser Source</label>
            <Select value={laser} onValueChange={v => { setLaser(v as LaserKey); setRows([]); setShowResults(false); }}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card z-50">
                {Object.entries(laserDatabase).map(([k, d]) => (
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Order of Diffraction (n): {order}</label>
            <Slider value={[order]} min={1} max={3} step={1} onValueChange={([v]) => setOrder(v)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Grating-to-Screen Distance (D): {D} cm</label>
            <Slider value={[D]} min={20} max={100} step={5} onValueChange={([v]) => setD(v)} />
          </div>

          <div className="bg-muted/50 p-4 rounded-xl text-sm space-y-1">
            <p className="font-semibold">{ld.name} — Order {order}</p>
            <p className="text-muted-foreground">Grating spacing (d): <span className="font-mono">{(d * 1e6).toFixed(3)} μm</span></p>
            <p className="text-muted-foreground">y (spot distance): <span className="font-mono">{y > 0 ? `${y} cm` : "Order not visible"}</span></p>
            <p className="text-muted-foreground">θ: <span className="font-mono">{((theta * 180) / Math.PI).toFixed(3)}°</span></p>
            <p className="text-muted-foreground">sin θ: <span className="font-mono">{sinTheta.toFixed(5)}</span></p>
            <p className="text-muted-foreground">λ calculated: <span className="font-mono">{lambdaCalc.toFixed(1)} nm</span></p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={recordReading} disabled={y <= 0}>Record Reading</Button>
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
            Laser Diffraction Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-80 bg-[#0f172a] rounded-xl overflow-hidden flex items-center justify-center px-6">

            {/* Top-right display */}
            <div className="absolute top-4 right-4 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2 flex flex-col items-center z-30 min-w-[110px]">
              <span className="text-xs text-slate-400 mb-1">Wavelength</span>
              <span className="text-2xl font-bold font-mono tracking-wider" style={{ color: ld.color }}>
                {rows.length > 0 ? `${ld.wavelength} nm` : "--- nm"}
              </span>
            </div>

            <div className="w-full flex items-center justify-between relative z-10 max-w-3xl mx-auto">

              {/* 1. Laser */}
              <div className="flex flex-col items-center z-20 flex-shrink-0 w-16">
                <motion.div
                  className="w-14 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#1e293b", border: `2px solid ${ld.color}` }}
                  animate={{ boxShadow: [`0 0 8px ${ld.beamColor}`, `0 0 24px ${ld.beamColor}`, `0 0 8px ${ld.beamColor}`] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ld.color }} />
                </motion.div>
                <p className="text-[11px] text-slate-400 mt-2 text-center">LASER</p>
              </div>

              {/* Beam to grating */}
              <div className="flex-1 h-3 relative">
                <motion.div className="w-full h-full rounded" style={{ backgroundColor: ld.beamColor }}
                  animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.8, repeat: Infinity }} />
              </div>

              {/* 2. Grating */}
              <div className="flex flex-col items-center z-20 flex-shrink-0 self-center">
                <div className="w-3 h-24 rounded"
                  style={{
                    background: "repeating-linear-gradient(0deg,#475569 0px,#475569 1px,#1e293b 1px,#1e293b 3px)",
                    boxShadow: `0 0 10px ${ld.beamColor}`,
                  }}
                />
                <p className="text-[11px] text-slate-400 mt-2 text-center">Grating</p>
              </div>

              {/* Diffracted beams */}
              <div className="flex-1 relative" style={{ height: "130px" }}>
                {/* Central (0th order) */}
                <motion.div className="absolute h-2 rounded"
                  style={{ backgroundColor: ld.beamColor, width: "100%", top: "50%", transform: "translateY(-50%)" }}
                  animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.8, repeat: Infinity }}
                />
                {/* +1 order */}
                <motion.div className="absolute h-1 rounded origin-left"
                  style={{ backgroundColor: ld.beamColor, width: "90%", top: "28%", transform: "rotate(-14deg)", opacity: 0.7 }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.1 }}
                />
                {/* -1 order */}
                <motion.div className="absolute h-1 rounded origin-left"
                  style={{ backgroundColor: ld.beamColor, width: "90%", top: "68%", transform: "rotate(14deg)", opacity: 0.7 }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                />
                {/* ±2 order */}
                <div className="absolute h-0.5 rounded origin-left"
                  style={{ backgroundColor: ld.beamColor, width: "70%", top: "12%", transform: "rotate(-28deg)", opacity: 0.3 }} />
                <div className="absolute h-0.5 rounded origin-left"
                  style={{ backgroundColor: ld.beamColor, width: "70%", top: "83%", transform: "rotate(28deg)", opacity: 0.3 }} />
              </div>

              {/* 3. Screen */}
              <div className="flex flex-col items-center z-20 flex-shrink-0">
                <div className="w-4 h-36 bg-slate-700 rounded border border-slate-600 relative">
                  {[0, 1, 2, 3, 4].map(i => (
                    <motion.div key={i}
                      className="absolute left-0.5 right-0.5 h-2 rounded-full"
                      style={{
                        top: `${10 + i * 19}%`,
                        backgroundColor: i === 2 ? ld.color : ld.color,
                        opacity: i === 2 ? 1 : i === 1 || i === 3 ? 0.65 : 0.3,
                      }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-2 text-center">Screen</p>
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
                    {["S.No","n","D (cm)","y (cm)","θ (°)","sin θ","λ (nm)"].map(h => (
                      <th key={h} className="py-2 text-left text-muted-foreground font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <motion.tr key={r.sNo} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="border-b border-border/30">
                      <td className="py-2">{r.sNo}</td>
                      <td className="py-2 font-mono">{r.order}</td>
                      <td className="py-2 font-mono">{r.D}</td>
                      <td className="py-2 font-mono">{r.y}</td>
                      <td className="py-2 font-mono">{r.theta}</td>
                      <td className="py-2 font-mono">{r.sinTheta}</td>
                      <td className="py-2 font-mono">{r.lambda}</td>
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
        title="sin θ vs Diffraction Order (n)"
        subtitle={`Linear slope = λ/d. Record multiple orders to plot the line. d = ${(d * 1e6).toFixed(3)} μm`}
        data={graphData}
        xLabel="Order (n)"
        yLabel="sin θ"
        xDomain={[0, 4]}
        yDomain={[0, 0.25]}
        showPoints={true}
        showTrendline={graphData.length >= 2}
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
                    <h4 className="font-semibold mb-3">Laser Information</h4>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-border/50">
                          <td className="py-2 text-muted-foreground">Source</td>
                          <td className="py-2 font-medium">{ld.name}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 text-muted-foreground">Grating spacing (d)</td>
                          <td className="py-2 font-mono">{(d * 1e6).toFixed(3)} μm</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 text-muted-foreground">Orders recorded</td>
                          <td className="py-2 font-medium">{rows.length}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Wavelength Determination</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Mean calculated λ</p>
                        <p className="font-mono font-semibold text-sm">{meanLambda} nm</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Standard λ for {ld.name}</p>
                        <p className="font-mono font-semibold text-sm">{ld.wavelength} nm</p>
                      </div>
                    </div>
                  </div>
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    ✓ Observations recorded! The linear sin θ vs n graph confirms nλ = d sin θ.
                    Mean calculated wavelength: {meanLambda} nm (standard: {ld.wavelength} nm).
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

export default LaserDiffractionSimulator;
