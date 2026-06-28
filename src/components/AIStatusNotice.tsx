import { Button } from "@/components/ui/button";
import { AlertTriangle, Coins, Clock3, RefreshCw, WifiOff, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export type AIStatus = "credits" | "rateLimit" | "error" | "network" | "auth";

interface AIStatusNoticeProps {
  status: AIStatus;
  onRetry?: () => void;
  /** Optional raw error message to surface as the "Why this happened" detail. */
  cause?: string;
}

const COPY: Record<AIStatus, {
  icon: typeof AlertTriangle;
  title: string;
  why: string;
  fix: string;
  iconBg: string;
  iconColor: string;
  ringColor: string;
}> = {
  credits: {
    icon: Coins,
    title: "AI analysis paused — out of credits",
    why: "Your Lovable Cloud AI balance has run out, so the model couldn't reply.",
    fix: "Add credits in Settings → Cloud & AI balance, then press Try again.",
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    ringColor: "ring-warning/20",
  },
  rateLimit: {
    icon: Clock3,
    title: "Slow down a moment — rate limit reached",
    why: "You've hit the AI provider's per-minute request cap.",
    fix: "Wait 30–60 seconds, then press Try again. No data was lost.",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    ringColor: "ring-accent/20",
  },
  error: {
    icon: AlertTriangle,
    title: "AI couldn't finish your analysis",
    why: "The AI service returned an unexpected response or error.",
    fix: "This is usually temporary — press Try again. If it keeps happening, refresh the page.",
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
    ringColor: "ring-destructive/20",
  },
  network: {
    icon: WifiOff,
    title: "We couldn't reach the AI service",
    why: "Your device couldn't connect — likely a network or firewall issue.",
    fix: "Check your internet connection and press Try again.",
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    ringColor: "ring-border",
  },
  auth: {
    icon: ShieldAlert,
    title: "Your session expired",
    why: "Your sign-in token is no longer valid, so we can't talk to the AI on your behalf.",
    fix: "Sign out and sign back in to refresh your session.",
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
    ringColor: "ring-destructive/20",
  },
};

export const AIStatusNotice = ({ status, onRetry, cause }: AIStatusNoticeProps) => {
  const c = COPY[status];
  const Icon = c.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`surface-premium rounded-2xl ring-1 ${c.ringColor}`}
      role="alert"
      aria-live="polite"
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4 min-w-0">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.iconBg} ${c.iconColor}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-2 min-w-0">
              <h3 className="text-base font-display font-semibold text-foreground tracking-tight">
                {c.title}
              </h3>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground/80">Why this happened: </span>
                  {c.why}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground/80">How to fix it: </span>
                  {c.fix}
                </p>
              </div>
              {cause && (
                <details className="group mt-2">
                  <summary className="cursor-pointer text-xs text-muted-foreground/80 hover:text-foreground transition-colors select-none">
                    Technical details
                  </summary>
                  <pre className="mt-2 text-[11px] leading-relaxed bg-muted/40 border border-border/60 rounded-lg p-2.5 overflow-auto max-h-28 text-muted-foreground">
                    {cause}
                  </pre>
                </details>
              )}
            </div>
          </div>

          {onRetry ? (
            <Button
              variant="outline"
              onClick={onRetry}
              className="gap-2 self-start md:self-auto rounded-xl border-border/80 hover:border-foreground/30 shrink-0"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
};
