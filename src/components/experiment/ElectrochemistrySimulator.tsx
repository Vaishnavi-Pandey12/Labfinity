import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  RotateCcw,
  Zap,
  Battery,
  AlertTriangle
} from "lucide-react";
import AbsorbanceGraph from "./AbsorbanceGraph";

interface DataPoint {
  logRatio: number;
  emf: number;
}

// ----- Metal Electrode Data -----
interface MetalInfo {
  symbol: string;
  name: string;
  E0: number; // Standard reduction potential (V)
  n: number;  // Electrons transferred
  solution: string;
  solutionFormula: string;
  electrodeColors: [string, string, string]; // gradient stops
  liquidColors: [string, string]; // gradient stops for solution
  liquidOpacityBase: [number, number]; // base opacity range
  liquidOpacityFactor: number; // opacity multiplier per concentration
  surfaceColor: string; // ellipse surface color
}

const METALS: Record<string, MetalInfo> = {
  Zn: {
    symbol: "Zn",
    name: "Zinc",
    E0: -0.76,
    n: 2,
    solution: "ZnSO₄",
    solutionFormula: "Zn²⁺",
    electrodeColors: ["#374151", "#4b5563", "#1f2937"],
    liquidColors: ["#f1f5f9", "#e2e8f0"],
    liquidOpacityBase: [0.4, 0.7],
    liquidOpacityFactor: 0.1,
    surfaceColor: "#f8fafc",
  },
  Cu: {
    symbol: "Cu",
    name: "Copper",
    E0: 0.34,
    n: 2,
    solution: "CuSO₄",
    solutionFormula: "Cu²⁺",
    electrodeColors: ["#ea580c", "#f97316", "#c2410c"],
    liquidColors: ["#60a5fa", "#3b82f6"],
    liquidOpacityBase: [0.3, 0.6],
    liquidOpacityFactor: 0.2,
    surfaceColor: "#bfdbfe",
  },
  Ag: {
    symbol: "Ag",
    name: "Silver",
    E0: 0.80,
    n: 1,
    solution: "AgNO₃",
    solutionFormula: "Ag⁺",
    electrodeColors: ["#9ca3af", "#d1d5db", "#6b7280"],
    liquidColors: ["#f3f4f6", "#e5e7eb"],
    liquidOpacityBase: [0.3, 0.5],
    liquidOpacityFactor: 0.15,
    surfaceColor: "#f9fafb",
  },
  Ni: {
    symbol: "Ni",
    name: "Nickel",
    E0: -0.26,
    n: 2,
    solution: "NiSO₄",
    solutionFormula: "Ni²⁺",
    electrodeColors: ["#4a7a5a", "#78a878", "#3d6b4a"],
    liquidColors: ["#bbf7d0", "#86efac"],
    liquidOpacityBase: [0.3, 0.5],
    liquidOpacityFactor: 0.2,
    surfaceColor: "#dcfce7",
  },
};

const METAL_KEYS = Object.keys(METALS);

// Calculate EMF using Nernst equation with dynamic standard potentials
const calculateEMF = (
  anodeMetal: string,
  cathodeMetal: string,
  anodeConc: number,
  cathodeConc: number
): number => {
  const anode = METALS[anodeMetal];
  const cathode = METALS[cathodeMetal];
  const E0cell = cathode.E0 - anode.E0;
  // For simplicity, use n=2 in the Nernst equation
  const n = 2;
  const ratio = anodeConc / cathodeConc;
  const emf = E0cell - (0.0591 / n) * Math.log10(ratio);
  return Math.max(0, Math.min(3.0, emf));
};

const ElectrochemistrySimulator = () => {
  const [anodeMetal, setAnodeMetal] = useState("Zn");
  const [cathodeMetal, setCathodeMetal] = useState("Cu");
  const [anodeConcentration, setAnodeConcentration] = useState(1.0);
  const [cathodeConcentration, setCathodeConcentration] = useState(1.0);
  const [isConnected, setIsConnected] = useState(false);
  const [emf, setEmf] = useState(0);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [electronFlow, setElectronFlow] = useState(false);

  const anode = METALS[anodeMetal];
  const cathode = METALS[cathodeMetal];
  const E0cell = cathode.E0 - anode.E0;

  useEffect(() => {
    if (isConnected) {
      const newEmf = calculateEMF(anodeMetal, cathodeMetal, anodeConcentration, cathodeConcentration);
      setEmf(newEmf);
    }
  }, [anodeConcentration, cathodeConcentration, isConnected, anodeMetal, cathodeMetal]);

  // Reset connection when electrodes change
  useEffect(() => {
    setIsConnected(false);
    setEmf(0);
    setShowResult(false);
    setElectronFlow(false);
    setDataPoints([]);
  }, [anodeMetal, cathodeMetal]);

  const connectCell = useCallback(() => {
    setIsConnected(true);
    setShowResult(true);
    setElectronFlow(true);
  }, []);

  const addDataPoint = useCallback(() => {
    const logRatio = Math.log10(anodeConcentration / cathodeConcentration);
    const currentEmf = calculateEMF(anodeMetal, cathodeMetal, anodeConcentration, cathodeConcentration);
    const newPoint: DataPoint = { logRatio, emf: currentEmf };
    setDataPoints(prev => [...prev, newPoint].sort((a, b) => a.logRatio - b.logRatio));
  }, [anodeConcentration, cathodeConcentration, anodeMetal, cathodeMetal]);

  const resetExperiment = useCallback(() => {
    setIsConnected(false);
    setEmf(0);
    setDataPoints([]);
    setShowResult(false);
    setElectronFlow(false);
    setAnodeConcentration(1.0);
    setCathodeConcentration(1.0);
  }, []);

  const handleAnodeChange = (value: string) => {
    if (value === cathodeMetal) return;
    setAnodeMetal(value);
  };

  const handleCathodeChange = (value: string) => {
    if (value === anodeMetal) return;
    setCathodeMetal(value);
  };

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
            {/* Electrode Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Anode (−)</label>
                <Select value={anodeMetal} onValueChange={handleAnodeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select anode" />
                  </SelectTrigger>
                  <SelectContent>
                    {METAL_KEYS.map((key) => (
                      <SelectItem
                        key={key}
                        value={key}
                        disabled={key === cathodeMetal}
                      >
                        {METALS[key].name} ({METALS[key].symbol}) — E° = {METALS[key].E0.toFixed(2)} V
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cathode (+)</label>
                <Select value={cathodeMetal} onValueChange={handleCathodeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cathode" />
                  </SelectTrigger>
                  <SelectContent>
                    {METAL_KEYS.map((key) => (
                      <SelectItem
                        key={key}
                        value={key}
                        disabled={key === anodeMetal}
                      >
                        {METALS[key].name} ({METALS[key].symbol}) — E° = {METALS[key].E0.toFixed(2)} V
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* E° Cell Info */}
            <div className="bg-muted/50 rounded-lg px-4 py-2 text-center">
              <span className="text-sm text-muted-foreground">E°<sub>cell</sub> = E°<sub>cathode</sub> − E°<sub>anode</sub> = </span>
              <span className="font-mono font-bold text-primary">{E0cell.toFixed(2)} V</span>
            </div>

            {/* Anode Concentration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{anode.solution} Concentration (M)</label>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {anodeConcentration.toFixed(2)} M
                </span>
              </div>
              <Slider
                value={[anodeConcentration]}
                onValueChange={([v]) => setAnodeConcentration(v)}
                min={0.01}
                max={2.0}
                step={0.01}
                className="py-2"
              />
            </div>

            {/* Cathode Concentration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{cathode.solution} Concentration (M)</label>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {cathodeConcentration.toFixed(2)} M
                </span>
              </div>
              <Slider
                value={[cathodeConcentration]}
                onValueChange={([v]) => setCathodeConcentration(v)}
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

          </CardContent>
        </Card>

        {/* Cell Visualization */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <Battery className="w-5 h-5 text-primary" />
              Electrochemical Cell
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

                  {/* Anode Liquid Gradient - Dynamic */}
                  <linearGradient id="anode-liquid" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={anode.liquidColors[0]} stopOpacity={anode.liquidOpacityBase[0] + (anodeConcentration * anode.liquidOpacityFactor)} />
                    <stop offset="100%" stopColor={anode.liquidColors[1]} stopOpacity={anode.liquidOpacityBase[1] + (anodeConcentration * anode.liquidOpacityFactor)} />
                  </linearGradient>

                  {/* Cathode Liquid Gradient - Dynamic */}
                  <linearGradient id="cathode-liquid" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={cathode.liquidColors[0]} stopOpacity={cathode.liquidOpacityBase[0] + (cathodeConcentration * cathode.liquidOpacityFactor)} />
                    <stop offset="100%" stopColor={cathode.liquidColors[1]} stopOpacity={cathode.liquidOpacityBase[1] + (cathodeConcentration * cathode.liquidOpacityFactor)} />
                  </linearGradient>

                  {/* Anode Electrode Gradient - Dynamic */}
                  <linearGradient id="anode-metal" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={anode.electrodeColors[0]} />
                    <stop offset="50%" stopColor={anode.electrodeColors[1]} />
                    <stop offset="100%" stopColor={anode.electrodeColors[2]} />
                  </linearGradient>

                  {/* Cathode Electrode Gradient - Dynamic */}
                  <linearGradient id="cathode-metal" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={cathode.electrodeColors[0]} />
                    <stop offset="50%" stopColor={cathode.electrodeColors[1]} />
                    <stop offset="100%" stopColor={cathode.electrodeColors[2]} />
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

                {/* --- Left Beaker (Anode) --- */}
                <g transform="translate(150, 200)">
                  {/* Beaker Back Outline */}
                  <path d="M 0 -20 L 0 180 Q 75 200 150 180 L 150 -20" fill="none" stroke="#94a3b8" strokeWidth="2" opacity="0.3" />
                  <ellipse cx="75" cy="-20" rx="75" ry="10" fill="none" stroke="#94a3b8" strokeWidth="2" opacity="0.3" />

                  {/* Liquid (Clipped and Nested) */}
                  <g clipPath="url(#beaker-clip)">
                    <rect x="0" y="20" width="150" height="180" fill="url(#anode-liquid)" />
                    <ellipse cx="75" cy="20" rx="75" ry="10" fill={anode.surfaceColor} opacity={0.5 + (anodeConcentration * anode.liquidOpacityFactor)} />
                  </g>

                  {/* Anode Electrode (Immersed) */}
                  <rect x="55" y="-60" width="40" height="200" rx="4" fill="url(#anode-metal)" filter="url(#shadow)" />

                  {/* Beaker Front Outline (Glass effect) */}
                  <path d="M 0 -20 L 0 180 Q 75 200 150 180 L 150 -20" fill="url(#glass-surface)" stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />

                  {/* Label Group */}
                  <g transform="translate(75, 230)">
                    <text textAnchor="middle" className="font-display font-bold text-lg fill-slate-900">{anode.symbol} | {anode.solution}</text>
                    <text y="20" textAnchor="middle" className="font-sans text-sm fill-slate-500">{anodeConcentration.toFixed(2)} M</text>
                    <text y="40" textAnchor="middle" className="font-sans font-bold text-sm fill-red-500">Anode (−)</text>
                  </g>
                </g>

                {/* --- Right Beaker (Cathode) --- */}
                <g transform="translate(500, 200)">
                  {/* Beaker Back Outline */}
                  <path d="M 0 -20 L 0 180 Q 75 200 150 180 L 150 -20" fill="none" stroke="#94a3b8" strokeWidth="2" opacity="0.3" />
                  <ellipse cx="75" cy="-20" rx="75" ry="10" fill="none" stroke="#94a3b8" strokeWidth="2" opacity="0.3" />

                  {/* Liquid (Clipped and Nested) */}
                  <g clipPath="url(#beaker-clip)">
                    <rect x="0" y="20" width="150" height="180" fill="url(#cathode-liquid)" />
                    <ellipse cx="75" cy="20" rx="75" ry="10" fill={cathode.surfaceColor} opacity={0.4 + (cathodeConcentration * cathode.liquidOpacityFactor)} />
                  </g>

                  {/* Cathode Electrode (Immersed) */}
                  <rect x="55" y="-60" width="40" height="200" rx="4" fill="url(#cathode-metal)" filter="url(#shadow)" />

                  {/* Beaker Front Outline */}
                  <path d="M 0 -20 L 0 180 Q 75 200 150 180 L 150 -20" fill="url(#glass-surface)" stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />

                  {/* Label Group */}
                  <g transform="translate(75, 230)">
                    <text textAnchor="middle" className="font-display font-bold text-lg fill-slate-900">{cathode.solution} | {cathode.symbol}</text>
                    <text y="20" textAnchor="middle" className="font-sans text-sm fill-slate-500">{cathodeConcentration.toFixed(2)} M</text>
                    <text y="40" textAnchor="middle" className="font-sans font-bold text-sm fill-blue-600">Cathode (+)</text>
                  </g>
                </g>

                {/* --- Salt Bridge --- */}
                <g transform="translate(265, 120)">
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

                {/* Wires connecting to specific points */}
                <g fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round">
                  {/* Left (Anode) Wire: From Electrode Top to Voltmeter Terminals */}
                  <path id="wire-left" d="M 225 140 C 225 80, 280 60, 350 60" />

                  {/* Right (Cathode) Wire: From Electrode Top to Voltmeter Terminals */}
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

                    {/* Electrons moving from Voltmeter to Cathode (Right) */}
                    <circle r="4" fill="#fbbf24" filter="url(#shadow)">
                      <animateMotion
                        dur="2s"
                        repeatCount="indefinite"
                        keyPoints="1;0"
                        keyTimes="0;1"
                        calcMode="linear"
                      >
                        <mpath href="#wire-right" />
                      </animateMotion>
                    </circle>

                    {/* e⁻ Label and arrow on Anode side (left → right toward voltmeter) */}
                    <text x="260" y="70" className="font-sans font-bold text-lg fill-slate-700">e⁻</text>
                    <path d="M 260 60 Q 280 50 300 60" fill="none" stroke="#334155" strokeWidth="1.5" markerEnd="url(#arrowhead)" />

                    {/* e⁻ Label and arrow on Cathode side (left → right toward electrode) */}
                    <text x="500" y="70" className="font-sans font-bold text-lg fill-slate-700">e⁻</text>
                    <path d="M 500 60 Q 520 50 540 60" fill="none" stroke="#334155" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                  </g>
                )}


                {/* Voltmeter (Moved UP to avoid overlap) */}
                <g transform="translate(350, 20)">
                  <rect x="0" y="0" width="100" height="60" rx="8" fill="white" stroke="#cbd5e1" strokeWidth="2" filter="url(#shadow)" />
                  <text x="50" y="20" textAnchor="middle" className="font-sans text-xs fill-slate-500 uppercase">Voltmeter</text>
                  <text x="50" y="45" textAnchor="middle" className="font-display font-bold text-2xl fill-blue-600">
                    {isConnected ? emf.toFixed(2) + " V" : "0.00 V"}
                  </text>
                  {/* Terminals on Voltmeter */}
                  <circle cx="0" cy="40" r="3" fill="#1e293b" />
                  <circle cx="100" cy="40" r="3" fill="#1e293b" />
                </g>

              </svg>
            </div>

            {/* Cell Representation Notation */}
            <div className="mt-4 bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Cell Representation</p>
              <p className="text-lg font-mono font-bold text-slate-800 text-center">
                {anode.symbol}(s) | {anode.solutionFormula}({anodeConcentration.toFixed(2)}M) || {cathode.solutionFormula}({cathodeConcentration.toFixed(2)}M) | {cathode.symbol}(s)
              </p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                E°<sub>cell</sub> = E°<sub>cathode</sub> − E°<sub>anode</sub> = ({cathode.E0.toFixed(2)}) − ({anode.E0.toFixed(2)}) = <span className="font-bold text-primary">{E0cell.toFixed(2)} V</span>
              </p>
            </div>

            {/* Warning for improper electrode selection */}
            {E0cell <= 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-lg p-4"
              >
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Improper Electrode Selection</p>
                  <p className="text-xs text-amber-700 mt-1">
                    The measured EMF is <strong>0.00 V</strong> because the selected anode ({anode.name}, E° = {anode.E0.toFixed(2)} V) has a
                    higher or equal reduction potential than the cathode ({cathode.name}, E° = {cathode.E0.toFixed(2)} V).
                    For a spontaneous cell, the anode must have a <strong>lower</strong> standard reduction potential than the cathode.
                  </p>
                  <p className="text-xs text-amber-600 mt-2 font-medium">
                    💡 Try swapping the electrodes or selecting a different pair.
                  </p>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* EMF vs log Graph */}
      <AbsorbanceGraph
        title="Nernst Equation Verification"
        subtitle={`EMF vs log([${anode.solutionFormula}]/[${cathode.solutionFormula}])`}
        data={dataPoints.map(d => ({ x: d.logRatio, y: d.emf }))}
        xLabel={`log([${anode.solutionFormula}]/[${cathode.solutionFormula}])`}
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
                    <th className="text-left py-3 px-4 font-semibold">[{anode.solutionFormula}] (M)</th>
                    <th className="text-left py-3 px-4 font-semibold">[{cathode.solutionFormula}] (M)</th>
                    <th className="text-left py-3 px-4 font-semibold">log([{anode.solutionFormula}]/[{cathode.solutionFormula}])</th>
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
                      <td className="py-3 px-4 font-mono">{anodeConcentration.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono">{cathodeConcentration.toFixed(2)}</td>
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
                  ✓ The linear relationship between EMF and log([{anode.solutionFormula}]/[{cathode.solutionFormula}]) verifies the Nernst Equation!
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
