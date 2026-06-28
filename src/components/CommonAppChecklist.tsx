import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Download, ClipboardList, Copy } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

type Section = {
  id: string;
  title: string;
  url: string;
  items: string[];
};

const SECTIONS: Section[] = [
  {
    id: "profile",
    title: "Profile",
    url: "https://apply.commonapp.org/Login",
    items: ["Personal information", "Address & contact", "Demographics", "Language", "Geography & nationality"],
  },
  {
    id: "family",
    title: "Family",
    url: "https://apply.commonapp.org/Login",
    items: ["Household status", "Parent 1 details", "Parent 2 details", "Siblings"],
  },
  {
    id: "education",
    title: "Education",
    url: "https://apply.commonapp.org/Login",
    items: ["Current school", "Other secondary schools", "Counselor contact", "Class rank & GPA", "Graduation date"],
  },
  {
    id: "testing",
    title: "Testing",
    url: "https://apply.commonapp.org/Login",
    items: ["SAT / ACT scores", "AP / IB scores", "TOEFL / IELTS / Duolingo", "Test-optional decision"],
  },
  {
    id: "activities",
    title: "Activities",
    url: "https://apply.commonapp.org/Login",
    items: ["List up to 10 activities", "Position/leadership for each (50 chars)", "Description for each (150 chars)", "Grade levels & hours"],
  },
  {
    id: "writing",
    title: "Writing",
    url: "https://apply.commonapp.org/Login",
    items: ["Personal essay (250–650 words)", "Additional information (optional)", "Disciplinary history", "School-specific supplements"],
  },
  {
    id: "courses-grades",
    title: "Courses & Grades",
    url: "https://apply.commonapp.org/Login",
    items: ["Enter every course by year", "Enter grade for each course", "Credit hours / type"],
  },
];

const STORAGE_KEY = "commonAppChecklist:v1";

const splitActivities = (raw: string): string[] => {
  if (!raw) return [];
  return raw
    .split(/\n+|;|•|\u2022/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
};

const truncate150 = (s: string) => (s.length <= 150 ? s : s.slice(0, 147).trimEnd() + "...");

export const CommonAppChecklist = () => {
  const { profile } = useProfile();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setChecked(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(checked)); } catch { /* ignore */ }
  }, [checked]);

  const total = useMemo(() => SECTIONS.reduce((n, s) => n + s.items.length, 0), []);
  const done = useMemo(
    () => Object.values(checked).filter(Boolean).length,
    [checked],
  );
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  const toggle = (key: string) => setChecked((c) => ({ ...c, [key]: !c[key] }));

  const activities = useMemo(() => splitActivities(profile?.extracurriculars || ""), [profile?.extracurriculars]);

  const exportActivities = () => {
    if (activities.length === 0) {
      toast.error("No activities found. Add them to your profile first.");
      return;
    }
    const lines = activities.slice(0, 10).map((a, i) => {
      const trimmed = truncate150(a);
      return `${i + 1}. (${trimmed.length}/150) ${trimmed}`;
    });
    const text =
      "UniVista — Common App Activities Export\n" +
      "Common App allows up to 10 activities, 150 chars each.\n\n" +
      lines.join("\n\n");

    navigator.clipboard.writeText(text).then(
      () => toast.success("Activities copied — paste into Common App"),
      () => downloadText(text),
    );
    downloadText(text);
  };

  const downloadText = (text: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "commonapp-activities.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Common App Checklist</CardTitle>
            <Badge variant="secondary">{percent}% complete</Badge>
          </div>
          <Button size="sm" variant="outline" onClick={exportActivities}>
            <Download className="w-4 h-4 mr-2" />
            Export activities (150 chars)
          </Button>
        </div>
        <Progress value={percent} className="h-2 mt-2" />
        <p className="text-xs text-muted-foreground mt-1">
          {done} of {total} steps · Common App has no public API, so check off as you complete each section.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {SECTIONS.map((s) => {
          const sectionDone = s.items.filter((it) => checked[`${s.id}:${it}`]).length;
          return (
            <div key={s.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{s.title}</h4>
                  <span className="text-xs text-muted-foreground">{sectionDone}/{s.items.length}</span>
                </div>
                <Button asChild size="sm" variant="ghost">
                  <a href={s.url} target="_blank" rel="noopener noreferrer"
                     aria-label={`Open Common App ${s.title} section`}>
                    Open <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              </div>
              <ul className="space-y-1.5">
                {s.items.map((it) => {
                  const key = `${s.id}:${it}`;
                  return (
                    <li key={key} className="flex items-start gap-2 text-sm">
                      <Checkbox
                        id={key}
                        checked={!!checked[key]}
                        onCheckedChange={() => toggle(key)}
                        aria-label={it}
                      />
                      <label htmlFor={key}
                        className={"cursor-pointer leading-tight " + (checked[key] ? "line-through text-muted-foreground" : "")}>
                        {it}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        {activities.length > 0 && (
          <div className="rounded-lg border border-dashed p-3 bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <Copy className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                {activities.length} activities found in your profile · ready to export
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Click "Export activities" to copy them formatted to Common App's 150-character limit.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommonAppChecklist;
