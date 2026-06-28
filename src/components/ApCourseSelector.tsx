import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, X, Search } from "lucide-react";

// Full College Board AP course catalog (2025-26).
export const AP_COURSES: { name: string; group: string }[] = [
  // Arts
  { name: "AP Art History", group: "Arts" },
  { name: "AP Music Theory", group: "Arts" },
  { name: "AP Studio Art: 2-D Design", group: "Arts" },
  { name: "AP Studio Art: 3-D Design", group: "Arts" },
  { name: "AP Studio Art: Drawing", group: "Arts" },
  // English
  { name: "AP English Language and Composition", group: "English" },
  { name: "AP English Literature and Composition", group: "English" },
  // History & Social Science
  { name: "AP African American Studies", group: "History & Social Science" },
  { name: "AP Comparative Government and Politics", group: "History & Social Science" },
  { name: "AP European History", group: "History & Social Science" },
  { name: "AP Human Geography", group: "History & Social Science" },
  { name: "AP Macroeconomics", group: "History & Social Science" },
  { name: "AP Microeconomics", group: "History & Social Science" },
  { name: "AP Psychology", group: "History & Social Science" },
  { name: "AP United States Government and Politics", group: "History & Social Science" },
  { name: "AP United States History", group: "History & Social Science" },
  { name: "AP World History: Modern", group: "History & Social Science" },
  // Math & Computer Science
  { name: "AP Calculus AB", group: "Math & CS" },
  { name: "AP Calculus BC", group: "Math & CS" },
  { name: "AP Computer Science A", group: "Math & CS" },
  { name: "AP Computer Science Principles", group: "Math & CS" },
  { name: "AP Precalculus", group: "Math & CS" },
  { name: "AP Statistics", group: "Math & CS" },
  // Sciences
  { name: "AP Biology", group: "Sciences" },
  { name: "AP Chemistry", group: "Sciences" },
  { name: "AP Environmental Science", group: "Sciences" },
  { name: "AP Physics 1: Algebra-Based", group: "Sciences" },
  { name: "AP Physics 2: Algebra-Based", group: "Sciences" },
  { name: "AP Physics C: Electricity and Magnetism", group: "Sciences" },
  { name: "AP Physics C: Mechanics", group: "Sciences" },
  // World Languages
  { name: "AP Chinese Language and Culture", group: "World Languages" },
  { name: "AP French Language and Culture", group: "World Languages" },
  { name: "AP German Language and Culture", group: "World Languages" },
  { name: "AP Italian Language and Culture", group: "World Languages" },
  { name: "AP Japanese Language and Culture", group: "World Languages" },
  { name: "AP Latin", group: "World Languages" },
  { name: "AP Spanish Language and Culture", group: "World Languages" },
  { name: "AP Spanish Literature and Culture", group: "World Languages" },
  // Capstone
  { name: "AP Research", group: "Capstone" },
  { name: "AP Seminar", group: "Capstone" },
];

const GROUPS = [
  "Arts",
  "English",
  "History & Social Science",
  "Math & CS",
  "Sciences",
  "World Languages",
  "Capstone",
];

interface ApCourseSelectorProps {
  /** Comma-separated string for compatibility with existing `apIbCourses` field */
  value: string;
  onChange: (value: string) => void;
}

const parse = (v: string): string[] =>
  String(v ?? "")
    .split(/\s*,\s*/)
    .map(s => s.trim())
    .filter(Boolean);

const serialize = (arr: string[]): string => arr.join(", ");

export const ApCourseSelector = ({ value, onChange }: ApCourseSelectorProps) => {
  const [query, setQuery] = useState("");
  const selected = useMemo(() => new Set(parse(value)), [value]);

  const toggle = (course: string) => {
    const next = new Set(selected);
    if (next.has(course)) next.delete(course);
    else next.add(course);
    onChange(serialize(Array.from(next)));
  };

  const clear = () => onChange("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return AP_COURSES.filter(c => !q || c.name.toLowerCase().includes(q));
  }, [query]);

  const byGroup = useMemo(() => {
    const map: Record<string, typeof AP_COURSES> = {};
    for (const c of filtered) (map[c.group] ||= []).push(c);
    return map;
  }, [filtered]);

  const selectedList = Array.from(selected);

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-foreground font-medium">
        <BookOpen className="w-4 h-4 text-primary" />
        AP Courses Taken or In Progress
        <span className="ml-auto text-xs text-muted-foreground font-normal">
          {selectedList.length} selected
        </span>
      </Label>

      {selectedList.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
          {selectedList.map(c => (
            <Badge
              key={c}
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/20 pr-1"
            >
              {c}
              <button
                type="button"
                onClick={() => toggle(c)}
                aria-label={`Remove ${c}`}
                className="ml-1 p-0.5 hover:bg-primary/20 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <button
            type="button"
            onClick={clear}
            className="text-xs text-muted-foreground hover:text-foreground underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search AP courses…"
          className="pl-9"
          aria-label="Search AP courses"
        />
      </div>

      <div className="max-h-72 overflow-y-auto rounded-lg border border-border/50 divide-y divide-border/40">
        {GROUPS.map(group => {
          const items = byGroup[group];
          if (!items?.length) return null;
          return (
            <div key={group} className="p-3 space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {group}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {items.map(c => {
                  const isOn = selected.has(c.name);
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => toggle(c.name)}
                      aria-pressed={isOn}
                      className={`text-left text-sm px-3 py-2 rounded-md transition-all ${
                        isOn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/40 hover:bg-muted"
                      }`}
                    >
                      {c.name.replace(/^AP\s+/, "")}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No AP courses match “{query}”.
          </div>
        )}
      </div>
    </div>
  );
};
