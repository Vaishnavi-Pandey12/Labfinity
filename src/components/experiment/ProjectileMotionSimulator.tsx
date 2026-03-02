import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, Zap, Play } from "lucide-react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  LineChart,
} from "recharts";

const g = 9.8;

interface DataPoint {
  angle: number;
  range: number;
}

const ProjectileMotionSimulator = () => {
  const [velocity, setVelocity] = useState(20);
  const [angle, setAngle] = useState(45);
  const [observations, setObservations] = useState<DataPoint[]>([]);

  const rad = (angle * Math.PI) / 180;
  const timeOfFlight = (2 * velocity * Math.sin(rad)) / g;
  const maxHeight = (velocity ** 2 * Math.sin(rad) ** 2) / (2 * g);
  const range = (velocity ** 2 * Math.sin(2 * rad)) / g;

  const addObservation = () => {
    const newPoint = { angle, range };
    setObservations((prev) =>
      [...prev, newPoint].sort((a, b) => a.angle - b.angle)
    );
  };

  const reset = () => {
    setVelocity(20);
    setAngle(45);
    setObservations([]);
  };

  return (
    <div className="space-y-6">

      {/* Controls + Results */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Controls */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <Zap className="w-5 h-5 text-primary" />
              Controls
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Initial Velocity (m/s)
              </label>
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {velocity} m/s
              </span>
              <Slider
                value={[velocity]}
                onValueChange={([v]) => setVelocity(v)}
                min={5}
                max={50}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Angle (°)</label>
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {angle}°
              </span>
              <Slider
                value={[angle]}
                onValueChange={([v]) => setAngle(v)}
                min={10}
                max={80}
                step={1}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={addObservation}
                className="flex-1 gap-2 lab-gradient-bg text-primary-foreground"
              >
                <Play className="w-4 h-4" />
                Add Observation
              </Button>

              <Button
                variant="outline"
                onClick={reset}
                className="flex-1 gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="font-display">
              Calculated Results
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-sm text-muted-foreground">Time of Flight</p>
              <p className="text-xl font-bold text-primary">
                {timeOfFlight.toFixed(2)} s
              </p>

              <p className="text-sm text-muted-foreground mt-4">Maximum Height</p>
              <p className="text-xl font-bold text-primary">
                {maxHeight.toFixed(2)} m
              </p>

              <p className="text-sm text-muted-foreground mt-4">Range</p>
              <p className="text-xl font-bold text-primary">
                {range.toFixed(2)} m
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </div>

      {/* Graph */}
      {observations.length > 0 && (
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="font-display">
              Range vs Angle Graph
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={observations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="angle"
                  label={{ value: "Angle (°)", position: "insideBottom", offset: -5 }}
                />
                <YAxis
                  label={{ value: "Range (m)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="range"
                  stroke="#3B82F6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Observation Table */}
      {observations.length > 0 && (
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="font-display">
              Observation Table
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">S.No</th>
                    <th className="text-left py-3 px-4">Angle (°)</th>
                    <th className="text-left py-3 px-4">Range (m)</th>
                  </tr>
                </thead>
                <tbody>
                  {observations.map((obs, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/50"
                    >
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4 font-mono">{obs.angle}</td>
                      <td className="py-3 px-4 font-mono">
                        {obs.range.toFixed(2)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectileMotionSimulator;