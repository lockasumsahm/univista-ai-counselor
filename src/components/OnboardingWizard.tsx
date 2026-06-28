import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CountrySelector } from "@/components/CountrySelector";
import { Progress } from "@/components/ui/progress";
import { User, BookOpen, Award, Target, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

interface OnboardingWizardProps {
  onComplete: (data: any) => void;
  initialData?: any;
}

const STEPS = [
  { title: "Basic Info", icon: User, fields: ["name", "email", "country"] },
  { title: "Academics", icon: BookOpen, fields: ["gpa", "testScores", "courseRigor"] },
  { title: "Activities", icon: Award, fields: ["extracurriculars", "honorsAwards", "volunteerHours"] },
  { title: "Targets", icon: Target, fields: ["preferredCountries", "intendedMajor", "timeline"] },
];

export const OnboardingWizard = ({ onComplete, initialData }: OnboardingWizardProps) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<any>({
    name: "", email: "", country: "", gpa: "", testScores: "", courseRigor: "",
    extracurriculars: "", honorsAwards: "", volunteerHours: "",
    preferredCountries: [], intendedMajor: "", timeline: "",
    ...initialData,
  });

  const update = (field: string, value: any) => setData((prev: any) => ({ ...prev, [field]: value }));
  const progress = ((step + 1) / STEPS.length) * 100;
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete(data);
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <button key={i} onClick={() => i <= step && setStep(i)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                i === step ? "text-primary" : i < step ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className="hidden sm:inline">{s.title}</span>
            </button>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          <Card className="border-border/30">
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                {(() => { const StepIcon = STEPS[step].icon; return <StepIcon className="w-6 h-6 text-primary" />; })()}
                <h2 className="text-xl font-display font-bold">{STEPS[step].title}</h2>
              </div>

              {step === 0 && (
                <>
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input value={data.name} onChange={(e) => update("name", e.target.value)} placeholder="Your full name" className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} placeholder="you@email.com" className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={data.country} onChange={(e) => update("country", e.target.value)} placeholder="Your home country" className="h-11 rounded-xl" />
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label>GPA</Label>
                    <Input value={data.gpa} onChange={(e) => update("gpa", e.target.value)} placeholder="e.g. 3.8/4.0 or 92%" className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Test Scores (SAT/ACT/IELTS/TOEFL)</Label>
                    <Input value={data.testScores} onChange={(e) => update("testScores", e.target.value)} placeholder="e.g. SAT 1450, IELTS 7.5" className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Course Rigor (AP/IB/A-Level courses)</Label>
                    <Input value={data.courseRigor} onChange={(e) => update("courseRigor", e.target.value)} placeholder="e.g. 6 AP courses, IB Diploma" className="h-11 rounded-xl" />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label>Extracurricular Activities</Label>
                    <Input value={data.extracurriculars} onChange={(e) => update("extracurriculars", e.target.value)} placeholder="Clubs, sports, leadership roles" className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Honors & Awards</Label>
                    <Input value={data.honorsAwards} onChange={(e) => update("honorsAwards", e.target.value)} placeholder="Competitions, academic honors" className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Volunteer Hours</Label>
                    <Input value={data.volunteerHours} onChange={(e) => update("volunteerHours", e.target.value)} placeholder="e.g. 200+ hours at local hospital" className="h-11 rounded-xl" />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <Label>Target Countries</Label>
                    <CountrySelector value={data.preferredCountries || []} onChange={(v) => update("preferredCountries", v)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Intended Major</Label>
                    <Input value={data.intendedMajor} onChange={(e) => update("intendedMajor", e.target.value)} placeholder="e.g. Computer Science" className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Application Timeline</Label>
                    <Input value={data.timeline} onChange={(e) => update("timeline", e.target.value)} placeholder="e.g. Fall 2025, Early Decision" className="h-11 rounded-xl" />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0} className="rounded-xl gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={handleNext} className="rounded-xl bg-gradient-primary hover:shadow-glow gap-2" disabled={step === 0 && !data.name}>
          {isLast ? (
            <>
              <Sparkles className="w-4 h-4" /> Complete Profile
            </>
          ) : (
            <>
              Next <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
