import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { tierFromConfidence, type ConfidenceTier } from "@/lib/trust";
import { cn } from "@/lib/utils";

interface Props {
  /** 0..100 */
  value: number;
  /** Optional explanation shown in tooltip. */
  reason?: string;
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

const TIER_LABEL: Record<ConfidenceTier, string> = {
  low: "Low confidence",
  medium: "Medium confidence",
  high: "High confidence",
};

const TIER_BAR: Record<ConfidenceTier, string> = {
  low: "bg-destructive/70",
  medium: "bg-accent",
  high: "bg-success",
};

const TIER_TEXT: Record<ConfidenceTier, string> = {
  low: "text-destructive",
  medium: "text-accent",
  high: "text-success",
};

export const ConfidenceMeter = ({
  value,
  reason,
  className,
  showLabel = true,
  compact = false,
}: Props) => {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const tier = tierFromConfidence(v);
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn("flex items-center gap-2 cursor-help", className)}
            role="meter"
            aria-valuenow={v}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${TIER_LABEL[tier]} (${v}%)`}
          >
            {showLabel && (
              <span
                className={cn(
                  "text-[10px] uppercase tracking-wider font-semibold",
                  TIER_TEXT[tier],
                )}
              >
                {compact ? `${v}%` : `${TIER_LABEL[tier]} · ${v}%`}
              </span>
            )}
            <div
              className={cn(
                "h-1.5 rounded-full bg-muted overflow-hidden",
                compact ? "w-12" : "w-20",
              )}
            >
              <div
                className={cn("h-full rounded-full transition-all", TIER_BAR[tier])}
                style={{ width: `${v}%` }}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs font-medium">{TIER_LABEL[tier]} ({v}%)</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {reason ??
              "Confidence reflects how much real data backs this number — sample size, source quality, and corroboration."}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
