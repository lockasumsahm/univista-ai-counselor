import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Compass, CheckCircle2, AlertCircle } from "lucide-react";
import type { AlignmentResult } from "@/lib/matchEngine";

interface Props {
  matches: AlignmentResult[];
}

const IDEAL = { safe: 3, match: 4, reach: 3 };

export const ApplicationStrategy = ({ matches }: Props) => {
  const summary = useMemo(() => {
    const safe = matches.filter((m) => m.category === "Safe");
    const match = matches.filter((m) => m.category === "Match");
    const reach = matches.filter((m) => m.category === "Reach" || m.category === "Hard Reach");

    const top = [...matches].sort((a, b) => b.score - a.score)[0];
    const edPick = top && top.score >= 65 ? top : null;
    const eaPicks = match.slice(0, 2);

    return { safe, match, reach, edPick, eaPicks, top };
  }, [matches]);

  if (matches.length === 0) return null;

  const balance = [
    { label: "Safety", count: summary.safe.length, ideal: IDEAL.safe, color: "success" },
    { label: "Target", count: summary.match.length, ideal: IDEAL.match, color: "accent" },
    { label: "Reach", count: summary.reach.length, ideal: IDEAL.reach, color: "warning" },
  ];

  return (
    <Card className="p-5 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-accent/5">
      <div className="flex items-center gap-2 mb-4">
        <Compass className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold text-base">Application strategy</h3>
        <Badge variant="outline" className="ml-auto text-[10px]">
          Portfolio view
        </Badge>
      </div>

      {/* Portfolio balance */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {balance.map((b) => {
          const ok = b.count >= b.ideal;
          return (
            <div key={b.label} className="rounded-lg border border-border/60 bg-background/60 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">{b.label}</span>
                {ok ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-warning" />
                )}
              </div>
              <div className="text-2xl font-display font-bold">
                {b.count}
                <span className="text-xs font-normal text-muted-foreground"> / {b.ideal} ideal</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Round recommendations */}
      <div className="space-y-2.5">
        <div className="rounded-md border border-success/30 bg-success/5 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-success/15 text-success border-success/40 text-[10px]">ED / REA</Badge>
            <span className="text-xs text-muted-foreground">Binding — one school only</span>
          </div>
          {summary.edPick ? (
            <p className="text-sm">
              Lead with <strong>{summary.edPick.universityName}</strong> ({summary.edPick.range.min}–
              {summary.edPick.range.max}% alignment). Binding rounds can lift your odds 2–3×.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No school crosses the 65% confidence threshold for ED. Strengthen your top match first or skip ED.
            </p>
          )}
        </div>

        <div className="rounded-md border border-accent/30 bg-accent/5 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-accent/15 text-accent border-accent/40 text-[10px]">EA / Non-binding</Badge>
            <span className="text-xs text-muted-foreground">Stack 2–3 early-action picks</span>
          </div>
          {summary.eaPicks.length > 0 ? (
            <p className="text-sm">
              Run EA at:{" "}
              <strong>{summary.eaPicks.map((u) => u.universityName).join(", ")}</strong>. Early
              decisions give you data to recalibrate RD by Jan.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Add more Target-tier schools to fill EA slots.
            </p>
          )}
        </div>

        <div className="rounded-md border border-border/60 bg-muted/30 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-muted text-foreground border-border text-[10px]">RD</Badge>
            <span className="text-xs text-muted-foreground">Regular Decision — the rest</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Spread remaining apps across Safety + Reach. Aim for a 3-4-3 balance; you currently have{" "}
            <strong>{summary.safe.length}-{summary.match.length}-{summary.reach.length}</strong>.
          </p>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground italic mt-3">
        Strategy heuristics from CGA/IECA best practices. Final round selection depends on your finances and counselor input.
      </p>
    </Card>
  );
};
