import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, MessageSquare, ChevronLeft, ChevronRight, Send, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  question: string;
  options: string[];
}

const QUESTIONS: Question[] = [
  { id: "main_goal", question: "What was your main goal using UniVista?", options: ["Find universities", "Improve profile", "Admission chances", "Essays & applications", "Explore opportunities"] },
  { id: "goal_success", question: "Did you achieve your goal?", options: ["Fully achieved", "Partially achieved", "Not achieved"] },
  { id: "ai_quality", question: "How would you rate the overall AI quality?", options: ["Very accurate & helpful", "Mostly accurate", "Sometimes wrong", "Not useful"] },
  { id: "match_accuracy", question: "How accurate were the University Matches?", options: ["Very accurate", "Mostly accurate", "Not accurate", "Did not use"] },
  { id: "most_used", question: "Which feature did you use the most?", options: ["Uni Matches", "Roadmap", "Profile Score", "Uni Checker", "Essay AI / Coach", "AI Chat", "Documents"] },
  { id: "most_valuable", question: "Which feature was the most valuable to you?", options: ["University recommendations", "Roadmap guidance", "Profile improvement system", "Admission chances", "Essay help", "Document tools"] },
  { id: "least_useful", question: "Which feature was least useful or confusing?", options: ["FitMatrix™", "Profile Score", "Roadmap", "Uni Checker", "Essay AI", "None"] },
  { id: "ease_of_use", question: "How easy was the app to use?", options: ["Very easy", "Easy", "Okay", "Confusing"] },
  { id: "trust_ai", question: "How much do you trust the AI recommendations?", options: ["Fully trust", "Mostly trust", "Unsure", "Do not trust"] },
  { id: "improvement", question: "What is the biggest improvement needed?", options: ["AI accuracy", "More universities", "Simpler UI", "Faster performance", "Better explanations"] },
  { id: "use_again", question: "Would you use UniVista again?", options: ["Yes daily", "Yes weekly", "Maybe", "No"] },
  { id: "recommend", question: "Would you recommend UniVista to others?", options: ["Yes", "Maybe", "No"] },
  { id: "real_applications", question: "Would you use this for REAL university applications?", options: ["Yes, 100%", "Maybe", "No"] },
];

export const FeedbackSurvey = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const progress = ((Object.keys(answers).length) / QUESTIONS.length) * 100;
  const q = QUESTIONS[currentQ];
  const canSubmit = Object.keys(answers).length === QUESTIONS.length;

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [q.id]: value }));
  };

  const submit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("feedback" as any).insert({ user_id: user.id, responses: answers } as any);
      if (error) throw error;
      setSubmitted(true);
      toast({ title: "Thank you!", description: "Your feedback has been submitted." });
    } catch {
      toast({ title: "Error", description: "Failed to submit feedback. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card className="border-primary/30">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-3">Thank You! 🎉</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your feedback helps us improve UniVista for students worldwide. We truly appreciate your time.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <MessageSquare className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">Give Feedback</h2>
          <p className="text-muted-foreground">Help us improve UniVista — takes 2 minutes</p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="border-border/50">
        <CardContent className="p-6 space-y-6">
          <h3 className="text-lg font-semibold text-foreground">{q.question}</h3>
          <RadioGroup value={answers[q.id] || ""} onValueChange={handleAnswer} className="space-y-3">
            {q.options.map((opt) => (
              <div key={opt} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
                <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                <Label htmlFor={`${q.id}-${opt}`} className="cursor-pointer flex-1">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        {currentQ < QUESTIONS.length - 1 ? (
          <Button onClick={() => setCurrentQ(currentQ + 1)} disabled={!answers[q.id]} className="gap-2">
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={submit} disabled={!canSubmit || submitting} className="gap-2">
            {submitting ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Feedback
          </Button>
        )}
      </div>
    </div>
  );
};

export default FeedbackSurvey;
