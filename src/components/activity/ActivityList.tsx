// Saved activities list with chip cards. Used inside ProfileForm.
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Pencil, Award, ChevronUp, ChevronDown } from "lucide-react";
import { ActivityBuilder, type BuilderActivity } from "../ActivityBuilder";

interface Props {
  value: string; // JSON-stringified array (stored in extracurriculars column)
  onChange: (v: string) => void;
}

const safeParse = (raw: string): BuilderActivity[] => {
  if (!raw) return [];
  try {
    const j = JSON.parse(raw);
    if (Array.isArray(j)) return j as BuilderActivity[];
  } catch {
    // legacy free-text — leave alone
  }
  return [];
};

export const ActivityList = ({ value, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BuilderActivity | undefined>();
  const items = safeParse(value);
  const isLegacyText = value && items.length === 0 && value.length > 5;

  const save = (a: BuilderActivity) => {
    const next = editing ? items.map((x) => (x.id === a.id ? a : x)) : [...items, a];
    onChange(JSON.stringify(next));
    setEditing(undefined);
  };

  const remove = (id: string) => {
    onChange(JSON.stringify(items.filter((x) => x.id !== id)));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(JSON.stringify(next));
  };

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center">
          <Award className="w-10 h-10 text-primary mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">
            {isLegacyText ? "Upgrade your activities" : "No activities yet"}
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            {isLegacyText
              ? "We detected free-text activities. Add structured entries for stronger matching."
              : "Add your first activity — takes under 2 minutes and dramatically improves match accuracy."}
          </p>
          <Button type="button" onClick={() => { setEditing(undefined); setOpen(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Add Activity
          </Button>
          {isLegacyText && (
            <p className="text-[11px] text-muted-foreground mt-3 italic line-clamp-2">
              Existing text: "{value.slice(0, 140)}{value.length > 140 ? "…" : ""}"
            </p>
          )}
        </div>
      )}


      {items.length > 0 && (
        <div className="grid gap-2">
          {items.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="p-3 hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm text-foreground truncate">{a.title || a.subtype}</span>
                      <Badge variant="secondary" className="text-[10px]">{a.category}</Badge>
                      <Badge variant="outline" className="text-[10px]">{a.scope}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {a.roles.slice(0, 3).map((r) => (
                        <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{r}</span>
                      ))}
                      {a.achievements.slice(0, 3).map((x) => (
                        <span key={x} className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">🏆 {x}</span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {a.hours_per_week}h/wk · {a.weeks_per_year}wk/yr · {a.years}yr
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button type="button" size="icon" variant="ghost" className="h-6 w-6" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                      <ChevronUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" className="h-6 w-6" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setEditing(a); setOpen(true); }} aria-label="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => remove(a.id)} aria-label="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          <Button type="button" variant="outline" onClick={() => { setEditing(undefined); setOpen(true); }} className="gap-2 w-full">
            <Plus className="w-4 h-4" /> Add Another Activity
          </Button>
        </div>
      )}

      <ActivityBuilder
        open={open}
        onClose={() => { setOpen(false); setEditing(undefined); }}
        onSave={save}
        initial={editing}
      />
    </div>
  );
};
