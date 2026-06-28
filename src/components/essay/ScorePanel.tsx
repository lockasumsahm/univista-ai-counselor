import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, AlertCircle, Lightbulb, Target, Heart, 
  BookOpen, Sparkles, Anchor, MessageSquare, Drama, Pen
} from 'lucide-react';
import { EssayAnalysis, getScoreColor, getScoreBg } from '@/hooks/useEssayCoach';

interface ScorePanelProps {
  analysis: EssayAnalysis;
}

export const ScorePanel = ({ analysis }: ScorePanelProps) => {
  const primaryScores = [
    { label: 'Clarity', score: analysis.clarity, icon: BookOpen },
    { label: 'Authenticity', score: analysis.authenticity, icon: Heart },
    { label: 'Structure', score: analysis.structure, icon: Target },
    { label: 'Impact', score: analysis.impact, icon: Sparkles },
  ];

  const advancedScores = [
    { label: 'Hook Strength', score: analysis.hookStrength, icon: Anchor },
    { label: 'Thesis Clarity', score: analysis.thesisClarity, icon: Pen },
    { label: 'Emotional Depth', score: analysis.emotionalDepth, icon: Drama },
    { label: 'Storytelling', score: analysis.storytelling, icon: MessageSquare },
  ];

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20 overflow-hidden">
        <CardContent className="pt-5 pb-4">
          <div className="text-center mb-4">
            <div className={`text-5xl font-display font-bold ${getScoreColor(analysis.overallScore)}`}>
              {analysis.overallScore}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Overall Score</div>
            <div className="text-xs text-muted-foreground">{analysis.wordCount} words · {analysis.readingTime}</div>
          </div>

          {/* Primary Scores */}
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            {primaryScores.map(({ label, score, icon: Icon }) => (
              <div key={label} className="bg-background/60 backdrop-blur-sm rounded-xl p-2.5 border border-border/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={score} className="h-1.5 flex-1" />
                  <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Advanced Scores */}
          <div className="border-t border-border/50 pt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Advanced Metrics
            </p>
            <div className="grid grid-cols-2 gap-2">
              {advancedScores.map(({ label, score, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground truncate">{label}</span>
                  <span className={`text-xs font-bold ml-auto ${getScoreColor(score)}`}>{score}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hook & Thesis Analysis */}
      {(analysis.hookAnalysis || analysis.thesisAnalysis) && (
        <Card className="border-border/50">
          <CardContent className="pt-4 space-y-3">
            {analysis.hookAnalysis && (
              <div className={`p-3 rounded-lg border ${getScoreBg(analysis.hookStrength)}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Anchor className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold">Hook Analysis</span>
                </div>
                <p className="text-sm">{analysis.hookAnalysis}</p>
              </div>
            )}
            {analysis.thesisAnalysis && (
              <div className={`p-3 rounded-lg border ${getScoreBg(analysis.thesisClarity)}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Pen className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold">Thesis Analysis</span>
                </div>
                <p className="text-sm">{analysis.thesisAnalysis}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Emotional & Storytelling Suggestions */}
      {(analysis.emotionalSuggestions?.length > 0 || analysis.storytellingSuggestions?.length > 0) && (
        <Card className="border-border/50">
          <CardContent className="pt-4 space-y-3">
            {analysis.emotionalSuggestions?.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                  <Drama className="h-3.5 w-3.5 text-accent" /> Emotional Depth Tips
                </p>
                <ul className="space-y-1.5">
                  {analysis.emotionalSuggestions.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-accent mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.storytellingSuggestions?.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" /> Storytelling Tips
                </p>
                <ul className="space-y-1.5">
                  {analysis.storytellingSuggestions.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* University Fit */}
      {analysis.universityFit && (
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="pt-4">
            <p className="text-xs font-semibold mb-1 flex items-center gap-1">
              🎓 University Fit
            </p>
            <p className="text-sm text-muted-foreground">{analysis.universityFit}</p>
          </CardContent>
        </Card>
      )}

      {/* Detailed Feedback Tabs */}
      <Tabs defaultValue="strengths" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="strengths" className="text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Strengths
          </TabsTrigger>
          <TabsTrigger value="improve" className="text-xs">
            <AlertCircle className="h-3 w-3 mr-1" /> Improve
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="text-xs">
            <Lightbulb className="h-3 w-3 mr-1" /> Tips
          </TabsTrigger>
        </TabsList>
        {['strengths', 'improve', 'suggestions'].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-3 space-y-2">
            {analysis.feedback
              .filter(f =>
                (tab === 'strengths' && f.type === 'strength') ||
                (tab === 'improve' && f.type === 'improvement') ||
                (tab === 'suggestions' && f.type === 'suggestion')
              )
              .map((item, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${
                  item.type === 'strength' ? 'bg-success/10 border-success/30' :
                  item.type === 'improvement' ? 'bg-warning/10 border-warning/30' :
                  'bg-primary/10 border-primary/30'
                }`}>
                  <Badge variant="outline" className="mb-1 text-xs">{item.category}</Badge>
                  <p className="text-sm">{item.message}</p>
                </div>
              ))}
          </TabsContent>
        ))}
      </Tabs>

      {/* Inline Feedback */}
      {analysis.inlineFeedback?.length > 0 && (
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <p className="text-xs font-semibold mb-3 flex items-center gap-1">
              ✏️ Sentence-Level Feedback
            </p>
            <div className="space-y-2.5">
              {analysis.inlineFeedback.map((item, idx) => (
                <div key={idx} className={`p-2.5 rounded-lg border ${getScoreBg(
                  item.type === 'strength' ? 80 : item.type === 'improvement' ? 50 : 70
                )}`}>
                  <p className="text-xs font-mono text-muted-foreground mb-1 italic">
                    "{item.sentenceFragment}..."
                  </p>
                  <p className="text-sm">{item.feedback}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
