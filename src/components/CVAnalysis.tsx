import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, TrendingUp, Sparkles, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CVAnalysisData {
  strengths: string[];
  weaknesses: string[];
  score: number;
  recommendations: string[];
}

export const CVAnalysis = ({ data }: { data: CVAnalysisData | null }) => {
  const { t } = useLanguage();
  
  if (!data) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-accent";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return t('analysis.excellent');
    if (score >= 70) return t('analysis.strong');
    if (score >= 55) return t('analysis.good');
    return t('analysis.needsWork');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-card border-border/50 overflow-hidden">
        <CardHeader className="bg-gradient-card border-b border-border/50 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">{t('analysis.cvTitle')}</h2>
                <p className="text-muted-foreground">{t('analysis.subtitle')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-card p-4 rounded-2xl shadow-sm">
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">{t('analysis.profileScore')}</p>
                <p className={`text-4xl font-display font-bold ${getScoreColor(data.score)}`}>
                  {data.score}
                </p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  data.score >= 70 ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'
                }`}>
                  {getScoreLabel(data.score)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Progress value={data.score} className="h-3 rounded-full" />
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Strengths */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground">{t('analysis.strengths')}</h3>
              </div>
              <ul className="space-y-3">
                {(data.strengths || []).map((strength, i) => (
                  <li 
                    key={i} 
                    className="flex items-start gap-3 p-3 bg-success/5 rounded-xl border border-success/10 animate-fade-in"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <span className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-success" />
                    </span>
                    <span className="text-foreground">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground">{t('analysis.weaknesses')}</h3>
              </div>
              <ul className="space-y-3">
                {(data.weaknesses || []).map((weakness, i) => (
                  <li 
                    key={i} 
                    className="flex items-start gap-3 p-3 bg-destructive/5 rounded-xl border border-destructive/10 animate-fade-in"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <span className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <XCircle className="w-3.5 h-3.5 text-destructive" />
                    </span>
                    <span className="text-foreground">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground">{t('analysis.recommendations')}</h3>
            </div>
            <div className="grid gap-3">
              {(data.recommendations || []).map((rec, i) => (
                <div 
                  key={i} 
                  className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl border border-border/50 hover:shadow-sm transition-all animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-foreground leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
