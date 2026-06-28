import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ForgotPasswordProps {
  onBack: () => void;
}

export const ForgotPassword = ({ onBack }: ForgotPasswordProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setIsSent(true);
    } catch (error: any) {
      toast({ title: t('toast.error'), description: error.message || "Failed to send reset email", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isSent ? (
        <motion.div key="sent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
          <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('forgot.checkEmail')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('forgot.sentLink')} <strong className="text-foreground">{email}</strong>
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            {t('forgot.didntReceive')}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" size="sm" onClick={() => setIsSent(false)} className="rounded-xl">{t('forgot.tryAgain')}</Button>
            <Button variant="ghost" size="sm" onClick={onBack} className="rounded-xl">{t('forgot.backToSignIn')}</Button>
          </div>
        </motion.div>
      ) : (
        <motion.form key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-4">
          <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('forgot.backToSignIn')}
          </button>
          <div className="space-y-2">
            <Label htmlFor="reset-email" className="text-sm font-medium flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              {t('forgot.enterEmail')}
            </Label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('forgot.emailPlaceholder')}
              className="h-12 rounded-xl bg-muted/30 border-border/50"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl bg-gradient-primary" disabled={isLoading || !email}>
            {isLoading ? t('forgot.sending') : t('forgot.sendResetLink')}
          </Button>
        </motion.form>
      )}
    </AnimatePresence>
  );
};
