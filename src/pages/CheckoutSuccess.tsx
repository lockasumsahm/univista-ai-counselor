import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const CheckoutSuccess = () => {
  const [params] = useSearchParams();
  const checkoutId = params.get("checkout_id") || params.get("order_id") || "";
  const [activating, setActivating] = useState(true);
  const [active, setActive] = useState(false);

  useEffect(() => {
    document.title = "Payment Successful — AdmitIQ";
    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) {
        if (!cancelled) setActivating(false);
        return;
      }
      while (!cancelled && attempts < 10) {
        const { data } = await supabase
          .from("premium_passes")
          .select("active")
          .eq("user_id", userId)
          .maybeSingle();
        if (data?.active) {
          if (!cancelled) {
            setActive(true);
            setActivating(false);
          }
          return;
        }
        attempts++;
        await new Promise((r) => setTimeout(r, 2000));
      }
      if (!cancelled) setActivating(false);
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="relative rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/10 p-8 sm:p-10 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl" aria-hidden />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-accent/20 blur-3xl" aria-hidden />

          <div className="relative flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-success/20 blur-2xl animate-pulse" aria-hidden />
              <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-success to-primary flex items-center justify-center shadow-lg">
                <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2.5} />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Premium Pass
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Payment successful
            </h1>
            <p className="text-muted-foreground max-w-sm mb-6">
              Thank you for your purchase. Your Premium Pass unlocks every advanced tool in AdmitIQ.
            </p>

            <div className="w-full rounded-xl border border-border/60 bg-muted/30 p-4 mb-6 text-left space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium flex items-center gap-1.5">
                  {activating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Activating…
                    </>
                  ) : active ? (
                    <span className="text-success flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Active
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Pending confirmation</span>
                  )}
                </span>
              </div>
              {checkoutId && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-mono text-xs truncate max-w-[60%]" title={checkoutId}>
                    {checkoutId}
                  </span>
                </div>
              )}
            </div>

            <Button asChild size="lg" className="w-full group">
              <Link to="/dashboard">
                Go to dashboard
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              A receipt has been sent to your email. Need help?{" "}
              <a href="mailto:support@inkspirehq.live" className="underline hover:text-foreground">
                Contact support
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CheckoutSuccess;
