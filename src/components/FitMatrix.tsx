import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { AIStatusNotice, type AIStatus } from "@/components/AIStatusNotice";
import { ProfileGate } from "@/components/ProfileGate";
import { invokeEdgeFunction } from "@/lib/edgeFunctions";
import {
  DollarSign, PartyPopper, MapPin, Building2, BookOpen, Trophy,
  Target, Flame, Globe, Brain, Users, Sparkles, GraduationCap,
  ArrowRight, ArrowLeft, Check
} from "lucide-react";

interface FitQuestion {
  id: string;
  icon: typeof DollarSign;
  emoji: string;
  title: string;
  subtitle: string;
  options: { value: string; label: string; emoji: string }[];
}

const QUESTIONS: FitQuestion[] = [
  {
    id: "budget", icon: DollarSign, emoji: "💰", title: "Financial Fit",
    subtitle: "What is your maximum yearly budget?",
    options: [
      { value: "low", label: "< $20k", emoji: "💵" },
      { value: "medium", label: "$20k – $40k", emoji: "💰" },
      { value: "high", label: "$40k+", emoji: "🏦" },
    ],
  },
  {
    id: "lifestyle", icon: PartyPopper, emoji: "🎉", title: "Lifestyle Fit",
    subtitle: "What campus vibe suits you?",
    options: [
      { value: "social", label: "Social", emoji: "🎉" },
      { value: "balanced", label: "Balanced", emoji: "⚖️" },
      { value: "academic", label: "Academic", emoji: "📚" },
    ],
  },
  {
    id: "environment", icon: MapPin, emoji: "📍", title: "Environment Fit",
    subtitle: "Preferred location?",
    options: [
      { value: "city", label: "City", emoji: "🌆" },
      { value: "suburban", label: "Suburban", emoji: "🏡" },
      { value: "small_town", label: "Small Town", emoji: "🌿" },
    ],
  },
  {
    id: "size", icon: Building2, emoji: "🏫", title: "University Size",
    subtitle: "Ideal student body size?",
    options: [
      { value: "small", label: "Small (<5k)", emoji: "🏠" },
      { value: "medium", label: "Medium (5k–20k)", emoji: "🏢" },
      { value: "large", label: "Large (>20k)", emoji: "🏙️" },
    ],
  },
  {
    id: "academic_style", icon: BookOpen, emoji: "📚", title: "Academic Style",
    subtitle: "Preferred learning style?",
    options: [
      { value: "research", label: "Research", emoji: "🔬" },
      { value: "liberal", label: "Flexible/Liberal", emoji: "🎨" },
      { value: "career", label: "Career-focused", emoji: "💼" },
    ],
  },
  {
    id: "sports", icon: Trophy, emoji: "⚽", title: "Campus Culture",
    subtitle: "Importance of sports culture?",
    options: [
      { value: "high", label: "High", emoji: "🏆" },
      { value: "medium", label: "Medium", emoji: "⚖️" },
      { value: "low", label: "Low", emoji: "📖" },
    ],
  },
  {
    id: "career_intent", icon: Target, emoji: "🎯", title: "Career Intent",
    subtitle: "Goal after graduation?",
    options: [
      { value: "job", label: "Job", emoji: "💼" },
      { value: "startup", label: "Startup", emoji: "🚀" },
      { value: "research", label: "Research", emoji: "🔬" },
      { value: "undecided", label: "Undecided", emoji: "🤔" },
    ],
  },
  {
    id: "pressure", icon: Flame, emoji: "🔥", title: "Academic Pressure Fit",
    subtitle: "Comfort with intensity?",
    options: [
      { value: "high", label: "High", emoji: "🔥" },
      { value: "medium", label: "Medium", emoji: "⚖️" },
      { value: "low", label: "Low", emoji: "😌" },
    ],
  },
  {
    id: "stay_abroad", icon: Globe, emoji: "🌍", title: "Future Plans",
    subtitle: "Stay in that country after graduation?",
    options: [
      { value: "yes", label: "Yes", emoji: "✅" },
      { value: "no", label: "No", emoji: "🏠" },
      { value: "maybe", label: "Maybe", emoji: "🤷" },
    ],
  },
  {
    id: "personality", icon: Brain, emoji: "🧠", title: "Personality Fit",
    subtitle: "How do you learn best?",
    options: [
      { value: "independent", label: "Independent", emoji: "🧍" },
      { value: "guided", label: "Guided/Supportive", emoji: "🤝" },
      { value: "collaborative", label: "Collaborative", emoji: "👥" },
    ],
  },
  {
    id: "social_circle", icon: Users, emoji: "👥", title: "Social Circle Preference",
    subtitle: "What kind of peers do you want?",
    options: [
      { value: "competitive", label: "Competitive", emoji: "🔥" },
      { value: "balanced", label: "Balanced", emoji: "⚖️" },
      { value: "creative", label: "Creative", emoji: "🌈" },
    ],
  },
];

interface FitResult {
  name: string;
  country: string;
  matchScore: number;
  whyYouBelong: string;
  highlights: string[];
}

export const FitMatrix = () => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FitResult[] | null>(null);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);

  const currentQ = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;
  const allAnswered = Object.keys(answers).length === QUESTIONS.length;

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }));
    if (step < QUESTIONS.length - 1) {
      setTimeout(() => setStep(step + 1), 300);
    }
  };

  const submitQuiz = async () => {
    if (!profile?.gpa?.trim()) {
      toast({ title: "Complete Your Profile", description: "Add your GPA to get personalized results.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setAiStatus(null);

    try {
      const { data, status } = await invokeEdgeFunction("university-counselor", {
        action: "fitMatrix",
        profile,
        cvText: `FitMatrix Answers: ${JSON.stringify(answers)}`,
      });

      if (status === 402) { setAiStatus("credits"); return; }
      if (status === 429) { setAiStatus("rateLimit"); return; }

      if (data?.result?.picks) {
        setResults(data.result.picks);
        toast({ title: "✨ FitMatrix™ Complete!", description: "Your top 3 best-fit universities are ready." });
      } else {
        setAiStatus("error");
      }
    } catch {
      setAiStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResults(null);
    setAiStatus(null);
  };

  // Profile gate — block quiz if no GPA/extracurriculars
  if (!profile?.gpa?.trim() || !profile?.extracurriculars?.trim()) {
    return (
      <ProfileGate
        profile={profile}
        featureName="FitMatrix recommendations"
        description="FitMatrix™ pairs your preferences with your academic profile to find the 3 best-fit universities. Add your GPA and extracurriculars to start."
      >
        <div />
      </ProfileGate>
    );
  }

  // Results view
  if (results) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold">🎯 Your Top 3 Picks</h2>
          <p className="text-muted-foreground text-sm mt-1">Where you don't just get in — you <strong>belong</strong>.</p>
        </div>

        {results.map((uni, i) => (
          <motion.div key={uni.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }}>
            <Card className="border-border/50 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">#{i + 1}</Badge>
                      <h3 className="text-lg font-bold">{uni.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {uni.country}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{uni.matchScore}%</div>
                    <p className="text-xs text-muted-foreground">Fit Score</p>
                  </div>
                </div>
                <p className="text-sm mb-3">{uni.whyYouBelong}</p>
                <div className="flex flex-wrap gap-2">
                  {uni.highlights.map((h, j) => (
                    <Badge key={j} variant="secondary" className="text-xs">{h}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <Button onClick={reset} variant="outline" className="w-full gap-2">
          <Sparkles className="w-4 h-4" /> Retake FitMatrix™
        </Button>
      </div>
    );
  }

  // Loading view
  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="relative mx-auto w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <Target className="absolute inset-0 m-auto w-6 h-6 text-primary/60" />
        </div>
        <p className="font-medium">Finding where you truly belong...</p>
        <p className="text-sm text-muted-foreground mt-1">Analyzing your preferences + profile</p>
      </div>
    );
  }

  // AI error view
  if (aiStatus) {
    return <AIStatusNotice status={aiStatus} onRetry={submitQuiz} />;
  }

  // Quiz view
  return (
    <div className="space-y-6">
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="bg-gradient-primary text-primary-foreground p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">FitMatrix™</h2>
              <p className="text-primary-foreground/80">"Don't just get in — belong."</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {step + 1} of {QUESTIONS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentQ.emoji}</span>
                <div>
                  <h3 className="text-lg font-bold">{currentQ.title}</h3>
                  <p className="text-sm text-muted-foreground">{currentQ.subtitle}</p>
                </div>
              </div>

              <RadioGroup
                value={answers[currentQ.id] || ""}
                onValueChange={handleAnswer}
                className="grid gap-3"
              >
                {currentQ.options.map(opt => (
                  <Label
                    key={opt.value}
                    htmlFor={`${currentQ.id}-${opt.value}`}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      answers[currentQ.id] === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-primary/30"
                    }`}
                  >
                    <RadioGroupItem id={`${currentQ.id}-${opt.value}`} value={opt.value} />
                    <span className="text-xl">{opt.emoji}</span>
                    <span className="font-medium">{opt.label}</span>
                    {answers[currentQ.id] === opt.value && <Check className="w-4 h-4 text-primary ml-auto" />}
                  </Label>
                ))}
              </RadioGroup>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            {step < QUESTIONS.length - 1 ? (
              <Button disabled={!answers[currentQ.id]} onClick={() => setStep(step + 1)} className="gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button disabled={!allAnswered} onClick={submitQuiz} className="gap-2">
                <Sparkles className="w-4 h-4" /> Find My Fit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FitMatrix;
