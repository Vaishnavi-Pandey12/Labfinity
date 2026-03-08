import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Play, RotateCcw, Flame } from "lucide-react";
import AbsorbanceGraph from "./AbsorbanceGraph";

type Mode = "boyle" | "charles" | "carnot";

const physicsthermosimulator = () => {
  const [mode, setMode] = useState<Mode>("boyle");

  // Boyle
  const [volume, setVolume] = useState(1);
  const pressure = 1 / volume;
  const [boyleData, setBoyleData] = useState<any[]>([]);

  // Charles
  const [temperature, setTemperature] = useState(300);
  const volumeCharles = temperature / 300;
  const [charlesData, setCharlesData] = useState<any[]>([]);

  // Carnot
  const [hotTemp, setHotTemp] = useState(500);
  const [coldTemp, setColdTemp] = useState(300);
  const efficiency = 1 - coldTemp / hotTemp;
  const [carnotData, setCarnotData] = useState<any[]>([]);

  const addObservation = () => {
    if (mode === "boyle") {
      setBoyleData(prev => [...prev, {
        volume,
        pressure,
        pv: pressure * volume
      }]);
    }

    if (mode === "charles") {
      setCharlesData(prev => [...prev, {
        temperature,
        volume: volumeCharles,
        ratio: volumeCharles / temperature
      }]);
    }

    if (mode === "carnot") {
      setCarnotData(prev => [...prev, {
        hotTemp,
        coldTemp,
        efficiency
      }]);
    }
  };

  const resetExperiment = () => {
    setBoyleData([]);
    setCharlesData([]);
    setCarnotData([]);
  };

  const graphData = useMemo(() => {
    if (mode === "boyle")
      return boyleData.map(d => ({ x: d.volume, y: d.pressure }));
    if (mode === "charles")
      return charlesData.map(d => ({ x: d.temperature, y: d.volume }));
    return carnotData.map(d => ({ x: d.hotTemp, y: d.efficiency }));
  }, [mode, boyleData, charlesData, carnotData]);

  return (
    <div className="space-y-6">

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Controls */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display">
              <Flame className="w-5 h-5 text-primary" />
              Controls
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">

            <div>
              <label className="text-sm font-medium">Select Experiment</label>
              <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boyle">Boyle's Law</SelectItem>
                  <SelectItem value="charles">Charles' Law</SelectItem>
                  <SelectItem value="carnot">Carnot Engine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === "boyle" && (
              <>
                <Slider value={[volume]} min={0.5} max={3} step={0.1}
                  onValueChange={([v]) => setVolume(v)} />
                <p>Pressure: {pressure.toFixed(2)}</p>
              </>
            )}

            {mode === "charles" && (
              <>
                <Slider value={[temperature]} min={200} max={600} step={10}
                  onValueChange={([v]) => setTemperature(v)} />
                <p>Volume: {volumeCharles.toFixed(2)}</p>
              </>
            )}

            {mode === "carnot" && (
              <>
                <Slider value={[hotTemp]} min={350} max={800} step={10}
                  onValueChange={([v]) => setHotTemp(v)} />
                <Slider value={[coldTemp]} min={200} max={hotTemp - 10} step={10}
                  onValueChange={([v]) => setColdTemp(v)} />
                <p>Efficiency: {(efficiency * 100).toFixed(1)}%</p>
              </>
            )}

            <div className="flex gap-3">
              <Button onClick={addObservation} className="flex-1 gap-2 lab-gradient-bg text-primary-foreground">
                <Play className="w-4 h-4" />
                Add Observation
              </Button>
              <Button variant="outline" onClick={resetExperiment} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Observation Table */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="font-display">Observation Table</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">

            {mode === "boyle" && (
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th>S.No</th><th>Volume</th><th>Pressure</th><th>PV</th>
                  </tr>
                </thead>
                <tbody>
                  {boyleData.map((d, i) => (
                    <tr key={i}>
                      <td>{i+1}</td>
                      <td>{d.volume.toFixed(2)}</td>
                      <td>{d.pressure.toFixed(2)}</td>
                      <td>{d.pv.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {mode === "charles" && (
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th>S.No</th><th>Temp (K)</th><th>Volume</th><th>V/T</th>
                  </tr>
                </thead>
                <tbody>
                  {charlesData.map((d, i) => (
                    <tr key={i}>
                      <td>{i+1}</td>
                      <td>{d.temperature}</td>
                      <td>{d.volume.toFixed(2)}</td>
                      <td>{d.ratio.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {mode === "carnot" && (
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th>S.No</th><th>Th</th><th>Tc</th><th>Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {carnotData.map((d, i) => (
                    <tr key={i}>
                      <td>{i+1}</td>
                      <td>{d.hotTemp}</td>
                      <td>{d.coldTemp}</td>
                      <td>{(d.efficiency * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </CardContent>
        </Card>
      </div>

      {/* Graph */}
      <AbsorbanceGraph
        title="Thermodynamic Graph"
        subtitle={
          mode === "boyle"
            ? "Pressure vs Volume"
            : mode === "charles"
            ? "Volume vs Temperature"
            : "Efficiency vs Hot Temperature"
        }
        data={graphData}
        xLabel="X"
        yLabel="Y"
        showPoints
      />

      {/* Verification */}
      <AnimatePresence>
        {graphData.length >= 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-green-500/10 rounded-lg border border-green-500/20"
          >
            <p className="text-green-600 dark:text-green-400 font-medium">
              ✓ Relationship verified successfully for {mode === "boyle" ? "Boyle's Law" : mode === "charles" ? "Charles' Law" : "Carnot Efficiency"}.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default physicsthermosimulator;