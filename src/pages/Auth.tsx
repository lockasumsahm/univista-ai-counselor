import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Lock, UserPlus, LogIn, ArrowLeft, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { z } from "zod";
import { ForgotPassword } from "@/components/ForgotPassword";
import logo from "@/assets/logo.webp";
import { PageSeo } from "@/components/PageSeo";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [user, loading, navigate]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    if (!isLogin && password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: t('auth.error'), description: error.message.includes("Invalid login credentials") ? t('auth.invalidCredentials') : error.message, variant: "destructive" });
        } else {
          toast({ title: t('auth.welcomeBack'), description: t('auth.loginSuccess') });
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          toast({ title: t('auth.error'), description: error.message.includes("already registered") ? t('auth.emailExists') : error.message, variant: "destructive" });
        } else {
          toast({ title: t('auth.accountCreated'), description: t('auth.checkEmail') });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex flex-col" aria-label="Sign in to UniVista">
      <PageSeo
        title="Sign in — UniVista.AI"
        description="Sign in or create your free UniVista.AI account to get instant university matches, admission predictions, and essay coaching."
        path="/auth"
      />
      <div className="absolute top-[-30%] right-[-20%] w-[700px] h-[700px] rounded-full bg-primary/5 blur-[150px]" />
      <div className="absolute bottom-[-30%] left-[-20%] w-[600px] h-[600px] rounded-full bg-accent/5 blur-[150px]" />

      <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex items-center justify-between p-4 md:p-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2 text-muted-foreground hover:text-foreground rounded-xl">
          <ArrowLeft className="w-4 h-4" />{t('auth.back')}
        </Button>
        <LanguageSelector />
      </motion.div>

      <div className="flex-1 flex items-center justify-center px-4 pb-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }} className="text-center mb-8">
            <img src={logo} alt="UniVista.AI university counseling platform logo" className="w-16 h-16 mx-auto mb-4 object-contain" />
            <h1 className="text-3xl font-display font-bold tracking-tight">
              Sign in to <span className="bg-gradient-primary bg-clip-text text-transparent">UniVista</span>
              <span className="text-accent">.AI</span>
            </h1>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 mb-4 text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-success" />
            <span>{t('auth.dataEncrypted')}</span>
          </motion.div>

          <Card className="border-border/40 bg-card/85 backdrop-blur-2xl shadow-elevated overflow-hidden rounded-3xl">
            <CardHeader className="pb-4 pt-8 px-8 text-center">
              <AnimatePresence mode="wait">
                <motion.div key={showForgotPassword ? "forgot" : isLogin ? "login" : "signup"}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <CardTitle className="text-2xl font-display tracking-tight">
                    {showForgotPassword ? t('auth.resetPassword') : isLogin ? t('auth.signIn') : t('auth.createAccount')}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-1">
                    {showForgotPassword ? t('auth.resetPasswordDesc') : isLogin ? t('auth.signInDesc') : t('auth.createAccountDesc')}
                  </CardDescription>
                </motion.div>
              </AnimatePresence>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              {showForgotPassword ? (
                <ForgotPassword onBack={() => setShowForgotPassword(false)} />
              ) : (
                <>
                  <Button type="button" variant="outline"
                    className="w-full gap-3 h-12 rounded-xl border-border/50 hover:bg-muted/50 transition-all duration-300 mb-6 hover:shadow-sm"
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
                        if (result.error) toast({ title: t('auth.error'), description: result.error.message, variant: "destructive" });
                        if (result.redirected) return;
                      } catch (err) {
                        toast({ title: t('auth.error'), description: err instanceof Error ? err.message : "Failed to sign in with Google", variant: "destructive" });
                      } finally { setIsLoading(false); }
                    }}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {t('auth.googleSignIn')}
                  </Button>

                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-3 text-muted-foreground">{t('auth.orContinueWith')}</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />{t('auth.email')}
                      </Label>
                      <Input id="email" type="email" value={email}
                        onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: undefined }); }}
                        placeholder="you@example.com"
                        className={`h-12 rounded-xl bg-muted/30 border-border/50 ${errors.email ? "border-destructive ring-2 ring-destructive/20" : ""}`}
                        disabled={isLoading} />
                      <AnimatePresence>
                        {errors.email && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-sm text-destructive">{errors.email}</motion.p>}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-muted-foreground" />{t('auth.password')}
                      </Label>
                      <div className="relative">
                        <Input id="password" type={showPassword ? "text" : "password"} value={password}
                          onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: undefined }); }}
                          placeholder="••••••••"
                          className={`h-12 rounded-xl bg-muted/30 border-border/50 pr-10 ${errors.password ? "border-destructive ring-2 ring-destructive/20" : ""}`}
                          disabled={isLoading} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <AnimatePresence>
                        {errors.password && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-sm text-destructive">{errors.password}</motion.p>}
                      </AnimatePresence>
                    </div>

                    <AnimatePresence>
                      {!isLogin && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5 text-muted-foreground" />{t('auth.confirmPassword')}
                          </Label>
                          <Input id="confirmPassword" type={showPassword ? "text" : "password"} value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setErrors({ ...errors, confirmPassword: undefined }); }}
                            placeholder="••••••••"
                            className={`h-12 rounded-xl bg-muted/30 border-border/50 ${errors.confirmPassword ? "border-destructive ring-2 ring-destructive/20" : ""}`}
                            disabled={isLoading} />
                          <AnimatePresence>
                            {errors.confirmPassword && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-sm text-destructive">{errors.confirmPassword}</motion.p>}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!isLogin && password.length > 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div className={`h-full rounded-full ${password.length >= 12 ? 'bg-success' : password.length >= 8 ? 'bg-warning' : 'bg-destructive'}`}
                            initial={{ width: 0 }} animate={{ width: `${Math.min((password.length / 12) * 100, 100)}%` }} transition={{ duration: 0.3 }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{password.length >= 12 ? t('auth.passwordStrong') : password.length >= 8 ? t('auth.passwordGood') : t('auth.passwordWeak')}</span>
                      </motion.div>
                    )}

                    <Button type="submit" className="w-full h-12 rounded-xl bg-gradient-primary hover:shadow-glow transition-all duration-300 gap-2 text-base mt-2" disabled={isLoading}>
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                      ) : isLogin ? (
                        <><LogIn className="w-4 h-4" />{t('auth.signIn')}</>
                      ) : (
                        <><UserPlus className="w-4 h-4" />{t('auth.createAccount')}</>
                      )}
                    </Button>
                  </form>

                  {isLogin && (
                    <div className="mt-3 text-center">
                      <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm text-primary hover:underline transition-colors">
                        {t('auth.forgotPassword')}
                      </button>
                    </div>
                  )}

                  <div className="mt-4 text-center">
                    <button type="button" onClick={() => { setIsLogin(!isLogin); setErrors({}); }}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
                      <span className="ml-1 font-semibold text-primary">{isLogin ? t('auth.createAccount') : t('auth.signIn')}</span>
                    </button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
};

export default Auth;
