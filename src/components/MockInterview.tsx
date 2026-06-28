import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Video, Mic, MicOff, Play, Pause, RotateCcw, ChevronRight, ChevronLeft, 
  Lightbulb, Target, Clock, Star, MessageSquare, Brain, Loader2,
  Phone, PhoneOff, Volume2, VolumeX, User, Bot, CheckCircle2,
  BarChart3, Award, Zap, ArrowRight, History, TrendingUp, AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ─── Types ───────────────────────────────────────────────────────
interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  tips: string[];
  followUps: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
}

interface InterviewSession {
  id: string;
  date: Date;
  questionsAnswered: number;
  averageScore: number;
  duration: number;
  feedback: SessionFeedback[];
}

interface SessionFeedback {
  question: string;
  answer: string;
  score: number;
  verdict?: string;
  dimensions?: { specificity: number; structure: number; authenticity: number; relevance: number; depth: number };
  evidence?: string[];
  strengths: string[];
  improvements: string[];
  suggestedAnswer: string;
}

// ─── Question Bank ───────────────────────────────────────────────
const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  { id: "1", category: "Personal", question: "Tell me about yourself.", tips: ["Keep it 2-3 minutes", "Connect experiences to why you're applying", "End with future goals"], followUps: ["What's one thing not on your resume?", "What are you most proud of?"], difficulty: "easy", timeLimit: 180 },
  { id: "2", category: "Personal", question: "What is your greatest weakness?", tips: ["Be honest but strategic", "Show self-awareness", "Explain steps to improve"], followUps: ["How has this weakness affected you?", "What strategies have you used?"], difficulty: "medium", timeLimit: 120 },
  { id: "3", category: "Academic", question: "Why do you want to major in [your field]?", tips: ["Share a specific spark moment", "Connect to activities", "Show program research"], followUps: ["What courses excite you?", "How do you see this field evolving?"], difficulty: "easy", timeLimit: 150 },
  { id: "4", category: "Academic", question: "Describe a challenging academic experience and how you handled it.", tips: ["Use STAR method", "Focus on learning", "Show resilience"], followUps: ["What would you do differently?", "How has this shaped you?"], difficulty: "medium", timeLimit: 180 },
  { id: "5", category: "School Fit", question: "Why do you want to attend [this university]?", tips: ["Be specific about programs", "Research beyond website", "Connect to your goals"], followUps: ["What will you contribute?", "Have you visited campus?"], difficulty: "easy", timeLimit: 150 },
  { id: "6", category: "Leadership", question: "Tell me about a time you led a team or project.", tips: ["Describe your specific role", "Highlight motivation skills", "Share the impact"], followUps: ["How do you handle team conflict?", "What's your leadership style?"], difficulty: "medium", timeLimit: 180 },
  { id: "7", category: "Leadership", question: "Describe a failure you've experienced and what you learned.", tips: ["Choose a genuine failure", "Focus 70% on learning", "Show application of lessons"], followUps: ["Would you decide differently?", "How has this changed you?"], difficulty: "hard", timeLimit: 180 },
  { id: "8", category: "Values", question: "What does diversity mean to you?", tips: ["Share personal experience", "Explain value of perspectives", "Describe inclusive contributions"], followUps: ["How have you engaged across difference?", "What perspectives do you bring?"], difficulty: "medium", timeLimit: 150 },
  { id: "9", category: "Values", question: "If you could solve one global problem, what would it be?", tips: ["Choose genuine passion", "Show complexity understanding", "Connect to studies"], followUps: ["How would you approach it?", "What step can you take now?"], difficulty: "hard", timeLimit: 180 },
  { id: "10", category: "Situational", question: "What would you do if you disagreed with a professor?", tips: ["Show respect for authority", "Explain constructive approach", "Give an example"], followUps: ["How do you handle criticism?", "When should you challenge authority?"], difficulty: "hard", timeLimit: 150 },
];

const CATEGORIES = [...new Set(INTERVIEW_QUESTIONS.map(q => q.category))];

interface MockInterviewProps { profile?: any; }

// ─── Speech helpers ──────────────────────────────────────────────
const useSpeechRecognition = () => {
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return false;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    let finalText = "";
    recognition.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript + " ";
        else interim += e.results[i][0].transcript;
      }
      setTranscript(finalText + interim);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    return true;
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const reset = useCallback(() => { setTranscript(""); }, []);

  return { isListening, transcript, startListening, stopListening, reset, setTranscript };
};

const speak = (text: string, onEnd?: () => void) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
};

const stopSpeaking = () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };

// ─── Anti-fake answer audit ──────────────────────────────────────
// Catches empty / one-line / filler-only / off-topic answers BEFORE we ever ask the AI,
// so the report is honest instead of always saying "good answer".
type AnswerAudit = {
  flag: 'insufficient' | 'thin' | 'filler' | 'off_topic' | 'ok';
  wordCount: number;
  reason: string;
  suggestedScoreCap?: number; // hard cap on AI score
};

const FILLER_RE = /\b(um+|uh+|er+|like|you know|i don'?t know|idk|whatever|stuff|things|kinda|sorta)\b/gi;
const TEMPLATE_RE = /\b(as an ai|as a language model|in conclusion,? i believe|i am writing to|to whom it may concern)\b/i;

function auditAnswer(question: string, answer: string): AnswerAudit {
  const trimmed = (answer || "").trim();
  const words = trimmed ? trimmed.split(/\s+/) : [];
  const wc = words.length;

  if (!trimmed || trimmed === "(No answer provided)") {
    return { flag: 'insufficient', wordCount: 0, reason: "No answer was given.", suggestedScoreCap: 1 };
  }
  if (wc < 15) {
    return { flag: 'insufficient', wordCount: wc, reason: `Only ${wc} words — too short to evaluate. A real answer needs a specific example.`, suggestedScoreCap: 3 };
  }
  if (TEMPLATE_RE.test(trimmed)) {
    return { flag: 'filler', wordCount: wc, reason: "Answer reads like a template / AI-generated text rather than a personal response.", suggestedScoreCap: 4 };
  }
  const fillerHits = (trimmed.match(FILLER_RE) || []).length;
  if (fillerHits > 0 && fillerHits / wc > 0.25) {
    return { flag: 'filler', wordCount: wc, reason: `Heavy filler words (${fillerHits}). Answer lacks substance.`, suggestedScoreCap: 4 };
  }
  // Off-topic check: at least one meaningful question keyword should appear
  const stop = new Set(['the','a','an','and','or','for','to','of','in','on','at','is','are','was','were','do','does','did','your','you','i','me','my','about','tell','what','why','how','when','where','who']);
  const qKeywords = question.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !stop.has(w));
  const aLower = trimmed.toLowerCase();
  const overlap = qKeywords.filter(k => aLower.includes(k)).length;
  if (qKeywords.length >= 3 && overlap === 0 && wc < 60) {
    return { flag: 'off_topic', wordCount: wc, reason: "Answer doesn't appear to address the question asked.", suggestedScoreCap: 4 };
  }
  if (wc < 35) {
    return { flag: 'thin', wordCount: wc, reason: `Short answer (${wc} words). Add a specific example with the STAR method.`, suggestedScoreCap: 6 };
  }
  return { flag: 'ok', wordCount: wc, reason: `Substantive answer (${wc} words).` };
}

// Build a strict, evidence-based interviewer prompt.
function buildStrictPrompt(opts: {
  question: string;
  answer: string;
  audit: AnswerAudit;
  profile?: any;
  brief?: boolean;
}) {
  const { question, answer, audit, profile, brief } = opts;
  const profileLine = profile ? `Student profile: name=${profile.name || '?'}, GPA=${profile.gpa || '?'}, major=${profile.intended_major || profile.major || '?'}` : 'No profile.';
  const auditLine = audit.flag === 'ok'
    ? "Audit: substantive answer."
    : `Audit FLAG=${audit.flag.toUpperCase()} — ${audit.reason} You MUST cap the overall score at ${audit.suggestedScoreCap}/10 and explain why in 'improvements'.`;

  return `You are a TOUGH Ivy League admissions interviewer. You do NOT give generic praise. You evaluate honestly and harshly when the answer is weak.

Question asked: "${question}"
Student's answer (verbatim): """${answer}"""
${profileLine}
${auditLine}

RULES:
- Quote 1-2 actual short phrases from the student's answer in 'evidence' (max 12 words each). If the answer is empty/insufficient, say so explicitly.
- Score 5 dimensions 0-10: specificity, structure, authenticity, relevance, depth.
- Overall score = average of dimensions, rounded to 1 decimal, then floored to integer 1-10.
- NEVER use generic praise like "good answer", "great job", "well done". Name the EXACT missing element instead.
- 'verdict' MUST be one of: "Strong", "Adequate", "Weak", "Insufficient".
- ${brief ? "Be concise (this is a live interview, keep arrays short)." : "Be detailed (this is practice mode)."}

Respond with PURE JSON only (no markdown), this exact shape:
{
  "score": <1-10 integer>,
  "verdict": "Strong"|"Adequate"|"Weak"|"Insufficient",
  "dimensions": {"specificity": <0-10>, "structure": <0-10>, "authenticity": <0-10>, "relevance": <0-10>, "depth": <0-10>},
  "evidence": ["<quoted phrase>", "..."],
  "strengths": ["..."],
  "improvements": ["..."],
  "suggestedAnswer": "<2-4 sentences showing what a Strong answer looks like>"
}`;
}

function transitionLine(verdict: string): string {
  switch ((verdict || "").toLowerCase()) {
    case "strong": return "Solid specifics. Let's move on.";
    case "adequate": return "Reasonable answer. Next question.";
    case "weak": return "That answer was thin — let's keep going, but dig deeper next time.";
    case "insufficient": return "I need a real example to evaluate that. Next question.";
    default: return "Moving on.";
  }
}

// ─── Main Component ──────────────────────────────────────────────
export const MockInterview = ({ profile }: MockInterviewProps) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<"menu" | "practice" | "live" | "report">("menu");

  // Practice mode state
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showTips, setShowTips] = useState(false);

  // Live interview state
  const [liveStep, setLiveStep] = useState<"waiting" | "speaking" | "listening" | "thinking" | "done">("waiting");
  const [liveQuestionIdx, setLiveQuestionIdx] = useState(0);
  const [liveAnswers, setLiveAnswers] = useState<SessionFeedback[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [liveLoading, setLiveLoading] = useState(false);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speech = useSpeechRecognition();

  // Session history
  const [sessions, setSessions] = useState<InterviewSession[]>([]);

  const filteredQuestions = selectedCategory === "all" ? INTERVIEW_QUESTIONS : INTERVIEW_QUESTIONS.filter(q => q.category === selectedCategory);
  const currentQuestion = filteredQuestions[currentQuestionIndex];

  // Practice timer
  useEffect(() => {
    if (!isTimerRunning || timeRemaining <= 0) return;
    const t = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { setIsTimerRunning(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isTimerRunning, timeRemaining]);

  // Call duration timer
  useEffect(() => {
    if (liveStep !== "waiting" && liveStep !== "done") {
      callTimerRef.current = setInterval(() => setCallDuration(p => p + 1), 1000);
    }
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current); };
  }, [liveStep]);

  // Stop AI voice + mic when component unmounts (e.g. user navigates away)
  useEffect(() => {
    return () => {
      stopSpeaking();
      try { speech.stopListening(); } catch { /* noop */ }
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const getDifficultyColor = (d: string) => {
    if (d === 'easy') return 'bg-success/10 text-success';
    if (d === 'medium') return 'bg-warning/10 text-warning';
    return 'bg-destructive/10 text-destructive';
  };

  // ─── Practice Mode Feedback (strict, anti-fake) ────────────────
  const getFeedback = async () => {
    if (!userAnswer.trim()) {
      toast({ title: "Empty Answer", description: "Please write your answer first.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const audit = auditAnswer(currentQuestion.question, userAnswer);

    // For clearly insufficient answers, return honest local feedback without burning an AI call
    if (audit.flag === 'insufficient') {
      setFeedback({
        score: audit.suggestedScoreCap ?? 2,
        verdict: "Insufficient",
        dimensions: { specificity: 1, structure: 1, authenticity: 2, relevance: 1, depth: 1 },
        evidence: [userAnswer.slice(0, 60)],
        strengths: [],
        improvements: [audit.reason, "Use the STAR method: Situation, Task, Action, Result.", "Aim for at least 60-90 seconds of spoken content with one specific example."],
        suggestedAnswer: "Open with the situation in one sentence, describe the specific action you took, then end with the measurable result and what it taught you.",
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('chatbot-counselor', {
        body: {
          question: buildStrictPrompt({ question: currentQuestion.question, answer: userAnswer, audit, profile, brief: false }),
          profile,
          conversationHistory: [],
        },
      });
      if (error) throw error;
      const responseText = data.result?.answer || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      let parsed: any = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      if (!parsed) {
        parsed = { score: 5, verdict: "Adequate", strengths: [], improvements: ["Could not parse AI response — try rephrasing."], suggestedAnswer: "" };
      }
      // Enforce score cap from audit
      if (audit.suggestedScoreCap != null && parsed.score > audit.suggestedScoreCap) {
        parsed.score = audit.suggestedScoreCap;
        parsed.improvements = [audit.reason, ...(parsed.improvements || [])];
      }
      setFeedback(parsed);
    } catch {
      toast({ title: "Error", description: "Could not get feedback.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetQuestion = () => { setIsTimerRunning(false); setTimeRemaining(0); setUserAnswer(""); setFeedback(null); setShowTips(false); };

  // ─── Live Interview ────────────────────────────────────────────
  const liveQuestions = INTERVIEW_QUESTIONS.slice(0, 5); // Use first 5 for live

  const startLiveInterview = () => {
    setMode("live");
    setLiveStep("speaking");
    setLiveQuestionIdx(0);
    setLiveAnswers([]);
    setCallDuration(0);
    speech.reset();

    const greeting = `Hello! Welcome to your mock admissions interview. I'm your AI interviewer today. Let's begin. ${liveQuestions[0].question}`;
    setAiSpeaking(true);
    if (isSpeakerOn) {
      speak(greeting, () => {
        setAiSpeaking(false);
        setLiveStep("listening");
        if (!isMuted) speech.startListening();
      });
    } else {
      setTimeout(() => {
        setAiSpeaking(false);
        setLiveStep("listening");
        if (!isMuted) speech.startListening();
      }, 3000);
    }
  };

  const submitLiveAnswer = async () => {
    speech.stopListening();
    const answer = speech.transcript.trim() || "(No answer provided)";
    setLiveStep("thinking");
    setLiveLoading(true);

    const currentQ = liveQuestions[liveQuestionIdx].question;
    const audit = auditAnswer(currentQ, answer);
    let fb: any;

    if (audit.flag === 'insufficient') {
      // Skip AI — answer the student honestly themselves.
      fb = {
        score: audit.suggestedScoreCap ?? 2,
        verdict: "Insufficient",
        dimensions: { specificity: 1, structure: 1, authenticity: 2, relevance: 1, depth: 1 },
        evidence: [answer.slice(0, 60)],
        strengths: [],
        improvements: [audit.reason, "Speak for at least 60 seconds with a specific example."],
        suggestedAnswer: "",
      };
    } else {
      try {
        const { data, error } = await supabase.functions.invoke('chatbot-counselor', {
          body: {
            question: buildStrictPrompt({ question: currentQ, answer, audit, profile, brief: true }),
            profile,
            conversationHistory: [],
          },
        });
        if (error) throw error;
        const responseText = data.result?.answer || '';
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        fb = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 5, verdict: "Adequate", strengths: [], improvements: ["Be more specific."], suggestedAnswer: "" };
        if (audit.suggestedScoreCap != null && fb.score > audit.suggestedScoreCap) {
          fb.score = audit.suggestedScoreCap;
          fb.improvements = [audit.reason, ...(fb.improvements || [])];
        }
      } catch {
        toast({ title: "Error", description: "AI feedback failed. Moving on.", variant: "destructive" });
        fb = { score: audit.suggestedScoreCap ?? 5, verdict: "Adequate", strengths: [], improvements: ["AI evaluator unavailable."], suggestedAnswer: "" };
      }
    }

    const sessionFb: SessionFeedback = {
      question: currentQ,
      answer,
      score: fb.score,
      verdict: fb.verdict,
      dimensions: fb.dimensions,
      evidence: fb.evidence,
      strengths: fb.strengths || [],
      improvements: fb.improvements || [],
      suggestedAnswer: fb.suggestedAnswer || "",
    };
    setLiveAnswers(prev => [...prev, sessionFb]);

    // Move to next question or finish
    const nextIdx = liveQuestionIdx + 1;
    if (nextIdx < liveQuestions.length) {
      setLiveQuestionIdx(nextIdx);
      speech.reset();
      const transition = `${transitionLine(fb.verdict)} ${liveQuestions[nextIdx].question}`;
      setLiveStep("speaking");
      setAiSpeaking(true);
      if (isSpeakerOn) {
        speak(transition, () => {
          setAiSpeaking(false);
          setLiveStep("listening");
          if (!isMuted) speech.startListening();
        });
      } else {
        setTimeout(() => {
          setAiSpeaking(false);
          setLiveStep("listening");
          if (!isMuted) speech.startListening();
        }, 2000);
      }
    } else {
      // Interview complete
      setLiveStep("done");
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      const allFb = [...liveAnswers, sessionFb];
      const safeAvg = allFb.length ? allFb.reduce((a, b) => a + b.score, 0) / allFb.length : 0;
      // Aggregate per-dimension averages for admin trend chart
      const dimKeys: Array<keyof NonNullable<SessionFeedback["dimensions"]>> = ["specificity","structure","authenticity","relevance","depth"];
      const dimAvg: Record<string, number> = {};
      for (const k of dimKeys) {
        const vals = allFb.map(f => f.dimensions?.[k]).filter((v): v is number => typeof v === "number");
        dimAvg[k] = vals.length ? Math.round((vals.reduce((a,b)=>a+b,0)/vals.length)*10)/10 : 0;
      }
      const session: InterviewSession = {
        id: Date.now().toString(),
        date: new Date(),
        questionsAnswered: liveQuestions.length,
        averageScore: Math.round(safeAvg * 10) / 10,
        duration: callDuration,
        feedback: allFb,
      };
      setSessions(prev => [session, ...prev]);
      // Persist for admin review
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("interview_sessions").insert({
            user_id: user.id,
            target_school: "Generic",
            persona: "generic",
            questions: allFb.map(f => ({ q: f.question, a: f.answer, verdict: f.verdict, evidence: f.evidence })),
            scores: { items: allFb.map(f => f.score), average: session.averageScore, dimensions: dimAvg },
            readiness_score: Math.round(session.averageScore * 10),
            summary: {
              verdicts: allFb.map(f => f.verdict),
              strengths: allFb.flatMap(f => f.strengths).slice(0, 8),
              improvements: allFb.flatMap(f => f.improvements).slice(0, 8),
              duration_seconds: callDuration,
            },
          });
        }
      } catch (e) {
        console.warn("Could not persist interview session:", e);
      }
      if (isSpeakerOn) speak("That concludes our interview. Your detailed feedback report is ready for review.");
    }
    setLiveLoading(false);
  };

  const endCall = () => {
    speech.stopListening();
    stopSpeaking();
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    if (liveAnswers.length > 0) {
      const avgScore = liveAnswers.reduce((a, b) => a + b.score, 0) / liveAnswers.length;
      const session: InterviewSession = { id: Date.now().toString(), date: new Date(), questionsAnswered: liveAnswers.length, averageScore: Math.round(avgScore * 10) / 10, duration: callDuration, feedback: liveAnswers };
      setSessions(prev => [session, ...prev]);
    }
    setLiveStep("done");
  };

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Mode: Menu */}
      {mode === "menu" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Header */}
          <Card className="shadow-card border-border/50 overflow-hidden">
            <CardHeader className="bg-gradient-primary text-primary-foreground p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center">
                  <Video className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold">AI Interview Studio</h2>
                  <p className="text-primary-foreground/80">Practice with AI voice interviews & real-time coaching</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Live AI Interview Card */}
                <Card className="p-6 border-2 border-primary/20 hover:border-primary/50 transition-all cursor-pointer group" onClick={startLiveInterview}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Live AI Interview</h3>
                      <p className="text-sm text-muted-foreground">Voice-powered mock interview</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> Real-time voice conversation</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> AI asks 5 curated questions</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> Instant scoring & detailed report</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> Suggested model answers</li>
                  </ul>
                  <Button className="w-full bg-gradient-primary hover:shadow-glow">
                    <Phone className="w-4 h-4 mr-2" />
                    Start Live Interview
                  </Button>
                </Card>

                {/* Practice Mode Card */}
                <Card className="p-6 border-border/50 hover:border-primary/30 transition-all cursor-pointer group" onClick={() => setMode("practice")}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <Brain className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Practice Mode</h3>
                      <p className="text-sm text-muted-foreground">Type answers & get feedback</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> 10 categorized questions</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> Timer & tips for each question</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> AI-powered written feedback</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> Follow-up question practice</li>
                  </ul>
                  <Button variant="outline" className="w-full">
                    <Brain className="w-4 h-4 mr-2" />
                    Open Practice Mode
                  </Button>
                </Card>
              </div>

              {/* Session History */}
              {sessions.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><History className="w-4 h-4 text-primary" /> Recent Sessions</h3>
                  <div className="space-y-2">
                    {sessions.slice(0, 3).map(s => (
                      <Card key={s.id} className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => { setLiveAnswers(s.feedback); setMode("report"); }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{s.questionsAnswered} Questions · {formatTime(s.duration)}</p>
                            <p className="text-xs text-muted-foreground">{s.date.toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${s.averageScore >= 7 ? 'text-success' : s.averageScore >= 5 ? 'text-warning' : 'text-destructive'}`}>{s.averageScore}/10</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Mode: Live Interview */}
      {mode === "live" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Video Call UI */}
          <Card className="overflow-hidden border-0 shadow-2xl">
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-[400px] flex flex-col">
              {/* Call Header */}
              <div className="flex items-center justify-between p-4 bg-black/30">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${liveStep === "done" ? 'bg-destructive' : 'bg-success'} animate-pulse`} />
                  <span className="text-sm text-white/80 font-mono">{formatTime(callDuration)}</span>
                </div>
                <Badge variant="outline" className="text-white/80 border-white/20">
                  Q{liveQuestionIdx + 1}/{liveQuestions.length}
                </Badge>
              </div>

              {/* Participants */}
              <div className="flex-1 flex items-center justify-center gap-8 p-8">
                {/* AI Interviewer */}
                <motion.div className="flex flex-col items-center gap-3" animate={aiSpeaking ? { scale: [1, 1.05, 1] } : {}} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center ${aiSpeaking ? 'bg-primary/30 ring-4 ring-primary/50' : 'bg-primary/20'} transition-all`}>
                    <Bot className="w-12 h-12 md:w-16 md:h-16 text-primary" />
                  </div>
                  <span className="text-white/90 text-sm font-medium">AI Interviewer</span>
                  {aiSpeaking && <span className="text-primary text-xs animate-pulse">Speaking...</span>}
                </motion.div>

                {/* User */}
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center ${speech.isListening ? 'bg-success/30 ring-4 ring-success/50' : 'bg-white/10'} transition-all`}>
                    <User className="w-12 h-12 md:w-16 md:h-16 text-white/80" />
                  </div>
                  <span className="text-white/90 text-sm font-medium">{profile?.name || "You"}</span>
                  {speech.isListening && <span className="text-success text-xs animate-pulse">Listening...</span>}
                </div>
              </div>

              {/* Current Question Display */}
              {liveStep !== "done" && (
                <div className="px-6 pb-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <p className="text-white/60 text-xs mb-1">Current Question:</p>
                    <p className="text-white text-sm md:text-base font-medium">{liveQuestions[liveQuestionIdx]?.question}</p>
                  </div>
                </div>
              )}

              {/* Transcript */}
              {speech.transcript && liveStep === "listening" && (
                <div className="px-6 pb-4">
                  <div className="bg-success/5 backdrop-blur-sm rounded-xl p-3 border border-success/20 max-h-24 overflow-y-auto">
                    <p className="text-success/60 text-xs mb-1">Your answer (live):</p>
                    <p className="text-white/90 text-sm">{speech.transcript}</p>
                  </div>
                </div>
              )}

              {/* Thinking indicator */}
              {liveStep === "thinking" && (
                <div className="px-6 pb-4 flex items-center gap-2 text-primary">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Analyzing your response...</span>
                </div>
              )}

              {/* Call Controls */}
              <div className="flex items-center justify-center gap-4 p-6 bg-black/40">
                <Button size="icon" variant="ghost" aria-label={isMuted ? "Unmute microphone" : "Mute microphone"} className={`rounded-full w-12 h-12 ${isMuted ? 'bg-destructive/20 text-destructive' : 'bg-white/10 text-white hover:bg-white/20'}`} onClick={() => { setIsMuted(!isMuted); if (!isMuted) speech.stopListening(); else if (liveStep === "listening") speech.startListening(); }}>
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>

                <Button size="icon" variant="ghost" aria-label={isSpeakerOn ? "Mute speaker" : "Unmute speaker"} className={`rounded-full w-12 h-12 ${!isSpeakerOn ? 'bg-destructive/20 text-destructive' : 'bg-white/10 text-white hover:bg-white/20'}`} onClick={() => { setIsSpeakerOn(!isSpeakerOn); if (isSpeakerOn) stopSpeaking(); }}>
                  {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </Button>

                {liveStep === "listening" && (
                  <Button className="rounded-full bg-primary hover:bg-primary/80 px-6" onClick={submitLiveAnswer} disabled={liveLoading}>
                    {liveLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                    Submit Answer
                  </Button>
                )}

                <Button size="icon" aria-label="End interview call" className="rounded-full w-14 h-14 bg-destructive hover:bg-destructive/80" onClick={endCall}>
                  <PhoneOff className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Done state */}
          {liveStep === "done" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 border-2 border-primary/20 text-center">
                <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Interview Complete!</h3>
                <p className="text-muted-foreground mb-4">You answered {liveAnswers.length} questions in {formatTime(callDuration)}</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setMode("report")} className="bg-gradient-primary hover:shadow-glow">
                    <BarChart3 className="w-4 h-4 mr-2" /> View Full Report
                  </Button>
                  <Button variant="outline" onClick={() => setMode("menu")}>
                    Back to Menu
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Mode: Report */}
      {mode === "report" && liveAnswers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="sm" onClick={() => setMode("menu")}><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
            <h2 className="text-xl font-bold">Interview Report</h2>
          </div>

          {/* Summary */}
          <Card className="p-6 bg-gradient-primary text-primary-foreground">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold">{(liveAnswers.reduce((a, b) => a + b.score, 0) / liveAnswers.length).toFixed(1)}</p>
                <p className="text-sm text-primary-foreground/70">Avg Score</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{liveAnswers.length}</p>
                <p className="text-sm text-primary-foreground/70">Questions</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{liveAnswers.filter(a => a.score >= 7).length}</p>
                <p className="text-sm text-primary-foreground/70">Strong Answers</p>
              </div>
            </div>
          </Card>

          {/* Per-question breakdown */}
          {liveAnswers.map((a, i) => (
            <Card key={i} className="p-5 border-border/50">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-sm flex-1">Q{i + 1}: {a.question}</h4>
                <Badge className={a.score >= 7 ? 'bg-success/10 text-success' : a.score >= 5 ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}>{a.score}/10</Badge>
              </div>
              <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 mb-3">"{a.answer}"</p>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-success mb-1">✓ Strengths</p>
                  {a.strengths?.map((s, j) => <p key={j} className="text-xs text-muted-foreground">• {s}</p>)}
                </div>
                <div>
                  <p className="text-xs font-medium text-warning mb-1">→ Improve</p>
                  {a.improvements?.map((s, j) => <p key={j} className="text-xs text-muted-foreground">• {s}</p>)}
                </div>
              </div>
              {a.suggestedAnswer && (
                <div className="mt-3 p-3 bg-primary/5 rounded-lg">
                  <p className="text-xs font-medium text-primary mb-1">💡 Model Answer</p>
                  <p className="text-xs text-muted-foreground">{a.suggestedAnswer}</p>
                </div>
              )}
            </Card>
          ))}

          <div className="flex gap-3">
            <Button onClick={startLiveInterview} className="bg-gradient-primary hover:shadow-glow">
              <RotateCcw className="w-4 h-4 mr-2" /> Retry Interview
            </Button>
            <Button variant="outline" onClick={() => setMode("menu")}>Back to Menu</Button>
          </div>
        </motion.div>
      )}

      {/* Mode: Practice */}
      {mode === "practice" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="sm" onClick={() => setMode("menu")}><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
            <h2 className="text-xl font-bold">Practice Mode</h2>
          </div>

          <Card className="shadow-card border-border/50">
            <CardContent className="p-6 space-y-6">
              {/* Category filter */}
              <div className="flex flex-wrap gap-2">
                <Button variant={selectedCategory === "all" ? "default" : "outline"} size="sm" onClick={() => { setSelectedCategory("all"); setCurrentQuestionIndex(0); resetQuestion(); }}>All</Button>
                {CATEGORIES.map(c => (
                  <Button key={c} variant={selectedCategory === c ? "default" : "outline"} size="sm" onClick={() => { setSelectedCategory(c); setCurrentQuestionIndex(0); resetQuestion(); }}>{c}</Button>
                ))}
              </div>

              {/* Question */}
              <motion.div key={currentQuestion.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50">
                  <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                    <Badge className={getDifficultyColor(currentQuestion.difficulty)}>{currentQuestion.difficulty}</Badge>
                    <Badge variant="outline" className="font-mono"><Clock className="w-3 h-3 mr-1" />{Math.floor(currentQuestion.timeLimit / 60)} min</Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">{currentQuestion.question}</h3>

                  <Button variant="ghost" size="sm" onClick={() => setShowTips(!showTips)} className="mb-4">
                    <Lightbulb className="w-4 h-4 mr-2" />{showTips ? 'Hide Tips' : 'Show Tips'}
                  </Button>

                  {showTips && (
                    <div className="p-4 bg-accent/10 rounded-lg mb-4">
                      <h4 className="font-medium text-accent mb-2">Tips:</h4>
                      <ul className="space-y-1">
                        {currentQuestion.tips.map((tip, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <Star className="w-3 h-3 mt-1 text-accent flex-shrink-0" />{tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {isTimerRunning && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Time Remaining</span>
                        <span className={`font-mono font-bold ${timeRemaining < 30 ? 'text-destructive' : 'text-foreground'}`}>{formatTime(timeRemaining)}</span>
                      </div>
                      <Progress value={(timeRemaining / currentQuestion.timeLimit) * 100} />
                    </div>
                  )}

                  <Textarea placeholder="Type your answer here..." value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} rows={6} className="mb-4" />

                  <div className="flex flex-wrap gap-2">
                    {!isTimerRunning ? (
                      <Button onClick={() => { setIsTimerRunning(true); setTimeRemaining(currentQuestion.timeLimit); }} variant="outline"><Play className="w-4 h-4 mr-2" />Start Timer</Button>
                    ) : (
                      <Button onClick={() => setIsTimerRunning(false)} variant="outline"><Pause className="w-4 h-4 mr-2" />Pause</Button>
                    )}
                    <Button onClick={resetQuestion} variant="outline"><RotateCcw className="w-4 h-4 mr-2" />Reset</Button>
                    <Button onClick={getFeedback} disabled={loading} className="bg-gradient-primary hover:shadow-glow">
                      {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : <><Brain className="w-4 h-4 mr-2" />Get AI Feedback</>}
                    </Button>
                  </div>
                </Card>
              </motion.div>

              {/* Feedback */}
              <AnimatePresence>
                {feedback && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <Card className="p-6 border-2 border-primary/20 bg-card/80 backdrop-blur-sm">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" />AI Feedback</h3>
                      <div className="grid gap-4">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl font-bold text-accent">{feedback.score}/10</span>
                          <Progress value={feedback.score * 10} className="flex-1" />
                        </div>
                        <div>
                          <h4 className="font-medium text-success mb-2">✓ Strengths</h4>
                          <ul className="space-y-1">{feedback.strengths?.map((s: string, i: number) => <li key={i} className="text-sm text-muted-foreground">{s}</li>)}</ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-warning mb-2">→ Areas for Improvement</h4>
                          <ul className="space-y-1">{feedback.improvements?.map((s: string, i: number) => <li key={i} className="text-sm text-muted-foreground">{s}</li>)}</ul>
                        </div>
                        {feedback.suggestedAnswer && (
                          <div>
                            <h4 className="font-medium text-primary mb-2">💡 Suggested Approach</h4>
                            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">{feedback.suggestedAnswer}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => { setCurrentQuestionIndex(p => Math.max(0, p - 1)); resetQuestion(); }} disabled={currentQuestionIndex === 0}>
                  <ChevronLeft className="w-4 h-4 mr-2" />Previous
                </Button>
                <span className="text-sm text-muted-foreground">{currentQuestionIndex + 1} of {filteredQuestions.length}</span>
                <Button variant="outline" onClick={() => { setCurrentQuestionIndex(p => Math.min(filteredQuestions.length - 1, p + 1)); resetQuestion(); }} disabled={currentQuestionIndex === filteredQuestions.length - 1}>
                  Next<ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Follow-ups */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2"><Target className="w-4 h-4 text-primary" />Common Follow-ups</h4>
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.followUps.map((f, i) => <Badge key={i} variant="outline" className="text-xs">"{f}"</Badge>)}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
