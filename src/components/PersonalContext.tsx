import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Heart, HelpCircle, Shield } from "lucide-react";

export interface PersonalContextData {
  personalStatement: string;
}

interface PersonalContextProps {
  value: PersonalContextData;
  onChange: (data: PersonalContextData) => void;
}

export const PersonalContext = ({ value, onChange }: PersonalContextProps) => {
  const safeValue = value || { personalStatement: "" };
  const [isExpanded, setIsExpanded] = useState(false);

  const hasContent = safeValue.personalStatement.trim().length > 0;

  return (
    <TooltipProvider>
      <Card className="shadow-card border-border/50 overflow-hidden">
        <CardHeader 
          className="bg-muted/30 p-6 cursor-pointer hover:bg-muted/40 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  Personal Context
                  <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    Optional & Confidential
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Share circumstances that may provide context for your application
                </p>
              </div>
            </div>
            <div className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>
              <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="p-6 space-y-6 animate-fade-in">
            {/* Privacy Notice */}
            <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">How This Information Is Used</p>
                <p className="text-muted-foreground">
                  This context helps the AI understand your circumstances fairly, just as real admissions committees do. 
                  It's not used to give unfair advantages, but to provide perspective on your achievements. 
                  This information is processed securely and never shared.
                </p>
              </div>
            </div>

            {/* Personal Statement Text Area */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-foreground font-medium">
                <Heart className="w-4 h-4 text-primary" />
                Your Personal Story
                <Tooltip>
                  <TooltipTrigger
                    type="button"
                    className="inline-flex items-center justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Personal story help"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      Write freely about any circumstances that have shaped your academic journey. This could include 
                      financial challenges, family responsibilities, health issues, work experience, immigration background, 
                      or any other significant life experiences.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              
              <p className="text-sm text-muted-foreground">
                Write a paragraph describing any personal circumstances that have impacted your educational journey. 
                Our AI will analyze your story and factor it into your profile evaluation.
              </p>
              
              <Textarea
                value={safeValue.personalStatement}
                onChange={(e) => onChange({ personalStatement: e.target.value })}
                placeholder="Share your story here... For example: 'Growing up as the oldest of five siblings, I often helped care for my younger brothers and sisters while my parents worked multiple jobs. This meant I had less time for traditional extracurriculars, but I developed strong leadership and time management skills. During my junior year, my family faced significant financial hardship when my father lost his job, which required me to work part-time to help support our household...'"
                className="min-h-[180px] resize-y"
              />
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{safeValue.personalStatement.length}/2000 characters</span>
                {safeValue.personalStatement.length > 2000 && (
                  <span className="text-destructive">Please keep your response under 2000 characters</span>
                )}
              </div>
            </div>

            {/* Confirmation Message */}
            {hasContent && safeValue.personalStatement.length <= 2000 && (
              <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                <p className="text-sm text-success font-medium">
                  ✓ Your personal context will be analyzed and factored into your evaluation
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Admissions committees value understanding your unique journey
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </TooltipProvider>
  );
};

export const defaultPersonalContext: PersonalContextData = {
  personalStatement: "",
};
