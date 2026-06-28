/**
 * ScoreJourney — Pass 4 explainability panel.
 *
 * Renders the layered build-up of the alignment score: base engine output →
 * Pass 3 major-rate adjustment → Pass 1 outcome calibration → final.
 * Stays collapsed by default so power-users opt in.
 */
import { useState } from "react";
import { ChevronDown, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AlignmentResult } from "@/lib/matchEngine";
import type { MajorAdjustment } from "@/lib/majorRates";
import type { CalibrationMeta } from "@/lib/calibrationCore";

interface Props {
  result: AlignmentResult;
}

const fmtDelta = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

export const ScoreJourney = ({ result }: Props) => {
  const [open, setOpen] = useState(false);
  const maj = (result as any).majorAdjustment as MajorAdjustment | undefined;
  const cal = (result as any).calibration as CalibrationMeta | undefined;

  // Compute the engine base = maj.baseScore (if maj applied) else cal.baseScore else current score.
  const engineBase =
    maj?.applied ? maj.baseScore :
    cal?.baseScore ?? result.score;
  const afterMajor = maj?.applied ? maj.adjustedScore : engineBase;
  const final = result.score;

  return (
    <div className="rounded-lg border border-border/60 bg-card/40">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        className="w-full justify-between px-3 py-2 h-auto"
        aria-expanded={open}
        aria-controls={`journey-${result.universityName}`}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Layers className="w-4 h-4 text-primary" aria-hidden="true" />
          How this score was built
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </Button>

      {open && (
        <div id={`journey-${result.universityName}`} className="px-3 pb-3 space-y-2 text-sm">
          <Row
            label="Engine base score"
            value={`${engineBase}/100`}
            detail="Weighted sum of 6 factors (academics, testing, rigor, ECs, selectivity, international)."
          />
          {maj?.applied ? (
            <Row
              label="Major-specific adjustment"
              value={`${fmtDelta(maj.deltaPts)} pts → ${afterMajor}`}
              detail={`${result.universityName} admits ${(maj.uniRate! * 100).toFixed(1)}% for your major vs ${(maj.overallRate! * 100).toFixed(1)}% overall (data ${maj.year}). Multiplier ${maj.multiplier.toFixed(2)}${maj.cappedByGuard ? " (clipped at ±6 pts safety cap)" : ""}.`}
              positive={maj.deltaPts >= 0}
            />
          ) : (
            <Row
              label="Major-specific adjustment"
              value="not applied"
              detail="No per-major admit rate data on file for this (university, major) pair — score unchanged."
              muted
            />
          )}
          {cal?.applied ? (
            <Row
              label="Outcome calibration"
              value={`${fmtDelta(cal.deltaPts)} pts → ${final}`}
              detail={`Based on ${cal.sampleSize} real admissions outcomes from similar applicants${cal.bucket?.tier ? ` (${cal.bucket.tier}` : ""}${cal.bucket?.region ? ` · ${cal.bucket.region}` : ""}${cal.bucket?.major ? ` · ${cal.bucket.major}` : ""}${cal.bucket?.tier ? ")" : ""}. Calibration v${cal.version}${cal.cappedByGuard ? " · clipped at ±8 pts safety cap" : ""}.`}
              positive={cal.deltaPts >= 0}
            />
          ) : (
            <Row
              label="Outcome calibration"
              value="not applied"
              detail="No active calibration bucket reaches the 30-outcome minimum yet — score unchanged."
              muted
            />
          )}
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/40">
            <span className="text-sm font-semibold text-foreground">Final alignment</span>
            <span className="text-base font-bold text-primary">
              {result.range.min}–{result.range.max}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground italic pt-1">
            Every layer is bounded — a single source can't swing your score by more than its declared cap.
            See <code className="px-1 py-0.5 rounded bg-muted">/methodology</code> for the full math.
          </p>
        </div>
      )}
    </div>
  );
};

function Row({
  label, value, detail, positive, muted,
}: { label: string; value: string; detail: string; positive?: boolean; muted?: boolean; }) {
  return (
    <div className={`rounded-md border ${muted ? "border-border/30 bg-muted/20" : "border-border/50 bg-background"} p-2.5`}>
      <div className="flex items-center justify-between gap-3">
        <span className={`font-medium ${muted ? "text-muted-foreground" : "text-foreground"}`}>{label}</span>
        <span className={`text-xs font-semibold ${
          muted ? "text-muted-foreground" :
          positive === undefined ? "text-foreground" :
          positive ? "text-success" : "text-warning"
        }`}>{value}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{detail}</p>
    </div>
  );
}
