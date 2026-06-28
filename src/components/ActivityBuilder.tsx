// ============================================================================
// ActivityBuilder — Guided, chip-based activity entry. Students mostly tap.
// 4 steps: Category → Subtype → Roles+Tags → Impact + AI helpers.
// ============================================================================

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, ChevronRight, Sparkles, Loader2, Check, X } from "lucide-react";
import { ACTIVITY_CATEGORIES, SCOPE_LEVELS, type ActivityCategoryKey, type ScopeLevel } from "@/lib/activityTemplates";
import { invokeEdgeFunction } from "@/lib/edgeFunctions";
import { toast } from "@/hooks/use-toast";

export interface BuilderActivity {
  id: string;
  category: ActivityCategoryKey;
  subtype: string;
  title: string;
  roles: string[];
  achievements: string[];
  scope: ScopeLevel | "City";
  hours_per_week: number;
  weeks_per_year: number;
  years: number;
  description: string;
  verified: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (activity: BuilderActivity) => void;
  initial?: BuilderActivity;
}

const newId = () => `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const Chip = ({
  selected,
  onClick,
  children,
}: {
  selected?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`min-h-[44px] px-4 py-2 rounded-full border text-sm font-medium transition-all ${
      selected
        ? "bg-primary text-primary-foreground border-primary shadow-sm"
        : "bg-card border-border text-foreground hover:bg-muted hover:border-primary/40"
    }`}
  >
    {children}
  </button>
);

export const ActivityBuilder = ({ open, onClose, onSave, initial }: Props) => {
  const [step, setStep] = useState(0);
  const [activity, setActivity] = useState<BuilderActivity>(
    initial ?? {
      id: newId(),
      category: "Sports",
      subtype: "",
      title: "",
      roles: [],
      achievements: [],
      scope: "School",
      hours_per_week: 3,
      weeks_per_year: 30,
      years: 1,
      description: "",
      verified: false,
    }
  );
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const cat = ACTIVITY_CATEGORIES.find((c) => c.key === activity.category)!;
  const tpl = useMemo(
    () => cat.templates.find((t) => t.subtype === activity.subtype),
    [cat, activity.subtype]
  );

  const reset = () => {
    setStep(0);
    setActivity({
      id: newId(),
      category: "Sports",
      subtype: "",
      title: "",
      roles: [],
      achievements: [],
      scope: "School",
      hours_per_week: 3,
      weeks_per_year: 30,
      years: 1,
      description: "",
      verified: false,
    });
  };

  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const canNext = () => {
    if (step === 0) return !!activity.category;
    if (step === 1) return !!activity.subtype;
    if (step === 2) return activity.roles.length > 0 || !!activity.title.trim();
    return true;
  };

  const handleAI = async (action: string) => {
    setAiLoading(action);
    try {
      const prompt = buildAIPrompt(action, activity);
      const { data, status } = await invokeEdgeFunction("chatbot-counselor", {
        message: prompt,
        history: [],
        profile: {},
      });
      if (status !== 200 || !data?.reply) {
        toast({ title: "AI helper unavailable", description: "Try again in a moment.", variant: "destructive" });
        return;
      }
      const text = String(data.reply).trim();
      if (action === "suggest") {
        // parse bullet lines
        const items = text.split(/\n+/).map((l) => l.replace(/^[-•*\d.\s]+/, "").trim()).filter(Boolean).slice(0, 5);
        setActivity((a) => ({ ...a, achievements: Array.from(new Set([...a.achievements, ...items])) }));
        toast({ title: "Achievements suggested", description: `Added ${items.length} ideas.` });
      } else {
        setActivity((a) => ({ ...a, description: text.slice(0, 600) }));
      }
    } catch (e) {
      toast({ title: "AI helper failed", variant: "destructive" });
    } finally {
      setAiLoading(null);
    }
  };

  const handleSave = () => {
    const title = activity.title.trim() || `${activity.subtype} – ${activity.roles[0] ?? "Member"}`;
    onSave({ ...activity, title });
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Add Activity
            <span className="ml-auto text-xs font-normal text-muted-foreground">Step {step + 1} of 4</span>
          </DialogTitle>
        </DialogHeader>

        {/* Progress */}
        <div className="flex gap-1.5 mb-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[300px]"
          >
            {step === 0 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">What kind of activity is this?</p>
                <div className="flex flex-wrap gap-2">
                  {ACTIVITY_CATEGORIES.map((c) => (
                    <Chip
                      key={c.key}
                      selected={activity.category === c.key}
                      onClick={() => setActivity({ ...activity, category: c.key, subtype: "", roles: [], achievements: [] })}
                    >
                      <span className="mr-1.5">{c.emoji}</span>
                      {c.label}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Pick the specific type:</p>
                <div className="flex flex-wrap gap-2">
                  {cat.templates.map((t) => (
                    <Chip
                      key={t.subtype}
                      selected={activity.subtype === t.subtype}
                      onClick={() => setActivity({ ...activity, subtype: t.subtype, roles: [], achievements: [] })}
                    >
                      <span className="mr-1.5">{t.emoji}</span>
                      {t.subtype}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && tpl && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Title (optional — we'll auto-fill)</Label>
                  <Input
                    id="title"
                    value={activity.title}
                    onChange={(e) => setActivity({ ...activity, title: e.target.value })}
                    placeholder={`e.g. ${tpl.subtype} – ${tpl.roles[0] ?? "Member"}`}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Roles (select all that apply)</Label>
                  <div className="flex flex-wrap gap-2">
                    {tpl.roles.map((r) => (
                      <Chip
                        key={r}
                        selected={activity.roles.includes(r)}
                        onClick={() => setActivity({ ...activity, roles: toggle(activity.roles, r) })}
                      >
                        {r}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Achievements & tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {tpl.achievements.map((a) => (
                      <Chip
                        key={a}
                        selected={activity.achievements.includes(a)}
                        onClick={() => setActivity({ ...activity, achievements: toggle(activity.achievements, a) })}
                      >
                        {a}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <Label className="mb-2 block">Scope of impact</Label>
                  <div className="flex flex-wrap gap-2">
                    {SCOPE_LEVELS.map((s) => (
                      <Chip
                        key={s.value}
                        selected={activity.scope === s.value}
                        onClick={() => setActivity({ ...activity, scope: s.value })}
                      >
                        <span className="mr-1.5">{s.emoji}</span>
                        {s.label}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs">Hrs/week: {activity.hours_per_week}</Label>
                    <Slider
                      value={[activity.hours_per_week]}
                      onValueChange={([v]) => setActivity({ ...activity, hours_per_week: v })}
                      min={1} max={40} step={1}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Weeks/yr: {activity.weeks_per_year}</Label>
                    <Slider
                      value={[activity.weeks_per_year]}
                      onValueChange={([v]) => setActivity({ ...activity, weeks_per_year: v })}
                      min={1} max={52} step={1}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Years: {activity.years}</Label>
                    <Slider
                      value={[activity.years]}
                      onValueChange={([v]) => setActivity({ ...activity, years: v })}
                      min={1} max={6} step={1}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="desc">Description (optional)</Label>
                    <div className="flex gap-1.5 flex-wrap">
                      {[
                        { k: "generate", label: "Generate" },
                        { k: "improve", label: "Improve" },
                        { k: "suggest", label: "Suggest +" },
                        { k: "common-app", label: "Common App" },
                      ].map((b) => (
                        <Button
                          key={b.k}
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={!!aiLoading}
                          onClick={() => handleAI(b.k)}
                          className="h-7 px-2 text-xs gap-1"
                        >
                          {aiLoading === b.k ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          {b.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    id="desc"
                    value={activity.description}
                    onChange={(e) => setActivity({ ...activity, description: e.target.value })}
                    rows={3}
                    placeholder="What did you do, build, or change? AI can help — just tap a button above."
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between gap-2 pt-4 border-t border-border/40">
          <Button
            variant="ghost"
            onClick={() => (step === 0 ? onClose() : setStep(step - 1))}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="gap-1">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSave} className="gap-1">
              <Check className="w-4 h-4" /> Save Activity
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

function buildAIPrompt(action: string, a: BuilderActivity): string {
  const ctx = `Activity: ${a.subtype} (${a.category}). Roles: ${a.roles.join(", ") || "—"}. Achievements: ${a.achievements.join(", ") || "—"}. Scope: ${a.scope}. ${a.hours_per_week} hrs/week × ${a.weeks_per_year} weeks × ${a.years} years.`;
  switch (action) {
    case "generate":
      return `Write a 2-sentence Common-App-style activity description (max 50 words) for: ${ctx} Be specific, concrete, and impact-focused. Reply with ONLY the description.`;
    case "improve":
      return `Improve this activity description for a US college application. Make it punchier, more concrete, and impact-focused. Keep under 50 words. Reply with ONLY the rewritten text.\n\nOriginal: ${a.description || ctx}`;
    case "suggest":
      return `Given this activity (${ctx}), list 5 realistic achievements/tags a strong applicant might have. Output as a plain bulleted list, 3-5 words each, no extra commentary.`;
    case "common-app":
      return `Rewrite as a Common App Activities section entry (max 150 chars description + 50 char position). Format: POSITION: <position>\nDESC: <description>\n\nContext: ${ctx}`;
    default:
      return `Help with this activity: ${ctx}`;
  }
}
