import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { AppHealthCheck } from "@/components/AppHealthCheck";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import {
  Lock, Eye, EyeOff, Shield, Palette, Globe, Bell, Trash2, AlertTriangle, Settings, Download, Activity
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { prefs, update: updatePrefs } = useUserPreferences();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: t('toast.error'), description: t('settings.passwordMinLength'), variant: "destructive" });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: t('toast.error'), description: t('settings.passwordsNoMatch'), variant: "destructive" });
      return;
    }
    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: t('settings.passwordUpdated'), description: t('settings.passwordUpdatedDesc') });
      setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword("");
    } catch (error: any) {
      toast({ title: t('toast.error'), description: error.message || "Failed to change password", variant: "destructive" });
    } finally { setIsChangingPassword(false); }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("delete-account", { body: {} });
      if (error || (data && (data as any).error)) {
        throw new Error(error?.message || (data as any)?.error || "Failed to delete account");
      }
      await signOut();
      toast({ title: t('settings.accountDeleted'), description: t('settings.accountDeletedDesc') });
    } catch (error: any) {
      toast({ title: t('toast.error'), description: error.message || "Failed to delete account", variant: "destructive" });
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    try {
      const [profiles, scores, apps, deadlines, programs, chats] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id),
        supabase.from("factor_scores").select("*").eq("user_id", user.id),
        supabase.from("user_applications").select("*").eq("user_id", user.id),
        supabase.from("user_deadlines").select("*").eq("user_id", user.id),
        supabase.from("user_programs").select("*").eq("user_id", user.id),
        supabase.from("chat_messages").select("*").eq("user_id", user.id).order("created_at"),
      ]);
      const exportData = {
        exported_at: new Date().toISOString(),
        profile: profiles.data, factor_scores: scores.data, applications: apps.data,
        deadlines: deadlines.data, programs: programs.data, chat_messages: chats.data,
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `univista-data-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click(); URL.revokeObjectURL(url);
      toast({ title: t('settings.dataExported'), description: t('settings.dataExportedDesc') });
    } catch {
      toast({ title: t('toast.error'), description: "Failed to export data", variant: "destructive" });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Settings className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">{t('settings.title')}</h1>
          <p className="text-muted-foreground text-sm">{t('settings.subtitle')}</p>
        </div>
      </div>

      <Card className="border-border/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2"><Palette className="w-4 h-4 text-primary" /><CardTitle className="text-lg">{t('settings.appearance')}</CardTitle></div>
          <CardDescription>{t('settings.appearanceDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-sm">{t('settings.theme')}</p><p className="text-xs text-muted-foreground">{t('settings.themeDesc')}</p></div>
            <DarkModeToggle />
          </div>
          <Separator className="bg-border/30" />
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-sm">{t('settings.language')}</p><p className="text-xs text-muted-foreground">{t('settings.languageDesc')}</p></div>
            <LanguageSelector />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /><CardTitle className="text-lg">{t('settings.notifications')}</CardTitle></div>
          <CardDescription>{t('settings.notificationsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-sm">{t('settings.emailNotifications')}</p><p className="text-xs text-muted-foreground">{t('settings.emailNotificationsDesc')}</p></div>
            <Switch checked={prefs.email_notifications} onCheckedChange={(v) => updatePrefs({ email_notifications: v })} />
          </div>
          <Separator className="bg-border/30" />
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-sm">{t('settings.deadlineReminders')}</p><p className="text-xs text-muted-foreground">{t('settings.deadlineRemindersDesc')}</p></div>
            <Switch checked={prefs.deadline_reminders} onCheckedChange={(v) => updatePrefs({ deadline_reminders: v })} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /><CardTitle className="text-lg">{t('settings.security')}</CardTitle></div>
          <CardDescription>{t('settings.securityDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2"><p className="text-xs text-muted-foreground">{t('settings.signedInAs')} <span className="font-medium text-foreground">{user?.email}</span></p></div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-muted-foreground" />{t('settings.newPassword')}</Label>
              <div className="relative">
                <Input type={showPasswords ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="h-11 rounded-xl bg-muted/30 border-border/50 pr-10" />
                <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-muted-foreground" />{t('settings.confirmNewPassword')}</Label>
              <Input type={showPasswords ? "text" : "password"} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="••••••••" className="h-11 rounded-xl bg-muted/30 border-border/50" />
            </div>
            <Button type="submit" variant="outline" className="rounded-xl" disabled={isChangingPassword || !newPassword}>
              {isChangingPassword ? t('settings.updating') : t('settings.changePassword')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2"><Download className="w-4 h-4 text-primary" /><CardTitle className="text-lg">{t('settings.dataExport')}</CardTitle></div>
          <CardDescription>{t('settings.dataExportDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-sm">{t('settings.downloadMyData')}</p><p className="text-xs text-muted-foreground">{t('settings.downloadMyDataDesc')}</p></div>
            <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={handleExportData}><Download className="w-3.5 h-3.5" />{t('settings.export')}</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /><CardTitle className="text-lg">Diagnostics</CardTitle></div>
          <CardDescription>Verify every page, API, and upload flow is working.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Run a full app health check</p>
              <p className="text-xs text-muted-foreground">Tests auth, profile, matches, storage, edge functions, and routes.</p>
            </div>
            <AppHealthCheck triggerLabel="Run check" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive" /><CardTitle className="text-lg text-destructive">{t('settings.dangerZone')}</CardTitle></div>
          <CardDescription>{t('settings.dangerZoneDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-sm">{t('settings.deleteAccountData')}</p><p className="text-xs text-muted-foreground">{t('settings.deleteAccountDataDesc')}</p></div>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="destructive" size="sm" className="rounded-xl gap-2"><Trash2 className="w-3.5 h-3.5" />{t('common.delete')}</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('settings.deleteConfirmTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('settings.deleteConfirmDesc')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('settings.deleteEverything')}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SettingsPage;
