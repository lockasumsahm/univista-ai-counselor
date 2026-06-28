// AI-powered comparison: user's unified profile vs an Ivy admit profile.
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Loader2, AlertCircle, CheckCircle2, AlertTriangle, X, Rocket, Brain } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/useProfile";
import { invokeEdgeFunction } from "@/lib/edgeFunctions";
import { toast } from "@/hooks/use-toast";
import type { IvyProfile } from "@/lib/admitIQ/ivyProfiles";

interface DimensionScore {
  user: number;
  ivy: number;
  gap: string;
}

interface CompareResult {
  leadership: DimensionScore;
  research: DimensionScore;
  impact: DimensionScore;
  awards: DimensionScore;
  narrative: DimensionScore;
  missing: string[];
  weak: string[];
  strong: string[];
  howToClose: string[];
}

const safeParseJson = (text: string): CompareResult | null => {
  if (!text) return null;
  // Strip code fences
  let s = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) s = s.slice(start, end + 1);
  try {
    const j = JSON.parse(s);
    return j as CompareResult;
  } catch {
    return null;
  }
};

const fallbackResult = (ivy: IvyProfile, hasProfile: boolean): CompareResult => ({
  leadership: { user: hasProfile ? 55 : 30, ivy: 90, gap: "Add 1–2 multi-year leadership roles with measurable outcomes." },
  research: { user: hasProfile ? 50 : 25, ivy: 88, gap: "Pursue 1 sustained research or independent project with public output." },
  impact: { user: hasProfile ? 50 : 30, ivy: 92, gap: "Quantify your impact (people served, dollars raised, scale of reach)." },
  awards: { user: hasProfile ? 45 : 20, ivy: 85, gap: "Target 1–2 regional/national awards in your strongest area." },
  narrative: { user: hasProfile ? 60 : 30, ivy: 90, gap: "Tie all activities to one consistent thread (e.g. medicine + empathy)." },
  missing: ["Quantified outcomes on each activity", "External validation (press, awards, conference)", "Sustained 3+ year commitment in one area"],
  weak: ["Leadership depth", "Research/independent work output"],
  strong: hasProfile ? ["Profile foundation present"] : [],
  howToClose: [
    `Pick ONE area (like ${ivy.archetype.split(" ")[0]}) and go deep for 2 years.`,
    "Add measurable outcomes to every activity.",
    "Seek external validation — competitions, publications, press.",
    "Connect all activities under one consistent narrative thread.",
  ],
});

export const ProfileComparison = ({
  ivyProfile,
  onBack,
}: {
  ivyProfile: IvyProfile;
  onBack: () => void;
}) => {
  const { unified, profile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      const hasProfile = !!profile?.name && (unified.activities.length > 0 || !!profile?.extracurriculars);

      const prompt = `You are an Ivy League admissions analyst. Compare a student's profile to an admitted Ivy League student profile and return STRICT JSON only.

USER PROFILE (unified):
${JSON.stringify(unified)}

IVY ADMIT PROFILE (${ivyProfile.school} — ${ivyProfile.archetype}):
${JSON.stringify({ activities: ivyProfile.activities, awards: ivyProfile.awards, summary: ivyProfile.summary })}

Return ONLY this JSON shape, no prose, no markdown:
{
  "leadership": { "user": 0-100, "ivy": 0-100, "gap": "1 sentence specific advice" },
  "research":   { "user": 0-100, "ivy": 0-100, "gap": "1 sentence" },
  "impact":     { "user": 0-100, "ivy": 0-100, "gap": "1 sentence" },
  "awards":     { "user": 0-100, "ivy": 0-100, "gap": "1 sentence" },
  "narrative":  { "user": 0-100, "ivy": 0-100, "gap": "1 sentence" },
  "missing": ["2-4 specific things missing"],
  "weak":    ["2-3 weak areas"],
  "strong":  ["1-3 strong matches; empty array if none"],
  "howToClose": ["3-5 concrete actionable steps"]
}`;

      try {
        const { data, status } = await invokeEdgeFunction("chatbot-counselor", {
          message: prompt,
          history: [],
          profile: profile ?? {},
        });
        if (cancelled) return;
        if (status !== 200 || !data?.reply) {
          setResult(fallbackResult(ivyProfile, hasProfile));
          setUsingFallback(true);
        } else {
          const parsed = safeParseJson(String(data.reply));
          if (parsed && parsed.leadership) {
            setResult(parsed);
            setUsingFallback(false);
          } else {
            setResult(fallbackResult(ivyProfile, hasProfile));
            setUsingFallback(true);
          }
        }
      } catch {
        if (!cancelled) {
          setResult(fallbackResult(ivyProfile, hasProfile));
          setUsingFallback(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ivyProfile.id]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
        <ChevronLeft className="w-4 h-4" /> Back to profile
      </Button>

      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-display font-bold">Comparing your profile vs {ivyProfile.school}</h2>
            <p className="text-sm text-muted-foreground">{ivyProfile.archetype}</p>
          </div>
        </div>
      </Card>

      {usingFallback && !loading && (
        <Card className="p-3 border-accent/40 bg-accent/5 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">Showing baseline benchmark. Add more profile detail (activities, awards) for a personalized AI comparison.</p>
        </Card>
      )}

      {loading && (
        <Card className="p-12 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">AI is comparing your profile against {ivyProfile.school}…</p>
        </Card>
      )}

      {!loading && result && (
        <>
          {/* Dimension scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {(["leadership", "research", "impact", "awards", "narrative"] as const).map((k) => {
              const d = result[k];
              if (!d) return null;
              return (
                <Card key={k} className="p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{k}</p>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="text-foreground font-semibold">You {d.user}</span>
                    <span className="text-accent font-semibold">Ivy {d.ivy}</span>
                  </div>
                  <Progress value={d.user} className="h-1.5 mb-1" />
                  <Progress value={d.ivy} className="h-1.5 [&>div]:bg-accent" />
                  <p className="text-[11px] text-muted-foreground mt-2 leading-snug">{d.gap}</p>
                </Card>
              );
            })}
          </div>

          {/* Insight panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.strong?.length > 0 && (
              <Card className="p-4 border-success/30 bg-success/5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <p className="font-semibold text-sm">Strong matches</p>
                </div>
                <ul className="space-y-1.5 text-xs">
                  {result.strong.map((s, i) => <li key={i} className="flex gap-2"><span className="text-success">✓</span><span>{s}</span></li>)}
                </ul>
              </Card>
            )}
            {result.weak?.length > 0 && (
              <Card className="p-4 border-accent/30 bg-accent/5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-accent" />
                  <p className="font-semibold text-sm">Weak areas</p>
                </div>
                <ul className="space-y-1.5 text-xs">
                  {result.weak.map((s, i) => <li key={i} className="flex gap-2"><span className="text-accent">⚠</span><span>{s}</span></li>)}
                </ul>
              </Card>
            )}
            {result.missing?.length > 0 && (
              <Card className="p-4 border-destructive/30 bg-destructive/5">
                <div className="flex items-center gap-2 mb-2">
                  <X className="w-4 h-4 text-destructive" />
                  <p className="font-semibold text-sm">Missing</p>
                </div>
                <ul className="space-y-1.5 text-xs">
                  {result.missing.map((s, i) => <li key={i} className="flex gap-2"><span className="text-destructive">✗</span><span>{s}</span></li>)}
                </ul>
              </Card>
            )}
            {result.howToClose?.length > 0 && (
              <Card className="p-4 border-primary/30 bg-primary/5">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="w-4 h-4 text-primary" />
                  <p className="font-semibold text-sm">How to close the gap</p>
                </div>
                <ul className="space-y-1.5 text-xs">
                  {result.howToClose.map((s, i) => <li key={i} className="flex gap-2"><Badge variant="outline" className="h-5 text-[10px]">{i + 1}</Badge><span>{s}</span></li>)}
                </ul>
              </Card>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};
