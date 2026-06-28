import { Target, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AlignmentResult } from "@/lib/matchEngine";

interface Move {
  priority: "critical" | "high" | "medium";
  title: string;
  why: string;
  estLift: number; // pts
}

const PRIORITY_STYLES: Record<Move["priority"], string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/40",
  high: "bg-warning/15 text-warning border-warning/40",
  medium: "bg-primary/15 text-primary border-primary/40",
};

function buildMoves(result: AlignmentResult, profile: any): Move[] {
  const moves: Move[] = [];
  const lev = (result.leveragePoints || []).slice(0, 4);

  for (const lp of lev) {
    const f = lp.factor.toLowerCase();
    let title = `Strengthen ${lp.factor}`;
    let why = lp.description;

    if (f.includes("gpa")) title = "Raise GPA — focus on next term's hardest courses";
    else if (f.includes("sat") || f.includes("act") || f.includes("test"))
      title = "Retake SAT/ACT — even +50 SAT pts shifts the band";
    else if (f.includes("extracurricular") || f.includes("activit"))
      title = "Deepen one signature activity (depth > breadth)";
    else if (f.includes("essay")) title = "Use the Essay Suite to push your essay to 8+/10";
    else if (f.includes("recommend")) title = "Brief a teacher rec who can write a specific story";
    else if (f.includes("award") || f.includes("honor"))
      title = "Submit to one national-tier competition this season";
    else if (f.includes("leader")) title = "Take ownership of one initiative end-to-end";
    else if (f.includes("research")) title = "Publish or present your research output";

    const priority: Move["priority"] =
      lp.leverageScore >= 65 ? "critical" : lp.leverageScore >= 40 ? "high" : "medium";

    moves.push({
      priority,
      title,
      why,
      estLift: Math.round(lp.leverageScore * 0.18),
    });
  }

  // Strategic application timing
  if (result.score < 55) {
    moves.push({
      priority: "high",
      title: "Apply RD, not ED — preserve your strongest pick for a realistic match",
      why: "This school sits below your safety band; ED would lock in low odds.",
      estLift: 0,
    });
  } else if (result.score >= 70 && profile?.applicationStrategy !== "ED") {
    moves.push({
      priority: "high",
      title: "Consider ED/REA — your profile aligns; binding round can boost odds 2-3×",
      why: "Strong alignment + binding commitment is the highest-leverage admissions move.",
      estLift: 8,
    });
  }

  return moves.slice(0, 5);
}

export const StrategicAdvisor = ({
  result,
  profile,
}: {
  result: AlignmentResult;
  profile?: any;
}) => {
  const moves = buildMoves(result, profile);
  if (moves.length === 0) return null;

  return (
    <div className="rounded-lg border border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-primary" />
        <h4 className="font-semibold text-sm">Strategic next moves for {result.universityName}</h4>
        <Badge variant="outline" className="ml-auto text-[10px]">
          Priority-ranked
        </Badge>
      </div>
      <ol className="space-y-2.5">
        {moves.map((m, i) => (
          <li
            key={i}
            className="flex gap-3 rounded-md border border-border/60 bg-background/60 p-3"
          >
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-medium text-sm leading-snug">{m.title}</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] uppercase ${PRIORITY_STYLES[m.priority]}`}
                >
                  {m.priority === "critical" ? (
                    <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                  ) : m.priority === "high" ? (
                    <TrendingUp className="w-2.5 h-2.5 mr-1" />
                  ) : (
                    <Sparkles className="w-2.5 h-2.5 mr-1" />
                  )}
                  {m.priority}
                </Badge>
                {m.estLift > 0 && (
                  <span className="text-[10px] text-success font-semibold">
                    +{m.estLift} pts est.
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{m.why}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="text-[10px] text-muted-foreground italic">
        Ranked by weighted leverage × this school's priorities. Estimated lifts are directional, not guarantees.
      </p>
    </div>
  );
};
