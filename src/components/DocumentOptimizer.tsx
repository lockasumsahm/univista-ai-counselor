import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, CheckCircle2, AlertCircle, Lightbulb, Wand2, 
  Copy, Download, RefreshCw, Target, Sparkles, BookOpen, Loader2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProfileGate } from "@/components/ProfileGate";

interface DocumentOptimizerProps {
  profile?: any;
}

const DOCUMENT_TYPES = [
  { value: 'personal-statement', label: 'Personal Statement', maxWords: 650 },
  { value: 'why-school', label: 'Why This School Essay', maxWords: 400 },
  { value: 'extracurricular', label: 'Activity Description', maxWords: 150 },
  { value: 'additional-info', label: 'Additional Information', maxWords: 650 },
  { value: 'recommendation-request', label: 'Recommendation Request', maxWords: 300 },
  { value: 'resume', label: 'Resume/CV', maxWords: 1000 },
  { value: 'cover-letter', label: 'Scholarship Cover Letter', maxWords: 500 }
];

const CHECKLIST_ITEMS = {
  'personal-statement': [
    { id: 'hook', label: 'Strong opening hook that grabs attention', category: 'structure' },
    { id: 'specific', label: 'Specific, vivid details and examples', category: 'content' },
    { id: 'reflection', label: 'Deep personal reflection and growth', category: 'content' },
    { id: 'voice', label: 'Authentic voice that sounds like you', category: 'style' },
    { id: 'conclusion', label: 'Meaningful conclusion that looks forward', category: 'structure' },
    { id: 'wordcount', label: 'Within word limit (650 words)', category: 'format' }
  ],
  'why-school': [
    { id: 'specific-resources', label: 'Names specific programs, professors, or resources', category: 'content' },
    { id: 'connection', label: 'Connects school offerings to your goals', category: 'content' },
    { id: 'unique-fit', label: 'Shows why YOU are a good fit (not just the school)', category: 'content' },
    { id: 'not-generic', label: 'Avoids generic praise that could apply anywhere', category: 'style' },
    { id: 'research', label: 'Demonstrates genuine research beyond the website', category: 'content' }
  ],
  'extracurricular': [
    { id: 'action-verbs', label: 'Uses strong action verbs', category: 'style' },
    { id: 'impact', label: 'Quantifies impact where possible', category: 'content' },
    { id: 'role', label: 'Clearly describes your specific role', category: 'content' },
    { id: 'no-abbreviations', label: 'No unexplained abbreviations', category: 'format' }
  ]
};

export const DocumentOptimizer = ({ profile }: DocumentOptimizerProps) => {
  const [documentType, setDocumentType] = useState<string>('personal-statement');
  const [content, setContent] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [optimizedContent, setOptimizedContent] = useState("");
  const { toast } = useToast();

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const maxWords = DOCUMENT_TYPES.find(t => t.value === documentType)?.maxWords || 650;
  const wordProgress = Math.min((wordCount / maxWords) * 100, 100);

  const analyzeDocument = async () => {
    if (!content.trim()) {
      toast({
        title: "Empty Document",
        description: "Please enter your document content first.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chatbot-counselor', {
        body: {
          question: `Analyze this ${documentType.replace('-', ' ')} for a university application.

Document Content:
"${content}"

Student Profile (if available): ${profile ? JSON.stringify({
  name: profile.name,
  gpa: profile.gpa,
  extracurriculars: profile.extracurriculars
}) : 'Not provided'}

Provide a detailed analysis in this exact JSON format:
{
  "score": <number 1-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "readability": <number 1-10>,
  "emotionalImpact": <number 1-10>,
  "uniqueness": <number 1-10>,
  "suggestions": ["suggestion1", "suggestion2"],
  "optimizedVersion": "full optimized text"
}`,
          profile: profile,
          conversationHistory: []
        }
      });

      if (error) throw error;

      // Parse the response
      let parsedAnalysis;
      try {
        const responseText = data.result?.answer || '';
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedAnalysis = JSON.parse(jsonMatch[0]);
        }
      } catch {
        parsedAnalysis = {
          score: 75,
          strengths: ["Document provided", "Shows effort"],
          weaknesses: ["Could be more specific", "Add more details"],
          readability: 7,
          emotionalImpact: 6,
          uniqueness: 6,
          suggestions: ["Add more personal anecdotes", "Use stronger verbs"],
          optimizedVersion: content
        };
      }

      setAnalysis(parsedAnalysis);
      if (parsedAnalysis.optimizedVersion) {
        setOptimizedContent(parsedAnalysis.optimizedVersion);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Error",
        description: "Could not analyze document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard."
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-accent';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const checklist = CHECKLIST_ITEMS[documentType as keyof typeof CHECKLIST_ITEMS] || CHECKLIST_ITEMS['personal-statement'];

  return (
    <ProfileGate profile={profile} featureName="document optimization" soft>
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-card border-border/50">
        <CardHeader className="bg-gradient-primary text-primary-foreground p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">Document Optimizer</h2>
              <p className="text-primary-foreground/80">Perfect your essays and application documents</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Document Type Selector */}
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger className="w-full md:w-[280px]">
                <BookOpen className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label} ({type.maxWords} words max)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2 flex-1">
              <Progress value={wordProgress} className="flex-1" />
              <span className={`text-sm font-medium ${wordCount > maxWords ? 'text-destructive' : 'text-muted-foreground'}`}>
                {wordCount}/{maxWords} words
              </span>
            </div>
          </div>

          {/* Content Input */}
          <Textarea
            placeholder={`Paste your ${DOCUMENT_TYPES.find(t => t.value === documentType)?.label.toLowerCase()} here...`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="font-mono text-sm"
          />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={analyzeDocument} disabled={loading} className="flex-1 md:flex-none bg-gradient-primary hover:shadow-glow py-5">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Analyze & Optimize
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => { setContent(""); setAnalysis(null); setOptimizedContent(""); }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          {/* Checklist */}
          <Card className="p-4 bg-muted/30">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              {DOCUMENT_TYPES.find(t => t.value === documentType)?.label} Checklist
            </h3>
            <div className="grid gap-2">
              {checklist.map(item => (
                <label key={item.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="text-muted-foreground">{item.label}</span>
                  <Badge variant="outline" className="ml-auto text-xs">{item.category}</Badge>
                </label>
              ))}
            </div>
          </Card>

          {/* Analysis Results */}
          {analysis && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Tabs defaultValue="analysis" className="animate-fade-in">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                <TabsTrigger value="optimized">Optimized Version</TabsTrigger>
              </TabsList>

              <TabsContent value="analysis" className="space-y-4 mt-4">
                {/* Score Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-primary/10 text-center">
                    <div className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>{analysis.score}</div>
                    <div className="text-xs text-muted-foreground">Overall Score</div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 text-center">
                    <div className="text-2xl font-bold text-foreground">{analysis.readability}/10</div>
                    <div className="text-xs text-muted-foreground">Readability</div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 text-center">
                    <div className="text-2xl font-bold text-foreground">{analysis.emotionalImpact}/10</div>
                    <div className="text-xs text-muted-foreground">Emotional Impact</div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 text-center">
                    <div className="text-2xl font-bold text-foreground">{analysis.uniqueness}/10</div>
                    <div className="text-xs text-muted-foreground">Uniqueness</div>
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4 border-success/30 bg-success/5">
                    <h4 className="font-medium mb-3 flex items-center gap-2 text-success">
                      <CheckCircle2 className="w-4 h-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {analysis.strengths?.map((s: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Sparkles className="w-3 h-3 mt-1 text-success flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </Card>
                  
                  <Card className="p-4 border-warning/30 bg-warning/5">
                    <h4 className="font-medium mb-3 flex items-center gap-2 text-warning">
                      <AlertCircle className="w-4 h-4" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-2">
                      {analysis.weaknesses?.map((w: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Lightbulb className="w-3 h-3 mt-1 text-warning flex-shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="suggestions" className="mt-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-accent" />
                    Specific Suggestions
                  </h4>
                  <ul className="space-y-3">
                    {analysis.suggestions?.map((s: string, i: number) => (
                      <li key={i} className="p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground mr-2">{i + 1}.</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </Card>
              </TabsContent>

              <TabsContent value="optimized" className="mt-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-primary" />
                      AI-Optimized Version
                    </h4>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(optimizedContent)}>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setContent(optimizedContent)}>
                        Use This Version
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 whitespace-pre-wrap font-mono text-sm">
                    {optimizedContent}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
    </ProfileGate>
  );
};
