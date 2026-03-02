import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, RotateCcw, Zap, Lightbulb } from "lucide-react";
import AbsorbanceGraph from "./AbsorbanceGraph";

interface DataPoint {
  theta1: number;
  theta2: number;
  sin1: number;
  sin2: number;
}

const calculateRefraction = (n1: number, n2: number, theta1: number) => {
  const rad = (theta1 * Math.PI) / 180;
  const sinTheta2 = (n1 / n2) * Math.sin(rad);
  if (sinTheta2 > 1) return null;
  return (Math.asin(sinTheta2) * 180) / Math.PI;
};

const RefractionSimulator = () => {
  const [n1, setN1] = useState(1.0);
  const [n2, setN2] = useState(1.5);
  const [theta1, setTheta1] = useState(30);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);

  const theta2 = calculateRefraction(n1, n2, theta1);

  const recordReading = useCallback(() => {
    if (theta2 === null) return;

    const sin1 = Math.sin((theta1 * Math.PI) / 180);
    const sin2 = Math.sin((theta2 * Math.PI) / 180);

    const newPoint: DataPoint = {
      theta1,
      theta2,
      sin1,
      sin2,
    };

    setDataPoints(prev => {
      const filtered = prev.filter(p => p.theta1 !== theta1);
      return [...filtered, newPoint].sort((a, b) => a.theta1 - b.theta1);
    });
  }, [theta1, theta2]);

  const resetExperiment = useCallback(() => {
    setDataPoints([]);
    setTheta1(30);
    setN1(1.0);
    setN2(1.5);
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

            <div className="bg-muted/50 p-4 rounded-xl">
              <h4 className="font-semibold mb-2">Experiment Setup</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Medium 1 refractive index: {n1.toFixed(2)}</li>
                <li>• Medium 2 refractive index: {n2.toFixed(2)}</li>
                <li>• Verifying Snell’s Law</li>
              </ul>
            </div>

            {/* Sliders */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Refractive Index n₁</label>
              <Slider value={[n1]} onValueChange={([v]) => setN1(v)} min={1} max={2.5} step={0.01}/>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Refractive Index n₂</label>
              <Slider value={[n2]} onValueChange={([v]) => setN2(v)} min={1} max={2.5} step={0.01}/>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Angle of Incidence θ₁</label>
              <Slider value={[theta1]} onValueChange={([v]) => setTheta1(v)} min={0} max={80} step={1}/>
              <span className="text-sm font-mono">{theta1}°</span>
            </div>

            {/* Result Display */}
            <div className="bg-primary/10 rounded-xl p-4 text-center">
              {theta2 === null ? (
                <p className="text-red-500 font-semibold">
                  Total Internal Reflection
                </p>
              ) : (
                <p className="text-primary font-bold">
                  θ₂ = {theta2.toFixed(2)}°
                </p>
              )}
            </div>

            {/* Buttons */}
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

          </CardContent>
        </Card>

        {/* Visualization */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <Lightbulb className="w-5 h-5 text-primary" />
              Ray Diagram
            </CardTitle>
          </CardHeader>

          <CardContent>
            <svg width="100%" height="300">
              <line x1="0" y1="150" x2="400" y2="150" stroke="gray" strokeWidth="2"/>

              <line
                x1="200"
                y1="150"
                x2={200 - 120 * Math.sin((theta1 * Math.PI)/180)}
                y2={150 - 120 * Math.cos((theta1 * Math.PI)/180)}
                stroke="orange"
                strokeWidth="3"
              />

              {theta2 !== null && (
                <line
                  x1="200"
                  y1="150"
                  x2={200 + 120 * Math.sin((theta2 * Math.PI)/180)}
                  y2={150 + 120 * Math.cos((theta2 * Math.PI)/180)}
                  stroke="blue"
                  strokeWidth="3"
                />
              )}
            </svg>
          </CardContent>
        </Card>
      </div>

      {/* Graph */}
      <AbsorbanceGraph
        title="Snell's Law Verification"
        subtitle="sin θ₁ vs sin θ₂"
        data={dataPoints.map(d => ({ x: d.sin1, y: d.sin2 }))}
        xLabel="sin θ₁"
        yLabel="sin θ₂"
        showPoints
        lineColor="#3b82f6"
      />

      {/* Observation Table */}
      {dataPoints.length > 0 && (
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="font-display">Observation Table</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 px-3 text-left">S.No</th>
                  <th className="py-2 px-3 text-left">θ₁</th>
                  <th className="py-2 px-3 text-left">θ₂</th>
                  <th className="py-2 px-3 text-left">sin θ₁</th>
                  <th className="py-2 px-3 text-left">sin θ₂</th>
                </tr>
              </thead>
              <tbody>
                {dataPoints.map((point, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border-b border-border/50"
                  >
                    <td className="py-2 px-3">{index + 1}</td>
                    <td className="py-2 px-3">{point.theta1.toFixed(1)}</td>
                    <td className="py-2 px-3">{point.theta2.toFixed(2)}</td>
                    <td className="py-2 px-3">{point.sin1.toFixed(3)}</td>
                    <td className="py-2 px-3">{point.sin2.toFixed(3)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {dataPoints.length >= 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20"
              >
                <p className="text-green-600 dark:text-green-400 font-medium">
                  ✓ Linear relation between sin θ₁ and sin θ₂ verifies Snell’s Law!
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RefractionSimulator;
