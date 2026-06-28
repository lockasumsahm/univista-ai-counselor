import { Link } from "react-router-dom";
import { ArrowRight, Lightbulb, AlertTriangle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { detectMissingData } from "@/lib/missingData";

interface Props {
  profile: any;
  /** Max items to surface. Default 4. */
  limit?: number;
  /** Compact dashboard variant. */
  compact?: boolean;
}

/**
 * Missing-Data Panel — Step 3 of Trust Engine.
 *
 * Shows the highest-leverage empty profile fields with deep links to fix
 * them, plus an estimated confidence lift so users know what they're
 * trading their 2 minutes for.
 */
export const MissingDataPanel = ({ profile, limit = 4, compact }: Props) => {
  const report = detectMissingData(profile);

  if (report.isComplete) {
    return (
      <Card className="p-4 border-success/30 bg-success/5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-success" />
          <p className="text-sm font-medium text-success">
            Profile complete — your matches are running on full confidence.
          </p>
        </div>
      </Card>
    );
  }

  const items = report.items.slice(0, limit);
  const hiddenCount = report.items.length - items.length;

  return (
    <Card className="p-4 sm:p-5 border-border/60 space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-accent" />
          <h4 className="text-sm font-semibold text-foreground">
            Boost your match confidence
          </h4>
          <Badge variant="outline" className="text-[10px] ml-auto">
            +{report.totalPotentialLift} pts available
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Filling these fields will sharpen every recommendation — ranked by
          how much each one moves the needle.
        </p>
        <Progress value={report.completeness} className="h-1.5 mt-2" />
        <p className="text-[11px] text-muted-foreground">
          Profile {report.completeness}% complete
        </p>
      </div>

      <ul className="space-y-2.5">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex items-start gap-3 rounded-lg border border-border/50 p-3 hover:border-primary/40 hover:bg-primary/5 transition-colors"
          >
            <div
              className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                item.severity === "required"
                  ? "bg-destructive/15 text-destructive"
                  : "bg-accent/15 text-accent"
              }`}
            >
              {item.severity === "required" ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-foreground">
                  {item.label}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] border-success/40 text-success"
                >
                  +{item.estimatedLift} confidence
                </Badge>
                {item.severity === "required" && (
                  <Badge variant="destructive" className="text-[10px]">
                    Required
                  </Badge>
                )}
              </div>
              {!compact && (
                <p className="text-[11px] text-muted-foreground leading-snug mt-1">
                  {item.reason}
                </p>
              )}
            </div>
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="shrink-0 h-8 px-2"
            >
              <Link to={item.route} aria-label={`Fill ${item.label}`}>
                Fix <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </li>
        ))}
      </ul>

      {hiddenCount > 0 && (
        <Button asChild variant="ghost" size="sm" className="w-full">
          <Link to="/dashboard/profile">
            View {hiddenCount} more {hiddenCount === 1 ? "gap" : "gaps"}
            <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </Button>
      )}
    </Card>
  );
};
