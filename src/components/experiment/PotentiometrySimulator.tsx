import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  RotateCcw,
  Droplets,
  Beaker,
  FlaskConical,
  Table2,
} from "lucide-react";
import AbsorbanceGraph from "./AbsorbanceGraph";

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────
interface DataPoint { volume: number; pH: number }

interface TableRow {
  volume: number;         // base volume (editable)
  pH: string;             // student input
}

interface ProcessedRow {
  "S. No.": number;
  [key: string]: string | number;
}

// ─────────────────────────────────────────────
//  Chemistry config
// ─────────────────────────────────────────────
const ACIDS = [
  { value: "HCl", label: "HCl (Hydrochloric Acid)", type: "strong" },
  { value: "H2SO4", label: "H₂SO₄ (Sulphuric Acid)", type: "diprotic" },
  { value: "CH3COOH", label: "CH₃COOH (Acetic Acid)", type: "weak", Ka: 1.8e-5 },
];

const BASES = [
  { value: "NaOH", label: "NaOH (Sodium Hydroxide)", type: "strong" },
  { value: "KOH", label: "KOH (Potassium Hydroxide)", type: "strong" },
  { value: "NH3", label: "NH₃ (Ammonia)", type: "weak", Kb: 1.8e-5 },
];

// ─────────────────────────────────────────────
//  pH calculation engine
// ─────────────────────────────────────────────
function calculatePH(
  volumeBase: number,
  acidVolume: number,
  acidConc: number,
  baseConc: number,
  acidType: string,
  baseType: string,
  Ka?: number,
  Kb?: number,
): number {
  // Moles of H+ from acid
  const nFactor = acidType === "diprotic" ? 2 : 1;
  const molesAcid = (acidVolume / 1000) * acidConc; // mol acid
  const molesH = molesAcid * nFactor;              // mol H+
  const molesBase = (volumeBase / 1000) * baseConc;
  const totalVolume = (acidVolume + volumeBase) / 1000;

  if (acidType === "strong" || acidType === "diprotic") {
    // strong acid vs strong/weak base
    const excess = molesH - molesBase;
    if (excess > molesH * 0.001) {
      const hConc = excess / totalVolume;
      return Math.max(0, Math.min(14, -Math.log10(hConc)));
    } else if (-excess > molesH * 0.001) {
      // excess base
      if (baseType === "strong") {
        const ohConc = -excess / totalVolume;
        return Math.max(0, Math.min(14, 14 + Math.log10(ohConc)));
      } else {
        // weak base (NH3) - approximate
        const ohConc = Math.sqrt((Kb ?? 1.8e-5) * (-excess / totalVolume));
        return Math.max(0, Math.min(14, 14 + Math.log10(ohConc)));
      }
    } else {
      return 7;
    }
  } else {
    // weak acid (CH3COOH) - Henderson-Hasselbalch
    const ka = Ka ?? 1.8e-5;
    if (molesBase >= molesAcid) {
      if (molesBase > molesAcid * 1.001) {
        const excessBase = molesBase - molesAcid;
        const ohConc = baseType === "strong"
          ? excessBase / totalVolume
          : Math.sqrt((Kb ?? 1.8e-5) * excessBase / totalVolume);
        return Math.max(0, Math.min(14, 14 + Math.log10(ohConc)));
      }
      return -Math.log10(ka) + Math.log10(1); // equivalence ≈ weak base pH
    }
    const molesConjugate = molesBase;
    const molesAcidLeft = molesAcid - molesBase;
    return Math.max(0, Math.min(14, -Math.log10(ka) + Math.log10(molesConjugate / molesAcidLeft)));
  }
}

// ─────────────────────────────────────────────
//  Color helper
// ─────────────────────────────────────────────
const getSolutionColor = (pH: number) => {
  if (pH < 2) return "rgba(239,68,68,0.55)";
  if (pH < 4) return "rgba(249,115,22,0.50)";
  if (pH < 6) return "rgba(234,179,8,0.45)";
  if (pH < 8) return "rgba(34,197,94,0.40)";
  if (pH < 10) return "rgba(59,130,246,0.50)";
  if (pH < 12) return "rgba(99,102,241,0.50)";
  return "rgba(168,85,247,0.55)";
};

// ─────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────
const PotentiometrySimulator = () => {
  // ── Reagent selection ──
  const [selectedAcid, setSelectedAcid] = useState(ACIDS[0]);
  const [selectedBase, setSelectedBase] = useState(BASES[0]);

  // ── Simulation state ──
  const [volumeAdded, setVolumeAdded] = useState(0);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [isStirring, setIsStirring] = useState(false);

  const acidConc = 0.1;
  const baseConc = 0.1;
  const acidVolume = 20; // mL

  const getPH = useCallback(
    (vol: number) =>
      calculatePH(
        vol,
        acidVolume,
        acidConc,
        baseConc,
        selectedAcid.type,
        selectedBase.type,
        (selectedAcid as any).Ka,
        (selectedBase as any).Kb,
      ),
    [selectedAcid, selectedBase],
  );

  const currentPH = getPH(volumeAdded);
  const equivalenceVolume = (acidVolume * acidConc * (selectedAcid.type === "diprotic" ? 2 : 1)) / baseConc;

  const addTitrant = (amount: number) => {
    const nv = Math.min(volumeAdded + amount, 40);
    setVolumeAdded(nv);
    setIsStirring(true);
    setTimeout(() => setIsStirring(false), 800);
  };

  const recordReading = () => {
    const pH = getPH(volumeAdded);
    setDataPoints(prev => {
      const filtered = prev.filter(p => p.volume !== volumeAdded);
      return [...filtered, { volume: volumeAdded, pH }].sort((a, b) => a.volume - b.volume);
    });
  };

  const resetExperiment = () => {
    setVolumeAdded(0);
    setDataPoints([]);
    setIsStirring(false);
  };

  // ── Observation Table State ──
  const [tableRows, setTableRows] = useState<TableRow[]>([
    { volume: 0, pH: "" },
    { volume: 5, pH: "" },
    { volume: 10, pH: "" },
    { volume: 15, pH: "" },
    { volume: 20, pH: "" },
    { volume: 25, pH: "" },
  ]);
  const [processedTable, setProcessedTable] = useState<ProcessedRow[] | null>(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState("");
  const [tableMeta, setTableMeta] = useState<{ acid_col: string; base_col: string } | null>(null);

  const updateTableRow = (idx: number, field: keyof TableRow, value: string) => {
    setTableRows(prev => {
      const copy = [...prev];
      if (field === "volume") {
        copy[idx] = { ...copy[idx], volume: parseFloat(value) || 0 };
      } else {
        copy[idx] = { ...copy[idx], pH: value };
      }
      return copy;
    });
  };

  const generateTable = async () => {
    setTableLoading(true);
    setTableError("");
    setProcessedTable(null);
    try {
      const trials = tableRows.map(r => ({
        volume: r.volume,
        pH: r.pH !== "" ? parseFloat(r.pH) : null,
      }));
      const resp = await fetch("http://localhost:8000/api/potentiometry-table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acid: selectedAcid.value,
          base: selectedBase.value,
          acid_volume: acidVolume,
          trials,
        }),
      });
      if (!resp.ok) throw new Error(`Server error ${resp.status}`);
      const data = await resp.json();
      setProcessedTable(data.table);
      setTableMeta({ acid_col: data.acid_col, base_col: data.base_col });
    } catch (e: any) {
      setTableError(e.message ?? "Failed to generate table");
    } finally {
      setTableLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Row 1: Controls + Apparatus ── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Controls */}
        <Card className="glass-card border-0 order-2 lg:order-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <Droplets className="w-5 h-5 text-primary" />
              Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Reagent selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Acid
                </label>
                <select
                  className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={selectedAcid.value}
                  onChange={e => {
                    const a = ACIDS.find(x => x.value === e.target.value)!;
                    setSelectedAcid(a);
                    resetExperiment();
                  }}
                >
                  {ACIDS.map(a => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Base
                </label>
                <select
                  className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={selectedBase.value}
                  onChange={e => {
                    const b = BASES.find(x => x.value === e.target.value)!;
                    setSelectedBase(b);
                    resetExperiment();
                  }}
                >
                  {BASES.map(b => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Setup info */}
            <div className="bg-muted/50 p-4 rounded-xl text-sm text-muted-foreground space-y-1">
              <p>• <span className="font-medium text-foreground">{selectedAcid.value}</span> volume: {acidVolume} mL ({acidConc} M)</p>
              <p>• <span className="font-medium text-foreground">{selectedBase.value}</span> concentration: {baseConc} M</p>
              <p>• Expected equivalence: <span className="font-mono">{equivalenceVolume.toFixed(1)} mL</span></p>
            </div>

            {/* Volume slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{selectedBase.value} Added</label>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {volumeAdded.toFixed(1)} mL
                </span>
              </div>
              <Slider
                value={[volumeAdded]}
                onValueChange={([v]) => setVolumeAdded(v)}
                min={0} max={40} step={0.5}
                className="py-2"
              />
            </div>

            {/* Quick add buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[0.5, 1, 2, 5].map(amount => (
                <Button key={amount} variant="outline" size="sm" onClick={() => addTitrant(amount)}>
                  +{amount} mL
                </Button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button onClick={recordReading} className="flex-1 gap-2 lab-gradient-bg text-primary-foreground">
                <Play className="w-4 h-4" /> Record Reading
              </Button>
              <Button variant="outline" onClick={resetExperiment} className="gap-2">
                <RotateCcw className="w-4 h-4" /> Reset
              </Button>
            </div>

            {/* pH display */}
            <div className="bg-primary/10 rounded-xl p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Current pH</p>
                <p className="text-4xl font-display font-bold text-primary">
                  {currentPH.toFixed(2)}
                </p>
                <div className="relative w-full h-3 rounded-full mt-3 overflow-hidden"
                  style={{ background: "linear-gradient(to right,#ef4444,#f97316,#eab308,#22c55e,#3b82f6,#8b5cf6)" }}
                >
                  <div
                    className="absolute top-0 w-3 h-3 bg-white border-2 border-foreground rounded-full transition-all duration-300 shadow"
                    style={{ left: `${(currentPH / 14) * 100}%`, transform: "translateX(-50%)" }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Acidic</span><span>Neutral</span><span>Basic</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Apparatus ── */}
        <Card className="glass-card border-0 order-1 lg:order-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <Beaker className="w-5 h-5 text-primary" />
              Titration Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-[520px] bg-gradient-to-b from-background to-muted/30 rounded-xl overflow-hidden shadow-inner select-none">

              {/* Table surface */}
              <div className="absolute bottom-0 left-0 right-0 h-5 bg-amber-900/15 border-t border-amber-700/20 rounded-b-xl" />

              {/* ─── Stand ─── */}
              {/* Base plate */}
              <div className="absolute bottom-5 left-[80px] w-40 h-4 bg-gradient-to-r from-slate-600 to-slate-500 rounded shadow-lg" />
              {/* Vertical rod */}
              <div className="absolute bottom-9 left-[154px] w-3 bg-gradient-to-r from-slate-400 to-slate-300 rounded-t shadow-md"
                style={{ height: "calc(100% - 56px)" }} />
              {/* Horizontal clamp arm (for burette) */}
              <div className="absolute top-[32px] left-[154px] w-28 h-3 bg-gradient-to-r from-slate-500 to-slate-400 rounded-r shadow" />
              {/* Clamp block */}
              <div className="absolute top-[26px] left-[148px] w-10 h-[14px] bg-slate-600 rounded shadow" />

              {/* ─── Burette ─── */}
              {/* Mounted via clamp at left-[268px] (end of arm) */}
              <div className="absolute top-[12px] left-[264px] flex flex-col items-center z-20">
                {/* Burette top cap */}
                <div className="w-9 h-3 bg-slate-500 rounded-t shadow" />
                {/* Burette body */}
                <div className="w-7 h-72 bg-white/15 backdrop-blur-sm border-2 border-slate-400/60 relative overflow-hidden shadow-xl">
                  {/* Graduation marks */}
                  {[...Array(11)].map((_, i) => (
                    <div key={i} className="absolute right-0 flex items-center gap-0.5" style={{ top: `${i * 9.1}%` }}>
                      <span className="text-[6px] text-slate-500 font-mono pr-0.5">{i * 4}</span>
                      <div className="w-2 h-[1px] bg-slate-500/70" />
                    </div>
                  ))}
                  {/* Liquid */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0"
                    style={{ background: selectedBase.value === "NH3" ? "rgba(250,204,21,0.4)" : "rgba(96,165,250,0.4)" }}
                    animate={{ height: `${Math.max(0, 100 - (volumeAdded / 40) * 100)}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                  {/* Fill label */}
                  <div className="absolute top-1 left-0 right-0 text-center text-[7px] font-mono text-slate-500">{selectedBase.value}</div>
                </div>
                {/* Stopcock */}
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 bg-slate-400" />
                  <div className={`w-8 h-2 bg-slate-700 rounded-full transition-transform duration-300 shadow ${isStirring ? "rotate-90" : ""}`} />
                  <div className="w-2 h-7 bg-slate-400 rounded-b-sm" />
                </div>
                {/* Drip */}
                <AnimatePresence>
                  {isStirring && (
                    <motion.div
                      initial={{ y: 0, opacity: 1, scale: 1 }}
                      animate={{ y: 55, opacity: 0, scale: 0.4 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                      className="absolute top-[100%] left-1/2 -translate-x-1/2 w-2.5 h-3 bg-blue-400/70 rounded-b-full"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* ─── Beaker on stand base ─── */}
              {/* Stand platform under beaker (different from base rod) */}
              <div className="absolute bottom-9 left-[88px] w-36 h-3 bg-slate-500/60 rounded shadow" />

              <div className="absolute bottom-[52px] left-[96px] w-36 z-10">
                {/* Beaker body */}
                <div className="relative w-full h-44 bg-white/8 backdrop-blur-sm border-2 border-slate-300/50 border-t-0 rounded-b-2xl overflow-hidden shadow-xl">
                  {/* Rim */}
                  <div className="absolute -top-0.5 left-0 right-0 h-1.5 bg-slate-300/40 rounded-full" />
                  {/* Solution */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 rounded-b-2xl transition-colors duration-700"
                    style={{
                      backgroundColor: getSolutionColor(currentPH),
                      height: `${45 + volumeAdded * 1.2}%`,
                    }}
                  >
                    <div className="absolute top-0 w-full h-2 bg-white/25 blur-[1px]" />
                  </motion.div>
                  {/* Magnetic stirrer */}
                  <motion.div
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 w-7 h-2 bg-white/80 rounded-full shadow-md"
                    animate={isStirring ? { rotate: 360 } : {}}
                    transition={{ duration: 0.25, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                {/* Beaker spout / rim top */}
                <div className="absolute -top-3 left-2 right-2 h-3 border-2 border-slate-300/50 border-b-0 rounded-t-sm" />
                {/* Beaker label */}
                <div className="absolute -bottom-6 left-0 right-0 text-center text-xs font-medium text-muted-foreground">
                  {selectedAcid.value} + {selectedBase.value}
                </div>
              </div>

              {/* ─── Electrode ─── */}
              {/* Probe inside beaker  */}
              <div className="absolute bottom-[94px] left-[208px] z-30 flex flex-col items-center">
                {/* Wire going up-right to pH meter */}
                <svg className="absolute bottom-[100%] left-1/2" width="90" height="120" style={{ transform: "translateX(-50%)" }} overflow="visible">
                  <path d="M 28 110 C 28 60, 80 40, 80 0" stroke="#94a3b8" strokeWidth="1.5" fill="none" strokeDasharray="none" />
                </svg>
                {/* Electrode body */}
                <div className="w-4 h-36 bg-gradient-to-b from-slate-300 to-slate-200 border border-slate-400/70 rounded-full shadow-lg flex flex-col items-center justify-end overflow-hidden">
                  <div className="w-full h-6 bg-blue-200/70 border-t border-slate-400/40 rounded-b-full" />
                </div>
              </div>

              {/* ─── pH Meter / Digital Voltmeter ─── */}
              <div className="absolute top-[28px] right-6 w-[96px] z-40">
                {/* Device body */}
                <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-2.5 flex flex-col items-center gap-2">
                  <span className="text-[9px] text-slate-400 font-semibold tracking-widest uppercase">pH Meter</span>
                  {/* LCD display */}
                  <div className="w-full bg-green-950 border border-green-800 rounded-md px-2 py-1.5 text-center shadow-inner">
                    <span className="text-green-400 font-mono text-xl font-bold tracking-wider">
                      {currentPH.toFixed(2)}
                    </span>
                    <span className="text-green-600 text-[10px] ml-1">pH</span>
                  </div>
                  {/* Indicator LED */}
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full shadow ${currentPH < 7 ? "bg-red-500" : currentPH > 7 ? "bg-blue-500" : "bg-green-500"}`} />
                    <span className="text-[9px] text-slate-400">
                      {currentPH < 6.8 ? "Acidic" : currentPH > 7.2 ? "Basic" : "Neutral"}
                    </span>
                  </div>
                  {/* Probe terminals */}
                  <div className="flex gap-2 mt-0.5">
                    <div className="w-2 h-3 bg-red-500/80 rounded-sm" />
                    <div className="w-2 h-3 bg-black rounded-sm" />
                  </div>
                </div>
                {/* Wire from meter down to electrode */}
                <div className="w-[1.5px] h-16 bg-slate-400/70 mx-auto" />
              </div>

            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Titration Curve ── */}
      <AbsorbanceGraph
        title="Titration Curve"
        subtitle={`pH vs Volume of ${selectedBase.value}`}
        data={dataPoints.map(d => ({ x: d.volume, y: d.pH }))}
        xLabel={`Volume of ${selectedBase.value} (mL)`}
        yLabel="pH"
        showPoints
        lineColor="#22c55e"
        xDomain={[0, 40]}
      />

      {/* ── Observation Table (Backend-connected) ── */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display">
            <Table2 className="w-5 h-5 text-primary" />
            Observation Table
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter the volume of <strong>{selectedBase.value}</strong> added and your observed <strong>pH</strong> for each reading, then click <em>Generate Table</em>.
          </p>

          {/* Input grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground">S.No</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground">
                    Volume of {selectedAcid.value} (mL)
                  </th>
                  <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground">
                    Volume of {selectedBase.value} (mL)
                  </th>
                  <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground">
                    Observed pH
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, i) => (
                  <tr key={i} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                    <td className="py-2 px-3 text-muted-foreground">{i + 1}</td>
                    {/* Acid volume - fixed */}
                    <td className="py-2 px-3">
                      <span className="font-mono text-sm bg-muted/50 px-3 py-1.5 rounded-md inline-block">
                        {acidVolume.toFixed(1)}
                      </span>
                    </td>
                    {/* Base volume - editable */}
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={row.volume}
                        onChange={e => updateTableRow(i, "volume", e.target.value)}
                        className="w-24 bg-background border border-border rounded-md px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </td>
                    {/* pH - student enters */}
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min={0}
                        max={14}
                        step={0.01}
                        placeholder="Enter pH"
                        value={row.pH}
                        onChange={e => updateTableRow(i, "pH", e.target.value)}
                        className="w-28 bg-background border border-border rounded-md px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/50"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Generate button */}
          <div className="flex items-center gap-3">
            <Button
              onClick={generateTable}
              disabled={tableLoading}
              className="gap-2 lab-gradient-bg text-primary-foreground"
            >
              <FlaskConical className="w-4 h-4" />
              {tableLoading ? "Generating…" : "Generate Table"}
            </Button>
            {tableError && (
              <span className="text-sm text-destructive">{tableError}</span>
            )}
          </div>

          {/* Processed result table */}
          {processedTable && tableMeta && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="overflow-x-auto"
            >
              <p className="text-sm font-semibold mb-2 text-foreground">Processed Results</p>
              <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
                <thead className="bg-muted/60">
                  <tr>
                    {[
                      "S. No.",
                      tableMeta.acid_col,
                      tableMeta.base_col,
                      "pH measured",
                      "ΔpH",
                      "ΔV",
                      "ΔpH / ΔV",
                      "Remark",
                    ].map(col => (
                      <th key={col} className="text-left py-2.5 px-3 font-semibold text-muted-foreground whitespace-nowrap border-b border-border">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processedTable.map((row, i) => {
                    const isEquiv = (row["Remark"] as string).includes("Equivalence");
                    return (
                      <tr
                        key={i}
                        className={`border-b border-border/40 transition-colors ${isEquiv ? "bg-emerald-500/10 font-semibold" : "hover:bg-muted/30"}`}
                      >
                        <td className="py-2 px-3">{row["S. No."]}</td>
                        <td className="py-2 px-3 font-mono">{acidVolume.toFixed(1)}</td>
                        <td className="py-2 px-3 font-mono">{row[tableMeta.base_col] ?? "-"}</td>
                        <td className="py-2 px-3 font-mono">{row["pH measured"]}</td>
                        <td className="py-2 px-3 font-mono">{row["ΔpH"]}</td>
                        <td className="py-2 px-3 font-mono">{row["ΔV"]}</td>
                        <td className="py-2 px-3 font-mono">{row["ΔpH / ΔV"]}</td>
                        <td className="py-2 px-3">
                          {isEquiv ? (
                            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                              ★ Equivalence Point
                            </span>
                          ) : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* ── Simulation Data Table ── */}
      {dataPoints.length > 0 && (
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="font-display">Simulation Readings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">S.No</th>
                    <th className="text-left py-3 px-4 font-semibold">Volume {selectedBase.value} (mL)</th>
                    <th className="text-left py-3 px-4 font-semibold">pH</th>
                    <th className="text-left py-3 px-4 font-semibold">ΔpH/ΔV</th>
                  </tr>
                </thead>
                <tbody>
                  {dataPoints.map((point, index) => {
                    const prev = dataPoints[index - 1];
                    const deriv = prev
                      ? (point.pH - prev.pH) / (point.volume - prev.volume || 1)
                      : 0;
                    return (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="border-b border-border/40 hover:bg-muted/40"
                      >
                        <td className="py-2.5 px-4">{index + 1}</td>
                        <td className="py-2.5 px-4 font-mono">{point.volume.toFixed(1)}</td>
                        <td className="py-2.5 px-4 font-mono">{point.pH.toFixed(2)}</td>
                        <td className="py-2.5 px-4 font-mono">{deriv.toFixed(2)}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {dataPoints.some(p => Math.abs(p.volume - equivalenceVolume) < 1.5) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20"
              >
                <p className="text-green-600 dark:text-green-400 font-medium text-sm">
                  ✓ Equivalence point reached at ≈ {equivalenceVolume.toFixed(1)} mL {selectedBase.value}
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PotentiometrySimulator;
