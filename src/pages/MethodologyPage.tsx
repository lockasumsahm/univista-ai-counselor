import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  WEIGHTS,
  CATEGORY_THRESHOLDS,
  RANGE_SPREAD,
  PERCENTILE_THRESHOLD,
  MIN_INCLUDED,
  MAX_INCLUDED,
} from "@/lib/matchEngine";
import { Calculator, Database, Lock, BookOpen } from "lucide-react";

const MethodologyPage = () => {
  // "Explain like I'm a student" toggle is ON by default
  const [studentView, setStudentView] = useState(true);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          How alignment is calculated
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Open methodology — same math you see on every match card.
        </p>
      </motion.div>

      <Card className="bg-muted/30 border-border/60">
        <CardContent className="p-4 flex items-center justify-between">
          <Label htmlFor="student-toggle" className="text-sm font-medium">
            Explain like I'm a student
          </Label>
          <Switch id="student-toggle" checked={studentView} onCheckedChange={setStudentView} />
        </CardContent>
      </Card>

      {studentView ? <StudentView /> : <TechnicalView />}
    </div>
  );
};

const StudentView = () => (
  <div className="space-y-4">
    <Card>
      <CardContent className="p-6 space-y-3">
        <div className="flex items-center gap-2 text-primary"><Database className="w-4 h-4" /><span className="font-semibold">Step 1 — We use real data only</span></div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Every university we score must have published numbers we can verify: median GPA of admitted students, median test scores, acceptance rate, and test policy. Universities missing any of these are listed honestly under "Not included" instead of guessed.
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-6 space-y-3">
        <div className="flex items-center gap-2 text-primary"><Calculator className="w-4 h-4" /><span className="font-semibold">Step 2 — We compare you, not predict</span></div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          For each university, the system compares your profile to that school's published admit data across five areas. The closer you are to their typical admit, the higher the alignment score.
        </p>
        <ul className="text-sm space-y-1.5 mt-2">
          <li>• <strong>Academics</strong> — your GPA vs their median admitted GPA ({WEIGHTS.academics}% of the score)</li>
          <li>• <strong>Testing</strong> — your SAT/ACT vs theirs, respecting test policy ({WEIGHTS.testing}%)</li>
          <li>• <strong>Course rigor</strong> — AP/IB/A-Level signal ({WEIGHTS.rigor}%)</li>
          <li>• <strong>Extracurriculars</strong> — depth and impact ({WEIGHTS.extracurriculars}%)</li>
          <li>• <strong>Selectivity baseline</strong> — how selective the school is ({WEIGHTS.selectivity}%)</li>
        </ul>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-6 space-y-3">
        <div className="flex items-center gap-2 text-primary"><Lock className="w-4 h-4" /><span className="font-semibold">Step 3 — Math is fixed, AI only explains</span></div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Scores are computed by code. Same input always gives the same output. AI is used only to write the human-readable counselor notes — it never sees, generates, or changes your number.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="outline">Safe ≥ {CATEGORY_THRESHOLDS.safe}</Badge>
          <Badge variant="outline">Match ≥ {CATEGORY_THRESHOLDS.match}</Badge>
          <Badge variant="outline">Reach ≥ {CATEGORY_THRESHOLDS.reach}</Badge>
          <Badge variant="outline">Hard Reach below</Badge>
        </div>
      </CardContent>
    </Card>

    <p className="text-xs text-muted-foreground italic text-center pt-2">
      Estimate from published data. Not a prediction.
    </p>
  </div>
);

const TechnicalView = () => (
  <div className="space-y-4">
    <Card>
      <CardContent className="p-6 space-y-3">
        <h3 className="font-semibold">Weights (sum = 100)</h3>
        <pre className="text-xs bg-muted/40 rounded-lg p-3 overflow-x-auto">
{`WEIGHTS = ${JSON.stringify(WEIGHTS, null, 2)}`}
        </pre>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-6 space-y-3">
        <h3 className="font-semibold">Per-factor formulas</h3>
        <ul className="text-sm space-y-2 font-mono">
          <li>academics = clamp(0,100, 75 + (studentGPA − uniMedianGPA) × 62.5)</li>
          <li>testing(SAT) = clamp(0,100, 75 + (studentSAT − uniSAT) / 4)</li>
          <li>testing(ACT) = clamp(0,100, 75 + (studentACT − uniACT) × 6)</li>
          <li>rigor = lookup(IB / AP count / A-Level / honors / standard)</li>
          <li>extracurriculars = countECs × bonus + honors/research/work/volunteer</li>
          <li>selectivity = bands by acceptanceRate</li>
        </ul>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-6 space-y-3">
        <h3 className="font-semibold">Selection</h3>
        <p className="text-sm text-muted-foreground">
          Eligible pool = universities with verified medianGPA, medianSAT, medianACT, acceptanceRate, testPolicy.
          Selected = top {Math.round((1 - PERCENTILE_THRESHOLD) * 100)}th percentile by score, floor {MIN_INCLUDED}, cap {MAX_INCLUDED}.
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-6 space-y-3">
        <h3 className="font-semibold">Display</h3>
        <p className="text-sm text-muted-foreground">
          Range = score ± {RANGE_SPREAD}. Categories use {JSON.stringify(CATEGORY_THRESHOLDS)}.
          AI explanations are post-filtered for banned exaggeration words.
        </p>
      </CardContent>
    </Card>
  </div>
);

export default MethodologyPage;
