import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Play,
  Upload,
} from "lucide-react";
import vitapLogo from "@/assets/vitap-logo.png";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  title: string;
  subjectLabel: string;
  theory: ReactNode;
  procedure: ReactNode;
  simulator: ReactNode;
  upload?: ReactNode;
  lockOrder?: boolean;
}

type TabKey = "theory" | "procedure" | "simulator" | "upload";

type CompletedState = {
  theory: boolean;
  procedure: boolean;
  simulator: boolean;
  upload: boolean;
};

const EMPTY_COMPLETED: CompletedState = {
  theory: false,
  procedure: false,
  simulator: false,
  upload: false,
};

const toStorageKey = (subjectLabel: string, title: string) => {
  const identity = `${subjectLabel}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `labfinity-experiment-tabs-${identity}`;
};

const ExperimentLayout = ({
  title,
  subjectLabel,
  theory,
  procedure,
  simulator,
  upload,
  lockOrder = false,
}: Props) => {
  const [activeTab, setActiveTab] = useState<TabKey>("theory");

  const storageKey = useMemo(() => toStorageKey(subjectLabel, title), [subjectLabel, title]);

  const [completed, setCompleted] = useState<CompletedState>(() => {
    if (typeof window === "undefined") {
      return EMPTY_COMPLETED;
    }

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return EMPTY_COMPLETED;
    }

    try {
      return {
        ...EMPTY_COMPLETED,
        ...JSON.parse(raw),
      } as CompletedState;
    } catch {
      return EMPTY_COMPLETED;
    }
  });

  const hasUpload = Boolean(upload);
  const availableTabs: TabKey[] = hasUpload
    ? ["theory", "procedure", "simulator", "upload"]
    : ["theory", "procedure", "simulator"];

  useEffect(() => {
    setCompleted((prev) => ({
      ...prev,
      [activeTab]: true,
    }));
  }, [activeTab]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(completed));
  }, [completed, storageKey]);

  const canOpenSimulator = !lockOrder || completed.procedure;
  const canOpenUpload = !lockOrder || completed.simulator;

  const handleTabChange = (value: string) => {
    const tab = value as TabKey;

    if (tab === "simulator" && !canOpenSimulator) {
      return;
    }

    if (tab === "upload" && !canOpenUpload) {
      return;
    }

    setActiveTab(tab);
  };

  const completedCount = availableTabs.filter((tab) => completed[tab]).length;
  const progressPercent = Math.round((completedCount / availableTabs.length) * 100);
  const experimentName = subjectLabel.split("•")[0]?.trim() || "Experiment";

  return (
    <div className="min-h-screen bg-background">
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
            <span className="text-foreground font-medium">{experimentName}</span>
          </nav>

          <img src={vitapLogo} alt="VITAP University" className="h-10 object-contain" />
        </div>
      </header>

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
          <span className="text-foreground font-medium">{experimentName}</span>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link to="/subjects/chemistry">
            <Button variant="outline" size="sm" className="gap-2 mb-4">
              <ChevronLeft className="w-4 h-4" />
              Back to Chemistry
            </Button>
          </Link>

          <div>
            <p className="text-sm text-primary font-medium">{subjectLabel}</p>
            <h1 className="text-2xl md:text-3xl font-display font-bold">{title}</h1>
          </div>
        </motion.div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} />
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="glass-card p-1 mb-6">
            <TabsTrigger value="theory" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Theory
              {completed.theory && <CheckCircle className="w-4 h-4 text-green-500 ml-1" />}
            </TabsTrigger>

            <TabsTrigger value="procedure" className="gap-2">
              <FlaskConical className="w-4 h-4" />
              Procedure
              {completed.procedure && <CheckCircle className="w-4 h-4 text-green-500 ml-1" />}
            </TabsTrigger>

            <TabsTrigger value="simulator" className="gap-2" disabled={!canOpenSimulator}>
              <Play className="w-4 h-4" />
              Virtual Lab
              {completed.simulator && <CheckCircle className="w-4 h-4 text-green-500 ml-1" />}
            </TabsTrigger>

            {hasUpload && (
              <TabsTrigger value="upload" className="gap-2" disabled={!canOpenUpload}>
                <Upload className="w-4 h-4" />
                Upload Graph
                {completed.upload && <CheckCircle className="w-4 h-4 text-green-500 ml-1" />}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="theory" className="mt-0">
            {theory}
          </TabsContent>

          <TabsContent value="procedure" className="mt-0">
            {procedure}
          </TabsContent>

          <TabsContent value="simulator" className="mt-0">
            {simulator}
          </TabsContent>

          {hasUpload && (
            <TabsContent value="upload" className="mt-0">
              {upload}
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default ExperimentLayout;
