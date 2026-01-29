import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  FlaskConical, 
  ChevronRight, 
  ChevronLeft,
  BookOpen,
  Sparkles,
  Play
} from "lucide-react";
import vitapLogo from "@/assets/vitap-logo.png";
import ElectrochemistryTheory from "@/components/experiment/ElectrochemistryTheory";
import ElectrochemistrySimulator from "@/components/experiment/ElectrochemistrySimulator";

const Experiment1 = () => {
  const [activeTab, setActiveTab] = useState("theory");

  return (
    <div className="min-h-screen bg-background">
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
            <Link to="/subjects/chemistry" className="text-muted-foreground hover:text-primary transition-colors">
              Chemistry
            </Link>
            <span className="text-foreground font-medium">Experiment 1</span>
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
          <Link to="/subjects/chemistry" className="text-muted-foreground hover:text-primary transition-colors">
            Chemistry
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">Experiment 1</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/subjects/chemistry">
            <Button variant="outline" size="sm" className="gap-2 mb-4">
              <ChevronLeft className="w-4 h-4" />
              Back to Chemistry
            </Button>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-primary font-medium">Experiment 1 • Electrochemistry</p>
              <h1 className="text-2xl md:text-3xl font-display font-bold">
                EMF Measurement - Daniell Cell
              </h1>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="glass-card p-1 mb-6">
            <TabsTrigger 
              value="theory" 
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BookOpen className="w-4 h-4" />
              Theory
            </TabsTrigger>
            <TabsTrigger 
              value="simulator"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Play className="w-4 h-4" />
              Virtual Lab Simulator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="theory" className="mt-0">
            <ElectrochemistryTheory />
          </TabsContent>

          <TabsContent value="simulator" className="mt-0">
            <ElectrochemistrySimulator />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Experiment1;
