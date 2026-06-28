import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, Upload, Sparkles, Globe, BookOpen, HelpCircle, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { invokeEdgeFunction } from "@/lib/edgeFunctions";
import { toast } from "sonner";

interface EssayAnalysis {
  overallScore: number;
  structure: number;
  clarity: number;
  authenticity: number;
  depth: number;
  impact: number;
  feedback: string[];
  universityInterpretations: {
    region: string;
    score: number;
    interpretation: string;
    weight: string;
  }[];
}

interface EssayUploadProps {
  profile?: any;
  onAnalysisComplete?: (analysis: EssayAnalysis) => void;
}

const ESSAY_TYPES = [
  { value: "personal-statement", label: "Personal Statement / Common App Essay" },
  { value: "why-school", label: "Why This School Essay" },
  { value: "extracurricular", label: "Extracurricular / Activity Essay" },
  { value: "challenge", label: "Overcoming Challenge Essay" },
  { value: "intellectual", label: "Intellectual Curiosity Essay" },
  { value: "community", label: "Community / Impact Essay" },
  { value: "supplement", label: "Other Supplement" },
];

const REGIONS = [
  { value: "ivy-league", label: "Ivy League (US)", icon: "🇺🇸" },
  { value: "top-us", label: "Top US Universities", icon: "🇺🇸" },
  { value: "uk", label: "UK Universities (Oxford, Cambridge)", icon: "🇬🇧" },
  { value: "canada", label: "Canadian Universities", icon: "🇨🇦" },
  { value: "europe", label: "European Universities", icon: "🇪🇺" },
  { value: "asia", label: "Asian Universities", icon: "🌏" },
];

export const EssayUpload = ({ profile, onAnalysisComplete }: EssayUploadProps) => {
  const [essayText, setEssayText] = useState("");
  const [essayType, setEssayType] = useState("");
  const [targetUniversity, setTargetUniversity] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<EssayAnalysis | null>(null);

  const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = essayText.length;
  const isMinimumMet = wordCount >= 100;

  const handleAnalyze = async () => {
    if (!essayText.trim() || wordCount < 100) {
      toast.error("Please enter at least 100 words for analysis");
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const { data, status } = await invokeEdgeFunction("university-counselor", {
        action: "analyzeEssay",
        profile,
        essayText,
        essayType,
        targetUniversity,
      });

      if (status === 401) throw new Error("Unauthorized");
      if (data?.success && data?.result) {
        setAnalysis(data.result);
        onAnalysisComplete?.(data.result);
        toast.success("Essay analysis complete!");
      } else {
        throw new Error(data?.error || "Analysis failed");
      }
    } catch (err) {
      console.error("Essay analysis error:", err);
      toast.error("Failed to analyze essay. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-accent";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-success/10 border-success/20";
    if (score >= 60) return "bg-accent/10 border-accent/20";
    if (score >= 40) return "bg-warning/10 border-warning/20";
    return "bg-destructive/10 border-destructive/20";
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card className="shadow-card border-border/50 overflow-hidden">
          <CardHeader className="bg-gradient-primary text-primary-foreground p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                  Essay Analysis
                  <Badge className="bg-primary-foreground/20 text-primary-foreground border-0">AI-Powered</Badge>
                </h2>
                <p className="text-primary-foreground/80">Get university-specific feedback on your essays</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Essay Type & Target */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Essay Type
                  <Tooltip>
                    <TooltipTrigger
                      type="button"
                      className="inline-flex items-center justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Essay type help"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">Select the type of essay for more accurate analysis</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <Select value={essayType} onValueChange={setEssayType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select essay type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESSAY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Globe className="w-4 h-4 text-primary" />
                  Target University (Optional)
                </label>
                <input
                  type="text"
                  value={targetUniversity}
                  onChange={(e) => setTargetUniversity(e.target.value)}
                  placeholder="e.g., Harvard, Oxford, MIT"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>

            {/* Essay Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileText className="w-4 h-4 text-primary" />
                  Your Essay
                </label>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className={wordCount >= 100 ? "text-success" : ""}>
                    {wordCount} words
                  </span>
                  <span>{charCount} characters</span>
                </div>
              </div>
              <Textarea
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                placeholder="Paste your essay here. The AI will analyze structure, clarity, authenticity, depth, and impact. It will also show how different university regions would interpret your essay..."
                className="min-h-[300px] resize-y"
              />
              {!isMinimumMet && essayText.length > 0 && (
                <p className="text-xs text-warning flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Minimum 100 words required ({100 - wordCount} more needed)
                </p>
              )}
            </div>

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              disabled={loading || !isMinimumMet}
              className="w-full bg-gradient-primary hover:shadow-glow py-6 text-lg font-semibold"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Analyzing Essay...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze Essay with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <Card className="shadow-card border-border/50 animate-fade-in">
            <CardHeader className="border-b border-border/50 p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                  <h3 className="text-xl font-bold text-foreground">Essay Analysis Results</h3>
                </div>
                <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                  {analysis.overallScore}/100
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-8">
              {/* Score Breakdown */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Score Breakdown
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: "Structure", value: analysis.structure },
                    { label: "Clarity", value: analysis.clarity },
                    { label: "Authenticity", value: analysis.authenticity },
                    { label: "Depth", value: analysis.depth },
                    { label: "Impact", value: analysis.impact },
                  ].map((item) => (
                    <div key={item.label} className={`p-4 rounded-lg border ${getScoreBg(item.value)}`}>
                      <div className="text-sm text-muted-foreground mb-1">{item.label}</div>
                      <div className={`text-2xl font-bold ${getScoreColor(item.value)}`}>
                        {item.value}
                      </div>
                      <Progress value={item.value} className="h-1.5 mt-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Feedback */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Detailed Feedback</h4>
                <ul className="space-y-2">
                  {analysis.feedback.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                      <span className="text-primary mt-0.5">•</span>
                      <span className="text-sm text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* University Interpretations */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  How Different Regions Would Evaluate This Essay
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.universityInterpretations.map((interp, i) => (
                    <div key={i} className={`p-4 rounded-lg border ${getScoreBg(interp.score)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{interp.region}</span>
                        <Badge className={getScoreBg(interp.score)}>
                          {interp.score}/100
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{interp.interpretation}</p>
                      <p className="text-xs text-muted-foreground/80">
                        Essay weight: <span className="font-medium">{interp.weight}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};
