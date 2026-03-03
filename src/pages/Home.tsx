import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FlaskConical,
  Atom,
  Microscope,
  Calculator,
  Cpu,
  Bot,
  ChevronRight,
  GraduationCap,
  Users,
  BookOpen,
  LogOut,
  UserCircle
} from "lucide-react";
import vitapLogo from "@/assets/vitap-logo.png";
import { useAuth } from "@/hooks/useAuth";

const subjects = [
  {
    id: "chemistry",
    name: "Chemistry",
    icon: FlaskConical,
    color: "from-blue-500 to-cyan-500",
    description: "Electrochemistry, Colorimetry, Spectroscopy",
    experiments: 25,
  },
  {
    id: "physics",
    name: "Physics",
    icon: Atom,
    color: "from-purple-500 to-pink-500",
    description: "Mechanics, Optics, Modern Physics",
    experiments: 30,
  },
  {
    id: "biology",
    name: "Biology",
    icon: Microscope,
    color: "from-green-500 to-emerald-500",
    description: "Microbiology, Genetics, Ecology",
    experiments: 20,
  },
  {
    id: "maths",
    name: "Mathematics",
    icon: Calculator,
    color: "from-orange-500 to-yellow-500",
    description: "Calculus, Statistics, Algebra",
    experiments: 15,
  },
  {
    id: "electronics",
    name: "Electronics",
    icon: Cpu,
    color: "from-red-500 to-orange-500",
    description: "Circuits, Digital Logic, Microcontrollers",
    experiments: 18,
  },
  {
    id: "robotics",
    name: "Robotics",
    icon: Bot,
    color: "from-indigo-500 to-purple-500",
    description: "Automation, Control Systems, AI",
    experiments: 12,
  },
];

const stats = [
  { icon: BookOpen, value: "120+", label: "Experiments" },
  { icon: Users, value: "10,000+", label: "Students" },
  { icon: GraduationCap, value: "6", label: "Disciplines" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Home = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

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
            <Link to="/home" className="text-foreground font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/subjects" className="text-muted-foreground hover:text-primary transition-colors">
              Subjects
            </Link>
            <Link to="/experiments" className="text-muted-foreground hover:text-primary transition-colors">
              Experiments
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <img
              src={vitapLogo}
              alt="VITAP University"
              className="h-10 object-contain"
            />
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/40">
                  <UserCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{user.username}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="font-semibold px-4 py-2 rounded-lg flex items-center gap-2 border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button className="lab-gradient-bg text-primary-foreground font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
                  <UserCircle className="w-4 h-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      {/* Subjects Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Choose Your Subject
            </h2>
            <p className="text-muted-foreground text-lg">
              Select a discipline to explore virtual experiments
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {subjects.map((subject) => (
              <motion.div key={subject.id} variants={itemVariants}>
                <Link to={`/subjects/${subject.id}`}>
                  <Card className="group glass-card border-0 hover-lift cursor-pointer overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center`}>
                          <subject.icon className="w-7 h-7 text-white" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      <CardTitle className="text-xl font-display mt-4">
                        {subject.name}
                      </CardTitle>
                      <CardDescription>{subject.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="w-4 h-4" />
                        <span>{subject.experiments} Experiments</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>



      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg lab-gradient-bg flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold">Labfinity</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 VIT-AP University. All rights reserved.
          </p>
          <img src={vitapLogo} alt="VITAP" className="h-8 object-contain" />
        </div>
      </footer>
    </div>
  );
};

export default Home;
