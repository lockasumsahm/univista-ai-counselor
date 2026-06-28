import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ProfileForm } from "@/components/ProfileForm";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { extractTextFromFile } from "@/lib/pdfParser";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, FileText, History, Sparkles } from "lucide-react";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, saveProfile, loading } = useProfile();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (data: any) => {
    let resumeText: string | undefined;
    let resumeFileName: string | undefined;
    if (data.cv) {
      try {
        resumeText = await extractTextFromFile(data.cv);
        resumeFileName = data.cv.name;
        try {
          if (user?.id && resumeText) {
            sessionStorage.setItem(`cvText:${user.id}`, resumeText);
            sessionStorage.setItem(`cvName:${user.id}`, resumeFileName || "CV");
          }
        } catch {}
        toast({ title: t('toast.cvProcessed'), description: `AI read ${resumeText.length.toLocaleString()} characters from your CV.` });
      } catch (e: any) {
        console.error(e);
        toast({ title: "CV could not be read", description: e?.message || "Try a text-based PDF or TXT file.", variant: "destructive" });
      }
    }
    if (user) {
      const { error } = await saveProfile(data, { resumeText, resumeFileName });
      if (error) {
        toast({ title: t('toast.error'), description: error.message, variant: "destructive" });
        return;
      }
    }
    toast({ title: t('toast.profileSaved'), description: t('toast.profileSavedDesc') });
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-0">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-6 w-72" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const isNewUser = !profile?.name;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {!isNewUser && (
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-2 text-muted-foreground hover:text-foreground rounded-xl">
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/profile/history")} className="gap-2 rounded-xl">
              <History className="w-4 h-4" /> Profile History
            </Button>
          </div>
        )}
        {isNewUser && (
          <div className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
              Welcome to <span className="text-primary">UniVista</span><span className="text-accent">.AI</span> 🎓
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
              Fill out your profile below — the more accurate it is, the sharper your matches and acceptance estimates will be.
            </p>
          </div>
        )}

        {/* Common App placeholder */}
        <div className="mb-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-semibold">Connect Common App</h3>
              <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-accent/15 text-accent font-medium">
                Coming soon
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              One-click import of activities, awards, courses & essays so we can guide you faster.
            </p>
          </div>
          <Button disabled variant="outline" size="sm" className="gap-2 rounded-xl shrink-0 w-full sm:w-auto">
            <Sparkles className="w-4 h-4" /> Connect
          </Button>
        </div>

        <ProfileForm onSubmit={handleSubmit} initialData={profile as any || undefined} />
      </motion.div>
    </div>
  );
};

export default ProfilePage;
