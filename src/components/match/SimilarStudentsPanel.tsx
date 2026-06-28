import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, ShieldCheck, ExternalLink } from "lucide-react";
import { EvidenceBadge } from "@/components/trust/EvidenceBadge";

interface Props {
  universityName: string;
  profile?: any;
}

interface Admit {
  id: string;
  university_name: string;
  intended_major: string | null;
  student_country: string | null;
  gpa_unweighted: number | null;
  sat_total: number | null;
  act_composite: number | null;
  spike: string | null;
  awards: string[] | null;
  leadership_summary: string | null;
  source: string | null;
  source_url: string | null;
  verified: boolean | null;
  first_generation: boolean | null;
}

export const SimilarStudentsPanel = ({ universityName, profile }: Props) => {
  const [rows, setRows] = useState<Admit[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const major = profile?.intendedMajor || profile?.intended_major;
      let q = supabase
        .from("verified_admits")
        .select(
          "id, university_name, intended_major, student_country, gpa_unweighted, sat_total, act_composite, spike, awards, leadership_summary, source, source_url, verified, first_generation"
        )
        .ilike("university_name", `%${universityName}%`)
        .eq("decision", "admit")
        .limit(5);
      if (major) q = q.ilike("intended_major", `%${major}%`);
      let { data, error } = await q;
      // Fallback: drop major filter if nothing
      if ((!data || data.length === 0) && major) {
        const r = await supabase
          .from("verified_admits")
          .select(
            "id, university_name, intended_major, student_country, gpa_unweighted, sat_total, act_composite, spike, awards, leadership_summary, source, source_url, verified, first_generation"
          )
          .ilike("university_name", `%${universityName}%`)
          .eq("decision", "admit")
          .limit(5);
        data = r.data;
        error = r.error;
      }
      if (!cancelled) {
        setRows(error ? [] : ((data as Admit[]) || []));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [universityName, profile?.intendedMajor, profile?.intended_major]);

  return (
    <div className="rounded-xl border border-border bg-card/40 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-semibold">Students like you who got in</h4>
        </div>
        <EvidenceBadge
          evidence={{
            level: rows && rows.length > 0 ? "verified" : "inferred",
            reason:
              rows && rows.length > 0
                ? `${rows.length} verified admit record${rows.length === 1 ? "" : "s"} matched`
                : "No verified admit records matched yet",
            sources: [{ label: "verified_admits dataset" }],
          }}
        />
      </div>

      {loading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 rounded-md bg-muted/40 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && rows && rows.length === 0 && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          No verified admit records yet for {universityName}
          {profile?.intendedMajor ? ` in ${profile.intendedMajor}` : ""}. As more verified outcomes are
          added, similar-student matches will appear here.
        </p>
      )}

      {!loading && rows && rows.length > 0 && (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li
              key={r.id}
              className="rounded-md border border-border/60 bg-background/60 px-3 py-2 text-xs leading-relaxed"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  {r.verified && <ShieldCheck className="w-3.5 h-3.5 text-success" />}
                  {r.intended_major || "Undeclared"}
                  {r.student_country && (
                    <span className="text-muted-foreground font-normal">· {r.student_country}</span>
                  )}
                  {r.first_generation && (
                    <span className="text-[10px] uppercase tracking-wide text-accent">First-gen</span>
                  )}
                </div>
                {r.source_url && (
                  <a
                    href={r.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {r.source || "source"} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
                {r.gpa_unweighted != null && <span>GPA {Number(r.gpa_unweighted).toFixed(2)}</span>}
                {r.sat_total != null && <span>SAT {r.sat_total}</span>}
                {r.act_composite != null && <span>ACT {r.act_composite}</span>}
                {r.spike && <span>Spike: {r.spike}</span>}
              </div>
              {(r.leadership_summary || (r.awards && r.awards.length > 0)) && (
                <div className="mt-1 text-muted-foreground">
                  {r.leadership_summary && <span>{r.leadership_summary}</span>}
                  {r.awards && r.awards.length > 0 && (
                    <span className="ml-1">· Awards: {r.awards.slice(0, 3).join(", ")}</span>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
