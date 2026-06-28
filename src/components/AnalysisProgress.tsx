// Animated multi-step analysis progress UI. Use as inline panel or full overlay.
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileSearch, Brain, School, Sparkles, CheckCircle2, Loader2 } from "lucide-react";

type Step = { key: string; label: string; sub: string; icon: React.ComponentType<{ className?: string }> };

const STEPS: Step[] = [
  { key: "parse",   label: "Parsing your CV",          sub: "Extracting GPA, courses & activities", icon: FileSearch },
  { key: "score",   label: "Scoring 15 admit factors", sub: "Weighting academics, ECs & impact",    icon: Brain },
  { key: "match",   label: "Matching universities",    sub: "Comparing 200+ programs to your fit",  icon: School },
  { key: "results", label: "Generating results",       sub: "Drafting strengths & next steps",      icon: Sparkles },
];

interface Props {
  /** When true, animation auto-advances through steps. */
  active: boolean;
  /** Render as a fixed full-screen overlay. */
  overlay?: boolean;
  /** Approximate ms to spend on each step before advancing. */
  stepMs?: number;
  /** Optional title above the steps. */
  title?: string;
}

export const AnalysisProgress = ({ active, overlay = false, stepMs = 2400, title }: Props) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!active) { setCurrent(0); return; }
    setCurrent(0);
    const id = setInterval(() => {
      setCurrent((c) => (c < STEPS.length - 1 ? c + 1 : c));
    }, stepMs);
    return () => clearInterval(id);
  }, [active, stepMs]);

  const Inner = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md rounded-3xl border border-border/50 bg-card/95 backdrop-blur-xl p-6 shadow-elevated"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
        </div>
        <div className="min-w-0">
          <p className="font-display font-semibold text-base leading-tight">
            {title ?? "Analyzing your profile"}
          </p>
          <p className="text-xs text-muted-foreground">Usually takes 10–30 seconds</p>
        </div>
      </div>

      <ol className="space-y-2.5">
        {STEPS.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const Icon = s.icon;
          return (
            <li
              key={s.key}
              className={`flex items-start gap-3 rounded-2xl px-3 py-2.5 transition-colors ${
                active ? "bg-primary/5 border border-primary/20" : "border border-transparent"
              }`}
            >
              <div
                className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  done
                    ? "bg-success/15 text-success"
                    : active
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <AnimatePresence mode="wait">
                  {done ? (
                    <motion.span key="d" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                      <CheckCircle2 className="w-4 h-4" />
                    </motion.span>
                  ) : active ? (
                    <motion.span key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    </motion.span>
                  ) : (
                    <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Icon className="w-3.5 h-3.5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium leading-tight ${
                    done ? "text-foreground/70 line-through decoration-success/40" : active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Progress bar */}
      <div className="mt-5 h-1 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${((current + 1) / STEPS.length) * 100}%` }}
          transition={{ ease: "easeOut", duration: 0.6 }}
        />
      </div>
    </motion.div>
  );

  if (!active) return null;

  if (!overlay) {
    return <div className="flex justify-center py-10">{Inner}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-background/70 backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      {Inner}
    </motion.div>
  );
};
