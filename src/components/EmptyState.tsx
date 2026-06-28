import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) => (
  <div
    role="status"
    aria-live="polite"
    className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in"
  >
    <div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center mb-6" aria-hidden="true">
      <Icon className="w-10 h-10 text-muted-foreground/40" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
    {actionLabel && onAction && (
      <Button onClick={onAction} className="rounded-xl bg-gradient-primary hover:shadow-glow">
        {actionLabel}
      </Button>
    )}
  </div>
);
