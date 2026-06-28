import { ShieldCheck, BarChart3, Sparkles, HelpCircle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  EVIDENCE_DESCRIPTION,
  EVIDENCE_LABEL,
  type EvidenceDescriptor,
  type EvidenceLevel,
} from "@/lib/trust";
import { cn } from "@/lib/utils";

interface Props {
  evidence: EvidenceDescriptor;
  className?: string;
  size?: "sm" | "md";
}

const ICON: Record<EvidenceLevel, typeof ShieldCheck> = {
  verified: ShieldCheck,
  estimated: BarChart3,
  inferred: Sparkles,
  unknown: HelpCircle,
};

const STYLE: Record<EvidenceLevel, string> = {
  verified: "bg-success/15 text-success border-success/40",
  estimated: "bg-primary/10 text-primary border-primary/30",
  inferred: "bg-accent/15 text-accent border-accent/40",
  unknown: "bg-muted text-muted-foreground border-border",
};

export const EvidenceBadge = ({ evidence, className, size = "sm" }: Props) => {
  const Icon = ICON[evidence.level];
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "gap-1 font-semibold cursor-help",
              STYLE[evidence.level],
              size === "sm" ? "text-[10px] uppercase tracking-wider px-2 py-0.5" : "text-xs",
              className,
            )}
            aria-label={`Evidence: ${EVIDENCE_LABEL[evidence.level]}`}
          >
            <Icon className="w-3 h-3" />
            {EVIDENCE_LABEL[evidence.level]}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs space-y-2">
          <p className="text-xs font-medium">{EVIDENCE_DESCRIPTION[evidence.level]}</p>
          {evidence.reason && (
            <p className="text-[11px] text-muted-foreground">{evidence.reason}</p>
          )}
          {evidence.sources.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-border/40">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Sources</p>
              <ul className="space-y-0.5">
                {evidence.sources.map((s, i) => (
                  <li key={i} className="text-[11px] flex items-center gap-1">
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline inline-flex items-center gap-0.5 hover:text-primary"
                      >
                        {s.label}
                        {s.year ? ` · ${s.year}` : ""}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      <span>
                        {s.label}
                        {s.year ? ` · ${s.year}` : ""}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
