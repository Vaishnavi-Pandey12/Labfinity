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

        {/* Cell Visualization */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <Battery className="w-5 h-5 text-primary" />
              Daniell Cell
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-80 bg-gradient-to-b from-background to-muted/30 rounded-xl overflow-hidden">
              {/* Voltmeter */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-14 bg-card border-2 border-border rounded-lg flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground">Voltmeter</span>
                <span className="text-lg font-mono font-bold text-primary">
                  {isConnected ? `${emf.toFixed(2)} V` : "0.00 V"}
                </span>
              </div>

              {/* Wires */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Left wire (Zn) */}
                <path
                  d="M 80 220 L 80 80 L 145 80 L 145 50"
                  fill="none"
                  stroke={isConnected ? "#ef4444" : "#666"}
                  strokeWidth="3"
                />
                {/* Right wire (Cu) */}
                <path
                  d="M 280 220 L 280 80 L 215 80 L 215 50"
                  fill="none"
                  stroke={isConnected ? "#3b82f6" : "#666"}
                  strokeWidth="3"
                />
                
                {/* Electron flow animation */}
                {electronFlow && (
                  <>
                    <circle r="4" fill="#fbbf24">
                      <animateMotion
                        dur="2s"
                        repeatCount="indefinite"
                        path="M 80 220 L 80 80 L 145 80 L 145 50"
                      />
                    </circle>
                    <circle r="4" fill="#fbbf24">
                      <animateMotion
                        dur="2s"
                        repeatCount="indefinite"
                        path="M 215 50 L 215 80 L 280 80 L 280 220"
                      />
                    </circle>
                  </>
                )}
              </svg>

              {/* Zinc Half-Cell */}
              <div className="absolute left-4 bottom-4 w-32">
                <div className="relative">
                  {/* Beaker */}
                  <div 
                    className="w-full h-40 rounded-b-2xl border-4 border-t-0 border-gray-400 overflow-hidden"
                    style={{ background: 'linear-gradient(to bottom, transparent 20%, rgba(156, 163, 175, 0.3) 20%)' }}
                  >
                    {/* Solution */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 bg-gray-300/50"
                      style={{ height: '75%' }}
                      animate={isConnected ? { opacity: [0.5, 0.7, 0.5] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    
                    {/* Zinc electrode */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-28 bg-gradient-to-b from-gray-500 to-gray-400 rounded-b" />
                  </div>
                  <p className="text-center text-sm mt-2 font-medium">Zn | ZnSO₄</p>
                  <p className="text-center text-xs text-muted-foreground">{znConcentration.toFixed(2)} M</p>
                  <p className="text-center text-xs text-red-500 font-semibold">Anode (-)</p>
                </div>
              </div>

              {/* Salt Bridge */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-24">
                <motion.div
                  className="w-24 h-8 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 rounded-full border-2 border-amber-300"
                  animate={isConnected ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <p className="text-center text-xs text-muted-foreground mt-1">Salt Bridge</p>
              </div>

              {/* Copper Half-Cell */}
              <div className="absolute right-4 bottom-4 w-32">
                <div className="relative">
                  {/* Beaker */}
                  <div 
                    className="w-full h-40 rounded-b-2xl border-4 border-t-0 border-gray-400 overflow-hidden"
                    style={{ background: 'linear-gradient(to bottom, transparent 20%, rgba(59, 130, 246, 0.2) 20%)' }}
                  >
                    {/* Solution */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 bg-blue-400/40"
                      style={{ height: '75%' }}
                      animate={isConnected ? { opacity: [0.4, 0.6, 0.4] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    
                    {/* Copper electrode */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-28 bg-gradient-to-b from-orange-600 to-orange-500 rounded-b" />
                  </div>
                  <p className="text-center text-sm mt-2 font-medium">CuSO₄ | Cu</p>
                  <p className="text-center text-xs text-muted-foreground">{cuConcentration.toFixed(2)} M</p>
                  <p className="text-center text-xs text-blue-500 font-semibold">Cathode (+)</p>
                </div>
              </div>
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
