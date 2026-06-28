import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentDossier } from "@/components/admin/StudentDossier";
import { Shield, Search, Download, Eye, Lock, RefreshCw, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface UserRow {
  user_id: string;
  name: string | null;
  email: string | null;
  country: string | null;
  intended_major: string | null;
  gpa: string | null;
  updated_at: string | null;
  created_at: string | null;
  latestScore: number | null;
  latestScoreUni: string | null;
  applicationCount: number;
}

interface UserDetail {
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
}

interface ListMeta {
  totalAuth: number;
  totalProfiles: number;
  missingProfiles: number;
}

interface PaymentReviewRow {
  id: string;
  user_id: string;
  payment_reference: string;
  payer_email: string | null;
  amount_cad: number;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const AdminPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [paymentReviews, setPaymentReviews] = useState<PaymentReviewRow[]>([]);

  const loadUsers = async (q = "") => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase.functions.invoke("admin-list-users", {
        body: { search: q, limit: 100 },
      });
      if (error) throw error;
      setUsers(data?.users ?? []);
      setMeta(data?.meta ?? null);
    } catch (err: any) {
      const message = err?.message ?? "Network error — try again.";
      setErrorMsg(message);
      toast({
        title: "Failed to load users",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentReviews = async () => {
    const { data, error } = await supabase
      .from("payment_review_requests")
      .select("id,user_id,payment_reference,payer_email,amount_cad,status,admin_notes,created_at")
      .order("created_at", { ascending: false })
      .limit(25);
    if (error) return;
    setPaymentReviews((data as PaymentReviewRow[]) ?? []);
  };

  useEffect(() => {
    loadUsers();
    loadPaymentReviews();
  }, []);

  const updatePaymentReview = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("payment_review_requests")
      .update({ status, admin_notes: status === "approved" ? "Payment verified." : "Payment could not be verified." })
      .eq("id", id);
    if (error) {
      toast({ title: "Review update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: status === "approved" ? "Premium Pass activated" : "Payment review rejected" });
    await loadPaymentReviews();
  };

  const openDetail = async (u: UserRow) => {
    setSelected(u);
    setDetail(null);
    setDetailLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-list-users", {
        body: { targetUserId: u.user_id },
      });
      if (error) throw error;
      setDetail(data?.detail ?? null);
    } catch (err: any) {
      toast({
        title: "Could not load user detail",
        description: err?.message ?? "Try again.",
        variant: "destructive",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const exportCsv = () => {
    const header = [
      "name",
      "email",
      "country",
      "intended_major",
      "gpa",
      "latest_score",
      "applications",
      "last_active",
    ];
    const rows = users.map((u) => [
      u.name ?? "",
      u.email ?? "",
      u.country ?? "",
      u.intended_major ?? "",
      u.gpa ?? "",
      u.latestScore ?? "",
      u.applicationCount,
      u.updated_at ?? "",
    ]);
    const csv = [header, ...rows]
      .map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `univista-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredCount = useMemo(() => users.length, [users]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Review banner */}
      <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/5 p-3 text-sm">
        <Lock className="h-4 w-4 text-warning" />
        <span className="text-foreground/80">
          Admin access is protected. Approving verified payment reviews activates Premium Pass access.
        </span>
      </div>

      <Card className="border-border/50 shadow-card">
        <CardHeader className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-display font-bold">Payment Reviews</h2>
              <p className="text-sm text-muted-foreground">Verify payment references before unlocking Premium Pass.</p>
            </div>
            <Button variant="outline" size="sm" onClick={loadPaymentReviews}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {paymentReviews.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No payment reviews yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/50">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Reference</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Amount</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentReviews.map((review) => (
                    <tr key={review.id} className="border-t border-border/40">
                      <td className="px-3 py-2 font-medium">{review.payment_reference}</td>
                      <td className="px-3 py-2 text-muted-foreground">{review.payer_email || "—"}</td>
                      <td className="px-3 py-2">${review.amount_cad} CAD</td>
                      <td className="px-3 py-2"><Badge variant="outline">{review.status}</Badge></td>
                      <td className="px-3 py-2 text-right">
                        {review.status === "pending" ? (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={() => updatePaymentReview(review.id, "approved")} className="gap-1">
                              <CheckCircle2 className="h-4 w-4" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => updatePaymentReview(review.id, "rejected")} className="gap-1">
                              <XCircle className="h-4 w-4" /> Reject
                            </Button>
                          </div>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-card">
        <CardHeader className="bg-gradient-primary p-6 text-primary-foreground">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur-sm">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Admin Console</h1>
              <p className="text-primary-foreground/80 text-sm">
                Owner-only view of every student's profile, CV, matches, and progress
              </p>
            </div>
            <a
              href="/dashboard/admin/ai-diagnostics"
              className="ml-auto inline-flex items-center gap-2 rounded-lg bg-primary-foreground/15 px-3 py-2 text-sm font-medium hover:bg-primary-foreground/25 transition"
            >
              AI Diagnostics →
            </a>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") loadUsers(search);
                }}
                placeholder="Search by name, email, country, major…"
                className="pl-9"
              />
            </div>
            <Button onClick={() => loadUsers(search)} variant="default">
              Search
            </Button>
            <Button onClick={() => loadUsers(search)} variant="outline" aria-label="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={exportCsv} variant="outline" disabled={!users.length}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{loading ? "Loading…" : `${filteredCount} users`}</span>
            {meta && (
              <>
                <span className="text-border">•</span>
                <span>{meta.totalAuth} signed up</span>
                <span className="text-border">•</span>
                <span>{meta.totalProfiles} with profile</span>
                {meta.missingProfiles > 0 && (
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                    {meta.missingProfiles} without profile
                  </Badge>
                )}
              </>
            )}
          </div>

          {errorMsg && !loading && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Couldn't load users</p>
                <p className="text-xs text-muted-foreground mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {errorMsg ? "No users to display — see error above." : "No users yet."}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/50">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Country</th>
                    <th className="px-3 py-2 text-left">Major</th>
                    <th className="px-3 py-2 text-left">GPA</th>
                    <th className="px-3 py-2 text-left">Score</th>
                    <th className="px-3 py-2 text-left">Apps</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.user_id}
                      className="border-t border-border/40 hover:bg-muted/20"
                    >
                      <td className="px-3 py-2 font-medium">
                        {u.name || "—"}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {u.email || "—"}
                      </td>
                      <td className="px-3 py-2">{u.country || "—"}</td>
                      <td className="px-3 py-2">{u.intended_major || "—"}</td>
                      <td className="px-3 py-2">{u.gpa || "—"}</td>
                      <td className="px-3 py-2">
                        {u.latestScore != null ? (
                          <Badge variant="secondary">{u.latestScore}</Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-2">{u.applicationCount}</td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDetail(u)}
                        >
                          <Eye className="mr-1 h-4 w-4" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selected && (
        <Card className="border-border/50 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between p-6">
            <div>
              <h2 className="text-lg font-semibold">{selected.name || selected.email}</h2>
              <p className="text-sm text-muted-foreground">{selected.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setSelected(null); setDetail(null); }}>
              Close
            </Button>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {detailLoading || !detail ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <StudentDossier detail={detail} />
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default AdminPage;
