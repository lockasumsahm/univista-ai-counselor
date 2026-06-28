import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap,
  Globe,
  BookOpen,
  Trophy,
  Briefcase,
  HeartHandshake,
  Users,
  Target,
  DollarSign,
  Calendar,
  FileText,
  Sparkles,
  ExternalLink,
  Mail,
  MapPin,
  Flag,
} from "lucide-react";

/**
 * StudentDossier — top-tier read-only render of every datapoint we hold for
 * a single student. Used inside AdminPage's detail panel.
 */

interface DossierProps {
  detail: {
    profile: any;
    factorScores: any[];
    matches: any[];
    outcomes: any[];
    applications: any[];
    deadlines: any[];
    programs: any[];
    documents: any[];
    documentUrls: Record<string, string>;
    chats: any[];
    interviews: any[];
  };
}

const PROFILE_FIELDS: Array<{
  key: string;
  label: string;
  icon: any;
  group: "academic" | "context" | "experience" | "targets";
}> = [
  { key: "gpa", label: "GPA", icon: GraduationCap, group: "academic" },
  { key: "test_scores", label: "Test Scores (SAT/ACT)", icon: BookOpen, group: "academic" },
  { key: "course_rigor", label: "Course Rigor", icon: BookOpen, group: "academic" },
  { key: "class_rank", label: "Class Rank", icon: Trophy, group: "academic" },
  { key: "a_level_grades", label: "A-Level Grades", icon: BookOpen, group: "academic" },
  { key: "predicted_grades", label: "Predicted Grades", icon: BookOpen, group: "academic" },
  { key: "gaokao_score", label: "Gaokao Score", icon: BookOpen, group: "academic" },
  { key: "national_exam_type", label: "National Exam Type", icon: BookOpen, group: "academic" },
  { key: "national_exam_score", label: "National Exam Score", icon: BookOpen, group: "academic" },
  { key: "baccalaureate_score", label: "Baccalaureate", icon: BookOpen, group: "academic" },

  { key: "extracurriculars", label: "Extracurriculars", icon: Sparkles, group: "experience" },
  { key: "honors_awards", label: "Honors & Awards", icon: Trophy, group: "experience" },
  { key: "research_experience", label: "Research", icon: BookOpen, group: "experience" },
  { key: "work_experience", label: "Work Experience", icon: Briefcase, group: "experience" },
  { key: "volunteer_hours", label: "Volunteering", icon: HeartHandshake, group: "experience" },
  { key: "athletics", label: "Athletics", icon: Trophy, group: "experience" },
  { key: "special_talents", label: "Special Talents", icon: Sparkles, group: "experience" },

  { key: "first_generation", label: "First Generation", icon: Users, group: "context" },
  { key: "legacy_status", label: "Legacy Status", icon: Users, group: "context" },
  { key: "country", label: "Country", icon: Flag, group: "context" },

  { key: "intended_major", label: "Intended Major", icon: Target, group: "targets" },
  { key: "budget", label: "Budget", icon: DollarSign, group: "targets" },
  { key: "timeline", label: "Timeline", icon: Calendar, group: "targets" },
];

const fmt = (v: any): string => {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.length ? v.join(", ") : "—";
  return String(v);
};

const HeaderSummary = ({ profile }: { profile: any }) => (
  <Card className="overflow-hidden border-border/50 shadow-card">
    <div className="bg-gradient-primary p-6 text-primary-foreground">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-display font-bold">
            {profile?.name || "Unnamed student"}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-primary-foreground/85">
            {profile?.email && (
              <span className="inline-flex items-center gap-1">
                <Mail className="h-4 w-4" /> {profile.email}
              </span>
            )}
            {profile?.country && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {profile.country}
              </span>
            )}
            {profile?.intended_major && (
              <span className="inline-flex items-center gap-1">
                <Target className="h-4 w-4" /> {profile.intended_major}
              </span>
            )}
          </div>
        </div>
        {profile?.target_countries?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {profile.target_countries.slice(0, 6).map((c: string) => (
              <Badge
                key={c}
                variant="secondary"
                className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Globe className="mr-1 h-3 w-3" /> {c}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  </Card>
);

const FieldGroup = ({
  title,
  fields,
  profile,
}: {
  title: string;
  fields: typeof PROFILE_FIELDS;
  profile: any;
}) => {
  if (!fields.length) return null;
  return (
    <Card className="border-border/50 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map(({ key, label, icon: Icon }) => {
          const value = profile?.[key];
          const hasValue =
            value !== null && value !== undefined && value !== "" && value !== false;
          return (
            <div
              key={key}
              className={`rounded-xl border p-3 transition ${
                hasValue
                  ? "border-border/40 bg-background"
                  : "border-dashed border-border/30 bg-muted/20"
              }`}
            >
              <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <Icon className="h-3.5 w-3.5" /> {label}
              </div>
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {fmt(value)}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const findResumeAnalysis = (documents: any[]) =>
  documents.find((d) =>
    ["cv", "resume", "transcript"].some((t) =>
      String(d.document_type || "").toLowerCase().includes(t),
    ),
  );

// ── Helpers: narrative, dimension averages, activity timeline ──
// Narrative lines are rendered as structured tokens (no raw HTML) to avoid
// any possibility of stored XSS from user-controlled profile fields.
type NarrativeToken = string | { b: string } | { i: string };
type NarrativeLine = NarrativeToken[];

function buildNarrative(detail: DossierProps["detail"], completeness: number): NarrativeLine[] {
  const p = detail.profile || {};
  const lines: NarrativeLine[] = [];
  const name = p.name || "This student";

  const first: NarrativeLine = [{ b: String(name) }];
  if (p.country) first.push(" from ", { b: String(p.country) });
  if (p.intended_major) first.push(", targeting ", { b: String(p.intended_major) });
  if (p.gpa) first.push(", GPA ", { b: String(p.gpa) });
  first.push(". Profile ", { b: `${completeness}%` }, " complete.");
  const targets = (p.target_countries || []).slice(0, 3).map(String).join(", ");
  if (targets) first.push(" Aiming for ", targets, ".");
  if (p.updated_at) {
    first.push(" Last active ", { b: new Date(p.updated_at).toLocaleDateString() }, ".");
  }
  lines.push(first);

  const docs = detail.documents || [];
  const docFiles = Object.keys(detail.documentUrls || {});
  if (docs.length || docFiles.length) {
    lines.push([
      "Uploaded ", { b: String(docFiles.length) }, " file(s); ",
      { b: String(docs.length) }, " AI document analyses on record.",
    ]);
  } else {
    lines.push(["No documents uploaded yet."]);
  }

  const fs = detail.factorScores || [];
  if (fs.length) {
    const top = [...fs].sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0)).slice(0, 3);
    const topStr = top.map((f) => `${f.university_name} ${f.overall_score}%`).join(", ");
    lines.push([
      "Generated ", { b: String(fs.length) }, " university score(s). Top: ", topStr, ".",
    ]);
  }

  const apps = detail.applications || [];
  const dls = detail.deadlines || [];
  if (apps.length || dls.length) {
    const upcoming = dls.filter((d) => {
      if (!d.date || d.completed) return false;
      const t = new Date(d.date).getTime();
      return !isNaN(t) && t - Date.now() < 1000 * 60 * 60 * 24 * 30;
    }).length;
    lines.push([
      "Tracking ", { b: String(apps.length) }, " application(s); ",
      { b: String(upcoming) }, " deadline(s) in next 30 days.",
    ]);
  }

  const ints = detail.interviews || [];
  if (ints.length) {
    const avgReady = Math.round(
      ints.reduce((a, b) => a + (b.readiness_score || 0), 0) / ints.length,
    );
    const dims = computeDimensionAverages(ints);
    const weakest = Object.entries(dims).sort((a, b) => a[1] - b[1])[0];
    const line: NarrativeLine = [
      "Completed ", { b: String(ints.length) }, " mock interview(s); average readiness ",
      { b: `${avgReady}/100` },
    ];
    if (weakest && weakest[1] > 0) {
      line.push(", weakest dimension: ", { i: String(weakest[0]) });
    }
    line.push(".");
    lines.push(line);
  }

  const chats = detail.chats || [];
  if (chats.length) {
    lines.push([
      "Has exchanged ", { b: String(chats.length) }, " messages with the AI counselor.",
    ]);
  }

  return lines;
}

function renderNarrativeLine(line: NarrativeLine) {
  return line.map((tok, i) => {
    if (typeof tok === "string") return <span key={i}>{tok}</span>;
    if ("b" in tok) return <strong key={i}>{tok.b}</strong>;
    return <em key={i}>{tok.i}</em>;
  });
}

function computeDimensionAverages(interviews: any[]): Record<string, number> {
  const keys = ["specificity", "structure", "authenticity", "relevance", "depth"];
  const out: Record<string, number> = Object.fromEntries(keys.map((k) => [k, 0]));
  const counts: Record<string, number> = Object.fromEntries(keys.map((k) => [k, 0]));
  for (const i of interviews) {
    const d = i?.scores?.dimensions;
    if (!d) continue;
    for (const k of keys) {
      if (typeof d[k] === "number") {
        out[k] += d[k];
        counts[k]++;
      }
    }
  }
  for (const k of keys) {
    out[k] = counts[k] ? Math.round((out[k] / counts[k]) * 10) / 10 : 0;
  }
  return out;
}

interface TimelineEvent {
  ts: number;
  label: string;
  kind: "profile" | "doc" | "match" | "app" | "deadline" | "interview" | "chat";
}

function buildTimeline(detail: DossierProps["detail"]): TimelineEvent[] {
  const evs: TimelineEvent[] = [];
  const push = (date: any, label: string, kind: TimelineEvent["kind"]) => {
    if (!date) return;
    const t = new Date(date).getTime();
    if (isNaN(t)) return;
    evs.push({ ts: t, label, kind });
  };
  push(detail.profile?.updated_at, "Profile updated", "profile");
  for (const d of detail.documents || []) push(d.created_at, `Document analysis · ${d.document_type}`, "doc");
  for (const f of detail.factorScores || []) push(f.created_at, `Match scored · ${f.university_name} (${f.overall_score})`, "match");
  for (const a of detail.applications || []) push(a.created_at, `Application added · ${a.university_name}`, "app");
  for (const d of detail.deadlines || []) push(d.created_at, `Deadline · ${d.university} (${d.date})`, "deadline");
  for (const i of detail.interviews || []) push(i.created_at, `Interview · readiness ${i.readiness_score}/100`, "interview");
  for (const c of (detail.chats || []).slice(0, 20)) push(c.created_at, `Chat (${c.role}) · ${String(c.content).slice(0, 60)}…`, "chat");
  return evs.sort((a, b) => b.ts - a.ts);
}

export const StudentDossier = ({ detail }: DossierProps) => {
  const profile = detail.profile || {};
  const academic = useMemo(
    () => PROFILE_FIELDS.filter((f) => f.group === "academic" && profile?.[f.key]),
    [profile],
  );
  const experience = useMemo(
    () => PROFILE_FIELDS.filter((f) => f.group === "experience"),
    [],
  );
  const context = useMemo(
    () => PROFILE_FIELDS.filter((f) => f.group === "context"),
    [],
  );
  const targets = useMemo(
    () => PROFILE_FIELDS.filter((f) => f.group === "targets"),
    [],
  );

  const completeness = useMemo(() => {
    const total = PROFILE_FIELDS.length;
    const filled = PROFILE_FIELDS.filter((f) => {
      const v = profile?.[f.key];
      return v !== null && v !== undefined && v !== "" && v !== false;
    }).length;
    return Math.round((filled / total) * 100);
  }, [profile]);

  const resume = findResumeAnalysis(detail.documents || []);
  const docFiles = Object.entries(detail.documentUrls || {});

  // ── Build narrative + per-dimension averages + activity timeline ──
  const narrative = useMemo(() => buildNarrative(detail, completeness), [detail, completeness]);
  const dimAverages = useMemo(() => computeDimensionAverages(detail.interviews || []), [detail.interviews]);
  const timeline = useMemo(() => buildTimeline(detail).slice(0, 30), [detail]);

  return (
    <ScrollArea className="h-[70vh] pr-3">
      <div className="space-y-4">
        <HeaderSummary profile={profile} />

        {/* Executive Summary — written narrative for the admin */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/5 p-5">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            Executive summary
          </h3>
          <div className="space-y-2 text-sm leading-relaxed text-foreground">
            {narrative.map((line, i) => (
              <p key={i}>{renderNarrativeLine(line)}</p>
            ))}
          </div>
        </Card>

        <Card className="border-border/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Profile completeness
            </h3>
            <Badge variant="secondary">{completeness}%</Badge>
          </div>
          <Progress value={completeness} className="h-2" />
        </Card>

        <FieldGroup
          title="Academic profile"
          fields={academic.length ? academic : PROFILE_FIELDS.filter((f) => f.group === "academic").slice(0, 4)}
          profile={profile}
        />
        <FieldGroup title="Experience & activities" fields={experience} profile={profile} />
        <FieldGroup title="Background context" fields={context} profile={profile} />
        <FieldGroup title="Targets & preferences" fields={targets} profile={profile} />

        {/* Resume / CV */}
        <Card className="border-border/50 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Resume / CV & uploaded files
          </h3>
          {docFiles.length === 0 && !resume && (
            <p className="text-sm text-muted-foreground">
              No CV uploaded. Student is using profile data only.
            </p>
          )}
          {docFiles.length > 0 && (
            <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {docFiles.map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-xl border border-border/40 bg-background p-3 text-sm transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="flex items-center gap-2 truncate">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="truncate">{name}</span>
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                </a>
              ))}
            </div>
          )}
          {resume?.result && (
            <div className="rounded-xl border border-border/40 bg-muted/20 p-3 text-sm">
              <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                Extracted summary
              </div>
              <p className="whitespace-pre-wrap text-foreground">
                {resume.result.summary ||
                  resume.result.profileSummary ||
                  resume.result.text ||
                  JSON.stringify(resume.result).slice(0, 600) + "…"}
              </p>
            </div>
          )}
        </Card>

        {/* Document analyses (recommendations, essays, awards, etc.) */}
        {detail.documents?.length > 0 && (
          <Card className="border-border/50 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Document analyses ({detail.documents.length})
            </h3>
            <div className="space-y-2">
              {detail.documents.map((d) => (
                <details
                  key={d.id}
                  className="rounded-xl border border-border/40 bg-background p-3 text-sm"
                >
                  <summary className="cursor-pointer font-medium">
                    {d.document_type}
                    {d.file_name ? ` · ${d.file_name}` : ""}
                  </summary>
                  <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-muted/30 p-3 text-xs">
                    {JSON.stringify(d.result, null, 2)}
                  </pre>
                </details>
              ))}
            </div>
          </Card>
        )}

        {/* University matches */}
        <Card className="border-border/50 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            University matches & scores ({detail.factorScores?.length || 0})
          </h3>
          {detail.factorScores?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No matches generated yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {detail.factorScores.map((f) => (
                <div
                  key={f.id}
                  className="rounded-xl border border-border/40 bg-background p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <strong className="truncate text-sm">{f.university_name}</strong>
                    <Badge variant="secondary">{f.overall_score}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {f.category || "—"} ·{" "}
                    {f.created_at ? new Date(f.created_at).toLocaleDateString() : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Applications + Programs + Deadlines + Outcomes */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="border-border/50 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Applications ({detail.applications?.length || 0})
            </h3>
            {detail.applications?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No applications.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {detail.applications.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-xl border border-border/40 bg-background p-2"
                  >
                    <strong>{a.university_name}</strong>
                    <span className="ml-2 text-xs text-muted-foreground">
                      Deadline: {a.deadline || "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="border-border/50 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Programs ({detail.programs?.length || 0})
            </h3>
            {detail.programs?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No programs tracked.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {detail.programs.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-xl border border-border/40 bg-background p-2"
                  >
                    <strong>{p.university}</strong> — {p.program || "—"}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {p.status} · {p.priority}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="border-border/50 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Deadlines ({detail.deadlines?.length || 0})
            </h3>
            {detail.deadlines?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No deadlines.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {detail.deadlines.map((d) => (
                  <li
                    key={d.id}
                    className="rounded-xl border border-border/40 bg-background p-2"
                  >
                    <strong>{d.university}</strong> · {d.date}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {d.type} {d.completed ? "✓" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="border-border/50 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Outcomes ({detail.outcomes?.length || 0})
            </h3>
            {detail.outcomes?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No outcomes recorded.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {detail.outcomes.map((o) => (
                  <li
                    key={o.id}
                    className="rounded-xl border border-border/40 bg-background p-2"
                  >
                    <strong>{o.university_name}</strong> ·{" "}
                    <Badge variant="secondary">{o.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Interviews */}
        {detail.interviews?.length > 0 && (
          <Card className="border-border/50 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              AI interview sessions ({detail.interviews.length})
            </h3>
            <div className="space-y-2">
              {detail.interviews.map((i) => (
                <details
                  key={i.id}
                  className="rounded-xl border border-border/40 bg-background p-3 text-sm"
                >
                  <summary className="flex cursor-pointer items-center justify-between">
                    <span>
                      <strong>{i.target_school}</strong>{" "}
                      <span className="text-xs text-muted-foreground">
                        · {i.persona}
                      </span>
                    </span>
                    <Badge variant="secondary">Readiness {i.readiness_score}</Badge>
                  </summary>
                  <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-muted/30 p-3 text-xs">
                    {JSON.stringify(
                      { scores: i.scores, summary: i.summary, questions: i.questions },
                      null,
                      2,
                    )}
                  </pre>
                </details>
              ))}
            </div>
          </Card>
        )}

        {/* Per-dimension interview readiness */}
        {Object.values(dimAverages).some((v) => v > 0) && (
          <Card className="border-border/50 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Interview readiness by dimension
            </h3>
            <div className="space-y-2">
              {Object.entries(dimAverages).map(([k, v]) => (
                <div key={k}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="capitalize text-muted-foreground">{k}</span>
                    <span className="font-mono text-foreground">{v}/10</span>
                  </div>
                  <Progress value={v * 10} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Activity timeline */}
        {timeline.length > 0 && (
          <Card className="border-border/50 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Recent activity ({timeline.length})
            </h3>
            <ol className="relative space-y-2 border-l border-border/40 pl-4">
              {timeline.map((e, i) => (
                <li key={i} className="text-sm">
                  <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-primary/60" />
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-foreground">{e.label}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(e.ts).toLocaleString()}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        )}

        {/* Chat history */}
        {detail.chats?.length > 0 && (
          <Card className="border-border/50 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              AI chat history ({detail.chats.length})
            </h3>
            <div className="max-h-96 space-y-2 overflow-auto pr-1">
              {detail.chats
                .slice()
                .reverse()
                .map((c) => (
                  <div
                    key={c.id}
                    className={`rounded-xl border border-border/40 p-3 text-sm ${
                      c.role === "user" ? "bg-muted/30" : "bg-primary/5"
                    }`}
                  >
                    <div className="text-xs font-semibold uppercase text-muted-foreground">
                      {c.role}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))}
            </div>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};

export default StudentDossier;
