import { useState, useCallback, useEffect, useMemo, useRef, type DragEvent } from "react";
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

const APPARATUS_SCENE_HEIGHT = 540;
const APPARATUS = {
  standBaseLeft: 18,
  standBaseWidth: 292,
  standBaseBottom: 20,
  rodLeft: 106,
  rodTop: 8,
  rodBottom: 23,
  clampArmLeft: 106,
  clampArmTop: 22,
  clampArmWidth: 96,
  clampRingLeft: 190,
  clampRingTop: 16,
  buretteLeft: 183,
  buretteTop: 8,
  platformLeft: 111,
  platformWidth: 170,
  platformBottom: 23,
  tileLeft: 121,
  tileWidth: 150,
  tileBottom: 33,
  flaskLeft: 121,
  flaskWidth: 150,
  flaskHeight: 200,
  flaskBottom: 39,
  flaskMouthInsetTop: 14,
} as const;

const SAMPLE_FILL_PCT = 42;
const BUFFER_FILL_BOOST = 6;
const INDICATOR_FILL_BOOST = 3;

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
  const [isFlaskHover, setIsFlaskHover] = useState(false);

  const [stage, setStage] = useState<ReagentStage>("water");

  // Pouring animation states
  const [isPouringBuffer, setIsPouringBuffer] = useState(false);
  const [isPouringIndicator, setIsPouringIndicator] = useState(false);
  const apparatusRef = useRef<HTMLDivElement | null>(null);
  const bufferBottleRef = useRef<HTMLDivElement | null>(null);
  const indicatorBottleRef = useRef<HTMLDivElement | null>(null);
  const [pourPaths, setPourPaths] = useState({ buffer: "", indicator: "" });
  const panelId = useMemo(
    () => partLabel.replace(/[^a-z0-9]+/gi, "").toLowerCase(),
    [partLabel],
  );

  const volThisTrial = volAdded - trialStart;
  const flaskColor = getFlaskColor(volThisTrial, trueV, stage);
  const colorLabel = getColorLabel(volThisTrial, trueV, stage);
  const atEndPoint = stage === "titrating" && volThisTrial >= trueV * 0.97;
  const buretteFillPct = Math.max(0, (1 - volAdded / MAX_EDTA) * 100);
  const flaskFillPct = useMemo(() => {
    if (stage === "empty") return 0;

    const bufferBoost =
      stage === "buffer" || stage === "indicator" || stage === "titrating"
        ? BUFFER_FILL_BOOST
        : 0;
    const indicatorBoost =
      stage === "indicator" || stage === "titrating" ? INDICATOR_FILL_BOOST : 0;
    const titrationBoost =
      stage === "titrating" ? (volThisTrial / (trueV * 3)) * 18 : 0;

    return Math.min(
      78,
      SAMPLE_FILL_PCT + bufferBoost + indicatorBoost + titrationBoost,
    );
  }, [stage, volThisTrial, trueV]);

  // Calculate pouring fill animation
  const pouringFillPct = useMemo(() => {
    if (isPouringBuffer) {
      return Math.min(78, flaskFillPct + BUFFER_FILL_BOOST);
    }
    if (isPouringIndicator) {
      return Math.min(78, flaskFillPct + INDICATOR_FILL_BOOST);
    }
    return flaskFillPct;
  }, [isPouringBuffer, isPouringIndicator, flaskFillPct]);
  const displayFillPct =
    isPouringBuffer || isPouringIndicator ? pouringFillPct : flaskFillPct;
  const liquidSurfaceY = 200 - (displayFillPct / 100) * 196;
  const rippleY = Math.min(170, Math.max(74, liquidSurfaceY + 18));

  const addTitrant = useCallback((amount: number) => {
    if ((stage !== "indicator" && stage !== "titrating") || completed) return;
    if (stage === "indicator") setStage("titrating");
    setVolAdded(prev => Math.min(prev + amount, MAX_EDTA));
    setIsDropping(true);
    setTimeout(() => setIsDropping(false), 700);
  }, [stage, completed]);

  const handleSlider = useCallback((val: number) => {
    if ((stage !== "indicator" && stage !== "titrating") || completed) return;
    if (stage === "indicator") setStage("titrating");
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
    setStage("water");

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
    setReadings([]); setIsDropping(false); setCompleted(false);
    setStage("water");
    setIsFlaskHover(false);
  }, []);

  const handleReagentDrop = useCallback((reagent: "buffer" | "indicator") => {
    if (completed) return;
    if (reagent === "buffer" && stage === "water") {
      setIsPouringBuffer(true);
      // Animate pouring for 2 seconds, then change stage
      setTimeout(() => {
        setIsPouringBuffer(false);
        setStage("buffer");
      }, 2000);
    }
    if (reagent === "indicator" && stage === "buffer") {
      setIsPouringIndicator(true);
      // Animate pouring for 1.5 seconds, then change stage
      setTimeout(() => {
        setIsPouringIndicator(false);
        setStage("indicator");
      }, 1500);
    }
  }, [stage, completed]);

  const handleFlaskDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsFlaskHover(true);
  }, []);

  const handleFlaskDragLeave = useCallback(() => setIsFlaskHover(false), []);

  const handleFlaskDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const reagent = event.dataTransfer.getData("text/plain") as "buffer" | "indicator" | "";
    if (reagent === "buffer" || reagent === "indicator") {
      handleReagentDrop(reagent);
    }
    setIsFlaskHover(false);
  }, [handleReagentDrop]);

  const updatePourPaths = useCallback(() => {
    if (!apparatusRef.current) return;

    const containerRect = apparatusRef.current.getBoundingClientRect();
    const flaskMouthX = APPARATUS.flaskLeft + APPARATUS.flaskWidth / 2;
    const flaskMouthY =
      APPARATUS_SCENE_HEIGHT -
      APPARATUS.flaskBottom -
      APPARATUS.flaskHeight +
      APPARATUS.flaskMouthInsetTop;

    const buildPath = (
      sourceEl: HTMLDivElement | null,
      neckLift: number,
      horizontalBend: number,
    ) => {
      if (!sourceEl) return "";

      const sourceRect = sourceEl.getBoundingClientRect();
      const startX =
        sourceRect.left - containerRect.left + sourceRect.width * 0.52;
      const startY = sourceRect.top - containerRect.top + 10;
      const control1X = startX - 18;
      const control1Y = startY + 36;
      const control2X = flaskMouthX + horizontalBend;
      const control2Y = flaskMouthY - neckLift;

      return [
        `M ${startX.toFixed(1)} ${startY.toFixed(1)}`,
        `C ${control1X.toFixed(1)} ${control1Y.toFixed(1)},`,
        `${control2X.toFixed(1)} ${control2Y.toFixed(1)},`,
        `${flaskMouthX.toFixed(1)} ${flaskMouthY.toFixed(1)}`,
      ].join(" ");
    };

    setPourPaths({
      buffer: buildPath(bufferBottleRef.current, 62, 48),
      indicator: buildPath(indicatorBottleRef.current, 68, 34),
    });
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(updatePourPaths);
    window.addEventListener("resize", updatePourPaths);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePourPaths);
    };
  }, [updatePourPaths, isPouringBuffer, isPouringIndicator]);

  const vols = readings.map(r => r.volume);
  const avgVol = vols.length ? vols.reduce((a, b) => a + b, 0) / vols.length : 0;
  const hardness = (avgVol * 1000) / VOL_SAMPLE;
  const concordant = vols.length >= 2 && Math.max(...vols) - Math.min(...vols) <= 0.1;

  const canAddEDTA = (stage === "indicator" || stage === "titrating") && !completed;
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

            {/* Step 2: Add Buffer Solution */}
            <Button
              variant={isPouringBuffer || stage === "buffer" || stage === "indicator" || stage === "titrating" ? "secondary" : "outline"}
              className="w-full gap-2"
              onClick={() => handleReagentDrop("buffer")}
              disabled={stage !== "water" || completed || isPouringBuffer || isPouringIndicator}
            >
              <FlaskConical className="w-4 h-4" />
              {isPouringBuffer
                ? "Pouring Buffer Solution..."
                : stage === "buffer" || stage === "indicator" || stage === "titrating"
                ? "Buffer Solution Added ✓"
                : "Add Buffer Solution (pH 9–10)"}
            </Button>

            {/* Step 3: Add Calmagite Indicator */}
            <Button
              variant={isPouringIndicator || stage === "indicator" || stage === "titrating" ? "secondary" : "outline"}
              className="w-full gap-2"
              onClick={() => handleReagentDrop("indicator")}
              disabled={stage !== "buffer" || completed || isPouringBuffer || isPouringIndicator}
            >
              <Droplets className="w-4 h-4" />
              {isPouringIndicator
                ? "Pouring Calmagite Indicator..."
                : stage === "indicator" || stage === "titrating"
                ? "Calmagite Indicator Added ✓"
                : "Add Calmagite Indicator"}
            </Button>

            {/* EDTA controls — slider + quick-add buttons */}
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
                        disabled={volAdded >= MAX_EDTA || !canAddEDTA}
                      >
                        +{amt}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

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
            <div
              ref={apparatusRef}
              className={`relative h-[540px] bg-gradient-to-b from-background to-muted/30 rounded-xl overflow-hidden shadow-inner select-none ${isFlaskHover ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-background" : ""}`}
              onDragOver={handleFlaskDragOver}
              onDragLeave={handleFlaskDragLeave}
              onDrop={handleFlaskDrop}
            >
              <div className="absolute -top-10 left-6 h-36 w-36 rounded-full bg-sky-400/10 blur-3xl pointer-events-none" />
              <div className="absolute top-32 right-8 h-28 w-28 rounded-full bg-amber-300/10 blur-3xl pointer-events-none" />

              {/* ── Table surface ── */}
              <div className="absolute bottom-0 left-0 right-0 h-5 bg-amber-900/15 border-t border-amber-700/20 rounded-b-xl" />

              {/* ═══ RETORT STAND ═══ */}
              {/* Base plate — extra wide */}
              <div
                className="absolute h-[18px] bg-gradient-to-r from-slate-700 via-slate-600 to-slate-500 rounded shadow-lg border-t border-slate-400/30"
                style={{
                  bottom: `${APPARATUS.standBaseBottom}px`,
                  left: `${APPARATUS.standBaseLeft}px`,
                  width: `${APPARATUS.standBaseWidth}px`,
                }}
              />
              {/* Vertical rod */}
              <div
                className="absolute w-[10px] bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 rounded-t shadow-md"
                style={{
                  left: `${APPARATUS.rodLeft}px`,
                  bottom: `${APPARATUS.rodBottom}px`,
                  top: `${APPARATUS.rodTop}px`,
                }}
              />
              {/* Burette clamp arm */}
              <div
                className="absolute h-[10px] bg-gradient-to-r from-slate-500 to-slate-400 rounded-r shadow"
                style={{
                  top: `${APPARATUS.clampArmTop}px`,
                  left: `${APPARATUS.clampArmLeft}px`,
                  width: `${APPARATUS.clampArmWidth}px`,
                }}
              />
              {/* Clamp ring around burette */}
              <div
                className="absolute w-[18px] h-[18px] border-[3px] border-slate-500 rounded-sm bg-slate-600/50 shadow z-30"
                style={{
                  top: `${APPARATUS.clampRingTop}px`,
                  left: `${APPARATUS.clampRingLeft}px`,
                }}
              />

              {/* ═══ BURETTE ═══ */}
              <div
                className="absolute flex flex-col items-center z-20"
                style={{
                  top: `${APPARATUS.buretteTop}px`,
                  left: `${APPARATUS.buretteLeft}px`,
                }}
              >
                {/* Top cap / funnel rim */}
                <div className="w-10 h-3 bg-slate-500 rounded-t-md shadow" />
                {/* Label above burette */}
                <div className="absolute -top-4 left-0 right-0 text-center text-[8px] font-mono text-slate-500 font-semibold">EDTA</div>
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
                    className="absolute bottom-0 left-0 right-0"
                    style={{ backgroundColor: burretteColor }}
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
                      className="w-2.5 h-3 rounded-b-full pointer-events-none"
                      style={{ backgroundColor: dropColor }}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* ═══ CONICAL FLASK ═══ */}
              {/* Support platform on stand base */}
              <div
                className="absolute h-[10px] bg-gradient-to-r from-slate-500 to-slate-400 rounded shadow-md"
                style={{
                  bottom: `${APPARATUS.platformBottom}px`,
                  left: `${APPARATUS.platformLeft}px`,
                  width: `${APPARATUS.platformWidth}px`,
                }}
              />
              {/* White tile under flask */}
              <div
                className="absolute rounded-full bg-slate-900/10 blur-md"
                style={{
                  bottom: `${APPARATUS.tileBottom - 2}px`,
                  left: `${APPARATUS.tileLeft + 8}px`,
                  width: `${APPARATUS.tileWidth - 16}px`,
                  height: "18px",
                }}
              />
              <div
                className="absolute h-[6px] bg-white/60 dark:bg-white/15 rounded shadow-sm border border-slate-300/50"
                style={{
                  bottom: `${APPARATUS.tileBottom}px`,
                  left: `${APPARATUS.tileLeft}px`,
                  width: `${APPARATUS.tileWidth}px`,
                }}
              />

              {/* Flask outline as SVG for realistic glass look */}
              <svg
                className="absolute z-10 pointer-events-none"
                style={{
                  bottom: `${APPARATUS.flaskBottom}px`,
                  left: `${APPARATUS.flaskLeft}px`,
                  width: `${APPARATUS.flaskWidth}px`,
                  height: `${APPARATUS.flaskHeight}px`,
                  filter: "drop-shadow(0 16px 18px rgba(15, 23, 42, 0.08))",
                }}
                viewBox="0 0 150 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <clipPath id={`flaskClip-${panelId}`}>
                    <polygon points="56,0 94,0 94,52 146,174 148,196 2,196 4,174 56,52" />
                  </clipPath>
                </defs>

                {/* Liquid fill — clipped to flask interior */}
                <rect
                  x="0" y={liquidSurfaceY}
                  width="150"
                  height={(displayFillPct / 100) * 196}
                  clipPath={`url(#flaskClip-${panelId})`}
                  style={{
                    fill: flaskColor,
                    transition: isPouringBuffer || isPouringIndicator ? "none" : "y 0.6s ease-in-out, height 0.6s ease-in-out, fill 1.4s ease-in-out",
                  }}
                />

                {/* Liquid surface sheen */}
                {(displayFillPct > 0 || isPouringBuffer || isPouringIndicator) && (
                  <rect
                    x="0" y={liquidSurfaceY}
                    width="150" height="3"
                    clipPath={`url(#flaskClip-${panelId})`}
                    fill="rgba(255,255,255,0.25)"
                    style={{
                      transition: isPouringBuffer || isPouringIndicator ? "none" : "y 0.6s ease-in-out"
                    }}
                  />
                )}

                {/* Flask glass outline */}
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
              <div
                className="absolute text-center text-[11px] font-medium text-muted-foreground z-20"
                style={{
                  bottom: "14px",
                  left: `${APPARATUS.flaskLeft}px`,
                  width: `${APPARATUS.flaskWidth}px`,
                }}
              >
                {flaskLabel}
              </div>

              {/* Pouring progress indicator */}
              <AnimatePresence>
                {(isPouringBuffer || isPouringIndicator) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute z-30"
                    style={{
                      bottom: "25px",
                      left: `${APPARATUS.flaskLeft}px`,
                      width: `${APPARATUS.flaskWidth}px`,
                    }}
                  >
                    <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1 border border-border/50">
                      <div className="flex items-center justify-center gap-2">
                        <motion.div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: isPouringBuffer ? "#FACC15" : "#EF4444" }}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        />
                        <span className="text-xs font-medium text-foreground">
                          {isPouringBuffer ? "Adding Buffer Solution..." : "Adding Calmagite Indicator..."}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reagent bottles */}
              <motion.div
                ref={indicatorBottleRef}
                className="absolute top-[190px] right-[34px] z-40 flex flex-col items-center gap-0.5 cursor-grab"
                draggable={!completed && !isPouringBuffer && !isPouringIndicator}
                onDragStart={e => e.dataTransfer.setData("text/plain", "indicator")}
                title="Drag Calmagite indicator into the flask"
                style={{ transformOrigin: "50% 0%" }}
                animate={isPouringIndicator ? { rotate: -62, x: -22, y: -18 } : { rotate: 0, x: 0, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="w-3 h-4 bg-red-800/60 rounded-t-sm" />
                <div className="relative w-8 h-14 bg-gradient-to-b from-red-300/60 via-red-400/45 to-red-600/45 border border-red-400/40 rounded-b-md rounded-t-sm flex items-end justify-center pb-1 shadow-md">
                  <div className="absolute left-[5px] top-[5px] h-8 w-[3px] rounded-full bg-white/35" />
                  <span className="text-[6px] text-red-200/90 font-medium text-center leading-tight">Calma-<br />gite</span>
                </div>
              </motion.div>
              <motion.div
                ref={bufferBottleRef}
                className="absolute top-[210px] right-[74px] z-40 flex flex-col items-center gap-0.5 cursor-grab"
                draggable={!completed && !isPouringBuffer && !isPouringIndicator}
                onDragStart={e => e.dataTransfer.setData("text/plain", "buffer")}
                title="Drag buffer solution into the flask"
                style={{ transformOrigin: "50% 0%" }}
                animate={isPouringBuffer ? { rotate: -58, x: -18, y: -14 } : { rotate: 0, x: 0, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="w-3 h-4 bg-yellow-800/60 rounded-t-sm" />
                <div className="relative w-8 h-14 bg-gradient-to-b from-amber-100/85 via-yellow-300/60 to-yellow-500/45 border border-yellow-400/50 rounded-b-md rounded-t-sm flex items-end justify-center pb-1 shadow-md">
                  <div className="absolute left-[5px] top-[5px] h-8 w-[3px] rounded-full bg-white/40" />
                  <span className="text-[6px] text-yellow-900/90 dark:text-yellow-100/80 font-medium text-center leading-tight">Buffer<br />pH9-10</span>
                </div>
              </motion.div>

              {/* Pouring animations */}
              <svg className="absolute inset-0 z-30 pointer-events-none overflow-visible">
                <defs>
                  <linearGradient id={`${panelId}-bufferStream`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(250, 204, 21, 0.95)" />
                    <stop offset="100%" stopColor="rgba(250, 204, 21, 0.28)" />
                  </linearGradient>
                  <linearGradient id={`${panelId}-indicatorStream`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(239, 68, 68, 0.92)" />
                    <stop offset="100%" stopColor="rgba(239, 68, 68, 0.30)" />
                  </linearGradient>
                </defs>

                <AnimatePresence>
                  {isPouringBuffer && pourPaths.buffer && (
                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <motion.path
                        d={pourPaths.buffer}
                        stroke={`url(#${panelId}-bufferStream)`}
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                      <motion.path
                        d={pourPaths.buffer}
                        stroke="rgba(255,255,255,0.32)"
                        strokeWidth="1.8"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.7 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                      {[...Array(3)].map((_, i) => (
                        <circle key={`buffer-droplet-${i}`} r="2.1" fill="rgba(250, 204, 21, 0.95)" opacity="0">
                          <animateMotion
                            dur="1.1s"
                            begin={`${i * 0.18}s`}
                            repeatCount="indefinite"
                            path={pourPaths.buffer}
                          />
                          <animate
                            attributeName="opacity"
                            values="0;1;0"
                            dur="1.1s"
                            begin={`${i * 0.18}s`}
                            repeatCount="indefinite"
                          />
                        </circle>
                      ))}
                    </motion.g>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {isPouringIndicator && pourPaths.indicator && (
                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <motion.path
                        d={pourPaths.indicator}
                        stroke={`url(#${panelId}-indicatorStream)`}
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                      <motion.path
                        d={pourPaths.indicator}
                        stroke="rgba(255,255,255,0.26)"
                        strokeWidth="1.6"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.65 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                      {[...Array(3)].map((_, i) => (
                        <circle key={`indicator-droplet-${i}`} r="2.1" fill="rgba(239, 68, 68, 0.95)" opacity="0">
                          <animateMotion
                            dur="1.05s"
                            begin={`${i * 0.16}s`}
                            repeatCount="indefinite"
                            path={pourPaths.indicator}
                          />
                          <animate
                            attributeName="opacity"
                            values="0;1;0"
                            dur="1.05s"
                            begin={`${i * 0.16}s`}
                            repeatCount="indefinite"
                          />
                        </circle>
                      ))}
                    </motion.g>
                  )}
                </AnimatePresence>
              </svg>

              {/* Pouring ripples in flask */}
              <AnimatePresence>
                {(isPouringBuffer || isPouringIndicator) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute z-20"
                    style={{
                      bottom: `${APPARATUS.flaskBottom}px`,
                      left: `${APPARATUS.flaskLeft}px`,
                    }}
                  >
                    <svg width="150" height="200" viewBox="0 0 150 200" className="absolute">
                      {/* Ripples emanating from pour point */}
                      {[...Array(3)].map((_, i) => (
                        <motion.circle
                          key={i}
                          cx="75"
                          cy={rippleY}
                          r="0"
                          stroke={isPouringBuffer ? "rgba(250, 204, 21, 0.6)" : "rgba(239, 68, 68, 0.6)"}
                          strokeWidth="2"
                          fill="none"
                          initial={{ r: 0, opacity: 0.8 }}
                          animate={{ r: 40, opacity: 0 }}
                          transition={{
                            duration: 1.5,
                            delay: i * 0.3,
                            repeat: Infinity,
                            ease: "easeOut"
                          }}
                        />
                      ))}
                      {/* Small bubbles rising */}
                      {[...Array(5)].map((_, i) => (
                        <motion.circle
                          key={`bubble-${i}`}
                          r="1"
                          fill={isPouringBuffer ? "rgba(250, 204, 21, 0.8)" : "rgba(239, 68, 68, 0.8)"}
                          initial={{ cx: 66 + (i * 4), cy: rippleY + 10, opacity: 0 }}
                          animate={{
                            cx: 66 + (i * 4) + (i % 2 === 0 ? 6 : -6),
                            cy: rippleY - 38,
                            opacity: [0, 1, 0]
                          }}
                          transition={{
                            duration: 2,
                            delay: i * 0.2,
                            repeat: Infinity,
                            ease: "easeOut"
                          }}
                        />
                      ))}
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>

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
  const isFlowing = stage === "washing" || stage === "loading";

  // Resin color darkens as ions are exchanged (amber → dark brown)
  const resinR = Math.round(210 - spent * 70);
  const resinG = Math.round(155 - spent * 80);
  const resinB = Math.round(45 + spent * 15);

  return (
    <svg
      width="120" height="320" viewBox="0 0 120 320"
      className="shrink-0"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Glass gradient for realistic column look */}
        <linearGradient id="colGlass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(148,163,184,0.25)" />
          <stop offset="30%" stopColor="rgba(226,232,240,0.08)" />
          <stop offset="70%" stopColor="rgba(226,232,240,0.08)" />
          <stop offset="100%" stopColor="rgba(148,163,184,0.25)" />
        </linearGradient>
        {/* Resin bead pattern */}
        <radialGradient id="resinBead">
          <stop offset="0%" stopColor={`rgba(${resinR + 30},${resinG + 30},${resinB},0.9)`} />
          <stop offset="70%" stopColor={`rgba(${resinR},${resinG},${resinB},0.85)`} />
          <stop offset="100%" stopColor={`rgba(${resinR - 20},${resinG - 20},${resinB},0.7)`} />
        </radialGradient>
        <clipPath id="colTubeClip">
          <rect x="32" y="52" width="56" height="200" rx="2" />
        </clipPath>
      </defs>

      {/* Label */}
      <text x="60" y="14" textAnchor="middle" className="text-[10px] font-semibold fill-muted-foreground">Ion Exchange Column</text>
      <text x="60" y="26" textAnchor="middle" className="text-[8px] font-mono fill-muted-foreground">Amberlite IR-200</text>

      {/* ── Reservoir / Funnel at top ── */}
      {/* Funnel bowl */}
      <polygon points="36,35 84,35 78,52 42,52" fill="url(#colGlass)" stroke="rgba(148,163,184,0.6)" strokeWidth="1.5" />
      {/* Water in funnel */}
      {isFlowing && (
        <>
          <polygon points="40,40 80,40 78,52 42,52" fill={stage === "washing" ? "rgba(147,197,253,0.35)" : "rgba(96,165,250,0.30)"}>
            <animate attributeName="opacity" values="0.5;0.8;0.5" dur="1.5s" repeatCount="indefinite" />
          </polygon>
        </>
      )}

      {/* ── Glass Column Tube ── */}
      <rect x="32" y="52" width="56" height="200" rx="2"
        fill="url(#colGlass)" stroke="rgba(148,163,184,0.7)" strokeWidth="2" />

      {/* Glass reflection highlight */}
      <line x1="36" y1="56" x2="36" y2="248" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />

      {/* ── Column layers inside (clipped to tube) ── */}
      <g clipPath="url(#colTubeClip)">
        {/* Top glass wool plug */}
        <rect x="32" y="55" width="56" height="14" fill="rgba(220,220,220,0.35)" />
        {/* Glass wool fibers */}
        {[...Array(8)].map((_, i) => (
          <line key={`tw${i}`}
            x1={35 + i * 7} y1={57 + (i % 3) * 3}
            x2={38 + i * 7} y2={65 - (i % 2) * 2}
            stroke="rgba(200,200,200,0.5)" strokeWidth="0.8" />
        ))}

        {/* Resin bed */}
        <rect x="32" y="72" width="56" height="142"
          fill={`rgba(${resinR},${resinG},${resinB},0.75)`}
          style={{ transition: "fill 0.8s ease" }} />
        {/* Resin beads — arranged as pattern of small circles */}
        {[...Array(7)].map((_, row) =>
          [...Array(5)].map((__, col) => (
            <circle key={`b${row}-${col}`}
              cx={39 + col * 11 + (row % 2) * 5}
              cy={80 + row * 19}
              r="4"
              fill="url(#resinBead)"
              style={{ transition: "fill 0.8s ease" }}
            />
          ))
        )}

        {/* Bottom glass wool plug */}
        <rect x="32" y="217" width="56" height="14" fill="rgba(220,220,220,0.35)" />
        {[...Array(8)].map((_, i) => (
          <line key={`bw${i}`}
            x1={35 + i * 7} y1={219 + (i % 3) * 3}
            x2={38 + i * 7} y2={227 - (i % 2) * 2}
            stroke="rgba(200,200,200,0.5)" strokeWidth="0.8" />
        ))}

        {/* Sand layer at bottom */}
        <rect x="32" y="234" width="56" height="10" fill="rgba(194,178,128,0.4)" />
        {/* Sand dots */}
        {[...Array(15)].map((_, i) => (
          <circle key={`s${i}`}
            cx={36 + (i % 6) * 9} cy={237 + Math.floor(i / 6) * 3}
            r="1" fill="rgba(160,140,100,0.5)" />
        ))}

        {/* Flowing water band animation */}
        {isFlowing && (
          <rect
            x="32" width="56" height="28"
            fill={stage === "washing" ? "rgba(147,197,253,0.30)" : "rgba(96,165,250,0.25)"}
          >
            <animate attributeName="y" values="52;224;52" dur="3s" repeatCount="indefinite" />
          </rect>
        )}
      </g>

      {/* ── Exit nozzle ── */}
      <rect x="55" y="252" width="10" height="18" rx="2"
        fill="rgba(148,163,184,0.5)" stroke="rgba(148,163,184,0.6)" strokeWidth="1" />

      {/* ── Drip animation ── */}
      {isFlowing && (
        <ellipse cx="60" cy="275" rx="3" ry="4"
          fill={stage === "loading" ? "rgba(96,165,250,0.7)" : "rgba(147,197,253,0.7)"}
        >
          <animate attributeName="cy" values="272;292;272" dur="1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" />
        </ellipse>
      )}

      {/* ── Clamp on right side ── */}
      <rect x="88" y="110" width="22" height="8" rx="2" fill="rgba(100,116,139,0.7)" />
      <rect x="108" y="60" width="6" height="200" rx="1" fill="rgba(148,163,184,0.5)" />

      {/* Status text */}
      <text x="60" y="310" textAnchor="middle" className="text-[9px] fill-muted-foreground">
        {stage === "idle" && "Ready"}
        {stage === "washing" && "Washing with distilled water..."}
        {stage === "loading" && `Exchanging ions… ${progress.toFixed(0)}%`}
        {stage === "done" && "✓ Exchange complete"}
      </text>
    </svg>
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
