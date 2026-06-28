import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, Activity, Copy, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { selectCandidates } from "@/lib/matchEngine";
import { buildCandidatePool } from "@/lib/universityData";

type CheckStatus = "pending" | "running" | "ok" | "fail";

interface CheckResult {
  id: string;
  label: string;
  status: CheckStatus;
  message?: string;
  durationMs?: number;
}

const ROUTE_PROBES: Array<{ id: string; label: string; loader: () => Promise<unknown> }> = [
  { id: "route_dashboard", label: "Route — Dashboard", loader: () => import("@/pages/Dashboard") },
  { id: "route_profile", label: "Route — Profile", loader: () => import("@/pages/ProfilePage") },
  { id: "route_results", label: "Route — Profile Score", loader: () => import("@/pages/ResultsPage") },
  { id: "route_matches", label: "Route — University Matches", loader: () => import("@/pages/UniversityMatchPage") },
  { id: "route_checker", label: "Route — University Checker", loader: () => import("@/pages/CheckerPage") },
  { id: "route_settings", label: "Route — Settings", loader: () => import("@/pages/SettingsPage") },
];

interface Props {
  /** Optional custom trigger; falls back to a default Button. */
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "ghost" | "secondary";
  triggerSize?: "default" | "sm" | "lg" | "icon";
  triggerClassName?: string;
}

export const AppHealthCheck = ({
  triggerLabel = "Check my full app",
  triggerVariant = "outline",
  triggerSize = "sm",
  triggerClassName = "gap-2 rounded-xl",
}: Props) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<CheckResult[]>([]);

  const update = (id: string, patch: Partial<CheckResult>) =>
    setResults((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const runCheck = async (id: string, fn: () => Promise<{ ok: boolean; message?: string }>) => {
    update(id, { status: "running" });
    const t0 = performance.now();
    try {
      const res = await fn();
      const ms = Math.round(performance.now() - t0);
      update(id, { status: res.ok ? "ok" : "fail", message: res.message, durationMs: ms });
    } catch (err) {
      const ms = Math.round(performance.now() - t0);
      update(id, {
        status: "fail",
        message: err instanceof Error ? err.message : String(err),
        durationMs: ms,
      });
    }
  };

  const runAll = async () => {
    if (!user) {
      toast({ title: "Not signed in", description: "Sign in to run the full app diagnostic." });
      return;
    }
    setRunning(true);

    const initial: CheckResult[] = [
      { id: "auth", label: "Auth session", status: "pending" },
      { id: "profile_read", label: "Profile read", status: "pending" },
      { id: "match_engine", label: "University match engine", status: "pending" },
      { id: "factor_scores", label: "Factor scores readable", status: "pending" },
      { id: "notifications_rt", label: "Notifications read/write/delete", status: "pending" },
      { id: "storage", label: "Storage bucket reachable", status: "pending" },
      { id: "edge_chatbot", label: "Edge — chatbot-counselor", status: "pending" },
      { id: "edge_uni", label: "Edge — university-counselor", status: "pending" },
      { id: "edge_doc", label: "Edge — analyze-document", status: "pending" },
      ...ROUTE_PROBES.map((r) => ({ id: r.id, label: r.label, status: "pending" as CheckStatus })),
    ];
    setResults(initial);

    // 1. Auth
    await runCheck("auth", async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) return { ok: false, message: error.message };
      return data.session ? { ok: true, message: "Active session" } : { ok: false, message: "No session" };
    });

    // 2. Profile read
    await runCheck("profile_read", async () => {
      const { error } = await supabase.from("profiles").select("user_id").eq("user_id", user.id).maybeSingle();
      if (error) return { ok: false, message: error.message };
      return { ok: true, message: profile?.name ? "Profile present" : "Profile row reachable" };
    });

    // 3. Match engine
    await runCheck("match_engine", async () => {
      try {
        const pool = buildCandidatePool(profile?.preferredCountries);
        const sel = selectCandidates(profile || {}, pool);
        return sel.included.length > 0
          ? { ok: true, message: `${sel.included.length} matches · top: ${sel.topPick?.universityName ?? "n/a"}` }
          : { ok: false, message: "Engine returned 0 matches — complete profile" };
      } catch (e) {
        return { ok: false, message: e instanceof Error ? e.message : "engine error" };
      }
    });

    // 4. Factor scores
    await runCheck("factor_scores", async () => {
      const { error } = await supabase.from("factor_scores").select("id").eq("user_id", user.id).limit(1);
      return error ? { ok: false, message: error.message } : { ok: true };
    });

    // 5. Notifications round-trip
    await runCheck("notifications_rt", async () => {
      const { data: ins, error: insErr } = await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          title: "__healthcheck",
          message: "diagnostic",
          type: "info",
          dedupe_key: "__healthcheck",
        })
        .select("id")
        .maybeSingle();
      if (insErr || !ins?.id) return { ok: false, message: insErr?.message ?? "insert failed" };
      const { error: readErr } = await supabase.from("notifications").select("id").eq("id", ins.id).maybeSingle();
      if (readErr) return { ok: false, message: readErr.message };
      const { error: delErr } = await supabase.from("notifications").delete().eq("id", ins.id);
      if (delErr) return { ok: false, message: delErr.message };
      return { ok: true, message: "insert → read → delete" };
    });

    // 6. Storage
    await runCheck("storage", async () => {
      const { error } = await supabase.storage.from("user-documents").list(user.id, { limit: 1 });
      return error ? { ok: false, message: error.message } : { ok: true, message: "user-documents reachable" };
    });

    // 7-9. Edge functions ping
    const pingEdge = (name: string) => async () => {
      const { data, error } = await supabase.functions.invoke(name, { body: { ping: true } });
      if (error) return { ok: false, message: error.message };
      return data?.ok ? { ok: true, message: "ping ok" } : { ok: false, message: "no ok flag" };
    };
    await runCheck("edge_chatbot", pingEdge("chatbot-counselor"));
    await runCheck("edge_uni", pingEdge("university-counselor"));
    await runCheck("edge_doc", pingEdge("analyze-document"));

    // 10. Route lazy-import probes (parallel since they're independent)
    await Promise.all(
      ROUTE_PROBES.map((r) =>
        runCheck(r.id, async () => {
          await r.loader();
          return { ok: true, message: "module loaded" };
        }),
      ),
    );

    setRunning(false);
  };

  const summary = (() => {
    if (!results.length) return null;
    const passed = results.filter((r) => r.status === "ok").length;
    const failed = results.filter((r) => r.status === "fail").length;
    const total = results.length;
    return { passed, failed, total, allDone: passed + failed === total };
  })();

  const copyReport = async () => {
    const lines = results.map(
      (r) => `${r.status.toUpperCase().padEnd(7)} ${r.label}${r.durationMs != null ? ` (${r.durationMs}ms)` : ""}${r.message ? ` — ${r.message}` : ""}`,
    );
    const text = `UniVista App Health Check\n${new Date().toISOString()}\n\n${lines.join("\n")}`;
    await navigator.clipboard.writeText(text);
    toast({ title: "Report copied" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize} className={triggerClassName}>
          <Activity className="w-4 h-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            App Health Check
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={runAll} disabled={running} className="gap-2 rounded-xl">
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              {running ? "Running…" : results.length ? "Run again" : "Run all checks"}
            </Button>
            {results.length > 0 && (
              <Button variant="outline" onClick={copyReport} className="gap-2 rounded-xl">
                <Copy className="w-4 h-4" /> Copy report
              </Button>
            )}
            {summary?.allDone && (
              <Badge
                variant="outline"
                className={
                  summary.failed === 0
                    ? "bg-success/10 text-success border-success/30"
                    : "bg-destructive/10 text-destructive border-destructive/30"
                }
              >
                {summary.failed === 0
                  ? `All systems go · ${summary.passed}/${summary.total}`
                  : `${summary.failed} of ${summary.total} failed`}
              </Badge>
            )}
          </div>

          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Click "Run all checks" to verify every page, API and upload flow.
            </p>
          ) : (
            <div className="rounded-xl border border-border/40 divide-y divide-border/30">
              {results.map((r) => (
                <div key={r.id} className="flex items-start gap-3 px-3 py-2.5 text-sm">
                  <div className="mt-0.5 shrink-0">
                    {r.status === "running" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                    {r.status === "pending" && <div className="w-4 h-4 rounded-full border-2 border-muted" />}
                    {r.status === "ok" && <CheckCircle2 className="w-4 h-4 text-success" />}
                    {r.status === "fail" && <XCircle className="w-4 h-4 text-destructive" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{r.label}</p>
                    {r.message && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{r.message}</p>
                    )}
                  </div>
                  {r.durationMs != null && (
                    <span className="text-[10px] text-muted-foreground/70 mt-1 tabular-nums shrink-0">
                      {r.durationMs}ms
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
