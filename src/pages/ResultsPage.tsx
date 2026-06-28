import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CVAnalysis } from "@/components/CVAnalysis";
import { useProfile } from "@/hooks/useProfile";
import { useDocumentAnalyses } from "@/hooks/useDocumentAnalyses";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { AIStatusNotice, type AIStatus } from "@/components/AIStatusNotice";
import { invokeEdgeFunction } from "@/lib/edgeFunctions";
import { buildComprehensiveCV, buildDocumentBoost } from "@/lib/profileSummary";
import { Sparkles } from "lucide-react";
import { ProfileGate } from "@/components/ProfileGate";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { computeCompleteness } from "@/lib/profileCompleteness";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight, Info } from "lucide-react";

const ResultsPage = () => {
  const { profile } = useProfile();
  const { analyses } = useDocumentAnalyses();
  const { toast } = useToast();
  const [cvAnalysis, setCvAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [autoRan, setAutoRan] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<AIStatus | null>(null);
  const [analysisCause, setAnalysisCause] = useState<string | undefined>(undefined);

  const hasRequired = (p: any) => p?.gpa?.trim() && p?.extracurriculars?.trim();

  useEffect(() => {
    if (profile && hasRequired(profile) && !autoRan && !cvAnalysis && !loading) {
      setAutoRan(true);
      runAnalysis();
    }
  }, [profile, autoRan, cvAnalysis, loading]);

  const runAnalysis = async () => {
    if (!profile || !hasRequired(profile)) return;

    setLoading(true);
    setAnalysisStatus(null);
    setAnalysisCause(undefined);

    const handleStatus = (status: AIStatus, cause?: string) => {
      setAnalysisStatus(status);
      setAnalysisCause(cause);

      if (status === "credits") {
        toast({ title: "AI credits exhausted", description: "Add credits in Settings → Cloud & AI balance, then try again.", variant: "destructive" });
      } else if (status === "rateLimit") {
        toast({ title: "Rate limit reached", description: "Wait 30–60 seconds, then try again.", variant: "destructive" });
      } else if (status === "network") {
        toast({ title: "Network problem", description: "Check your internet connection.", variant: "destructive" });
      } else {
        toast({ title: "Couldn't analyze profile", description: "Press Try again — we'll show you why below.", variant: "destructive" });
      }
    };

    try {
      const cvText = buildComprehensiveCV(profile, analyses);
      const documentBoost = buildDocumentBoost(analyses);
      const { data, status } = await invokeEdgeFunction("university-counselor", { action: 'analyzeCV', profile, cvText, documentBoost });

      if (status === 402) { handleStatus("credits"); return; }
      if (status === 429) { handleStatus("rateLimit"); return; }

      if (data?.result) {
        const r = data.result;
        setCvAnalysis({
          ...r,
          score: r.score || r.overallScore || 0,
          strengths: Array.isArray(r.strengths) ? r.strengths.map((s: any) => typeof s === 'string' ? s : s.text || s.strength || JSON.stringify(s)) : [],
          weaknesses: Array.isArray(r.weaknesses) ? r.weaknesses.map((w: any) => typeof w === 'string' ? w : w.text || w.weakness || JSON.stringify(w)) : [],
          recommendations: Array.isArray(r.recommendations) ? r.recommendations.map((rec: any) => typeof rec === 'string' ? rec : rec.text || rec.recommendation || JSON.stringify(rec)) : [],
        });
        setAnalysisStatus(null);
        toast({ title: "✨ Analysis Complete", description: "Your profile score is ready!" });
        return;
      }

      handleStatus("error", "AI returned no result payload.");
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);

      if (msg.includes("402") || msg.toLowerCase().includes("credits")) {
        handleStatus("credits", msg);
      } else if (msg.includes("429")) {
        handleStatus("rateLimit", msg);
      } else if (msg.toLowerCase().includes("network") || msg.toLowerCase().includes("fetch")) {
        handleStatus("network", msg);
      } else {
        handleStatus("error", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Profile Score & CV Analysis</h1>
          <p className="text-muted-foreground text-sm">AI-powered assessment of your academic profile</p>
        </div>
        {hasRequired(profile) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAutoRan(false);
              setCvAnalysis(null);
              setAnalysisStatus(null);
            }}
            disabled={loading}
            className="gap-2 rounded-xl"
          >
            <Sparkles className="w-4 h-4" />
            Refresh
          </Button>
        )}
      </motion.div>

      <ProfileGate
        profile={profile}
        featureName="profile score"
        description="To generate an accurate profile score, we need your academic details — GPA and extracurriculars at minimum."
      >
        {loading && (
          <AnalysisProgress active overlay={!cvAnalysis} title="Analyzing your profile" />
        )}

        {!loading && analysisStatus && (() => {
          const completeness = computeCompleteness(profile);
          if (analysisStatus === "error" && completeness.percent < 70) {
            return (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Info className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-display font-semibold text-lg">Your profile isn't complete yet</h3>
                      <p className="text-sm text-muted-foreground">
                        We couldn't generate a full AI analysis because key parts of your profile are still missing
                        ({completeness.percent}% complete). Add a few more details and we'll score you accurately.
                      </p>
                      <Button asChild size="sm" className="rounded-xl gap-2 mt-2">
                        <Link to="/dashboard/profile">Complete profile <ArrowRight className="w-4 h-4" /></Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          }
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AIStatusNotice status={analysisStatus} onRetry={runAnalysis} cause={analysisCause} />
            </motion.div>
          );
        })()}

        {!loading && cvAnalysis && (
          <ErrorBoundary><CVAnalysis data={cvAnalysis} /></ErrorBoundary>
        )}
      </ProfileGate>
    </div>
  );
};

export default ResultsPage;
