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
