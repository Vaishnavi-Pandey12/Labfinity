import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, RotateCcw, Droplets, FlaskConical, Info } from "lucide-react";
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
  const totalVol = (volHCl + volNaOH) / 1000; // in litres

  const NEAR_EP = 0.001; // 1 mmol tolerance for "at equivalence"

  if (molesNaOH < molesHCl - NEAR_EP) {
    // Acidic — excess HCl
    const cH = (molesHCl - molesNaOH) / totalVol;
    return -Math.log10(cH);
  } else if (molesNaOH > molesHCl + NEAR_EP) {
    // Basic — excess NaOH
    const cOH = (molesNaOH - molesHCl) / totalVol;
    const pOH = -Math.log10(cOH);
    return 14 - pOH;
  } else {
    return 7.0; // Equivalence point — NaCl(aq)
  }
};

/* ─── Solution colour based on pH ───────────────────────────────────────── */
const phColor = (pH: number): string => {
  if (pH < 2)  return "rgba(220, 38, 38, 0.60)";   // deep red
  if (pH < 4)  return "rgba(249, 115, 22, 0.55)";  // orange
  if (pH < 6)  return "rgba(234, 179, 8, 0.55)";   // yellow
  if (pH < 8)  return "rgba(34, 197, 94, 0.45)";   // green
  if (pH < 10) return "rgba(59, 130, 246, 0.50)";  // blue
  if (pH < 12) return "rgba(99, 102, 241, 0.55)";  // indigo
  return "rgba(168, 85, 247, 0.60)";               // purple
};

const phLabel = (pH: number): { text: string; color: string } => {
  if (pH < 4)  return { text: "Strongly Acidic", color: "text-red-500" };
  if (pH < 6)  return { text: "Weakly Acidic",   color: "text-orange-500" };
  if (pH < 8)  return { text: "Neutral",          color: "text-green-500" };
  if (pH < 10) return { text: "Weakly Basic",     color: "text-blue-500" };
  return             { text: "Strongly Basic",    color: "text-purple-500" };
};

/* ─── Constants ──────────────────────────────────────────────────────────── */
const VOL_HCL   = 10;    // mL
const C_HCL     = 0.025; // mol/L
const C_NAOH    = 0.1;   // mol/L
const MAX_VOL   = 15;    // mL burette range
const EQ_VOL    = (VOL_HCL * C_HCL) / C_NAOH; // 2.5 mL

/* ─── Component ──────────────────────────────────────────────────────────── */
const PHMetrySimulator = () => {
  const [volAdded, setVolAdded]     = useState(0);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [isDropping, setIsDropping] = useState(false);

  const currentPH = computePH(volAdded, VOL_HCL, C_HCL, C_NAOH);
  const label     = phLabel(currentPH);

  /* Add titrant (from quick buttons) */
  const addTitrant = useCallback((amount: number) => {
    setVolAdded(prev => {
      const next = Math.min(prev + amount, MAX_VOL);
      return next;
    });
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

  /* Burette fill level (fraction remaining) */
  const buretteFill = Math.max(0, 1 - volAdded / MAX_VOL);

  /* Beaker fill height grows as we add volume */
  const beakerFillPct = 35 + (volAdded / MAX_VOL) * 30;

  /* Equivalence point detected in table */
  const epReached = dataPoints.some(p => Math.abs(p.volume - EQ_VOL) <= 0.6);

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">

        {/* ── Controls Panel ─────────────────────────────────────────────── */}
        <Card className="glass-card border-0 order-2 lg:order-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <Droplets className="w-5 h-5 text-primary" />
              Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Setup info */}
            <div className="bg-muted/50 p-4 rounded-xl">
              <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Experiment Setup
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• HCl: {VOL_HCL} mL at {C_HCL} M (analyte)</li>
                <li>• NaOH: {C_NAOH} M standard (titrant)</li>
                <li>• Theoretical equivalence: {EQ_VOL.toFixed(1)} mL NaOH</li>
              </ul>
            </div>

            {/* Slider */}
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
                min={0}
                max={MAX_VOL}
                step={0.5}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 mL</span>
                <span className="text-primary font-medium">EP ≈ {EQ_VOL.toFixed(1)} mL</span>
                <span>{MAX_VOL} mL</span>
              </div>
            </div>

            {/* Quick-add buttons */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Quick Add</p>
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 1, 2, 5].map(amt => (
                  <Button
                    key={amt}
                    variant="outline"
                    size="sm"
                    onClick={() => addTitrant(amt)}
                    disabled={volAdded >= MAX_VOL}
                  >
                    +{amt} mL
                  </Button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                onClick={recordReading}
                className="flex-1 gap-2 lab-gradient-bg text-primary-foreground"
              >
                <Play className="w-4 h-4" />
                Record Reading
              </Button>
              <Button variant="outline" onClick={reset} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>

            {/* pH display */}
            <div className="bg-primary/10 rounded-xl p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Current pH</p>
                <p className="text-5xl font-display font-bold text-primary">
                  {currentPH.toFixed(2)}
                </p>
                <p className={`text-sm font-medium mt-1 ${label.color}`}>{label.text}</p>

                {/* pH bar */}
                <div className="relative mt-3">
                  <div
                    className="w-full h-3 rounded-full"
                    style={{
                      background:
                        "linear-gradient(to right, #dc2626, #f97316, #eab308, #22c55e, #3b82f6, #818cf8, #a855f7)",
                    }}
                  />
                  <motion.div
                    className="absolute top-0 w-3 h-3 bg-white border-2 border-foreground/60 rounded-full shadow"
                    animate={{ left: `${(currentPH / 14) * 100}%` }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    style={{ transform: "translateX(-50%)" }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0 (Acidic)</span>
                  <span>7</span>
                  <span>14 (Basic)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Apparatus Visualisation ──────────────────────────────────────── */}
        <Card className="glass-card border-0 order-1 lg:order-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <FlaskConical className="w-5 h-5 text-primary" />
              Titration Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-[500px] bg-gradient-to-b from-background to-muted/30 rounded-xl overflow-hidden shadow-inner">

              {/* Lab bench */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/5 dark:bg-white/5 border-t border-border/10" />

              {/* ── Retort Stand ── */}
              {/* Base */}
              <div className="absolute bottom-4 left-[88px] w-36 h-3 bg-slate-700 rounded-sm shadow-md" />
              {/* Vertical rod */}
              <div className="absolute bottom-7 left-[155px] w-2 h-[445px] bg-gradient-to-r from-slate-500 to-slate-400 rounded-t shadow-md" />
              {/* Horizontal clamp arm */}
              <div className="absolute top-[44px] left-[157px] w-24 h-2.5 bg-slate-600 rounded-r shadow-md" />

              {/* ── Burette ── */}
              <div className="absolute top-12 left-[172px] flex flex-col items-center">
                {/* Tube body */}
                <div className="w-8 h-72 bg-slate-100/15 backdrop-blur-sm border-2 border-slate-400/50 rounded-b-md relative overflow-hidden shadow-xl">
                  {/* Graduation marks */}
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute right-0 w-2.5 h-px bg-slate-500/60"
                      style={{ top: `${(i + 1) * 9}%` }}
                    />
                  ))}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-500">0 mL</div>
                  {/* NaOH fill (depletes as we add) */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-blue-400/40 backdrop-blur-sm"
                    animate={{ height: `${buretteFill * 100}%` }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                </div>

                {/* Stopcock */}
                <div className="w-2 h-2 bg-slate-400 mx-auto" />
                <motion.div
                  className="w-7 h-2 bg-slate-700 rounded-full mx-auto shadow"
                  animate={{ rotate: isDropping ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                />
                <div className="w-2 h-6 bg-slate-400 mx-auto rounded-b-sm" />

                {/* Drip animation */}
                <AnimatePresence>
                  {isDropping && (
                    <motion.div
                      key="drop"
                      initial={{ y: 0, opacity: 1, scale: 1 }}
                      animate={{ y: 70, opacity: 0, scale: 0.4 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7, ease: "linear" }}
                      className="absolute top-[100%] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-blue-400/80 rounded-full pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* ── Beaker ── */}
              <div className="absolute left-[148px] bottom-16 w-36 h-44 bg-white/10 backdrop-blur-sm border-2 border-slate-300/60 border-t-0 rounded-b-2xl overflow-hidden shadow-lg">
                {/* Rim */}
                <div className="absolute -top-0.5 left-0 right-0 h-1 bg-slate-300/40 rounded-full" />

                {/* Solution fill — colour changes with pH */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 rounded-b-2xl"
                  animate={{
                    height: `${beakerFillPct}%`,
                    backgroundColor: phColor(currentPH),
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                  {/* Surface sheen */}
                  <div className="absolute top-0 w-full h-1.5 bg-white/25 blur-[1px]" />
                </motion.div>

                {/* Magnetic stirrer bar */}
                <motion.div
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 w-7 h-2 bg-white/90 rounded-full shadow-md z-10"
                  animate={isDropping ? { rotate: 360 } : {}}
                  transition={{ duration: 0.25, repeat: isDropping ? Infinity : 0, ease: "linear" }}
                />

                {/* pH electrode */}
                <div className="absolute -top-8 right-5 w-3.5 h-56 bg-gradient-to-b from-slate-300 to-slate-200 border border-slate-400/60 rounded-full shadow-xl z-20 flex flex-col items-center justify-end overflow-hidden">
                  <div className="w-full h-5 bg-blue-100/70 border-t border-slate-400/50 rounded-b-full" />
                </div>
              </div>

              {/* Beaker label */}
              <div className="absolute bottom-8 left-[148px] w-36 text-center text-xs font-medium text-muted-foreground">
                HCl + NaOH
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
            <CardTitle className="font-display">Observation Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">S.No</th>
                    <th className="text-left py-3 px-4 font-semibold">Volume NaOH (mL)</th>
                    <th className="text-left py-3 px-4 font-semibold">pH</th>
                    <th className="text-left py-3 px-4 font-semibold">ΔpH / ΔV</th>
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
                  M(HCl) = (M(NaOH) × V(NaOH)) / V(HCl) = (0.1 × {EQ_VOL.toFixed(1)}) / 10
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
