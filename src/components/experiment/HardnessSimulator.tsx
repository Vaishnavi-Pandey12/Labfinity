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
  ChevronRight,
} from "lucide-react";

/* ─── Constants ──────────────────────────────────────────────────────────── */
const VOL_SAMPLE = 20;   // mL hard water
const MAX_EDTA = 25;   // mL burette range

const TRUE_V1 = 6.0;   // Part 1 endpoint (mL EDTA)
const TRUE_V2 = 0.3;   // Part 2 endpoint (mL EDTA)

/* ─── Colour helpers ─────────────────────────────────────────────────────── */
// Returns RGBA string; all transitions are handled purely with CSS transition on backgroundColor
const getFlaskColor = (
  vol: number,
  trueV: number,
  stage: "empty" | "water" | "buffer" | "indicator" | "titrating"
): string => {
  if (stage === "empty") return "rgba(235, 245, 255, 0.10)";
  if (stage === "water") return "rgba(180, 220, 255, 0.40)";
  if (stage === "buffer") return "rgba(160, 200, 240, 0.50)";
  // indicator onwards — colour shifts with titration progress
  const ratio = Math.min(vol / trueV, 1.0);
  if (ratio < 0.85) return "rgba(170,  25,  55, 0.70)"; // wine-red
  if (ratio < 0.97) return "rgba(110,  35, 115, 0.65)"; // violet
  return "rgba( 25,  80, 210, 0.65)"; // blue (end-point)
};

const getColorLabel = (
  vol: number,
  trueV: number,
  stage: "empty" | "water" | "buffer" | "indicator" | "titrating"
): { text: string; color: string } => {
  if (stage === "empty") return { text: "Empty flask", color: "text-muted-foreground" };
  if (stage === "water") return { text: "Colourless (hard water sample)", color: "text-blue-400" };
  if (stage === "buffer") return { text: "Colourless (buffer added, pH 9–10)", color: "text-sky-400" };
  const ratio = Math.min(vol / trueV, 1.0);
  if (ratio < 0.85) return { text: "Wine-Red (Metal–Calmagite complex)", color: "text-red-500" };
  if (ratio < 0.97) return { text: "Violet (Approaching end point)", color: "text-purple-500" };
  return { text: "Blue — End Point! ✓", color: "text-blue-500 dark:text-blue-400" };
};

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Reading { trial: number; initial: number; final: number; volume: number; }

type ReagentStage = "empty" | "water" | "buffer" | "indicator" | "titrating";

/* ─── Reusable EDTA titration panel ─────────────────────────────────────── */
interface TitrationPanelProps {
  partLabel: string;
  flaskLabel: string;
  trueV: number;
  burretteColor: string;
  dropColor: string;
  onComplete: (avgVol: number) => void;
  /** Skip the "Add Hard Water" step — used in Part 2 after column */
  skipHardWaterStep?: boolean;
}

const TitrationPanel = ({
  partLabel,
  flaskLabel,
  trueV,
  burretteColor,
  dropColor,
  onComplete,
  skipHardWaterStep = false,
}: TitrationPanelProps) => {
  const [volAdded, setVolAdded] = useState(0);
  const [trialStart, setTrialStart] = useState(0);
  const [trial, setTrial] = useState(1);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [isDropping, setIsDropping] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Stage drives visual state
  const [stage, setStage] = useState<ReagentStage>(skipHardWaterStep ? "water" : "empty");

  const volThisTrial = volAdded - trialStart;
  const flaskColor = getFlaskColor(volThisTrial, trueV, stage);
  const colorLabel = getColorLabel(volThisTrial, trueV, stage);
  const atEndPoint = stage === "titrating" && volThisTrial >= trueV * 0.97;
  const buretteFillPct = Math.max(0, (1 - volAdded / MAX_EDTA) * 100);
  const flaskFillPct = stage === "empty" ? 0 : Math.min(78, 42 + (volThisTrial / (trueV * 3)) * 20);

  const addTitrant = useCallback((amount: number) => {
    if (stage !== "titrating" || completed) return;
    setVolAdded(prev => Math.min(prev + amount, MAX_EDTA));
    setIsDropping(true);
    setTimeout(() => setIsDropping(false), 700);
  }, [stage, completed]);

  const handleSlider = useCallback((val: number) => {
    if (stage !== "titrating" || completed) return;
    setVolAdded(trialStart + val);
  }, [stage, completed, trialStart]);

  const recordReading = useCallback(() => {
    if (!atEndPoint || trial > 3 || completed) return;
    const used = volAdded - trialStart;
    const updated = [...readings, { trial, initial: trialStart, final: volAdded, volume: used }];
    setReadings(updated);
    setTrialStart(volAdded);
    setTrial(t => t + 1);
    // Reset per-trial reagents (keep hard water if already added)
    setStage(skipHardWaterStep ? "water" : "water");

    const vols = updated.map(r => r.volume);
    const isConc = vols.length >= 2 && Math.max(...vols) - Math.min(...vols) <= 0.1;
    if (isConc || updated.length >= 3) {
      const avg = vols.reduce((a, b) => a + b, 0) / vols.length;
      setCompleted(true);
      onComplete(avg);
    }
  }, [atEndPoint, trial, completed, volAdded, trialStart, readings, onComplete, skipHardWaterStep]);

  const reset = useCallback(() => {
    setVolAdded(0); setTrialStart(0); setTrial(1);
    setReadings([]); setIsDropping(false); setCompleted(false);
    setStage(skipHardWaterStep ? "water" : "empty");
  }, [skipHardWaterStep]);

  const vols = readings.map(r => r.volume);
  const avgVol = vols.length ? vols.reduce((a, b) => a + b, 0) / vols.length : 0;
  const hardness = (avgVol * 1000) / VOL_SAMPLE;
  const concordant = vols.length >= 2 && Math.max(...vols) - Math.min(...vols) <= 0.1;

  const canAddEDTA = stage === "titrating" && !completed;
  // slider value = vol added THIS trial
  const sliderVal = volThisTrial;

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">

        {/* ── Controls ── */}
        <Card className="glass-card border-0 order-2 lg:order-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <Droplets className="w-5 h-5 text-primary" />
              {partLabel} — Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">

            {/* Step 1: Add Hard Water (only in Part 1) */}
            {!skipHardWaterStep && (
              <Button
                variant={stage !== "empty" ? "secondary" : "outline"}
                className="w-full gap-2"
                onClick={() => setStage("water")}
                disabled={stage !== "empty" || completed}
              >
                <Droplets className="w-4 h-4" />
                {stage !== "empty" ? "Hard Water Added ✓" : `Add Hard Water (${VOL_SAMPLE} mL)`}
              </Button>
            )}

            {/* Step 2: Add Buffer Solution */}
            <Button
              variant={stage === "buffer" || stage === "indicator" || stage === "titrating" ? "secondary" : "outline"}
              className="w-full gap-2"
              onClick={() => setStage("buffer")}
              disabled={stage === "empty" || stage === "buffer" || stage === "indicator" || stage === "titrating" || completed}
            >
              <FlaskConical className="w-4 h-4" />
              {stage === "buffer" || stage === "indicator" || stage === "titrating"
                ? "Buffer Solution Added ✓"
                : "Add Buffer Solution (pH 9–10)"}
            </Button>

            {/* Step 3: Add Calmagite Indicator */}
            <Button
              variant={stage === "indicator" || stage === "titrating" ? "secondary" : "outline"}
              className="w-full gap-2"
              onClick={() => setStage("indicator")}
              disabled={stage !== "buffer" || completed}
            >
              <Droplets className="w-4 h-4" />
              {stage === "indicator" || stage === "titrating"
                ? "Calmagite Indicator Added ✓"
                : "Add Calmagite Indicator"}
            </Button>

            {/* Step 4: Enable EDTA — small start-titrating button */}
            {stage === "indicator" && (
              <Button
                className="w-full gap-2 lab-gradient-bg text-primary-foreground"
                onClick={() => setStage("titrating")}
              >
                Start Titrating with EDTA
              </Button>
            )}

            {/* EDTA controls — slider + quick-add buttons */}
            {canAddEDTA && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-muted-foreground">EDTA added (this trial)</span>
                  <span className="font-mono bg-muted px-2 py-0.5 rounded text-foreground">
                    {volThisTrial.toFixed(2)} mL
                  </span>
                </div>

                {/* Slider */}
                <Slider
                  value={[sliderVal]}
                  onValueChange={([v]) => handleSlider(v)}
                  min={0}
                  max={trueV * 2.5}
                  step={0.05}
                  className="py-1"
                  disabled={!canAddEDTA}
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>0 mL</span>
                  <span className="text-primary font-medium">EP ≈ {trueV.toFixed(1)} mL</span>
                  <span>{(trueV * 2.5).toFixed(1)} mL</span>
                </div>

                {/* Quick-add drop buttons */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Quick Add (mL)</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[0.5, 1, 2, 3, 5].map(amt => (
                      <Button
                        key={amt}
                        variant="outline"
                        size="sm"
                        className="text-xs font-mono hover:bg-primary/10 hover:border-primary/40"
                        onClick={() => addTitrant(amt)}
                        disabled={volAdded >= MAX_EDTA}
                      >
                        +{amt}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Record + Reset */}
            <div className="flex gap-3 pt-1">
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

            {!completed && stage === "titrating" && (
              <p className="text-xs text-center text-muted-foreground">
                Trial <span className="font-semibold text-primary">{Math.min(trial, 3)}</span> / 3
              </p>
            )}

            {/* Solution colour swatch — CSS transition only, no Framer Motion */}
            <div className="rounded-xl border border-border/50 p-4">
              <p className="text-xs text-muted-foreground mb-2 text-center">Solution Colour</p>
              <div
                className="w-full h-10 rounded-lg shadow-inner"
                style={{
                  backgroundColor: flaskColor,
                  transition: "background-color 1.2s ease-in-out",
                }}
              />
              <p
                className={`text-xs font-medium text-center mt-2 transition-all duration-700 ${colorLabel.color}`}
              >
                {colorLabel.text}
              </p>
            </div>

          </CardContent>
        </Card>

        {/* ── Apparatus ── */}
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

              {/* Burette label */}
              <div className="absolute top-[12px] left-[172px] text-[9px] font-mono text-slate-500 whitespace-nowrap">
                0.01 M EDTA
              </div>

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

              {/* Reagent bottles */}
              <div className="absolute bottom-[72px] right-[28px] flex flex-col items-center gap-0.5">
                <div className="w-3 h-4 bg-red-800/60 rounded-t-sm" />
                <div className="w-8 h-12 bg-red-600/40 border border-red-400/40 rounded-b-md rounded-t-sm flex items-end justify-center pb-1">
                  <span className="text-[6px] text-red-200/90 font-medium text-center leading-tight">Calma-<br />gite</span>
                </div>
              </div>
              <div className="absolute bottom-[72px] right-[68px] flex flex-col items-center gap-0.5">
                <div className="w-3 h-4 bg-yellow-800/60 rounded-t-sm" />
                <div className="w-8 h-12 bg-yellow-400/40 border border-yellow-400/40 rounded-b-md rounded-t-sm flex items-end justify-center pb-1">
                  <span className="text-[6px] text-yellow-900/90 dark:text-yellow-100/80 font-medium text-center leading-tight">Buffer<br />pH9-10</span>
                </div>
              </div>

              {/* Conical flask */}
              <div
                className="absolute bottom-[72px] left-[118px] w-40 h-52 overflow-hidden"
                style={{ clipPath: "polygon(38% 0%, 62% 0%, 62% 28%, 98% 88%, 100% 100%, 0% 100%, 2% 88%, 38% 28%)" }}
              >
                <div className="absolute inset-0 bg-slate-100/10 border-2 border-slate-400/50" />
                <div
                  className="absolute bottom-0 left-0 right-0"
                  style={{
                    height: `${flaskFillPct}%`,
                    backgroundColor: flaskColor,
                    // Long CSS transition for real-life colour change feel
                    transition: "height 0.5s ease-in-out, background-color 1.4s ease-in-out",
                  }}
                >
                  <div className="absolute top-0 w-full h-1.5 bg-white/20" />
                </div>
              </div>

              {/* Flask label */}
              <div className="absolute bottom-8 left-[118px] w-40 text-center text-xs font-medium text-muted-foreground">
                {flaskLabel}
              </div>

              {/* End-point badge */}
              <AnimatePresence>
                {atEndPoint && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-4 left-4 bg-blue-500/20 border border-blue-500/40 rounded-xl px-3 py-2 text-center"
                  >
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">End Point Reached!</p>
                    <p className="text-xs text-muted-foreground">{volThisTrial.toFixed(2)} mL EDTA</p>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </CardContent>
        </Card>
      </div>

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
                    <p className="text-green-600 dark:text-green-400 font-semibold mb-1">✓ Concordant readings obtained</p>
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

/* ─── Ion Exchange Column visual ─────────────────────────────────────────── */
interface ColumnProps {
  stage: "idle" | "washing" | "loading" | "done";
  progress: number;
}

const IonExchangeColumn = ({ stage, progress }: ColumnProps) => {
  const spent = stage === "loading" ? progress / 100 : stage === "done" ? 1 : 0;
  const resinColor = `rgba(${Math.round(220 - spent * 80)}, ${Math.round(130 - spent * 70)}, 50, 0.80)`;
  const waterInTop = stage === "washing" || stage === "loading";

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <p className="text-xs font-semibold text-muted-foreground">Ion Exchange Column</p>
      <p className="text-[9px] font-mono text-muted-foreground mb-0.5">Amberlite IR-200 Resin</p>

      {/* Funnel top */}
      <div className="w-10 h-5 border-2 border-slate-400/60 rounded-t-lg bg-slate-100/10 relative overflow-hidden">
        {waterInTop && (
          <motion.div className="absolute inset-0 bg-blue-400/30"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }} />
        )}
      </div>

      {/* Column tube */}
      <div className="relative w-14 h-48 border-2 border-slate-400/60 bg-slate-100/10 overflow-hidden shadow-lg">
        <div className="absolute top-1 left-0 right-0 text-center text-[8px] text-slate-500 font-mono z-10">IR-200</div>
        <div className="absolute top-5 left-1 right-1 h-2.5 bg-slate-200/50 rounded z-10" />
        <div className="absolute left-0 right-0"
          style={{ top: "30%", height: "52%", backgroundColor: resinColor, transition: "background-color 0.5s ease" }}>
          {[...Array(12)].map((_, i) => (
            <div key={i} className="absolute w-2 h-2 rounded-full bg-black/10"
              style={{ left: `${12 + (i % 4) * 22}%`, top: `${8 + Math.floor(i / 4) * 30}%` }} />
          ))}
        </div>
        <div className="absolute bottom-4 left-1 right-1 h-2.5 bg-slate-200/50 rounded z-10" />
        {(stage === "washing" || stage === "loading") && (
          <motion.div
            className={`absolute left-0 right-0 z-20 ${stage === "washing" ? "bg-blue-300/30" : "bg-blue-500/25"}`}
            animate={{ top: ["5%", "85%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            style={{ height: "12%" }} />
        )}
      </div>

      {/* Exit tip */}
      <div className="w-2 h-4 bg-slate-400/60 rounded-b" />

      {/* Drip */}
      <AnimatePresence>
        {(stage === "washing" || stage === "loading") && (
          <motion.div key="drip"
            className={`w-2 h-2.5 rounded-full ${stage === "loading" ? "bg-blue-400/70" : "bg-blue-300/70"}`}
            animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }} />
        )}
      </AnimatePresence>

      <p className="text-[9px] text-muted-foreground mt-1 text-center max-w-[90px] leading-tight">
        {stage === "idle" && "Ready"}
        {stage === "washing" && "Washing with distilled water..."}
        {stage === "loading" && `Exchanging ions... ${progress.toFixed(0)}%`}
        {stage === "done" && "✓ Exchange complete"}
      </p>
    </div>
  );
};

/* ─── Main simulator ─────────────────────────────────────────────────────── */
const HardnessSimulator = () => {
  const [activePart, setActivePart] = useState<1 | 2>(1);
  const [part1Hardness, setPart1Hardness] = useState<number | null>(null);
  const [part2Hardness, setPart2Hardness] = useState<number | null>(null);

  // Part 2 column steps
  const [columnStage, setColumnStage] = useState<"idle" | "washing" | "loading" | "done">("idle");
  const [columnProgress, setColumnProgress] = useState(0);
  const [washedColumn, setWashedColumn] = useState(false);
  const [columnDone, setColumnDone] = useState(false);

  const runWash = useCallback(() => {
    if (washedColumn || columnStage === "washing") return;
    setColumnStage("washing");
    setTimeout(() => {
      setColumnStage("idle");
      setWashedColumn(true);
    }, 3000);
  }, [washedColumn, columnStage]);

  const runHardWater = useCallback(() => {
    if (!washedColumn || columnDone || columnStage === "loading") return;
    setColumnStage("loading");
    setColumnProgress(0);
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
  }, [washedColumn, columnDone, columnStage]);

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
          {part1Hardness !== null && <span className="ml-2 text-xs opacity-80">✓ {part1Hardness.toFixed(0)} ppm</span>}
        </Button>

        <Button
          variant={activePart === 2 ? "default" : "outline"}
          className={activePart === 2 ? "lab-gradient-bg text-primary-foreground" : ""}
          onClick={() => setActivePart(2)}
        >
          Part 2 — Ion Exchange
          {part2Hardness !== null && <span className="ml-2 text-xs opacity-80">✓ {part2Hardness.toFixed(0)} ppm</span>}
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
          onComplete={handlePart1Complete}
        />
      )}

      {/* ── Part 2 ── */}
      {activePart === 2 && (
        <div className="space-y-6">

          {/* Ion exchange column — controls left, column visual right */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Controls left */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-display">
                  <FlaskConical className="w-5 h-5 text-primary" />
                  Part 2 — Column Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">

                <div className="bg-muted/40 p-3 rounded-xl text-xs text-muted-foreground space-y-1 mb-2">
                  <p><span className="font-semibold text-foreground">1.</span> Wash column with 50 mL distilled water — discard effluent.</p>
                  <p><span className="font-semibold text-foreground">2.</span> Pass 20 mL hard water — Ca²⁺ &amp; Mg²⁺ exchange with H⁺ ions.</p>
                  <p><span className="font-semibold text-foreground">3.</span> Collect effluent, then titrate with EDTA below.</p>
                </div>

                {/* Button 1: Pass distilled water */}
                <Button
                  onClick={runWash}
                  disabled={washedColumn || columnStage === "washing"}
                  variant={washedColumn ? "secondary" : "outline"}
                  className="w-full gap-2"
                >
                  {washedColumn ? (
                    <><Droplets className="w-4 h-4" /> 50 mL Distilled Water — Done ✓</>
                  ) : columnStage === "washing" ? (
                    <><motion.div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                      animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                      Washing column...</>
                  ) : (
                    <><Droplets className="w-4 h-4" /> Pass 50 mL Distilled Water</>
                  )}
                </Button>

                {/* Button 2: Add Hard Water to column */}
                <Button
                  onClick={runHardWater}
                  disabled={!washedColumn || columnDone || columnStage === "loading"}
                  variant={columnDone ? "secondary" : "outline"}
                  className="w-full gap-2"
                >
                  {columnDone ? (
                    <><Droplets className="w-4 h-4" /> Hard Water Through Column — Done ✓</>
                  ) : columnStage === "loading" ? (
                    <><motion.div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                      animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                      Passing hard water... {columnProgress.toFixed(0)}%</>
                  ) : (
                    <><Droplets className="w-4 h-4" /> Add Hard Water (20 mL)</>
                  )}
                </Button>

                {columnDone && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-600 dark:text-green-400 font-medium">
                    ✓ Effluent collected — scroll down to titrate with EDTA.
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Column visual right */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-display">
                  <FlaskConical className="w-5 h-5 text-primary" />
                  Ion Exchange Column Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-[360px] bg-gradient-to-b from-background to-muted/30 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">

                  {/* Stand base */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-36 h-3 bg-slate-700 rounded-sm shadow-md" />
                  {/* Vertical rod */}
                  <div className="absolute bottom-7 left-[calc(50%+40px)] w-2 h-[330px] bg-gradient-to-r from-slate-500 to-slate-400 rounded-t shadow-md" />

                  {/* Column centered */}
                  <div className="flex flex-col items-center">
                    <IonExchangeColumn stage={columnStage} progress={columnProgress} />
                  </div>

                  {/* Collection beaker at bottom */}
                  <div className="absolute bottom-[16px] left-1/2 -translate-x-1/2">
                    <div className="w-20 h-10 border-2 border-slate-400/50 bg-blue-100/10 rounded-b-md relative overflow-hidden">
                      {columnDone && (
                        <div className="absolute bottom-0 left-0 right-0 h-5 bg-blue-300/30"
                          style={{ transition: "height 0.8s ease" }} />
                      )}
                    </div>
                    <p className="text-[9px] text-muted-foreground text-center mt-1">Collected Effluent</p>
                  </div>

                  {/* Stage badge */}
                  {columnStage === "done" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="absolute top-3 right-3 bg-green-500/20 border border-green-500/30 rounded-lg px-2 py-1">
                      <p className="text-[10px] text-green-600 dark:text-green-400 font-semibold">Exchange Complete ✓</p>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* EDTA titration of effluent — unlocks after column done */}
          {columnDone && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <TitrationPanel
                partLabel="Part 2"
                flaskLabel="Post-Column Effluent"
                trueV={TRUE_V2}
                burretteColor="rgba(200, 180, 80, 0.45)"
                dropColor="rgba(200, 180, 80, 0.80)"
                onComplete={handlePart2Complete}
                skipHardWaterStep={true}
              />
            </motion.div>
          )}
        </div>
      )}

      {/* ── Combined result ── */}
      {part1Hardness !== null && part2Hardness !== null && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card border-0 bg-green-500/5">
            <CardHeader>
              <CardTitle className="font-display text-green-600 dark:text-green-400">✓ Final Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-background rounded-xl text-center">
                  <p className="text-xs text-muted-foreground mb-1">Sample Water Hardness</p>
                  <p className="text-2xl font-display font-bold text-primary">{part1Hardness.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">ppm CaCO₃</p>
                </div>
                <div className="p-4 bg-background rounded-xl text-center">
                  <p className="text-xs text-muted-foreground mb-1">Purified Water Hardness</p>
                  <p className="text-2xl font-display font-bold text-blue-500">{part2Hardness.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">ppm CaCO₃</p>
                </div>
                <div className="p-4 bg-background rounded-xl text-center">
                  <p className="text-xs text-muted-foreground mb-1">Percent Purification</p>
                  <p className="text-2xl font-display font-bold text-green-600 dark:text-green-400">{purificationPct!.toFixed(1)}%</p>
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
