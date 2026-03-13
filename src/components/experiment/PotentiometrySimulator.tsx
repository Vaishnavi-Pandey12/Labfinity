import { useState, useCallback, useRef, useEffect } from "react";
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
  Download,
} from "lucide-react";

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
        (selectedAcid as typeof ACIDS[number] & { Ka?: number }).Ka,
        (selectedBase as typeof BASES[number] & { Kb?: number }).Kb,
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

  // ── Wire path: dynamically measured so it always connects ──
  const containerRef = useRef<HTMLDivElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);
  const electrodeRef = useRef<HTMLDivElement>(null);
  const [wire1, setWire1] = useState("");
  const [wire2, setWire2] = useState("");

  useEffect(() => {
    const computeWire = () => {
      const c = containerRef.current;
      const m = meterRef.current;
      const e = electrodeRef.current;
      if (!c || !m || !e) return;
      const cr = c.getBoundingClientRect();
      const mr = m.getBoundingClientRect();
      const er = e.getBoundingClientRect();

      // Red terminal: left banana-jack on the meter (left side of the two jacks)
      const mx1 = mr.left - cr.left + mr.width * 0.36;
      const my1 = mr.bottom - cr.top;
      // Black terminal: slightly to the right
      const mx2 = mr.left - cr.left + mr.width * 0.58;
      const my2 = mr.bottom - cr.top;

      // Electrode top centre
      const ex = er.left - cr.left + er.width / 2;
      const ey = er.top - cr.top;

      // Control points: go DOWN from meter, then curve LEFT to electrode
      const cp1y = my1 + (ey - my1) * 0.55;
      const cp2x = ex + (mx1 - ex) * 0.4;

      setWire1(`M ${mx1} ${my1} C ${mx1} ${cp1y}, ${cp2x} ${ey - 20}, ${ex - 4} ${ey}`);
      setWire2(`M ${mx2} ${my2} C ${mx2} ${cp1y + 8}, ${cp2x + 12} ${ey - 14}, ${ex + 4} ${ey + 4}`);
    };

    computeWire();
    const ro = new ResizeObserver(computeWire);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", computeWire);
    return () => { ro.disconnect(); window.removeEventListener("resize", computeWire); };
  }, []);

  // ── Observation Table State ──
  const [tableRows, setTableRows] = useState<TableRow[]>([
    { volume: 0, pH: "" },
    { volume: 2, pH: "" },
    { volume: 4, pH: "" },
    { volume: 6, pH: "" },
    { volume: 8, pH: "" },
    { volume: 10, pH: "" },
    { volume: 12, pH: "" },
    { volume: 14, pH: "" },
    { volume: 16, pH: "" },
    { volume: 18, pH: "" },
    { volume: 20, pH: "" },
    { volume: 24, pH: "" },
    { volume: 28, pH: "" },
    { volume: 32, pH: "" },
    { volume: 36, pH: "" },
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

  const downloadTableCSV = () => {
    if (!processedTable || !tableMeta) return;

    const headers = [
      "S. No.",
      tableMeta.acid_col,
      tableMeta.base_col,
      "pH measured",
      "ΔpH",
      "ΔV",
      "ΔpH / ΔV",
      "Remark"
    ];

    const csvRows = processedTable.map(row => [
      row["S. No."],
      acidVolume.toFixed(1),
      row[tableMeta.base_col] ?? "",
      row["pH measured"] ?? "",
      row["ΔpH"] ?? "",
      row["ΔV"] ?? "",
      row["ΔpH / ΔV"] ?? "",
      row["Remark"] ?? ""
    ]);

    const csvContent = [headers.join(","), ...csvRows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `potentiometry_titration_table.csv`;
    link.click();
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
    } catch (e: unknown) {
      setTableError(e instanceof Error ? e.message : "Failed to generate table");
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

            {/* pH display removed — shown on pH Meter in apparatus */}
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
            <div
              ref={containerRef}
              className="relative h-[540px] bg-gradient-to-b from-background to-muted/30 rounded-xl overflow-hidden shadow-inner select-none"
            >

              {/* ── Table surface ── */}
              <div className="absolute bottom-0 left-0 right-0 h-5 bg-amber-900/15 border-t border-amber-700/20 rounded-b-xl" />

              {/* ══════════════════════════════════
                  STAND  (wider base so beaker sits on it)
              ══════════════════════════════════ */}
              {/* Base plate — widened to span under beaker */}
              <div className="absolute bottom-5 left-[40px] w-[230px] h-5 bg-gradient-to-r from-slate-600 to-slate-500 rounded shadow-lg" />
              {/* Vertical rod */}
              <div
                className="absolute left-[128px] w-3 bg-gradient-to-b from-slate-300 to-slate-400 rounded-t shadow-md"
                style={{ bottom: "calc(5px + 20px)", top: "8px" }}
              />

              {/* Burette clamp arm (horizontal, near top) */}
              <div className="absolute top-[20px] left-[128px] w-[70px] h-3 bg-gradient-to-r from-slate-500 to-slate-400 rounded-r shadow" />
              {/* Clamp ring around burette */}
              <div className="absolute top-[14px] left-[184px] w-5 h-[14px] bg-slate-600 rounded shadow z-30" />

              {/* ══════════════════════════════════
                  BURETTE  (clamped to stand rod)
              ══════════════════════════════════ */}
              <div className="absolute top-[8px] left-[190px] flex flex-col items-center z-20">
                {/* Top cap / funnel rim */}
                <div className="w-10 h-3 bg-slate-500 rounded-t-md shadow" />
                {/* Label above burette */}
                <div className="absolute -top-4 left-0 right-0 text-center text-[8px] font-mono text-slate-500 font-semibold">{selectedBase.value}</div>
                {/* Burette tube */}
                <div className="w-7 h-[260px] bg-white/10 backdrop-blur-sm border-2 border-slate-400/60 relative overflow-hidden shadow-xl">
                  {/* Graduation marks */}
                  {[...Array(11)].map((_, i) => (
                    <div key={i} className="absolute right-0 flex items-center gap-0.5" style={{ top: `${i * 9.1}%` }}>
                      <span className="text-[6px] text-slate-500 font-mono pr-0.5">{i * 4}</span>
                      <div className="w-2 h-[1px] bg-slate-500/70" />
                    </div>
                  ))}
                  {/* Liquid fill */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0"
                    style={{ background: selectedBase.value === "NH3" ? "rgba(250,204,21,0.45)" : "rgba(96,165,250,0.45)" }}
                    animate={{ height: `${Math.max(0, 100 - (volumeAdded / 40) * 100)}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
                {/* Stopcock */}
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 bg-slate-400" />
                  <div className={`w-9 h-2.5 bg-slate-700 rounded-full shadow transition-transform duration-300 ${isStirring ? "rotate-90" : ""}`} />
                  <div className="w-2 h-8 bg-slate-400 rounded-b-sm" />
                </div>
                {/* Drip drop */}
                <AnimatePresence>
                  {isStirring && (
                    <motion.div
                      initial={{ y: 0, opacity: 1, scale: 1 }}
                      animate={{ y: 60, opacity: 0, scale: 0.3 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.65, repeat: Infinity, ease: "linear" }}
                      className="w-2.5 h-3 bg-blue-400/80 rounded-b-full"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* ══════════════════════════════════
                  BEAKER  — centred under burette tip
                  Burette left-[190px] + w-7 → centre ≈ 204px
                  Beaker w-[130px] → left = 204 - 65 = 139px
              ══════════════════════════════════ */}
              {/* Support platform on stand base */}
              <div className="absolute bottom-[25px] left-[139px] w-[130px] h-3 bg-slate-500/70 rounded shadow-md" />

              {/* Beaker placed on platform, centred under burette */}
              <div className="absolute bottom-[38px] left-[139px] w-[130px] z-10">
                {/* Beaker glass body */}
                <div className="relative w-full h-[155px] bg-white/6 backdrop-blur-sm border-2 border-slate-300/50 border-t-0 rounded-b-2xl overflow-hidden shadow-xl">
                  {/* Rim highlight */}
                  <div className="absolute -top-0.5 left-0 right-0 h-1.5 bg-slate-300/40 rounded-full" />
                  {/* Measurement lines */}
                  {[25, 50, 75].map(pct => (
                    <div key={pct} className="absolute left-2 right-2 h-[1px] bg-slate-300/20" style={{ bottom: `${pct}%` }} />
                  ))}
                  {/* Solution */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 rounded-b-2xl"
                    style={{
                      backgroundColor: getSolutionColor(currentPH),
                      height: `${40 + volumeAdded * 1.1}%`,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="absolute top-0 w-full h-2 bg-white/20 blur-[1px]" />
                  </motion.div>
                  {/* Magnetic stirrer bar */}
                  <motion.div
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-2 bg-white/80 rounded-full shadow-md"
                    animate={isStirring ? { rotate: 360 } : {}}
                    transition={{ duration: 0.25, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                {/* Beaker top rim / pouring lip */}
                <div className="absolute -top-3 left-2 right-2 h-3 border-2 border-slate-300/50 border-b-0 rounded-t-sm" />
                {/* Label */}
                <div className="absolute -bottom-6 left-0 right-0 text-center text-[11px] font-medium text-muted-foreground">
                  {selectedAcid.value} + {selectedBase.value}
                </div>
              </div>

              {/* ══════════════════════════════════
                  ELECTRODE  — offset to left side of beaker
                  Beaker left=139, slightly inside left rim → left=156
              ══════════════════════════════════ */}
              <div ref={electrodeRef} className="absolute z-30" style={{ bottom: "80px", left: "160px" }}>
                {/* Electrode body */}
                <div className="w-[14px] h-[110px] bg-gradient-to-b from-slate-300 via-slate-200 to-slate-100 border border-slate-400/70 rounded-full shadow-lg flex flex-col items-center justify-end overflow-hidden">
                  {/* Sensing bulb at tip */}
                  <div className="w-full h-7 bg-blue-200/80 border-t border-slate-400/40 rounded-b-full" />
                </div>
              </div>

              {/* ══════════════════════════════════
                  pH METER  (right side, mounted)
              ══════════════════════════════════ */}
              {/* Dynamic wire SVG — drawn after refs measured */}
              {wire1 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-50" overflow="visible">
                  <path d={wire1} stroke="#ef4444" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d={wire2} stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </svg>
              )}

              <div ref={meterRef} className="absolute top-[30px] right-[16px] w-[108px] z-40">
                {/* Device body */}
                <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-3 flex flex-col items-center gap-2">
                  <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">PH METER</span>
                  {/* LCD */}
                  <div className="w-full bg-green-950 border border-green-800 rounded-md px-2 py-2 text-center shadow-inner">
                    <span className="text-green-400 font-mono text-[22px] font-bold tracking-wider leading-none">
                      {currentPH.toFixed(2)}
                    </span>
                    <span className="text-green-600 text-[10px] ml-1">pH</span>
                  </div>
                  {/* Status LED */}
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full shadow-md ${currentPH < 7 ? "bg-red-500" : currentPH > 7 ? "bg-blue-500" : "bg-green-500"
                      }`} />
                    <span className="text-[9px] text-slate-300">
                      {currentPH < 6.8 ? "Acidic" : currentPH > 7.2 ? "Basic" : "Neutral"}
                    </span>
                  </div>
                  {/* Banana jack terminals */}
                  <div className="flex gap-3 mt-0.5">
                    <div className="w-2.5 h-3.5 bg-red-500 rounded-sm shadow" />
                    <div className="w-2.5 h-3.5 bg-slate-900 rounded-sm shadow border border-slate-600" />
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>



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
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">Processed Results</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTableCSV}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </Button>
              </div>
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


    </div>
  );
};

export default PotentiometrySimulator;
