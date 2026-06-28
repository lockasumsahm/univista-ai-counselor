import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { EssayAnalysis } from '@/hooks/useEssayCoach';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface EssayExportProps {
  essay: string;
  analysis: EssayAnalysis | null;
  essayType: string;
}

export const EssayExport = ({ essay, analysis, essayType }: EssayExportProps) => {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    if (!analysis) {
      toast({ title: 'No Analysis', description: 'Analyze your essay first before exporting.', variant: 'destructive' });
      return;
    }

    setExporting(true);
    try {
      const sections = [
        `╔══════════════════════════════════════════════════╗`,
        `║     UNIVISTA.AI — ESSAY ANALYSIS REPORT         ║`,
        `╚══════════════════════════════════════════════════╝`,
        ``,
        `Generated: ${new Date().toLocaleString()}`,
        `Essay Type: ${essayType}`,
        `Word Count: ${analysis.wordCount} | Reading Time: ${analysis.readingTime}`,
        ``,
        `═══════════════════════════════════════════`,
        `  OVERALL SCORE: ${analysis.overallScore}/100`,
        `═══════════════════════════════════════════`,
        ``,
        `  Clarity:         ${analysis.clarity}/100`,
        `  Authenticity:    ${analysis.authenticity}/100`,
        `  Structure:       ${analysis.structure}/100`,
        `  Impact:          ${analysis.impact}/100`,
        `  Hook Strength:   ${analysis.hookStrength}/100`,
        `  Thesis Clarity:  ${analysis.thesisClarity}/100`,
        `  Emotional Depth: ${analysis.emotionalDepth}/100`,
        `  Storytelling:    ${analysis.storytelling}/100`,
        ``,
        `═══════════════════════════════════════════`,
        `  HOOK ANALYSIS`,
        `═══════════════════════════════════════════`,
        analysis.hookAnalysis || 'N/A',
        ``,
        `═══════════════════════════════════════════`,
        `  THESIS ANALYSIS`,
        `═══════════════════════════════════════════`,
        analysis.thesisAnalysis || 'N/A',
        ``,
        `═══════════════════════════════════════════`,
        `  STRENGTHS`,
        `═══════════════════════════════════════════`,
        ...analysis.feedback.filter(f => f.type === 'strength').map(f => `  ✓ [${f.category}] ${f.message}`),
        ``,
        `═══════════════════════════════════════════`,
        `  AREAS FOR IMPROVEMENT`,
        `═══════════════════════════════════════════`,
        ...analysis.feedback.filter(f => f.type === 'improvement').map(f => `  ⚠ [${f.category}] ${f.message}`),
        ``,
        `═══════════════════════════════════════════`,
        `  SUGGESTIONS`,
        `═══════════════════════════════════════════`,
        ...analysis.feedback.filter(f => f.type === 'suggestion').map(f => `  💡 [${f.category}] ${f.message}`),
        ``,
        ...(analysis.emotionalSuggestions?.length ? [
          `═══════════════════════════════════════════`,
          `  EMOTIONAL DEPTH TIPS`,
          `═══════════════════════════════════════════`,
          ...analysis.emotionalSuggestions.map(s => `  • ${s}`),
          ``,
        ] : []),
        ...(analysis.storytellingSuggestions?.length ? [
          `═══════════════════════════════════════════`,
          `  STORYTELLING TIPS`,
          `═══════════════════════════════════════════`,
          ...analysis.storytellingSuggestions.map(s => `  • ${s}`),
          ``,
        ] : []),
        ...(analysis.inlineFeedback?.length ? [
          `═══════════════════════════════════════════`,
          `  SENTENCE-LEVEL FEEDBACK`,
          `═══════════════════════════════════════════`,
          ...analysis.inlineFeedback.map(f => `  "${f.sentenceFragment}..." → ${f.feedback}`),
          ``,
        ] : []),
        ...(analysis.universityFit ? [
          `═══════════════════════════════════════════`,
          `  UNIVERSITY FIT`,
          `═══════════════════════════════════════════`,
          `  ${analysis.universityFit}`,
          ``,
        ] : []),
        `═══════════════════════════════════════════`,
        `  YOUR ESSAY`,
        `═══════════════════════════════════════════`,
        ``,
        essay,
        ``,
        `───────────────────────────────────────────`,
        `  Report by UniVista.AI — AI University Counselor`,
        `───────────────────────────────────────────`,
      ];

      const content = sections.join('\n');
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `UniVista_Essay_Report_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: 'Export Complete', description: 'Essay analysis report downloaded.' });
    } catch {
      toast({ title: 'Export Failed', description: 'Could not export report.', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleExport} 
      disabled={!analysis || exporting}
      className="gap-1.5"
    >
      {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
      Export Report
    </Button>
  );
};
