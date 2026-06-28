import { motion } from "framer-motion";
import { Trophy, Sparkles, ArrowRight, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AlignmentResult } from "@/lib/matchEngine";
import { EvidenceBadge } from "@/components/trust/EvidenceBadge";
import { ConfidenceMeter } from "@/components/trust/ConfidenceMeter";
import {
  combineConfidence,
  confidenceFromEvidenceCount,
  confidenceFromSampleSize,
  type EvidenceDescriptor,
} from "@/lib/trust";


interface Props {
  topPick: AlignmentResult;
  topPickByCountry?: Record<string, AlignmentResult>;
  /** Optional callback to scroll to / focus on the full breakdown card. */
  onSeeBreakdown?: (universityName: string) => void;
  /** Compact dashboard variant (smaller, fewer details). */
  variant?: "full" | "compact";
}

const flagFor = (country: string): string => {
  const c = country.toLowerCase();
  if (c.includes("usa") || c.includes("united states")) return "🇺🇸";
  if (c.includes("uk") || c.includes("united kingdom") || c.includes("england")) return "🇬🇧";
  if (c.includes("canada")) return "🇨🇦";
  if (c.includes("australia")) return "🇦🇺";
  if (c.includes("germany")) return "🇩🇪";
  if (c.includes("switzerland")) return "🇨🇭";
  if (c.includes("singapore")) return "🇸🇬";
  if (c.includes("hong kong")) return "🇭🇰";
  if (c.includes("netherlands")) return "🇳🇱";
  if (c.includes("france")) return "🇫🇷";
  if (c.includes("ireland")) return "🇮🇪";
  return "🎓";
};

export const TopPickCard = ({
  topPick,
  topPickByCountry,
  onSeeBreakdown,
  variant = "full",
}: Props) => {
  const compact = variant === "compact";
  const lp = topPick.leveragePoints?.slice(0, compact ? 1 : 2) ?? [];
  const otherCountries = topPickByCountry
    ? Object.entries(topPickByCountry).filter(
        ([country]) => country.toLowerCase() !== topPick.country.toLowerCase(),
      )
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-2 border-accent/40 bg-gradient-to-br from-accent/10 via-primary/5 to-card overflow-hidden shadow-xl">
        <CardContent className={compact ? "p-5" : "p-6 sm:p-8"}>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center shrink-0 shadow-lg">
              <Trophy className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <p className="text-xs uppercase tracking-[0.2em] text-accent font-bold">
                  Your #1 Best-Chance University
                </p>
              </div>
              <h2
                className={`font-display font-bold leading-tight text-foreground ${
                  compact ? "text-xl" : "text-2xl sm:text-3xl"
                }`}
              >
                {flagFor(topPick.country)} {topPick.universityName}
              </h2>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {topPick.country}
                </span>
                <span>•</span>
                <Badge className="bg-success/15 text-success border-success/30 font-semibold">
                  {topPick.range.min}–{topPick.range.max}% alignment
                </Badge>
                <span className="text-xs">{topPick.category}</span>
                {(() => {
                  const cal = (topPick as any).calibration;
                  const hasCal = cal?.applied;
                  const sampleSize: number = cal?.sampleSize ?? 0;
                  const sources: EvidenceDescriptor["sources"] = [];
                  if (topPick.dataSourceUrl) {
                    sources.push({
                      label: "Common Data Set",
                      url: topPick.dataSourceUrl,
                      year: topPick.dataYear,
                    });
                  }
                  if (hasCal) {
                    sources.push({
                      label: `Calibration v${cal.version}`,
                      year: `${sampleSize} outcomes`,
                    });
                  }
                  const level: EvidenceDescriptor["level"] = hasCal
                    ? "estimated"
                    : topPick.dataSourceUrl
                      ? "verified"
                      : "inferred";
                  const evidence: EvidenceDescriptor = {
                    level,
                    sources,
                    sampleSize,
                    reason: hasCal
                      ? `Calibrated against ${sampleSize} real admissions outcomes.`
                      : topPick.dataSourceUrl
                        ? `Published primary source (${topPick.dataYear}).`
                        : "AI-derived from related signals — directional only.",
                  };
                  const confidence = combineConfidence(
                    confidenceFromSampleSize(sampleSize),
                    confidenceFromEvidenceCount(sources.length),
                  );
                  return (
                    <>
                      <EvidenceBadge evidence={evidence} />
                      <ConfidenceMeter
                        value={confidence}
                        compact
                        reason={evidence.reason}
                      />
                    </>
                  );
                })()}
              </div>
            </div>
          </div>



          <p className={`text-foreground/80 ${compact ? "text-sm" : "text-base"} leading-relaxed mb-4`}>
            {topPick.oneLiner}
          </p>

          {!compact && lp.length > 0 && (
            <div className="bg-card/60 rounded-xl p-4 border border-border/50 mb-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Why this is your strongest shot
              </p>
              <ul className="space-y-1.5">
                {lp.map((p) => (
                  <li key={p.factor} className="flex items-start gap-2 text-sm">
                    <span className="text-accent mt-1">▸</span>
                    <span>
                      <strong className="text-foreground">{p.factor}:</strong>{" "}
                      <span className="text-muted-foreground">{p.description}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!compact && otherCountries.length > 0 && (
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Best pick per target country
              </p>
              <div className="flex flex-wrap gap-2">
                {otherCountries.map(([country, uni]) => (
                  <button
                    key={country}
                    onClick={() => onSeeBreakdown?.(uni.universityName)}
                    className="text-xs px-3 py-1.5 rounded-full bg-card border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors flex items-center gap-1.5"
                    title={`${uni.range.min}–${uni.range.max}% alignment`}
                  >
                    <span>{flagFor(country)}</span>
                    <span className="font-medium text-foreground">{uni.universityName}</span>
                    <span className="text-muted-foreground">
                      {uni.range.min}–{uni.range.max}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              size={compact ? "sm" : "default"}
              onClick={() => onSeeBreakdown?.(topPick.universityName)}
              className="gap-2"
            >
              See full breakdown
              <ArrowRight className="w-4 h-4" />
            </Button>
            {!compact && topPick.dataSourceUrl && (
              <Button asChild variant="ghost" size="default">
                <a href={topPick.dataSourceUrl} target="_blank" rel="noopener noreferrer">
                  Verified data · {topPick.dataYear}
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
