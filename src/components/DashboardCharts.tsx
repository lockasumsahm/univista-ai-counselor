import { Card } from "@/components/ui/card";
import { BarChart3, PieChart, TrendingUp, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardChartsProps {
  cvAnalysis: any;
  universityMatch: any;
  essayScholarship: any;
}

export const DashboardCharts = ({
  cvAnalysis,
  universityMatch,
  essayScholarship,
}: DashboardChartsProps) => {
  const { t } = useLanguage();
  
  if (!cvAnalysis && !universityMatch && !essayScholarship) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <Sparkles className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">{t('nav.dashboard')}</h2>
          <p className="text-muted-foreground">{t('welcome.subtitle')}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {cvAnalysis && (
          <Card className="p-6 shadow-card hover:shadow-hover transition-all duration-300 border-border/50 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground">{t('analysis.profileScore')}</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-end gap-4 h-40">
                  <div className="flex-1 flex flex-col items-center">
                    <div className="text-sm text-muted-foreground mb-2">{t('analysis.score')}</div>
                    <div 
                      className="w-full bg-gradient-primary rounded-t-lg flex items-end justify-center pb-3 transition-all duration-500"
                      style={{ height: `${cvAnalysis.score}%` }}
                    >
                      <span className="text-2xl font-bold text-primary-foreground">{cvAnalysis.score}</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="text-sm text-muted-foreground mb-2">Avg</div>
                    <div 
                      className="w-full bg-accent/80 rounded-t-lg flex items-end justify-center pb-3"
                      style={{ height: '70%' }}
                    >
                      <span className="text-2xl font-bold text-accent-foreground">70</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="text-sm text-muted-foreground mb-2">Top 10%</div>
                    <div 
                      className="w-full bg-success rounded-t-lg flex items-end justify-center pb-3"
                      style={{ height: '90%' }}
                    >
                      <span className="text-2xl font-bold text-success-foreground">90</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {universityMatch && (
          <Card className="p-6 shadow-card hover:shadow-hover transition-all duration-300 border-border/50 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground">{t('match.title')}</h3>
              </div>
              <div className="space-y-4">
                {universityMatch.matches.slice(0, 5).map((uni: any, i: number) => (
                  <div key={i} className="space-y-2 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground truncate max-w-[60%]">{uni.name}</span>
                      <span className="text-primary font-semibold ml-2">{uni.acceptanceProbability}%</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary transition-all duration-700 rounded-full"
                        style={{ width: `${uni.acceptanceProbability}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {essayScholarship && (
          <Card className="p-6 shadow-card hover:shadow-hover transition-all duration-300 border-border/50 md:col-span-2 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-5 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground">{t('nav.scholarships')}</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {essayScholarship.scholarships.map((scholarship: any, i: number) => (
                  <div 
                    key={i} 
                    className="bg-muted/50 p-4 rounded-xl border border-border/30 hover:border-accent/30 transition-all animate-fade-in"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-medium text-foreground">{scholarship.name}</span>
                      <span className="text-lg font-bold text-accent">{scholarship.probability}%</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-accent transition-all duration-700 rounded-full"
                        style={{ width: `${scholarship.probability}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
