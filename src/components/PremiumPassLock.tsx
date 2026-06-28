import { ReactNode, useEffect, useState } from "react";
import {
  ExternalLink, Lock, Sparkles, CheckCircle2, Loader2, ShieldCheck,
  Copy, CreditCard, Globe, Zap, Crown, BadgeCheck, PartyPopper, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { usePremiumPass, PASS_PRICE_CAD } from "@/hooks/usePremiumPass";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePolarCheckout } from "@/hooks/usePolarCheckout";

interface Props {
  featureName: string;
  description?: string;
  children: ReactNode;
}

export function PremiumPassLock({ featureName, description, children }: Props) {
  const { user } = useAuth();
  const { hasPass, loading, latestReview, submitPaymentReview, refresh } = usePremiumPass();
  const checkout = usePolarCheckout();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Prefill account email
  useEffect(() => {
    if (open && user?.email && !payerEmail) setPayerEmail(user.email);
  }, [open, user?.email, payerEmail]);

  // Poll for auto-activation while dialog open and not yet on success
  useEffect(() => {
    if (!open || step === 3) return;
    const interval = setInterval(() => { void refresh(); }, 4000);
    return () => clearInterval(interval);
  }, [open, step, refresh]);

  // Move to success when pass activates while dialog is open
  useEffect(() => {
    if (hasPass && open && step !== 3) {
      setStep(3);
      toast({ title: "Premium Pass activated 🎉", description: "All premium features are now unlocked." });
    }
  }, [hasPass, open, step, toast]);

  if (loading) return <>{children}</>;
  if (hasPass && !open) return <>{children}</>;

  const copyEmail = async () => {
    if (!user?.email) return;
    await navigator.clipboard.writeText(user.email);
    toast({ title: "Email copied", description: "Paste it on the Polar checkout page." });
  };

  const openCheckout = async () => {
    const opened = await checkout.openCheckout();
    if (opened) {
      setStep(2);
    }
  };

  const handleSubmitReview = async () => {
    setSubmitting(true);
    try {
      const { error } = await submitPaymentReview(paymentReference, payerEmail);
      if (error) throw error;
      toast({ title: "Receipt submitted", description: "We'll verify and unlock within minutes." });
      setPaymentReference("");
    } catch (e: any) {
      toast({ title: "Could not submit", description: e.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const reviewBadge = latestReview && (
    <div className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${
      latestReview.status === "approved" ? "border-success/30 bg-success/5" :
      latestReview.status === "rejected" ? "border-destructive/30 bg-destructive/5" :
      "border-primary/20 bg-primary/5"
    }`}>
      <ShieldCheck className={`w-4 h-4 mt-0.5 shrink-0 ${
        latestReview.status === "approved" ? "text-success" :
        latestReview.status === "rejected" ? "text-destructive" : "text-primary"
      }`} />
      <div>
        <div className="font-medium capitalize">Receipt {latestReview.status}</div>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {latestReview.status === "pending"
            ? "Verifying your payment — this is usually instant."
            : latestReview.admin_notes || "If this is wrong, resubmit with your correct Polar receipt."}
        </p>
      </div>
    </div>
  );

  const openPaywall = () => setOpen(true);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={openPaywall}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPaywall(); } }}
        aria-label={`${featureName} is locked. Press Enter to open the Premium Pass checkout for $${PASS_PRICE_CAD} CAD.`}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="group relative rounded-3xl overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {/* Teaser content — fully readable at top, fades out toward bottom */}
        <div
          aria-hidden
          className="pointer-events-none select-none max-h-[340px] overflow-hidden"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, hsl(0 0% 0% / 1) 0%, hsl(0 0% 0% / 1) 35%, hsl(0 0% 0% / 0.45) 65%, hsl(0 0% 0% / 0) 100%)",
            maskImage:
              "linear-gradient(to bottom, hsl(0 0% 0% / 1) 0%, hsl(0 0% 0% / 1) 35%, hsl(0 0% 0% / 0.45) 65%, hsl(0 0% 0% / 0) 100%)",
          }}
        >
          {children}
        </div>

        {/* Floating unlock bar pinned to bottom of teaser */}
        <div className="absolute inset-x-0 bottom-0 px-3 sm:px-4 pb-3 sm:pb-4 pt-12 bg-gradient-to-t from-background via-background/85 to-transparent">
          <div className="relative mx-auto max-w-xl">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/40 via-accent/30 to-primary/40 opacity-60 blur-md group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-3 rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl p-3 sm:p-4 shadow-elevated transition-transform group-hover:-translate-y-0.5">
              <div className="relative w-10 h-10 shrink-0">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent shadow-md" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] uppercase text-accent">
                  <Sparkles className="w-3 h-3" /> Premium Pass
                </div>
                <p className="text-sm font-display font-semibold leading-tight truncate">{featureName}</p>
                <p className="hidden sm:block text-xs text-muted-foreground truncate">
                  {description ?? `One-time $${PASS_PRICE_CAD} — unlocks every Premium tool, forever`}
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-xl px-3 sm:px-4 py-2 bg-foreground text-background font-semibold text-xs sm:text-sm shadow-md group-hover:shadow-xl transition-shadow shrink-0">
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Unlock · </span>${PASS_PRICE_CAD}
              </div>
            </div>
            <div className="hidden sm:flex items-center justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><BadgeCheck className="w-3 h-3 text-success" /> One-time</span>
              <span className="inline-flex items-center gap-1"><Zap className="w-3 h-3 text-accent" /> Instant</span>
              <span className="inline-flex items-center gap-1"><Globe className="w-3 h-3 text-primary" /> Worldwide</span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          {/* Hero header */}
          <div className="bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground p-6">
            <DialogHeader className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-primary-foreground text-lg">AdmitIQ Premium Pass</DialogTitle>
                  <DialogDescription className="text-primary-foreground/80 text-xs">
                    One-time ${PASS_PRICE_CAD} CAD · lifetime access
                  </DialogDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["Cards", "PayPal", "Apple Pay", "Google Pay"].map((m) => (
                  <span key={m} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/15 backdrop-blur">
                    {m}
                  </span>
                ))}
              </div>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-5" aria-live="polite">
            {step !== 3 && (
              <>
                {/* Plan confirmation card */}
                <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 to-muted/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-accent">One pass · everything unlocked</div>
                      <p className="font-display font-semibold text-base leading-tight mt-0.5">AdmitIQ Premium Pass</p>
                      <p className="text-xs text-muted-foreground mt-0.5">One-time ${PASS_PRICE_CAD} · NOT a subscription · pay once, keep forever</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display font-bold text-2xl leading-none">${PASS_PRICE_CAD}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">CAD · one-time</div>
                    </div>
                  </div>
                  <ul className="grid grid-cols-1 gap-1.5 text-sm mt-4 pt-4 border-t border-border/50">
                    {[
                      "University Checker — full admissions reports",
                      "Scholarships Database — full-ride & matched awards",
                      "Accepted Essay Library — Ivy & top-tier admit essays",
                      "Ivy Activities Database — real admit profiles",
                      "Live AI Interview — voice-based mock interviews",
                      "Every future Premium tool — included free",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {reviewBadge}

                {/* Step indicator */}
                <div className="flex items-center gap-2 text-xs">
                  <StepDot active={step === 1} done={step > 1} n={1} label="Pay" />
                  <div className="flex-1 h-px bg-border" />
                  <StepDot active={step === 2} done={false} n={2} label="Verify" />
                  <div className="flex-1 h-px bg-border" />
                  <StepDot active={false} done={false} n={3} label="Unlocked" />
                </div>
              </>
            )}

            {/* Step 1 — Pay */}
            {step === 1 && (
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">Use this email at checkout for instant unlock</div>
                      <div className="font-medium truncate">{user?.email ?? "—"}</div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={copyEmail} disabled={!user?.email} className="gap-1.5 shrink-0">
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={openCheckout}
                  disabled={checkout.loading}
                  className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow"
                >
                  {checkout.loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Opening secure checkout…</>
                  ) : (
                    <><CreditCard className="w-5 h-5" /> Pay ${PASS_PRICE_CAD} securely <ExternalLink className="w-4 h-4 opacity-70" /></>
                  )}
                </Button>

                <button
                  onClick={() => setStep(2)}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Already paid? Enter your receipt →
                </button>
              </div>
            )}

            {/* Step 2 — Verify */}
            {step === 2 && (
              <div className="space-y-3">
                <div className="rounded-xl border border-success/30 bg-success/5 p-3 text-sm flex items-start gap-2">
                  <Loader2 className="w-4 h-4 text-success animate-spin mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium">Waiting for Polar confirmation</div>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      If you paid with your account email, your pass unlocks automatically. Otherwise paste your receipt below.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="payer-email">Payment email</Label>
                  <Input id="payer-email" type="email" value={payerEmail}
                    onChange={(e) => setPayerEmail(e.target.value)} placeholder="email used on Polar" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="payment-reference">Polar receipt / order ID</Label>
                  <Input id="payment-reference" value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="e.g. ABC123-XYZ from your Polar email" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="gap-1.5">
                    ← Back
                  </Button>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitting || paymentReference.trim().length < 4}
                    className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Submit receipt
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3 — Success */}
            {step === 3 && (
              <div className="space-y-5 text-center" role="status">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-success/30 to-accent/30 blur-xl" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-success to-accent flex items-center justify-center shadow-elevated">
                    <PartyPopper className="w-10 h-10 text-success-foreground" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-2xl font-display font-bold tracking-tight">You're in. Welcome to Premium.</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Your AdmitIQ Premium Pass is active for life. Here's where to go next:
                  </p>
                </div>

                <ul className="text-left space-y-2.5 rounded-2xl border border-border/60 bg-muted/20 p-4">
                  {[
                    { t: "Read accepted Ivy essays", d: "Hooks, structure, and what made each one work." },
                    { t: "Explore real admit profiles", d: "Compare your activities side-by-side." },
                    { t: "Run a Live AI Interview", d: "Voice-based mock interview with instant feedback." },
                  ].map((s, i) => (
                    <li key={s.t} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <div className="min-w-0">
                        <div className="font-medium text-sm leading-tight">{s.t}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{s.d}</div>
                      </div>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => setOpen(false)}
                  className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 gap-2 text-base font-semibold"
                >
                  Start using Premium <ArrowRight className="w-4 h-4" />
                </Button>
                <p className="text-[11px] text-muted-foreground">A receipt was sent to {user?.email ?? "your email"}. You can re-open this anytime.</p>
              </div>
            )}

            {/* Trust footer */}
            {step !== 3 && (
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-success" /> Secure checkout</span>
                  <span className="inline-flex items-center gap-1"><BadgeCheck className="w-3 h-3 text-success" /> 7-day refund</span>
                  <span className="inline-flex items-center gap-1"><Globe className="w-3 h-3 text-primary" /> Pay in any currency</span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StepDot({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
        done ? "bg-success text-success-foreground" :
        active ? "bg-primary text-primary-foreground" :
        "bg-muted text-muted-foreground"
      }`}>
        {done ? <CheckCircle2 className="w-3 h-3" /> : n}
      </div>
      <span className={`${active ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
    </div>
  );
}
