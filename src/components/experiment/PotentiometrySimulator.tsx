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
    setTimeout(() => setIsStirring(false), 500);
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

  // Get solution color based on pH
  const getSolutionColor = (pH: number): string => {
    if (pH < 4) return "rgba(239, 68, 68, 0.4)"; // Red - acidic
    if (pH < 6) return "rgba(249, 115, 22, 0.4)"; // Orange
    if (pH < 8) return "rgba(34, 197, 94, 0.3)"; // Green - neutral
    if (pH < 10) return "rgba(59, 130, 246, 0.4)"; // Blue
    return "rgba(139, 92, 246, 0.4)"; // Purple - basic
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Controls Panel */}
        <Card className="glass-card border-0">
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
                    className="w-3 h-3 bg-foreground rounded-full relative"
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
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <Beaker className="w-5 h-5 text-primary" />
              Titration Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-80 bg-gradient-to-b from-background to-muted/30 rounded-xl overflow-hidden">
              {/* Burette */}
              <div className="absolute left-1/2 -translate-x-1/2 top-2">
                <div className="w-6 h-32 bg-gradient-to-b from-gray-200 to-gray-100 border-2 border-gray-300 rounded-t-sm relative">
                  {/* NaOH level */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-blue-300/60 rounded-b"
                    animate={{ height: `${Math.max(0, 100 - (volumeAdded / 40) * 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="absolute -left-8 top-0 text-xs text-muted-foreground">0 mL</div>
                  <div className="absolute -left-10 bottom-0 text-xs text-muted-foreground">40 mL</div>
                </div>
                <div className="w-1 h-6 bg-gray-400 mx-auto" />
                
                {/* Dripping animation */}
                <AnimatePresence>
                  {isStirring && (
                    <motion.div
                      initial={{ y: 0, opacity: 1 }}
                      animate={{ y: 60, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      className="w-2 h-2 bg-blue-400 rounded-full mx-auto"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Beaker */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-40">
                <div className="relative">
                  <div 
                    className="w-full h-36 rounded-b-2xl border-4 border-t-0 border-gray-400 overflow-hidden"
                  >
                    {/* Solution */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0"
                      style={{ 
                        height: '70%',
                        backgroundColor: getSolutionColor(currentPH)
                      }}
                      animate={isStirring ? { rotate: [0, 2, -2, 0] } : {}}
                      transition={{ duration: 0.3 }}
                    />
                    
                    {/* pH Electrode */}
                    <div className="absolute top-2 left-8 w-3 h-24 bg-gradient-to-b from-gray-600 to-gray-500 rounded-b">
                      <div className="absolute bottom-0 w-3 h-4 bg-gray-300 rounded-b" />
                    </div>
                    
                    {/* Stirrer */}
                    <motion.div
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-2 bg-white rounded"
                      animate={isStirring ? { rotate: 360 } : {}}
                      transition={{ duration: 0.5, ease: "linear" }}
                    />
                  </div>
                  
                  <p className="text-center text-sm mt-2 font-medium">HCl + NaOH</p>
                </div>
              </div>

              {/* pH Meter Display */}
              <div className="absolute top-4 right-4 w-24 bg-card border-2 border-border rounded-lg p-2">
                <p className="text-xs text-muted-foreground text-center">pH Meter</p>
                <p className="text-xl font-mono font-bold text-center text-primary">
                  {currentPH.toFixed(2)}
                </p>
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
