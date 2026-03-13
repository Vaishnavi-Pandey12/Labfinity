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
            <div className="relative h-[540px] bg-gradient-to-b from-background to-muted/30 rounded-xl overflow-hidden shadow-inner select-none">

              {/* ── Table surface ── */}
              <div className="absolute bottom-0 left-0 right-0 h-5 bg-amber-900/15 border-t border-amber-700/20 rounded-b-xl" />

              {/* ══════════════════════════════════
                  RETORT STAND  (wide base)
              ══════════════════════════════════ */}
              {/* Base plate — extra wide */}
              <div className="absolute bottom-5 left-[20px] w-[280px] h-[18px] bg-gradient-to-r from-slate-700 via-slate-600 to-slate-500 rounded shadow-lg border-t border-slate-400/30" />
              {/* Vertical rod */}
              <div
                className="absolute left-[130px] w-[10px] bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 rounded-t shadow-md"
                style={{ bottom: "23px", top: "8px" }}
              />

              {/* Burette clamp arm (horizontal, near top) */}
              <div className="absolute top-[22px] left-[130px] w-[72px] h-[10px] bg-gradient-to-r from-slate-500 to-slate-400 rounded-r shadow" />
              {/* Clamp ring around burette — wraps the burette tube */}
              <div className="absolute top-[16px] left-[190px] w-[18px] h-[18px] border-[3px] border-slate-500 rounded-sm bg-slate-600/50 shadow z-30" />

              {/* ══════════════════════════════════
                  BURETTE  (clamped to stand rod)
                  Centre of burette ≈ left 196px
              ══════════════════════════════════ */}
              <div className="absolute top-[8px] left-[183px] flex flex-col items-center z-20">
                {/* Top cap / funnel rim */}
                <div className="w-10 h-3 bg-slate-500 rounded-t-md shadow" />
                {/* Label above burette */}
                <div className="absolute -top-4 left-0 right-0 text-center text-[8px] font-mono text-slate-500 font-semibold">NaOH</div>
                {/* Burette tube */}
                <div className="w-7 h-[260px] bg-white/10 backdrop-blur-sm border-2 border-slate-400/60 relative overflow-hidden shadow-xl">
                  {/* Graduation marks */}
                  {[...Array(11)].map((_, i) => (
                    <div key={i} className="absolute right-0 flex items-center gap-0.5" style={{ top: `${i * 9.1}%` }}>
                      <span className="text-[6px] text-slate-500 font-mono pr-0.5">{i * 2}</span>
                      <div className="w-2 h-[1px] bg-slate-500/70" />
                    </div>
                  ))}
                  {/* Liquid fill */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-sky-400/40"
                    animate={{ height: `${buretteFillPct}%` }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                </div>
                {/* Stopcock */}
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 bg-slate-400" />
                  <motion.div
                    className="w-9 h-2.5 bg-slate-700 rounded-full shadow"
                    animate={{ rotate: isDropping ? 90 : 0 }}
                    transition={{ duration: 0.15 }}
                  />
                  <div className="w-2 h-8 bg-slate-400 rounded-b-sm" />
                </div>

                {/* Drop */}
                <AnimatePresence>
                  {isDropping && (
                    <motion.div
                      key="drop"
                      initial={{ y: 0, opacity: 1, scale: 1 }}
                      animate={{ y: 80, opacity: 0, scale: 0.3 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeIn" }}
                      className="w-2.5 h-3 bg-sky-400/80 rounded-b-full pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* ══════════════════════════════════
                  CONICAL FLASK — centred under burette tip
                  Burette centre ≈ 196px
                  Flask w-[150px] → left = 196 - 75 = 121px
              ══════════════════════════════════ */}
              {/* Support platform on stand base */}
              <div className="absolute bottom-[23px] left-[111px] w-[170px] h-[10px] bg-gradient-to-r from-slate-500 to-slate-400 rounded shadow-md" />

              {/* White tile under flask */}
              <div className="absolute bottom-[33px] left-[121px] w-[150px] h-[6px] bg-white/60 dark:bg-white/15 rounded shadow-sm border border-slate-300/50" />

              {/* ── Flask outline as SVG for realistic glass look ── */}
              <svg
                className="absolute z-10 pointer-events-none"
                style={{ bottom: "39px", left: "121px", width: "150px", height: "200px" }}
                viewBox="0 0 150 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Define clip path matching flask interior */}
                <defs>
                  <clipPath id="flaskClip">
                    <polygon points="56,0 94,0 94,52 146,174 148,196 2,196 4,174 56,52" />
                  </clipPath>
                </defs>

                {/* Liquid fill — clipped to flask interior */}
                <rect
                  x="0" y={200 - (flaskFillPct / 100) * 196}
                  width="150"
                  height={(flaskFillPct / 100) * 196}
                  clipPath="url(#flaskClip)"
                  style={{
                    fill: solutionColor,
                    transition: "y 0.6s ease-in-out, height 0.6s ease-in-out, fill 0.7s ease-in-out",
                  }}
                />

                {/* Liquid surface sheen */}
                {flaskFillPct > 0 && (
                  <rect
                    x="0" y={200 - (flaskFillPct / 100) * 196}
                    width="150" height="3"
                    clipPath="url(#flaskClip)"
                    fill="rgba(255,255,255,0.25)"
                    style={{ transition: "y 0.6s ease-in-out" }}
                  />
                )}

                {/* Flask glass outline — thick and clearly visible */}
                <polygon
                  points="56,0 94,0 94,52 146,174 148,196 2,196 4,174 56,52"
                  stroke="rgba(148,163,184,0.8)"
                  strokeWidth="2.5"
                  fill="rgba(226,232,240,0.08)"
                />

                {/* Neck rim highlight */}
                <line x1="54" y1="0" x2="96" y2="0" stroke="rgba(148,163,184,0.6)" strokeWidth="4" strokeLinecap="round" />

                {/* Glass reflection highlights */}
                <line x1="58" y1="8" x2="58" y2="48" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
                <line x1="10" y1="180" x2="28" y2="120" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />
              </svg>

              {/* Flask label */}
              <div className="absolute bottom-[14px] left-[121px] w-[150px] text-center text-[11px] font-medium text-muted-foreground z-20">
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
