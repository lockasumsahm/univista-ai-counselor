import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, MapPin, Info, Trophy, Shield } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AlignmentResult } from "@/lib/matchEngine";
import { CounselorCorner, type CounselorBlocks } from "@/components/match/CounselorCorner";
import { ShowMath } from "@/components/match/ShowMath";
import { AskAboutUni } from "@/components/match/AskAboutUni";
import { OutcomeCapture } from "@/components/match/OutcomeCapture";
import { ApplicationStrategy } from "@/components/match/ApplicationStrategy";

interface UniversityMatchData {
  matches: AlignmentResult[];
  ai: Record<string, CounselorBlocks>;
  aiLoading?: boolean;
  profile: any;
}

const CATEGORY_ORDER: Array<AlignmentResult["category"]> = [
  "Safe",
  "Match",
  "Reach",
  "Hard Reach",
];

const categoryStyle = (cat: string) => {
  switch (cat) {
    case "Safe": return "bg-success/10 text-success border-success/20";
    case "Match": return "bg-accent/10 text-accent border-accent/20";
    case "Reach": return "bg-warning/10 text-warning border-warning/20";
    default: return "bg-destructive/10 text-destructive border-destructive/20";
  }
};

const categoryHeadline = (cat: string, count: number) => {
  switch (cat) {
    case "Safe": return `${count} Safe ${count === 1 ? "school" : "schools"} — high alignment with admit data`;
    case "Match": return `${count} Match ${count === 1 ? "school" : "schools"} — solid fit, realistic targets`;
    case "Reach": return `${count} Reach ${count === 1 ? "school" : "schools"} — competitive but worth applying`;
    default: return `${count} Hard ${count === 1 ? "Reach" : "Reaches"} — significant gaps to close`;
  }
};

export const UniversityMatch = ({ data }: { data: UniversityMatchData | null }) => {
  const matches = data?.matches ?? [];

  // Group matches by category, preserving rank within each group
  const grouped = useMemo(() => {
    const map = new Map<string, AlignmentResult[]>();
    for (const m of matches) {
      if (!map.has(m.category)) map.set(m.category, []);
      map.get(m.category)!.push(m);
    }
    return CATEGORY_ORDER
      .filter((c) => map.has(c))
      .map((c) => ({ category: c, items: map.get(c)! }));
  }, [matches]);

  // Per-country safety picks: top 2 highest-scoring per country
  const safetyPicks = useMemo(() => {
    const byCountry = new Map<string, AlignmentResult[]>();
    for (const m of [...matches].sort((a, b) => b.score - a.score)) {
      if (!byCountry.has(m.country)) byCountry.set(m.country, []);
      byCountry.get(m.country)!.push(m);
    }
    const picks = new Set<string>();
    for (const [, arr] of byCountry) {
      arr.slice(0, 2).forEach((u) => picks.add(u.universityName));
    }
    return picks;
  }, [matches]);

  // Per-country strip
  const countryStrip = useMemo(() => {
    const map = new Map<string, { safe: number; match: number; reach: number }>();
    for (const m of matches) {
      const c = m.country;
      if (!map.has(c)) map.set(c, { safe: 0, match: 0, reach: 0 });
      const bucket = map.get(c)!;
      if (m.category === "Safe") bucket.safe++;
      else if (m.category === "Match") bucket.match++;
      else bucket.reach++;
    }
    return Array.from(map.entries());
  }, [matches]);

  if (!data) return null;

  // Top verdict
  const topMatch = data.matches[0];

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-fade-in">
        {/* Top verdict */}
        {topMatch && (
          <Card className="border-primary/40 bg-gradient-to-br from-primary/10 via-card to-card overflow-hidden">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">
                    Top verdict
                  </p>
                  <h2 className="text-lg sm:text-xl font-display font-bold leading-tight">
                    Your strongest match is{" "}
                    <span className="text-primary">{topMatch.universityName}</span>{" "}
                    <span className="text-muted-foreground font-normal text-base">
                      ({topMatch.range.min}–{topMatch.range.max}% alignment)
                    </span>
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {topMatch.oneLiner}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Per-country strip */}
        {countryStrip.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {countryStrip.map(([country, counts]) => (
              <Card key={country} className="p-3 border-border/60 bg-card/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-foreground truncate">{country}</span>
                  <span className="text-xs text-muted-foreground">
                    {counts.safe + counts.match + counts.reach}
                  </span>
                </div>
                <div className="flex gap-1.5 text-[10px]">
                  {counts.safe > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-success/10 text-success font-medium">
                      {counts.safe} Safe
                    </span>
                  )}
                  {counts.match > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium">
                      {counts.match} Match
                    </span>
                  )}
                  {counts.reach > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-warning/10 text-warning font-medium">
                      {counts.reach} Reach
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <ApplicationStrategy matches={matches} />



        {/* Header + legend */}
        <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-xl items-center">
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">Safe (70+)</Badge>
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">Match (50-69)</Badge>
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Reach (30-49)</Badge>
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Hard Reach (&lt;30)</Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto cursor-help">
                <Info className="w-3.5 h-3.5" />
                <span>Estimate from published data. Not a prediction.</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-sm">
                The score compares your profile to each school's published admit data. It is a data-driven comparison, not a chance of admission.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Grouped matches */}
        {grouped.map(({ category, items }) => (
          <section key={category} className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge className={`${categoryStyle(category)} border font-semibold text-sm px-3 py-1`}>
                {category}
              </Badge>
              <h3 className="text-sm font-semibold text-muted-foreground">
                {categoryHeadline(category, items.length)}
              </h3>
            </div>
            <div className="grid gap-4">
              {items.map((m, i) => {
                const isSafetyPick = safetyPicks.has(m.universityName);
                return (
                  <Card
                    key={m.universityName}
                    id={`uni-${m.universityName.replace(/\s+/g, "-")}`}
                    className="shadow-card hover:shadow-hover transition-all duration-300 border-border/50 overflow-hidden animate-fade-in scroll-mt-20"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <CardContent className="p-6 space-y-5">
                      {/* Front */}
                      <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="w-6 h-6 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-xl font-display font-bold text-foreground truncate">{m.universityName}</h3>
                              {isSafetyPick && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge className="bg-primary/15 text-primary border-primary/30 gap-1 cursor-help">
                                      <Shield className="w-3 h-3" />
                                      Country safety pick
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs text-sm">
                                      One of the 2 highest-scoring verified schools in {m.country} for your profile.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{m.country}</span>
                              <span>•</span>
                              {m.internationalContext.applies ? (
                                <span title={`Overall: ${m.acceptanceRate}%`}>
                                  ~{m.effectiveAcceptanceRate.toFixed(1)}% intl admit
                                  {m.internationalContext.isEstimate ? " (est.)" : ""}
                                </span>
                              ) : (
                                <span>{m.acceptanceRate}% admit rate</span>
                              )}
                              {m.dataSourceUrl && (
                                <a
                                  href={m.dataSourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs underline decoration-dotted text-muted-foreground hover:text-primary"
                                  title="Verified data source"
                                >
                                  verified · {m.dataYear}
                                </a>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{m.oneLiner}</p>
                          </div>
                        </div>
                        <div className="lg:w-56 lg:text-right">
                          <Badge className={`${categoryStyle(m.category)} border font-medium mb-1`}>{m.category}</Badge>
                          <div className="text-3xl font-display font-bold text-foreground leading-none">{m.score}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Alignment range {m.range.min}–{m.range.max}
                          </div>
                        </div>
                      </div>

                      {/* Body — tabs */}
                      <Tabs defaultValue="counselor">
                        <TabsList className="grid grid-cols-4 w-full">
                          <TabsTrigger value="counselor">Counselor</TabsTrigger>
                          <TabsTrigger value="math">Show math</TabsTrigger>
                          <TabsTrigger value="ask">Ask</TabsTrigger>
                          <TabsTrigger value="outcome">Did you apply?</TabsTrigger>
                        </TabsList>
                        <TabsContent value="counselor" className="pt-4">
                          <CounselorCorner
                            blocks={data.ai[m.universityName]}
                            loading={data.aiLoading && !data.ai[m.universityName]}
                            studentCountry={m.internationalContext.studentCountry}
                          />
                        </TabsContent>
                        <TabsContent value="math" className="pt-4">
                          <ShowMath result={m} profile={data.profile} />
                        </TabsContent>
                        <TabsContent value="ask" className="pt-4">
                          <AskAboutUni result={m} profile={data.profile} />
                        </TabsContent>
                        <TabsContent value="outcome" className="pt-4">
                          <OutcomeCapture result={m} />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </TooltipProvider>
  );
};
