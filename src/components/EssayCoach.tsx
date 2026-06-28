import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PenLine, Sparkles, Loader2, Wand2, History, FileDown, 
  GraduationCap
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  useEssayCoach, ESSAY_PROMPTS, EssayAnalysis, DraftEntry, 
  saveDraft, getDrafts 
} from '@/hooks/useEssayCoach';
import { ScorePanel } from '@/components/essay/ScorePanel';
import { RewritePanel } from '@/components/essay/RewritePanel';
import { DraftHistory } from '@/components/essay/DraftHistory';
import { EssayExport } from '@/components/essay/EssayExport';
import { ProfileGate } from '@/components/ProfileGate';
import { useProfile } from '@/hooks/useProfile';

export const EssayCoach = () => {
  const { t } = useLanguage();
  const { profile } = useProfile();
  const { analyzeEssay, getRewriteSuggestions, isAnalyzing, isRewriting } = useEssayCoach();
  const [essay, setEssay] = useState('');
  const [promptType, setPromptType] = useState('common-app');
  const [customPrompt, setCustomPrompt] = useState('');
  const [targetUniversity, setTargetUniversity] = useState('');
  const [analysis, setAnalysis] = useState<EssayAnalysis | null>(null);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [activeTab, setActiveTab] = useState('write');
  const [drafts, setDrafts] = useState<DraftEntry[]>(getDrafts());

  const debouncedEssay = useDebounce(essay, 2000);
  const selectedPrompt = ESSAY_PROMPTS.find(p => p.id === promptType);
  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const wordLimit = selectedPrompt?.maxWords || 650;
  const wordProgress = Math.min((wordCount / wordLimit) * 100, 100);

  const runAnalysis = useCallback(async (text: string) => {
    const result = await analyzeEssay(text, selectedPrompt?.label || '', customPrompt, targetUniversity || undefined);
    if (result) {
      setAnalysis(result);
      // Auto-save draft
      const draft: DraftEntry = {
        id: `draft_${Date.now()}`,
        essay: text,
        score: result.overallScore,
        timestamp: Date.now(),
        essayType: selectedPrompt?.label || 'Essay',
      };
      saveDraft(draft);
      setDrafts(getDrafts());
    }
  }, [analyzeEssay, selectedPrompt, customPrompt, targetUniversity]);

  useEffect(() => {
    if (autoAnalyze && debouncedEssay.trim().length >= 50) {
      runAnalysis(debouncedEssay);
    }
  }, [debouncedEssay, autoAnalyze, runAnalysis]);

  const handleRewrite = async (paragraph: string, style: string) => {
    return getRewriteSuggestions(essay, paragraph, selectedPrompt?.label || '', style, analysis?.overallScore);
  };

  const handleApplyRewrite = (original: string, replacement: string) => {
    setEssay(prev => prev.replace(original, replacement));
  };

  const handleLoadDraft = (draft: DraftEntry) => {
    setEssay(draft.essay);
    setActiveTab('write');
  };

  const handleClearDrafts = () => {
    localStorage.removeItem('univista_essay_drafts');
    setDrafts([]);
  };

  return (
    <ProfileGate profile={profile} featureName="essay coaching" soft>
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="shadow-card border-border/50 overflow-hidden">
        <CardHeader className="bg-gradient-primary text-primary-foreground p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center">
                <PenLine className="w-7 h-7" />
              </div>
              <div>
                <CardTitle className="text-2xl font-display font-bold flex items-center gap-2">
                  {t('essay.title')}
                  <Badge className="bg-primary-foreground/20 text-primary-foreground border-0">
                    <Sparkles className="h-3 w-3 mr-1" /> {t('essay.premium')}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  {t('essay.subtitle')}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <EssayExport essay={essay} analysis={analysis} essayType={selectedPrompt?.label || ''} />
              <Button
                variant={autoAnalyze ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoAnalyze(!autoAnalyze)}
                className={autoAnalyze ? 'bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-0' : ''}
              >
                {autoAnalyze ? t('essay.autoOn') : t('essay.autoOff')}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Config Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block">{t('essay.essayType')}</label>
              <Select value={promptType} onValueChange={setPromptType}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESSAY_PROMPTS.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label} ({p.maxWords}w)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {promptType === 'custom' && (
              <div>
              <label className="text-xs font-medium mb-1.5 block">{t('essay.customPrompt')}</label>
                <Input
                  placeholder={t('essay.customPromptPlaceholder')}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="h-9"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium mb-1.5 block flex items-center gap-1">
                <GraduationCap className="h-3 w-3" /> {t('essay.targetUniversity')}
              </label>
              <Input
                placeholder={t('essay.targetPlaceholder')}
                value={targetUniversity}
                onChange={(e) => setTargetUniversity(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="write" className="gap-1.5">
                <PenLine className="h-3.5 w-3.5" /> {t('essay.writeAnalyze')}
              </TabsTrigger>
              <TabsTrigger value="rewrite" className="gap-1.5">
                <Wand2 className="h-3.5 w-3.5" /> {t('essay.aiRewrites')}
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5">
                <History className="h-3.5 w-3.5" /> {t('essay.draftHistory')}
              </TabsTrigger>
            </TabsList>

            {/* WRITE & ANALYZE TAB */}
            <TabsContent value="write" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Editor */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{t('essay.yourEssay')}</label>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className={wordCount > wordLimit ? 'text-destructive font-medium' : ''}>
                        {wordCount} / {wordLimit} {t('essay.words')}
                      </span>
                      {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    </div>
                  </div>
                  <Progress
                    value={wordProgress}
                    className={`h-2 ${wordCount > wordLimit ? '[&>div]:bg-destructive' : ''}`}
                  />
                  <Textarea
                    placeholder={t('essay.placeholder')}
                    value={essay}
                    onChange={(e) => setEssay(e.target.value)}
                    className="min-h-[450px] resize-none text-base leading-relaxed"
                  />
                  {!autoAnalyze && (
                    <Button
                      onClick={() => runAnalysis(essay)}
                      disabled={isAnalyzing || essay.trim().length < 50}
                      className="w-full"
                    >
                      {isAnalyzing ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('essay.analyzing')}</>
                      ) : (
                        <><Sparkles className="mr-2 h-4 w-4" />{t('essay.analyzeEssay')}</>
                      )}
                    </Button>
                  )}
                </div>

                {/* Score Panel */}
                <div className="space-y-4">
                  {analysis ? (
                    <ScorePanel analysis={analysis} />
                  ) : (
                    <Card className="h-full flex items-center justify-center bg-muted/20 border-dashed border-2">
                      <CardContent className="text-center py-16">
                        <PenLine className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="font-display font-semibold mb-2">{t('essay.startWriting')}</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                          {t('essay.startWritingDesc')}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* REWRITE TAB */}
            <TabsContent value="rewrite" className="mt-4">
              <RewritePanel
                essay={essay}
                essayType={selectedPrompt?.label || ''}
                currentScore={analysis?.overallScore || 0}
                isRewriting={isRewriting}
                onRewrite={handleRewrite}
                onApplyRewrite={handleApplyRewrite}
              />
            </TabsContent>

            {/* HISTORY TAB */}
            <TabsContent value="history" className="mt-4">
              <DraftHistory
                drafts={drafts}
                onLoadDraft={handleLoadDraft}
                onClearDrafts={handleClearDrafts}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
    </ProfileGate>
  );
};
