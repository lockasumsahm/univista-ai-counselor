import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Globe2 } from "lucide-react";
import { ScoreJourney } from "./ScoreJourney";
import { WhyWhyNotPanel } from "./WhyWhyNotPanel";
import { SimilarStudentsPanel } from "./SimilarStudentsPanel";
import { WhatIfPanel } from "./WhatIfPanel";
import { StrategicAdvisor } from "./StrategicAdvisor";
import type { AlignmentResult } from "@/lib/matchEngine";

interface Props {
  result: AlignmentResult;
  profile?: any;
}

export const ShowMath = ({ result, profile }: Props) => {
  const [advanced, setAdvanced] = useState(false);
  const ctx = result.internationalContext;
  const cal = (result as any).calibration as
    | { applied: boolean; sampleSize: number; version: number; baseScore: number; adjustedScore: number; deltaPts: number; bucket: { tier: string | null; region: string | null; major: string | null } | null }
    | undefined;

  return (
    <div className="space-y-4">
      <ScoreJourney result={result} />
      <WhyWhyNotPanel result={result} />
      <StrategicAdvisor result={result} profile={profile} />
      <SimilarStudentsPanel universityName={result.universityName} profile={profile} />
      <WhatIfPanel result={result} profile={profile} />


      <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
        <Label htmlFor={`adv-${result.universityName}`} className="text-sm">
          {advanced ? "Advanced view" : "Simple view"}
        </Label>
        <Switch
          id={`adv-${result.universityName}`}
          checked={advanced}
          onCheckedChange={setAdvanced}
        />
      </div>

      {/* International context callout */}
      {ctx.applies && (
        <div className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 flex items-start gap-2 text-xs">
          <Globe2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
          <div className="leading-relaxed">
            <span className="font-semibold text-foreground">International context:</span>{" "}
            <span className="text-muted-foreground">
              You're applying from <strong>{ctx.studentCountry || "abroad"}</strong> to a {ctx.uniCountry} school admitting{" "}
              <strong>~{ctx.effectiveRate.toFixed(1)}%</strong>
              {ctx.isEstimate ? " (estimated)" : ""} of international applicants
              {!ctx.isEstimate && ctx.intlRate != null
                ? ` vs ~${ctx.overallRate}% overall.`
                : `.`}
              {ctx.needBlindIntl
                ? " This school is need-blind for internationals."
                : " This school is need-aware for internationals — financial need can affect admission."}
            </span>
          </div>
        </div>
      )}

      {cal?.applied && (
        <div className="rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-xs leading-relaxed">
          <span className="font-semibold text-foreground">Outcome calibrated:</span>{" "}
          <span className="text-muted-foreground">
            This score was adjusted by{" "}
            <strong className={cal.deltaPts >= 0 ? "text-success" : "text-warning"}>
              {cal.deltaPts >= 0 ? "+" : ""}{cal.deltaPts}pts
            </strong>{" "}
            (base {cal.baseScore} → {cal.adjustedScore}) using{" "}
            <strong>{cal.sampleSize}</strong> real admissions outcomes from similar
            applicants{cal.bucket?.tier ? ` (${cal.bucket.tier}` : ""}
            {cal.bucket?.region ? ` · ${cal.bucket.region}` : ""}
            {cal.bucket?.major ? ` · ${cal.bucket.major}` : ""}
            {cal.bucket?.tier ? ")" : ""}. Calibration v{cal.version}.
          </span>
        </div>
      )}

      {!advanced ? (
        <ul className="space-y-2 text-sm text-foreground">
          {result.simpleExplanation.map((line, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-primary mt-1">•</span>
              <span className="leading-relaxed">{line}</span>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Factor</TableHead>
                  <TableHead>You</TableHead>
                  <TableHead>{result.universityName}</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Weight</TableHead>
                  <TableHead className="text-right">Contribution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.factorBreakdown.map((f) => (
                  <TableRow key={f.factor}>
                    <TableCell className="font-medium">{f.factor}</TableCell>
                    <TableCell className="text-muted-foreground">{f.studentValue}</TableCell>
                    <TableCell className="text-muted-foreground">{f.universityValue}</TableCell>
                    <TableCell className="text-right">{f.factorScore}/100</TableCell>
                    <TableCell className="text-right">{f.weight}%</TableCell>
                    <TableCell className="text-right font-semibold">{f.contribution.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="rounded-lg border border-border/60 p-3 bg-muted/30">
            <h6 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Step-by-step trace
            </h6>
            <ol className="space-y-2 text-sm">
              {result.traceLog.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-xs text-muted-foreground w-5 mt-0.5">{i + 1}.</span>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{s.label}</div>
                    <div className="text-muted-foreground">{s.detail}</div>
                    {s.value && <div className="text-xs text-primary mt-0.5">{s.value}</div>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}

      {/* Source attribution */}
      {result.dataSourceUrl && (
        <a
          href={result.dataSourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Verified source ({result.dataYear}) — {new URL(result.dataSourceUrl).hostname}
        </a>
      )}

      <p className="text-xs text-muted-foreground italic">
        Estimate from published data. Not a prediction.
      </p>
    </div>
  );
};
