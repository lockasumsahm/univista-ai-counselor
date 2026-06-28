import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDocumentAnalyses, type DocumentAnalysis } from "@/hooks/useDocumentAnalyses";
import {
  FileText, Upload, Camera, Image, Award, BookOpen, GraduationCap,
  CheckCircle2, AlertCircle, Loader2, X, Eye, Sparkles, TrendingUp,
  Star, Shield, ChevronDown, ChevronUp
} from "lucide-react";

interface DocumentUploaderProps {
  profile?: any;
  onAnalysisUpdate?: (analyses: DocumentAnalysis[]) => void;
}

const DOCUMENT_CATEGORIES = [
  {
    id: "recommendation",
    label: "Recommendation Letters",
    icon: FileText,
    description: "Upload photos or PDFs of recommendation letters from teachers, counselors, or mentors",
    acceptTypes: "image/*,.pdf,.txt,.doc,.docx",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  {
    id: "transcript",
    label: "Academic Transcripts",
    icon: GraduationCap,
    description: "Upload your transcript showing grades, GPA, and course history",
    acceptTypes: "image/*,.pdf",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
  },
  {
    id: "awards",
    label: "Awards & Certificates",
    icon: Award,
    description: "Upload photos of awards, competition results, or certificates",
    acceptTypes: "image/*,.pdf",
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  {
    id: "portfolio",
    label: "Portfolio Samples",
    icon: BookOpen,
    description: "Upload art, research papers, project photos, or creative work",
    acceptTypes: "image/*,.pdf",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
];

const getConfidenceLevel = (analyses: DocumentAnalysis[], hasProfile: boolean) => {
  let score = 0;
  const factors: { label: string; filled: boolean }[] = [];

  if (hasProfile) {
    score += 20;
    factors.push({ label: "Basic Profile", filled: true });
  } else {
    factors.push({ label: "Basic Profile", filled: false });
  }

  const hasRec = analyses.some(a => a.type === "recommendation");
  const hasTranscript = analyses.some(a => a.type === "transcript");
  const hasAwards = analyses.some(a => a.type === "awards");
  const hasPortfolio = analyses.some(a => a.type === "portfolio");

  if (hasRec) { score += 25; }
  factors.push({ label: "Recommendation Letter", filled: hasRec });

  if (hasTranscript) { score += 25; }
  factors.push({ label: "Academic Transcript", filled: hasTranscript });

  if (hasAwards) { score += 15; }
  factors.push({ label: "Awards & Certificates", filled: hasAwards });

  if (hasPortfolio) { score += 15; }
  factors.push({ label: "Portfolio Samples", filled: hasPortfolio });

  let label = "Low";
  let color = "text-destructive";
  if (score >= 80) { label = "Very High"; color = "text-success"; }
  else if (score >= 60) { label = "High"; color = "text-emerald-600"; }
  else if (score >= 40) { label = "Medium"; color = "text-warning"; }

  return { score, label, color, factors };
};

export const DocumentUploader = ({ profile, onAnalysisUpdate }: DocumentUploaderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { analyses, upsertAnalysis } = useDocumentAnalyses();
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);
  const [textInputs, setTextInputs] = useState<Record<string, string>>({});
  const [showTextInput, setShowTextInput] = useState<Record<string, boolean>>({});
  const [expandedResults, setExpandedResults] = useState<Record<string, boolean>>({});

  const confidence = getConfidenceLevel(analyses, !!profile?.gpa);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeDocument = useCallback(async (categoryId: string, file?: File, text?: string) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to analyze documents.", variant: "destructive" });
      return;
    }

    setLoadingCategory(categoryId);

    try {
      let imageBase64: string | undefined;
      let textContent = text || "";

      if (file) {
        const isImage = file.type.startsWith("image/");
        if (isImage) {
          imageBase64 = await fileToBase64(file);
        } else if (file.type === "text/plain") {
          textContent = await file.text();
        } else if (file.type === "application/pdf") {
          // For PDFs, try to send as base64 for multimodal analysis
          imageBase64 = await fileToBase64(file);
        } else {
          // Try reading as text
          textContent = await file.text();
        }

        // Upload to storage for record keeping
        const filePath = `${user.id}/${categoryId}/${Date.now()}_${file.name}`;
        await supabase.storage.from("user-documents").upload(filePath, file);
      }

      if (!imageBase64 && !textContent) {
        toast({ title: "No content", description: "Please upload a file or paste text.", variant: "destructive" });
        setLoadingCategory(null);
        return;
      }

      const response = await supabase.functions.invoke("analyze-document", {
        body: {
          documentType: categoryId,
          textContent,
          imageBase64,
          fileName: file?.name,
          profile,
        },
      });

      if (response.error) throw new Error(response.error.message);

      const data = response.data;
      if (!data.success) throw new Error(data.error || "Analysis failed");

      const newAnalysis: DocumentAnalysis = {
        type: categoryId,
        result: data.result,
        fileName: file?.name,
        timestamp: Date.now(),
      };

      const updated = await upsertAnalysis(newAnalysis);
      setExpandedResults(prev => ({ ...prev, [categoryId]: true }));
      onAnalysisUpdate?.(updated);

      toast({ title: "✨ Analysis Complete", description: `Your ${DOCUMENT_CATEGORIES.find(c => c.id === categoryId)?.label} has been saved.` });
    } catch (error) {
      console.error("Document analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingCategory(null);
    }
  }, [user, profile, upsertAnalysis, onAnalysisUpdate, toast]);

  const handleFileUpload = (categoryId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast({ title: "File too large", description: "Maximum file size is 20MB.", variant: "destructive" });
        return;
      }
      analyzeDocument(categoryId, file);
    }
  };

  const handleTextSubmit = (categoryId: string) => {
    const text = textInputs[categoryId]?.trim();
    if (!text) {
      toast({ title: "No text", description: "Please paste the document content.", variant: "destructive" });
      return;
    }
    analyzeDocument(categoryId, undefined, text);
  };

  const getAnalysis = (categoryId: string) => analyses.find(a => a.type === categoryId);

  const renderAnalysisResult = (categoryId: string, analysis: DocumentAnalysis) => {
    const r = analysis.result;
    const isExpanded = expandedResults[categoryId];

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        className="mt-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-success">Analyzed</span>
            {analysis.fileName && (
              <span className="text-xs text-muted-foreground">({analysis.fileName})</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandedResults(prev => ({ ...prev, [categoryId]: !isExpanded }))}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {/* Impact score */}
        {(r.impactScore || r.overallImpactScore || r.academicStrengthScore) && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Impact Score:</span>
            <div className="flex-1">
              <Progress value={r.impactScore || r.overallImpactScore || r.academicStrengthScore} className="h-2" />
            </div>
            <span className="text-sm font-bold text-foreground">
              {r.impactScore || r.overallImpactScore || r.academicStrengthScore}%
            </span>
          </div>
        )}

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {/* Summary */}
              {r.summary && (
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-xl">{r.summary}</p>
              )}

              {/* Strength rating for recommendations */}
              {r.strengthRating && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Strength:</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.strengthRating ? 'text-amber-500 fill-amber-500' : 'text-muted'}`} />
                    ))}
                  </div>
                  {r.enthusiasmLevel && (
                    <Badge variant="secondary" className="text-xs">{r.enthusiasmLevel}</Badge>
                  )}
                </div>
              )}

              {/* Key qualities / strengths */}
              {(r.keyQualities || r.strengths || r.strongSubjects) && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Highlights:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(r.keyQualities || r.strengths || r.strongSubjects || []).map((q: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">{q}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Awards list */}
              {r.awards && Array.isArray(r.awards) && (
                <div className="space-y-2">
                  {r.awards.map((award: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 bg-muted/30 p-2 rounded-lg">
                      <Award className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{award.name}</p>
                        <div className="flex gap-1 mt-0.5">
                          <Badge variant="outline" className="text-[10px]">{award.level}</Badge>
                          <Badge variant="outline" className="text-[10px]">{award.category}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Red flags */}
              {r.redFlags && r.redFlags.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-destructive">⚠️ Areas of Concern:</span>
                  <ul className="mt-1 space-y-1">
                    {r.redFlags.map((flag: string, i: number) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                        <AlertCircle className="w-3 h-3 text-destructive shrink-0 mt-0.5" />
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {r.suggestions && r.suggestions.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">💡 Suggestions:</span>
                  <ul className="mt-1 space-y-1">
                    {r.suggestions.map((s: string, i: number) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                        <Sparkles className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Confidence / Accuracy Indicator */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Prediction Accuracy
            </CardTitle>
            <Badge variant="outline" className={`${confidence.color} font-bold`}>
              {confidence.label} — {confidence.score}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={confidence.score} className="h-3 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {confidence.factors.map((f) => (
              <div
                key={f.label}
                className={`flex items-center gap-1.5 text-xs p-2 rounded-lg ${
                  f.filled
                    ? "bg-success/10 text-success"
                    : "bg-muted/50 text-muted-foreground"
                }`}
              >
                {f.filled ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/40 shrink-0" />
                )}
                <span className="truncate">{f.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Upload more documents to improve the accuracy of your university acceptance predictions.
          </p>
        </CardContent>
      </Card>

      {/* Document Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOCUMENT_CATEGORIES.map((cat) => {
          const analysis = getAnalysis(cat.id);
          const isLoading = loadingCategory === cat.id;
          const Icon = cat.icon;

          return (
            <Card
              key={cat.id}
              className={`border transition-all duration-300 ${
                analysis ? "border-success/40 bg-success/5" : `${cat.borderColor} ${cat.bgColor}`
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-xl ${cat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${cat.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground">{cat.label}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Analyzing with AI...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Upload buttons */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept={cat.acceptTypes}
                          onChange={(e) => handleFileUpload(cat.id, e)}
                          className="hidden"
                          disabled={isLoading}
                        />
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-medium transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          Upload File
                        </div>
                      </label>

                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => handleFileUpload(cat.id, e)}
                          className="hidden"
                          disabled={isLoading}
                        />
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 hover:bg-secondary/20 text-secondary-foreground rounded-lg text-xs font-medium transition-colors">
                          <Camera className="w-3.5 h-3.5" />
                          Take Photo
                        </div>
                      </label>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-auto py-1.5 px-3"
                        onClick={() => setShowTextInput(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                      >
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        Paste Text
                      </Button>
                    </div>

                    {/* Text input */}
                    <AnimatePresence>
                      {showTextInput[cat.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          <Textarea
                            placeholder={`Paste your ${cat.label.toLowerCase()} text here...`}
                            value={textInputs[cat.id] || ""}
                            onChange={(e) => setTextInputs(prev => ({ ...prev, [cat.id]: e.target.value }))}
                            className="min-h-[100px] text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleTextSubmit(cat.id)}
                            disabled={!textInputs[cat.id]?.trim()}
                            className="w-full gap-2"
                          >
                            <Sparkles className="w-4 h-4" />
                            Analyze Text
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Analysis result */}
                    {analysis && renderAnalysisResult(cat.id, analysis)}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
