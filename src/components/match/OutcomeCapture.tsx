import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { tierFromUni, regionFromCountry, normalizeMajor } from "@/lib/calibration";
import type { AlignmentResult } from "@/lib/matchEngine";

interface Props {
  result: AlignmentResult;
}

const STATUSES = [
  { key: "applied", label: "Applied" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
  { key: "waitlisted", label: "Waitlisted" },
  { key: "deferred", label: "Deferred" },
] as const;

const TAGS = [
  { key: "essay_issue", label: "Essay issue" },
  { key: "academic_gap", label: "Academic gap" },
  { key: "ec_weakness", label: "EC weakness" },
  { key: "holistic_uncertainty", label: "Holistic uncertainty" },
  { key: "strong_fit", label: "Strong fit" },
];

export const OutcomeCapture = ({ result }: Props) => {
  const { user } = useAuth();
  const { profile } = useProfile() as any;
  const { toast } = useToast();
  const [status, setStatus] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("match_outcomes")
        .select("status, tags, notes")
        .eq("user_id", user.id)
        .eq("university_name", result.universityName)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setStatus(data.status);
        setTags(data.tags || []);
        setNotes(data.notes || "");
        setSaved(true);
      }
    })();
  }, [user, result.universityName]);

  const toggleTag = (k: string) =>
    setTags((cur) => (cur.includes(k) ? cur.filter((t) => t !== k) : [...cur, k]));

  const save = async () => {
    if (!user || !status) return;
    setLoading(true);
    // Denormalize calibration bucket fields at write-time so the nightly
    // recalibration job can aggregate cleanly without joining client data.
    const calBase = (result as any).calibration?.baseScore ?? result.score;
    const { error } = await supabase.from("match_outcomes").insert({
      user_id: user.id,
      university_name: result.universityName,
      alignment_score: result.score,
      alignment_category: result.category,
      status,
      tags,
      notes,
      uni_country: result.country,
      uni_tier: tierFromUni({ acceptanceRate: result.acceptanceRate }),
      uni_region: regionFromCountry(result.country),
      intended_major: normalizeMajor(profile?.intended_major || profile?.intendedMajor),
      predicted_score: calBase,
      predicted_category: result.category,
    } as any);
    setLoading(false);
    if (error) {
      toast({ title: "Couldn't save", description: error.message, variant: "destructive" });
      return;
    }
    setSaved(true);
    toast({ title: "Saved", description: "Thanks — this helps us improve future matches." });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-foreground mb-2">Did you apply? What happened?</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <Button
              key={s.key}
              size="sm"
              variant={status === s.key ? "default" : "outline"}
              onClick={() => setStatus(s.key)}
              className="rounded-full"
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground mb-2">Tags (optional)</p>
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map((t) => (
            <Badge
              key={t.key}
              variant={tags.includes(t.key) ? "default" : "outline"}
              onClick={() => toggleTag(t.key)}
              className="cursor-pointer"
            >
              {t.label}
            </Badge>
          ))}
        </div>
      </div>

      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Anything else worth remembering? (optional)"
        rows={2}
        className="rounded-xl"
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Used to refine future estimates. Only you can see this.
        </p>
        <div className="flex items-center gap-2">
          {saved && <CheckCircle2 className="w-4 h-4 text-success" />}
          <Button onClick={save} disabled={!status || loading} size="sm" className="rounded-xl">
            {loading ? "Saving…" : saved ? "Update" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};
