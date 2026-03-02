import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Play,
  RotateCcw,
  Lock,
  Unlock,
  Lightbulb,
  Zap,
  Download
} from "lucide-react";
import ColorimetryApparatus from "./ColorimetryApparatus";
import AbsorbanceGraph from "./AbsorbanceGraph";

type Solution = "KMnO4" | "CuSO4" | "NiSO4" | "CrystalViolet" | "MethyleneBlue";

interface DataPoint {
  concentration: number;
  absorbance: number;
}

interface WavelengthDataPoint {
  wavelength: number;
  absorbance: number;
}

// Molar absorptivity and λmax for different solutions
const solutionData: Record<Solution, { lambdaMax: number; epsilon: number; color: string; name: string }> = {
  KMnO4: { lambdaMax: 525, epsilon: 2400, color: "#9b2d9b", name: "Potassium Permanganate" },
  CuSO4: { lambdaMax: 800, epsilon: 12, color: "#2196F3", name: "Copper Sulfate" },
  NiSO4: { lambdaMax: 394, epsilon: 5, color: "#4CAF50", name: "Nickel Sulfate" },
  CrystalViolet: { lambdaMax: 590, epsilon: 87000, color: "#7B1FA2", name: "Crystal Violet" },
  MethyleneBlue: { lambdaMax: 664, epsilon: 95000, color: "#0D47A1", name: "Methylene Blue" },
};

// Generate absorption spectrum for a solution
const generateSpectrum = (solution: Solution, concentration: number): WavelengthDataPoint[] => {
  const { lambdaMax, epsilon } = solutionData[solution];
  const pathLength = 1; // 1 cm
  const points: WavelengthDataPoint[] = [];

  for (let wavelength = 400; wavelength <= 700; wavelength += 10) {
    // Gaussian distribution around λmax
    const sigma = 40;
    const absorbanceMax = epsilon * pathLength * concentration * 0.001;
    const absorbance = absorbanceMax * Math.exp(-Math.pow(wavelength - lambdaMax, 2) / (2 * sigma * sigma));
    points.push({ wavelength, absorbance: Math.min(absorbance, 2.5) });
  }

  return points;
};

// Calculate absorbance using Beer-Lambert Law
const calculateAbsorbance = (solution: Solution, concentration: number, wavelength: number): number => {
  const { lambdaMax, epsilon } = solutionData[solution];
  const pathLength = 1; // 1 cm
  const sigma = 40;
  const absorbanceMax = epsilon * pathLength * concentration * 0.001;
  const absorbance = absorbanceMax * Math.exp(-Math.pow(wavelength - lambdaMax, 2) / (2 * sigma * sigma));
  return Math.min(absorbance, 2.5);
};

// ─── Table row types ───────────────────────────────────────────────────────────
interface LambdaMaxRow {
  s_no: number;
  wavelength: number;
}

interface ConcRow {
  s_no: number;
  concentration: number;
}

const BACKEND = "http://localhost:8000";

const ColorimetrySimulator = () => {
  const [solution, setSolution] = useState<Solution>("KMnO4");
  const [wavelength, setWavelength] = useState(525);
  const [concentration, setConcentration] = useState(0.05);
  const [isWavelengthLocked, setIsWavelengthLocked] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);
  const [absorbance, setAbsorbance] = useState(0);
  const [spectrumData, setSpectrumData] = useState<WavelengthDataPoint[]>([]);
  const [calibrationData, setCalibrationData] = useState<DataPoint[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [step, setStep] = useState(1);

  // ─── Observation Table 1 – λmax determination ────────────────────────────
  const [lambdaRows, setLambdaRows] = useState<LambdaMaxRow[]>([]);
  const [lambdaAbsorbances, setLambdaAbsorbances] = useState<string[]>([]);
  const [lambdaMax, setLambdaMax] = useState<number>(525);

  // ─── Observation Table 2 – Beer-Lambert verification ─────────────────────
  const [concRows, setConcRows] = useState<ConcRow[]>([]);
  const [concAbsorbances, setConcAbsorbances] = useState<string[]>([]);
  const [concLambdaMax, setConcLambdaMax] = useState<number>(525);

  // Fetch lambda max table whenever solution changes
  useEffect(() => {
    fetch(`${BACKEND}/api/colorimetry-lambda-max-table?solution=${solution}`)
      .then((r) => r.json())
      .then((data) => {
        setLambdaRows(data.rows);
        setLambdaMax(data.lambda_max);
        setLambdaAbsorbances(Array(data.rows.length).fill(""));
      })
      .catch(() => { });
  }, [solution]);

  // Fetch concentration table whenever solution changes
  useEffect(() => {
    fetch(`${BACKEND}/api/colorimetry-concentration-table?solution=${solution}`)
      .then((r) => r.json())
      .then((data) => {
        setConcRows(data.rows);
        setConcLambdaMax(data.lambda_max);
        setConcAbsorbances(Array(data.rows.length).fill(""));
      })
      .catch(() => { });
  }, [solution]);

  // Update spectrum when solution changes
  useEffect(() => {
    setSpectrumData(generateSpectrum(solution, concentration));
    setWavelength(solutionData[solution].lambdaMax);
  }, [solution]);

  // Calculate absorbance when parameters change
  useEffect(() => {
    if (isLightOn) {
      const newAbsorbance = calculateAbsorbance(solution, concentration, wavelength);
      setAbsorbance(newAbsorbance);
      setSpectrumData(generateSpectrum(solution, concentration));
    }
  }, [wavelength, concentration, solution, isLightOn]);

  const startMeasurement = useCallback(() => {
    setIsLightOn(true);
    setShowResult(true);
  }, []);

  const addDataPoint = useCallback(() => {
    if (!isWavelengthLocked) {
      setIsWavelengthLocked(true);
      setStep(2);
    }
    const newPoint: DataPoint = {
      concentration,
      absorbance: calculateAbsorbance(solution, concentration, wavelength),
    };
    setCalibrationData(prev => [...prev, newPoint].sort((a, b) => a.concentration - b.concentration));
  }, [concentration, solution, wavelength, isWavelengthLocked]);

  const resetExperiment = useCallback(() => {
    setIsLightOn(false);
    setIsWavelengthLocked(false);
    setAbsorbance(0);
    setCalibrationData([]);
    setShowResult(false);
    setStep(1);
    setConcentration(0.05);
    setLambdaAbsorbances(Array(lambdaRows.length).fill(""));
    setConcAbsorbances(Array(concRows.length).fill(""));
  }, [lambdaRows.length, concRows.length]);

  // ─── Input change handlers ─────────────────────────────────────────────────
  const handleLambdaAbsorbanceChange = (index: number, value: string) => {
    setLambdaAbsorbances((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleConcAbsorbanceChange = (index: number, value: string) => {
    setConcAbsorbances((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const downloadTable1CSV = () => {
    if (lambdaRows.length === 0) return;
    const headers = ["S.No", "Wavelength (nm)", "Absorbance"];
    const csvRows = lambdaRows.map((row, idx) => [
      row.s_no,
      row.wavelength,
      lambdaAbsorbances[idx] || ""
    ]);
    const csvContent = [headers.join(","), ...csvRows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `colorimetry_lambda_max_table.csv`;
    link.click();
  };

  const downloadTable2CSV = () => {
    if (concRows.length === 0) return;
    const headers = ["S.No", "Concentration (mol/L)", "Absorbance"];
    const csvRows = concRows.map((row, idx) => [
      row.s_no,
      row.concentration,
      concAbsorbances[idx] || ""
    ]);
    const csvContent = [headers.join(","), ...csvRows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `colorimetry_beer_lambert_table.csv`;
    link.click();
  };

  // ─── Shared table styles ───────────────────────────────────────────────────
  const thClass = "text-left py-3 px-4 font-semibold text-sm text-muted-foreground border-b border-border";
  const tdClass = "py-2 px-4 text-sm border-b border-border/40";
  const inputClass =
    "w-full bg-muted rounded-lg px-3 py-1.5 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/50 transition placeholder:text-muted-foreground/50";

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <Card className="glass-card border-0">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <span className="font-semibold">Step 1</span>
                <span className="text-sm">Find λmax</span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <span className="font-semibold">Step 2</span>
                <span className="text-sm">Verify Beer-Lambert</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={resetExperiment} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

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
            {/* Solution Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Solution</label>
              <Select
                value={solution}
                onValueChange={(v) => setSolution(v as Solution)}
                disabled={isWavelengthLocked}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  {Object.entries(solutionData).map(([key, data]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: data.color }}
                        />
                        {data.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Wavelength Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Wavelength (nm)</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {wavelength} nm
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsWavelengthLocked(!isWavelengthLocked)}
                    className="h-8 w-8"
                  >
                    {isWavelengthLocked ? (
                      <Lock className="w-4 h-4 text-primary" />
                    ) : (
                      <Unlock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <div
                className="h-3 rounded-full relative overflow-hidden"
                style={{
                  background: 'linear-gradient(to right, #8B00FF, #0000FF, #00FFFF, #00FF00, #FFFF00, #FF7F00, #FF0000)',
                }}
              >
                <div
                  className="absolute top-0 h-full w-1 bg-foreground rounded"
                  style={{ left: `${((wavelength - 400) / 300) * 100}%` }}
                />
              </div>
              <Slider
                value={[wavelength]}
                onValueChange={([v]) => setWavelength(v)}
                min={400}
                max={700}
                step={5}
                disabled={isWavelengthLocked}
                className="py-2"
              />
              <p className="text-xs text-muted-foreground">
                λmax for {solutionData[solution].name}: {solutionData[solution].lambdaMax} nm
              </p>
            </div>

            {/* Concentration Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Concentration (M)</label>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {concentration.toFixed(3)} M
                </span>
              </div>
              <Slider
                value={[concentration]}
                onValueChange={([v]) => setConcentration(v)}
                min={0.01}
                max={0.1}
                step={0.005}
                className="py-2"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={startMeasurement}
                className="flex-1 gap-2 lab-gradient-bg text-primary-foreground"
              >
                <Lightbulb className="w-4 h-4" />
                {isLightOn ? "Light On" : "Turn On Light"}
              </Button>
              <Button
                onClick={addDataPoint}
                variant="outline"
                className="flex-1 gap-2"
                disabled={!isLightOn}
              >
                <Play className="w-4 h-4" />
                Add Data Point
              </Button>
            </div>

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
                    <p className="text-sm text-muted-foreground mb-1">Measured Absorbance</p>
                    <p className="text-3xl font-display font-bold text-primary">
                      {absorbance.toFixed(4)}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Apparatus Visualization */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <Lightbulb className="w-5 h-5 text-primary" />
              Virtual Colorimeter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ColorimetryApparatus
              isLightOn={isLightOn}
              wavelength={wavelength}
              solutionColor={solutionData[solution].color}
              absorbance={absorbance}
              concentration={concentration}
            />
          </CardContent>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          OBSERVATION TABLE 1 – λmax Determination
          (Wavelengths auto-generated; Absorbance entered manually)
      ══════════════════════════════════════════════════════════════════ */}
      <Card className="glass-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display text-base">
                Observation Table 1 &nbsp;–&nbsp; λmax Determination
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                For <span className="font-medium">{solutionData[solution].name}</span>{" "}
                &nbsp;|&nbsp; λmax =&nbsp;
                <span className="font-semibold text-primary">{lambdaMax} nm</span>
                &nbsp;·&nbsp; Enter observed absorbance values below.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTable1CSV}
              className="gap-2"
              disabled={lambdaRows.length === 0}
            >
              <Download className="w-4 h-4" />
              Download CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={thClass}>S.No</th>
                  <th className={thClass}>Wavelength (nm)</th>
                  <th className={thClass}>Absorbance <span className="text-primary/70">(enter value)</span></th>
                </tr>
              </thead>
              <tbody>
                {lambdaRows.map((row, idx) => (
                  <motion.tr
                    key={row.s_no}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`hover:bg-muted/30 transition-colors ${row.wavelength === lambdaMax ? "bg-primary/5" : ""
                      }`}
                  >
                    <td className={tdClass}>{row.s_no}</td>
                    <td className={`${tdClass} font-mono font-medium`}>
                      {row.wavelength}
                      {row.wavelength === lambdaMax && (
                        <span className="ml-2 text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          λmax
                        </span>
                      )}
                    </td>
                    <td className={tdClass}>
                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        placeholder="e.g. 0.450"
                        value={lambdaAbsorbances[idx] ?? ""}
                        onChange={(e) => handleLambdaAbsorbanceChange(idx, e.target.value)}
                        className={inputClass}
                      />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════
          OBSERVATION TABLE 2 – Beer-Lambert Law Verification
          (Concentrations auto-generated; Absorbance entered manually)
      ══════════════════════════════════════════════════════════════════ */}
      <Card className="glass-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display text-base">
                Observation Table 2 &nbsp;–&nbsp; Beer-Lambert Law Verification
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Measured at λ =&nbsp;
                <span className="font-semibold text-primary">{concLambdaMax} nm</span>
                &nbsp;·&nbsp; Enter observed absorbance values below.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTable2CSV}
              className="gap-2"
              disabled={concRows.length === 0}
            >
              <Download className="w-4 h-4" />
              Download CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={thClass}>S.No</th>
                  <th className={thClass}>Concentration (mol/L)</th>
                  <th className={thClass}>Absorbance <span className="text-primary/70">(enter value)</span></th>
                </tr>
              </thead>
              <tbody>
                {concRows.map((row, idx) => (
                  <motion.tr
                    key={row.s_no}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className={tdClass}>{row.s_no}</td>
                    <td className={`${tdClass} font-mono font-medium`}>
                      {row.concentration}
                    </td>
                    <td className={tdClass}>
                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        placeholder="e.g. 0.230"
                        value={concAbsorbances[idx] ?? ""}
                        onChange={(e) => handleConcAbsorbanceChange(idx, e.target.value)}
                        className={inputClass}
                      />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Graphs */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Absorption Spectrum */}
        <AbsorbanceGraph
          title="Absorption Spectrum"
          subtitle="Absorbance vs Wavelength"
          data={spectrumData.map(d => ({ x: d.wavelength, y: d.absorbance }))}
          xLabel="Wavelength (nm)"
          yLabel="Absorbance"
          xDomain={[400, 700]}
          highlightX={wavelength}
          lineColor={solutionData[solution].color}
        />

        {/* Calibration Curve */}
        <AbsorbanceGraph
          title="Calibration Curve"
          subtitle="Beer-Lambert Law Verification"
          data={calibrationData.map(d => ({ x: d.concentration * 1000, y: d.absorbance }))}
          xLabel="Concentration (mM)"
          yLabel="Absorbance"
          showPoints
          showTrendline={calibrationData.length >= 2}
          lineColor="#2196F3"
        />
      </div>
    </div>
  );
};

export default ColorimetrySimulator;
