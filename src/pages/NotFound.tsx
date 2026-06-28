import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.webp";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-4">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-accent/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md relative z-10"
      >
        <motion.img
          src={logo}
          alt="UniVista.AI"
          className="w-16 h-16 mx-auto mb-8 object-contain"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-8xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            404
          </h1>
        </motion.div>

        <h2 className="text-2xl font-display font-semibold text-foreground mb-3 tracking-tight">
          {t('notFound.title')}
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          <code className="text-sm bg-muted px-2 py-0.5 rounded-md font-mono">{location.pathname}</code> {t('notFound.desc')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="gap-2 rounded-xl bg-gradient-primary hover:shadow-glow transition-all duration-300">
            <Link to="/">
              <Home className="w-4 h-4" />
              {t('notFound.backHome')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2 rounded-xl border-border/50">
            <Link to="/" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4" />
              {t('notFound.goBack')}
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
