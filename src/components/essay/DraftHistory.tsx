import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Clock, Trophy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DraftEntry, getScoreColor } from '@/hooks/useEssayCoach';

interface DraftHistoryProps {
  drafts: DraftEntry[];
  onLoadDraft: (draft: DraftEntry) => void;
  onClearDrafts: () => void;
}

export const DraftHistory = ({ drafts, onLoadDraft, onClearDrafts }: DraftHistoryProps) => {
  if (drafts.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="pt-5 text-center py-8">
          <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">No Drafts Yet</p>
          <p className="text-xs text-muted-foreground">
            Your essay drafts and score improvements will appear here after analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  const scores = drafts.map(d => d.score);
  const improvement = scores.length >= 2 ? scores[0] - scores[scores.length - 1] : 0;
  const bestScore = Math.max(...scores);
  const improvementPercent = Math.min(Math.max(improvement, 0), 100);

  return (
    <Card className="border-border/50">
      <CardContent className="pt-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Draft History</h3>
            <Badge variant="secondary" className="text-xs">{drafts.length} drafts</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClearDrafts}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Improvement Meter */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-success/5 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Improvement Meter</span>
            </div>
            <span className={`text-lg font-bold ${improvement > 0 ? 'text-success' : 'text-muted-foreground'}`}>
              {improvement > 0 ? `+${improvement}` : improvement} pts
            </span>
          </div>
          <Progress value={improvementPercent} className="h-2.5" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
            <span>First: {scores[scores.length - 1]}</span>
            <span>Best: {bestScore}</span>
            <span>Latest: {scores[0]}</span>
          </div>
        </div>

        {/* Draft List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {drafts.map((draft, i) => (
            <button
              key={draft.id}
              onClick={() => onLoadDraft(draft)}
              className="w-full text-left p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/20 transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Draft {drafts.length - i} · {new Date(draft.timestamp).toLocaleDateString()}
                </span>
                <span className={`text-sm font-bold ${getScoreColor(draft.score)}`}>
                  {draft.score}
                </span>
              </div>
              <p className="text-xs line-clamp-1 text-muted-foreground">
                {draft.essay.substring(0, 100)}...
              </p>
              {i < drafts.length - 1 && (
                <div className="flex items-center gap-1 mt-1">
                  {draft.score > drafts[i + 1]?.score ? (
                    <Badge variant="outline" className="text-xs text-success border-success/30">
                      ↑ +{draft.score - drafts[i + 1].score}
                    </Badge>
                  ) : draft.score < drafts[i + 1]?.score ? (
                    <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
                      ↓ {draft.score - drafts[i + 1].score}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">= No change</Badge>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
