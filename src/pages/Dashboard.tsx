import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { OnboardingTour, shouldShowOnboarding } from "@/components/OnboardingTour";
import { AIStatusNotice, type AIStatus } from "@/components/AIStatusNotice";
import { Skeleton } from "@/components/ui/skeleton";
import { invokeEdgeFunction } from "@/lib/edgeFunctions";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { JourneyStepper } from "@/components/JourneyStepper";
import { usePrograms } from "@/hooks/usePrograms";
import { computeCompleteness } from "@/lib/profileCompleteness";
import { AppHealthCheck } from "@/components/AppHealthCheck";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { CounselingCTA } from "@/components/CounselingCTA";
import { CommonAppChecklist } from "@/components/CommonAppChecklist";
import { OutcomeNudge } from "@/components/OutcomeNudge";
import {
  Edit, GraduationCap, Sparkles, BarChart3, School, Map, Award,
  MessageCircle, TrendingUp, FileText, Zap, HelpCircle, Target,
  BookOpen, Mic, FileCheck, Clock, Users, Upload, Lightbulb,
  CheckCircle2, ArrowRight, ChevronRight
} from "lucide-react";

const DAILY_TIPS = [
  { icon: Lightbulb, tip: "Students who upload recommendation letters get 25% more accurate match predictions.", action: "Upload Documents", path: "/dashboard/documents" },
  { icon: Lightbulb, tip: "Practice mock interviews to boost your confidence. Top schools weigh interviews heavily.", action: "Try Interview Prep", path: "/dashboard/interview" },
  { icon: Lightbulb, tip: "Essays make up 14% of your admission score. Use our AI coach to refine yours.", action: "Open Essay Coach", path: "/dashboard/essay-coach" },
  { icon: Lightbulb, tip: "Track your application deadlines to never miss an Early Decision date.", action: "Set Deadlines", path: "/dashboard/deadlines" },
  { icon: Lightbulb, tip: "Compare universities side-by-side to make informed decisions about your future.", action: "Compare Universities", path: "/dashboard/compare" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { programs } = usePrograms();
  const { toast } = useToast();
  const [cvAnalysis, setCvAnalysis] = useState<any>(null);
  const [universityMatch, setUniversityMatch] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [autoAnalyzed, setAutoAnalyzed] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<AIStatus | null>(null);

  const dailyTip = DAILY_TIPS[new Date().getDay() % DAILY_TIPS.length];

  useEffect(() => {
    if (!profileLoading && profile && shouldShowOnboarding()) {
      setShowTour(true);
    }
  }, [profileLoading, profile]);

  const hasRequiredFields = (p: any) => p?.gpa?.trim() && p?.extracurriculars?.trim();

  const [hasRedirected, setHasRedirected] = useState(false);
  useEffect(() => {
    if (!profileLoading && !hasRedirected) {
      setHasRedirected(true);
      if (!profile?.name) {
        navigate("/dashboard/profile", { replace: true });
      }
    }
  }, [profile, profileLoading, navigate, hasRedirected]);

  useEffect(() => {
    if (profile && hasRequiredFields(profile) && !autoAnalyzed && !cvAnalysis && !loading) {
      setAutoAnalyzed(true);
      // Defer AI analysis to avoid blocking first paint
      const id = typeof requestIdleCallback !== 'undefined'
        ? requestIdleCallback(() => runAnalysis(profile))
        : setTimeout(() => runAnalysis(profile), 200) as unknown as number;
      return () => {
        if (typeof cancelIdleCallback !== 'undefined') cancelIdleCallback(id);
        else clearTimeout(id);
      };
    }
  }, [profile, autoAnalyzed, cvAnalysis, loading]);

  const runAnalysis = async (profileData: any) => {
    setLoading(true);
    setAnalysisStatus(null);

    let shownToast = false;
    let nextStatus: AIStatus | null = null;

    const handleStatus = (status: AIStatus) => {
      if (!nextStatus) {
        nextStatus = status;
        setAnalysisStatus(status);
      }

      if (shownToast) return;
      shownToast = true;

      if (status === "credits") {
        toast({ title: "AI Credits", description: "AI credits exhausted. Add credits in Settings → Cloud & AI balance.", variant: "destructive" });
      } else if (status === "rateLimit") {
        toast({ title: "Rate Limited", description: "Too many requests. Please wait a moment.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: "Failed to analyze your profile. Try again.", variant: "destructive" });
      }
    };

    try {
      const cvText = `GPA: ${profileData.gpa}, Test Scores: ${profileData.testScores}, Activities: ${profileData.extracurriculars}`;

      const handleRes = async (body: any) => {
        try {
          const { data, status } = await invokeEdgeFunction("university-counselor", body);
          if (status === 402) { handleStatus("credits"); return null; }
          if (status === 429) { handleStatus("rateLimit"); return null; }
          return data;
        } catch {
          handleStatus("error");
          return null;
        }
      };

      const [cvRes, uniRes] = await Promise.allSettled([
        handleRes({ action: 'analyzeCV', profile: profileData, cvText }),
        handleRes({ action: 'universityMatch', profile: profileData, cvText, countries: '' }),
      ]);

      if (cvRes.status === 'fulfilled' && cvRes.value?.result) {
        const r = cvRes.value.result;
        setCvAnalysis({
          score: r.score || r.overallScore || 0,
          strengths: Array.isArray(r.strengths) ? r.strengths.length : 0,
          weaknesses: Array.isArray(r.weaknesses) ? r.weaknesses.length : 0,
        });
      }

      if (uniRes.status === 'fulfilled' && uniRes.value?.result) {
        setUniversityMatch({
          count: uniRes.value.result.universities?.length || 0,
          topMatch: uniRes.value.result.universities?.[0]?.name || "N/A",
          topChance: uniRes.value.result.universities?.[0]?.matchPercentage || 0,
        });
      }

      if (!nextStatus && ((cvRes.status === 'fulfilled' && cvRes.value?.result) || (uniRes.status === 'fulfilled' && uniRes.value?.result))) {
        setAnalysisStatus(null);
      }
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || "";
      if (msg.includes("402") || msg.includes("credits")) {
        handleStatus("credits");
      } else if (msg.includes("429")) {
        handleStatus("rateLimit");
      } else {
        handleStatus("error");
      }
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const sharedCompleteness = computeCompleteness(profile);
  const completeness = sharedCompleteness.percent;

  // Profile strength factors
  const strengthFactors = [
    { label: "GPA", key: "gpa", icon: BarChart3 },
    { label: "Test Scores", key: "testScores", icon: TrendingUp },
    { label: "Activities", key: "extracurriculars", icon: Users },
    { label: "Course Rigor", key: "courseRigor", icon: BookOpen },
    { label: "Awards", key: "apIbCourses", icon: Award },
    { label: "Research", key: "researchExperience", icon: FileText },
    { label: "Volunteering", key: "volunteerHours", icon: Sparkles },
    { label: "Work Exp.", key: "workExperience", icon: Target },
    { label: "Athletics", key: "athleticsStatus", icon: Mic },
    { label: "Talents", key: "artsPortfolio", icon: Zap },
  ];
  const filledStrength = strengthFactors.filter(f => profile?.[f.key]?.toString()?.trim()).length;

  const quickActions = [
    { label: "Profile Score", icon: BarChart3, path: "/dashboard/results", color: "from-primary/10 to-primary/5", iconColor: "text-primary", desc: "AI analysis" },
    { label: "Uni Matches", icon: GraduationCap, path: "/dashboard/matches", color: "from-success/10 to-success/5", iconColor: "text-success", desc: "Find schools" },
    { label: "Uni Checker", icon: School, path: "/dashboard/checker", color: "from-accent/10 to-accent/5", iconColor: "text-accent", desc: "Check chances" },
    { label: "Documents", icon: Upload, path: "/dashboard/documents", color: "from-primary/10 to-primary/5", iconColor: "text-primary", desc: "Upload & analyze" },
    { label: "Roadmap", icon: Map, path: "/dashboard/roadmap", color: "from-warning/10 to-warning/5", iconColor: "text-warning", desc: "Step-by-step plan" },
    { label: "AI Chat", icon: MessageCircle, path: "/dashboard/chat", color: "from-accent/10 to-accent/5", iconColor: "text-accent", desc: "Ask anything" },
  ];

  const moreTools = [
    { label: "Scholarships", icon: Award, path: "/dashboard/scholarships" },
    { label: "Essay Coach", icon: BookOpen, path: "/dashboard/essay-coach" },
    { label: "Essay AI", icon: FileCheck, path: "/dashboard/essay-upload" },
    { label: "Deadlines", icon: Clock, path: "/dashboard/deadlines" },
    { label: "Interview", icon: Mic, path: "/dashboard/interview" },
    { label: "Doc Optimizer", icon: FileText, path: "/dashboard/doc-optimizer" },
    { label: "Compare", icon: Target, path: "/dashboard/compare" },
    { label: "Community", icon: Users, path: "/dashboard/community" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="surface-premium rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/[0.06] rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-accent/[0.06] rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl pointer-events-none" />
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="flex-1 min-w-0">
                <p className="eyebrow mb-2">Your dashboard</p>
                <h1 className="text-[26px] md:text-[32px] font-display font-semibold tracking-tight leading-[1.1]">
                  Welcome back,{' '}
                  <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                    {profile?.name || user?.email?.split('@')[0]}
                  </span>
                </h1>
                <p className="text-muted-foreground text-sm mt-2 max-w-xl">
                  {loading
                    ? "Running AI analysis on your profile…"
                    : analysisStatus === "credits"
                      ? "AI analysis is paused until more credits are added."
                      : hasRequiredFields(profile)
                        ? "Your AI counseling workspace is ready. Pick up where you left off."
                        : "Complete your profile to unlock AI analysis and matches."}
                </p>
                <div className="mt-4 max-w-sm">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Profile completeness</span>
                    <span className="font-semibold text-foreground tabular-nums">{completeness}%</span>
                  </div>
                  <Progress value={completeness} className="h-1.5" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/profile")} className="gap-2 rounded-xl">
                  <Edit className="w-3.5 h-3.5" />
                  Edit profile
                </Button>
                <Button variant="outline" size="sm" onClick={() => { localStorage.removeItem("univista_onboarding_complete"); setShowTour(true); }} className="gap-2 rounded-xl">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Tour
                </Button>
                <AppHealthCheck triggerClassName="gap-2 rounded-xl" />
                {(cvAnalysis || analysisStatus) && (
                  <Button variant="outline" size="sm" onClick={() => { setAutoAnalyzed(false); setCvAnalysis(null); setUniversityMatch(null); setAnalysisStatus(null); }} className="gap-2 rounded-xl">
                    <Sparkles className="w-3.5 h-3.5" />
                    Refresh
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="hairline-glow" />
        </div>
      </motion.div>

      {/* Guided journey stepper — shows users exactly what to do next */}
      <JourneyStepper
        profile={profile}
        hasAnalysis={!!cvAnalysis}
        hasMatches={!!universityMatch}
        hasApplications={programs.length > 0}
      />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-accent/20 bg-accent/5 hover:bg-accent/8 transition-colors cursor-pointer" onClick={() => navigate(dailyTip.path)}>
          <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
              <dailyTip.icon className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-foreground font-medium">💡 Tip of the Day</p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{dailyTip.tip}</p>
            </div>
            <Button size="sm" variant="ghost" className="shrink-0 text-accent hover:text-accent gap-1 hidden sm:flex">
              {dailyTip.action}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile Strength Meter */}
      {filledStrength < strengthFactors.length && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-border/30">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Profile Strength — {filledStrength}/{strengthFactors.length} factors
                </h3>
                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/profile")} className="text-xs text-primary gap-1 rounded-xl">
                  Complete <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {strengthFactors.map((f) => {
                  const filled = !!profile?.[f.key]?.toString()?.trim();
                  return (
                    <span key={f.key} className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                      filled ? "bg-success/10 border-success/20 text-success" : "bg-muted/30 border-border/30 text-muted-foreground"
                    }`}>
                      {filled ? <CheckCircle2 className="w-3 h-3" /> : <f.icon className="w-3 h-3" />}
                      {f.label}
                    </span>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {(cvAnalysis || universityMatch) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cvAnalysis && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-border/30 hover:border-primary/20 transition-colors cursor-pointer group" onClick={() => navigate("/dashboard/results")}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">Profile Score</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-all" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{cvAnalysis.score}<span className="text-lg text-muted-foreground">/100</span></p>
                  <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="text-success">✓ {cvAnalysis.strengths} strengths</span>
                    <span className="text-warning">⚠ {cvAnalysis.weaknesses} to improve</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          {universityMatch && (
            <>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="border-border/30 hover:border-primary/20 transition-colors cursor-pointer group" onClick={() => navigate("/dashboard/matches")}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                          <School className="w-5 h-5 text-accent" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Top Match</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-all" />
                    </div>
                    <p className="text-lg font-bold text-foreground truncate">{universityMatch.topMatch}</p>
                    <p className="text-sm text-muted-foreground">{universityMatch.topChance}% match</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="border-border/30 hover:border-primary/20 transition-colors cursor-pointer group" onClick={() => navigate("/dashboard/matches")}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-success" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Universities</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-all" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">{universityMatch.count}</p>
                    <p className="text-sm text-muted-foreground">matched for you</p>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>
      )}

      {loading && (
        <AnalysisProgress active title="Analyzing your profile" />
      )}

      {!loading && analysisStatus && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AIStatusNotice status={analysisStatus} onRetry={profile && hasRequiredFields(profile) ? () => runAnalysis(profile) : undefined} />
        </motion.div>
      )}

      <div>
        <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, i) => (
            <motion.div key={action.path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
              <Card className="border-border/30 hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer group" onClick={() => navigate(action.path)}>
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                  </div>
                  <p className="text-sm font-medium text-foreground">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          More Tools
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {moreTools.map((tool, i) => (
            <motion.div key={tool.path} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * i }}>
              <button
                onClick={() => navigate(tool.path)}
                className="w-full p-3 rounded-xl border border-border/30 hover:border-primary/20 hover:bg-muted/50 transition-all flex flex-col items-center gap-2 group"
              >
                <tool.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors font-medium">{tool.label}</span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <OutcomeNudge />

      <CounselingCTA />

      <CommonAppChecklist />


    </div>

  );
};

export default Dashboard;
