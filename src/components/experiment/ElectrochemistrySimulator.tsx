import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  RotateCcw,
  Zap,
  Battery
} from "lucide-react";
import AbsorbanceGraph from "./AbsorbanceGraph";

interface DataPoint {
  logRatio: number;
  emf: number;
}

// Calculate EMF using Nernst equation
const calculateEMF = (znConc: number, cuConc: number): number => {
  const E0 = 1.10; // Standard EMF for Daniell cell
  const n = 2; // Number of electrons transferred
  const ratio = znConc / cuConc;
  const emf = E0 - (0.0591 / n) * Math.log10(ratio);
  return Math.max(0, Math.min(1.5, emf));
};

const ElectrochemistrySimulator = () => {
  const [znConcentration, setZnConcentration] = useState(1.0);
  const [cuConcentration, setCuConcentration] = useState(1.0);
  const [isConnected, setIsConnected] = useState(false);
  const [emf, setEmf] = useState(0);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [electronFlow, setElectronFlow] = useState(false);

  useEffect(() => {
    if (isConnected) {
      const newEmf = calculateEMF(znConcentration, cuConcentration);
      setEmf(newEmf);
    }
  }, [znConcentration, cuConcentration, isConnected]);

  const connectCell = useCallback(() => {
    setIsConnected(true);
    setShowResult(true);
    setElectronFlow(true);
  }, []);

  const addDataPoint = useCallback(() => {
    const logRatio = Math.log10(znConcentration / cuConcentration);
    const currentEmf = calculateEMF(znConcentration, cuConcentration);
    const newPoint: DataPoint = { logRatio, emf: currentEmf };
    setDataPoints(prev => [...prev, newPoint].sort((a, b) => a.logRatio - b.logRatio));
  }, [znConcentration, cuConcentration]);

  const resetExperiment = useCallback(() => {
    setIsConnected(false);
    setEmf(0);
    setDataPoints([]);
    setShowResult(false);
    setElectronFlow(false);
    setZnConcentration(1.0);
    setCuConcentration(1.0);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Controls Panel */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <Zap className="w-5 h-5 text-primary" />
              Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Zinc Concentration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">ZnSO₄ Concentration (M)</label>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {znConcentration.toFixed(2)} M
                </span>
              </div>
              <Slider
                value={[znConcentration]}
                onValueChange={([v]) => setZnConcentration(v)}
                min={0.01}
                max={2.0}
                step={0.01}
                className="py-2"
              />
            </div>

            {/* Copper Concentration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">CuSO₄ Concentration (M)</label>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {cuConcentration.toFixed(2)} M
                </span>
              </div>
              <Slider
                value={[cuConcentration]}
                onValueChange={([v]) => setCuConcentration(v)}
                min={0.01}
                max={2.0}
                step={0.01}
                className="py-2"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={connectCell}
                className="flex-1 gap-2 lab-gradient-bg text-primary-foreground"
                disabled={isConnected}
              >
                <Battery className="w-4 h-4" />
                {isConnected ? "Connected" : "Connect Cell"}
              </Button>
              <Button
                onClick={addDataPoint}
                variant="outline"
                className="flex-1 gap-2"
                disabled={!isConnected}
              >
                <Play className="w-4 h-4" />
                Record Reading
              </Button>
            </div>

            <Button variant="outline" size="sm" onClick={resetExperiment} className="w-full gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset Experiment
            </Button>

            {/* Result Display */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-primary/10 rounded-xl p-4"
                >
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Measured EMF</p>
                    <p className="text-3xl font-display font-bold text-primary">
                      {emf.toFixed(3)} V
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Theoretical E° = 1.10 V
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* SVG Based Visualization for Perfect Alignment */}
        {/* Cell Visualization */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <Battery className="w-5 h-5 text-primary" />
              Daniell Cell
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full aspect-[16/10] bg-white rounded-xl overflow-hidden border border-slate-200">
              <svg
                viewBox="0 0 800 500"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Glass Gradients */}
                  <linearGradient id="glass-surface" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.1" />
                    <stop offset="20%" stopColor="white" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="white" stopOpacity="0.1" />
                    <stop offset="80%" stopColor="white" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="white" stopOpacity="0.1" />
                  </linearGradient>

                  {/* Liquid Gradients - Dynamic Opacity */}
                  <linearGradient id="zn-liquid" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f1f5f9" stopOpacity={0.4 + (znConcentration * 0.1)} />
                    <stop offset="100%" stopColor="#e2e8f0" stopOpacity={0.7 + (znConcentration * 0.1)} />
                  </linearGradient>

                  <linearGradient id="cu-liquid" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.3 + (cuConcentration * 0.2)} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6 + (cuConcentration * 0.2)} />
                  </linearGradient>

                  {/* Electrode Gradients */}
                  <linearGradient id="zn-metal" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#374151" />
                    <stop offset="50%" stopColor="#4b5563" />
                    <stop offset="100%" stopColor="#1f2937" />
                  </linearGradient>

                  <linearGradient id="cu-metal" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ea580c" />
                    <stop offset="50%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#c2410c" />
                  </linearGradient>

                  {/* Salt Bridge Gradient */}
                  <linearGradient id="salt-bridge-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fef3c7" />
                    <stop offset="100%" stopColor="#fde68a" />
                  </linearGradient>

                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                    <feOffset dx="1" dy="2" result="offsetblur" />
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.3" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
                  </marker>

                  <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                  </marker>

                  <marker id="arrowhead-yellow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#facc15" />
                  </marker>

                  {/* Beaker Clip Path for Liquid Containment */}
                  <clipPath id="beaker-clip">
                    <path d="M 0 20 L 0 180 Q 75 200 150 180 L 150 20" />
                  </clipPath>
                </defs>

                {/* --- Main Cell Structure --- */}

                {/* --- Left Beaker (Zinc) --- */}
                <g transform="translate(150, 200)">
                  {/* Beaker Back Outline */}
                  <path d="M 0 -20 L 0 180 Q 75 200 150 180 L 150 -20" fill="none" stroke="#94a3b8" strokeWidth="2" opacity="0.3" />
                  <ellipse cx="75" cy="-20" rx="75" ry="10" fill="none" stroke="#94a3b8" strokeWidth="2" opacity="0.3" />

                  {/* Liquid (Clipped and Nested) */}
                  <g clipPath="url(#beaker-clip)">
                    <rect x="0" y="20" width="150" height="180" fill="url(#zn-liquid)" />
                    <ellipse cx="75" cy="20" rx="75" ry="10" fill="#f8fafc" opacity={0.5 + (znConcentration * 0.1)} />
                  </g>

                  {/* Zinc Electrode (Immersed) */}
                  <rect x="55" y="-60" width="40" height="200" rx="4" fill="url(#zn-metal)" filter="url(#shadow)" />

                  {/* Beaker Front Outline (Glass effect) */}
                  <path d="M 0 -20 L 0 180 Q 75 200 150 180 L 150 -20" fill="url(#glass-surface)" stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />

                  {/* Label Group */}
                  <g transform="translate(75, 230)">
                    <text textAnchor="middle" className="font-display font-bold text-lg fill-slate-900">Zn | ZnSO₄</text>
                    <text y="20" textAnchor="middle" className="font-sans text-sm fill-slate-500">{znConcentration.toFixed(2)} M</text>
                    <text y="40" textAnchor="middle" className="font-sans font-bold text-sm fill-red-500">Anode (-)</text>
                  </g>
                </g>

                {/* --- Right Beaker (Copper) --- */}
                <g transform="translate(500, 200)">
                  {/* Beaker Back Outline */}
                  <path d="M 0 -20 L 0 180 Q 75 200 150 180 L 150 -20" fill="none" stroke="#94a3b8" strokeWidth="2" opacity="0.3" />
                  <ellipse cx="75" cy="-20" rx="75" ry="10" fill="none" stroke="#94a3b8" strokeWidth="2" opacity="0.3" />

                  {/* Liquid (Clipped and Nested) */}
                  <g clipPath="url(#beaker-clip)">
                    <rect x="0" y="20" width="150" height="180" fill="url(#cu-liquid)" />
                    <ellipse cx="75" cy="20" rx="75" ry="10" fill="#bfdbfe" opacity={0.4 + (cuConcentration * 0.2)} />
                  </g>

                  {/* Copper Electrode (Immersed) */}
                  <rect x="55" y="-60" width="40" height="200" rx="4" fill="url(#cu-metal)" filter="url(#shadow)" />

                  {/* Beaker Front Outline */}
                  <path d="M 0 -20 L 0 180 Q 75 200 150 180 L 150 -20" fill="url(#glass-surface)" stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />

                  {/* Label Group */}
                  <g transform="translate(75, 230)">
                    <text textAnchor="middle" className="font-display font-bold text-lg fill-slate-900">CuSO₄ | Cu</text>
                    <text y="20" textAnchor="middle" className="font-sans text-sm fill-slate-500">{cuConcentration.toFixed(2)} M</text>
                    <text y="40" textAnchor="middle" className="font-sans font-bold text-sm fill-blue-600">Cathode (+)</text>
                  </g>
                </g>

                {/* --- Salt Bridge --- */}
                <g transform="translate(265, 120)"> {/* Adjusted height */}
                  {/* Bridge Body - Deep Legs */}
                  <path d="M 0 120 L 0 20 Q 0 0 20 0 L 250 0 Q 270 0 270 20 L 270 120"
                    fill="none" stroke="#fde68a" strokeWidth="40" strokeLinecap="round" />
                  <path d="M 0 120 L 0 20 Q 0 0 20 0 L 250 0 Q 270 0 270 20 L 270 120"
                    fill="none" stroke="#fef3c7" strokeWidth="30" strokeLinecap="round" opacity="0.6" />

                  {/* Outline */}
                  <path d="M -20 120 L -20 20 Q -20 -20 20 -20 L 250 -20 Q 290 -20 290 20 L 290 120"
                    fill="none" stroke="#d4d4d8" strokeWidth="1" />
                  <path d="M 20 120 L 20 20 Q 20 20 20 20 L 250 20 Q 250 20 250 20 L 250 120"
                    fill="none" stroke="#d4d4d8" strokeWidth="1" />

                  {/* Label */}
                  <text x="135" y="10" textAnchor="middle" className="font-sans text-sm fill-slate-700 font-medium">Salt Bridge</text>

                  {/* Ion Flow */}
                  <g transform="translate(135, 100)">
                    <line x1="-20" y1="0" x2="-80" y2="0" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <text x="-50" y="-10" textAnchor="middle" className="font-sans font-bold text-xs fill-slate-600">SO₄²⁻</text>
                    <line x1="20" y1="0" x2="80" y2="0" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <text x="50" y="-10" textAnchor="middle" className="font-sans font-bold text-xs fill-slate-600">K⁺/Na⁺</text>
                  </g>
                </g>

                {/* --- Wires & Voltmeter --- */}

                {/* --- Connection Points & Wires --- */}

                {/* Wires connecting to specific points */}
                {/* Wires connecting to specific points */}
                <g fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round">
                  {/* Left (Zn) Wire: From Electrode Top to Voltmeter Terminals (y=60) */}
                  <path id="wire-left" d="M 225 140 C 225 80, 280 60, 350 60" />

                  {/* Right (Cu) Wire: From Electrode Top to Voltmeter Terminals (y=60) */}
                  <path id="wire-right" d="M 575 140 C 575 80, 520 60, 450 60" />
                </g>

                {/* Electrode Connection Terminals */}
                <circle cx="225" cy="140" r="4" fill="#1f2937" />
                <circle cx="575" cy="140" r="4" fill="#1f2937" />

                {/* --- Electron Flow Animation --- */}
                {isConnected && electronFlow && (
                  <g>
                    {/* Electrons moving from Anode (Left) to Voltmeter */}
                    <circle r="4" fill="#fbbf24" filter="url(#shadow)">
                      <animateMotion
                        dur="2s"
                        repeatCount="indefinite"
                        keyPoints="0;1"
                        keyTimes="0;1"
                        calcMode="linear"
                      >
                        <mpath href="#wire-left" />
                      </animateMotion>
                    </circle>

                    {/* Electrons moving from Voltmeter to Cathode (Right) - Explicit Path Direction Fix */}
                    <circle r="4" fill="#fbbf24" filter="url(#shadow)">
                      <animateMotion
                        dur="2s"
                        repeatCount="indefinite"
                        keyPoints="1;0"
                        keyTimes="0;1"
                        calcMode="linear"
                        rotate="auto"
                      >
                        <mpath href="#wire-right" />
                      </animateMotion>
                    </circle>

                    {/* e- Labels */}
                    <text x="260" y="70" className="font-sans font-bold text-lg fill-slate-700">e⁻</text>
                    <path d="M 260 60 Q 280 50 300 60" fill="none" stroke="#334155" strokeWidth="1.5" markerEnd="url(#arrowhead)" />

                    <text x="520" y="70" className="font-sans font-bold text-lg fill-slate-700">e⁻</text>
                    {/* Fixed Arrow Direction: Pointing towards the Electrode (Down/Right) */}
                    <path d="M 520 60 Q 540 70 560 60" fill="none" stroke="#334155" strokeWidth="1.5" markerStart="url(#arrowhead)" transform="rotate(180 540 60)" />
                  </g>
                )}


                {/* Voltmeter (Moved UP to avoid overlap) */}
                <g transform="translate(350, 20)">
                  <rect x="0" y="0" width="100" height="60" rx="8" fill="white" stroke="#cbd5e1" strokeWidth="2" filter="url(#shadow)" />
                  <text x="50" y="20" textAnchor="middle" className="font-sans text-xs fill-slate-500 uppercase">Voltmeter</text>
                  <text x="50" y="45" textAnchor="middle" className="font-display font-bold text-2xl fill-blue-600">
                    {isConnected ? emf.toFixed(2) + " V" : "1.10 V"}
                  </text>
                  {/* Terminals on Voltmeter */}
                  <circle cx="0" cy="40" r="3" fill="#1e293b" />
                  <circle cx="100" cy="40" r="3" fill="#1e293b" />
                </g>

              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* EMF vs log([Zn2+]/[Cu2+]) Graph */}
      <AbsorbanceGraph
        title="Nernst Equation Verification"
        subtitle="EMF vs log([Zn²⁺]/[Cu²⁺])"
        data={dataPoints.map(d => ({ x: d.logRatio, y: d.emf }))}
        xLabel="log([Zn²⁺]/[Cu²⁺])"
        yLabel="EMF (V)"
        showPoints
        showTrendline={dataPoints.length >= 2}
        lineColor="#f59e0b"
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
                    <th className="text-left py-3 px-4 font-semibold">[Zn²⁺] (M)</th>
                    <th className="text-left py-3 px-4 font-semibold">[Cu²⁺] (M)</th>
                    <th className="text-left py-3 px-4 font-semibold">log([Zn²⁺]/[Cu²⁺])</th>
                    <th className="text-left py-3 px-4 font-semibold">EMF (V)</th>
                  </tr>
                </thead>
                <tbody>
                  {dataPoints.map((point, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-border/50 hover:bg-muted/50"
                    >
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4 font-mono">{znConcentration.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono">{cuConcentration.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono">{point.logRatio.toFixed(3)}</td>
                      <td className="py-3 px-4 font-mono">{point.emf.toFixed(3)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {dataPoints.length >= 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20"
              >
                <p className="text-green-600 dark:text-green-400 font-medium">
                  ✓ The linear relationship between EMF and log([Zn²⁺]/[Cu²⁺]) verifies the Nernst Equation!
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ElectrochemistrySimulator;
