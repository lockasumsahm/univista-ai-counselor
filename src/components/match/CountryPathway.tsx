import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Plane, GraduationCap, ExternalLink, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getCountryPathway } from "@/lib/countryPathways";
import { motion } from "framer-motion";

interface Props {
  countries: string[];
}

const difficultyColor = (d: string) => {
  switch (d) {
    case "Moderate": return "bg-success/10 text-success border-success/20";
    case "Selective": return "bg-accent/10 text-accent border-accent/20";
    case "Highly Selective": return "bg-warning/10 text-warning border-warning/20";
    case "Extremely Selective": return "bg-destructive/10 text-destructive border-destructive/20";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

export const CountryPathway = ({ countries }: Props) => {
  const pathways = countries
    .map((c) => getCountryPathway(c))
    .filter((p): p is NonNullable<ReturnType<typeof getCountryPathway>> => !!p);

  if (pathways.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Plane className="w-4 h-4 text-primary" />
          Country pathway briefing
        </h3>
        <span className="text-xs text-muted-foreground">Context · not a decision tool</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {pathways.map((p, i) => (
          <motion.div
            key={p.country}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-4 border-border/60 bg-card/40 h-full">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-2xl leading-none">{p.flag}</span>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-foreground truncate">{p.country}</h4>
                    <Badge variant="outline" className={`${difficultyColor(p.difficulty)} text-[10px] mt-0.5`}>
                      {p.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-foreground">Timeline</div>
                    <div className="text-muted-foreground">
                      Apply {p.timeline.season} · Decisions {p.timeline.decisions} · Start {p.timeline.enrollment}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-foreground">Annual cost (intl)</div>
                    <div className="text-muted-foreground">{p.cost.totalAnnual}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-foreground">Required tests</div>
                    <div className="text-muted-foreground">{p.requiredTests.slice(0, 2).join(" · ")}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Plane className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-foreground">{p.visa.type}</div>
                    <div className="text-muted-foreground">
                      {p.visa.processingWeeks}
                      {p.visa.requiresInterview && " · interview required"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
                <p className="text-xs text-foreground bg-primary/5 rounded-md px-2 py-1.5 leading-relaxed">
                  <span className="font-semibold text-primary">Do this first:</span> {p.firstAction}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <a
                    href={p.visa.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                  >
                    Official visa info <ExternalLink className="w-3 h-3" />
                  </a>
                  <Link
                    to="/dashboard/visa-guide"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Visa guide <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
