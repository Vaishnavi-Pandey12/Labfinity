import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Pause, Play, RotateCcw, Rocket } from "lucide-react";

type Point = { x: number; y: number };

const ProjectileMotionSimulator = () => {
  const [u, setU] = useState(28);
  const [angle, setAngle] = useState(42);
  const [gravity, setGravity] = useState(9.8);
  const [height, setHeight] = useState(0);

  const [showTrajectory, setShowTrajectory] = useState(true);
  const [showVelocityVector, setShowVelocityVector] = useState(true);
  const [showComponents, setShowComponents] = useState(true);
  const [slowMotion, setSlowMotion] = useState(false);

  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [impactRange, setImpactRange] = useState<number | null>(null);
  const [trajectory, setTrajectory] = useState<Point[]>([]);

  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  const theta = (angle * Math.PI) / 180;
  const ux = u * Math.cos(theta);
  const uy = u * Math.sin(theta);
  const speedScale = slowMotion ? 0.35 : 1;

  const x = ux * time;
  const y = height + uy * time - 0.5 * gravity * time * time;
  const vy = uy - gravity * time;
  const speed = Math.sqrt(ux * ux + vy * vy);

  const tPeak = uy / gravity;
  const yPeak = height + uy * tPeak - 0.5 * gravity * tPeak * tPeak;
  const xPeak = ux * tPeak;

  const reset = useCallback(() => {
    setRunning(false);
    setTime(0);
    setTrajectory([]);
    setImpactRange(null);
    lastRef.current = null;
  }, []);

  const start = useCallback(() => {
    if (impactRange !== null) reset();
    setRunning(true);
  }, [impactRange, reset]);

  useEffect(() => {
    if (!running) return;

    const frame = (now: number) => {
      if (!lastRef.current) lastRef.current = now;
      const dt = Math.min((now - lastRef.current) / 1000, 1 / 30) * speedScale;
      lastRef.current = now;

      setTime((prevT) => {
        const nextT = prevT + dt;
        const nextX = ux * nextT;
        const nextY = height + uy * nextT - 0.5 * gravity * nextT * nextT;

        setTrajectory((prev) => [...prev, { x: nextX, y: Math.max(nextY, 0) }]);

        if (nextY <= 0 && nextT > 0.01) {
          setRunning(false);
          setImpactRange(nextX);
          lastRef.current = null;
          return nextT;
        }
        return nextT;
      });

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [running, ux, uy, gravity, height, speedScale]);

  const sim = useMemo(() => {
    const scale = 8;
    const originX = 80;
    const groundY = 360;
    const ballX = originX + x * scale;
    const ballY = groundY - Math.max(y, 0) * scale;

    const points = trajectory
      .map((p) => `${originX + p.x * scale},${groundY - p.y * scale}`)
      .join(" ");

    return { scale, originX, groundY, ballX, ballY, points };
  }, [x, y, trajectory]);

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-primary" />
          Projectile Motion Virtual Lab
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex w-full flex-col lg:flex-row gap-6">
          <section className="w-full lg:w-[70%] border rounded-2xl bg-white/95 p-4 md:p-6">
            <div className="relative h-[430px] rounded-xl overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-slate-100">
              <div className="absolute top-5 right-6 flex gap-3 opacity-80">
                <div className="w-12 h-6 bg-white rounded-full" />
                <div className="w-16 h-7 bg-white rounded-full" />
              </div>
              <div className="absolute left-16 bottom-0 right-0 h-20 bg-gradient-to-t from-green-500 to-green-400" />

              <svg viewBox="0 0 760 430" className="relative z-10 w-full h-full">
                <defs>
                  <marker id="arrow-projectile" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 z" fill="currentColor" />
                  </marker>
                </defs>

                <line x1="40" y1={sim.groundY} x2="740" y2={sim.groundY} stroke="#166534" strokeWidth="2" />
                <circle cx={sim.originX} cy={sim.groundY - height * sim.scale} r="6" fill="#1e293b" />

                <line
                  x1={sim.originX}
                  y1={sim.groundY - height * sim.scale}
                  x2={sim.originX + 52 * Math.cos(theta)}
                  y2={sim.groundY - height * sim.scale - 52 * Math.sin(theta)}
                  stroke="#0f172a"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                <path
                  d={`M ${sim.originX + 26} ${sim.groundY - height * sim.scale} A 24 24 0 0 0 ${sim.originX + 26 * Math.cos(theta)} ${sim.groundY - height * sim.scale - 26 * Math.sin(theta)}`}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                />
                <text x={sim.originX + 24} y={sim.groundY - height * sim.scale - 30} fill="#2563eb" fontSize="12">
                  θ={angle}°
                </text>

                {showTrajectory && trajectory.length > 1 && (
                  <polyline points={sim.points} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
                )}

                {tPeak > 0 && yPeak > 0 && (
                  <>
                    <circle cx={sim.originX + xPeak * sim.scale} cy={sim.groundY - yPeak * sim.scale} r="4" fill="#f59e0b" />
                    <text x={sim.originX + xPeak * sim.scale + 8} y={sim.groundY - yPeak * sim.scale - 6} fill="#b45309" fontSize="12">
                      Hmax
                    </text>
                  </>
                )}

                <circle cx={sim.ballX} cy={sim.ballY} r="9" fill="#ef4444" stroke="#7f1d1d" strokeWidth="2" />

                {showVelocityVector && (
                  <>
                    <line
                      x1={sim.ballX}
                      y1={sim.ballY}
                      x2={sim.ballX + (ux * 0.85)}
                      y2={sim.ballY - (vy * 0.85)}
                      stroke="#dc2626"
                      strokeWidth="2.5"
                      markerEnd="url(#arrow-projectile)"
                    />
                    <text x={sim.ballX + ux * 0.85 + 6} y={sim.ballY - vy * 0.85} fill="#dc2626" fontSize="12">
                      v
                    </text>
                  </>
                )}

                {showComponents && (
                  <>
                    <line x1={sim.ballX} y1={sim.ballY} x2={sim.ballX + ux * 0.85} y2={sim.ballY} stroke="#16a34a" strokeWidth="2" markerEnd="url(#arrow-projectile)" />
                    <line x1={sim.ballX} y1={sim.ballY} x2={sim.ballX} y2={sim.ballY - vy * 0.85} stroke="#9333ea" strokeWidth="2" markerEnd="url(#arrow-projectile)" />
                    <text x={sim.ballX + ux * 0.85 + 4} y={sim.ballY - 4} fill="#15803d" fontSize="12">vx</text>
                    <text x={sim.ballX + 4} y={sim.ballY - vy * 0.85 - 4} fill="#7e22ce" fontSize="12">vy</text>
                  </>
                )}

                {impactRange !== null && (
                  <>
                    <circle cx={sim.originX + impactRange * sim.scale} cy={sim.groundY} r="6" fill="#f59e0b" />
                    <text x={sim.originX + impactRange * sim.scale + 8} y={sim.groundY - 8} fill="#b45309" fontSize="12">
                      B ({impactRange.toFixed(2)} m)
                    </text>
                  </>
                )}
              </svg>
            </div>
          </section>

          <aside className="w-full lg:w-[30%] space-y-4">
            <Card className="border">
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <Button onClick={start}><Play className="w-4 h-4 mr-2" />Start</Button>
                  <Button variant="outline" onClick={() => setRunning(false)}><Pause className="w-4 h-4 mr-2" />Pause</Button>
                  <Button variant="secondary" onClick={reset}><RotateCcw className="w-4 h-4 mr-2" />Reset</Button>
                </div>

                <div>
                  <Label>Initial velocity (u): {u.toFixed(1)} m/s</Label>
                  <Slider value={[u]} min={5} max={80} step={0.5} onValueChange={([v]) => setU(v)} />
                </div>
                <div>
                  <Label>Angle (θ): {angle}°</Label>
                  <Slider value={[angle]} min={5} max={85} step={1} onValueChange={([v]) => setAngle(v)} />
                </div>
                <div>
                  <Label>Gravity (g): {gravity.toFixed(2)} m/s²</Label>
                  <Slider value={[gravity]} min={1.6} max={24.8} step={0.1} onValueChange={([v]) => setGravity(v)} />
                </div>
                <div>
                  <Label>Launch height: {height.toFixed(1)} m</Label>
                  <Slider value={[height]} min={0} max={20} step={0.5} onValueChange={([v]) => setHeight(v)} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between border rounded-lg p-2">
                    <Label htmlFor="trajectory-toggle">Show trajectory</Label>
                    <Switch id="trajectory-toggle" checked={showTrajectory} onCheckedChange={setShowTrajectory} />
                  </div>
                  <div className="flex items-center justify-between border rounded-lg p-2">
                    <Label htmlFor="velocity-toggle">Show velocity vector</Label>
                    <Switch id="velocity-toggle" checked={showVelocityVector} onCheckedChange={setShowVelocityVector} />
                  </div>
                  <div className="flex items-center justify-between border rounded-lg p-2">
                    <Label htmlFor="component-toggle">Show components (vx, vy)</Label>
                    <Switch id="component-toggle" checked={showComponents} onCheckedChange={setShowComponents} />
                  </div>
                  <div className="flex items-center justify-between border rounded-lg p-2">
                    <Label htmlFor="slow-toggle">Slow motion</Label>
                    <Switch id="slow-toggle" checked={slowMotion} onCheckedChange={setSlowMotion} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border rounded-lg p-3 text-sm bg-muted/20">
                  <p>t: <span className="font-semibold">{time.toFixed(2)} s</span></p>
                  <p>Range: <span className="font-semibold">{x.toFixed(2)} m</span></p>
                  <p>Height: <span className="font-semibold">{Math.max(y, 0).toFixed(2)} m</span></p>
                  <p>Speed: <span className="font-semibold">{speed.toFixed(2)} m/s</span></p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectileMotionSimulator;
