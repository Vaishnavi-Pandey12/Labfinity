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
