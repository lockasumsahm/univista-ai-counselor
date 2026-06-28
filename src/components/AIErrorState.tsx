import { AlertCircle, RefreshCw, Sparkles, CreditCard, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type AIErrorKind =
  | "credits"      // 402
  | "rateLimit"    // 429
  | "timeout"
  | "validation"
  | "network"
  | "unknown";

export function classifyError(status?: number | null, message?: string): AIErrorKind {
  if (status === 402) return "credits";
  if (status === 429) return "rateLimit";
  if (status && status >= 500) return "network";
  const m = (message || "").toLowerCase();
  if (m.includes("timeout") || m.includes("timed out")) return "timeout";
  if (m.includes("parse") || m.includes("json") || m.includes("invalid")) return "validation";
  if (m.includes("network") || m.includes("fetch")) return "network";
  return "unknown";
}

interface Props {
  kind?: AIErrorKind;
  title?: string;
  message?: string;
  requestId?: string | null;
  onRetry?: () => void;
  onForceNewRun?: () => void;
  busy?: boolean;
}

const COPY: Record<AIErrorKind, { title: string; help: string; icon: any }> = {
  credits:    { title: "AI credits exhausted", help: "Your workspace is out of AI credits. Top up to continue.", icon: CreditCard },
  rateLimit:  { title: "AI is rate-limited",   help: "Too many requests at once. Wait a moment and try again.", icon: Clock },
  timeout:    { title: "AI request timed out", help: "The model took too long. Try again — it usually works on the second try.", icon: Clock },
  validation: { title: "AI returned an invalid response", help: "We auto-retry on a backup model. If this persists, request a new run to bypass cache.", icon: AlertCircle },
  network:    { title: "Could not reach AI",   help: "Network or upstream issue. Try again in a few seconds.", icon: AlertCircle },
  unknown:    { title: "AI couldn't finish your analysis", help: "Press Try again. If it keeps failing, request a new run.", icon: AlertCircle },
};

export function AIErrorState({
  kind = "unknown",
  title,
  message,
  requestId,
  onRetry,
  onForceNewRun,
  busy = false,
}: Props) {
  const C = COPY[kind];
  const Icon = C.icon;

  return (
    <Card className="p-6 border-destructive/30 bg-destructive/5">
      <div className="flex gap-4">
        <div className="shrink-0 mt-1">
          <Icon className="w-6 h-6 text-destructive" aria-hidden />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-foreground">{title || C.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{C.help}</p>
            {message && (
              <p className="text-xs text-muted-foreground/80 mt-2 font-mono break-words">{message}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {onRetry && (
              <Button size="sm" onClick={onRetry} disabled={busy}>
                <RefreshCw className={`w-4 h-4 mr-2 ${busy ? "animate-spin" : ""}`} />
                Try again
              </Button>
            )}
            {onForceNewRun && (
              <Button size="sm" variant="outline" onClick={onForceNewRun} disabled={busy}>
                <Sparkles className="w-4 h-4 mr-2" />
                Request new run
              </Button>
            )}
          </div>

          {requestId && (
            <p className="text-[11px] text-muted-foreground/70 font-mono">
              Request ID: <span className="select-all">{requestId}</span>
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
