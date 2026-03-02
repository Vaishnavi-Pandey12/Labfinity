import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  RotateCcw,
  Droplets,
  FlaskConical,
  Info,
  ChevronRight,
} from "lucide-react";
import AbsorbanceGraph from "./AbsorbanceGraph";

/* ─── Constants ──────────────────────────────────────────────────────────── */
const VOL_SAMPLE = 20;   // mL hard water
const C_EDTA     = 0.01; // mol/L
const MAX_EDTA   = 25;   // mL burette range

// Simulated true end-point volumes
// Part 1: hard water → 6 mL EDTA → 300 ppm
// Part 2: post-column → 0.3 mL EDTA → 15 ppm
const TRUE_V1 = 6.0;
const TRUE_V2 = 0.3;

/* ─── Colour helpers ─────────────────────────────────────────────────────── */
const getFlaskColor = (vol: number, trueV: number, indicatorAdded: boolean): string => {
  if (!indicatorAdded) return "rgba(180, 220, 255, 0.40)";
  const ratio = Math.min(vol / trueV, 1.0);
  if (ratio < 0.85) return "rgba(170,  25,  55, 0.70)"; // wine-red
  if (ratio < 0.97) return "rgba(110,  35, 115, 0.65)"; // violet
  return                   "rgba( 25,  80, 210, 0.65)"; // blue — end point
};

const getColorLabel = (vol: number, trueV: number, indicatorAdded: boolean): { text: string; color: string } => {
  if (!indicatorAdded) return { text: "Add buffer + indicator first", color: "text-muted-foreground" };
  const ratio = Math.min(vol / trueV, 1.0);
  if (ratio < 0.85) return { text: "Wine-Red (Metal–Calmagite complex)", color: "text-red-600"    };
  if (ratio < 0.97) return { text: "Violet (Approaching end point)",     color: "text-purple-500" };
  return                   { text: "Blue — End Point! ✓",                color: "text-blue-600 dark:text-blue-400" };
};

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Reading { trial: number; initial: number; final: number; volume: number; }

/* ─── Reusable EDTA titration panel ─────────────────────────────────────── */
interface TitrationPanelProps {
  partLabel: string;
  flaskLabel: string;
  trueV: number;
  burretteColor: string;
  dropColor: string;
  graphColor: string;
  onComplete: (avgVol: number) => void;
}

const TitrationPanel = ({
  partLabel,
  flaskLabel,
  trueV,
  burretteColor,
  dropColor,
  graphColor,
  onComplete,
}: TitrationPanelProps) => {
  const [volAdded,        setVolAdded]        = useState(0);
  const [trialStart,      setTrialStart]      = useState(0);
  const [trial,           setTrial]           = useState(1);
  const [readings,        setReadings]        = useState<Reading[]>([]);
  const [isDropping,      setIsDropping]      = useState(false);
  const [indicatorAdded,  setIndicatorAdded]  = useState(false);
  const [graphPoints,     setGraphPoints]     = useState<{ x: number; y: number }[]>([]);
  const [completed,       setCompleted]       = useState(false);

  const volThisTrial   = volAdded - trialStart;
  const flaskColor     = getFlaskColor(volThisTrial, trueV, indicatorAdded);
  const colorLabel     = getColorLabel(volThisTrial, trueV, indicatorAdded);
  const atEndPoint     = indicatorAdded && volThisTrial >= trueV * 0.97;
  const buretteFillPct = Math.max(0, (1 - volAdded / MAX_EDTA) * 100);
  const flaskFillPct   = Math.min(78, 42 + (volThisTrial / (trueV * 3)) * 20);

  const pushGraphPoint = useCallback((vol: number) => {
    // Model: absorbance of red wavelength drops linearly to 0 at end point
    const abs = Math.max(0, 1.0 - (vol / trueV) * 1.05);
    setGraphPoints(pts => {
      const key = +vol.toFixed(2);
      return [...pts.filter(p => p.x !== key), { x: key, y: +abs.toFixed(4) }]
        .sort((a, b) => a.x - b.x);
    });
  }, [trueV]);

  const addTitrant = useCallback((amount: number) => {
    setVolAdded(prev => {
      const next = Math.min(prev + amount, MAX_EDTA);
      pushGraphPoint(next - trialStart);
      return next;
    });
    setIsDropping(true);
    setTimeout(() => setIsDropping(false), 700);
  }, [trialStart, pushGraphPoint]);

  const handleSlider = useCallback((val: number) => {
    setVolAdded(val);
    pushGraphPoint(val - trialStart);
  }, [trialStart, pushGraphPoint]);

  const recordReading = useCallback(() => {
    if (!atEndPoint || trial > 3 || completed) return;
    const used = volAdded - trialStart;
    const updated = [...readings, { trial, initial: trialStart, final: volAdded, volume: used }];
    setReadings(updated);
    setTrialStart(volAdded);
    setTrial(t => t + 1);
    setIndicatorAdded(false);
    setGraphPoints([]);

    const vols = updated.map(r => r.volume);
    const isConc = vols.length >= 2 && Math.max(...vols) - Math.min(...vols) <= 0.1;
    if (isConc || updated.length >= 3) {
      const avg = vols.reduce((a, b) => a + b, 0) / vols.length;
      setCompleted(true);
      onComplete(avg);
    }
  }, [atEndPoint, trial, completed, volAdded, trialStart, readings, onComplete]);

  const reset = useCallback(() => {
    setVolAdded(0); setTrialStart(0); setTrial(1);
    setReadings([]); setIsDropping(false);
    setIndicatorAdded(false); setGraphPoints([]); setCompleted(false);
  }, []);

  const vols       = readings.map(r => r.volume);
  const avgVol     = vols.length ? vols.reduce((a, b) => a + b, 0) / vols.length : 0;
  const hardness   = (avgVol * 1000) / VOL_SAMPLE;
  const concordant = vols.length >= 2 && Math.max(...vols) - Math.min(...vols) <= 0.1;

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Controls */}
        <Card className="glass-card border-0 order-2 lg:order-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <Droplets className="w-5 h-5 text-primary" />
              {partLabel} — Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="bg-muted/50 p-4 rounded-xl text-sm">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Setup
              </h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• Flask: {VOL_SAMPLE} mL {flaskLabel}</li>
                <li>• Burette: {C_EDTA} M EDTA solution</li>
                <li>• Indicator: Calmagite (end point = wine-red → blue)</li>
                <li>• Trial: <span className="font-semibold text-primary">{Math.min(trial, 3)} / 3</span></li>
              </ul>
            </div>

            <Button
              variant={indicatorAdded ? "secondary" : "outline"}
              className="w-full"
              onClick={() => setIndicatorAdded(true)}
              disabled={indicatorAdded || completed}
            >
              {indicatorAdded ? "✓ Buffer + Calmagite Added" : "Add Buffer + Calmagite Indicator"}
            </Button>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">EDTA Added (this trial)</label>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {volThisTrial.toFixed(2)} mL
                </span>
              </div>
              <Slider
                value={[volAdded]}
                onValueChange={([v]) => handleSlider(v)}
                min={trialStart} max={MAX_EDTA} step={0.1}
                className="py-2" disabled={completed}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 mL</span>
                <span className="text-primary font-medium">EP ≈ {trueV.toFixed(1)} mL</span>
                <span>{MAX_EDTA} mL</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Quick Add</p>
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 1, 2, 5].map(amt => (
                  <Button key={amt} variant="outline" size="sm"
                    onClick={() => addTitrant(amt)}
                    disabled={volAdded >= MAX_EDTA || completed}>
                    +{amt}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={recordReading}
                disabled={!atEndPoint || completed}
                className="flex-1 gap-2 lab-gradient-bg text-primary-foreground disabled:opacity-40"
              >
                <Play className="w-4 h-4" /> Record Reading
              </Button>
              <Button variant="outline" onClick={reset} className="gap-2">
                <RotateCcw className="w-4 h-4" /> Reset
              </Button>
            </div>

            {/* Colour swatch */}
            <div className="rounded-xl border border-border/50 p-4">
              <p className="text-xs text-muted-foreground mb-2 text-center">Solution Colour</p>
              <div
                className="w-full h-10 rounded-lg shadow-inner"
                style={{
                  backgroundColor: flaskColor,
                  transition: "background-color 0.6s ease-in-out",
                }}
              />
              <p className={`text-xs font-medium text-center mt-2 ${colorLabel.color}`}>
                {colorLabel.text}
              </p>
            </div>

          </CardContent>
        </Card>

        {/* Apparatus */}
        <Card className="glass-card border-0 order-1 lg:order-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <FlaskConical className="w-5 h-5 text-primary" />
              Titration Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-[460px] bg-gradient-to-b from-background to-muted/30 rounded-xl overflow-hidden shadow-inner">

              {/* Bench */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/5 dark:bg-white/5 border-t border-border/10" />
              {/* White tile */}
              <div className="absolute bottom-[68px] left-[108px] w-52 h-4 bg-white/50 dark:bg-white/10 rounded shadow-sm border border-slate-200/40" />

              {/* Stand base */}
              <div className="absolute bottom-4 left-[78px] w-44 h-3 bg-slate-700 rounded-sm shadow-md" />
              {/* Vertical rod */}
              <div className="absolute bottom-7 left-[148px] w-2 h-[416px] bg-gradient-to-r from-slate-500 to-slate-400 rounded-t shadow-md" />
              {/* Clamp arm */}
              <div className="absolute top-[36px] left-[150px] w-28 h-2.5 bg-slate-600 rounded-r shadow-md" />

              {/* Burette */}
              <div className="absolute top-8 left-[164px] flex flex-col items-center">
                <div className="w-8 h-64 bg-slate-100/15 backdrop-blur-sm border-2 border-slate-400/50 rounded-b-md relative overflow-hidden shadow-xl">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="absolute right-0 w-2.5 h-px bg-slate-500/50"
                      style={{ top: `${(i + 1) * 9}%` }} />
                  ))}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-500 whitespace-nowrap">
                    0 mL
                  </div>
                  <motion.div
                    className="absolute bottom-0 left-0 right-0"
                    style={{ backgroundColor: burretteColor }}
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
                      animate={{ y: 90, opacity: 0, scale: 0.3 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.55, ease: "easeIn" }}
                      className="absolute top-[calc(100%+4px)] left-1/2 -translate-x-1/2 w-2.5 h-3 rounded-full pointer-events-none"
                      style={{ backgroundColor: dropColor }}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Conical flask */}
              <div
                className="absolute bottom-[72px] left-[118px] w-40 h-52 overflow-hidden"
                style={{
                  clipPath: "polygon(38% 0%, 62% 0%, 62% 28%, 98% 88%, 100% 100%, 0% 100%, 2% 88%, 38% 28%)",
                }}
              >
                <div className="absolute inset-0 bg-slate-100/10 border-2 border-slate-400/50" />
                <div
                  className="absolute bottom-0 left-0 right-0"
                  style={{
                    height: `${flaskFillPct}%`,
                    backgroundColor: flaskColor,
                    transition: "height 0.5s ease-in-out, background-color 0.6s ease-in-out",
                  }}
                >
                  <div className="absolute top-0 w-full h-1.5 bg-white/20" />
                </div>
              </div>

              {/* Flask label */}
              <div className="absolute bottom-8 left-[118px] w-40 text-center text-xs font-medium text-muted-foreground">
                {flaskLabel}
              </div>

              {/* End point badge */}
              <AnimatePresence>
                {atEndPoint && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-4 left-4 bg-blue-500/20 border border-blue-500/40 rounded-xl px-3 py-2 text-center"
                  >
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      End Point Reached!
                    </p>
                    <p className="text-xs text-muted-foreground">{volThisTrial.toFixed(2)} mL EDTA</p>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graph */}
      <AbsorbanceGraph
        title="Colour Change Curve"
        subtitle="Red-wavelength absorbance vs Volume of EDTA — reaches zero at end point"
        data={graphPoints}
        xLabel="Volume of EDTA (mL)"
        yLabel="Absorbance (red λ)"
        showPoints
        lineColor={graphColor}
        xDomain={[0, trueV * 2.5]}
        yDomain={[0, 1.1]}
      />

      {/* Observation table */}
      {readings.length > 0 && (
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="font-display">Observation Table — {partLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">S.No</th>
                    <th className="text-left py-3 px-4 font-semibold">V(sample) mL</th>
                    <th className="text-left py-3 px-4 font-semibold">Burette Initial</th>
                    <th className="text-left py-3 px-4 font-semibold">Burette Final</th>
                    <th className="text-left py-3 px-4 font-semibold">V(EDTA) mL</th>
                  </tr>
                </thead>
                <tbody>
                  {readings.map((r, i) => (
                    <motion.tr key={i}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/50"
                    >
                      <td className="py-3 px-4">{r.trial}</td>
                      <td className="py-3 px-4 font-mono">{VOL_SAMPLE}</td>
                      <td className="py-3 px-4 font-mono">{r.initial.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono">{r.final.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono font-semibold">{r.volume.toFixed(2)}</td>
                    </motion.tr>
                  ))}
                  {readings.length > 1 && (
                    <tr className="bg-primary/5 font-semibold">
                      <td className="py-3 px-4" colSpan={4}>Average V(EDTA)</td>
                      <td className="py-3 px-4 font-mono text-primary">{avgVol.toFixed(2)} mL</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {readings.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-xl border ${concordant
                  ? "bg-green-500/10 border-green-500/20"
                  : "bg-amber-500/10 border-amber-500/20"}`}
              >
                {concordant ? (
                  <>
                    <p className="text-green-600 dark:text-green-400 font-semibold mb-1">
                      ✓ Concordant readings obtained
                    </p>
                    <p className="text-sm font-mono text-muted-foreground">
                      Hardness = ({avgVol.toFixed(2)} × 1000) / 20 =
                      <span className="font-bold text-foreground"> {hardness.toFixed(1)} ppm CaCO₃</span>
                    </p>
                  </>
                ) : (
                  <p className="text-amber-600 dark:text-amber-400 font-medium">
                    ⚠ Readings differ by more than 0.1 mL — perform another trial.
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

/* ─── Ion exchange column animation ─────────────────────────────────────── */
interface ColumnProps {
  stage: "idle" | "conditioning" | "running" | "done";
  progress: number;
}

const IonExchangeColumn = ({ stage, progress }: ColumnProps) => {
  // Resin colour shifts from fresh orange → dark brown as it becomes spent
  const spent = stage === "running" ? progress / 100 : stage === "done" ? 1 : 0;
  const r = Math.round(220 - spent * 80);
  const g = Math.round(130 - spent * 70);
  const b = Math.round(50);
  const resinColor = `rgba(${r}, ${g}, ${b}, 0.80)`;

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-xs font-semibold text-muted-foreground mb-1">Ion Exchange Column</p>

      {/* Input funnel */}
      <div className="w-10 h-5 border-2 border-slate-400/60 rounded-t-lg bg-slate-100/10" />

      {/* Column tube */}
      <div className="relative w-14 h-56 border-2 border-slate-400/60 bg-slate-100/10 overflow-hidden shadow-lg">
        {/* Label */}
        <div className="absolute top-1 left-0 right-0 text-center text-[9px] text-slate-500 font-mono z-10">
          Amberlite IR120
        </div>

        {/* Glass wool (top) */}
        <div className="absolute top-5 left-1 right-1 h-3 bg-slate-200/50 rounded z-10" />

        {/* Resin bed */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: "30%",
            height: "52%",
            backgroundColor: resinColor,
            transition: "background-color 0.5s ease",
          }}
        >
          {/* Resin bead texture */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-black/10"
              style={{
                left: `${12 + (i % 4) * 22}%`,
                top: `${8 + Math.floor(i / 4) * 28}%`,
              }}
            />
          ))}
        </div>

        {/* Glass wool (bottom) */}
        <div className="absolute bottom-5 left-1 right-1 h-3 bg-slate-200/50 rounded z-10" />

        {/* Water flow animation */}
        {stage === "running" && (
          <motion.div
            className="absolute left-0 right-0 bg-blue-300/25 z-20"
            animate={{ top: ["5%", "85%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            style={{ height: "12%" }}
          />
        )}
      </div>

      {/* Exit tip */}
      <div className="w-2 h-5 bg-slate-400/60 rounded-b" />

      {/* Drip */}
      <AnimatePresence>
        {stage === "running" && (
          <motion.div
            key="drip"
            className="w-2 h-2.5 bg-blue-400/70 rounded-full"
            animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
          />
        )}
      </AnimatePresence>

      {/* Status text */}
      <p className="text-[10px] text-muted-foreground mt-2 text-center max-w-[90px] leading-tight">
        {stage === "idle"         && "Ready — click Run Column"}
        {stage === "conditioning" && "Conditioning with distilled water..."}
        {stage === "running"      && `Exchanging Ca²⁺/Mg²⁺... ${progress.toFixed(0)}%`}
        {stage === "done"         && "Exchange complete ✓"}
      </p>
    </div>
  );
};

/* ─── Main simulator ─────────────────────────────────────────────────────── */
const HardnessSimulator = () => {
  const [activePart,    setActivePart]    = useState<1 | 2>(1);
  const [part1Hardness, setPart1Hardness] = useState<number | null>(null);
  const [part2Hardness, setPart2Hardness] = useState<number | null>(null);

  // Column animation state
  const [columnStage,    setColumnStage]    = useState<"idle" | "conditioning" | "running" | "done">("idle");
  const [columnProgress, setColumnProgress] = useState(0);
  const [columnDone,     setColumnDone]     = useState(false);

  const runColumn = useCallback(() => {
    if (columnStage !== "idle") return;
    setColumnStage("conditioning");
    setColumnProgress(0);
    setTimeout(() => {
      setColumnStage("running");
      let p = 0;
      const iv = setInterval(() => {
        p += 2;
        setColumnProgress(p);
        if (p >= 100) {
          clearInterval(iv);
          setColumnStage("done");
          setColumnDone(true);
        }
      }, 60);
    }, 1800);
  }, [columnStage]);

  const handlePart1Complete = useCallback((avg: number) => {
    setPart1Hardness((avg * 1000) / VOL_SAMPLE);
  }, []);

  const handlePart2Complete = useCallback((avg: number) => {
    setPart2Hardness((avg * 1000) / VOL_SAMPLE);
  }, []);

  const purificationPct =
    part1Hardness !== null && part2Hardness !== null
      ? ((part1Hardness - part2Hardness) / part1Hardness) * 100
      : null;

  return (
    <div className="space-y-6">

      {/* Part selector tabs */}
      <div className="flex flex-wrap gap-3 items-center">
        <Button
          variant={activePart === 1 ? "default" : "outline"}
          className={activePart === 1 ? "lab-gradient-bg text-primary-foreground" : ""}
          onClick={() => setActivePart(1)}
        >
          Part 1 — EDTA Titration
          {part1Hardness !== null && (
            <span className="ml-2 text-xs opacity-80">✓ {part1Hardness.toFixed(0)} ppm</span>
          )}
        </Button>

        <Button
          variant={activePart === 2 ? "default" : "outline"}
          className={activePart === 2 ? "lab-gradient-bg text-primary-foreground" : ""}
          onClick={() => setActivePart(2)}
        >
          Part 2 — Ion Exchange
          {part2Hardness !== null && (
            <span className="ml-2 text-xs opacity-80">✓ {part2Hardness.toFixed(0)} ppm</span>
          )}
        </Button>

        {part1Hardness !== null && activePart === 1 && (
          <Button variant="outline" className="ml-auto gap-2" onClick={() => setActivePart(2)}>
            Proceed to Part 2 <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* ── Part 1 ── */}
      {activePart === 1 && (
        <TitrationPanel
          partLabel="Part 1"
          flaskLabel="Hard Water Sample"
          trueV={TRUE_V1}
          burretteColor="rgba(200, 180, 80, 0.45)"
          dropColor="rgba(200, 180, 80, 0.80)"
          graphColor="#dc2626"
          onComplete={handlePart1Complete}
        />
      )}

      {/* ── Part 2 ── */}
      {activePart === 2 && (
        <div className="space-y-6">

          {/* Step 1: run the column */}
          {!columnDone && (
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-display">
                  <FlaskConical className="w-5 h-5 text-primary" />
                  Step 1 — Pass Hard Water Through Ion Exchange Column
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-10 py-4">
                  <IonExchangeColumn stage={columnStage} progress={columnProgress} />

                  <div className="flex-1 space-y-4">
                    <div className="bg-muted/50 p-4 rounded-xl text-sm space-y-2 text-muted-foreground">
                      <p><span className="font-semibold text-foreground">1.</span> Pass 50 mL distilled water to condition the column — discard effluent.</p>
                      <p><span className="font-semibold text-foreground">2.</span> Pass 20 mL hard water slowly — Ca²⁺ and Mg²⁺ exchange with resin H⁺ ions.</p>
                      <p><span className="font-semibold text-foreground">3.</span> Pass 100 mL distilled water to wash — collect all effluent in conical flask.</p>
                      <p><span className="font-semibold text-foreground">4.</span> The collected effluent will be titrated with EDTA in Step 2 below.</p>
                    </div>

                    <Button
                      onClick={runColumn}
                      disabled={columnStage !== "idle"}
                      className="gap-2 lab-gradient-bg text-primary-foreground disabled:opacity-60"
                    >
                      <Play className="w-4 h-4" />
                      {columnStage === "idle"         && "Run Column"}
                      {columnStage === "conditioning" && "Conditioning..."}
                      {columnStage === "running"      && `Exchanging... ${columnProgress.toFixed(0)}%`}
                      {columnStage === "done"         && "Complete ✓"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: EDTA titration of purified water — unlocks after column */}
          {columnDone && (
            <>
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  ✓ Column complete — effluent collected. Now titrate with EDTA to find residual hardness.
                </p>
              </div>
              <TitrationPanel
                partLabel="Part 2"
                flaskLabel="Post-Column Effluent"
                trueV={TRUE_V2}
                burretteColor="rgba(200, 180, 80, 0.45)"
                dropColor="rgba(200, 180, 80, 0.80)"
                graphColor="#3b82f6"
                onComplete={handlePart2Complete}
              />
            </>
          )}
        </div>
      )}

      {/* ── Combined result — shown on either tab once both are done ── */}
      {part1Hardness !== null && part2Hardness !== null && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card border-0 bg-green-500/5">
            <CardHeader>
              <CardTitle className="font-display text-green-600 dark:text-green-400">
                ✓ Final Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-background rounded-xl text-center">
                  <p className="text-xs text-muted-foreground mb-1">Sample Water Hardness</p>
                  <p className="text-2xl font-display font-bold text-primary">
                    {part1Hardness.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">ppm CaCO₃</p>
                </div>
                <div className="p-4 bg-background rounded-xl text-center">
                  <p className="text-xs text-muted-foreground mb-1">Purified Water Hardness</p>
                  <p className="text-2xl font-display font-bold text-blue-500">
                    {part2Hardness.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">ppm CaCO₃</p>
                </div>
                <div className="p-4 bg-background rounded-xl text-center">
                  <p className="text-xs text-muted-foreground mb-1">Percent Purification</p>
                  <p className="text-2xl font-display font-bold text-green-600 dark:text-green-400">
                    {purificationPct!.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">by ion exchange</p>
                </div>
              </div>
              <p className="text-xs font-mono text-muted-foreground text-center">
                % Purification = [({part1Hardness.toFixed(1)} − {part2Hardness.toFixed(1)}) / {part1Hardness.toFixed(1)}] × 100
                = <span className="font-bold text-foreground">{purificationPct!.toFixed(1)}%</span>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default HardnessSimulator;
