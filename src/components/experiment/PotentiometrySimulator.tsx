import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  RotateCcw,
  Droplets,
  Beaker
} from "lucide-react";
import AbsorbanceGraph from "./AbsorbanceGraph";

interface DataPoint {
  volume: number;
  pH: number;
}

// Calculate pH during acid-base titration
const calculatePH = (volumeNaOH: number, initialHClVolume: number, hclConc: number, naohConc: number): number => {
  const molesHCl = (initialHClVolume / 1000) * hclConc;
  const molesNaOH = (volumeNaOH / 1000) * naohConc;
  const totalVolume = (initialHClVolume + volumeNaOH) / 1000;

  if (molesNaOH < molesHCl * 0.99) {
    // Before equivalence point - excess HCl
    const excessHCl = molesHCl - molesNaOH;
    const hConc = excessHCl / totalVolume;
    return -Math.log10(hConc);
  } else if (molesNaOH > molesHCl * 1.01) {
    // After equivalence point - excess NaOH
    const excessNaOH = molesNaOH - molesHCl;
    const ohConc = excessNaOH / totalVolume;
    const pOH = -Math.log10(ohConc);
    return 14 - pOH;
  } else {
    // At equivalence point
    return 7;
  }
};

const PotentiometrySimulator = () => {
  console.log("PotentiometrySimulator MOUNTED - VERSION 2");
  const [volumeAdded, setVolumeAdded] = useState(0);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [isStirring, setIsStirring] = useState(false);
  const [currentPH, setCurrentPH] = useState(1);

  const hclConc = 0.1; // M
  const naohConc = 0.1; // M
  const initialHClVolume = 20; // mL
  const equivalenceVolume = (initialHClVolume * hclConc) / naohConc;

  const addTitrant = useCallback((amount: number) => {
    const newVolume = Math.min(volumeAdded + amount, 40);
    setVolumeAdded(newVolume);
    const pH = calculatePH(newVolume, initialHClVolume, hclConc, naohConc);
    setCurrentPH(pH);
    setIsStirring(true);
    setTimeout(() => setIsStirring(false), 800);
  }, [volumeAdded]);

  const recordReading = useCallback(() => {
    const pH = calculatePH(volumeAdded, initialHClVolume, hclConc, naohConc);
    const newPoint: DataPoint = { volume: volumeAdded, pH };
    setDataPoints(prev => {
      const filtered = prev.filter(p => p.volume !== volumeAdded);
      return [...filtered, newPoint].sort((a, b) => a.volume - b.volume);
    });
  }, [volumeAdded]);

  const resetExperiment = useCallback(() => {
    setVolumeAdded(0);
    setDataPoints([]);
    setCurrentPH(1);
    setIsStirring(false);
  }, []);

  // Smooth color transition based on pH
  // Red (Acid) -> Orange -> Yellow -> Green (Neutral) -> Blue -> Purple (Base)
  const getSolutionColor = (pH: number): string => {
    if (pH < 2) return "rgba(239, 68, 68, 0.6)"; // Red
    if (pH < 4) return "rgba(249, 115, 22, 0.5)"; // Orange
    if (pH < 6) return "rgba(234, 179, 8, 0.5)"; // Yellow/Orange
    if (pH < 8) return "rgba(34, 197, 94, 0.4)"; // Green
    if (pH < 10) return "rgba(59, 130, 246, 0.5)"; // Blue
    if (pH < 12) return "rgba(99, 102, 241, 0.5)"; // Indigo
    return "rgba(168, 85, 247, 0.6)"; // Purple
  };

  const solutionStyle = {
    backgroundColor: getSolutionColor(currentPH),
    transition: "background-color 1s ease-in-out"
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Controls Panel */}
        <Card className="glass-card border-0 order-2 lg:order-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <Droplets className="w-5 h-5 text-primary" />
              Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-xl">
              <h4 className="font-semibold mb-2">Experiment Setup</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• HCl volume: {initialHClVolume} mL ({hclConc} M)</li>
                <li>• NaOH concentration: {naohConc} M</li>
                <li>• Expected equivalence: {equivalenceVolume.toFixed(1)} mL</li>
              </ul>
            </div>

            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">NaOH Added</label>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {volumeAdded.toFixed(1)} mL
                </span>
              </div>
              <Slider
                value={[volumeAdded]}
                onValueChange={([v]) => {
                  setVolumeAdded(v);
                  setCurrentPH(calculatePH(v, initialHClVolume, hclConc, naohConc));
                }}
                min={0}
                max={40}
                step={0.5}
                className="py-2"
              />
            </div>

            {/* Quick Add Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[0.5, 1, 2, 5].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => addTitrant(amount)}
                >
                  +{amount} mL
                </Button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={recordReading}
                className="flex-1 gap-2 lab-gradient-bg text-primary-foreground"
              >
                <Play className="w-4 h-4" />
                Record Reading
              </Button>
              <Button variant="outline" onClick={resetExperiment} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>

            {/* pH Display */}
            <div className="bg-primary/10 rounded-xl p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Current pH</p>
                <p className="text-4xl font-display font-bold text-primary">
                  {currentPH.toFixed(2)}
                </p>
                <div
                  className="w-full h-3 rounded-full mt-3"
                  style={{
                    background: 'linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6)',
                  }}
                >
                  <div
                    className="w-3 h-3 bg-foreground rounded-full relative transition-all duration-300"
                    style={{ left: `${(currentPH / 14) * 100}%`, transform: 'translateX(-50%)' }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Acidic</span>
                  <span>Neutral</span>
                  <span>Basic</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Apparatus Visualization */}
        <Card className="glass-card border-0 order-1 lg:order-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <Beaker className="w-5 h-5 text-primary" />
              Titration Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-[500px] bg-gradient-to-b from-background to-muted/30 rounded-xl overflow-hidden shadow-inner w-full">

              {/* --- Background Elements --- */}
              {/* Table Surface */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/5 dark:bg-white/5 border-t border-border/10" />

              {/* Apparatus Positioning Container - Using absolute positioning */}
              <div className="absolute inset-0">


                {/* Stand - Left side with base */}
                <div className="absolute left-24 bottom-4 w-32 h-[470px]">
                  {/* Base */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-3 bg-slate-700 rounded-sm shadow-md" />
                  {/* Vertical Rod */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-2 h-[460px] bg-gradient-to-r from-slate-500 to-slate-400 rounded-t-sm shadow-md" />

                  {/* Clamp at top */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-10 bg-slate-600 rounded-sm shadow" />
                  {/* Horizontal Clamp Arm */}
                  <div className="absolute top-2 left-1/2 w-24 h-2.5 bg-slate-600 rounded-r-sm shadow-md" />
                </div>

                {/* Burette - Hanging from clamp */}
                <div className="absolute left-[168px] top-12">
                  <div className="flex flex-col items-center">
                    {/* Burette Tube */}
                    <div className="w-8 h-80 bg-slate-100/20 backdrop-blur-sm border-2 border-slate-400/50 rounded-b-md relative overflow-hidden shadow-xl">
                      {/* Graduations */}
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className="absolute right-0 w-2.5 h-[1px] bg-slate-500/60" style={{ top: `${(i + 1) * 9}%` }} />
                      ))}

                      {/* Volume label at top */}
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-600">0 mL</div>

                      {/* Liquid inside Burette */}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 bg-blue-500/40 backdrop-blur-sm"
                        animate={{ height: `${Math.max(0, 100 - (volumeAdded / 40) * 100)}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      />
                    </div>

                    {/* Stopcock */}
                    <div className="relative -mt-0.5">
                      <div className="w-2 h-2 bg-slate-400 mx-auto" />
                      <div
                        className={`w-7 h-2 bg-slate-700 rounded-full mx-auto transition-transform duration-300 shadow ${isStirring ? 'rotate-90' : 'rotate-0'}`}
                      />
                      <div className="w-2 h-6 bg-slate-400 mx-auto rounded-b-sm" /> {/* Tip */}
                    </div>

                    {/* Drip Animation */}
                    <AnimatePresence>
                      {isStirring && (
                        <motion.div
                          initial={{ y: 0, opacity: 1, scale: 1 }}
                          animate={{ y: 60, opacity: 0, scale: 0.5 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          className="absolute top-[100%] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-blue-400/80 rounded-full"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Beaker - Centered below burette */}
                <div className="absolute left-[148px] bottom-16 w-36 h-44 bg-white/10 backdrop-blur-sm border-2 border-slate-300/60 border-t-0 rounded-b-2xl overflow-visible shadow-lg">
                  {/* Beaker rim */}
                  <div className="absolute -top-0.5 left-0 right-0 h-1 bg-slate-300/40 rounded-full" />

                  {/* Solution */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 w-full transition-colors duration-1000 rounded-b-2xl"
                    style={{
                      ...solutionStyle,
                      height: `${45 + (volumeAdded * 1.2)}%`
                    }}
                  >
                    {/* Surface reflection */}
                    <div className="absolute top-0 w-full h-1.5 bg-white/30 blur-[1px]" />
                  </motion.div>

                  {/* Magnetic Stirrer Pill */}
                  <motion.div
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 w-6 h-2 bg-white/90 rounded-full shadow-md"
                    animate={isStirring ? { rotate: 360 } : {}}
                    transition={{ duration: 0.25, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Electrode Probe extending into beaker */}
                  <div className="absolute -top-6 right-6 w-3.5 h-52 bg-gradient-to-b from-slate-300 to-slate-200 border border-slate-400/70 rounded-full shadow-xl flex flex-col items-center justify-end overflow-hidden z-30">
                    {/* Glass bulb at bottom */}
                    <div className="w-full h-5 bg-blue-100/80 border-t border-slate-400/50 rounded-b-full shadow-inner" />
                  </div>

                  {/* Label below beaker */}
                  <div className="absolute -bottom-6 left-0 right-0 text-center text-xs font-medium text-muted-foreground">
                    HCl + NaOH
                  </div>
                </div>



              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Titration Curve */}
      <AbsorbanceGraph
        title="Titration Curve"
        subtitle="pH vs Volume of NaOH"
        data={dataPoints.map(d => ({ x: d.volume, y: d.pH }))}
        xLabel="Volume of NaOH (mL)"
        yLabel="pH"
        showPoints
        lineColor="#22c55e"
        xDomain={[0, 40]}
      />

      {/* Data Table */}
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
                    <th className="text-left py-3 px-4 font-semibold">ΔpH/ΔV</th>
                  </tr>
                </thead>
                <tbody>
                  {dataPoints.map((point, index) => {
                    const prevPoint = dataPoints[index - 1];
                    const derivative = prevPoint
                      ? (point.pH - prevPoint.pH) / (point.volume - prevPoint.volume || 1)
                      : 0;
                    return (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border/50 hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4 font-mono">{point.volume.toFixed(1)}</td>
                        <td className="py-3 px-4 font-mono">{point.pH.toFixed(2)}</td>
                        <td className="py-3 px-4 font-mono">{derivative.toFixed(2)}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {dataPoints.some(p => Math.abs(p.volume - equivalenceVolume) < 1) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20"
              >
                <p className="text-green-600 dark:text-green-400 font-medium">
                  ✓ Equivalence point reached at approximately {equivalenceVolume.toFixed(1)} mL NaOH!
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
