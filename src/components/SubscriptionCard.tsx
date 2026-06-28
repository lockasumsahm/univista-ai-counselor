import { Crown, Sparkles, Zap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useSubscription, useCustomerPortal } from "@/hooks/useSubscription";

export function SubscriptionCard() {
  const { tier, isActive, status, cancelAtPeriodEnd, currentPeriodEnd, loading } = useSubscription();
  const portal = useCustomerPortal();
  const navigate = useNavigate();

  if (loading) return null;

  const Icon = tier === "premium" ? Crown : tier === "pro" ? Sparkles : Zap;
  const label = tier === "premium" ? "Premium" : tier === "pro" ? "Pro" : "Free";
  const periodEnd = currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString() : null;

  return (
    <Card className="p-5 bg-card/80 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tier === "free" ? "bg-muted" : "bg-primary/10"}`}>
            <Icon className={`w-5 h-5 ${tier === "free" ? "text-muted-foreground" : "text-primary"}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current plan</p>
            <p className="font-display font-bold text-lg">{label}</p>
            {isActive && periodEnd && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {cancelAtPeriodEnd ? `Cancels on ${periodEnd}` : `Renews ${periodEnd}`}
                {status && status !== "active" && ` • ${status}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {tier === "free" ? (
            <Button onClick={() => navigate("/#pricing")} className="bg-gradient-primary hover:shadow-glow">
              Upgrade
            </Button>
          ) : (
            <Button variant="outline" onClick={portal.open} disabled={portal.loading}>
              <ExternalLink className="w-4 h-4" /> Manage
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
