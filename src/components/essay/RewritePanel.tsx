import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, RefreshCw, ArrowUp, ArrowDown, Minus, Wand2 } from 'lucide-react';
import { RewriteOption, getScoreColor } from '@/hooks/useEssayCoach';

interface RewritePanelProps {
  essay: string;
  essayType: string;
  currentScore: number;
  isRewriting: boolean;
  onRewrite: (paragraph: string, style: string) => Promise<RewriteOption[]>;
  onApplyRewrite: (original: string, replacement: string) => void;
}

const REWRITE_STYLES = [
  { id: 'hook', label: 'Opening Hook', desc: 'Make the intro captivating' },
  { id: 'leadership', label: 'Leadership Story', desc: 'Emphasize leadership qualities' },
  { id: 'impact', label: 'Tech/Impact Story', desc: 'Highlight innovation & impact' },
  { id: 'community', label: 'Community/Service', desc: 'Strengthen community narrative' },
  { id: 'general', label: 'General Improvement', desc: 'Overall quality boost' },
];

export const RewritePanel = ({ essay, essayType, currentScore, isRewriting, onRewrite, onApplyRewrite }: RewritePanelProps) => {
  const [selectedParagraph, setSelectedParagraph] = useState<string | null>(null);
  const [selectedParagraphIndex, setSelectedParagraphIndex] = useState<number | null>(null);
  const [rewriteStyle, setRewriteStyle] = useState('general');
  const [rewrites, setRewrites] = useState<RewriteOption[]>([]);

  const paragraphs = essay.split(/\n\n+/).filter(p => p.trim().length > 20);

  const handleSelectParagraph = (index: number) => {
    setSelectedParagraph(paragraphs[index]);
    setSelectedParagraphIndex(index);
    setRewrites([]);
  };

  const handleRewrite = async () => {
    if (!selectedParagraph) return;
    const results = await onRewrite(selectedParagraph, rewriteStyle);
    setRewrites(results);
  };

  const handleApply = (rewrite: RewriteOption) => {
    if (!selectedParagraph) return;
    onApplyRewrite(selectedParagraph, rewrite.text);
    setSelectedParagraph(null);
    setSelectedParagraphIndex(null);
    setRewrites([]);
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-3 w-3 text-success" />;
    if (change < 0) return <ArrowDown className="h-3 w-3 text-destructive" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <Card className="border-accent/20">
      <CardContent className="pt-5 space-y-4">
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-accent" />
          <h3 className="font-semibold">AI Rewrite Suggestions</h3>
          <Badge variant="secondary" className="text-xs">Click a paragraph</Badge>
        </div>

        {paragraphs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Write at least one paragraph to get AI rewrite suggestions.
          </p>
        ) : (
          <>
            {/* Paragraph selector */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {paragraphs.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectParagraph(i)}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                    selectedParagraphIndex === i
                      ? 'border-accent bg-accent/10'
                      : 'border-border/50 hover:border-accent/30 hover:bg-muted/30'
                  }`}
                >
                  <span className="text-xs font-medium text-muted-foreground">Paragraph {i + 1}</span>
                  <p className="line-clamp-2 mt-0.5">{p}</p>
                </button>
              ))}
            </div>

            {selectedParagraph && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Select value={rewriteStyle} onValueChange={setRewriteStyle}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REWRITE_STYLES.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.label} — {s.desc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleRewrite} disabled={isRewriting} size="sm">
                    {isRewriting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Rewrite options */}
                {rewrites.length > 0 && (
                  <div className="space-y-3">
                    {rewrites.map((r, i) => (
                      <Card key={i} className="border-border/50 hover:border-accent/30 transition-all">
                        <CardContent className="pt-3 pb-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-xs">{r.style}</Badge>
                            <div className="flex items-center gap-1 text-xs">
                              {getChangeIcon(r.estimatedScoreChange)}
                              <span className={getScoreColor(currentScore + r.estimatedScoreChange)}>
                                {r.estimatedScoreChange > 0 ? '+' : ''}{r.estimatedScoreChange} pts
                              </span>
                            </div>
                          </div>
                          <p className="text-sm mb-2">{r.text}</p>
                          <p className="text-xs text-muted-foreground mb-2 italic">{r.explanation}</p>
                          <Button size="sm" variant="outline" onClick={() => handleApply(r)} className="w-full">
                            Apply This Rewrite
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
