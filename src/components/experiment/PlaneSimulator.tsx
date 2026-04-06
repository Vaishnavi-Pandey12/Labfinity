import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Pause, Play, RotateCcw, SkipBack, SkipForward, Triangle } from "lucide-react";

type SimState = { t: number; v: number; s: number };
type Step = 1 | 2 | 3 | 4 | 5 | 6;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const rotatePoint = (x: number, y: number, cx: number, cy: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  const dx = x - cx;
  const dy = y - cy;
  return {
    x: cx + dx * Math.cos(a) - dy * Math.sin(a),
    y: cy + dx * Math.sin(a) + dy * Math.cos(a),
  };
};

const InclinedPlaneSimulator = () => {
  const [mass, setMass] = useState(2);
  const [gravity, setGravity] = useState(9.8);
  const [angle, setAngle] = useState(18);
  const [muS, setMuS] = useState(0.45);
  const [muK, setMuK] = useState(0.3);
  const [initialVelocity, setInitialVelocity] = useState(0);
  const [vectorScale, setVectorScale] = useState(6);
  const [step, setStep] = useState<Step>(1);
  const [hangerMass, setHangerMass] = useState(1.5);
  const [measurements, setMeasurements] = useState<Array<{ angle: number; mass: number; force: number; acceleration: number }>>([]);

  const [running, setRunning] = useState(false);
  const [showFBD, setShowFBD] = useState(true);
  const [showComponents, setShowComponents] = useState(true);
  const [showAngle, setShowAngle] = useState(true);
  const [sim, setSim] = useState<SimState>({ t: 0, v: 0, s: 0 });

  const historyRef = useRef<SimState[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  const theta = (angle * Math.PI) / 180;
  const planeLengthPx = 420;
  const blockSize = 38;
  const pxPerMeter = 110;
  const maxDisplacement = Math.max((planeLengthPx - blockSize - 10) / pxPerMeter, 0);
  const slopeOrigin = { x: 145, y: 320 };

  const isStepReady = {
    1: true,
    2: step >= 2,
    3: step >= 3,
    4: step >= 4,
    5: step >= 5,
    6: step >= 6,
  };

  useEffect(() => {
    setMuK((prev) => Math.min(prev, muS));
  }, [muS]);

  const computeForces = useCallback(
    (v: number) => {
      const normal = mass * gravity * Math.cos(theta);
      const parallel = mass * gravity * Math.sin(theta);
      const maxStatic = muS * normal;
      const staticRest = Math.abs(v) < 1e-4 && Math.abs(parallel) <= maxStatic;

      if (staticRest) {
        return {
          normal,
          parallel,
          friction: parallel,
          acceleration: 0,
          staticRest: true,
          kineticDirection: 0,
          weight: mass * gravity,
        };
      }

      const motionDir = Math.abs(v) > 1e-4 ? Math.sign(v) : Math.sign(parallel) || 1;
      const friction = muK * normal * motionDir;
      const acceleration = (parallel - friction) / mass;

      return {
        normal,
        parallel,
        friction,
        acceleration,
        staticRest: false,
        kineticDirection: motionDir,
        weight: mass * gravity,
      };
    },
    [mass, gravity, theta, muS, muK],
  );

  const reset = useCallback(() => {
    setRunning(false);
    setSim({ t: 0, v: initialVelocity, s: 0 });
    setStep(1);
    setHangerMass(1.5);
    setMeasurements([]);
    historyRef.current = [];
    lastRef.current = null;
  }, [initialVelocity]);

  useEffect(() => {
    if (!running) return;

    const frame = (now: number) => {
      if (!lastRef.current) lastRef.current = now;
      const dt = Math.min((now - lastRef.current) / 1000, 1 / 30);
      lastRef.current = now;

      setSim((prev) => {
        historyRef.current.push(prev);
        const forces = computeForces(prev.v);
        let nextV = prev.v + forces.acceleration * dt;
        let nextS = prev.s + nextV * dt;

        if (forces.staticRest && Math.abs(prev.v) < 1e-4) {
          nextV = 0;
          nextS = prev.s;
        }

        if (nextS <= 0 && nextV < 0) {
          nextS = 0;
          nextV = 0;
        }
        if (nextS >= maxDisplacement && nextV > 0) {
          nextS = maxDisplacement;
          nextV = 0;
        }

        return { t: prev.t + dt, v: nextV, s: clamp(nextS, 0, maxDisplacement) };
      });

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [running, computeForces, maxDisplacement]);

  const stepForward = useCallback(() => {
    const dt = 1 / 60;
    setSim((prev) => {
      historyRef.current.push(prev);
      const forces = computeForces(prev.v);
      let nextV = prev.v + forces.acceleration * dt;
      let nextS = prev.s + nextV * dt;
      if (forces.staticRest && Math.abs(prev.v) < 1e-4) {
        nextV = 0;
        nextS = prev.s;
      }
      if (nextS <= 0 && nextV < 0) {
        nextS = 0;
        nextV = 0;
      }
      if (nextS >= maxDisplacement && nextV > 0) {
        nextS = maxDisplacement;
        nextV = 0;
      }
      return { t: prev.t + dt, v: nextV, s: clamp(nextS, 0, maxDisplacement) };
    });
  }, [computeForces, maxDisplacement]);

  const stepBackward = useCallback(() => {
    setRunning(false);
    const last = historyRef.current.pop();
    if (last) setSim(last);
  }, []);

  const forces = useMemo(() => computeForces(sim.v), [computeForces, sim.v]);
  const labAcceleration = ((hangerMass * gravity) - (mass * gravity * Math.sin(theta))) / (mass + hangerMass);
  const hangingY = 250 + sim.s * 90;
  const blockProgressPx = sim.s * pxPerMeter;
  const blockXLocal = planeLengthPx - blockSize - 6 - blockProgressPx;
  const blockCenterBeforeRotate = {
    x: slopeOrigin.x + blockXLocal + blockSize / 2,
    y: slopeOrigin.y - blockSize / 2,
  };
  const blockCenter = rotatePoint(
    blockCenterBeforeRotate.x,
    blockCenterBeforeRotate.y,
    slopeOrigin.x,
    slopeOrigin.y,
    -angle,
  );

  const unitNormal = { x: Math.sin(theta), y: Math.cos(theta) };
  const unitDownSlope = { x: -Math.cos(theta), y: Math.sin(theta) };
  const frictionSign = Math.abs(sim.v) > 1e-4 ? -Math.sign(sim.v) : -Math.sign(forces.parallel || 1);
  const unitFriction = { x: unitDownSlope.x * frictionSign, y: unitDownSlope.y * frictionSign };

  const vectorEnd = (ux: number, uy: number, mag: number) => ({
    x: blockCenter.x + ux * mag * vectorScale,
    y: blockCenter.y + uy * mag * vectorScale,
  });

  const weightEnd = vectorEnd(0, 1, mass * gravity);
  const normalEnd = vectorEnd(unitNormal.x, -unitNormal.y, forces.normal);
  const parallelEnd = vectorEnd(unitDownSlope.x, unitDownSlope.y, Math.abs(forces.parallel));
  const frictionEnd = vectorEnd(unitFriction.x, unitFriction.y, Math.abs(forces.friction));
  const mgSinEnd = vectorEnd(unitDownSlope.x, unitDownSlope.y, Math.abs(forces.parallel) * 0.8);
  const mgCosEnd = vectorEnd(unitNormal.x, -unitNormal.y, forces.normal * 0.8);

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Triangle className="w-5 h-5 text-primary" />
          Inclined Plane with Friction
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex w-full flex-col lg:flex-row gap-6">
          <section className="w-full lg:w-[70%] bg-white/95 border rounded-2xl p-4 md:p-6">
            <div className="relative h-[430px] w-full rounded-xl bg-slate-50 overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-35" />
              <svg viewBox="0 0 760 430" className="relative z-10 w-full h-full">
                <defs>
                  <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 z" fill="currentColor" />
                  </marker>
                </defs>

                <line x1="80" y1="320" x2="720" y2="320" stroke="#94a3b8" strokeDasharray="6 6" strokeWidth="1.5" />
                <rect x="80" y="320" width="620" height="20" rx="3" fill="#78716c" opacity="0.55" />
                <rect x="620" y="320" width="80" height="80" fill="#a8a29e" opacity="0.4" />

                <g transform={`rotate(${-angle} ${slopeOrigin.x} ${slopeOrigin.y})`}>
                  <rect x={slopeOrigin.x} y={slopeOrigin.y - 18} width={planeLengthPx} height={18} rx="4" fill="#b45309" />
                  {isStepReady[2] && (
                    <rect x={slopeOrigin.x + blockXLocal} y={slopeOrigin.y - blockSize} width={blockSize} height={blockSize} rx="5" fill="#64748b" stroke="#334155" strokeWidth="2" />
                  )}
                </g>

                {isStepReady[3] && (
                  <>
                    <circle cx="565" cy="160" r="20" fill="#e2e8f0" stroke="#475569" strokeWidth="3" />
                    <line x1={blockCenter.x} y1={blockCenter.y} x2="565" y2="160" stroke="#1f2937" strokeWidth="2" />
                    <line x1="565" y1="160" x2="565" y2={hangingY} stroke="#1f2937" strokeWidth="2" />
                    <rect x="548" y={hangingY} width="34" height="26" rx="4" fill="#475569" />
                    <text x="565" y={hangingY + 17} textAnchor="middle" fontSize="10" fill="white">{hangerMass.toFixed(1)}kg</text>
                  </>
                )}

                {showAngle && (
                  <>
                    <path d={`M ${slopeOrigin.x + 50} ${slopeOrigin.y} A 50 50 0 0 0 ${slopeOrigin.x + 50 * Math.cos(theta)} ${slopeOrigin.y - 50 * Math.sin(theta)}`} fill="none" stroke="#2563eb" strokeWidth="2" />
                    <text x={slopeOrigin.x + 56} y={slopeOrigin.y - 10} fontSize="13" fill="#1d4ed8">θ = {angle}°</text>
                  </>
                )}

                {showFBD && (
                  <>
                    <line x1={blockCenter.x} y1={blockCenter.y} x2={weightEnd.x} y2={weightEnd.y} stroke="#ef4444" strokeWidth="2.5" markerEnd="url(#arrow)" />
                    <text x={weightEnd.x + 6} y={weightEnd.y + 12} fill="#ef4444" fontSize="12">mg</text>

                    <line x1={blockCenter.x} y1={blockCenter.y} x2={normalEnd.x} y2={normalEnd.y} stroke="#2563eb" strokeWidth="2.5" markerEnd="url(#arrow)" />
                    <text x={normalEnd.x + 6} y={normalEnd.y - 4} fill="#2563eb" fontSize="12">N</text>

                    <line x1={blockCenter.x} y1={blockCenter.y} x2={parallelEnd.x} y2={parallelEnd.y} stroke="#16a34a" strokeWidth="2.5" markerEnd="url(#arrow)" />
                    <text x={parallelEnd.x - 32} y={parallelEnd.y + 14} fill="#16a34a" fontSize="12">mg sinθ</text>

                    <line x1={blockCenter.x} y1={blockCenter.y} x2={frictionEnd.x} y2={frictionEnd.y} stroke="#9333ea" strokeWidth="2.5" markerEnd="url(#arrow)" />
                    <text x={frictionEnd.x - 10} y={frictionEnd.y - 8} fill="#9333ea" fontSize="12">f</text>

                    {showComponents && (
                      <>
                        <line x1={blockCenter.x} y1={blockCenter.y} x2={mgSinEnd.x} y2={mgSinEnd.y} stroke="#22c55e" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#arrow)" />
                        <line x1={blockCenter.x} y1={blockCenter.y} x2={mgCosEnd.x} y2={mgCosEnd.y} stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#arrow)" />
                        <text x={mgCosEnd.x + 6} y={mgCosEnd.y - 2} fill="#0ea5e9" fontSize="12">mg cosθ</text>
                      </>
                    )}
                  </>
                )}
              </svg>
            </div>
          </section>

          <aside className="w-full lg:w-[30%] space-y-4">
            <Card className="border">
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => setRunning(true)} disabled={step < 4}><Play className="w-4 h-4 mr-2" />Start</Button>
                  <Button variant="outline" onClick={() => setRunning(false)} disabled={step < 4}><Pause className="w-4 h-4 mr-2" />Pause</Button>
                  <Button variant="outline" onClick={stepBackward}><SkipBack className="w-4 h-4 mr-2" />Back</Button>
                  <Button variant="outline" onClick={stepForward}><SkipForward className="w-4 h-4 mr-2" />Step</Button>
                </div>
                <Button variant="secondary" className="w-full" onClick={reset}>
                  <RotateCcw className="w-4 h-4 mr-2" />Reset
                </Button>

                <div>
                  <Label>Angle: {angle}°</Label>
                  <Slider value={[angle]} min={0} max={45} step={1} disabled={step !== 1} onValueChange={([v]) => setAngle(v)} />
                </div>
                <div>
                  <Label>Mass: {mass.toFixed(2)} kg</Label>
                  <Slider value={[mass]} min={0.5} max={10} step={0.1} disabled={step < 2} onValueChange={([v]) => setMass(v)} />
                </div>
                <div>
                  <Label>Hanging Mass: {hangerMass.toFixed(2)} kg</Label>
                  <Slider value={[hangerMass]} min={0.5} max={5} step={0.1} disabled={step !== 4} onValueChange={([v]) => setHangerMass(v)} />
                </div>
                <div>
                  <Label>μs: {muS.toFixed(2)}</Label>
                  <Slider value={[muS]} min={0} max={1} step={0.01} onValueChange={([v]) => setMuS(v)} />
                </div>
                <div>
                  <Label>μk: {muK.toFixed(2)}</Label>
                  <Slider value={[muK]} min={0} max={muS} step={0.01} onValueChange={([v]) => setMuK(v)} />
                </div>
                <div>
                  <Label>Initial velocity: {initialVelocity.toFixed(2)} m/s</Label>
                  <Slider value={[initialVelocity]} min={-3} max={4} step={0.05} onValueChange={([v]) => setInitialVelocity(v)} />
                </div>
                <div>
                  <Label>Vector scale: {vectorScale.toFixed(1)}</Label>
                  <Slider value={[vectorScale]} min={2} max={12} step={0.5} onValueChange={([v]) => setVectorScale(v)} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm border rounded-lg p-3 bg-muted/20">
                  <p>t: <span className="font-semibold">{sim.t.toFixed(2)} s</span></p>
                  <p>v: <span className="font-semibold">{sim.v.toFixed(2)} m/s</span></p>
                  <p>a: <span className="font-semibold">{forces.acceleration.toFixed(2)} m/s²</span></p>
                  <p>Δx: <span className="font-semibold">{sim.s.toFixed(2)} m</span></p>
                </div>

                <div className="text-sm space-y-1 border rounded-lg p-3 bg-muted/20">
                  <p>N = mg cosθ = {forces.normal.toFixed(2)} N</p>
                  <p>F∥ = mg sinθ = {forces.parallel.toFixed(2)} N</p>
                  <p>Tension = m₂g = {(hangerMass * gravity).toFixed(2)} N</p>
                  <p>Ff = {Math.abs(forces.friction).toFixed(2)} N</p>
                  <p>a = (m₂g - m₁g sinθ)/(m₁+m₂) = {labAcceleration.toFixed(2)} m/s²</p>
                </div>

                <div className="border rounded-lg p-3 space-y-2 text-sm">
                  {[
                    "1. Set the incline",
                    "2. Place the block",
                    "3. Attach pulley",
                    "4. Adjust weight",
                    "5. Record readings",
                    "6. Repeat",
                  ].map((label, i) => {
                    const s = (i + 1) as Step;
                    const active = step === s;
                    return <p key={label} className={active ? "font-semibold text-primary" : "text-muted-foreground"}>{label}</p>;
                  })}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" disabled={step === 1} onClick={() => setStep((s) => (Math.max(1, (s - 1)) as Step))}>Prev Step</Button>
                    <Button size="sm" disabled={step === 6} onClick={() => setStep((s) => (Math.min(6, (s + 1)) as Step))}>Next Step</Button>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={step !== 5}
                    onClick={() => setMeasurements((prev) => [...prev, { angle, mass: hangerMass, force: forces.parallel, acceleration: labAcceleration }])}
                  >
                    Record
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between border rounded-lg p-2">
                    <Label htmlFor="toggle-fbd">Show Free Body Diagram</Label>
                    <Switch id="toggle-fbd" checked={showFBD} onCheckedChange={setShowFBD} />
                  </div>
                  <div className="flex items-center justify-between border rounded-lg p-2">
                    <Label htmlFor="toggle-components">Show Components</Label>
                    <Switch id="toggle-components" checked={showComponents} onCheckedChange={setShowComponents} />
                  </div>
                  <div className="flex items-center justify-between border rounded-lg p-2">
                    <Label htmlFor="toggle-angle">Show Angle θ</Label>
                    <Switch id="toggle-angle" checked={showAngle} onCheckedChange={setShowAngle} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </CardContent>
    </Card>
  );
};

export default InclinedPlaneSimulator;
