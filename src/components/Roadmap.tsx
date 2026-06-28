import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, Clock, Loader2, RefreshCw, Sparkles, AlertTriangle, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { AIStatusNotice, type AIStatus } from "@/components/AIStatusNotice";
import { invokeEdgeFunction } from "@/lib/edgeFunctions";
import { buildComprehensiveCV } from "@/lib/profileSummary";
import { useToast } from "@/hooks/use-toast";
import { ProfileGate } from "@/components/ProfileGate";

interface RoadmapTask {
  task: string;
  category?: string;
  priority?: string;
}

interface RoadmapStep {
  month: string;
  title?: string;
  actions: string[];
  tasks?: RoadmapTask[];
}

interface RoadmapResult {
  roadmap: RoadmapStep[];
  milestones?: any[];
  improvementPlan?: any;
  finalGuidance?: string;
  profileSummary?: string;
}

export const Roadmap = () => {
  const { t } = useLanguage();
  const { profile } = useProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<RoadmapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);

  const canGenerate = profile?.gpa && profile?.extracurriculars;

  const generate = async () => {
    if (!user || !profile) return;
    setLoading(true);
    setAiStatus(null);
    try {
      const cvText = buildComprehensiveCV(profile);
      const { data: json, status } = await invokeEdgeFunction("university-counselor", { action: "roadmap", profile, cvText });
      if (status === 429) { setAiStatus("rateLimit"); return; }
      if (status === 402) { setAiStatus("credits"); return; }
      if (!json) { setAiStatus("error"); return; }
      if (json.success && json.result) {
        const result = json.result;
        // Normalize: the AI may return steps under "roadmap" or "steps"
        const steps = result.roadmap || result.steps || [];
        // Normalize tasks/actions: AI may return tasks as objects or actions as strings
        const normalizedSteps = steps.map((step: any) => {
          const actions = step.actions || (step.tasks ? step.tasks.map((t: any) => typeof t === 'string' ? t : t.task) : []);
          return { ...step, actions };
        });
        setData({ ...result, roadmap: normalizedSteps });
      } else {
        setAiStatus("error");
      }
    } catch {
      setAiStatus("error");
    } finally {
      setLoading(false);
    }
  };

  if (aiStatus) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Header t={t} />
        <AIStatusNotice status={aiStatus} onRetry={generate} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Header t={t} />
        <Card className="border-border/50">
          <CardContent className="py-20 text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Generating Your Roadmap…</h3>
            <p className="text-muted-foreground">Our AI is building a personalized 12-month timeline based on your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    if (!canGenerate) {
      return (
        <div className="space-y-6 animate-fade-in">
          <Header t={t} />
          <ProfileGate
            profile={profile}
            featureName="12-month roadmap"
            description="To generate a personalized month-by-month plan, we need your GPA and extracurriculars to know where to focus."
          >
            <div />
          </ProfileGate>
        </div>
      );
    }
    return (
      <div className="space-y-6 animate-fade-in">
        <Header t={t} />
        <Card className="border-dashed border-2 border-border/60">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Calendar className="w-10 h-10 text-primary/60" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{t('roadmap.empty') || 'No Roadmap Generated Yet'}</h3>
            <Button onClick={generate} size="lg" className="mt-4 gap-2">
              <Sparkles className="w-5 h-5" />
              Generate My Roadmap
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Header t={t} />
        <Button variant="outline" size="sm" onClick={generate} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </Button>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
        <div className="space-y-4">
          {data.roadmap.map((step, i) => (
            <Card
              key={i}
              className="cv-auto shadow-card hover:shadow-hover transition-all duration-300 border-border/50 animate-fade-in md:ml-12"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="hidden md:flex absolute -left-6 w-12 h-12 rounded-full bg-primary text-primary-foreground items-center justify-center font-bold text-lg shadow-glow">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="md:hidden w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {i + 1}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" />
                        <span className="font-semibold text-accent">{step.month}</span>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {step.actions.map((action, j) => (
                        <li key={j} className="flex items-start gap-3 group">
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <span className="text-foreground">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Milestones */}
      {data.milestones && data.milestones.length > 0 && (
        <Card className="border-border/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" /> Key Milestones
            </h3>
            <ul className="space-y-2">
              {data.milestones.map((m: any, i: number) => (
                <li key={i} className="flex items-start gap-2 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-medium">{typeof m === 'string' ? m : m.milestone}</span>
                    {m.targetDate && <span className="text-muted-foreground text-sm ml-2">({m.targetDate})</span>}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Final Guidance */}
      {data.finalGuidance && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" /> Final Guidance
            </h3>
            <p className="text-foreground">{data.finalGuidance}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const Header = ({ t }: { t: (key: string) => string }) => (
  <div className="flex items-center gap-4 mb-2">
    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
      <Calendar className="w-7 h-7 text-primary" />
    </div>
    <div>
      <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">{t('roadmap.title')}</h2>
      <p className="text-muted-foreground">{t('roadmap.subtitle')}</p>
    </div>
  </div>
);

export default Roadmap;
