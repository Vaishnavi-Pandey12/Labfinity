import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  PlayCircle,
  Trophy,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --------------- types ---------------
interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
}

type Phase = "idle" | "loading" | "active" | "submitted";

interface Props {
  experimentId: number;
}

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

// --------------- helpers ---------------
const scoreColor = (score: number, total: number) => {
  const pct = score / total;
  if (pct >= 0.8) return "text-green-400";
  if (pct >= 0.5) return "text-yellow-400";
  return "text-red-400";
};

const scoreBg = (score: number, total: number) => {
  const pct = score / total;
  if (pct >= 0.8) return "from-green-500/20 to-emerald-500/10 border-green-500/30";
  if (pct >= 0.5) return "from-yellow-500/20 to-amber-500/10 border-yellow-500/30";
  return "from-red-500/20 to-rose-500/10 border-red-500/30";
};

const scoreLabel = (score: number, total: number) => {
  const pct = score / total;
  if (pct >= 0.8) return "Excellent! 🎉";
  if (pct >= 0.5) return "Good effort! 👍";
  return "Keep practising! 💪";
};

// --------------- component ---------------
const QuizSection = ({ experimentId }: Props) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  // ---------- fetch ----------
  const fetchQuestions = async () => {
    setPhase("loading");
    setError(null);
    setSelected({});
    try {
      const res = await fetch(`${API_BASE}/api/quiz/${experimentId}`);
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      setQuestions(data.questions ?? []);
      setPhase("active");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load quiz");
      setPhase("idle");
    }
  };

  // ---------- derived ----------
  const answered = Object.keys(selected).length;
  const allAnswered = answered === questions.length;

  const score = questions.reduce((acc, q) => {
    return acc + (selected[q.id] === q.correct_answer ? 1 : 0);
  }, 0);

  // ============================================================
  //  IDLE / ERROR
  // ============================================================
  if (phase === "idle") {
    return (
      <div className="glass-card border border-border/50 rounded-xl min-h-[320px] flex flex-col items-center justify-center text-center p-8 gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/30 flex items-center justify-center">
          <HelpCircle className="w-10 h-10 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold mb-2">Quiz Section</h2>
          <p className="text-muted-foreground max-w-sm">
            Test your knowledge with <span className="text-primary font-medium">7 random questions</span> from this experiment. Questions are reshuffled every time you start.
          </p>
        </div>
        {error && (
          <p className="text-destructive text-sm bg-destructive/10 px-4 py-2 rounded-lg">
            ⚠️ {error} — make sure the backend is running on port 8000.
          </p>
        )}
        <Button
          size="lg"
          className="gap-2 lab-gradient-bg text-white font-semibold px-8"
          onClick={fetchQuestions}
        >
          <PlayCircle className="w-5 h-5" />
          Start Quiz
        </Button>
      </div>
    );
  }

  // ============================================================
  //  LOADING
  // ============================================================
  if (phase === "loading") {
    return (
      <div className="glass-card border border-border/50 rounded-xl min-h-[320px] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground">Loading questions…</p>
      </div>
    );
  }

  // ============================================================
  //  RESULT (after submit)
  // ============================================================
  if (phase === "submitted") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Score card */}
        <div className={`glass-card border rounded-2xl p-8 bg-gradient-to-br ${scoreBg(score, questions.length)} flex flex-col items-center gap-3`}>
          <Trophy className="w-12 h-12 text-yellow-400 drop-shadow" />
          <p className="text-lg font-semibold text-muted-foreground">{scoreLabel(score, questions.length)}</p>
          <p className={`text-6xl font-display font-black ${scoreColor(score, questions.length)}`}>
            {score} <span className="text-3xl text-muted-foreground font-normal">/ {questions.length}</span>
          </p>
          <Button
            variant="outline"
            className="mt-2 gap-2"
            onClick={fetchQuestions}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>

        {/* Question review */}
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const userAns = selected[q.id];
            const correct = userAns === q.correct_answer;
            return (
              <div
                key={q.id}
                className={`glass-card border rounded-xl p-5 ${correct ? "border-green-500/30" : "border-red-500/30"}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  {correct
                    ? <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    : <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  }
                  <p className="font-medium">
                    <span className="text-primary mr-2">Q{idx + 1}.</span>
                    {q.question}
                  </p>
                </div>
                <div className="ml-8 space-y-1.5 text-sm">
                  {q.options.map((opt) => {
                    const isCorrect = opt === q.correct_answer;
                    const isUserWrong = opt === userAns && !correct;
                    return (
                      <div
                        key={opt}
                        className={`px-3 py-1.5 rounded-lg border ${isCorrect
                            ? "bg-green-500/15 border-green-500/40 text-green-300"
                            : isUserWrong
                              ? "bg-red-500/15 border-red-500/40 text-red-300 line-through"
                              : "border-transparent text-muted-foreground"
                          }`}
                      >
                        {isCorrect && "✓ "}
                        {isUserWrong && "✗ "}
                        {opt}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // ============================================================
  //  ACTIVE — questions
  // ============================================================
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Header row */}
      <div className="flex items-center justify-between glass-card border border-border/50 rounded-xl px-5 py-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{answered}</span>/{questions.length} answered
        </p>
        <Button
          size="sm"
          disabled={!allAnswered}
          className="gap-2 lab-gradient-bg text-white"
          onClick={() => setPhase("submitted")}
        >
          <CheckCircle2 className="w-4 h-4" />
          Submit
        </Button>
      </div>

      {/* Questions */}
      <AnimatePresence initial={false}>
        {questions.map((q, idx) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="glass-card border border-border/50 rounded-xl p-5"
          >
            <p className="font-medium mb-4">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary/15 text-primary text-sm font-bold mr-2 shrink-0">
                {idx + 1}
              </span>
              {q.question}
            </p>

            <div className="space-y-2 ml-9">
              {q.options.map((opt) => {
                const isChosen = selected[q.id] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() =>
                      setSelected((prev) => ({ ...prev, [q.id]: opt }))
                    }
                    className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${isChosen
                        ? "bg-primary/20 border-primary/60 text-primary font-medium shadow-sm"
                        : "border-border/50 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Bottom submit */}
      {questions.length > 0 && (
        <div className="flex justify-center pt-2">
          <Button
            size="lg"
            disabled={!allAnswered}
            className="gap-2 lab-gradient-bg text-white px-10"
            onClick={() => setPhase("submitted")}
          >
            <CheckCircle2 className="w-5 h-5" />
            Submit Quiz
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default QuizSection;
