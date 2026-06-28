import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


interface Row {
  id: string;
  request_id: string;
  user_id: string | null;
  task: string;
  model: string;
  attempt_no: number;
  status: string;
  http_status: number | null;
  latency_ms: number | null;
  payload_valid: boolean | null;
  error: string | null;
  created_at: string;
}

const STATUS_VARIANTS: Record<string, string> = {
  ok: "bg-success/15 text-success border-success/30",
  fallback: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  empty: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  invalid_json: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  rate_limit: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  credits: "bg-destructive/15 text-destructive border-destructive/30",
  error: "bg-destructive/15 text-destructive border-destructive/30",
};

export default function AIDiagnosticsPage() {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskFilter, setTaskFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ai_diagnostics" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    setRows((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) void load(); }, [isAdmin]);

  const filtered = useMemo(
    () => rows.filter(
      (r) => (taskFilter === "all" || r.task === taskFilter) &&
             (statusFilter === "all" || r.status === statusFilter),
    ),
    [rows, taskFilter, statusFilter],
  );

  const tasks = useMemo(() => Array.from(new Set(rows.map((r) => r.task))).sort(), [rows]);
  const statuses = useMemo(() => Array.from(new Set(rows.map((r) => r.status))).sort(), [rows]);

  const summary = useMemo(() => {
    const total = rows.length || 1;
    const ok = rows.filter((r) => r.status === "ok").length;
    const fallback = rows.filter((r) => r.status === "fallback").length;
    const errors = rows.filter((r) => r.status === "error" || r.status === "credits" || r.status === "invalid_json" || r.status === "empty").length;
    const lat = rows.filter((r) => r.latency_ms).map((r) => r.latency_ms!) ;
    const avgLat = lat.length ? Math.round(lat.reduce((a, b) => a + b, 0) / lat.length) : 0;
    return {
      successRate: Math.round(((ok + fallback) / total) * 100),
      fallbackRate: Math.round((fallback / total) * 100),
      errorRate: Math.round((errors / total) * 100),
      avgLat,
    };
  }, [rows]);

  const exportCSV = () => {
    const cols: (keyof Row)[] = ["created_at","task","model","attempt_no","status","http_status","latency_ms","payload_valid","request_id","user_id","error"];
    const esc = (v: any) => {
      if (v === null || v === undefined) return "";
      const s = String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const csv = [cols.join(",")]
      .concat(filtered.map((r) => cols.map((c) => esc(r[c])).join(",")))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-diagnostics-${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  if (adminLoading) return <><Skeleton className="h-96" /></>;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">AI Diagnostics</h1>
            <p className="text-sm text-muted-foreground">Last 300 AI requests across all users.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={exportCSV} variant="outline" size="sm" disabled={loading || filtered.length === 0}>
              <Download className="w-4 h-4 mr-2" /> Export CSV ({filtered.length})
            </Button>
            <Button onClick={load} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </div>


        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryStat label="Success rate" value={`${summary.successRate}%`} />
          <SummaryStat label="Fallback rate" value={`${summary.fallbackRate}%`} />
          <SummaryStat label="Error rate" value={`${summary.errorRate}%`} />
          <SummaryStat label="Avg latency" value={`${summary.avgLat} ms`} />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterPills label="Task" options={["all", ...tasks]} value={taskFilter} onChange={setTaskFilter} />
          <FilterPills label="Status" options={["all", ...statuses]} value={statusFilter} onChange={setStatusFilter} />
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">Task</th>
                  <th className="text-left p-2">Model</th>
                  <th className="text-right p-2">Try</th>
                  <th className="text-right p-2">Latency</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Valid</th>
                  <th className="text-left p-2">Request ID</th>
                  <th className="text-left p-2">Error</th>
                </tr>
              </thead>
              <tbody>
                {loading && Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={9} className="p-3"><Skeleton className="h-5" /></td></tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={9} className="p-6 text-center text-muted-foreground">No diagnostics rows match these filters.</td></tr>
                )}
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border/40">
                    <td className="p-2 whitespace-nowrap">{new Date(r.created_at).toLocaleTimeString()}</td>
                    <td className="p-2 font-medium">{r.task}</td>
                    <td className="p-2 font-mono">{r.model}</td>
                    <td className="p-2 text-right">{r.attempt_no}</td>
                    <td className="p-2 text-right">{r.latency_ms ?? "—"}</td>
                    <td className="p-2">
                      <Badge variant="outline" className={STATUS_VARIANTS[r.status] || ""}>{r.status}</Badge>
                    </td>
                    <td className="p-2">{r.payload_valid === null ? "—" : r.payload_valid ? "✓" : "✗"}</td>
                    <td className="p-2 font-mono text-[10px] truncate max-w-[140px]" title={r.request_id}>{r.request_id}</td>
                    <td className="p-2 text-destructive truncate max-w-[260px]" title={r.error || ""}>{r.error || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </Card>
  );
}

function FilterPills({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground">{label}:</span>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`px-2.5 py-1 rounded-full text-xs border transition ${value === o ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
