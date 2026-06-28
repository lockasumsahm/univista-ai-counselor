import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription, type Tier } from "@/hooks/useSubscription";

interface PremiumGateProps {
  required: "pro" | "premium";
  featureName: string;
  children: ReactNode;
}

export function PremiumGate({ required, featureName, children }: PremiumGateProps) {
  const { hasPro, hasPremium, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading) return <>{children}</>;

  const allowed = required === "premium" ? hasPremium : hasPro;
  if (allowed) return <>{children}</>;

  const Icon = required === "premium" ? Crown : Sparkles;
  return (
    <div className="relative">
      <div className="pointer-events-none blur-sm opacity-40 select-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-8 max-w-md text-center shadow-xl">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Icon className="w-7 h-7 text-primary" />
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
            <Lock className="w-3 h-3" /> {required === "premium" ? "Premium" : "Pro"} feature
          </div>
          <h3 className="text-xl font-display font-bold mb-2">{featureName}</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Upgrade to {required === "premium" ? "Premium" : "Pro"} to unlock this and all advanced AI counseling tools.
          </p>
          <Button onClick={() => navigate("/#pricing")} className="w-full bg-gradient-primary hover:shadow-glow">
            View plans
          </Button>
        </div>
      </div>
    </div>
  );
}

export function useTierAccess() {
  const sub = useSubscription();
  const has = (t: Tier) => t === "free" || (t === "pro" && sub.hasPro) || (t === "premium" && sub.hasPremium);
  return { ...sub, has };
}
