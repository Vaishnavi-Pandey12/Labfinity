import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Triangle, RotateCcw, Play, Pause } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const InclinedPlaneSimulator = () => {
  const [mass, setMass] = useState(2);
  const [angle, setAngle] = useState(20);
  const [gravity, setGravity] = useState(9.8);
  const [muS, setMuS] = useState(0.4);
  const [muK, setMuK] = useState(0.25);
  const [initialVelocity, setInitialVelocity] = useState(0);

  const [time, setTime] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [displacement, setDisplacement] = useState(0);
  const [running, setRunning] = useState(false);

  const [showFBD, setShowFBD] = useState(true);
  const [showComponents, setShowComponents] = useState(true);

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const theta = (angle * Math.PI) / 180;
  const trackLength = 2.4;
  const pxPerMeter = 120;

  const forceSet = useMemo(() => {
    const normal = mass * gravity * Math.cos(theta);
    const parallel = mass * gravity * Math.sin(theta);
    const maxStaticFriction = muS * normal;

    const staticHold = Math.abs(velocity) < 1e-3 && parallel <= maxStaticFriction;
    const friction = staticHold ? parallel : muK * normal;
    const direction = Math.abs(velocity) < 1e-3 ? 1 : Math.sign(velocity);
    const acceleration = staticHold ? 0 : (parallel - friction * direction) / mass;

    return {
      normal,
      parallel,
      friction,
      acceleration,
      weight: mass * gravity,
    };
  }, [mass, gravity, theta, muS, muK, velocity]);

  const reset = useCallback(() => {
    setRunning(false);
    setTime(0);
    setDisplacement(0);
    setVelocity(initialVelocity);
    lastTimeRef.current = null;
  }, [initialVelocity]);

  useEffect(() => {
    setVelocity(initialVelocity);
  }, [initialVelocity]);

  useEffect(() => {
    if (!running) return;

    const tick = (now: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.033);
      lastTimeRef.current = now;

      setVelocity((prevV) => {
        const normal = mass * gravity * Math.cos(theta);
        const parallel = mass * gravity * Math.sin(theta);
        const maxStaticFriction = muS * normal;
        const staticHold = Math.abs(prevV) < 1e-3 && parallel <= maxStaticFriction;
        const friction = staticHold ? parallel : muK * normal;
        const direction = Math.abs(prevV) < 1e-3 ? 1 : Math.sign(prevV);
        const a = staticHold ? 0 : (parallel - friction * direction) / mass;
        const nextV = prevV + a * dt;

        setDisplacement((prevS) => {
          const nextS = Math.max(0, Math.min(trackLength, prevS + nextV * dt));
          return nextS;
        });
        setTime((prevT) => prevT + dt);
        return nextV;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [running, mass, gravity, theta, muS, muK]);

  const displacementPx = displacement * pxPerMeter;
  const x = displacement * Math.cos(theta);
  const y = displacement * Math.sin(theta);

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Triangle className="w-5 h-5 text-primary" />
          Inclined Plane Virtual Lab
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3 bg-white border rounded-xl p-4 md:p-6 min-h-[460px] flex items-center justify-center">
            <div className="relative w-full max-w-[680px] h-[400px]">
              <div className="absolute left-16 right-16 top-[290px] border-t border-dashed border-slate-300" />
              <p className="absolute left-16 top-[300px] text-xs text-muted-foreground">Horizontal reference</p>

              <div className="absolute left-12 top-14 w-16 h-2 rounded-full bg-slate-800" />

              <div
                className="absolute left-20 top-16 origin-top-left"
                style={{ transform: `rotate(${-angle}deg)` }}
              >
                <div className="w-[320px] h-5 rounded bg-amber-700 shadow-md relative">
                  <div
                    className="absolute top-[-18px] w-10 h-10 rounded-md bg-slate-500 border-2 border-slate-700"
                    style={{ left: `${Math.min(displacementPx, 280)}px` }}
                  >
                    {showFBD && (
                      <>
                        <div className="absolute left-1/2 top-1/2 w-[2px] h-12 bg-blue-500 origin-bottom -translate-x-1/2 -translate-y-full rotate-90" />
                        <div className="absolute left-1/2 top-1/2 w-[2px] h-12 bg-red-500 origin-top -translate-x-1/2" />
                        <div className="absolute left-1/2 top-1/2 w-[2px] h-10 bg-green-500 origin-bottom -translate-x-1/2 -translate-y-full" />
                        <div className="absolute left-1/2 top-1/2 w-[2px] h-10 bg-purple-500 origin-bottom -translate-x-1/2 -translate-y-full rotate-180" />
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="absolute right-16 bottom-16 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                θ = {angle}°
              </div>

              {showComponents && (
                <div className="absolute left-4 bottom-4 text-xs bg-background/90 rounded-md p-2 space-y-1 border">
                  <p><span className="font-medium">x:</span> {x.toFixed(2)} m</p>
                  <p><span className="font-medium">y:</span> {y.toFixed(2)} m</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-1/3 space-y-4">
            <Card className="border">
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-2">
                  <Button onClick={() => setRunning(true)} className="flex-1"><Play className="w-4 h-4 mr-2" />Start</Button>
                  <Button variant="outline" onClick={() => setRunning(false)} className="flex-1"><Pause className="w-4 h-4 mr-2" />Pause</Button>
                  <Button variant="outline" onClick={reset}><RotateCcw className="w-4 h-4" /></Button>
                </div>

                <div>
                  <Label>Angle: {angle}°</Label>
                  <Slider value={[angle]} min={0} max={45} step={1} onValueChange={([v]) => setAngle(v)} />
                </div>
                <div>
                  <Label>Mass: {mass.toFixed(1)} kg</Label>
                  <Slider value={[mass]} min={0.5} max={10} step={0.1} onValueChange={([v]) => setMass(v)} />
                </div>
                <div>
                  <Label>μs: {muS.toFixed(2)}</Label>
                  <Slider value={[muS]} min={0} max={1} step={0.01} onValueChange={([v]) => setMuS(v)} />
                </div>
                <div>
                  <Label>μk: {muK.toFixed(2)}</Label>
                  <Slider value={[muK]} min={0} max={1} step={0.01} onValueChange={([v]) => setMuK(v)} />
                </div>
                <div>
                  <Label>Initial velocity: {initialVelocity.toFixed(2)} m/s</Label>
                  <Slider value={[initialVelocity]} min={-2} max={5} step={0.05} onValueChange={([v]) => setInitialVelocity(v)} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm border rounded-lg p-3">
                  <p>t: <span className="font-medium">{time.toFixed(2)} s</span></p>
                  <p>v: <span className="font-medium">{velocity.toFixed(2)} m/s</span></p>
                  <p>a: <span className="font-medium">{forceSet.acceleration.toFixed(2)} m/s²</span></p>
                  <p>Δx: <span className="font-medium">{displacement.toFixed(2)} m</span></p>
                </div>

                <div className="space-y-2 text-sm border rounded-lg p-3">
                  <p>N = mg cosθ = {forceSet.normal.toFixed(2)} N</p>
                  <p>F∥ = mg sinθ = {forceSet.parallel.toFixed(2)} N</p>
                  <p>Ff = {forceSet.friction.toFixed(2)} N</p>
                  <p>a = (F∥ - Ff) / m = {forceSet.acceleration.toFixed(2)} m/s²</p>
                </div>

                <div className="flex items-center justify-between border rounded-lg p-3">
                  <Label htmlFor="show-fbd">Show Free Body Diagram</Label>
                  <Switch id="show-fbd" checked={showFBD} onCheckedChange={setShowFBD} />
                </div>
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <Label htmlFor="show-components">Show Components</Label>
                  <Switch id="show-components" checked={showComponents} onCheckedChange={setShowComponents} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InclinedPlaneSimulator;
