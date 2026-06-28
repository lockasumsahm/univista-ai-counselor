import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Scale, X, GraduationCap, DollarSign, MapPin, 
  TrendingUp, TrendingDown, Minus, Users, Calendar, 
  Award, BookOpen, CheckCircle2, Sparkles, Loader2
} from "lucide-react";
import { universityDatabase, UniversityStats } from "@/lib/universityData";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { invokeEdgeFunction } from "@/lib/edgeFunctions";
import ReactMarkdown from "react-markdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ComparisonProps {
  profile?: any;
}

export const UniversityComparison = ({ profile }: ComparisonProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedUniversities, setSelectedUniversities] = useState<UniversityStats[]>([]);
  const [verdict, setVerdict] = useState<any>(null);
  const [loadingVerdict, setLoadingVerdict] = useState(false);
  const maxCompare = 2;

  const addUniversity = (name: string) => {
    const uni = universityDatabase.find(u => u.name === name);
    if (uni && selectedUniversities.length < maxCompare && !selectedUniversities.find(u => u.name === name)) {
      setSelectedUniversities([...selectedUniversities, uni]);
      setVerdict(null);
    }
  };

  const removeUniversity = (name: string) => {
    setSelectedUniversities(selectedUniversities.filter(u => u.name !== name));
    setVerdict(null);
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-destructive" />;
    if (trend === 'increasing') return <TrendingUp className="w-4 h-4 text-success" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const getMatchScore = (uni: UniversityStats): number => {
    if (!profile) return 0;
    let score = 50;
    const gpa = parseFloat(profile.gpa) || 0;
    const testScore = parseInt(profile.testScores) || 0;
    if (gpa >= uni.medianGPA) score += 20;
    else if (gpa >= uni.medianGPA - 0.2) score += 10;
    else score -= 10;
    if (testScore >= uni.medianSAT) score += 20;
    else if (testScore >= uni.medianSAT - 50) score += 10;
    else score -= 10;
    if (uni.acceptanceRate > 50) score += 15;
    else if (uni.acceptanceRate > 20) score += 5;
    else if (uni.acceptanceRate < 10) score -= 10;
    return Math.max(0, Math.min(100, score));
  };

  const getCategoryColor = (score: number) => {
    if (score >= 70) return "bg-success/10 text-success border-success/20";
    if (score >= 40) return "bg-accent/10 text-accent border-accent/20";
    if (score >= 20) return "bg-warning/10 text-warning border-warning/20";
    return "bg-destructive/10 text-destructive border-destructive/20";
  };

  const getAIVerdict = async () => {
    if (selectedUniversities.length !== 2 || !profile) return;
    setLoadingVerdict(true);
    setVerdict(null);

    try {
      const { data, status } = await invokeEdgeFunction("university-counselor", {
        action: "compareVerdict",
        profile,
        universityName: `${selectedUniversities[0].name} vs ${selectedUniversities[1].name}`,
        cvText: "",
      });

      if (status === 402 || status === 429) {
        toast({ title: "Error", description: status === 402 ? "AI credits exhausted." : "Too many requests.", variant: "destructive" });
        return;
      }

      if (data?.result) {
        setVerdict(data.result);
      } else {
        toast({ title: "Error", description: "Could not get AI verdict. Try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to get AI verdict.", variant: "destructive" });
    } finally {
      setLoadingVerdict(false);
    }
  };

  const availableUniversities = universityDatabase.filter(
    u => !selectedUniversities.find(s => s.name === u.name)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Scale className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            {t('compare.title')}
          </h2>
          <p className="text-muted-foreground">{t('compare.subtitle')}</p>
        </div>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Select onValueChange={addUniversity} disabled={selectedUniversities.length >= maxCompare}>
              <SelectTrigger className="w-full md:w-80">
                <SelectValue placeholder={t('compare.addUniversity')} />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {availableUniversities.map((uni) => (
                  <SelectItem key={uni.name} value={uni.name}>
                    <div className="flex items-center gap-2">
                      <span>{uni.name}</span>
                      <Badge variant="outline" className="text-xs">{uni.country}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {selectedUniversities.length}/{maxCompare} {t('compare.selected')}
            </p>
          </div>

          {selectedUniversities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedUniversities.map((uni) => (
                <Badge key={uni.name} variant="secondary" className="px-3 py-1.5 flex items-center gap-2">
                  {uni.name}
                  <button onClick={() => removeUniversity(uni.name)} className="hover:text-destructive transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {selectedUniversities.length === 2 && profile && (
            <div className="mt-4">
              <Button onClick={getAIVerdict} disabled={loadingVerdict} className="gap-2 w-full md:w-auto">
                {loadingVerdict ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loadingVerdict ? "Analyzing..." : "Which is better for me?"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Verdict */}
      {verdict && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">AI Verdict</h3>
              </div>
              <div className="mb-4">
                <Badge className="bg-primary text-primary-foreground text-base px-3 py-1.5 mb-2">
                  🏆 Winner: {verdict.verdict || (verdict.winner === "B" ? selectedUniversities[1]?.name : selectedUniversities[0]?.name)}
                </Badge>
                {verdict.verdictReason && (
                  <p className="text-sm mt-2 leading-relaxed">{verdict.verdictReason}</p>
                )}
              </div>
              {Array.isArray(verdict.comparison) && verdict.comparison.length > 0 && (
                <div className="space-y-2 mb-4">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 text-xs font-semibold text-muted-foreground px-2 pb-1">
                    <span>Category</span>
                    <span className="text-center min-w-[60px] truncate" title={selectedUniversities[0]?.name}>{selectedUniversities[0]?.name?.split(" ")[0] || "A"}</span>
                    <span className="text-center min-w-[60px] truncate" title={selectedUniversities[1]?.name}>{selectedUniversities[1]?.name?.split(" ")[0] || "B"}</span>
                    <span className="text-center min-w-[50px]">Winner</span>
                  </div>
                  {verdict.comparison.map((c: any, i: number) => (
                    <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center p-2 rounded-lg bg-background/60">
                      <span className="text-sm font-medium">{c.category}</span>
                      <span className={`text-sm text-center min-w-[60px] ${c.winner === "A" ? "font-bold text-primary" : "text-muted-foreground"}`}>{c.uniA?.score ?? "–"}</span>
                      <span className={`text-sm text-center min-w-[60px] ${c.winner === "B" ? "font-bold text-primary" : "text-muted-foreground"}`}>{c.uniB?.score ?? "–"}</span>
                      <span className="text-xs text-center min-w-[50px] font-semibold text-primary">
                        {c.winner === "A" ? selectedUniversities[0]?.name?.split(" ")[0] : c.winner === "B" ? selectedUniversities[1]?.name?.split(" ")[0] : "–"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {verdict.finalAdvice && (
                <p className="text-sm text-muted-foreground italic border-t border-border/40 pt-3">{verdict.finalAdvice}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Comparison Table */}
      {selectedUniversities.length > 0 ? (
        <ScrollArea className="w-full whitespace-nowrap rounded-xl border border-border/50">
          <div className="min-w-[600px]">
            <div className="grid bg-muted/50 rounded-t-xl" style={{ gridTemplateColumns: `200px repeat(${selectedUniversities.length}, 1fr)` }}>
              <div className="p-4 font-semibold text-foreground border-r border-border/50">{t('compare.criteria')}</div>
              {selectedUniversities.map((uni) => (
                <div key={uni.name} className="p-4 border-r border-border/50 last:border-r-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-foreground truncate max-w-[150px]">{uni.name}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{uni.country}</p>
                    </div>
                    <Button variant="ghost" size="icon" aria-label={`Remove ${uni.name}`} className="h-6 w-6" onClick={() => removeUniversity(uni.name)}><X className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>

            {profile && (
              <ComparisonRow label={t('compare.matchScore')} icon={<Award className="w-4 h-4" />} columns={selectedUniversities.length}>
                {selectedUniversities.map((uni) => {
                  const score = getMatchScore(uni);
                  return <div key={uni.name}><Badge className={`${getCategoryColor(score)} border`}>{score}%</Badge></div>;
                })}
              </ComparisonRow>
            )}

            <ComparisonRow label={t('compare.worldRanking')} icon={<GraduationCap className="w-4 h-4" />} columns={selectedUniversities.length}>
              {selectedUniversities.map((uni) => <div key={uni.name} className="font-semibold">#{uni.rankings.world || 'N/A'}</div>)}
            </ComparisonRow>

            <ComparisonRow label={t('compare.acceptanceRate')} icon={<Users className="w-4 h-4" />} columns={selectedUniversities.length}>
              {selectedUniversities.map((uni) => <div key={uni.name} className="flex items-center gap-2"><span className="font-semibold">{uni.acceptanceRate}%</span>{getTrendIcon(uni.acceptanceRateTrend)}</div>)}
            </ComparisonRow>

            <ComparisonRow label={t('compare.medianGPA')} icon={<BookOpen className="w-4 h-4" />} columns={selectedUniversities.length}>
              {selectedUniversities.map((uni) => <span key={uni.name} className="font-semibold">{uni.medianGPA}</span>)}
            </ComparisonRow>

            <ComparisonRow label={t('compare.medianSAT')} icon={<BookOpen className="w-4 h-4" />} columns={selectedUniversities.length}>
              {selectedUniversities.map((uni) => <span key={uni.name} className="font-semibold">{uni.medianSAT}</span>)}
            </ComparisonRow>

            <ComparisonRow label={t('compare.tuition')} icon={<DollarSign className="w-4 h-4" />} columns={selectedUniversities.length}>
              {selectedUniversities.map((uni) => <div key={uni.name}><div className="font-semibold">{formatCurrency(uni.tuition.international)}</div><div className="text-xs text-muted-foreground">/year</div></div>)}
            </ComparisonRow>

            <ComparisonRow label={t('compare.avgAid')} icon={<DollarSign className="w-4 h-4" />} columns={selectedUniversities.length}>
              {selectedUniversities.map((uni) => <span key={uni.name} className="font-semibold text-success">{formatCurrency(uni.financialAid.averageAidPackage)}</span>)}
            </ComparisonRow>

            <ComparisonRow label={t('compare.needBlind')} icon={<CheckCircle2 className="w-4 h-4" />} columns={selectedUniversities.length}>
              {selectedUniversities.map((uni) => <Badge key={uni.name} variant={uni.financialAid.needBlind ? "default" : "secondary"} className={uni.financialAid.needBlind ? "bg-success text-success-foreground" : ""}>{uni.financialAid.needBlind ? t('common.yes') : t('common.no')}</Badge>)}
            </ComparisonRow>

            <ComparisonRow label={t('compare.deadline')} icon={<Calendar className="w-4 h-4" />} columns={selectedUniversities.length}>
              {selectedUniversities.map((uni) => (
                <div key={uni.name}>
                  <div className="font-semibold">{uni.deadlines.regularDecision}</div>
                  {uni.deadlines.earlyAction && <div className="text-xs text-muted-foreground">EA: {uni.deadlines.earlyAction}</div>}
                  {uni.deadlines.earlyDecision && <div className="text-xs text-muted-foreground">ED: {uni.deadlines.earlyDecision}</div>}
                </div>
              ))}
            </ComparisonRow>

            <ComparisonRow label={t('compare.popularMajors')} icon={<BookOpen className="w-4 h-4" />} columns={selectedUniversities.length} isLast>
              {selectedUniversities.map((uni) => (
                <div key={uni.name} className="space-y-1">
                  {uni.popularMajors.slice(0, 3).map((major, i) => <Badge key={i} variant="secondary" className="text-xs mr-1 mb-1">{major}</Badge>)}
                </div>
              ))}
            </ComparisonRow>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <Card className="border-border/50 border-dashed border-2">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Scale className="w-10 h-10 text-primary/60" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('compare.emptyTitle')}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">{t('compare.emptyDescription')}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

const ComparisonRow = ({ label, icon, children, columns, isLast = false }: { label: string; icon: React.ReactNode; children: React.ReactNode[]; columns: number; isLast?: boolean }) => (
  <div className={`grid bg-card ${!isLast ? 'border-b border-border/50' : 'rounded-b-xl'}`} style={{ gridTemplateColumns: `200px repeat(${columns}, 1fr)` }}>
    <div className="p-4 flex items-center gap-2 text-muted-foreground border-r border-border/50">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    {children.map((child, i) => <div key={i} className="p-4 border-r border-border/50 last:border-r-0">{child}</div>)}
  </div>
);

export default UniversityComparison;
