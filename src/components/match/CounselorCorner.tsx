import { Card } from "@/components/ui/card";
import { Sparkles, ThumbsUp, AlertTriangle, ListChecks, Globe2, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 4-section counselor brief — one screen, one decision per section:
 *   1. Why you fit          (engine's strongest factor + AI prose)
 *   2. What's missing       (top 3 gap factors with "why it matters here")
 *   3. Next 30 days         (concrete checklist actions)
 *   4. Counselor's honest take (origin-aware + what this school weighs heaviest)
 *
 * Engine fallbacks (in useUniversityMatch.sanitizeBlocks) ensure
 * NOTHING ever renders blank.
 */
export interface CounselorBlocks {
  bottomLine: string;
  leveragePoints: {
    factor: string;
    why: string;
    action: string;
  }[];
  whatThisSchoolWeighs: string;
  honestTakeForOrigin: string;
}

interface Props {
  blocks?: CounselorBlocks | null;
  loading?: boolean;
  studentCountry?: string | null;
}

export const CounselorCorner = ({ blocks, loading, studentCountry }: Props) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="p-4 border-border/60">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-full mb-1.5" />
            <Skeleton className="h-3 w-5/6" />
          </Card>
        ))}
      </div>
    );
  }

  if (!blocks) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> Counselor notes loading…
      </div>
    );
  }

  // Split leverage points: first one becomes "why you fit" framing context,
  // remaining become "what's missing".
  const missing = blocks.leveragePoints.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* 1. Why you fit */}
      <Card className="p-4 border-success/30 bg-success/5">
        <div className="flex items-center gap-2 mb-2">
          <ThumbsUp className="w-4 h-4 text-success" />
          <h5 className="text-xs font-semibold uppercase tracking-wide text-success">
            Why you fit
          </h5>
        </div>
        <p className="text-sm text-foreground leading-relaxed">
          {blocks.bottomLine}
        </p>
      </Card>

      {/* 2. What's missing */}
      <Card className="p-4 border-warning/30 bg-warning/5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <h5 className="text-xs font-semibold uppercase tracking-wide text-warning">
            What's missing
          </h5>
        </div>
        <ul className="space-y-2.5">
          {missing.map((lp, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-warning/20 text-warning text-[11px] font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{lp.factor}</div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  {lp.why}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* 3. Next 30 days */}
      <Card className="p-4 border-primary/30 bg-primary/5">
        <div className="flex items-center gap-2 mb-3">
          <ListChecks className="w-4 h-4 text-primary" />
          <h5 className="text-xs font-semibold uppercase tracking-wide text-primary">
            Next 30 days
          </h5>
        </div>
        <ul className="space-y-2">
          {missing.map((lp, i) => (
            <li key={i} className="flex gap-2.5 text-sm">
              <span className="text-primary font-bold mt-0.5">→</span>
              <span className="text-foreground leading-relaxed flex-1">{lp.action}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* 4. Counselor's honest take */}
      <Card className="p-4 border-border/60 bg-card/40">
        <div className="flex items-center gap-2 mb-2">
          <Globe2 className="w-4 h-4 text-accent" />
          <h5 className="text-xs font-semibold uppercase tracking-wide text-accent">
            Counselor's honest take{studentCountry ? ` · from ${studentCountry}` : ""}
          </h5>
        </div>
        <p className="text-sm text-foreground leading-relaxed mb-3">
          {blocks.honestTakeForOrigin}
        </p>
        <div className="pt-3 border-t border-border/40">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
            What this school weighs heaviest
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {blocks.whatThisSchoolWeighs}
          </p>
        </div>
      </Card>

      <p className="text-xs text-muted-foreground italic flex items-center gap-1.5 pt-1">
        <Sparkles className="w-3 h-3" /> Estimate from published data. Not a prediction.
      </p>
    </div>
  );
};
