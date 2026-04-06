import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Play, RotateCcw, Zap, Lightbulb } from "lucide-react";
import AbsorbanceGraph from "./AbsorbanceGraph";

interface DataPoint {
  theta1: number;
  theta2: number;
  sin1: number;
  sin2: number;
}

const mediumMap = {
  Air: 1.0,
  Water: 1.33,
  Glass: 1.5,
  Acrylic: 1.49,
} as const;
type Medium = keyof typeof mediumMap;

const calculateRefraction = (n1: number, n2: number, theta1: number) => {
  const rad = (theta1 * Math.PI) / 180;
  const sinTheta2 = (n1 / n2) * Math.sin(rad);
  if (sinTheta2 > 1) return null;
  return (Math.asin(sinTheta2) * 180) / Math.PI;
};

interface ProtractorProps {
  incidenceX: number;
  incidenceY: number;
}

const Protractor = ({ incidenceX, incidenceY }: ProtractorProps) => {
  const [position, setPosition] = useState({ x: 290, y: 18 });
  const [angle, setAngle] = useState(0);
  const dragState = useRef<{ mode: "drag" | "rotate"; startX: number; startY: number; startAngle: number } | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragState.current) return;
      const active = dragState.current;
      if (active.mode === "drag") {
        setPosition((prev) => ({
          x: prev.x + (e.clientX - active.startX),
          y: prev.y + (e.clientY - active.startY),
        }));
        dragState.current = { ...active, startX: e.clientX, startY: e.clientY };
      } else {
        setAngle(active.startAngle + (e.clientX - active.startX) * 0.5);
      }
    };

    const onUp = () => {
      dragState.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  useEffect(() => {
    const onSnap = () => {
      setPosition({ x: incidenceX - 120, y: incidenceY - 120 });
      setAngle(0);
    };
    window.addEventListener("snap-protractor", onSnap as EventListener);
    return () => window.removeEventListener("snap-protractor", onSnap as EventListener);
  }, [incidenceX, incidenceY]);

  return (
    <div
      className="absolute z-20 cursor-grab active:cursor-grabbing"
      style={{ left: position.x, top: position.y, transform: `rotate(${angle}deg)`, transformOrigin: "120px 120px" }}
      onMouseDown={(e) => {
        e.preventDefault();
        if (e.shiftKey) {
          dragState.current = { mode: "rotate", startX: e.clientX, startY: e.clientY, startAngle: angle };
        } else {
          dragState.current = { mode: "drag", startX: e.clientX, startY: e.clientY, startAngle: angle };
        }
      }}
    >
      <svg width="240" height="132" viewBox="0 0 240 132">
        <path d="M20,120 A100,100 0 0 1 220,120" fill="rgba(253,224,71,0.45)" stroke="#ca8a04" strokeWidth="3" />
        <line x1="20" y1="120" x2="220" y2="120" stroke="#ca8a04" strokeWidth="2" />
        {[...Array(181)].map((_, deg) => {
          const rad = ((180 - deg) * Math.PI) / 180;
          const outerX = 120 + 100 * Math.cos(rad);
          const outerY = 120 - 100 * Math.sin(rad);
          const tickLen = deg % 10 === 0 ? 10 : deg % 5 === 0 ? 6 : 3;
          const innerX = 120 + (100 - tickLen) * Math.cos(rad);
          const innerY = 120 - (100 - tickLen) * Math.sin(rad);
          return <line key={deg} x1={outerX} y1={outerY} x2={innerX} y2={innerY} stroke="#854d0e" strokeWidth={deg % 10 === 0 ? 1.4 : 1} />;
        })}
        {[...Array(19)].map((_, i) => {
          const deg = i * 10;
          const rad = ((180 - deg) * Math.PI) / 180;
          const tx = 120 + 82 * Math.cos(rad);
          const ty = 120 - 82 * Math.sin(rad);
          return <text key={deg} x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#78350f">{deg}</text>;
        })}
        <circle cx="120" cy="120" r="4" fill="#78350f" />
        <line x1="120" y1="120" x2={incidenceX} y2={incidenceY} stroke="#facc15" strokeWidth="1.5" strokeDasharray="4 3" />
      </svg>
    </div>
  );
};

const RefractionSimulator = () => {
  const [medium1, setMedium1] = useState<Medium>("Air");
  const [medium2, setMedium2] = useState<Medium>("Glass");
  const [n1, setN1] = useState(1.0);
  const [n2, setN2] = useState(1.5);
  const [theta1, setTheta1] = useState(30);
  const [showNormal, setShowNormal] = useState(true);
  const [showAngles, setShowAngles] = useState(true);
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
    setMedium1("Air");
    setMedium2("Glass");
    setShowNormal(true);
    setShowAngles(true);
  }, []);

  useEffect(() => {
    setN1(mediumMap[medium1]);
  }, [medium1]);

  useEffect(() => {
    setN2(mediumMap[medium2]);
  }, [medium2]);

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
              <label className="text-sm font-medium">Medium 1</label>
              <select
                value={medium1}
                onChange={(e) => setMedium1(e.target.value as Medium)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {Object.keys(mediumMap).map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Medium 2</label>
              <select
                value={medium2}
                onChange={(e) => setMedium2(e.target.value as Medium)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {Object.keys(mediumMap).map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

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

            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-md border p-2">
                <Label htmlFor="normal-toggle">Show Normal</Label>
                <Switch id="normal-toggle" checked={showNormal} onCheckedChange={setShowNormal} />
              </div>
              <div className="flex items-center justify-between rounded-md border p-2">
                <Label htmlFor="angle-toggle">Show Angles</Label>
                <Switch id="angle-toggle" checked={showAngles} onCheckedChange={setShowAngles} />
              </div>
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
            <div className="relative rounded-xl border bg-slate-50 overflow-hidden h-[320px]">
              <div className="absolute inset-x-0 top-0 h-1/2 bg-sky-100/70" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-cyan-200/40" />
              <svg width="100%" height="100%" viewBox="0 0 420 320">
                <line x1="0" y1="160" x2="420" y2="160" stroke="#64748b" strokeWidth="2.5"/>

                {showNormal && (
                  <line x1="210" y1="35" x2="210" y2="285" stroke="#334155" strokeDasharray="6 6" strokeWidth="1.5" />
                )}

                <line
                  x1="210"
                  y1="160"
                  x2={210 - 130 * Math.sin((theta1 * Math.PI)/180)}
                  y2={160 - 130 * Math.cos((theta1 * Math.PI)/180)}
                  stroke="#ef4444"
                  strokeWidth="3.5"
                />

                {theta2 !== null ? (
                  <line
                    x1="210"
                    y1="160"
                    x2={210 + 130 * Math.sin((theta2 * Math.PI)/180)}
                    y2={160 + 130 * Math.cos((theta2 * Math.PI)/180)}
                    stroke="#ef4444"
                    strokeWidth="3.5"
                  />
                ) : (
                  <line
                    x1="210"
                    y1="160"
                    x2={210 + 130 * Math.sin((theta1 * Math.PI)/180)}
                    y2={160 - 130 * Math.cos((theta1 * Math.PI)/180)}
                    stroke="#ef4444"
                    strokeWidth="3.5"
                    strokeDasharray="8 4"
                  />
                )}

                {showAngles && (
                  <>
                    <path
                      d={`M 210 120 A 40 40 0 0 0 ${210 - 40 * Math.sin((theta1 * Math.PI) / 180)} ${120 + 40 * (1 - Math.cos((theta1 * Math.PI) / 180))}`}
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2"
                    />
                    <text x="156" y="126" fill="#ea580c" fontSize="12">θ₁ {theta1.toFixed(1)}°</text>

                    {theta2 !== null && (
                      <>
                        <path
                          d={`M 210 200 A 40 40 0 0 1 ${210 + 40 * Math.sin((theta2 * Math.PI) / 180)} ${200 - 40 * (1 - Math.cos((theta2 * Math.PI) / 180))}`}
                          fill="none"
                          stroke="#0284c7"
                          strokeWidth="2"
                        />
                        <text x="226" y="223" fill="#0369a1" fontSize="12">θ₂ {theta2.toFixed(1)}°</text>
                      </>
                    )}
                  </>
                )}

                <circle cx="210" cy="160" r="4.2" fill="#0f172a" />
              </svg>

              <Protractor incidenceX={210} incidenceY={160} />
              <Button
                size="sm"
                variant="secondary"
                className="absolute right-3 bottom-3 z-30"
                onClick={() => {
                  const evt = new CustomEvent("snap-protractor");
                  window.dispatchEvent(evt);
                }}
              >
                Snap to Normal
              </Button>
            </div>
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
