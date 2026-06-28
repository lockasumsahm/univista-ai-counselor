import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, History, RotateCcw, Trash2, FileText } from "lucide-react";

interface VersionRow {
  id: string;
  created_at: string;
  snapshot: any;
  resume_file_name: string | null;
  resume_text: string | null;
  label: string | null;
}

const ProfileHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveProfile } = useProfile();
  const { toast } = useToast();
  const [rows, setRows] = useState<VersionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("profile_versions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      toast({ title: "Failed to load history", description: error.message, variant: "destructive" });
    } else {
      setRows((data || []) as VersionRow[]);
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, [user?.id]);

  const restore = async (row: VersionRow) => {
    setBusyId(row.id);
    const snap = { ...row.snapshot, cv: null };
    const { error } = await saveProfile(snap, { label: `Restored from ${new Date(row.created_at).toLocaleString()}` });
    setBusyId(null);
    if (error) {
      toast({ title: "Restore failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile restored", description: "Re-running matches with this version." });
      navigate("/dashboard/matches");
    }
  };

  const remove = async (id: string) => {
    setBusyId(id);
    const { error } = await supabase.from("profile_versions").delete().eq("id", id);
    setBusyId(null);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else setRows((r) => r.filter((x) => x.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/profile")} className="gap-2 text-muted-foreground hover:text-foreground rounded-xl">
        <ChevronLeft className="w-4 h-4" /> Back to Profile
      </Button>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <History className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold">Profile History</h1>
          <p className="text-sm text-muted-foreground">
            Every profile save is timestamped. Restore any past version to re-run matches from that snapshot.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          No saved versions yet. Each time you save your profile, a snapshot is stored here.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row, idx) => {
            const s = row.snapshot || {};
            const ts = new Date(row.created_at);
            return (
              <li key={row.id} className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row gap-4 sm:items-center">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-semibold">
                      {idx === 0 ? "Latest" : `v${rows.length - idx}`} · {ts.toLocaleString()}
                    </span>
                    {row.label && (
                      <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {row.label}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1">
                    <span>GPA: {s.gpa || "—"}</span>
                    <span>Tests: {s.testScores || "—"}</span>
                    <span>Major: {s.intendedMajor || "—"}</span>
                    <span>Targets: {(s.preferredCountries || []).join(", ") || "—"}</span>
                  </div>
                  {row.resume_file_name && (
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {row.resume_file_name}
                      {row.resume_text && <span className="ml-1">· {row.resume_text.length} chars extracted</span>}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="default" className="gap-1 rounded-xl" onClick={() => restore(row)} disabled={busyId === row.id}>
                    <RotateCcw className="w-3.5 h-3.5" /> Restore & re-run
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-1 rounded-xl text-destructive hover:text-destructive" onClick={() => remove(row.id)} disabled={busyId === row.id}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ProfileHistoryPage;
