import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, Download, Cpu, Lightbulb } from "lucide-react";
import AbsorbanceGraph from "./AbsorbanceGraph";

// ─── Constants & Data ────────────────────────────────────────────────────────

const k_eV  = 8.617e-5;  // eV/K
const I_mA  = 5;          // constant current in mA

type SampleKey = "germanium" | "silicon";

const sampleDatabase: Record<SampleKey, {
  name: string; Eg_eV: number; R0: number; color: string;
}> = {
  germanium: { name: "Germanium (Ge)", Eg_eV: 0.67, R0: 0.08,  color: "#8b5cf6" },
  silicon:   { name: "Silicon (Si)",   Eg_eV: 1.12, R0: 0.001, color: "#3b82f6" },
};

const calcR = (sample: SampleKey, T_K: number) => {
  const { Eg_eV, R0 } = sampleDatabase[sample];
  return R0 * Math.exp(Eg_eV / (2 * k_eV * T_K));
};

interface Row {
  sNo: number; T_C: number; T_K: number;
  voltage: string; resistance: string;
  invT: string; lnR: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

const FourProbeSimulator = () => {
  const [sample, setSample]   = useState<SampleKey>("germanium");
  const [T_C, setT_C]         = useState(27);
  const [heaterOn, setHeaterOn] = useState(false);
  const [rows, setRows]       = useState<Row[]>([]);
  const [showResults, setShowResults] = useState(false);
  const timerRef              = useRef<ReturnType<typeof setInterval> | null>(null);

  const sd   = sampleDatabase[sample];
  const T_K  = T_C + 273;
  const R    = calcR(sample, T_K);
  const V_mV = parseFloat((R * (I_mA / 1000) * 1000).toFixed(2)); // mV
  const invT = parseFloat((1 / T_K).toFixed(6));
  const lnR  = parseFloat(Math.log(R).toFixed(4));

  // Graph data — ln R vs 1/T
  const graphData = rows.map(r => ({ x: parseFloat(r.invT), y: parseFloat(r.lnR) }));

  // Auto-heat when heater is on
  useEffect(() => {
    if (heaterOn) {
      timerRef.current = setInterval(() => {
        setT_C(t => {
          if (t >= 100) { clearInterval(timerRef.current!); setHeaterOn(false); return t; }
          return t + 1;
        });
      }, 600);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [heaterOn]);

  const recordReading = () => {
    setRows(prev => [
      ...prev,
      {
        sNo: prev.length + 1,
        T_C, T_K,
        voltage: V_mV.toFixed(2),
        resistance: R.toFixed(4),
        invT: invT.toFixed(6),
        lnR: lnR.toFixed(4),
      }
    ]);
    if (rows.length >= 4) setShowResults(true);
  };

  const reset = () => {
    setSample("germanium"); setT_C(27); setHeaterOn(false);
    setRows([]); setShowResults(false);
  };

  const downloadCSV = () => {
    const csv = [
      ["S.No","T (°C)","T (K)","Voltage (mV)","R (Ω)","1/T (K⁻¹)","ln R"],
      ...rows.map(r => [r.sNo, r.T_C, r.T_K, r.voltage, r.resistance, r.invT, r.lnR]),
    ].map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "four_probe_observations.csv";
    a.click();
  };

  // Calculated Eg from slope of ln R vs 1/T
  const calcEg = (() => {
    if (graphData.length < 2) return null;
    const slope = (graphData[graphData.length - 1].y - graphData[0].y)
                / (graphData[graphData.length - 1].x - graphData[0].x);
    return (2 * k_eV * slope).toFixed(4);
  })();

  // Heat glow intensity based on temperature
  const heatIntensity = Math.min((T_C - 27) / 73, 1);

  return (
    <div className="space-y-6">

      {/* ── 1. Controls ── */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display">
            <Cpu className="w-5 h-5 text-primary" />
            Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Semiconductor Sample</label>
            <Select value={sample} onValueChange={v => {
              setSample(v as SampleKey); setHeaterOn(false); setT_C(27); setRows([]); setShowResults(false);
            }}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card z-50">
                {Object.entries(sampleDatabase).map(([k, s]) => (
                  <SelectItem key={k} value={k}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Temperature: {T_C}°C ({T_K} K)</label>
            <Slider value={[T_C]} min={27} max={100} step={1}
              onValueChange={([v]) => { setT_C(v); setHeaterOn(false); }} />
          </div>

          <div className="bg-muted/50 p-4 rounded-xl text-sm space-y-1">
            <p className="font-semibold">{sd.name}</p>
            <p className="text-muted-foreground">Constant current (I): <span className="font-mono">5 mA</span></p>
            <p className="text-muted-foreground">Voltage (V): <span className="font-mono">{V_mV.toFixed(2)} mV</span></p>
            <p className="text-muted-foreground">Resistance (R = V/I): <span className="font-mono">{R.toFixed(4)} Ω</span></p>
            <p className="text-muted-foreground">1/T: <span className="font-mono">{invT.toFixed(6)} K⁻¹</span></p>
            <p className="text-muted-foreground">ln R: <span className="font-mono">{lnR.toFixed(4)}</span></p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setHeaterOn(true)} disabled={heaterOn || T_C >= 100}>
              {heaterOn ? "Heating..." : "Turn Heater ON"}
            </Button>
            <Button onClick={recordReading} variant="outline">Record Reading</Button>
            <Button onClick={downloadCSV} disabled={rows.length === 0} variant="outline">
              <Download className="w-4 h-4 mr-2" />Download CSV
            </Button>
            <Button variant="outline" onClick={reset}><RotateCcw className="w-4 h-4 mr-2" />Reset</Button>
          </div>

        </CardContent>
      </Card>

      {/* ── 2. Apparatus ── */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display">
            <Lightbulb className="w-5 h-5 text-primary" />
            Four-Probe Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-80 bg-[#0f172a] rounded-xl overflow-hidden flex items-center justify-center px-8">

            {/* Top-right display */}
            <div className="absolute top-4 right-4 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2 flex flex-col items-center z-30 min-w-[120px]">
              <span className="text-xs text-slate-400 mb-1">Voltage</span>
              <span className="text-2xl font-bold text-green-400 font-mono tracking-wider">
                {V_mV.toFixed(2)} mV
              </span>
            </div>

            {/* Temperature display — top left */}
            <div className="absolute top-4 left-4 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2 flex flex-col items-center z-30 min-w-[90px]">
              <span className="text-xs text-slate-400 mb-1">Temp</span>
              <span className="text-2xl font-bold font-mono"
                style={{ color: `hsl(${30 - heatIntensity * 30}, 100%, 60%)` }}>
                {T_C}°C
              </span>
            </div>

            <div className="flex flex-col items-center gap-5 w-full relative z-10 mt-6">

              {/* Oven with sample */}
              <motion.div
                className="relative w-56 h-32 rounded-xl border-2 flex flex-col items-center justify-center"
                style={{
                  borderColor: heaterOn ? "#f97316" : "#334155",
                  backgroundColor: "#1e293b",
                }}
                animate={heaterOn ? {
                  boxShadow: [
                    `0 0 15px rgba(249,115,22,${0.1 + heatIntensity * 0.4})`,
                    `0 0 40px rgba(249,115,22,${0.2 + heatIntensity * 0.5})`,
                    `0 0 15px rgba(249,115,22,${0.1 + heatIntensity * 0.4})`,
                  ],
                } : {}}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <p className="text-[10px] text-slate-500 absolute top-2 left-3 font-medium">OVEN</p>

                {/* Four probes */}
                <div className="flex gap-4 items-end mb-1">
                  {[
                    { color: "#eab308", label: "I+" },
                    { color: "#ef4444", label: "V+" },
                    { color: "#ef4444", label: "V−" },
                    { color: "#eab308", label: "I−" },
                  ].map((p, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <motion.div className="w-1 h-8 rounded-full"
                        style={{ backgroundColor: p.color }}
                        animate={heaterOn ? { scaleY: [1, 1.06, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.12 }}
                      />
                      <span className="text-[8px] text-slate-500">{p.label}</span>
                    </div>
                  ))}
                </div>

                {/* Semiconductor wafer */}
                <motion.div
                  className="w-24 h-5 rounded-sm"
                  style={{ backgroundColor: sd.color }}
                  animate={heaterOn ? { opacity: [0.75, 1, 0.75] } : {}}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <p className="text-[10px] text-slate-400 mt-1">{sd.name.split(" ")[0]} Sample</p>

                {/* Heat shimmer overlay */}
                {heaterOn && (
                  <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at 50% 100%, rgba(249,115,22,${heatIntensity * 0.25}) 0%, transparent 70%)`,
                    }}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>

              {/* Meters row */}
              <div className="flex gap-8">
                {/* Ammeter */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-10 bg-slate-800 border border-slate-600 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-mono text-yellow-400">{I_mA} mA</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Ammeter</p>
                </div>

                {/* Voltmeter */}
                <div className="flex flex-col items-center">
                  <motion.div
                    className="w-20 h-10 bg-slate-800 border border-slate-600 rounded-lg flex items-center justify-center"
                    animate={heaterOn ? { borderColor: ["#334155", "#22c55e", "#334155"] } : {}}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    <span className="text-xs font-mono text-green-400">{V_mV.toFixed(2)} mV</span>
                  </motion.div>
                  <p className="text-[10px] text-slate-500 mt-1">Voltmeter</p>
                </div>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Observation Table ── */}
      {rows.length > 0 && (
        <Card className="glass-card border-0">
          <CardHeader><CardTitle className="font-display">Observation Table</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    {["S.No","T (°C)","T (K)","V (mV)","R (Ω)","1/T (K⁻¹)","ln R"].map(h => (
                      <th key={h} className="py-2 text-left text-muted-foreground font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <motion.tr key={r.sNo} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="border-b border-border/30">
                      <td className="py-2">{r.sNo}</td>
                      <td className="py-2 font-mono">{r.T_C}</td>
                      <td className="py-2 font-mono">{r.T_K}</td>
                      <td className="py-2 font-mono">{r.voltage}</td>
                      <td className="py-2 font-mono">{r.resistance}</td>
                      <td className="py-2 font-mono">{r.invT}</td>
                      <td className="py-2 font-mono">{r.lnR}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── 4. Graph ── */}
      <AbsorbanceGraph
        title="ln R vs 1/T Graph"
        subtitle="Slope = Eg / 2k. Heat the sample and record readings across the temperature range."
        data={graphData}
        xLabel="1/T (K⁻¹)"
        yLabel="ln R (Ω)"
        showPoints={true}
        showTrendline={graphData.length >= 2}
        lineColor={sd.color}
      />

      {/* ── 5. Results ── */}
      <AnimatePresence>
        {showResults && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="glass-card border-0">
              <CardHeader><CardTitle className="font-display">Spectral Analysis Results</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Sample Information</h4>
                    <table className="w-full text-sm">
                      <tbody>
                        {[
                          ["Sample",           sd.name],
                          ["Temperature range",`${rows[0].T_C}°C → ${rows[rows.length-1].T_C}°C`],
                          ["Readings recorded", rows.length.toString()],
                          ["Constant current",  `${I_mA} mA`],
                        ].map(([l, v]) => (
                          <tr key={l} className="border-b border-border/50">
                            <td className="py-2 text-muted-foreground">{l}</td>
                            <td className="py-2 font-medium">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Band Gap Determination</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Slope (Δ ln R / Δ(1/T))</p>
                        <p className="font-mono font-semibold text-sm">
                          {graphData.length >= 2
                            ? ((graphData[graphData.length-1].y - graphData[0].y)
                               / (graphData[graphData.length-1].x - graphData[0].x)).toFixed(1) + " K"
                            : "—"}
                        </p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Calculated Eg = 2k × slope</p>
                        <p className="font-mono font-semibold text-sm">{calcEg ?? "—"} eV</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Standard Eg for {sd.name}</p>
                        <p className="font-mono font-semibold text-sm">{sd.Eg_eV} eV</p>
                      </div>
                    </div>
                  </div>
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    ✓ Observations recorded! The linear ln R vs 1/T graph confirms exponential
                    temperature dependence of resistivity. Calculated Eg = {calcEg} eV
                    (standard: {sd.Eg_eV} eV).
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default FourProbeSimulator;
