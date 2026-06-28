import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { UniversityMatch } from "@/components/UniversityMatch";
import { useProfile } from "@/hooks/useProfile";
import { useUniversityMatch } from "@/hooks/useUniversityMatch";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { AIStatusNotice } from "@/components/AIStatusNotice";
import { Sparkles, GraduationCap, BookOpen } from "lucide-react";
import { ProfileGate } from "@/components/ProfileGate";
import { NotIncludedPanel } from "@/components/match/NotIncludedPanel";
import { CountryPathway } from "@/components/match/CountryPathway";
import { TopPickCard } from "@/components/match/TopPickCard";
import { PageHeader } from "@/components/PageHeader";
import { GenerateButton } from "@/components/GenerateButton";
import { MissingDataPanel } from "@/components/trust/MissingDataPanel";

const UniversityMatchPage = () => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const { selection, ai, loading, aiLoading, status, run, usedGlobalFallback } = useUniversityMatch(profile);

  const hasRequired = (p: any) => p?.gpa?.trim() && p?.extracurriculars?.trim();

  useEffect(() => {
    if (profile && hasRequired(profile) && !selection && !loading) {
      run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  useEffect(() => {
    if (status === "ok") {
      const tp = selection?.topPick;
      toast({
        title: tp ? `Your #1 pick: ${tp.universityName}` : "Alignment ready",
        description: tp
          ? `${tp.range.min}–${tp.range.max}% alignment in ${tp.country}. Computed against verified data.`
          : "Computed against verified university data.",
      });
    }
    if (status === "credits") toast({ title: "AI credits", description: "Add credits to unlock counselor notes.", variant: "destructive" });
    if (status === "rateLimit") toast({ title: "Rate limited", description: "Please wait a moment.", variant: "destructive" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        eyebrow="Alignment"
        title="University Alignment"
        subtitle="Data-driven comparisons between your profile and each university's published admit data."
        icon={GraduationCap}
        actions={
          <>
            <Button asChild variant="ghost" size="sm" className="gap-2 rounded-xl">
              <Link to="/dashboard/methodology"><BookOpen className="w-4 h-4" /> How it's calculated</Link>
            </Button>
            {hasRequired(profile) && (
              <GenerateButton
                onClick={run}
                loading={loading || aiLoading}
                hasResult={!!selection}
                size="sm"
                label="Generate matches"
                regenerateLabel="Re-run matches"
                loadingLabel="Matching…"
              />
            )}
          </>
        }
      />

      <ProfileGate
        profile={profile}
        featureName="university alignment"
        description="To compare you to verified admit data, we need your academic foundation — GPA, extracurriculars, and any test scores or target countries you've set."
      >
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="relative mx-auto w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <GraduationCap className="absolute inset-0 m-auto w-6 h-6 text-primary/60" />
            </div>
            <p className="font-medium">Computing alignment against verified data…</p>
          </motion.div>
        )}

        {!loading && (status === "credits" || status === "rateLimit" || status === "error") && !selection && (
          <AIStatusNotice status={status === "credits" ? "credits" : status === "rateLimit" ? "rateLimit" : "error"} onRetry={run} />
            )}
            <MissingDataPanel profile={profile} limit={4} />


        {selection && selection.included.length > 0 && (
          <ErrorBoundary>
            {usedGlobalFallback && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground/90">
                <strong className="text-primary">We expanded your search.</strong>{" "}
                No verified universities in your selected target countries matched, so we're
                showing the best-fit verified universities worldwide based on your profile.
                Update your target countries in your profile for region-specific picks.
              </div>
            )}
            {selection.topPick && (
              <TopPickCard
                topPick={selection.topPick}
                topPickByCountry={selection.topPickByCountry}
                onSeeBreakdown={(name) => {
                  const el = document.getElementById(`uni-${name.replace(/\s+/g, "-")}`);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />
            )}
            {Array.isArray((profile as any)?.preferredCountries || (profile as any)?.target_countries) && (
              <CountryPathway
                countries={(profile as any).preferredCountries || (profile as any).target_countries || []}
              />
            )}
            <UniversityMatch data={{ matches: selection.included, ai, aiLoading, profile }} />
          </ErrorBoundary>
        )}

        {selection && selection.included.length === 0 && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-4 text-sm text-foreground/90">
            <strong className="text-primary">Add a bit more profile detail to unlock matches.</strong>{" "}
            We couldn't compute alignment because key academic fields (GPA, test scores, or activities)
            are missing. Open your profile, fill those in, and we'll match you against verified admit data
            from universities worldwide.
          </div>
        )}

        {selection && selection.notIncluded.length > 0 && (
          <NotIncludedPanel items={selection.notIncluded.slice(0, 50)} />
        )}
      </ProfileGate>
    </div>
  );
};

export default UniversityMatchPage;
