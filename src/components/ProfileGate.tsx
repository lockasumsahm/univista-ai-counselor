import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, CheckCircle2, Circle, ArrowRight, Info, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  computeCompleteness,
  getFieldLabel,
  getRequiredFields,
  hasRequiredProfile,
  type FieldKey,
} from "@/lib/profileCompleteness";

interface ProfileGateProps {
  profile: any;
  featureName: string;
  description?: string;
  requiredFields?: FieldKey[];
  children: React.ReactNode;
  /** When true, shows a soft inline warning above children instead of fully blocking. */
  soft?: boolean;
}

export const ProfileGate = ({
  profile,
  featureName,
  description,
  requiredFields = getRequiredFields(),
  children,
  soft = false,
}: ProfileGateProps) => {
  const completeness = computeCompleteness(profile);
  const hasRequired = hasRequiredProfile(profile, requiredFields);

  // Soft mode — just show a thin banner and still render children
  if (soft) {
    if (completeness.percent >= 70) return <>{children}</>;
    return (
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-4 flex items-center gap-3">
              <Info className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 text-sm">
                <span className="font-medium">For more accurate {featureName.toLowerCase()}, </span>
                <span className="text-muted-foreground">
                  complete your profile ({completeness.percent}% done).
                </span>
              </div>
              <Button asChild size="sm" variant="outline" className="rounded-xl">
                <Link to="/dashboard/profile">Complete</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
        {children}
      </div>
    );
  }

  // Hard gate — block until required fields are filled
  if (hasRequired) return <>{children}</>;

  const missingAll = [...completeness.missingRequired, ...completeness.missingRecommended];
  const filledAll = (
    [...getRequiredFields(), ...completeness.missingRecommended] as FieldKey[]
  ).filter((f) => !missingAll.includes(f));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="overflow-hidden border-primary/20 shadow-lg">
        <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
        <CardContent className="p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-display font-bold">
                  Complete your profile for accurate results
                </h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Why is profile data needed?"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Our AI uses every field you provide to score your fit. The more complete your
                      profile, the more accurate your {featureName.toLowerCase()} will be.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-muted-foreground text-sm">
                {description ||
                  `To generate accurate ${featureName.toLowerCase()}, we need a few details about your academic profile.`}
              </p>
            </div>
          </div>

          {/* Completeness bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Profile completeness</span>
              <Badge variant="secondary" className="rounded-full">
                {completeness.percent}%
              </Badge>
            </div>
            <Progress value={completeness.percent} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {completeness.filledCount} of {completeness.totalCount} fields completed
            </p>
          </div>

          {/* Missing required highlight */}
          {completeness.missingRequired.length > 0 && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive mb-1">Required to continue:</p>
                <ul className="space-y-0.5 text-foreground">
                  {completeness.missingRequired.map((f) => (
                    <li key={f}>• {getFieldLabel(f)}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Field checklist */}
          <div>
            <p className="text-sm font-medium mb-3">What we'll use:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filledAll.slice(0, 6).map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <span>{getFieldLabel(f)}</span>
                </div>
              ))}
              {completeness.missingRecommended.slice(0, 6).map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  <span>{getFieldLabel(f)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Button asChild size="lg" className="w-full rounded-xl gap-2 shadow-md">
            <Link to="/dashboard/profile">
              Complete my profile
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Takes ~2 minutes. Your data is private and used only for your AI insights.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileGate;
