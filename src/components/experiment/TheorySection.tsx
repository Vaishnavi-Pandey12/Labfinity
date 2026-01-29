import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Target, Beaker, Lightbulb, FileText } from "lucide-react";

const TheorySection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Objective */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display">
            <Target className="w-5 h-5 text-primary" />
            Objective
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            To verify the Beer-Lambert Law using a virtual colorimetry experiment by:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
            <li>Identifying the wavelength of maximum absorbance (λmax) for a colored solution</li>
            <li>Fixing the wavelength at λmax</li>
            <li>Varying the concentration of the solution</li>
            <li>Plotting absorbance versus concentration to verify the linear relationship</li>
          </ol>
        </CardContent>
      </Card>

      {/* Theory */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display">
            <BookOpen className="w-5 h-5 text-primary" />
            Theory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Beer-Lambert Law</h4>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Beer-Lambert Law (also known as Beer's Law) describes the relationship between 
              the absorbance of light by a solution and the concentration of the absorbing species.
            </p>
            
            <div className="bg-muted/50 rounded-xl p-6 text-center">
              <p className="text-2xl font-display font-bold text-foreground mb-2">
                A = ε × l × c
              </p>
              <p className="text-sm text-muted-foreground">Beer-Lambert Law Equation</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <h5 className="font-semibold mb-2">Where:</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>A</strong> = Absorbance (no units)</li>
                <li><strong>ε</strong> = Molar absorptivity (L·mol⁻¹·cm⁻¹)</li>
                <li><strong>l</strong> = Path length (cm)</li>
                <li><strong>c</strong> = Concentration (mol/L)</li>
              </ul>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <h5 className="font-semibold mb-2">Key Points:</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Absorbance is directly proportional to concentration</li>
                <li>• The plot of A vs c gives a straight line through origin</li>
                <li>• Slope = ε × l</li>
                <li>• Valid for dilute solutions only</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Colorimetry Principle</h4>
            <p className="text-muted-foreground leading-relaxed">
              A colorimeter measures the amount of light absorbed by a colored solution. 
              When white light passes through a colored solution, certain wavelengths are 
              absorbed while others are transmitted. The wavelength at which maximum 
              absorption occurs is called λmax (lambda max). At this wavelength, the 
              Beer-Lambert Law is most accurately obeyed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Apparatus */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display">
            <Beaker className="w-5 h-5 text-primary" />
            Apparatus Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Colorimeter / Spectrophotometer
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Light source (white light)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Wavelength selector
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Sample holder / Cuvette
              </li>
            </ul>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                Detector
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                Digital display
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                Standard solutions of KMnO₄
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                Graph paper / Plotting software
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Procedure */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display">
            <FileText className="w-5 h-5 text-primary" />
            Procedure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-primary mb-3">Step 1: Determination of λmax</h4>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>• Select a colored solution (e.g., KMnO₄)</li>
                <li>• Keep concentration constant</li>
                <li>• Vary wavelength from 400-700 nm</li>
                <li>• Record absorbance at each wavelength</li>
                <li>• Plot Absorbance vs Wavelength</li>
                <li>• Identify the peak (λmax)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-primary mb-3">Step 2: Fix the Wavelength</h4>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>• Set the wavelength to λmax</li>
                <li>• This ensures maximum sensitivity</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-primary mb-3">Step 3: Verification of Beer-Lambert Law</h4>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>• Prepare solutions of different concentrations</li>
                <li>• Measure absorbance for each concentration</li>
                <li>• Record data in a table</li>
                <li>• Plot Absorbance (Y-axis) vs Concentration (X-axis)</li>
                <li>• A straight line through origin verifies the law</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="glass-card border-0 border-l-4 border-l-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display">
            <Lightbulb className="w-5 h-5 text-accent" />
            Important Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Always use clean cuvettes to avoid contamination</li>
            <li>• Ensure solutions are well-mixed before measurement</li>
            <li>• Deviations from linearity may occur at high concentrations</li>
            <li>• Temperature should be kept constant during the experiment</li>
            <li>• The blank (solvent only) should be used to zero the instrument</li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TheorySection;
