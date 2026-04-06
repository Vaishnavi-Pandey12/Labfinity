import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FlaskConical,
  ChevronRight,
  ChevronLeft,
  Beaker,
  Sparkles,
  Lightbulb,
  TestTube2,
  Droplets
} from "lucide-react";
import vitapLogo from "@/assets/vitap-logo.png";

const experiments = [
  {
    id: 1,
    title: "Electrochemistry - EMF Measurement",
    topic: "Electrochemistry",
    description: "Measure EMF of electrochemical cells using Daniell cell, verify Nernst equation",
    icon: Sparkles,
    standard: "Class 12",
    type: "Practical",

  },
  {
    id: 2,
    title: "Beer-Lambert Law - Colorimetry",
    topic: "Colorimetry",
    description: "Verify Beer-Lambert law by measuring absorbance at different concentrations",
    icon: TestTube2,
    standard: "Class 11",
    type: "Analytical",

  },
  {
    id: 3,
    title: "Potentiometric Titration",
    topic: "Potentiometry",
    description: "Perform acid-base, redox, and precipitation titrations",
    icon: Beaker,
    standard: "Class 12",
    type: "Titration",

  },
  {
    id: 4,
    title: "UV-Vis Spectroscopy",
    topic: "Spectroscopy",
    description: "Study electronic transitions and absorption spectra of compounds",
    icon: Lightbulb,
    standard: "Class 12",
    type: "Instrumental",
  },
  {
  id: 5,
  title: "pH-Metry - Determination of Molarity of HCl",
  topic: "pH-Metry",
  description: "Determine the molarity of HCl by pH-metry using standard NaOH solution and plot the titration curve",
  icon: FlaskConical,
  standard: "Class 11",
  type: "Practical",
},
{
  id: 6,
  title: "Acid-Base Titration - Phenolphthalein",
  topic: "Volumetric Analysis",
  description: "Determine the molarity of dilute HCl using standard NaOH with phenolphthalein indicator",
  icon: FlaskConical,
  standard: "Class 11",
  type: "Titration",
},
{ id: 7, title: "Hardness of Water — EDTA & Ion Exchange", 
  topic: "Water Analysis",
  description: "Estimate total hardness by EDTA titration and purify using ion-exchange resin column",
  icon: Droplets,
  standard: "Class 12",
  type: "Water Analysis",
},
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ChemistrySubject = () => {
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedStandard, setSelectedStandard] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  const topics = useMemo(() => ["All", ...new Set(experiments.map((e) => e.topic))], []);
  const standards = useMemo(() => ["All", ...new Set(experiments.map((e) => e.standard))], []);
  const types = useMemo(() => ["All", ...new Set(experiments.map((e) => e.type))], []);

  const filteredExperiments = experiments.filter((exp) =>
    (selectedTopic === "All" || exp.topic === selectedTopic) &&
    (selectedStandard === "All" || exp.standard === selectedStandard) &&
    (selectedType === "All" || exp.type === selectedType),
  );

  return (
    <div className="min-h-screen bg-background particles-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl lab-gradient-bg flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold lab-gradient-text">Labfinity</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/home" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/subjects" className="text-muted-foreground hover:text-primary transition-colors">
              Subjects
            </Link>
            <span className="text-foreground font-medium">Chemistry</span>
          </nav>

          <img src={vitapLogo} alt="VITAP University" className="h-10 object-contain" />
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/home" className="text-muted-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <Link to="/subjects" className="text-muted-foreground hover:text-primary transition-colors">
            Subjects
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">Chemistry</span>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6 mb-8"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <FlaskConical className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold">Chemistry</h1>
              <p className="text-lg text-muted-foreground">
                Electrochemistry, Colorimetry, Spectroscopy & more
              </p>
            </div>
          </motion.div>

          <Link to="/home">
            <Button variant="outline" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </section>

      {/* Experiments Grid */}
      <section className="py-8 pb-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-display font-bold mb-6">Select Experiment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <select className="rounded-md border bg-background px-3 py-2 text-sm" value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
              {topics.map((topic) => <option key={topic} value={topic}>{topic === "All" ? "All Topics" : topic}</option>)}
            </select>
            <select className="rounded-md border bg-background px-3 py-2 text-sm" value={selectedStandard} onChange={(e) => setSelectedStandard(e.target.value)}>
              {standards.map((standard) => <option key={standard} value={standard}>{standard === "All" ? "All Standards" : standard}</option>)}
            </select>
            <select className="rounded-md border bg-background px-3 py-2 text-sm" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              {types.map((type) => <option key={type} value={type}>{type === "All" ? "All Experiment Types" : type}</option>)}
            </select>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filteredExperiments.map((exp) => (
              <motion.div key={exp.id} variants={itemVariants}>
                <Link to={`/subjects/chemistry/experiments/${exp.id}`}>
                  <Card className="group glass-card border-0 hover-lift cursor-pointer overflow-hidden relative">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                          <exp.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-primary font-medium mb-1">
                            Experiment {exp.id} • {exp.topic}
                          </div>
                          <CardTitle className="text-lg font-display group-hover:text-primary transition-colors">
                            {exp.title}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {exp.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ChemistrySubject;
