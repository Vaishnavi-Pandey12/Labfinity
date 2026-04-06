import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flame, Snowflake } from "lucide-react";
import AbsorbanceGraph from "./AbsorbanceGraph";

type Mode = "gas" | "carnot";
type Constraint = "none" | "pressure" | "volume" | "temperature";
type Observation = { t: number; v: number; p: number };

type Particle = { x: number; y: number; vx: number; vy: number };

const PARTICLE_COUNT = 36;
const R = 0.0821;
const N_MOL = 1;

const PhysicsThermoSimulator = () => {
  const [mode, setMode] = useState<Mode>("gas");
  const [temperature, setTemperature] = useState(320);
  const [volume, setVolume] = useState(3.5);
  const [constraint, setConstraint] = useState<Constraint>("none");
  const [carnotMode, setCarnotMode] = useState(false);

  const [hotTemp, setHotTemp] = useState(600);
  const [coldTemp, setColdTemp] = useState(300);
  const [observations, setObservations] = useState<Observation[]>([]);

  const particlesRef = useRef<Particle[]>(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      x: 20 + Math.random() * 160,
      y: 20 + Math.random() * 220,
      vx: (Math.random() * 2 - 1) * 1.2,
      vy: (Math.random() * 2 - 1) * 1.2,
    })),
  );
  const [, setTick] = useState(0);
  const rafRef = useRef<number | null>(null);
  const targetPressureRef = useRef((N_MOL * R * temperature) / volume);

  const pressure = useMemo(() => (N_MOL * R * temperature) / volume, [temperature, volume]);
  const pistonTop = useMemo(() => 290 - volume * 55, [volume]);
  const efficiency = useMemo(() => 1 - coldTemp / hotTemp, [hotTemp, coldTemp]);

  useEffect(() => {
    if (constraint === "pressure") {
      setVolume((N_MOL * R * temperature) / targetPressureRef.current);
    } else if (constraint === "volume") {
      setTemperature((targetPressureRef.current * volume) / (N_MOL * R));
    } else if (constraint === "temperature") {
      setVolume((N_MOL * R * temperature) / pressure);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temperature, volume, constraint]);

  useEffect(() => {
    const animate = () => {
      const width = 170;
      const height = Math.max(40, volume * 60);
      const tempSpeed = Math.max(0.4, (temperature - 150) / 220);
      for (const p of particlesRef.current) {
        p.x += p.vx * tempSpeed;
        p.y += p.vy * tempSpeed;
        if (p.x < 4 || p.x > width - 4) p.vx *= -1;
        if (p.y < 4 || p.y > height - 4) p.vy *= -1;
        p.x = Math.min(width - 4, Math.max(4, p.x));
        p.y = Math.min(height - 4, Math.max(4, p.y));
      }
      setTick((t) => t + 1);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [temperature, volume]);

  const addObservation = () => {
    setObservations((prev) => [...prev, { t: temperature, v: volume, p: pressure }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="glass-card border-0 lg:w-[70%]">
          <CardHeader>
            <CardTitle className="text-center">Gas Laws + Carnot Engine Virtual Lab</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-[430px] rounded-xl border bg-slate-50 overflow-hidden flex items-center justify-center">
              {carnotMode && (
                <>
                  <div className="absolute left-6 bottom-6 flex items-center gap-2 text-orange-600 font-medium">
                    <Flame className="w-5 h-5" /> Hot Source
                  </div>
                  <div className="absolute right-6 top-6 flex items-center gap-2 text-sky-600 font-medium">
                    <Snowflake className="w-5 h-5" /> Cold Sink
                  </div>
                  <div className="absolute inset-x-0 top-0 h-16 bg-blue-100/60" />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-orange-100/60" />
                </>
              )}

              <div className="relative w-[220px] h-[330px] border-[4px] border-slate-700 rounded-b-xl bg-white">
                <motion.div
                  className="absolute left-0 right-0 h-6 bg-slate-500 border-y-2 border-slate-700"
                  animate={{ top: pistonTop }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                />

                <div
                  className="absolute left-6 right-6 bottom-0 bg-sky-100/70 border-t border-sky-400 rounded-t-sm overflow-hidden"
                  style={{ height: `${Math.max(40, volume * 60)}px` }}
                >
                  {particlesRef.current.map((p, i) => (
                    <div
                      key={i}
                      className="absolute w-1.5 h-1.5 rounded-full bg-sky-600"
                      style={{ left: `${p.x}px`, top: `${p.y}px` }}
                    />
                  ))}
                </div>
              </div>

              <div className="absolute left-6 top-20 w-14 h-52 rounded-full border-4 border-slate-300 bg-white">
                <div
                  className="absolute bottom-1 left-1 right-1 bg-red-500 rounded-full"
                  style={{ height: `${Math.min(200, ((temperature - 150) / 650) * 200)}px` }}
                />
                <p className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-medium">Thermometer</p>
              </div>

              <div className="absolute right-6 top-24 w-24 h-24 rounded-full border-4 border-slate-600 bg-white flex items-center justify-center">
                <div
                  className="absolute w-1 h-10 bg-slate-700 origin-bottom"
                  style={{ transform: `translateY(-10px) rotate(${Math.min(135, Math.max(-135, pressure * 30 - 60))}deg)` }}
                />
                <span className="text-xs font-medium mt-12">P Gauge</span>
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 border rounded-md px-3 py-1 text-sm">
                P = {pressure.toFixed(2)} atm, V = {volume.toFixed(2)} L, T = {temperature.toFixed(0)} K
              </div>

              {carnotMode && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary/10 border rounded-md px-3 py-1 text-sm font-semibold">
                  η = 1 - Tc/Th = {(efficiency * 100).toFixed(1)}%
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 lg:w-[30%]">
          <CardHeader>
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Mode</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gas">Gas Laws</SelectItem>
                  <SelectItem value="carnot">Carnot Engine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Constraint</Label>
              <Select
                value={constraint}
                onValueChange={(v) => {
                  setConstraint(v as Constraint);
                  targetPressureRef.current = pressure;
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Free</SelectItem>
                  <SelectItem value="pressure">Constant Pressure</SelectItem>
                  <SelectItem value="volume">Constant Volume</SelectItem>
                  <SelectItem value="temperature">Constant Temperature</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Temperature: {temperature.toFixed(0)} K</Label>
              <Slider value={[temperature]} min={150} max={800} step={5} onValueChange={([v]) => setTemperature(v)} />
            </div>
            <div>
              <Label>Volume: {volume.toFixed(2)} L</Label>
              <Slider value={[volume]} min={1.2} max={5} step={0.05} onValueChange={([v]) => setVolume(v)} />
            </div>
            <div>
              <Label>Pressure: {pressure.toFixed(2)} atm</Label>
              <div className="h-2 rounded bg-muted"><div className="h-2 rounded bg-primary" style={{ width: `${Math.min(100, pressure * 12)}%` }} /></div>
            </div>

            <div className="flex items-center justify-between border rounded-md p-2">
              <Label htmlFor="carnot-toggle">Carnot Engine Mode</Label>
              <Switch
                id="carnot-toggle"
                checked={carnotMode || mode === "carnot"}
                onCheckedChange={(v) => {
                  setCarnotMode(v);
                  if (v) setMode("carnot");
                }}
              />
            </div>

            {(mode === "carnot" || carnotMode) && (
              <>
                <div>
                  <Label>Hot Reservoir Th: {hotTemp} K</Label>
                  <Slider value={[hotTemp]} min={350} max={900} step={5} onValueChange={([v]) => setHotTemp(v)} />
                </div>
                <div>
                  <Label>Cold Reservoir Tc: {coldTemp} K</Label>
                  <Slider value={[coldTemp]} min={150} max={hotTemp - 10} step={5} onValueChange={([v]) => setColdTemp(v)} />
                </div>
              </>
            )}

            <motion.button whileTap={{ scale: 0.97 }} className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium" onClick={addObservation}>
              Add Observation
            </motion.button>
          </CardContent>
        </Card>
      </div>

      <AbsorbanceGraph
        title="Gas Law Response"
        subtitle="Pressure vs Volume observations"
        data={observations.map((o) => ({ x: o.v, y: o.p }))}
        xLabel="Volume (L)"
        yLabel="Pressure (atm)"
        showPoints
        lineColor="#0ea5e9"
      />
    </div>
  );
};

export default PhysicsThermoSimulator;
