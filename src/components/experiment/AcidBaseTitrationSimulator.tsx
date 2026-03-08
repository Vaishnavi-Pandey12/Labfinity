import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, RotateCcw, Droplets, FlaskConical, Info } from "lucide-react";
import AbsorbanceGraph from "./AbsorbanceGraph";

/* ─── Chemistry ──────────────────────────────────────────────────────────── */

interface Reading {
  trial: number;
  initial: number;
  final: number;
  volume: number;
}

const computePH = (volNaOH: number, volHCl: number, cHCl: number, cNaOH: number): number => {
  const molesHCl  = (volHCl  / 1000) * cHCl;
  const molesNaOH = (volNaOH / 1000) * cNaOH;
  const totalVol  = (volHCl  + volNaOH) / 1000;
  const NEAR_EP   = 0.0005;

  if (molesNaOH < molesHCl - NEAR_EP) {
    return -Math.log10((molesHCl - molesNaOH) / totalVol);
  } else if (molesNaOH > molesHCl + NEAR_EP) {
    return 14 - (-Math.log10((molesNaOH - molesHCl) / totalVol));
  }
  return 7.0;
};

/* ─── Colour helpers ─────────────────────────────────────────────────────── */

const getSolutionColor = (pH: number, indicatorAdded: boolean): string => {
  if (!indicatorAdded || pH < 8.2) return "rgba(200, 225, 255, 0.40)";
  if (pH < 8.8)                    return "rgba(255, 182, 193, 0.55)";
  if (pH < 9.5)                    return "rgba(255,  90, 140, 0.60)";
  return                                  "rgba(210,  30, 100, 0.65)";
};

const getIndicatorLabel = (pH: number, indicatorAdded: boolean): { text: string; color: string } => {
  if (!indicatorAdded) return { text: "Add indicator first",  color: "text-muted-foreground" };
  if (pH < 8.2)        return { text: "Colourless (Acidic)",  color: "text-slate-400"        };
  if (pH < 8.8)        return { text: "Very Faint Pink",      color: "text-pink-300"         };
  if (pH < 9.5)        return { text: "Pale Pink",            color: "text-pink-500"         };
  return                      { text: "Pink — End Point! ✓",  color: "text-pink-600 dark:text-pink-400" };
};

/* ─── Constants ──────────────────────────────────────────────────────────── */
const VOL_HCL = 10;
const C_HCL   = 0.025;
const C_NAOH  = 0.1;
const MAX_VOL = 20;
const EQ_VOL  = (VOL_HCL * C_HCL) / C_NAOH; // 2.5 mL

/* ─── Component ──────────────────────────────────────────────────────────── */
const AcidBaseTitrationSimulator = () => {
  const [volAdded,       setVolAdded]       = useState(0);
  const [trialStart,     setTrialStart]     = useState(0);
  const [trial,          setTrial]          = useState(1);
  const [readings,       setReadings]       = useState<Reading[]>([]);
  const [isDropping,     setIsDropping]     = useState(false);
  const [indicatorAdded, setIndicatorAdded] = useState(false);
  const [graphPoints,    setGraphPoints]    = useState<{ x: number; y: number }[]>([]);

  // Volume added THIS trial — what the chemistry and flask visualisation care about
  const volThisTrial  = volAdded - trialStart;
  const currentPH     = computePH(volThisTrial, VOL_HCL, C_HCL, C_NAOH);
  const solutionColor = getSolutionColor(currentPH, indicatorAdded);
  const indLabel      = getIndicatorLabel(currentPH, indicatorAdded);

  // Burette depletes with cumulative volume
  const buretteFillPct = Math.max(0, (1 - volAdded / MAX_VOL) * 100);

  // Flask fill: starts at 40% (HCl already there), grows gently as NaOH is added
  const flaskFillPct = Math.min(80, 40 + (volThisTrial / (EQ_VOL * 3)) * 35);

  const canRecord = indicatorAdded && currentPH >= 8.2 && trial <= 3;

  /* ── Handlers ─────────────────────────────────────────────────────────── */

  const addTitrant = useCallback((amount: number) => {
    setVolAdded(prev => {
      const next = Math.min(prev + amount, MAX_VOL);
      const thisTrial = next - trialStart;
      const pH = computePH(thisTrial, VOL_HCL, C_HCL, C_NAOH);
      setGraphPoints(pts => {
        const key = +thisTrial.toFixed(1);
        const filtered = pts.filter(p => p.x !== key);
        return [...filtered, { x: key, y: pH }].sort((a, b) => a.x - b.x);
      });
      return next;
    });
    setIsDropping(true);
    setTimeout(() => setIsDropping(false), 700);
  }, [trialStart]);

  const handleSlider = useCallback((val: number) => {
    setVolAdded(val);
    const thisTrial = val - trialStart;
    const pH = computePH(thisTrial, VOL_HCL, C_HCL, C_NAOH);
    setGraphPoints(pts => {
      const key = +thisTrial.toFixed(1);
      const filtered = pts.filter(p => p.x !== key);
      return [...filtered, { x: key, y: pH }].sort((a, b) => a.x - b.x);
    });
  }, [trialStart]);

  const recordReading = useCallback(() => {
    if (trial > 3) return;
    const used = volAdded - trialStart;
    setReadings(prev => [...prev, { trial, initial: trialStart, final: volAdded, volume: used }]);
    setTrialStart(volAdded);
    setTrial(prev => prev + 1);
    setIndicatorAdded(false);
    setGraphPoints([]);
  }, [trial, trialStart, volAdded]);

  const reset = useCallback(() => {
    setVolAdded(0);
    setTrialStart(0);
    setTrial(1);
    setReadings([]);
    setIsDropping(false);
    setIndicatorAdded(false);
    setGraphPoints([]);
  }, []);

  /* ── Result calculations ──────────────────────────────────────────────── */
  const vols        = readings.map(r => r.volume);
  const avgVol      = vols.length ? vols.reduce((a, b) => a + b, 0) / vols.length : 0;
  const molarityHCl = (C_NAOH * avgVol) / VOL_HCL;
  const concordant  = vols.length >= 2 && Math.max(...vols) - Math.min(...vols) <= 0.1;

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">

        {/* ── Controls ───────────────────────────────────────────────────── */}
        <Card className="glass-card border-0 order-2 lg:order-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <Droplets className="w-5 h-5 text-primary" />
              Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            <div className="bg-muted/50 p-4 rounded-xl">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Experiment Setup
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Flask: {VOL_HCL} mL dilute HCl (unknown molarity)</li>
                <li>• Burette: {C_NAOH} M NaOH standard solution</li>
                <li>• Indicator: Phenolphthalein (end point = pale pink)</li>
                <li>• Trial: <span className="font-semibold text-primary">{Math.min(trial, 3)} / 3</span></li>
              </ul>
            </div>

            <Button
              variant={indicatorAdded ? "secondary" : "outline"}
              className="w-full gap-2"
              onClick={() => setIndicatorAdded(true)}
              disabled={indicatorAdded || trial > 3}
            >
              {indicatorAdded ? "✓ Phenolphthalein Added" : "Add Phenolphthalein Indicator"}
            </Button>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">NaOH Added (this trial)</label>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {volThisTrial.toFixed(1)} mL
                </span>
              </div>
              <Slider
                value={[volAdded]}
                onValueChange={([v]) => handleSlider(v)}
                min={trialStart}
                max={MAX_VOL}
                step={0.1}
                className="py-2"
                disabled={trial > 3}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 mL</span>
                <span className="text-primary font-medium">EP ≈ {EQ_VOL.toFixed(1)} mL</span>
                <span>{(MAX_VOL - trialStart).toFixed(1)} mL left</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Quick Add</p>
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 1, 2, 5].map(amt => (
                  <Button
                    key={amt}
                    variant="outline"
                    size="sm"
                    onClick={() => addTitrant(amt)}
                    disabled={volAdded >= MAX_VOL || trial > 3}
                  >
                    +{amt}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={recordReading}
                disabled={!canRecord}
                className="flex-1 gap-2 lab-gradient-bg text-primary-foreground disabled:opacity-40"
              >
                <Play className="w-4 h-4" />
                Record Reading
              </Button>
              <Button variant="outline" onClick={reset} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>

            {/* Colour swatch — plain div, no Framer Motion, just CSS transition */}
            <div className="rounded-xl border border-border/50 p-4">
              <p className="text-xs text-muted-foreground mb-2 text-center">Solution Colour</p>
              <div
                className="w-full h-10 rounded-lg shadow-inner"
                style={{
                  backgroundColor: solutionColor,
                  transition: "background-color 0.7s ease-in-out",
                }}
              />
              <p className={`text-xs font-medium text-center mt-2 ${indLabel.color}`}>
                {indLabel.text}
              </p>
            </div>

            {/* pH bar */}
            <div className="bg-primary/10 rounded-xl p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Current pH</p>
                <p className="text-4xl font-display font-bold text-primary">
                  {currentPH.toFixed(2)}
                </p>
                <div className="relative mt-3">
                  <div
                    className="w-full h-3 rounded-full"
                    style={{ background: "linear-gradient(to right, #dc2626, #f97316, #eab308, #22c55e, #3b82f6, #818cf8, #a855f7)" }}
                  />
                  <div
                    className="absolute top-0 w-3 h-3 bg-white border-2 border-foreground/60 rounded-full shadow"
                    style={{
                      left: `${(currentPH / 14) * 100}%`,
                      transform: "translateX(-50%)",
                      transition: "left 0.3s ease",
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0 (Acid)</span><span>7</span><span>14 (Base)</span>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* ── Apparatus ──────────────────────────────────────────────────── */}
        <Card className="glass-card border-0 order-1 lg:order-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <FlaskConical className="w-5 h-5 text-primary" />
              Titration Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-[500px] bg-gradient-to-b from-background to-muted/30 rounded-xl overflow-hidden shadow-inner">

              {/* Bench surface */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/5 dark:bg-white/5 border-t border-border/10" />

              {/* White tile under flask */}
              <div className="absolute bottom-[68px] left-[108px] w-52 h-4 bg-white/50 dark:bg-white/10 rounded shadow-sm border border-slate-200/40" />

              {/* Retort stand base */}
              <div className="absolute bottom-4 left-[76px] w-44 h-3 bg-slate-700 rounded-sm shadow-md" />
              {/* Vertical rod */}
              <div className="absolute bottom-7 left-[146px] w-2 h-[452px] bg-gradient-to-r from-slate-500 to-slate-400 rounded-t shadow-md" />
              {/* Clamp arm */}
              <div className="absolute top-[40px] left-[148px] w-28 h-2.5 bg-slate-600 rounded-r shadow-md" />

              {/* ── Burette ── */}
              <div className="absolute top-10 left-[162px] flex flex-col items-center">
                <div className="w-8 h-72 bg-slate-100/15 backdrop-blur-sm border-2 border-slate-400/50 rounded-b-md relative overflow-hidden shadow-xl">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="absolute right-0 w-2.5 h-px bg-slate-500/50" style={{ top: `${(i + 1) * 9}%` }} />
                  ))}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-500 whitespace-nowrap">0 mL</div>
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-sky-400/40"
                    animate={{ height: `${buretteFillPct}%` }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                </div>
                {/* Stopcock */}
                <div className="w-2 h-2 bg-slate-400 mx-auto" />
                <motion.div
                  className="w-7 h-2 bg-slate-700 rounded-full mx-auto shadow"
                  animate={{ rotate: isDropping ? 90 : 0 }}
                  transition={{ duration: 0.15 }}
                />
                <div className="w-1.5 h-7 bg-slate-400 mx-auto rounded-b" />

                {/* Drop */}
                <AnimatePresence>
                  {isDropping && (
                    <motion.div
                      key="drop"
                      initial={{ y: 0, opacity: 1, scale: 1 }}
                      animate={{ y: 95, opacity: 0, scale: 0.3 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeIn" }}
                      className="absolute top-[calc(100%+4px)] left-1/2 -translate-x-1/2 w-2.5 h-3 bg-sky-400/80 rounded-full pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* ── Conical Flask ──
                  Built entirely with divs + CSS clip-path.
                  The outer wrapper clips to a flask polygon.
                  The inner fill div grows from the bottom using height.
                  backgroundColor is set via inline style with CSS transition
                  so there is no Framer Motion colour interpolation issue.
              ── */}
              <div
                className="absolute bottom-[72px] left-[118px] w-40 h-52"
                style={{
                  clipPath: "polygon(38% 0%, 62% 0%, 62% 28%, 98% 88%, 100% 100%, 0% 100%, 2% 88%, 38% 28%)",
                }}
              >
                {/* Flask glass background */}
                <div className="absolute inset-0 bg-slate-100/10 border-2 border-slate-400/50" />

                {/* Liquid fill — grows from bottom, colour via CSS transition */}
                <div
                  className="absolute bottom-0 left-0 right-0"
                  style={{
                    height: `${flaskFillPct}%`,
                    backgroundColor: solutionColor,
                    transition: "height 0.6s ease-in-out, background-color 0.7s ease-in-out",
                  }}
                >
                  {/* Surface sheen line */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/25" />
                </div>
              </div>

              {/* Flask neck rim (sits on top of the clip-path div) */}
              <div
                className="absolute bg-slate-300/50 rounded-sm"
                style={{
                  bottom: "calc(72px + 208px - 4px)",
                  left: "calc(118px + 40px * 0.38)",
                  width: "calc(40px * 0.24)",
                  height: "6px",
                }}
              />

              {/* Flask label */}
              <div className="absolute bottom-8 left-[118px] w-40 text-center text-xs font-medium text-muted-foreground">
                HCl + NaOH
              </div>

              {/* pH badge */}
              <div className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl px-3 py-2 text-center shadow">
                <p className="text-xs text-muted-foreground">pH</p>
                <p className="text-2xl font-display font-bold text-primary">{currentPH.toFixed(2)}</p>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Graph ──────────────────────────────────────────────────────────── */}
      <AbsorbanceGraph
        title="Titration Curve"
        subtitle="pH vs Volume of NaOH added — sharp rise indicates the equivalence point"
        data={graphPoints}
        xLabel="Volume of NaOH (mL)"
        yLabel="pH"
        showPoints
        lineColor="#ec4899"
        xDomain={[0, EQ_VOL * 4]}
        yDomain={[0, 14]}
      />

      {/* ── Observation Table ─────────────────────────────────────────────── */}
      {readings.length > 0 && (
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
                    <th className="text-left py-3 px-4 font-semibold">V(HCl) mL</th>
                    <th className="text-left py-3 px-4 font-semibold">Burette Initial (mL)</th>
                    <th className="text-left py-3 px-4 font-semibold">Burette Final (mL)</th>
                    <th className="text-left py-3 px-4 font-semibold">V(NaOH) used (mL)</th>
                  </tr>
                </thead>
                <tbody>
                  {readings.map((r, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/50"
                    >
                      <td className="py-3 px-4">{r.trial}</td>
                      <td className="py-3 px-4 font-mono">{VOL_HCL}</td>
                      <td className="py-3 px-4 font-mono">{r.initial.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono">{r.final.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono font-semibold">{r.volume.toFixed(2)}</td>
                    </motion.tr>
                  ))}
                  {readings.length > 1 && (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-primary/5 font-semibold"
                    >
                      <td className="py-3 px-4" colSpan={4}>Average Volume of NaOH</td>
                      <td className="py-3 px-4 font-mono text-primary">{avgVol.toFixed(2)} mL</td>
                    </motion.tr>
                  )}
                </tbody>
              </table>
            </div>

            {readings.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-xl border ${concordant ? "bg-green-500/10 border-green-500/20" : "bg-amber-500/10 border-amber-500/20"}`}
              >
                {concordant ? (
                  <>
                    <p className="text-green-600 dark:text-green-400 font-semibold mb-1">✓ Concordant readings obtained</p>
                    <p className="text-sm font-mono text-muted-foreground">
                      M(HCl) = [0.1 × {avgVol.toFixed(2)}] / 10 = <span className="font-bold text-foreground">{molarityHCl.toFixed(4)} M</span>
                    </p>
                    <p className="text-sm font-mono text-muted-foreground mt-1">
                      Strength = {molarityHCl.toFixed(4)} × 36.45 = <span className="font-bold text-foreground">{(molarityHCl * 36.45).toFixed(3)} g/L</span>
                    </p>
                  </>
                ) : (
                  <p className="text-amber-600 dark:text-amber-400 font-medium">
                    ⚠ Readings differ by more than 0.1 mL — perform another trial for a concordant set.
                  </p>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AcidBaseTitrationSimulator;
