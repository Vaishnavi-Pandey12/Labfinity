<<<<<<< HEAD
import { motion } from "framer-motion";
import { Lightbulb, Eye } from "lucide-react";

interface ColorimetryApparatusProps {
  isLightOn: boolean;
  wavelength: number;
  solutionColor: string;
  absorbance: number;
  concentration: number;
}

const ColorimetryApparatus = ({
  isLightOn,
  wavelength,
  solutionColor,
  absorbance,
  concentration
}: ColorimetryApparatusProps) => {

  // Approximate wavelength to hex color for visualization
  // Only for the beam color
  const getBeamColor = (nm: number) => {
    // Simple hue mapping: 400 (Violet/280) -> 700 (Red/0)
    // 300nm range maps to 280-0 degrees
    const hue = 280 - ((nm - 400) / 300) * 280;
    return `hsl(${hue}, 100%, 50%)`;
  };

  const beamColor = getBeamColor(wavelength);
  // Output intensity based on absorbance (I = I0 * 10^-A)
  // Visualization opacity
  const transmittedOpacity = isLightOn ? Math.max(0.1, Math.pow(10, -absorbance)) : 0;

  return (
    <div className="relative h-64 bg-secondary/20 rounded-xl overflow-hidden flex items-center justify-center p-8">
      {/* Light Source */}
      <div className="flex flex-col items-center gap-2 mr-8 z-10">
        <div className={`p-3 rounded-full ${isLightOn ? 'bg-yellow-100 shadow-[0_0_20px_rgba(253,224,71,0.6)]' : 'bg-muted'}`}>
          <Lightbulb className={`w-8 h-8 ${isLightOn ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
        </div>
        <span className="text-xs font-medium text-muted-foreground">Light Source</span>
      </div>

      {/* Optical Path Container */}
      <div className="relative flex items-center flex-1 h-32 max-w-md">

        {/* Incident Light Beam */}
        <div className="flex-1 h-4 relative overflow-hidden">
          {isLightOn && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              className="h-full"
              style={{ backgroundColor: beamColor, boxShadow: `0 0 10px ${beamColor}` }}
            />
          )}
        </div>

        {/* Cuvette */}
        <div className="relative w-20 h-32 mx-2 z-10">
          <div className="absolute inset-0 border-2 border-white/50 bg-white/10 backdrop-blur-[2px] rounded-sm overflow-hidden flex items-end">
            {/* Solution */}
            <motion.div
              className="w-full"
              style={{ backgroundColor: solutionColor, height: '80%', opacity: 0.5 + (concentration * 5) }} // Visual opacity approx
              initial={{ height: 0 }}
              animate={{ height: '80%' }}
            />
          </div>
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground">Cuvette</span>
        </div>

        {/* Transmitted Light Beam */}
        <div className="flex-1 h-4 relative overflow-hidden">
          {isLightOn && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              className="h-full"
              style={{
                backgroundColor: beamColor,
                opacity: transmittedOpacity,
                boxShadow: `0 0 10px ${beamColor}`
              }}
            />
          )}
        </div>

      </div>

      {/* Detector */}
      <div className="flex flex-col items-center gap-2 ml-8 z-10">
        <div className="w-12 h-16 bg-slate-800 rounded-lg border-2 border-slate-700 flex items-center justify-center relative">
          <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center">
            <Eye className="w-4 h-4 text-emerald-500" />
          </div>
          {isLightOn && (
            <span className="absolute -top-8 bg-black/80 text-emerald-400 font-mono text-xs px-2 py-1 rounded border border-emerald-900">
              {absorbance.toFixed(3)} A
            </span>
          )}
        </div>
        <span className="text-xs font-medium text-muted-foreground">Detector</span>
      </div>
    </div>
  );
};

export default ColorimetryApparatus;
=======
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Scatter, ComposedChart } from "recharts";

interface DataPoint {
  x: number;
  y: number;
}

interface AbsorbanceGraphProps {
  title: string;
  subtitle?: string;
  data: DataPoint[];
  xLabel: string;
  yLabel: string;
  xDomain?: [number, number];
  yDomain?: [number, number];
  highlightX?: number;
  showPoints?: boolean;
  showTrendline?: boolean;
  lineColor?: string;
}

const AbsorbanceGraph = ({
  title,
  subtitle,
  data,
  xLabel,
  yLabel,
  xDomain,
  yDomain,
  highlightX,
  showPoints = false,
  showTrendline = false,
  lineColor = "#3B82F6",
}: AbsorbanceGraphProps) => {
  // Calculate trendline using linear regression
  const trendlineData = useMemo(() => {
    if (!showTrendline || data.length < 2) return [];
    
    const n = data.length;
    const sumX = data.reduce((sum, p) => sum + p.x, 0);
    const sumY = data.reduce((sum, p) => sum + p.y, 0);
    const sumXY = data.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumX2 = data.reduce((sum, p) => sum + p.x * p.x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const minX = Math.min(...data.map(p => p.x));
    const maxX = Math.max(...data.map(p => p.x));
    
    return [
      { x: 0, y: intercept },
      { x: maxX * 1.1, y: slope * maxX * 1.1 + intercept },
    ];
  }, [data, showTrendline]);

  const chartData = data.map(d => ({ ...d, name: d.x.toString() }));
  const trendData = trendlineData.map(d => ({ ...d, name: d.x.toString() }));

  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-lg">{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-64"
        >
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p>No data yet. Start the experiment to see results.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="x" 
                  domain={xDomain}
                  label={{ value: xLabel, position: 'insideBottom', offset: -5, fontSize: 12 }}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  domain={yDomain || [0, 'auto']}
                  label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10, fontSize: 12 }}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelFormatter={(value) => `${xLabel}: ${Number(value).toFixed(2)}`}
                  formatter={(value: number) => [value.toFixed(4), yLabel]}
                />
                
                {/* Main data line */}
                <Line
                  type="monotone"
                  dataKey="y"
                  stroke={lineColor}
                  strokeWidth={2}
                  dot={showPoints}
                  activeDot={{ r: 6, fill: lineColor }}
                />
                
                {/* Scatter points */}
                {showPoints && (
                  <Scatter
                    dataKey="y"
                    fill={lineColor}
                    shape="circle"
                  />
                )}
                
                {/* Highlight current wavelength */}
                {highlightX && (
                  <ReferenceLine
                    x={highlightX}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    label={{
                      value: `λ = ${highlightX}nm`,
                      position: 'top',
                      fill: 'hsl(var(--primary))',
                      fontSize: 11,
                    }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </motion.div>
        
        {/* Trendline equation display */}
        {showTrendline && data.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-muted/50 rounded-lg text-center"
          >
            <p className="text-sm text-muted-foreground">
              Linear Regression: <span className="font-mono font-medium text-foreground">y = mx + c</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              The straight line through origin confirms Beer-Lambert Law
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default AbsorbanceGraph;
>>>>>>> b199b312ad07d7bdf065820936c52dafd40f76d6
