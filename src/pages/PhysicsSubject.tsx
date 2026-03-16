import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Atom,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Orbit,
  Lightbulb,
  Flame,
  Magnet,
  Compass,
  Triangle,
  Sun,
  Clock,
  Thermometer
} from "lucide-react";
import vitapLogo from "@/assets/vitap-logo.png";

const experiments = [
  {
    id: 1,
    title: "projectile motion",
    topic: "Mechanics",
    description: "Study motion, projectile dynamics and Newton's laws through interactive simulations",
    icon: Sparkles,
    difficulty: "Intermediate",
    duration: "40 min",
  },
  {
    id: 2,
    title: "Refraction of light",
    topic: "Optics",
    description: "Explore reflection, refraction and lens systems using ray diagrams",
    icon: Lightbulb,
    difficulty: "Intermediate",
    duration: "35 min",
    featured: false,
  },
  {
    id: 3,
    title: "Gas Laws & Carnot Engine",
    topic: "Thermodynamics",
    description: "Investigate gas laws, thermodynamic cycles and the Carnot engine through interactive simulations",
    icon: Thermometer,
    difficulty: "Intermediate",
    duration: "45 min",
    featured: false,
  },
  {
    id: 4,
    title: "Solar Cell - V-I Characteristics and Fill Factor",
    topic: "Semiconductor Physics",
    description: "Study V-I characteristics of a solar cell and determine its Fill Factor (FF) using an interactive simulator",
    icon: Sun,
    difficulty: "Advanced",
    duration: "50 min",
  },
  {
    id: 5,
    title: "Thermistor - Temperature vs Resistance",
    topic: "Semiconductor Physics",
    description: "Explore the relationship between temperature and resistance in thermistors using interactive simulations",
    icon: Thermometer,
    difficulty: "Intermediate",
    duration: "40 min",
  },
  {
    id: 6,
    title: "Hall Effect - Determining Hall Coefficient",
    topic: "Semiconductor Physics",
    description: "Determine the Hall coefficient of a semiconductor and identify charge carriers using an interactive simulator",
    icon: Magnet,
    difficulty: "Advanced",
    duration: "45 min",
  },
  {
    id: 7,
    title: "Biot–Savart Law - Magnetic Field of a Current-Carrying Coil",
    topic: "Electromagnetism",
    description: "Verify Biot–Savart law and study the magnetic field produced by a circular current carrying coil",
    icon: Compass,
    difficulty: "Intermediate",
    duration: "40 min",
  },
  {
    id: 8,
    title: "Thomson's e/m Experiment",
    topic: "Electron Properties", 
    description: "Determine the charge to mass ratio (e/m) of an electron using Thomson method with interactive simulations",
    icon: Orbit,
    difficulty: "Advanced",
    duration: "50 min",
  },
  {
    id: 9,
    title: "Pendulum - Gravitational Acceleration",
    topic: "Mechanics",   
    description: "Determine acceleration due to gravity using a simple pendulum and interactive simulations",
    icon: Clock,
    difficulty: "Beginner",
    duration: "30 min",
  },
  {
    id: 10,
    title: "Inclined Plane - Force vs Angle",
    topic: "Mechanics",
    description: "Study motion of a body on an inclined plane and verify the relation between force and angle of inclination using interactive simulations",
    icon: Triangle,
    difficulty: "Beginner",
    duration: "35 min",
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

const PhysicsSubject = () => {
  return (
    <div className="min-h-screen bg-background particles-bg">

      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl lab-gradient-bg flex items-center justify-center">
              <Atom className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold lab-gradient-text">
              Labfinity
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/home" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/subjects" className="text-muted-foreground hover:text-primary transition-colors">
              Subjects
            </Link>
            <span className="text-foreground font-medium">Physics</span>
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
          <span className="text-foreground font-medium">Physics</span>
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
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <Atom className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold">Physics</h1>
              <p className="text-lg text-muted-foreground">
                Mechanics, Optics & Interactive Simulations
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
          <h2 className="text-2xl font-display font-bold mb-6">
            Select Experiment
          </h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {experiments.map((exp) => (
              <motion.div key={exp.id} variants={itemVariants}>
                <Link to={`/subjects/physics/experiments/${exp.id}`}>
                  <Card className={`group glass-card border-0 hover-lift cursor-pointer overflow-hidden relative ${exp.featured ? 'ring-2 ring-primary' : ''}`}>

                    {exp.featured && (
                      <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        Featured
                      </div>
                    )}

                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shrink-0">
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
                          <span className="px-2 py-1 rounded-md bg-muted">
                            {exp.difficulty}
                          </span>
                          <span>{exp.duration}</span>
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

export default PhysicsSubject;
