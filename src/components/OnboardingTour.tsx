import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  FileText, School, Map, Award, MessageCircle, BookOpen, Upload, Mic,
  FileCheck, Users, LayoutDashboard, Clock, Search, TrendingUp,
  ChevronRight, ChevronLeft, X, Sparkles, GraduationCap, Rocket
} from "lucide-react";

const TOUR_KEY = "univista_onboarding_complete";

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  tip: string;
}

const tourSteps: TourStep[] = [
  {
    title: "Welcome to UniVista.AI! 🎓",
    description: "Your AI-powered university counselor that helps you navigate every step of the admissions process — from CV analysis to essay coaching.",
    icon: <GraduationCap className="w-10 h-10" />,
    tip: "Let's take a quick tour of what you can do!",
  },
  {
    title: "AI-Powered Analysis",
    description: "Get your CV analyzed, match with universities worldwide, and generate personalized roadmaps — all powered by advanced AI.",
    icon: <Sparkles className="w-10 h-10" />,
    tip: "Use the action buttons at the top of your dashboard to trigger AI analysis.",
  },
  {
    title: "University Matching & Comparison",
    description: "Find your best-fit universities across 50+ countries. Compare up to 4 schools side-by-side on rankings, costs, and match scores.",
    icon: <School className="w-10 h-10" />,
    tip: "Check the 'Results' and 'Compare' tabs after running University Match.",
  },
  {
    title: "Essay Coach & Document Tools",
    description: "Get AI-guided essay coaching, upload essays for scoring, and optimize your documents for readability and uniqueness.",
    icon: <BookOpen className="w-10 h-10" />,
    tip: "Use 'Essay Coach' for guided writing and 'Essay AI' to score uploaded essays.",
  },
  {
    title: "Track, Prepare & Connect",
    description: "Track deadlines, practice mock interviews, find scholarships, and connect with a community of fellow applicants.",
    icon: <Rocket className="w-10 h-10" />,
    tip: "Explore all tabs to unlock every tool available to you!",
  },
];

export const OnboardingTour = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (step < tourSteps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleComplete = () => {
    localStorage.setItem(TOUR_KEY, "true");
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const current = tourSteps[step];
  const progress = ((step + 1) / tourSteps.length) * 100;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={handleComplete} />

          {/* Card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-card border border-border/50 rounded-3xl shadow-hover overflow-hidden"
          >
            {/* Progress bar */}
            <div className="h-1 bg-muted">
              <motion.div
                className="h-full bg-gradient-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            {/* Close */}
            <button
              onClick={handleComplete}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="p-8 text-center">
              {/* Icon */}
              <motion.div
                key={`icon-${step}`}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
                className="mx-auto w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground mb-6"
              >
                {current.icon}
              </motion.div>

              <motion.h2
                key={`title-${step}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-2xl font-display font-bold text-foreground mb-3"
              >
                {current.title}
              </motion.h2>

              <motion.p
                key={`desc-${step}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground leading-relaxed mb-4"
              >
                {current.description}
              </motion.p>

              <motion.div
                key={`tip-${step}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {current.tip}
              </motion.div>
            </div>

            {/* Footer */}
            <div className="px-8 pb-6 flex items-center justify-between">
              <div className="flex gap-1.5">
                {tourSteps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === step ? "w-6 bg-primary" : i < step ? "bg-primary/40" : "bg-muted-foreground/20"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {step > 0 && (
                  <Button variant="ghost" size="sm" onClick={handlePrev} className="gap-1 text-muted-foreground">
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </Button>
                )}
                {step === 0 && (
                  <Button variant="ghost" size="sm" onClick={handleComplete} className="text-muted-foreground">
                    Skip tour
                  </Button>
                )}
                <Button onClick={handleNext} size="sm" className="gap-1 bg-gradient-primary text-primary-foreground rounded-xl px-5">
                  {step === tourSteps.length - 1 ? "Get Started" : "Next"}
                  {step < tourSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const shouldShowOnboarding = () => {
  return !localStorage.getItem(TOUR_KEY);
};
