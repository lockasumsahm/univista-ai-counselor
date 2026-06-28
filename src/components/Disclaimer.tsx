import { AlertTriangle, Info, ExternalLink, ShieldCheck, Lock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/LanguageContext";

interface DisclaimerProps {
  variant?: "default" | "compact";
}

export const Disclaimer = ({ variant = "default" }: DisclaimerProps) => {
  const { t } = useLanguage();
  
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
        <Info className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{t('disclaimer.compact')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Security Banner */}
      <div className="flex flex-wrap items-center gap-4 px-5 py-3.5 rounded-2xl border border-success/20 bg-success/5">
        <div className="flex items-center gap-2 text-sm">
          <ShieldCheck className="w-4 h-4 text-success" />
          <span className="font-medium text-foreground/90">Your data is 100% secure</span>
        </div>
        <div className="hidden sm:block w-px h-4 bg-border/30" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="w-3.5 h-3.5 text-success" />
          <span>End-to-end encrypted · Never shared or sold · You control your data</span>
        </div>
      </div>

      {/* AI Disclaimer */}
      <Alert className="border-warning/30 bg-warning/5">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertTitle className="text-warning font-semibold">{t('disclaimer.title')}</AlertTitle>
        <AlertDescription className="text-muted-foreground space-y-2">
          <p>{t('disclaimer.text')}</p>
          <div className="flex items-center gap-2 mt-3 text-sm">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{t('disclaimer.verify')}</span>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};