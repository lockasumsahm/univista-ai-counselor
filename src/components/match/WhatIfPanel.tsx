import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { computeAlignment, type AlignmentResult } from "@/lib/matchEngine";
import { getUniversityByName } from "@/lib/universityData";

interface Props {
  result: AlignmentResult;
  profile?: any;
}

const parseNum = (raw: string | null | undefined, re: RegExp, max = Infinity): number | null => {
  if (!raw) return null;
  const m = String(raw).match(re);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return isNaN(n) || n > max ? null : n;
};

export const WhatIfPanel = ({ result, profile }: Props) => {
  const uni = useMemo(() => getUniversityByName(result.universityName), [result.universityName]);

  const baseGPA = useMemo(() => {
    const n = parseNum(profile?.gpa, /(\d+(?:\.\d+)?)/);
    return n != null && n <= 4 ? n : n != null && n <= 100 ? n / 25 : 3.5;
  }, [profile?.gpa]);

  const baseSAT = useMemo(() => {
    const raw = profile?.test_scores || profile?.testScores || "";
    const matches = String(raw).match(/\b(\d{3,4})\b/g) || [];
    for (const m of matches) {
      const n = parseInt(m, 10);
      if (n >= 400 && n <= 1600) return n;
    }
    return 1300;
  }, [profile?.test_scores, profile?.testScores]);

  const [gpa, setGpa] = useState<number>(Number(baseGPA.toFixed(2)));
  const [sat, setSat] = useState<number>(baseSAT);

  const simulated = useMemo(() => {
    if (!uni) return null;
    const nextProfile = {
      ...(profile || {}),
      gpa: gpa.toFixed(2),
      test_scores: `SAT ${sat}`,
      testScores: `SAT ${sat}`,
    };
    try {
      return computeAlignment(nextProfile, uni);
    } catch {
      return null;
    }
  }, [gpa, sat, uni, profile]);

  if (!uni) {
    return (
      <div className="rounded-xl border border-border bg-card/40 p-4 text-xs text-muted-foreground">
        What-if simulation isn't available for this school yet.
      </div>
    );
  }

  const delta = simulated ? simulated.score - result.score : 0;
  const Arrow = delta > 0.5 ? TrendingUp : delta < -0.5 ? TrendingDown : Minus;
  const arrowColor =
    delta > 0.5 ? "text-success" : delta < -0.5 ? "text-destructive" : "text-muted-foreground";

  return (
    <div className="rounded-xl border border-border bg-card/40 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-semibold">What-if simulation</h4>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground ml-auto">
          Live recompute
        </span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Drag to see how a stronger GPA or SAT would move your match for {result.universityName}.
      </p>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">GPA (unweighted)</span>
            <span className="font-semibold tabular-nums">{gpa.toFixed(2)}</span>
          </div>
          <Slider
            value={[gpa]}
            min={2.0}
            max={4.0}
            step={0.01}
            onValueChange={(v) => setGpa(v[0])}
            aria-label="Simulated GPA"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">SAT total</span>
            <span className="font-semibold tabular-nums">{sat}</span>
          </div>
          <Slider
            value={[sat]}
            min={800}
            max={1600}
            step={10}
            onValueChange={(v) => setSat(v[0])}
            aria-label="Simulated SAT"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-background/60 px-3 py-3 flex items-center justify-between gap-3">
        <div className="text-xs">
          <div className="text-muted-foreground">Current match</div>
          <div className="text-lg font-bold tabular-nums">{result.score.toFixed(0)}%</div>
        </div>
        <Arrow className={`w-5 h-5 ${arrowColor}`} />
        <div className="text-xs text-right">
          <div className="text-muted-foreground">Simulated match</div>
          <div className="text-lg font-bold tabular-nums text-primary">
            {simulated ? simulated.score.toFixed(0) : "—"}%
          </div>
          {simulated && (
            <div className={`text-[11px] font-medium ${arrowColor}`}>
              {delta > 0 ? "+" : ""}
              {delta.toFixed(1)} pts
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Simulation uses the same scoring engine as your live match — adjusting GPA and SAT only.
        Spike, essays, and recommendations are held constant.
      </p>
    </div>
  );
};
