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
} from "lucide-react";
import AbsorbanceGraph from "./AbsorbanceGraph";

/* ─── Chemistry helpers ─────────────────────────────────────────────────── */

interface DataPoint {
  volume: number;
  pH: number;
}

const computePH = (
  volNaOH: number,
  volHCl: number,
  cHCl: number,
  cNaOH: number
): number => {
  const molesHCl = (volHCl / 1000) * cHCl;
  const molesNaOH = (volNaOH / 1000) * cNaOH;
  const totalVol = (volHCl + volNaOH) / 1000;

  const NEAR_EP = 0.001;

  if (molesNaOH < molesHCl - NEAR_EP) {
    const cH = (molesHCl - molesNaOH) / totalVol;
    return Math.max(0, Math.min(14, -Math.log10(cH)));
  } else if (molesNaOH > molesHCl + NEAR_EP) {
    const cOH = (molesNaOH - molesHCl) / totalVol;
    const pOH = -Math.log10(cOH);
    return Math.max(0, Math.min(14, 14 - pOH));
  } else {
    return 7.0;
  }
};

/* ─── Solution colour based on pH ───────────────────────────────────────── */
const getSolutionColor = (pH: number): string => {
  if (pH < 2) return "rgba(220, 38, 38, 0.60)";
  if (pH < 4) return "rgba(249, 115, 22, 0.55)";
  if (pH < 6) return "rgba(234, 179, 8, 0.55)";
  if (pH < 8) return "rgba(34, 197, 94, 0.45)";
  if (pH < 10) return "rgba(59, 130, 246, 0.50)";
  if (pH < 12) return "rgba(99, 102, 241, 0.55)";
  return "rgba(168, 85, 247, 0.60)";
};

/* ─── Constants ──────────────────────────────────────────────────────────── */
const VOL_HCL = 10;     // mL — analyte in beaker
const C_HCL = 0.025;  // mol/L — unknown HCl
const C_NAOH = 0.1;    // mol/L — standard NaOH in burette
const MAX_VOL = 15;     // mL burette range
const EQ_VOL = (VOL_HCL * C_HCL) / C_NAOH; // 2.5 mL

/* ─── Component ──────────────────────────────────────────────────────────── */
const PHMetrySimulator = () => {
  const [volAdded, setVolAdded] = useState(0);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [isDropping, setIsDropping] = useState(false);

  const currentPH = computePH(volAdded, VOL_HCL, C_HCL, C_NAOH);

  /* Add titrant (from quick buttons) */
  const addTitrant = useCallback((amount: number) => {
    setVolAdded(prev => Math.min(prev + amount, MAX_VOL));
    setIsDropping(true);
    setTimeout(() => setIsDropping(false), 800);
  }, []);

  /* Slider change */
  const handleSlider = useCallback((val: number) => {
    setVolAdded(val);
  }, []);

  /* Record current reading */
  const recordReading = useCallback(() => {
    const pH = computePH(volAdded, VOL_HCL, C_HCL, C_NAOH);
    setDataPoints(prev => {
      const filtered = prev.filter(p => p.volume !== volAdded);
      return [...filtered, { volume: volAdded, pH }].sort((a, b) => a.volume - b.volume);
    });
  }, [volAdded]);

  /* Reset */
  const reset = useCallback(() => {
    setVolAdded(0);
    setDataPoints([]);
    setIsDropping(false);
  }, []);

  /* ── Wire path: dynamically measured so it always connects ── */
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

      // Red terminal: left banana-jack on the meter
      const mx1 = mr.left - cr.left + mr.width * 0.36;
      const my1 = mr.bottom - cr.top;
      // Black terminal: slightly to the right
      const mx2 = mr.left - cr.left + mr.width * 0.58;
      const my2 = mr.bottom - cr.top;

      // Electrode top centre
      const ex = er.left - cr.left + er.width / 2;
      const ey = er.top - cr.top;

      // Control points: go DOWN from meter, then curve to electrode
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

  /* Derived values */
  const buretteFill = Math.max(0, 1 - volAdded / MAX_VOL);
  const beakerFillPct = 35 + (volAdded / MAX_VOL) * 30;
  const epReached = dataPoints.some(p => Math.abs(p.volume - EQ_VOL) <= 0.6);

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

            {/* Setup info */}
            <div className="bg-muted/50 p-4 rounded-xl text-sm text-muted-foreground space-y-1">
              <p>• <span className="font-medium text-foreground">HCl</span> volume: {VOL_HCL} mL ({C_HCL} M — analyte)</p>
              <p>• <span className="font-medium text-foreground">NaOH</span> concentration: {C_NAOH} M (titrant)</p>
              <p>• Expected equivalence: <span className="font-mono">{EQ_VOL.toFixed(1)} mL NaOH</span></p>
            </div>

            {/* Volume slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">NaOH Added</label>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {volAdded.toFixed(1)} mL
                </span>
              </div>
              <Slider
                value={[volAdded]}
                onValueChange={([v]) => handleSlider(v)}
                min={0} max={MAX_VOL} step={0.5}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 mL</span>
                <span className="text-primary font-medium">EP ≈ {EQ_VOL.toFixed(1)} mL</span>
                <span>{MAX_VOL} mL</span>
              </div>
            </div>

            {/* Quick add buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[0.5, 1, 2, 5].map(amount => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => addTitrant(amount)}
                  disabled={volAdded >= MAX_VOL}
                >
                  +{amount} mL
                </Button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button onClick={recordReading} className="flex-1 gap-2 lab-gradient-bg text-primary-foreground">
                <Play className="w-4 h-4" /> Record Reading
              </Button>
              <Button variant="outline" onClick={reset} className="gap-2">
                <RotateCcw className="w-4 h-4" /> Reset
              </Button>
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
            <div
              ref={containerRef}
              className="relative h-[540px] bg-gradient-to-b from-background to-muted/30 rounded-xl overflow-hidden shadow-inner select-none"
            >

              {/* ── Table surface ── */}
              <div className="absolute bottom-0 left-0 right-0 h-5 bg-amber-900/15 border-t border-amber-700/20 rounded-b-xl" />

              {/* ══════════════════════════════════
                  STAND
              ══════════════════════════════════ */}
              {/* Base plate */}
              <div className="absolute bottom-5 left-[40px] w-[230px] h-5 bg-gradient-to-r from-slate-600 to-slate-500 rounded shadow-lg" />
              {/* Vertical rod */}
              <div
                className="absolute left-[128px] w-3 bg-gradient-to-b from-slate-300 to-slate-400 rounded-t shadow-md"
                style={{ bottom: "calc(5px + 20px)", top: "8px" }}
              />

              {/* Burette clamp arm (horizontal, near top) */}
              <div className="absolute top-[20px] left-[128px] w-[70px] h-3 bg-gradient-to-r from-slate-500 to-slate-400 rounded-r shadow" />
              {/* Clamp ring */}
              <div className="absolute top-[14px] left-[184px] w-5 h-[14px] bg-slate-600 rounded shadow z-30" />

              {/* ══════════════════════════════════
                  BURETTE
              ══════════════════════════════════ */}
              <div className="absolute top-[8px] left-[190px] flex flex-col items-center z-20">
                {/* Top cap */}
                <div className="w-10 h-3 bg-slate-500 rounded-t-md shadow" />
                {/* Label */}
                <div className="absolute -top-4 left-0 right-0 text-center text-[8px] font-mono text-slate-500 font-semibold">NaOH</div>
                {/* Tube */}
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
                    className="absolute bottom-0 left-0 right-0 bg-blue-400/45"
                    animate={{ height: `${buretteFill * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
                {/* Stopcock */}
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 bg-slate-400" />
                  <div className={`w-9 h-2.5 bg-slate-700 rounded-full shadow transition-transform duration-300 ${isDropping ? "rotate-90" : ""}`} />
                  <div className="w-2 h-8 bg-slate-400 rounded-b-sm" />
                </div>
                {/* Drip drop */}
                <AnimatePresence>
                  {isDropping && (
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
              ══════════════════════════════════ */}
              {/* Support platform on stand base */}
              <div className="absolute bottom-[25px] left-[139px] w-[130px] h-3 bg-slate-500/70 rounded shadow-md" />

              {/* Beaker */}
              <div className="absolute bottom-[38px] left-[139px] w-[130px] z-10">
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
                    animate={{
                      height: `${beakerFillPct}%`,
                      backgroundColor: getSolutionColor(currentPH),
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="absolute top-0 w-full h-2 bg-white/20 blur-[1px]" />
                  </motion.div>
                  {/* Magnetic stirrer bar */}
                  <motion.div
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-2 bg-white/80 rounded-full shadow-md"
                    animate={isDropping ? { rotate: 360 } : {}}
                    transition={{ duration: 0.25, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                {/* Beaker top rim */}
                <div className="absolute -top-3 left-2 right-2 h-3 border-2 border-slate-300/50 border-b-0 rounded-t-sm" />
                {/* Label */}
                <div className="absolute -bottom-6 left-0 right-0 text-center text-[11px] font-medium text-muted-foreground">
                  HCl + NaOH
                </div>
              </div>

              {/* ══════════════════════════════════
                  ELECTRODE  — offset to left side of beaker
              ══════════════════════════════════ */}
              <div ref={electrodeRef} className="absolute z-30" style={{ bottom: "80px", left: "160px" }}>
                <div className="w-[14px] h-[110px] bg-gradient-to-b from-slate-300 via-slate-200 to-slate-100 border border-slate-400/70 rounded-full shadow-lg flex flex-col items-center justify-end overflow-hidden">
                  {/* Sensing bulb at tip */}
                  <div className="w-full h-7 bg-blue-200/80 border-t border-slate-400/40 rounded-b-full" />
                </div>
              </div>

              {/* ══════════════════════════════════
                  pH METER  (right side)
              ══════════════════════════════════ */}
              {/* Dynamic wire SVG */}
              {wire1 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-50" overflow="visible">
                  <path d={wire1} stroke="#ef4444" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d={wire2} stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </svg>
              )}

              <div ref={meterRef} className="absolute top-[30px] right-[16px] w-[108px] z-40">
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
                    <div className={`w-2.5 h-2.5 rounded-full shadow-md ${currentPH < 7 ? "bg-red-500" : currentPH > 7 ? "bg-blue-500" : "bg-green-500"}`} />
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

      {/* ── Titration Curve ─────────────────────────────────────────────────── */}
      <AbsorbanceGraph
        title="pH Titration Curve"
        subtitle="pH vs Volume of NaOH added — the inflection point is the equivalence point"
        data={dataPoints.map(d => ({ x: d.volume, y: d.pH }))}
        xLabel="Volume of NaOH (mL)"
        yLabel="pH"
        showPoints
        lineColor="#22c55e"
        xDomain={[0, MAX_VOL]}
        yDomain={[0, 14]}
      />

      {/* ── Observation Table ───────────────────────────────────────────────── */}
      {dataPoints.length > 0 && (
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <FlaskConical className="w-5 h-5 text-primary" />
              Observation Table
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">S.No</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Volume NaOH (mL)</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">pH</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">ΔpH / ΔV</th>
                  </tr>
                </thead>
                <tbody>
                  {dataPoints.map((point, index) => {
                    const prev = dataPoints[index - 1];
                    const dv = prev ? point.volume - prev.volume : 0;
                    const derivative = prev && dv !== 0
                      ? (point.pH - prev.pH) / dv
                      : "—";
                    const isEP = Math.abs(point.volume - EQ_VOL) <= 0.6;
                    return (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className={`border-b border-border/50 hover:bg-muted/50 ${isEP ? "bg-green-500/5" : ""}`}
                      >
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4 font-mono">{point.volume.toFixed(1)}</td>
                        <td className={`py-3 px-4 font-mono font-semibold ${isEP ? "text-green-500" : ""}`}>
                          {point.pH.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          {typeof derivative === "number" ? derivative.toFixed(3) : derivative}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Equivalence point result */}
            {epReached && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-green-500/10 rounded-xl border border-green-500/20"
              >
                <p className="text-green-600 dark:text-green-400 font-semibold mb-1">
                  ✓ Equivalence point reached at ≈ {EQ_VOL.toFixed(1)} mL NaOH
                </p>
                <p className="text-sm text-muted-foreground font-mono">
                  M(HCl) = (M(NaOH) × V(NaOH)) / V(HCl) = ({C_NAOH} × {EQ_VOL.toFixed(1)}) / {VOL_HCL}
                  = <span className="font-bold text-foreground">{((C_NAOH * EQ_VOL) / VOL_HCL).toFixed(4)} M</span>
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PHMetrySimulator;
