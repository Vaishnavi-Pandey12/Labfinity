import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FlaskConical,
  HelpCircle,
  Play,
} from "lucide-react";
import vitapLogo from "@/assets/vitap-logo.png";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  title: string;
  subjectLabel: string;
  subjectPath?: string; // optional (safe)
  theory: ReactNode;
  procedure: ReactNode;
  simulator: ReactNode;
  observations?: ReactNode;
  quiz?: ReactNode;
}

type TabKey = "theory" | "procedure" | "simulator" | "observations" | "quiz";

type CompletedState = {
  theory: boolean;
  procedure: boolean;
  simulator: boolean;
  observations: boolean;
  quiz: boolean;
};

const EMPTY_COMPLETED: CompletedState = {
  theory: false,
  procedure: false,
  simulator: false,
  observations: false,
  quiz: false,
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
  subjectPath = "/subjects/chemistry", // default fallback
  theory,
  procedure,
  simulator,
  observations,
  quiz,
}: Props) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>("theory");

  const storageKey = useMemo(
    () => toStorageKey(subjectLabel, title),
    [subjectLabel, title]
  );

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
      };
    } catch {
      return EMPTY_COMPLETED;
    }
  });

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const showClassroomOnlyTabs = searchParams.get("fromClassroom") === "1";
  const hasObservations = Boolean(observations) && showClassroomOnlyTabs;
  const hasQuiz = Boolean(quiz) && showClassroomOnlyTabs;

 const availableTabs: TabKey[] = [
  "theory",
  "procedure",
  "simulator",
  ...(hasObservations ? (["observations"] as TabKey[]) : []),
  ...(hasQuiz ? (["quiz"] as TabKey[]) : []),
];

  useEffect(() => {
    setCompleted((prev) => ({
      ...prev,
      [activeTab]: true,
    }));
  }, [activeTab]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(completed));
  }, [completed, storageKey]);

  const completedCount = availableTabs.filter((tab) => completed[tab]).length;
  const progressPercent = Math.round(
    (completedCount / availableTabs.length) * 100
  );

  const experimentName =
    subjectLabel.split("•")[0]?.trim() || "Experiment";

  const subjectDisplay =
    subjectPath.includes("physics") ? "Physics" : "Chemistry";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl lab-gradient-bg flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold lab-gradient-text">
              Labfinity
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/home"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              to={subjectPath}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {subjectDisplay}
            </Link>
            <span className="text-foreground font-medium">
              {experimentName}
            </span>
          </nav>

          <img
            src={vitapLogo}
            alt="VITAP University"
            className="h-10 object-contain"
          />
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm">
          <Link
            to="/home"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <Link
            to={subjectPath}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            {subjectDisplay}
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">
            {experimentName}
          </span>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to={subjectPath}>
            <Button variant="outline" size="sm" className="gap-2 mb-4">
              <ChevronLeft className="w-4 h-4" />
              Back to {subjectDisplay}
            </Button>
          </Link>

          <div>
            <p className="text-sm text-primary font-medium">
              {subjectLabel}
            </p>
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              {title}
            </h1>
          </div>
        </motion.div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} />
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabKey)}
          className="w-full"
        >
          <TabsList className="glass-card p-1 mb-6">
            <TabsTrigger value="theory" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Theory
              {completed.theory && (
                <CheckCircle className="w-4 h-4 text-green-500 ml-1" />
              )}
            </TabsTrigger>

            <TabsTrigger value="procedure" className="gap-2">
              <FlaskConical className="w-4 h-4" />
              Procedure
              {completed.procedure && (
                <CheckCircle className="w-4 h-4 text-green-500 ml-1" />
              )}
            </TabsTrigger>

            <TabsTrigger value="simulator" className="gap-2">
              <Play className="w-4 h-4" />
              Virtual Lab
              {completed.simulator && (
                <CheckCircle className="w-4 h-4 text-green-500 ml-1" />
              )}
            </TabsTrigger>

            {hasObservations && (
              <TabsTrigger value="observations" className="gap-2">
                <ClipboardList className="w-4 h-4" />
                Observations
                {completed.observations && (
                  <CheckCircle className="w-4 h-4 text-green-500 ml-1" />
                )}
              </TabsTrigger>
            )}

            {hasQuiz && (
              <TabsTrigger value="quiz" className="gap-2">
                <HelpCircle className="w-4 h-4" />
                Quiz
                {completed.quiz && (
                  <CheckCircle className="w-4 h-4 text-green-500 ml-1" />
                )}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="theory">{theory}</TabsContent>
          <TabsContent value="procedure">{procedure}</TabsContent>
          <TabsContent value="simulator">{simulator}</TabsContent>

          {hasObservations && (
            <TabsContent value="observations">
              {observations}
            </TabsContent>
          )}

          {hasQuiz && (
            <TabsContent value="quiz">
              {quiz}
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default ExperimentLayout;
