import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  User,
  GraduationCap,
  ListChecks,
} from "lucide-react";
import { computeCompleteness } from "@/lib/profileCompleteness";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PAGE_VISIT_EVENT } from "@/hooks/usePageVisitTracker";

interface JourneyStepperProps {
  profile: any;
  hasAnalysis: boolean;
  hasMatches: boolean;
  hasApplications: boolean;
  /** Optional: name of strongest match to show in Stage 2 */
  topMatchName?: string;
  topMatchRange?: string;
  /** Optional: number of next steps to show on Stage 3 */
  pendingActions?: number;
}

type StageStatus = "done" | "current" | "locked";

interface Stage {
  id: 1 | 2 | 3;
  label: string;
  headline: string;
  detail: string;
  cta: string;
  path: string;
  icon: typeof User;
  status: StageStatus;
}

/**
 * 3-stage journey: Profile → Chances → Next Steps
 * Single promise: "See your real chances. Do the exact next step. Get into a top university."
 */
export const JourneyStepper = ({
  profile,
  hasMatches,
  topMatchName,
  topMatchRange,
  pendingActions,
}: JourneyStepperProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const completeness = computeCompleteness(profile);
  const profileDone = completeness.hasAllRequired;

  // Track which dashboard routes the student has actually opened.
  // Once visited, the corresponding stage is marked "done" — even if the
  // underlying data (matches, actions) hasn't been generated yet.
  const [visitedRoutes, setVisitedRoutes] = useState<Set<string>>(new Set());
  // Routes that count toward each stage. Visiting ANY of these marks the stage done.
  const STAGE2_ROUTES = ["/dashboard/matches", "/dashboard/checker", "/dashboard/compare", "/dashboard/fitmatrix"];
  const STAGE3_ROUTES = ["/dashboard/action-center", "/dashboard/programs", "/dashboard/deadlines", "/dashboard/roadmap", "/dashboard/progress"];
  const TRACKED = ["/dashboard/profile", ...STAGE2_ROUTES, ...STAGE3_ROUTES];
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    supabase
      .from("page_visits")
      .select("route")
      .eq("user_id", user.id)
      .in("route", TRACKED)
      .then(({ data }) => {
        if (cancelled || !data) return;
        setVisitedRoutes(new Set(data.map((r: { route: string }) => r.route)));
      });

    // Update instantly when the user navigates to one of the tracked routes,
    // without waiting for a refetch.
    const handler = (e: Event) => {
      const route = (e as CustomEvent<{ route: string }>).detail?.route;
      if (route && TRACKED.includes(route)) {
        setVisitedRoutes(prev => {
          if (prev.has(route)) return prev;
          const next = new Set(prev);
          next.add(route);
          return next;
        });
      }
    };
    window.addEventListener(PAGE_VISIT_EVENT, handler);
    return () => {
      cancelled = true;
      window.removeEventListener(PAGE_VISIT_EVENT, handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const visitedMatches = STAGE2_ROUTES.some(r => visitedRoutes.has(r));
  const visitedActions = STAGE3_ROUTES.some(r => visitedRoutes.has(r));

  const stages: Stage[] = [
    {
      id: 1,
      label: "Profile",
      headline: profileDone ? "Profile ready" : "Finish your profile",
      detail: profileDone
        ? `${completeness.percent}% complete · ${completeness.filledCount}/${completeness.totalCount} fields`
        : `${completeness.percent}% complete — add GPA & activities to unlock chances`,
      cta: profileDone ? "Edit profile" : "Finish Profile",
      path: "/dashboard/profile",
      icon: User,
      status: profileDone ? "done" : "current",
    },
    {
      id: 2,
      label: "Your Chances",
      headline: hasMatches && topMatchName
        ? `Strongest fit: ${topMatchName}`
        : hasMatches
          ? "Your matches are ready"
          : "See where you can get in",
      detail: hasMatches && topMatchRange
        ? `Alignment range ${topMatchRange} — see all your matches grouped by country`
        : hasMatches
          ? "Verified matches grouped by Safe / Match / Reach"
          : "Compared against verified university admit data",
      cta: hasMatches || visitedMatches ? "See All Matches" : "See My Chances",
      path: "/dashboard/matches",
      icon: GraduationCap,
      status: !profileDone
        ? "locked"
        : hasMatches || visitedMatches
          ? "done"
          : "current",
    },
    {
      id: 3,
      label: "Next Steps",
      headline: pendingActions && pendingActions > 0
        ? `${pendingActions} action${pendingActions === 1 ? "" : "s"} waiting`
        : "Your action plan",
      detail: pendingActions && pendingActions > 0
        ? "Ranked by impact — do the most important first"
        : "The exact steps that move your chances upward",
      cta: "Open Action Center",
      path: "/dashboard/action-center",
      icon: ListChecks,
      status: !profileDone
        ? "locked"
        : pendingActions === 0 || visitedActions
          ? "done"
          : "current",
    },
  ];

  const currentStage = stages.find((s) => s.status === "current") ?? stages[0];
  const completedCount = stages.filter((s) => s.status === "done").length;
  const overallPct = Math.round((completedCount / stages.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <Card className="overflow-hidden border-primary/30 shadow-card">
        <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
        <CardContent className="p-5 sm:p-7 space-y-5">
          {/* Header — the one promise */}
          <div className="space-y-1.5">
            <p className="text-xs uppercase tracking-wider text-primary font-semibold">
              Your Path
            </p>
            <h2 className="text-xl sm:text-2xl font-display font-bold leading-tight">
              See your real chances. Do the exact next step.
            </h2>
            <div className="flex items-center justify-between gap-3 pt-1">
              <Progress value={overallPct} className="h-1.5 flex-1" />
              <span className="text-xs text-muted-foreground font-medium shrink-0">
                {completedCount} / {stages.length}
              </span>
            </div>
          </div>

          {/* Three stages */}
          <div className="grid gap-3 md:grid-cols-3">
            {stages.map((stage) => {
              const isDone = stage.status === "done";
              const isLocked = stage.status === "locked";
              const isCurrent = stage.status === "current";
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => !isLocked && navigate(stage.path)}
                  disabled={isLocked}
                  className={`text-left rounded-xl border-2 p-4 transition-all flex flex-col gap-2 group ${
                    isCurrent
                      ? "border-primary bg-primary/5 shadow-sm"
                      : isDone
                        ? "border-success/40 bg-success/5 hover:border-success/60"
                        : isLocked
                          ? "border-border/30 bg-muted/30 opacity-60 cursor-not-allowed"
                          : "border-border/40 hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isCurrent ? "bg-primary text-primary-foreground" :
                      isDone ? "bg-success/20 text-success" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      <stage.icon className="w-4 h-4" />
                    </div>
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Circle className={`w-5 h-5 ${isCurrent ? "text-primary" : "text-muted-foreground/40"}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Stage {stage.id} · {stage.label}
                    </p>
                    <h3 className="text-sm font-bold text-foreground leading-tight mt-0.5 line-clamp-2">
                      {stage.headline}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                      {stage.detail}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Primary CTA — what to do RIGHT NOW */}
          <Button
            size="lg"
            onClick={() => navigate(currentStage.path)}
            className="w-full gap-2 rounded-xl shadow-md"
          >
            {currentStage.cta}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default JourneyStepper;
