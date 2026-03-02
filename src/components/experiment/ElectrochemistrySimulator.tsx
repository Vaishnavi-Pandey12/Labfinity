import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
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
  AlertTriangle,
  FlaskConical,
  HelpCircle,
  Loader2,
  Download,
} from "lucide-react";

// ----- Metal Electrode Data -----
interface MetalInfo {
  symbol: string;
  name: string;
  E0: number;
  n: number;
  solution: string;
  solutionFormula: string;
  electrodeColors: [string, string, string];
  liquidColors: [string, string];
  liquidOpacityBase: [number, number];
  liquidOpacityFactor: number;
  surfaceColor: string;
}

const METALS: Record<string, MetalInfo> = {
  Zn: {
    symbol: "Zn", name: "Zinc", E0: -0.76, n: 2,
    solution: "ZnSO₄", solutionFormula: "Zn²⁺",
    electrodeColors: ["#374151", "#4b5563", "#1f2937"],
    liquidColors: ["#f1f5f9", "#e2e8f0"],
    liquidOpacityBase: [0.4, 0.7], liquidOpacityFactor: 0.1, surfaceColor: "#f8fafc",
  },
  Cu: {
    symbol: "Cu", name: "Copper", E0: 0.34, n: 2,
    solution: "CuSO₄", solutionFormula: "Cu²⁺",
    electrodeColors: ["#ea580c", "#f97316", "#c2410c"],
    liquidColors: ["#60a5fa", "#3b82f6"],
    liquidOpacityBase: [0.3, 0.6], liquidOpacityFactor: 0.2, surfaceColor: "#bfdbfe",
  },
  Ag: {
    symbol: "Ag", name: "Silver", E0: 0.80, n: 1,
    solution: "AgNO₃", solutionFormula: "Ag⁺",
    electrodeColors: ["#9ca3af", "#d1d5db", "#6b7280"],
    liquidColors: ["#f3f4f6", "#e5e7eb"],
    liquidOpacityBase: [0.3, 0.5], liquidOpacityFactor: 0.15, surfaceColor: "#f9fafb",
  },
  Ni: {
    symbol: "Ni", name: "Nickel", E0: -0.26, n: 2,
    solution: "NiSO₄", solutionFormula: "Ni²⁺",
    electrodeColors: ["#4a7a5a", "#78a878", "#3d6b4a"],
    liquidColors: ["#bbf7d0", "#86efac"],
    liquidOpacityBase: [0.3, 0.5], liquidOpacityFactor: 0.2, surfaceColor: "#dcfce7",
  },
};

const METAL_KEYS = Object.keys(METALS);
const CATHODE_CONCENTRATIONS = [0.01, 0.05, 0.10, 0.50, 1.00];
const API_BASE = "http://localhost:8000";

const calculateEMF = (anodeMetal: string, cathodeMetal: string, anodeConc: number, cathodeConc: number): number => {
  const anode = METALS[anodeMetal];
  const cathode = METALS[cathodeMetal];
  const E0cell = cathode.E0 - anode.E0;
  const n = 2;
  const ratio = anodeConc / cathodeConc;
  const emf = E0cell - (0.0591 / n) * Math.log10(ratio);
  return Math.max(0, Math.min(3.0, emf));
};

interface TableRow {
  sNo: number;
  anodeConc: number;
  cathodeConc: number;
  logRatio: number;
  emfCalculated: number;  // from backend
  emfObserved: string;    // user types this
}

const ElectrochemistrySimulator = () => {
  const [anodeMetal, setAnodeMetal] = useState("Zn");
  const [cathodeMetal, setCathodeMetal] = useState("Cu");
  const [anodeConcentration, setAnodeConcentration] = useState(1.0);
  const [anodeInputStr, setAnodeInputStr] = useState("1.00");
  const [cathodeConcentration, setCathodeConcentration] = useState(1.0);
  const [isConnected, setIsConnected] = useState(false);
  const [emf, setEmf] = useState(0);
  const [electronFlow, setElectronFlow] = useState(false);

  // Table state
  const [tableRows, setTableRows] = useState<TableRow[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState("");

  // Unknown row state
  const [unknownConcInput, setUnknownConcInput] = useState("");
  const [unknownConcApplied, setUnknownConcApplied] = useState<number | null>(null);
  const [unknownEmfFromBackend, setUnknownEmfFromBackend] = useState<number | null>(null);
  const [unknownEmfLoading, setUnknownEmfLoading] = useState(false);
  const [unknownEmfObserved, setUnknownEmfObserved] = useState("");
  const [unknownEmfVerified, setUnknownEmfVerified] = useState<boolean | null>(null);

  const anode = METALS[anodeMetal];
  const cathode = METALS[cathodeMetal];
  const E0cell = cathode.E0 - anode.E0;

  // Sync anode concentration slider → input box
  const handleAnodeSlider = (v: number) => {
    setAnodeConcentration(v);
    setAnodeInputStr(v.toFixed(2));
  };

  // Sync manual input → slider
  const handleAnodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnodeInputStr(e.target.value);
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed) && parsed >= 0.01 && parsed <= 2.0) {
      setAnodeConcentration(parsed);
    }
  };

  // Fetch table from backend when connected
  const fetchTable = useCallback(async (anodeMet: string, cathodeMet: string, anodeConc: number) => {
    setTableLoading(true);
    setTableError("");
    try {
      const resp = await fetch(`${API_BASE}/api/electrochemistry-table`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anode_metal: anodeMet,
          cathode_metal: cathodeMet,
          anode_concentration: anodeConc,
          cathode_concentrations: CATHODE_CONCENTRATIONS,
          unknown_concentration: null,
          n: 2,
        }),
      });
      if (!resp.ok) throw new Error("API error");
      const data = await resp.json();
      const rows: TableRow[] = (data.table as any[]).map((r: any, i: number) => ({
        sNo: i + 1,
        anodeConc: anodeConc,
        cathodeConc: r["Cathode Concentration (M)"],
        logRatio: r["log([Anode]/[Cathode])"],
        emfCalculated: r["EMF (V)"],
        emfObserved: "",
      }));
      setTableRows(rows);
    } catch {
      setTableError("Could not connect to the backend. Is the Python server running?");
      // Fallback: generate table locally
      const rows: TableRow[] = CATHODE_CONCENTRATIONS.map((cc, i) => {
        const logRatio = Math.log10(anodeConc / cc);
        const emfCalc = Math.max(0, (METALS[cathodeMet].E0 - METALS[anodeMet].E0) - (0.0591 / 2) * logRatio);
        return {
          sNo: i + 1,
          anodeConc,
          cathodeConc: cc,
          logRatio: parseFloat(logRatio.toFixed(4)),
          emfCalculated: parseFloat(emfCalc.toFixed(4)),
          emfObserved: "",
        };
      });
      setTableRows(rows);
    } finally {
      setTableLoading(false);
    }
  }, []);

  // Live EMF in voltmeter
  useEffect(() => {
    if (isConnected) {
      setEmf(calculateEMF(anodeMetal, cathodeMetal, anodeConcentration, cathodeConcentration));
    }
  }, [anodeConcentration, cathodeConcentration, isConnected, anodeMetal, cathodeMetal]);

  // Reset when electrodes change
  useEffect(() => {
    setIsConnected(false);
    setEmf(0);
    setElectronFlow(false);
    setTableRows([]);
    setUnknownConcInput("");
    setUnknownConcApplied(null);
    setUnknownEmfFromBackend(null);
    setUnknownEmfObserved("");
    setUnknownEmfVerified(null);
  }, [anodeMetal, cathodeMetal]);

  const connectCell = useCallback(() => {
    setIsConnected(true);
    setElectronFlow(true);
    fetchTable(anodeMetal, cathodeMetal, anodeConcentration);
  }, [anodeMetal, cathodeMetal, anodeConcentration, fetchTable]);

  const resetExperiment = useCallback(() => {
    setIsConnected(false);
    setEmf(0);
    setElectronFlow(false);
    setAnodeConcentration(1.0);
    setAnodeInputStr("1.00");
    setCathodeConcentration(1.0);
    setTableRows([]);
    setUnknownConcInput("");
    setUnknownConcApplied(null);
    setUnknownEmfFromBackend(null);
    setUnknownEmfObserved("");
    setUnknownEmfVerified(null);
  }, []);

  const handleAnodeChange = (value: string) => { if (value !== cathodeMetal) setAnodeMetal(value); };
  const handleCathodeChange = (value: string) => { if (value !== anodeMetal) setCathodeMetal(value); };

  const handleEmfObservedChange = (index: number, value: string) => {
    setTableRows(prev => prev.map((row, i) => i === index ? { ...row, emfObserved: value } : row));
  };

  // Fetch EMF for the unknown concentration from backend
  const applyUnknownConcentration = useCallback(async () => {
    const parsed = parseFloat(unknownConcInput);
    if (isNaN(parsed) || parsed <= 0) return;
    setUnknownConcApplied(parsed);
    setUnknownEmfFromBackend(null);
    setUnknownEmfObserved("");
    setUnknownEmfVerified(null);
    setUnknownEmfLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/electrochemistry-table`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anode_metal: anodeMetal,
          cathode_metal: cathodeMetal,
          anode_concentration: anodeConcentration,
          cathode_concentrations: CATHODE_CONCENTRATIONS,
          unknown_concentration: parsed,
          n: 2,
        }),
      });
      const data = await resp.json();
      setUnknownEmfFromBackend(data.unknown_emf);
    } catch {
      // fallback calculation
      const logRatio = Math.log10(anodeConcentration / parsed);
      const emf = Math.max(0, E0cell - (0.0591 / 2) * logRatio);
      setUnknownEmfFromBackend(parseFloat(emf.toFixed(4)));
    } finally {
      setUnknownEmfLoading(false);
    }
  }, [unknownConcInput, anodeMetal, cathodeMetal, anodeConcentration, E0cell]);

  const verifyUnknownEmf = () => {
    if (!unknownEmfFromBackend || !unknownEmfObserved) return;
    const entered = parseFloat(unknownEmfObserved);
    // Allow ±0.05 V tolerance
    setUnknownEmfVerified(Math.abs(entered - unknownEmfFromBackend) <= 0.05);
  };

  const downloadTableCSV = () => {
    if (tableRows.length === 0) return;

    // Headers
    const headers = [
      "S.No",
      "Anode Conc (M)",
      "Cathode Conc (M)",
      "logRatio",
      "Calculated EMF (V)",
      "Observed EMF (V)"
    ];

    // Rows
    const csvRows = tableRows.map(row => [
      row.sNo,
      row.anodeConc.toFixed(2),
      row.cathodeConc.toFixed(2),
      row.logRatio.toFixed(4),
      row.emfCalculated.toFixed(4),
      row.emfObserved || ""
    ]);

    // Add unknown row if applied
    if (unknownConcApplied) {
      csvRows.push([
        tableRows.length + 1,
        anodeConcentration.toFixed(2),
        unknownConcApplied.toFixed(2),
        Math.log10(anodeConcentration / unknownConcApplied).toFixed(4),
        unknownEmfFromBackend !== null ? unknownEmfFromBackend.toFixed(4) : "",
        unknownEmfObserved || ""
      ]);
    }

    const csvContent = [
      headers.join(","),
      ...csvRows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `electrochemistry_observations.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                  <SelectTrigger><SelectValue placeholder="Select anode" /></SelectTrigger>
                  <SelectContent>
                    {METAL_KEYS.map(key => (
                      <SelectItem key={key} value={key} disabled={key === cathodeMetal}>
                        {METALS[key].name} ({METALS[key].symbol}) — E° = {METALS[key].E0.toFixed(2)} V
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cathode (+)</label>
                <Select value={cathodeMetal} onValueChange={handleCathodeChange}>
                  <SelectTrigger><SelectValue placeholder="Select cathode" /></SelectTrigger>
                  <SelectContent>
                    {METAL_KEYS.map(key => (
                      <SelectItem key={key} value={key} disabled={key === anodeMetal}>
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

            {/* Anode Concentration — Slider + Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{anode.solution} Concentration (M)</label>
                <Input
                  type="number"
                  min={0.01}
                  max={2.0}
                  step={0.01}
                  value={anodeInputStr}
                  onChange={handleAnodeInputChange}
                  className="w-24 text-center font-mono h-8 text-sm"
                />
              </div>
              <Slider
                value={[anodeConcentration]}
                onValueChange={([v]) => handleAnodeSlider(v)}
                min={0.01}
                max={2.0}
                step={0.01}
                className="py-2"
              />
            </div>

            {/* Cathode Concentration — Slider + Input (for voltmeter preview) */}
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
            <div className="flex gap-3 pt-2">
              <Button
                onClick={connectCell}
                className="flex-1 gap-2 lab-gradient-bg text-primary-foreground"
                disabled={isConnected || E0cell <= 0}
              >
                <Battery className="w-4 h-4" />
                {isConnected ? "Connected ✓" : "Connect Cell"}
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
              <svg viewBox="0 0 800 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="glass-surface" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.1" />
                    <stop offset="20%" stopColor="white" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="white" stopOpacity="0.1" />
                    <stop offset="80%" stopColor="white" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="white" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient id="anode-liquid" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={anode.liquidColors[0]} stopOpacity={anode.liquidOpacityBase[0] + anodeConcentration * anode.liquidOpacityFactor} />
                    <stop offset="100%" stopColor={anode.liquidColors[1]} stopOpacity={anode.liquidOpacityBase[1] + anodeConcentration * anode.liquidOpacityFactor} />
                  </linearGradient>
                  <linearGradient id="cathode-liquid" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={cathode.liquidColors[0]} stopOpacity={cathode.liquidOpacityBase[0] + cathodeConcentration * cathode.liquidOpacityFactor} />
                    <stop offset="100%" stopColor={cathode.liquidColors[1]} stopOpacity={cathode.liquidOpacityBase[1] + cathodeConcentration * cathode.liquidOpacityFactor} />
                  </linearGradient>
                  <linearGradient id="anode-metal" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={anode.electrodeColors[0]} />
                    <stop offset="50%" stopColor={anode.electrodeColors[1]} />
                    <stop offset="100%" stopColor={anode.electrodeColors[2]} />
                  </linearGradient>
                  <linearGradient id="cathode-metal" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={cathode.electrodeColors[0]} />
                    <stop offset="50%" stopColor={cathode.electrodeColors[1]} />
                    <stop offset="100%" stopColor={cathode.electrodeColors[2]} />
                  </linearGradient>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                    <feOffset dx="1" dy="2" result="offsetblur" />
                    <feComponentTransfer><feFuncA type="linear" slope="0.3" /></feComponentTransfer>
                    <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
                  </marker>
                  <clipPath id="beaker-clip">
                    <path d="M 0 20 L 0 180 Q 75 200 150 180 L 150 20" />
                  </clipPath>
                </defs>

                {/* Left Beaker (Anode) */}
                <g transform="translate(150, 200)">
                  <path d="M 0 -20 L 0 180 Q 75 200 150 180 L 150 -20" fill="none" stroke="#94a3b8" strokeWidth="2" opacity="0.3" />
                  <ellipse cx="75" cy="-20" rx="75" ry="10" fill="none" stroke="#94a3b8" strokeWidth="2" opacity="0.3" />
                  <g clipPath="url(#beaker-clip)">
                    <rect x="0" y="20" width="150" height="180" fill="url(#anode-liquid)" />
                    <ellipse cx="75" cy="20" rx="75" ry="10" fill={anode.surfaceColor} opacity={0.5 + anodeConcentration * anode.liquidOpacityFactor} />
                  </g>
                  <rect x="55" y="-60" width="40" height="200" rx="4" fill="url(#anode-metal)" filter="url(#shadow)" />
                  <path d="M 0 -20 L 0 180 Q 75 200 150 180 L 150 -20" fill="url(#glass-surface)" stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />
                  <g transform="translate(75, 230)">
                    <text textAnchor="middle" className="font-display font-bold text-lg fill-slate-900">{anode.symbol} | {anode.solution}</text>
                    <text y="20" textAnchor="middle" className="font-sans text-sm fill-slate-500">{anodeConcentration.toFixed(2)} M</text>
                    <text y="40" textAnchor="middle" className="font-sans font-bold text-sm fill-red-500">Anode (−)</text>
                  </g>
                </g>

                {/* Right Beaker (Cathode) */}
                <g transform="translate(500, 200)">
                  <path d="M 0 -20 L 0 180 Q 75 200 150 180 L 150 -20" fill="none" stroke="#94a3b8" strokeWidth="2" opacity="0.3" />
                  <ellipse cx="75" cy="-20" rx="75" ry="10" fill="none" stroke="#94a3b8" strokeWidth="2" opacity="0.3" />
                  <g clipPath="url(#beaker-clip)">
                    <rect x="0" y="20" width="150" height="180" fill="url(#cathode-liquid)" />
                    <ellipse cx="75" cy="20" rx="75" ry="10" fill={cathode.surfaceColor} opacity={0.4 + cathodeConcentration * cathode.liquidOpacityFactor} />
                  </g>
                  <rect x="55" y="-60" width="40" height="200" rx="4" fill="url(#cathode-metal)" filter="url(#shadow)" />
                  <path d="M 0 -20 L 0 180 Q 75 200 150 180 L 150 -20" fill="url(#glass-surface)" stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />
                  <g transform="translate(75, 230)">
                    <text textAnchor="middle" className="font-display font-bold text-lg fill-slate-900">{cathode.solution} | {cathode.symbol}</text>
                    <text y="20" textAnchor="middle" className="font-sans text-sm fill-slate-500">{cathodeConcentration.toFixed(2)} M</text>
                    <text y="40" textAnchor="middle" className="font-sans font-bold text-sm fill-blue-600">Cathode (+)</text>
                  </g>
                </g>

                {/* Salt Bridge */}
                <g transform="translate(265, 120)">
                  <path d="M 0 120 L 0 20 Q 0 0 20 0 L 250 0 Q 270 0 270 20 L 270 120" fill="none" stroke="#fde68a" strokeWidth="40" strokeLinecap="round" />
                  <path d="M 0 120 L 0 20 Q 0 0 20 0 L 250 0 Q 270 0 270 20 L 270 120" fill="none" stroke="#fef3c7" strokeWidth="30" strokeLinecap="round" opacity="0.6" />
                  <path d="M -20 120 L -20 20 Q -20 -20 20 -20 L 250 -20 Q 290 -20 290 20 L 290 120" fill="none" stroke="#d4d4d8" strokeWidth="1" />
                  <text x="135" y="10" textAnchor="middle" className="font-sans text-sm fill-slate-700 font-medium">Salt Bridge</text>
                  <g transform="translate(135, 100)">
                    <line x1="-20" y1="0" x2="-80" y2="0" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <text x="-50" y="-10" textAnchor="middle" className="font-sans font-bold text-xs fill-slate-600">SO₄²⁻</text>
                    <line x1="20" y1="0" x2="80" y2="0" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <text x="50" y="-10" textAnchor="middle" className="font-sans font-bold text-xs fill-slate-600">K⁺/Na⁺</text>
                  </g>
                </g>

                {/* Wires */}
                <g fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round">
                  <path id="wire-left" d="M 225 140 C 225 80, 280 60, 350 60" />
                  <path id="wire-right" d="M 575 140 C 575 80, 520 60, 450 60" />
                </g>
                <circle cx="225" cy="140" r="4" fill="#1f2937" />
                <circle cx="575" cy="140" r="4" fill="#1f2937" />

                {/* Electron Flow */}
                {isConnected && electronFlow && (
                  <g>
                    <circle r="4" fill="#fbbf24" filter="url(#shadow)">
                      <animateMotion dur="2s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
                        <mpath href="#wire-left" />
                      </animateMotion>
                    </circle>
                    <circle r="4" fill="#fbbf24" filter="url(#shadow)">
                      <animateMotion dur="2s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
                        <mpath href="#wire-right" />
                      </animateMotion>
                    </circle>
                    <text x="260" y="70" className="font-sans font-bold text-lg fill-slate-700">e⁻</text>
                    <path d="M 260 60 Q 280 50 300 60" fill="none" stroke="#334155" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                    <text x="500" y="70" className="font-sans font-bold text-lg fill-slate-700">e⁻</text>
                    <path d="M 500 60 Q 520 50 540 60" fill="none" stroke="#334155" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                  </g>
                )}

                {/* Voltmeter */}
                <g transform="translate(350, 20)">
                  <rect x="0" y="0" width="100" height="60" rx="8" fill="white" stroke="#cbd5e1" strokeWidth="2" filter="url(#shadow)" />
                  <text x="50" y="20" textAnchor="middle" className="font-sans text-xs fill-slate-500 uppercase">Voltmeter</text>
                  <text x="50" y="45" textAnchor="middle" className="font-display font-bold text-2xl fill-blue-600">
                    {isConnected ? emf.toFixed(2) + " V" : "0.00 V"}
                  </text>
                  <circle cx="0" cy="40" r="3" fill="#1e293b" />
                  <circle cx="100" cy="40" r="3" fill="#1e293b" />
                </g>
              </svg>
            </div>

            {/* Cell Notation */}
            <div className="mt-4 bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Cell Representation</p>
              <p className="text-lg font-mono font-bold text-slate-800 text-center">
                {anode.symbol}(s) | {anode.solutionFormula}({anodeConcentration.toFixed(2)}M) || {cathode.solutionFormula}({cathodeConcentration.toFixed(2)}M) | {cathode.symbol}(s)
              </p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                E°<sub>cell</sub> = ({cathode.E0.toFixed(2)}) − ({anode.E0.toFixed(2)}) = <span className="font-bold text-primary">{E0cell.toFixed(2)} V</span>
              </p>
            </div>

            {/* Warning for bad electrode selection */}
            {E0cell <= 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-lg p-4">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Improper Electrode Selection</p>
                  <p className="text-xs text-amber-700 mt-1">
                    For a spontaneous cell, the anode must have a <strong>lower</strong> standard reduction potential than the cathode.
                    Try swapping or selecting a different pair.
                  </p>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Observation Table ── */}
      {isConnected && (
        <Card className="glass-card border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 font-display">
                <FlaskConical className="w-5 h-5 text-primary" />
                Observation Table
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTableCSV}
                className="gap-2"
                disabled={tableRows.length === 0}
              >
                <Download className="w-4 h-4" />
                Download CSV
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {anode.name} ({anode.symbol}) anode at <strong>{anodeConcentration.toFixed(2)} M</strong> — varying {cathode.name} ({cathode.symbol}) cathode concentration.
              <br />Enter your <strong>observed EMF</strong> values from the voltmeter for each row.
            </p>
          </CardHeader>
          <CardContent>
            {tableLoading ? (
              <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading table from server…
              </div>
            ) : (
              <>
                {tableError && (
                  <div className="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                    ⚠ {tableError} — using local calculation as fallback.
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-primary/30 bg-muted/50">
                        <th className="text-center py-3 px-3 font-semibold">S.No</th>
                        <th className="text-center py-3 px-3 font-semibold">
                          [{anode.solutionFormula}] (M)<br />
                          <span className="text-xs font-normal text-muted-foreground">Anode — Fixed</span>
                        </th>
                        <th className="text-center py-3 px-3 font-semibold">
                          [{cathode.solutionFormula}] (M)<br />
                          <span className="text-xs font-normal text-muted-foreground">Cathode</span>
                        </th>
                        <th className="text-center py-3 px-3 font-semibold">
                          log([{anode.solutionFormula}]/[{cathode.solutionFormula}])
                        </th>
                        <th className="text-center py-3 px-3 font-semibold">
                          EMF Observed (V)<br />
                          <span className="text-xs font-normal text-muted-foreground">Enter from voltmeter</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((row, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.07 }}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="text-center py-3 px-3 font-medium">{row.sNo}</td>
                          <td className="text-center py-3 px-3 font-mono">{row.anodeConc.toFixed(2)}</td>
                          <td className="text-center py-3 px-3 font-mono">{row.cathodeConc.toFixed(2)}</td>
                          <td className="text-center py-3 px-3 font-mono text-muted-foreground">{row.logRatio.toFixed(4)}</td>
                          <td className="text-center py-3 px-3">
                            <Input
                              type="number"
                              step="0.0001"
                              placeholder="e.g. 1.1000"
                              value={row.emfObserved}
                              onChange={e => handleEmfObservedChange(index, e.target.value)}
                              className="w-32 mx-auto text-center font-mono h-8 text-sm"
                            />
                          </td>
                        </motion.tr>
                      ))}

                      {/* Unknown concentration row */}
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="border-t-2 border-amber-400 bg-amber-50/60"
                      >
                        <td className="text-center py-3 px-3 font-medium text-amber-700">
                          {tableRows.length + 1}
                        </td>
                        <td className="text-center py-3 px-3 font-mono">{anodeConcentration.toFixed(2)}</td>

                        {/* Unknown cathode concentration input */}
                        <td className="text-center py-3 px-3">
                          <div className="flex items-center justify-center gap-2">
                            <Input
                              type="number"
                              step="0.001"
                              placeholder="Enter X"
                              value={unknownConcInput}
                              onChange={e => {
                                setUnknownConcInput(e.target.value);
                                setUnknownEmfFromBackend(null);
                                setUnknownEmfObserved("");
                                setUnknownEmfVerified(null);
                                setUnknownConcApplied(null);
                              }}
                              className="w-24 text-center font-mono h-8 text-sm border-amber-300"
                            />
                            <Button
                              size="sm"
                              onClick={applyUnknownConcentration}
                              disabled={!unknownConcInput || unknownEmfLoading}
                              className="h-8 px-3 bg-amber-500 hover:bg-amber-600 text-white text-xs"
                            >
                              {unknownEmfLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Get EMF"}
                            </Button>
                          </div>
                          {unknownConcApplied && (
                            <p className="text-xs text-amber-700 mt-1 font-medium">
                              X = {unknownConcApplied} M
                            </p>
                          )}
                        </td>

                        {/* log ratio — show once concentration is known */}
                        <td className="text-center py-3 px-3 font-mono text-amber-700">
                          {unknownConcApplied
                            ? Math.log10(anodeConcentration / unknownConcApplied).toFixed(4)
                            : <span className="text-amber-400"><HelpCircle className="w-4 h-4 inline" /></span>}
                        </td>

                        {/* EMF column: show computed EMF, then let student enter observed EMF */}
                        <td className="text-center py-3 px-3">
                          {unknownEmfFromBackend !== null ? (
                            <div className="space-y-2">
                              <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1 text-center">
                                <p className="text-xs text-blue-600 font-medium">Theoretical EMF</p>
                                <p className="font-mono font-bold text-blue-700">{unknownEmfFromBackend.toFixed(4)} V</p>
                              </div>
                              <div className="flex items-center gap-2 justify-center">
                                <Input
                                  type="number"
                                  step="0.0001"
                                  placeholder="Your EMF"
                                  value={unknownEmfObserved}
                                  onChange={e => { setUnknownEmfObserved(e.target.value); setUnknownEmfVerified(null); }}
                                  className="w-28 text-center font-mono h-8 text-sm"
                                />
                                <Button
                                  size="sm"
                                  onClick={verifyUnknownEmf}
                                  disabled={!unknownEmfObserved}
                                  className="h-8 px-3 lab-gradient-bg text-primary-foreground text-xs"
                                >
                                  Verify
                                </Button>
                              </div>
                              {unknownEmfVerified !== null && (
                                <p className={`text-xs font-semibold ${unknownEmfVerified ? "text-green-600" : "text-red-500"}`}>
                                  {unknownEmfVerified ? "✓ Correct! Well done." : `✗ Expected ≈ ${unknownEmfFromBackend.toFixed(4)} V`}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-amber-500 italic">Enter concentration and click Get EMF</span>
                          )}
                        </td>
                      </motion.tr>
                    </tbody>
                  </table>
                </div>

                {/* Nernst equation reminder */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-700 text-xs font-medium">
                    📐 Nernst Equation: E<sub>cell</sub> = E°<sub>cell</sub> − (0.0591/n) × log([{anode.solutionFormula}]/[{cathode.solutionFormula}])
                    &nbsp;|&nbsp; E°<sub>cell</sub> = <strong>{E0cell.toFixed(3)} V</strong>, n = 2
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ElectrochemistrySimulator;
