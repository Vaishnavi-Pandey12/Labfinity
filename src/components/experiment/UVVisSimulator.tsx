import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Play,
  RotateCcw,
  Lightbulb,
  Scan
} from "lucide-react";
import AbsorbanceGraph from "./AbsorbanceGraph";

type Compound = "benzene" | "naphthalene" | "anthracene" | "acetone" | "nitrobenzene";

interface CompoundData {
  name: string;
  formula: string;
  lambdaMax: number[];
  transitions: string[];
  color: string;
  peaks: { wavelength: number; absorbance: number; width: number }[];
}

const compoundDatabase: Record<Compound, CompoundData> = {
  benzene: {
    name: "Benzene",
    formula: "C₆H₆",
    lambdaMax: [254],
    transitions: ["π → π* (B-band)"],
    color: "transparent",
    peaks: [
      { wavelength: 254, absorbance: 0.8, width: 20 },
      { wavelength: 200, absorbance: 1.2, width: 15 },
    ],
  },
  naphthalene: {
    name: "Naphthalene",
    formula: "C₁₀H₈",
    lambdaMax: [275, 312],
    transitions: ["π → π* (B-band)", "π → π* (La band)"],
    color: "transparent",
    peaks: [
      { wavelength: 220, absorbance: 1.5, width: 20 },
      { wavelength: 275, absorbance: 1.0, width: 25 },
      { wavelength: 312, absorbance: 0.3, width: 15 },
    ],
  },
  anthracene: {
    name: "Anthracene",
    formula: "C₁₄H₁₀",
    lambdaMax: [252, 375],
    transitions: ["π → π* (B-band)", "π → π* (La band)"],
    color: "#fffbe6",
    peaks: [
      { wavelength: 252, absorbance: 1.8, width: 25 },
      { wavelength: 340, absorbance: 0.8, width: 30 },
      { wavelength: 375, absorbance: 1.2, width: 20 },
    ],
  },
  acetone: {
    name: "Acetone",
    formula: "CH₃COCH₃",
    lambdaMax: [280],
    transitions: ["n → π* (R-band)"],
    color: "transparent",
    peaks: [
      { wavelength: 190, absorbance: 1.0, width: 15 },
      { wavelength: 280, absorbance: 0.3, width: 30 },
    ],
  },
  nitrobenzene: {
    name: "Nitrobenzene",
    formula: "C₆H₅NO₂",
    lambdaMax: [268, 330],
    transitions: ["π → π*", "n → π*"],
    color: "#fff8dc",
    peaks: [
      { wavelength: 268, absorbance: 1.4, width: 25 },
      { wavelength: 330, absorbance: 0.4, width: 35 },
    ],
  },
};

// Generate spectrum data
const generateSpectrum = (compound: Compound): { wavelength: number; absorbance: number }[] => {
  const data = compoundDatabase[compound];
  const points: { wavelength: number; absorbance: number }[] = [];

  for (let wavelength = 200; wavelength <= 500; wavelength += 2) {
    let absorbance = 0;
    for (const peak of data.peaks) {
      const gaussian = peak.absorbance * Math.exp(
        -Math.pow(wavelength - peak.wavelength, 2) / (2 * Math.pow(peak.width, 2))
      );
      absorbance += gaussian;
    }
    points.push({ wavelength, absorbance: Math.min(absorbance, 2.5) });
  }

  return points;
};

const UVVisSimulator = () => {
  const [compound, setCompound] = useState<Compound>("benzene");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [spectrumData, setSpectrumData] = useState<{ wavelength: number; absorbance: number }[]>([]);
  const [scannedData, setScannedData] = useState<{ x: number; y: number }[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setSpectrumData(generateSpectrum(compound));
    setScannedData([]);
    setShowResults(false);
    setScanProgress(0);
  }, [compound]);

  const startScan = useCallback(() => {
    setIsScanning(true);
    setScannedData([]);
    setScanProgress(0);
    setShowResults(false);

    const spectrum = generateSpectrum(compound);
    let index = 0;

    const scanInterval = setInterval(() => {
      if (index < spectrum.length) {
        setScannedData(prev => [...prev, { x: spectrum[index].wavelength, y: spectrum[index].absorbance }]);
        setScanProgress(((index + 1) / spectrum.length) * 100);
        index++;
      } else {
        clearInterval(scanInterval);
        setIsScanning(false);
        setShowResults(true);
      }
    }, 20);

    return () => clearInterval(scanInterval);
  }, [compound]);

  const resetExperiment = useCallback(() => {
    setIsScanning(false);
    setScannedData([]);
    setScanProgress(0);
    setShowResults(false);
  }, []);

  const compoundData = compoundDatabase[compound];

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Controls Panel */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <Scan className="w-5 h-5 text-primary" />
              Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Compound Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Compound</label>
              <Select
                value={compound}
                onValueChange={(v) => setCompound(v as Compound)}
                disabled={isScanning}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  {Object.entries(compoundDatabase).map(([key, data]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {data.name} ({data.formula})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Compound Info */}
            <div className="bg-muted/50 p-4 rounded-xl">
              <h4 className="font-semibold mb-2">{compoundData.name}</h4>
              <p className="text-sm text-muted-foreground mb-2">Formula: {compoundData.formula}</p>
              <p className="text-sm text-muted-foreground">
                λmax: {compoundData.lambdaMax.join(", ")} nm
              </p>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">Transitions:</p>
                {compoundData.transitions.map((t, i) => (
                  <p key={i} className="text-xs text-primary">• {t}</p>
                ))}
              </div>
            </div>

            {/* Scan Progress */}
            {isScanning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Scanning...</span>
                  <span>{scanProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={startScan}
                className="flex-1 gap-2 lab-gradient-bg text-primary-foreground"
                disabled={isScanning}
              >
                <Play className="w-4 h-4" />
                {isScanning ? "Scanning..." : "Start Scan"}
              </Button>
              <Button variant="outline" onClick={resetExperiment} className="gap-2" disabled={isScanning}>
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Apparatus Visualization */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <Lightbulb className="w-5 h-5 text-primary" />
              UV-Vis Spectrophotometer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-80 bg-[#f8fafc] rounded-xl overflow-hidden flex items-center justify-center px-4 md:px-10">
              {/* Wavelength Display Container - Top Right */}
              <div className="absolute top-6 right-6 bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm flex flex-col items-center min-w-[120px] z-30">
                <span className="text-sm font-medium text-slate-500 mb-1">Wavelength</span>
                <span className="text-2xl font-bold text-blue-600 font-mono tracking-wider flex items-center gap-1">
                  {isScanning ? `${(200 + (scanProgress * 3)).toFixed(0)}` : "---"}
                  <span className="text-lg"> nm</span>
                </span>
              </div>

              {/* Main Setup Container */}
              <div className="w-full flex items-center justify-between relative z-10 max-w-4xl mx-auto pt-8">

                {/* 1. UV/Vis Source */}
                <div className="flex flex-col items-center z-20 w-24 flex-shrink-0 relative group">
                  <motion.div
                    className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#fcd34d] via-[#fbbf24] to-[#f59e0b] flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.4)]"
                    animate={isScanning ? {
                      boxShadow: ["0 0 20px rgba(251, 191, 36, 0.4)", "0 0 50px rgba(251, 191, 36, 0.8)", "0 0 20px rgba(251, 191, 36, 0.4)"]
                    } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Lightbulb className="w-8 h-8 text-white drop-shadow-sm" />
                  </motion.div>
                  <p className="text-[13px] text-center mt-5 text-slate-500 font-medium leading-tight">UV/Vis<br />Source</p>
                </div>

                {/* Gray Connector */}
                <div className="w-12 h-3 bg-gradient-to-b from-gray-400 to-gray-500 rounded-sm -ml-4 z-10 flex-shrink-0 relative -top-6"></div>

                {/* 2. Monochromator */}
                <div className="flex flex-col items-center z-20 w-24 flex-shrink-0 -ml-4 relative">
                  <div className="w-[64px] h-[110px] bg-[#334155] rounded-xl flex items-center justify-center p-[6px] shadow-xl border border-slate-600/50">
                    <div
                      className="w-full h-full rounded-[4px] shadow-inner"
                      style={{
                        background: 'linear-gradient(to bottom, #7e22ce, #3b82f6, #06b6d4, #10b981, #eab308, #f97316, #ef4444)',
                      }}
                    />
                  </div>
                  <p className="text-[13px] text-center mt-5 text-slate-500 font-medium leading-tight absolute -bottom-12 w-24">Mono-<br />chromator</p>
                </div>

                {/* Beam 1: Monochromator to Sample */}
                <div className="flex-1 h-3 z-10 relative -top-6 min-w-[40px]">
                  <motion.div
                    className="w-full h-full"
                    style={{
                      background: isScanning
                        ? `linear-gradient(90deg, 
                            hsl(${280 - (scanProgress * 0.8)}, 100%, 60%), 
                            hsl(${280 - (scanProgress * 0.8) + 20}, 100%, 60%))`
                        : 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #10b981)',
                    }}
                  />
                </div>

                {/* 3. Sample Platform and Cuvette */}
                <div className="flex flex-col items-center z-20 w-32 flex-shrink-0 relative">
                  <div className="relative flex flex-col items-center">
                    {/* Cuvette */}
                    <div className="w-[48px] h-[90px] border-x-[3px] border-b-[4px] border-t-0 border-white/80 bg-white/20 rounded-b-lg overflow-hidden relative z-20 shadow-[inset_0_0_15px_rgba(255,255,255,0.8),_0_4px_10px_rgba(0,0,0,0.1)] translate-y-3 backdrop-blur-sm">
                      <motion.div
                        className="absolute bottom-0 w-full rounded-b-md"
                        style={{
                          height: '65%',
                          backgroundColor: compoundData.color === 'transparent' ? '#fde68a' : compoundData.color,
                          opacity: 0.8
                        }}
                        animate={isScanning ? { opacity: [0.7, 0.9, 0.7] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        {/* Highlights for liquid */}
                        <div className="absolute inset-x-0 top-0 h-1 bg-white/40" />
                        <div className="absolute right-1 top-1 bottom-1 w-2 bg-white/20 rounded-full" />
                      </motion.div>
                      {/* Glass glare */}
                      <div className="absolute left-1 top-2 bottom-2 w-2 bg-white/40 rounded-full" />
                    </div>
                    {/* Platform */}
                    <div className="w-32 h-10 rounded-t-sm rounded-b-lg shadow-2xl relative z-10 bg-[#2d3748]">
                      {/* Platform top highlighting */}
                      <div className="absolute top-0 left-0 w-full h-3 bg-[#4a5568] rounded-t-sm" />
                    </div>
                  </div>
                  <p className="text-[13px] text-center mt-5 text-slate-500 font-medium absolute -bottom-12 w-32">Sample</p>
                </div>

                {/* Beam 2: Sample to Detector */}
                <div className="flex-1 h-3 z-10 relative -top-6 min-w-[40px]">
                  {(!isScanning || (isScanning && scanProgress > 0)) && (
                    <motion.div
                      className="w-full h-full"
                      style={{
                        background: isScanning
                          ? `linear-gradient(90deg, 
                              hsl(${280 - (scanProgress * 0.8) + 20}, 100%, 60%), 
                              transparent)`
                          : 'linear-gradient(90deg, #06b6d4, #3b82f6, #7e22ce, rgba(126, 34, 206, 0.1))',
                        opacity: isScanning ? 0.6 : 0.8,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isScanning ? 0.6 : 0.8 }}
                    />
                  )}
                </div>

                {/* 4. Detector */}
                <div className="flex flex-col items-center z-20 w-24 flex-shrink-0 relative">
                  <div className="w-[84px] h-[84px] bg-[#2d3748] rounded-[1.5rem] shadow-xl flex items-center justify-center border border-slate-600/50 relative -top-2">
                    <div className="w-10 h-10 rounded-full bg-[#171923] shadow-inner flex items-center justify-center border border-slate-700">
                      <motion.div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: isScanning ? '#22c55e' : '#4a5568',
                          boxShadow: isScanning ? '0 0 10px #22c55e' : 'none'
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-[13px] text-center mt-5 text-slate-500 font-medium absolute -bottom-10 w-24">Detector</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Absorption Spectrum Graph */}
      <AbsorbanceGraph
        title="UV-Visible Absorption Spectrum"
        subtitle={`${compoundData.name} in solution`}
        data={scannedData}
        xLabel="Wavelength (nm)"
        yLabel="Absorbance"
        xDomain={[200, 500]}
        lineColor="#8b5cf6"
      />

      {/* Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="font-display">Spectral Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Compound Information</h4>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-border/50">
                          <td className="py-2 text-muted-foreground">Name</td>
                          <td className="py-2 font-medium">{compoundData.name}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 text-muted-foreground">Formula</td>
                          <td className="py-2 font-mono">{compoundData.formula}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 text-muted-foreground">λmax</td>
                          <td className="py-2 font-mono">{compoundData.lambdaMax.join(", ")} nm</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Electronic Transitions</h4>
                    <ul className="space-y-2">
                      {compoundData.transitions.map((transition, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-primary" />
                          <span className="text-sm">{transition}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20"
                >
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    ✓ Spectrum recorded successfully! The absorption peaks correspond to the
                    expected electronic transitions for {compoundData.name}.
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UVVisSimulator;
