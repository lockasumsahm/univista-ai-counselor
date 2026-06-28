import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AlignmentResult, FactorBreakdown } from "@/lib/matchEngine";
import { EvidenceBadge } from "@/components/trust/EvidenceBadge";
import { ConfidenceMeter } from "@/components/trust/ConfidenceMeter";
import {
  combineConfidence,
  confidenceFromEvidenceCount,
  confidenceFromSampleSize,
  type EvidenceDescriptor,
} from "@/lib/trust";

interface Props {
  result: AlignmentResult;
}

/**
 * Explainability "Why & Why-not" panel — Step 2 of Trust Engine.
 *
 * For each university, surfaces:
 *   • Top 3 factors LIFTING the score (high factorScore × weight)
 *   • Top 3 factors HURTING the score (high gap × weight = leverage to improve)
 *   • A single Evidence + Confidence header so the user always knows
 *     how seriously to take the explanation.
 *
 * Pure UI — no scoring logic lives here; it ranks the engine's
 * existing FactorBreakdown.
 */
export const WhyWhyNotPanel = ({ result }: Props) => {
  const factors = result.factorBreakdown ?? [];

  const why = [...factors]
    .map((f) => ({ ...f, lift: (f.factorScore * f.weight) / 100 }))
    .sort((a, b) => b.lift - a.lift)
    .slice(0, 3);

  const whyNot = [...factors]
    .map((f) => ({ ...f, drag: ((100 - f.factorScore) * f.weight) / 100 }))
    .filter((f) => f.drag > 1)
    .sort((a, b) => b.drag - a.drag)
    .slice(0, 3);

  const cal = (result as any).calibration;
  const sampleSize: number = cal?.sampleSize ?? 0;
  const sources: EvidenceDescriptor["sources"] = [];
  if (result.dataSourceUrl) {
    sources.push({
      label: "Common Data Set",
      url: result.dataSourceUrl,
      year: result.dataYear,
    });
  }
  if (cal?.applied) {
    sources.push({ label: `Calibration v${cal.version}`, year: `${sampleSize} outcomes` });
  }
  const evidence: EvidenceDescriptor = {
    level: cal?.applied ? "estimated" : result.dataSourceUrl ? "verified" : "inferred",
    sources,
    sampleSize,
    reason: cal?.applied
      ? `Calibrated against ${sampleSize} real admissions outcomes.`
      : result.dataSourceUrl
        ? `Published primary source (${result.dataYear}).`
        : "AI-derived from related signals — directional only.",
  };
  const confidence = combineConfidence(
    confidenceFromSampleSize(sampleSize),
    confidenceFromEvidenceCount(sources.length),
  );

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="p-4 border-border/60 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground">Why & Why-not</h4>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Top factors pushing your alignment up vs down for{" "}
                <strong>{result.universityName}</strong>. Weighted by how much
                this school cares about each factor.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <EvidenceBadge evidence={evidence} />
            <ConfidenceMeter value={confidence} compact reason={evidence.reason} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <FactorList
            title="Why you fit"
            icon={<TrendingUp className="w-4 h-4 text-success" />}
            tone="success"
            items={why}
            metricKey="factorScore"
            metricSuffix="/100"
            emptyLabel="No standout strengths yet."
          />
          <FactorList
            title="Why not (yet)"
            icon={<TrendingDown className="w-4 h-4 text-warning" />}
            tone="warning"
            items={whyNot}
            metricKey="factorScore"
            metricSuffix="/100"
            emptyLabel="No major gaps — solid across the board."
            invertProgress
          />
        </div>

        <p className="text-[11px] text-muted-foreground italic">
          Ranking weighted by this school's published priorities. Estimate from
          public data — not a prediction.
        </p>
      </Card>
    </TooltipProvider>
  );
};

interface FactorListProps {
  title: string;
  icon: React.ReactNode;
  tone: "success" | "warning";
  items: Array<FactorBreakdown & { lift?: number; drag?: number }>;
  metricKey: "factorScore";
  metricSuffix: string;
  emptyLabel: string;
  invertProgress?: boolean;
}

const FactorList = ({
  title,
  icon,
  tone,
  items,
  metricKey,
  metricSuffix,
  emptyLabel,
  invertProgress,
}: FactorListProps) => {
  const accent =
    tone === "success"
      ? "text-success border-success/30 bg-success/5"
      : "text-warning border-warning/30 bg-warning/5";

  return (
    <div className={`rounded-lg border p-3 ${accent}`}>
      <div className="flex items-center gap-2 mb-2.5">
        {icon}
        <h5 className="text-xs font-semibold uppercase tracking-wide">{title}</h5>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((f) => {
            const raw = f[metricKey];
            const pct = invertProgress ? 100 - raw : raw;
            return (
              <li key={f.factor} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-foreground truncate">
                    {f.factor}
                  </span>
                  <span className="text-muted-foreground shrink-0 tabular-nums">
                    {raw}
                    {metricSuffix} · {f.weight}% wt
                  </span>
                </div>
                <Progress value={pct} className="h-1.5" />
                <p className="text-[11px] text-muted-foreground leading-snug">
                  You: <span className="text-foreground/80">{f.studentValue}</span>
                  {" · "}
                  School: <span className="text-foreground/80">{f.universityValue}</span>
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
