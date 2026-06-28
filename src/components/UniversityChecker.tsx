import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { invokeEdgeFunction } from "@/lib/edgeFunctions";
import { buildComprehensiveCV } from "@/lib/profileSummary";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { ScoreBreakdown, generateFactorBreakdown as generateFactorBreakdownFallback } from "./ScoreBreakdown";
import type { FactorScore } from "./ScoreBreakdown";
import type { ProfileData } from "./ProfileForm";
import { extractTextFromFile } from "@/lib/pdfParser";
import { Upload, FileText, Target, Eye, TrendingUp, AlertTriangle, Calendar, DollarSign, Lightbulb, GraduationCap, MapPin, Users, BookOpen, ChevronDown, ChevronUp, Shield, Sparkles, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "./ui/progress";

interface UniversityCheckerProps {
  profile?: ProfileData | null;
  documentAnalyses?: any[];
}

export default function UniversityChecker({ profile, documentAnalyses }: UniversityCheckerProps) {
  const { user } = useAuth();
  const [university, setUniversity] = useState("");
  const [cvText, setCvText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [aiFactors, setAiFactors] = useState<FactorScore[] | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractingCv, setExtractingCv] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const hasValidProfile = profile && profile.gpa && profile.gpa.trim() !== "" && 
                          profile.extracurriculars && profile.extracurriculars.trim() !== "";
  
  const hasValidCvText = cvText.trim().length > 50 && 
                         (cvText.toLowerCase().includes("gpa") || cvText.match(/\d\.\d/)) &&
                         cvText.length > 100;

  async function checkUniversity() {
    if (!university.trim()) {
      toast.error("Please enter university name");
      return;
    }

    if (!hasValidProfile && !hasValidCvText) {
      toast.error("Please complete your profile with GPA and extracurriculars, or provide detailed CV information including GPA and activities.");
      return;
    }

    setLoading(true);
    setResult(null);
    setShowBreakdown(false);
    setExpandedSections({});

    try {
      const documentBoost = documentAnalyses?.length ? {
        recommendationStrength: documentAnalyses.find((a: any) => a.type === 'recommendation')?.result?.strengthRating,
        awardPrestige: documentAnalyses.find((a: any) => a.type === 'awards')?.result?.prestigeLevel,
        transcriptTrend: documentAnalyses.find((a: any) => a.type === 'transcript')?.result?.trend,
        portfolioRating: documentAnalyses.find((a: any) => a.type === 'portfolio')?.result?.rating,
      } : undefined;

      const profileData = hasValidProfile ? {
        ...(profile as any),
        name: profile!.name || "Student",
        testScore: profile!.testScores || "",
        testType: profile!.testScores?.toLowerCase().includes("act") ? "ACT" : "SAT",
        documentBoost,
      } : {
        name: "Student",
        gpa: extractGpaFromText(cvText),
        extracurriculars: cvText,
        testScore: extractTestScoreFromText(cvText),
        documentBoost,
      };

      if (!profileData.gpa || profileData.gpa === "0" || profileData.gpa === "") {
        toast.error("Could not find GPA information. Please include your GPA in the CV text (e.g., 'GPA: 3.8/4.0')");
        setLoading(false);
        return;
      }

      const comprehensiveCV = hasValidProfile
        ? buildComprehensiveCV(profile, documentAnalyses)
        : cvText;

      const { data, status } = await invokeEdgeFunction("university-counselor", {
        action: "universityChecker",
        profile: profileData,
        cvText: comprehensiveCV,
        universityName: university,
        documentBoost,
      });

      if (status === 401) throw new Error("Unauthorized");
      if (!data?.success) {
        throw new Error(data?.error || "Analysis failed");
      }

      setResult(data.result);
      
      if (data.result.factorScores && Array.isArray(data.result.factorScores)) {
        const factors: FactorScore[] = data.result.factorScores.map((f: any) => ({
          factor: f.factor || "Unknown",
          score: Math.round(f.score || 0),
          weight: f.weight || 0,
          contribution: f.contribution || (f.score * f.weight / 100),
          status: f.status || (f.score >= 80 ? "strength" : f.score >= 55 ? "neutral" : "weakness"),
        }));
        setAiFactors(factors);
      } else {
        setAiFactors(null);
      }
      
      setShowBreakdown(true);
      setExpandedSections({ whatLooksFor: true, strategy: true });
      
      if (user) saveFactorScores(data.result);
      toast.success("Analysis complete!");
    } catch (err) {
      console.error("University checker error:", err);
      toast.error("Error analyzing university. Please try again.");
    }

    setLoading(false);
  }

  async function saveFactorScores(analysisResult: any) {
    if (!user) return;
    try {
      await supabase.from('factor_scores').upsert({
        user_id: user.id,
        university_name: analysisResult.university || university,
        overall_score: analysisResult.matchPercentage || 0,
        category: analysisResult.category || null,
        factors: analysisResult.factorScores || [],
      }, { onConflict: 'user_id,university_name' });
    } catch (err) {
      console.error("Error saving factor scores:", err);
    }
  }

  function extractGpaFromText(text: string): string {
    const patterns = [/gpa[:\s]*(\d\.\d+)/i, /(\d\.\d+)\s*\/\s*4\.0/i, /(\d\.\d+)\s*gpa/i];
    for (const p of patterns) { const m = text.match(p); if (m) return m[1]; }
    return "";
  }

  function extractTestScoreFromText(text: string): string {
    const sat = text.match(/sat[:\s]*(\d{3,4})/i);
    const act = text.match(/act[:\s]*(\d{1,2})/i);
    return sat?.[1] || act?.[1] || "";
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setExtractingCv(true);
    try {
      const extractedText = await extractTextFromFile(file);
      setCvText(extractedText);
      toast.success(`CV processed! Extracted ${extractedText.length} characters.`);
    } catch (error) {
      console.error("CV extraction error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to extract text from CV");
      setUploadedFile(null);
    } finally {
      setExtractingCv(false);
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Safe": return "bg-success/10 text-success border-success/20";
      case "Match": return "bg-accent/10 text-accent border-accent/20";
      case "Reach": return "bg-warning/10 text-warning border-warning/20";
      default: return "bg-destructive/10 text-destructive border-destructive/20";
    }
  };

  const SectionToggle = ({ sectionKey, title, icon: Icon, children, defaultOpen = false }: { sectionKey: string; title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean }) => {
    const isOpen = expandedSections[sectionKey] ?? defaultOpen;
    return (
      <Card className="overflow-hidden border-border/50">
        <button onClick={() => toggleSection(sectionKey)} className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground text-left">{title}</h4>
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
              <CardContent className="pt-0 pb-4">{children}</CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">🎓 Check Your Chances for ANY University</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="font-semibold text-foreground block mb-2">University Name</label>
            <Input type="text" placeholder="Example: MIT, Stanford, Cambridge, Oxford..." value={university} onChange={(e) => setUniversity(e.target.value)} />
          </div>

          {!hasValidProfile && (
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-foreground block mb-2">Upload CV (PDF recommended)</label>
                <div className="flex gap-2">
                  <Input id="cv-upload" type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} className="hidden" />
                  <Button type="button" variant="outline" onClick={() => document.getElementById("cv-upload")?.click()} disabled={extractingCv}
                    className={`flex-1 h-16 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200 ${uploadedFile ? 'border-success bg-success/5' : ''}`}>
                    <div className="flex items-center gap-3">
                      {extractingCv ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" /> : uploadedFile ? <FileText className="w-5 h-5 text-success" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
                      <span className={uploadedFile ? 'text-success font-medium' : 'text-muted-foreground'}>
                        {extractingCv ? "Extracting text..." : uploadedFile ? uploadedFile.name : "Click to upload PDF, DOC, or DOCX"}
                      </span>
                    </div>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or paste manually</span></div>
              </div>
              <div>
                <label className="font-semibold text-foreground block mb-2">Your CV / Profile Details</label>
                <Textarea className="h-40" placeholder={"Include your:\n• GPA (e.g., GPA: 3.8/4.0)\n• Test scores (e.g., SAT: 1450)\n• Extracurricular activities\n• Awards and achievements\n• Research, internships\n• Special circumstances"} value={cvText} onChange={(e) => setCvText(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">
                  {cvText.length < 100 ? `Please provide more detail (${cvText.length}/100 characters minimum)` : hasValidCvText ? "✓ Sufficient information provided" : "Please include your GPA (e.g., 'GPA: 3.8/4.0')"}
                </p>
              </div>
            </div>
          )}

          {hasValidProfile && (
            <div className="p-4 bg-success/5 rounded-lg border border-success/20">
              <p className="text-sm text-success font-medium">✓ Using your completed profile data for analysis</p>
              <p className="text-xs text-muted-foreground mt-1">GPA: {profile!.gpa} | Extracurriculars: {profile!.extracurriculars.substring(0, 50)}...</p>
            </div>
          )}

          <Button className="w-full" onClick={checkUniversity} disabled={loading || (!hasValidProfile && !hasValidCvText)}>
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                Performing Deep Analysis...
              </span>
            ) : "Check My Chances"}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-4">
          
          {/* Hero Result Card */}
          <Card className="overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{result.university}</h3>
                  <p className="text-muted-foreground flex items-center gap-1"><MapPin className="w-4 h-4" /> {result.country}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-primary">{result.matchPercentage}%</span>
                    <p className="text-xs text-muted-foreground">Match</p>
                  </div>
                  <Badge className={`${getCategoryColor(result.category)} border text-sm px-3 py-1`}>{result.category}</Badge>
                </div>
              </div>
              {result.profileSummary && (
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{result.profileSummary}</p>
              )}
            </div>

            {/* Median Admission Stats */}
            {result.medianAdmissionStats && (
              <div className="px-6 pb-4 pt-2">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {result.medianAdmissionStats.gpa && (
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-lg font-bold text-foreground">{result.medianAdmissionStats.gpa}</p>
                      <p className="text-xs text-muted-foreground">Median GPA</p>
                    </div>
                  )}
                  {result.medianAdmissionStats.testScore && (
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-lg font-bold text-foreground">{result.medianAdmissionStats.testScore}</p>
                      <p className="text-xs text-muted-foreground">Median SAT</p>
                    </div>
                  )}
                  {result.medianAdmissionStats.acceptanceRate != null && (
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-lg font-bold text-foreground">{result.medianAdmissionStats.acceptanceRate}%</p>
                      <p className="text-xs text-muted-foreground">Accept Rate</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* What This University Looks For */}
          {result.whatUniversityLooksFor?.length > 0 && (
            <SectionToggle sectionKey="whatLooksFor" title={`What ${result.university} Looks For`} icon={Eye} defaultOpen>
              <ul className="space-y-2">
                {result.whatUniversityLooksFor.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <Target className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SectionToggle>
          )}

          {/* Your Strengths & Weaknesses */}
          {(result.studentStrengths?.length > 0 || result.studentWeaknesses?.length > 0) && (
            <div className="grid md:grid-cols-2 gap-4">
              {result.studentStrengths?.length > 0 && (
                <Card className="border-success/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-5 h-5 text-success" /> Your Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.studentStrengths.map((s: string, i: number) => (
                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-success mt-0.5">✓</span><span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {result.studentWeaknesses?.length > 0 && (
                <Card className="border-warning/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-warning" /> Areas to Improve</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.studentWeaknesses.map((w: string, i: number) => (
                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-warning mt-0.5">!</span><span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Application Strategy */}
          {result.applicationStrategy && (
            <SectionToggle sectionKey="strategy" title="Application Strategy" icon={Lightbulb} defaultOpen>
              <div className="grid md:grid-cols-2 gap-4">
                {result.applicationStrategy.earlyOrRegular && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-xs font-semibold text-primary uppercase mb-1">Apply Timing</p>
                    <p className="text-sm text-foreground">{result.applicationStrategy.earlyOrRegular}</p>
                  </div>
                )}
                {result.applicationStrategy.essayAngle && (
                  <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
                    <p className="text-xs font-semibold text-accent uppercase mb-1">Essay Angle</p>
                    <p className="text-sm text-foreground">{result.applicationStrategy.essayAngle}</p>
                  </div>
                )}
                {result.applicationStrategy.interviewTips && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Interview Tips</p>
                    <p className="text-sm text-foreground">{result.applicationStrategy.interviewTips}</p>
                  </div>
                )}
                {result.applicationStrategy.demonstratedInterest && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Show Interest</p>
                    <p className="text-sm text-foreground">{result.applicationStrategy.demonstratedInterest}</p>
                  </div>
                )}
              </div>
            </SectionToggle>
          )}

          {/* University Insights */}
          {result.universityInsights && (
            <SectionToggle sectionKey="insights" title="University Insights" icon={GraduationCap}>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(result.universityInsights).map(([key, value]) => {
                  if (!value) return null;
                  const labels: Record<string, { label: string; icon: any }> = {
                    culture: { label: "Campus Culture", icon: Users },
                    academicFocus: { label: "Academic Focus", icon: BookOpen },
                    acceptanceRateTrend: { label: "Competitiveness Trend", icon: TrendingUp },
                    uniquePrograms: { label: "Unique Programs", icon: Sparkles },
                    location: { label: "Location & Setting", icon: MapPin },
                    alumniNetwork: { label: "Alumni Network", icon: Users },
                  };
                  const info = labels[key] || { label: key, icon: GraduationCap };
                  return (
                    <div key={key} className="p-3 rounded-lg bg-muted/30">
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                        <info.icon className="w-3 h-3" /> {info.label}
                      </p>
                      <p className="text-sm text-foreground">{value as string}</p>
                    </div>
                  );
                })}
              </div>
            </SectionToggle>
          )}

          {/* Financial Information */}
          {result.financialInfo && (
            <SectionToggle sectionKey="financial" title="Financial Information" icon={DollarSign}>
              <div className="space-y-3">
                {result.financialInfo.estimatedTuition && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground">Estimated Tuition</span>
                    <span className="font-semibold text-foreground">{result.financialInfo.estimatedTuition}</span>
                  </div>
                )}
                {result.financialInfo.financialAidAvailability && (
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Financial Aid</p>
                    <p className="text-sm text-foreground">{result.financialInfo.financialAidAvailability}</p>
                  </div>
                )}
                {result.financialInfo.needBlind && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-success/5 border border-success/20">
                    <Shield className="w-4 h-4 text-success" />
                    <span className="text-sm text-foreground">{result.financialInfo.needBlind}</span>
                  </div>
                )}
                {result.financialInfo.relevantScholarships?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Scholarships You May Qualify For</p>
                    <ul className="space-y-1">
                      {result.financialInfo.relevantScholarships.map((s: string, i: number) => (
                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                          <DollarSign className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" /><span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </SectionToggle>
          )}

          {/* Key Deadlines */}
          {result.keyDeadlines?.length > 0 && (
            <SectionToggle sectionKey="deadlines" title="Key Deadlines" icon={Calendar}>
              <div className="space-y-2">
                {result.keyDeadlines.map((d: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{d.deadline}</span>
                        <Badge variant="outline" className="text-xs">{d.type}</Badge>
                      </div>
                      {d.note && <p className="text-xs text-muted-foreground mt-0.5">{d.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </SectionToggle>
          )}

          {/* Action Plan */}
          {result.actionPlan?.length > 0 && (
            <SectionToggle sectionKey="actionPlan" title="Your Action Plan" icon={Clock}>
              <div className="space-y-4">
                {result.actionPlan.map((phase: any, i: number) => (
                  <div key={i}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</div>
                      <h5 className="font-semibold text-sm text-foreground">{phase.timeframe}</h5>
                    </div>
                    <ul className="ml-8 space-y-1">
                      {phase.actions?.map((action: string, j: number) => (
                        <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">→</span><span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </SectionToggle>
          )}

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <SectionToggle sectionKey="recommendations" title="Personalized Recommendations" icon={Sparkles}>
              <ul className="space-y-3">
                {result.recommendations.map((item: any, i: number) => (
                  <li key={i} className="bg-muted/30 p-3 rounded-md flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{i + 1}</div>
                    <p className="text-sm text-foreground">{typeof item === 'string' ? item : item.text}</p>
                  </li>
                ))}
              </ul>
            </SectionToggle>
          )}
        </motion.div>
      )}

      {/* Score Breakdown Chart */}
      {showBreakdown && result && (
        <div className="max-w-4xl mx-auto">
          {aiFactors ? (
            <ScoreBreakdown overallScore={result.matchPercentage} factors={aiFactors} universityName={result.university} category={result.category} />
          ) : hasValidProfile ? (
            <ScoreBreakdown {...generateFactorBreakdownFallback(profile, result.matchPercentage)} universityName={result.university} category={result.category} />
          ) : null}
        </div>
      )}
    </div>
  );
}