import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerateButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  hasResult?: boolean;
  label?: string;
  regenerateLabel?: string;
  loadingLabel?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}

/**
 * Unified "Generate / Re-run AI" action button used across all AI-powered
 * pages (Profile Score, Uni Matches, Uni Checker, FitMatrix, Essay Coach,
 * Roadmap). Shows Sparkles before first generation, Refresh after a result
 * is on screen, and a spinner while running.
 */
export const GenerateButton = ({
  onClick,
  loading = false,
  disabled = false,
  hasResult = false,
  label = "Generate",
  regenerateLabel = "Re-run AI",
  loadingLabel = "Generating…",
  className,
  size = "default",
}: GenerateButtonProps) => {
  const Icon = loading ? RefreshCw : hasResult ? RefreshCw : Sparkles;
  const text = loading ? loadingLabel : hasResult ? regenerateLabel : label;

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      size={size}
      className={cn(
        "bg-gradient-primary text-primary-foreground hover:shadow-glow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
        className,
      )}
      aria-label={text}
    >
      <Icon className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
      {text}
    </Button>
  );
};
