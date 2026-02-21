import { motion } from "framer-motion";

interface ColorimetryApparatusProps {
  isLightOn: boolean;
  wavelength: number;
  solutionColor: string;
  absorbance: number;
  concentration: number;
}

const wavelengthToColor = (wavelength: number): string => {
  if (wavelength >= 380 && wavelength < 440) return "#8B00FF"; // Violet
  if (wavelength >= 440 && wavelength < 490) return "#0000FF"; // Blue
  if (wavelength >= 490 && wavelength < 510) return "#00FFFF"; // Cyan
  if (wavelength >= 510 && wavelength < 580) return "#00FF00"; // Green
  if (wavelength >= 580 && wavelength < 645) return "#FFFF00"; // Yellow
  if (wavelength >= 645 && wavelength < 780) return "#FF0000"; // Red
  return "#CCCCCC"; // Default
};

const ColorimetryApparatus = ({
  isLightOn,
  wavelength,
  solutionColor,
  concentration
}: ColorimetryApparatusProps) => {
  const beamColor = wavelengthToColor(wavelength);

  return (
    <div className="relative h-64 bg-slate-100 rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-8 gap-8">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }}
      />

      {/* Light Source */}
      <div className="relative z-10">
        <div className="w-16 h-20 bg-slate-800 rounded-md shadow-lg flex items-center justify-center relative">
          <div className={`w-8 h-8 rounded-full transition-all duration-300 ${isLightOn ? 'bg-yellow-200 shadow-[0_0_20px_rgba(255,255,0,0.8)]' : 'bg-slate-600'}`} />
          <span className="absolute -bottom-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Source</span>
        </div>
      </div>

      {/* Light Path (Left) */}
      <div className="flex-1 h-32 relative flex items-center">
        {isLightOn && (
          <div
            className="h-2 w-full transition-colors duration-300"
            style={{
              backgroundColor: beamColor,
              boxShadow: `0 0 10px ${beamColor}`,
              opacity: 0.8
            }}
          />
        )}
        {/* Arrow indicating direction */}
        {isLightOn && (
          <div className="absolute right-0 -mt-1 w-0 h-0 border-t-4 border-t-transparent border-l-8 border-b-4 border-b-transparent" style={{ borderLeftColor: beamColor }} />
        )}
      </div>

      {/* Cuvette Holder & Cuvette */}
      <div className="relative z-10 w-24 h-32 flex flex-col items-center">
        <div className="absolute inset-0 border-4 border-slate-300 bg-slate-200/50 rounded-lg transform skew-x-2" />

        {/* Cuvette */}
        <div className="relative w-16 h-28 bg-blue-100/20 glass-effect border border-white/40 shadow-sm overflow-hidden z-20">
          {/* Solution */}
          <motion.div
            className="absolute inset-0 w-full"
            animate={{ height: "85%" }}
            style={{
              bottom: 0,
              top: 'auto',
              backgroundColor: solutionColor,
              opacity: 0.1 + (concentration * 5) // Visual scaling for opacity
            }}
          />
          {/* Light traveling through liquid */}
          {isLightOn && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-full h-2 mix-blend-overlay"
              style={{ backgroundColor: beamColor, opacity: 0.5 }}
            />
          )}
        </div>
        <span className="absolute -bottom-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Cuvette</span>
      </div>

      {/* Light Path (Right - Transmitted) */}
      <div className="flex-1 h-32 relative flex items-center">
        {isLightOn && (
          <div
            className="h-2 w-full transition-colors duration-300"
            style={{
              backgroundColor: beamColor,
              boxShadow: `0 0 5px ${beamColor}`,
              opacity: 0.3 // Dimmer because of absorbance
            }}
          />
        )}
      </div>

      {/* Detector */}
      <div className="relative z-10">
        <div className="w-16 h-20 bg-slate-800 rounded-md shadow-lg flex items-center justify-center border-l-4 border-slate-600">
          <div className={`w-3 h-12 rounded-sm transition-colors duration-200 ${isLightOn ? 'bg-green-400' : 'bg-red-900'}`} />
          <span className="absolute -bottom-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Detector</span>
        </div>
      </div>

    </div>
  );
};

export default ColorimetryApparatus;
