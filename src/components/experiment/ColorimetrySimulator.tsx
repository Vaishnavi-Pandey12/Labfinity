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
  Zap
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

// Keep metadata for UI, remove calculation constants (lambdaMax, epsilon) if not needed for display
// But display needs lambdaMax. We can keep it or fetch it. Keeping for simplicity/display.
const solutionData: Record<Solution, { lambdaMax: number; color: string; name: string }> = {
  KMnO4: { lambdaMax: 525, color: "#9b2d9b", name: "Potassium Permanganate" },
  CuSO4: { lambdaMax: 800, color: "#2196F3", name: "Copper Sulfate" },
  NiSO4: { lambdaMax: 394, color: "#4CAF50", name: "Nickel Sulfate" },
  CrystalViolet: { lambdaMax: 590, color: "#7B1FA2", name: "Crystal Violet" },
  MethyleneBlue: { lambdaMax: 664, color: "#0D47A1", name: "Methylene Blue" },
};

import { useQuery } from "@tanstack/react-query";

const ColorimetrySimulator = () => {
  const [solution, setSolution] = useState<Solution>("KMnO4");
  const [wavelength, setWavelength] = useState(525);
  const [concentration, setConcentration] = useState(0.05);
  const [isWavelengthLocked, setIsWavelengthLocked] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);
  const [absorbance, setAbsorbance] = useState(0);
  const [calibrationData, setCalibrationData] = useState<DataPoint[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [step, setStep] = useState(1);

  // Fetch Spectrum
  const { data: spectrumData = [] } = useQuery({
    queryKey: ['spectrum', solution, concentration],
    queryFn: async () => {
      const res = await fetch('/api/colorimetry/spectrum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solution, concentration })
      });
      if (!res.ok) throw new Error('Failed to fetch spectrum');
      return res.json();
    },
    staleTime: 1000 * 60, // Cache for 1 min
  });

  // Fetch Absorbance
  const { data: absorbanceData } = useQuery({
    queryKey: ['absorbance', solution, concentration, wavelength],
    queryFn: async () => {
      const res = await fetch('/api/colorimetry/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solution, concentration, wavelength })
      });
      if (!res.ok) throw new Error('Failed to fetch absorbance');
      return res.json();
    },
    enabled: isLightOn,
  });

  // Update wavelength when solution changes
  useEffect(() => {
    setWavelength(solutionData[solution].lambdaMax);
  }, [solution]);

  // Update local absorbance state when data arrives
  useEffect(() => {
    if (isLightOn && absorbanceData) {
      setAbsorbance(absorbanceData.absorbance);
    } else if (!isLightOn) {
      setAbsorbance(0);
    }
  }, [absorbanceData, isLightOn]);

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
      absorbance: absorbance, // Use calculated state from API
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
  }, []);

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

      {/* Data Table */}
      {calibrationData.length > 0 && (
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
                    <th className="text-left py-3 px-4 font-semibold">Concentration (M)</th>
                    <th className="text-left py-3 px-4 font-semibold">Absorbance</th>
                  </tr>
                </thead>
                <tbody>
                  {calibrationData.map((point, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-border/50 hover:bg-muted/50"
                    >
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4 font-mono">{point.concentration.toFixed(3)}</td>
                      <td className="py-3 px-4 font-mono">{point.absorbance.toFixed(4)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {calibrationData.length >= 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20"
              >
                <p className="text-green-600 dark:text-green-400 font-medium">
                  ✓ The linear relationship between Absorbance and Concentration verifies Beer-Lambert Law!
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ColorimetrySimulator;
