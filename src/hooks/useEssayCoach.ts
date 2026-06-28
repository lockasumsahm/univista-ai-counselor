import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FeedbackItem {
  type: 'strength' | 'improvement' | 'suggestion';
  category: string;
  message: string;
}

export interface InlineFeedback {
  sentenceFragment: string;
  feedback: string;
  type: 'strength' | 'improvement' | 'suggestion';
}

export interface EssayAnalysis {
  overallScore: number;
  clarity: number;
  authenticity: number;
  structure: number;
  impact: number;
  hookStrength: number;
  thesisClarity: number;
  emotionalDepth: number;
  storytelling: number;
  hookAnalysis: string;
  thesisAnalysis: string;
  emotionalSuggestions: string[];
  storytellingSuggestions: string[];
  inlineFeedback: InlineFeedback[];
  feedback: FeedbackItem[];
  universityFit?: string;
  wordCount: number;
  readingTime: string;
}

export interface RewriteOption {
  style: string;
  text: string;
  explanation: string;
  estimatedScoreChange: number;
}

export interface DraftEntry {
  id: string;
  essay: string;
  score: number;
  timestamp: number;
  essayType: string;
}

export const ESSAY_PROMPTS = [
  { id: 'common-app', label: 'Common App Personal Statement', maxWords: 650 },
  { id: 'why-school', label: 'Why This School?', maxWords: 400 },
  { id: 'extracurricular', label: 'Extracurricular Activity', maxWords: 350 },
  { id: 'challenge', label: 'Challenge/Setback Essay', maxWords: 500 },
  { id: 'community', label: 'Community/Identity Essay', maxWords: 500 },
  { id: 'custom', label: 'Custom Prompt', maxWords: 650 },
];

export const useEssayCoach = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);

  const analyzeEssay = useCallback(async (
    essay: string,
    essayType: string,
    customPrompt?: string,
    targetUniversity?: string,
  ): Promise<EssayAnalysis | null> => {
    if (essay.trim().length < 50) return null;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('essay-coach', {
        body: {
          action: 'analyze',
          essay,
          essayType,
          customPrompt,
          targetUniversity,
        }
      });

      if (error) throw error;

      if (data?.success && data?.result) {
        const wordCount = essay.trim().split(/\s+/).length;
        return {
          ...data.result,
          hookStrength: data.result.hookStrength || 0,
          thesisClarity: data.result.thesisClarity || 0,
          emotionalDepth: data.result.emotionalDepth || 0,
          storytelling: data.result.storytelling || 0,
          hookAnalysis: data.result.hookAnalysis || '',
          thesisAnalysis: data.result.thesisAnalysis || '',
          emotionalSuggestions: data.result.emotionalSuggestions || [],
          storytellingSuggestions: data.result.storytellingSuggestions || [],
          inlineFeedback: data.result.inlineFeedback || [],
          feedback: data.result.feedback || [],
          wordCount,
          readingTime: `${Math.ceil(wordCount / 200)} min read`,
        };
      }
      return null;
    } catch (error: any) {
      const msg = error?.message || '';
      if (msg.includes('429') || msg.includes('Rate limit')) {
        toast({ title: 'Rate Limited', description: 'Please wait a moment before analyzing again.', variant: 'destructive' });
      } else if (msg.includes('402')) {
        toast({ title: 'Credits Exhausted', description: 'Please add credits to continue.', variant: 'destructive' });
      } else {
        toast({ title: 'Analysis Failed', description: 'Something went wrong. Please try again.', variant: 'destructive' });
      }
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  const getRewriteSuggestions = useCallback(async (
    essay: string,
    paragraph: string,
    essayType: string,
    rewriteStyle: string,
    previousScore?: number,
  ): Promise<RewriteOption[]> => {
    setIsRewriting(true);
    try {
      const { data, error } = await supabase.functions.invoke('essay-coach', {
        body: {
          action: 'rewrite',
          essay,
          paragraph,
          essayType,
          rewriteStyle,
          previousScore,
        }
      });

      if (error) throw error;
      return data?.result?.rewrites || [];
    } catch (error: any) {
      const msg = error?.message || '';
      if (msg.includes('429')) {
        toast({ title: 'Rate Limited', description: 'Please wait before requesting rewrites.', variant: 'destructive' });
      } else {
        toast({ title: 'Rewrite Failed', description: 'Could not generate rewrites.', variant: 'destructive' });
      }
      return [];
    } finally {
      setIsRewriting(false);
    }
  }, [toast]);

  return { analyzeEssay, getRewriteSuggestions, isAnalyzing, isRewriting };
};

// Draft management utilities
const DRAFTS_KEY = 'univista_essay_drafts';

export const saveDraft = (draft: DraftEntry) => {
  try {
    const existing = getDrafts();
    const updated = [draft, ...existing.filter(d => d.id !== draft.id)].slice(0, 20);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(updated));
  } catch {}
};

export const getDrafts = (): DraftEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]');
  } catch { return []; }
};

export const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-destructive';
};

export const getScoreBg = (score: number) => {
  if (score >= 80) return 'bg-success/10 border-success/30';
  if (score >= 60) return 'bg-warning/10 border-warning/30';
  return 'bg-destructive/10 border-destructive/30';
};
