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
            <div className="relative h-72 bg-gradient-to-b from-background to-muted/30 rounded-xl overflow-hidden">
              {/* Light Source */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <motion.div
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center"
                  animate={isScanning ? { 
                    boxShadow: ["0 0 20px rgba(251, 191, 36, 0.5)", "0 0 40px rgba(251, 191, 36, 0.8)", "0 0 20px rgba(251, 191, 36, 0.5)"]
                  } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Lightbulb className="w-8 h-8 text-white" />
                </motion.div>
                <p className="text-xs text-center mt-2 text-muted-foreground">UV/Vis<br/>Source</p>
              </div>

              {/* Light Beam */}
              <motion.div
                className="absolute left-24 top-1/2 -translate-y-1/2 h-4"
                style={{
                  width: 60,
                  background: isScanning 
                    ? `linear-gradient(90deg, 
                        hsl(${280 - (scanProgress * 0.8)}, 100%, 60%), 
                        hsl(${280 - (scanProgress * 0.8) + 20}, 100%, 60%))`
                    : 'linear-gradient(90deg, #666, #888)',
                }}
                animate={isScanning ? { opacity: [0.7, 1, 0.7] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              />

              {/* Monochromator */}
              <div className="absolute left-36 top-1/2 -translate-y-1/2">
                <div className="w-12 h-20 bg-gradient-to-b from-gray-600 to-gray-700 rounded flex items-center justify-center">
                  <div 
                    className="w-8 h-16 rounded"
                    style={{
                      background: 'linear-gradient(to bottom, #8B00FF, #0000FF, #00FFFF, #00FF00, #FFFF00, #FF7F00, #FF0000)',
                    }}
                  />
                </div>
                <p className="text-xs text-center mt-1 text-muted-foreground">Mono-<br/>chromator</p>
              </div>

              {/* Sample Cuvette */}
              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                <div className="w-10 h-24 border-2 border-gray-400 rounded-b-lg overflow-hidden bg-white/10">
                  <motion.div
                    className="w-full h-16 mt-4"
                    style={{ backgroundColor: compoundData.color === 'transparent' ? 'rgba(200, 200, 200, 0.2)' : compoundData.color }}
                    animate={isScanning ? { opacity: [0.5, 0.8, 0.5] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </div>
                <p className="text-xs text-center mt-1 text-muted-foreground">Sample</p>
              </div>

              {/* Transmitted Light */}
              <AnimatePresence>
                {isScanning && (
                  <motion.div
                    className="absolute right-24 top-1/2 -translate-y-1/2 h-2"
                    initial={{ width: 0 }}
                    animate={{ width: 60 }}
                    style={{
                      background: `hsl(${280 - (scanProgress * 0.8)}, 100%, 60%)`,
                      opacity: 0.6,
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Detector */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border-2 border-gray-600">
                  <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                    <motion.div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: isScanning ? '#22c55e' : '#666',
                      }}
                      animate={isScanning ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  </div>
                </div>
                <p className="text-xs text-center mt-2 text-muted-foreground">Detector</p>
              </div>

              {/* Wavelength Display */}
              <div className="absolute top-4 right-4 bg-card border border-border rounded-lg px-3 py-2">
                <p className="text-xs text-muted-foreground">Wavelength</p>
                <p className="text-lg font-mono font-bold text-primary">
                  {isScanning ? `${(200 + (scanProgress * 3)).toFixed(0)} nm` : "--- nm"}
                </p>
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
