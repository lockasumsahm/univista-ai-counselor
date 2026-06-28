import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, BookOpen, Users, FileText, ChevronLeft, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { ESSAYS, ESSAY_SCHOOLS, type AdmitEssay } from "@/lib/admitIQ/essays";
import { IVY_PROFILES, type IvyProfile } from "@/lib/admitIQ/ivyProfiles";
import { COMMON_APP_PROMPTS, STRONG_ESSAY_FORMULA, SIMPLE_STRUCTURE } from "@/lib/admitIQ/commonApp";
import { ProfileComparison } from "@/components/admitiq/ProfileComparison";
import { PremiumPassLock } from "@/components/PremiumPassLock";
import { useProfile } from "@/hooks/useProfile";

// Compute a 0-100 match score between user's unified activities and an Ivy profile.
const matchScore = (userCats: string[], ivy: IvyProfile): number => {
  if (userCats.length === 0) return 0;
  const ivyCats = ivy.activities.map((a) => a.category.toLowerCase());
  const norm = (s: string) => s.toLowerCase();
  let hits = 0;
  for (const c of userCats) {
    const cN = norm(c);
    if (ivyCats.some((iC) => iC.includes(cN) || cN.includes(iC))) hits++;
  }
  return Math.round((hits / Math.max(userCats.length, 1)) * 100);
};

type View =
  | { kind: "home" }
  | { kind: "essay"; id: string }
  | { kind: "profile"; id: string }
  | { kind: "compare"; profileId: string };

const AdmitIQPage = () => {
  const [view, setView] = useState<View>({ kind: "home" });
  const { unified } = useProfile();

  const ranked = useMemo(() => {
    const cats = (unified?.activities ?? []).map((a: any) => a.category).filter(Boolean) as string[];
    const scored = IVY_PROFILES.map((p) => ({ profile: p, score: matchScore(cats, p) }));
    return scored.sort((a, b) => b.score - a.score);
  }, [unified]);

  const topMatchId = ranked[0]?.score > 0 ? ranked[0].profile.id : null;

  const back = () => setView({ kind: "home" });

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              Admit<span className="text-accent">IQ</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Reverse-engineer Ivy League admissions. Real essays, real profiles, real comparisons.
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {view.kind === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Section 1 — Essay Library (locked) */}
            <PremiumPassLock featureName="Accepted Essay Library" description="Read full Ivy & top-tier admit essays with hook strategy and structure breakdowns.">
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-display font-semibold">Accepted Essay Library</h2>
                <Badge variant="secondary" className="ml-2">{ESSAYS.length} essays</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Curated essays that earned admission, with hook strategy and structure breakdowns.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ESSAYS.map((e) => (
                  <motion.button
                    key={e.id}
                    onClick={() => setView({ kind: "essay", id: e.id })}
                    whileHover={{ y: -2 }}
                    className="text-left"
                  >
                    <Card className="p-4 h-full hover:border-primary/50 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <Badge style={{ backgroundColor: e.schoolColor, color: "white" }} className="border-0">
                          🎓 {e.school}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{e.year}</span>
                      </div>
                      <p className="font-semibold text-sm mb-1 text-foreground">{e.promptLabel}</p>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{e.whyItWorked}</p>
                      <div className="flex flex-wrap gap-1">
                        {e.themes.slice(0, 3).map((t) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
                        ))}
                      </div>
                    </Card>
                  </motion.button>
                ))}
              </div>
            </section>
            </PremiumPassLock>

            {/* Section 2 — Ivy Profiles (locked) */}
            <PremiumPassLock featureName="Ivy Activities Database" description="Real activity inventories from admitted students, ranked against your profile.">
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-display font-semibold">Ivy Activities Database</h2>
                <Badge variant="secondary" className="ml-2">{IVY_PROFILES.length} admit profiles</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {topMatchId
                  ? "Ranked by closest match to your activity profile. Compare yours side-by-side."
                  : "Real activity inventories from admitted students. Add activities in your profile to see your closest matches."}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ranked.map(({ profile: p, score }) => (
                  <motion.button
                    key={p.id}
                    onClick={() => setView({ kind: "profile", id: p.id })}
                    whileHover={{ y: -2 }}
                    className="text-left relative"
                  >
                    <Card className={`p-4 h-full transition-all ${p.id === topMatchId ? "border-accent shadow-md ring-1 ring-accent/30" : "hover:border-accent/50 hover:shadow-md"}`}>
                      {p.id === topMatchId && (
                        <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground border-0 gap-1">
                          <Sparkles className="w-3 h-3" /> Closest Match
                        </Badge>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="border-accent/40 text-accent">{p.school}</Badge>
                        {score > 0 && (
                          <span className="text-[11px] font-semibold text-accent">{score}% overlap</span>
                        )}
                      </div>
                      <p className="font-semibold text-sm mb-0.5 text-foreground">{p.archetype}</p>
                      <p className="text-xs text-muted-foreground mb-2">{p.major}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{p.summary}</p>
                    </Card>
                  </motion.button>
                ))}
              </div>
            </section>
            </PremiumPassLock>

            {/* Section 3 — Common App Decoder */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-display font-semibold">Common App Strategy Decoder</h2>
                <Badge variant="secondary" className="ml-2">2025/26</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {COMMON_APP_PROMPTS.map((p) => (
                  <Card key={p.id} className="p-4 hover:border-primary/40 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">{p.id}</span>
                      <p className="font-semibold text-sm">{p.short}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{p.full}</p>
                    <div className="space-y-1.5 text-xs">
                      <p><span className="font-semibold text-success">✅ Formula:</span> <span className="text-muted-foreground">{p.formula}</span></p>
                      <p><span className="font-semibold text-destructive">❌ Pitfall:</span> <span className="text-muted-foreground">{p.pitfall}</span></p>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <p className="font-display font-bold mb-3">🎯 Strong Essay Formula</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  {STRONG_ESSAY_FORMULA.map((s) => (
                    <div key={s.step} className="bg-card rounded-lg p-3 border border-border/40">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[10px] font-bold">{s.step}</span>
                        <p className="font-semibold text-sm">{s.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.body}</p>
                    </div>
                  ))}
                </div>
                <p className="font-display font-bold mb-2 mt-4">🚀 Simple Structure</p>
                <div className="flex flex-wrap gap-2">
                  {SIMPLE_STRUCTURE.map((s, i) => (
                    <div key={s.step} className="flex items-center gap-1">
                      <Badge variant="outline" className="bg-card">{s.step}</Badge>
                      {i < SIMPLE_STRUCTURE.length - 1 && <span className="text-muted-foreground">→</span>}
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          </motion.div>
        )}

        {view.kind === "essay" && (
          <EssayDetail
            essay={ESSAYS.find((e) => e.id === view.id)!}
            onBack={back}
          />
        )}

        {view.kind === "profile" && (
          <IvyProfileDetail
            profile={IVY_PROFILES.find((p) => p.id === view.id)!}
            onBack={back}
            onCompare={() => setView({ kind: "compare", profileId: view.id })}
          />
        )}

        {view.kind === "compare" && (
          <ProfileComparison
            ivyProfile={IVY_PROFILES.find((p) => p.id === view.profileId)!}
            onBack={() => setView({ kind: "profile", id: view.profileId })}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const EssayDetail = ({ essay, onBack }: { essay: AdmitEssay; onBack: () => void }) => {
  const prompt = COMMON_APP_PROMPTS.find((p) => p.short.toLowerCase().includes(essay.promptType));
  return (
    <motion.div
      key="essay"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-4"
    >
      <div className="lg:col-span-2 space-y-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ChevronLeft className="w-4 h-4" /> Back to library
        </Button>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge style={{ backgroundColor: essay.schoolColor, color: "white" }} className="border-0">{essay.school}</Badge>
            <Badge variant="outline">{essay.year}</Badge>
            <Badge variant="secondary">{essay.promptLabel}</Badge>
          </div>
          <h2 className="text-2xl font-display font-bold mb-1">— {essay.studentName}</h2>
          <div className="flex flex-wrap gap-1 mb-4">
            {essay.themes.map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 rounded bg-muted">{t}</span>
            ))}
          </div>
          <article className="prose prose-sm max-w-none whitespace-pre-line text-foreground/90 leading-relaxed">
            {essay.body}
          </article>
        </Card>
      </div>

      <div className="space-y-3">
        <Card className="p-4">
          <p className="font-semibold text-sm mb-2 flex items-center gap-2">
            🎯 <span>Why It Worked</span>
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">{essay.whyItWorked}</p>
        </Card>
        <Card className="p-4">
          <p className="font-semibold text-sm mb-2">🪝 Hook Strategy</p>
          <p className="text-xs text-muted-foreground">{essay.hookStrategy}</p>
        </Card>
        <Card className="p-4">
          <p className="font-semibold text-sm mb-2">🏗️ Structure</p>
          <p className="text-xs text-muted-foreground">{essay.structure}</p>
        </Card>
        <Card className="p-4">
          <p className="font-semibold text-sm mb-2">💓 Emotional Arc</p>
          <p className="text-xs text-muted-foreground">{essay.emotionalArc}</p>
        </Card>
        {prompt && (
          <Card className="p-4 border-primary/30 bg-primary/5">
            <p className="font-semibold text-sm mb-2">📝 How to write this prompt</p>
            <p className="text-xs text-muted-foreground mb-2"><b>Formula:</b> {prompt.formula}</p>
            <p className="text-xs text-muted-foreground mb-2"><b>Tip:</b> {prompt.structureTip}</p>
            <p className="text-xs text-muted-foreground"><b>Avoid:</b> {prompt.pitfall}</p>
          </Card>
        )}
        <Card className="p-4">
          <p className="font-semibold text-sm mb-2">💡 Tactics from this essay</p>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {essay.tips.map((t, i) => (
              <li key={i} className="flex gap-2"><span className="text-accent">•</span><span>{t}</span></li>
            ))}
          </ul>
        </Card>
      </div>
    </motion.div>
  );
};

const IvyProfileDetail = ({ profile, onBack, onCompare }: { profile: IvyProfile; onBack: () => void; onCompare: () => void }) => (
  <motion.div
    key="profile"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="space-y-4"
  >
    <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
      <ChevronLeft className="w-4 h-4" /> Back to profiles
    </Button>

    <Card className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <Badge variant="outline" className="border-accent/40 text-accent mb-2">{profile.school}</Badge>
          <h2 className="text-2xl font-display font-bold">{profile.archetype}</h2>
          <p className="text-sm text-muted-foreground">{profile.major}</p>
        </div>
        <Button onClick={onCompare} className="gap-2">
          <Brain className="w-4 h-4" /> Compare Your Profile
        </Button>
      </div>
      <p className="text-sm text-foreground/90 mb-6">{profile.summary}</p>

      <h3 className="font-display font-semibold mb-3">Activities</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground border-b border-border">
              <th className="py-2 pr-2">Category</th>
              <th className="py-2 pr-2">Role</th>
              <th className="py-2 pr-2">Org</th>
              <th className="py-2 pr-2 hidden md:table-cell">Time</th>
              <th className="py-2 pr-2 hidden md:table-cell">Description</th>
            </tr>
          </thead>
          <tbody>
            {profile.activities.map((a, i) => (
              <tr key={i} className="border-b border-border/40 align-top">
                <td className="py-2 pr-2"><Badge variant="secondary" className="text-[10px]">{a.category}</Badge></td>
                <td className="py-2 pr-2 font-medium">{a.role}</td>
                <td className="py-2 pr-2 text-muted-foreground">{a.org}</td>
                <td className="py-2 pr-2 text-xs text-muted-foreground hidden md:table-cell">{a.hours}</td>
                <td className="py-2 pr-2 text-xs text-muted-foreground hidden md:table-cell">{a.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div>
          <p className="font-semibold text-sm mb-2">🏆 Awards</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {profile.awards.map((a, i) => <li key={i} className="flex gap-2"><span className="text-accent">•</span><span>{a}</span></li>)}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-sm mb-2">🎯 Why Accepted</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {profile.whyAccepted.map((w, i) => <li key={i} className="flex gap-2"><span className="text-success">✓</span><span>{w}</span></li>)}
          </ul>
        </div>
      </div>
    </Card>
  </motion.div>
);

export default AdmitIQPage;
