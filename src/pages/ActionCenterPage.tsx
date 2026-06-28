import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ListChecks,
  ArrowRight,
  User,
  Sparkles,
  CalendarClock,
  FileText,
  Globe2,
  GraduationCap,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useUniversityMatch } from "@/hooks/useUniversityMatch";
import { useDeadlines } from "@/hooks/useDeadlines";
import { computeCompleteness, getFieldLabel, type FieldKey } from "@/lib/profileCompleteness";
import { getCountryPathway } from "@/lib/countryPathways";

type Priority = "critical" | "high" | "medium" | "low";

interface ActionItem {
  id: string;
  priority: Priority;
  category: string;
  icon: typeof User;
  title: string;
  description: string;
  cta: string;
  path: string;
  completed?: boolean;
}

const priorityWeight: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const priorityStyle = (p: Priority) => {
  switch (p) {
    case "critical": return "bg-destructive/10 text-destructive border-destructive/30";
    case "high": return "bg-warning/10 text-warning border-warning/30";
    case "medium": return "bg-accent/10 text-accent border-accent/30";
    case "low": return "bg-muted text-muted-foreground border-border";
  }
};

const ActionCenterPage = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const { selection, run, loading: matchLoading } = useUniversityMatch(profile);
  const { deadlines, loading: deadlinesLoading } = useDeadlines();

  // Trigger match calculation if profile is ready and we don't have data yet
  useEffect(() => {
    if (profile?.gpa?.trim() && profile?.extracurriculars?.trim() && !selection && !matchLoading) {
      run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const items: ActionItem[] = useMemo(() => {
    const out: ActionItem[] = [];

    // 1. Profile gaps
    const completeness = computeCompleteness(profile);
    if (completeness.missingRequired.length > 0) {
      completeness.missingRequired.forEach((field: FieldKey) => {
        out.push({
          id: `profile-req-${field}`,
          priority: "critical",
          category: "Profile",
          icon: User,
          title: `Add ${getFieldLabel(field)}`,
          description: "Required to compute your real chances.",
          cta: "Add now",
          path: "/dashboard/profile",
        });
      });
    }
    completeness.missingRecommended.slice(0, 4).forEach((field: FieldKey) => {
      out.push({
        id: `profile-rec-${field}`,
        priority: "medium",
        category: "Profile",
        icon: User,
        title: `Add ${getFieldLabel(field)}`,
        description: "Improves match accuracy.",
        cta: "Add",
        path: "/dashboard/profile",
      });
    });

    // 2. Top leverage points across matched unis (deduped, ranked)
    if (selection?.included?.length) {
      const seen = new Set<string>();
      const allLevers = selection.included
        .flatMap((u) =>
          (u.leveragePoints || []).map((lp) => ({
            ...lp,
            uni: u.universityName,
            uniScore: u.score,
          })),
        )
        .sort((a, b) => b.leverageScore - a.leverageScore);

      for (const lev of allLevers) {
        if (seen.has(lev.factor)) continue;
        seen.add(lev.factor);
        if (seen.size > 3) break;
        out.push({
          id: `lever-${lev.factor}`,
          priority: "high",
          category: "Improve",
          icon: Sparkles,
          title: `Strengthen your ${lev.factor.toLowerCase()}`,
          description: `${lev.description} (raises score across ${selection.included.length} matches)`,
          cta: "Open roadmap",
          path: "/dashboard/roadmap",
        });
      }
    }

    // 3. Upcoming deadlines (next 60 days)
    const now = Date.now();
    const sixtyDays = now + 60 * 24 * 60 * 60 * 1000;
    deadlines
      .filter((d) => !d.completed && new Date(d.date).getTime() <= sixtyDays)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
      .forEach((d) => {
        const days = Math.ceil((new Date(d.date).getTime() - now) / (24 * 60 * 60 * 1000));
        const isOverdue = days < 0;
        out.push({
          id: `deadline-${d.id}`,
          priority: isOverdue ? "critical" : days <= 14 ? "high" : "medium",
          category: "Deadline",
          icon: CalendarClock,
          title: `${d.university} — ${d.type.replace("-", " ")}`,
          description: isOverdue
            ? `Overdue by ${Math.abs(days)} days`
            : `In ${days} day${days === 1 ? "" : "s"} · ${new Date(d.date).toLocaleDateString()}`,
          cta: "View",
          path: "/dashboard/deadlines",
        });
      });

    // 4. Required tests not logged (per target country)
    const p = profile as any;
    const targets: string[] = p?.preferredCountries || p?.target_countries || [];
    const hasTests = !!(p?.testScores || p?.test_scores)?.toString().trim();
    if (!hasTests && targets.length > 0) {
      const countryTests = targets
        .map((c) => getCountryPathway(c))
        .filter(Boolean)
        .flatMap((p) => p!.requiredTests)
        .slice(0, 3);
      if (countryTests.length > 0) {
        out.push({
          id: "tests-missing",
          priority: "high",
          category: "Tests",
          icon: GraduationCap,
          title: "Log your standardized test scores",
          description: `Your target countries expect: ${countryTests.join(" · ")}`,
          cta: "Add scores",
          path: "/dashboard/profile",
        });
      }
    }

    // 5. Documents missing (recommendations, transcripts, essays)
    if (!p?.essay_strength && !p?.essayStrength) {
      out.push({
        id: "doc-essay",
        priority: "medium",
        category: "Documents",
        icon: FileText,
        title: "Draft your personal statement",
        description: "Essays carry 14% of the admissions weight.",
        cta: "Open Essay Coach",
        path: "/dashboard/essay-coach",
      });
    }
    if (!p?.recommendation_strength && !p?.recommendationStrength) {
      out.push({
        id: "doc-rec",
        priority: "medium",
        category: "Documents",
        icon: FileText,
        title: "Upload recommendation letters",
        description: "Get document-level analysis to strengthen your case.",
        cta: "Upload",
        path: "/dashboard/documents",
      });
    }

    // 6. Per-country pathway next step
    targets.slice(0, 3).forEach((country) => {
      const pathway = getCountryPathway(country);
      if (!pathway) return;
      out.push({
        id: `pathway-${country}`,
        priority: "low",
        category: "Country plan",
        icon: Globe2,
        title: `Get started with ${pathway.flag} ${country}`,
        description: pathway.firstAction,
        cta: "Pathway",
        path: "/dashboard/matches",
      });
    });

    return out.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);
  }, [profile, selection, deadlines]);

  const loading = profileLoading || deadlinesLoading;
  const criticalCount = items.filter((i) => i.priority === "critical").length;
  const highCount = items.filter((i) => i.priority === "high").length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Action Center</h1>
            <p className="text-sm text-muted-foreground">
              The single answer to "what should I do next?" — ranked by impact.
            </p>
          </div>
        </div>

        {!loading && items.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {criticalCount > 0 && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 gap-1">
                <Flame className="w-3 h-3" /> {criticalCount} critical
              </Badge>
            )}
            {highCount > 0 && (
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                {highCount} high priority
              </Badge>
            )}
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              {items.length} total
            </Badge>
          </div>
        )}
      </motion.div>

      {loading && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <Card className="p-10 text-center border-success/30 bg-success/5">
          <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-1">You're all caught up</h3>
          <p className="text-sm text-muted-foreground mb-4">
            No critical actions right now. Keep your profile fresh and revisit when you have updates.
          </p>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/dashboard/matches">See your matches</Link>
          </Button>
        </Card>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <Card className="p-4 border-border/60 hover:border-primary/30 transition-colors flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="outline" className={`${priorityStyle(item.priority)} text-[10px] uppercase tracking-wide`}>
                      {item.priority}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(item.path)}
                  className="shrink-0 gap-1 rounded-xl"
                >
                  <span className="hidden sm:inline">{item.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionCenterPage;
