import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Rocket } from "lucide-react";
import logo from "@/assets/logo.webp";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";

interface NavbarProps {
  onGetStarted: () => void;
}

export const Navbar = ({ onGetStarted }: NavbarProps) => {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const links = [
    { label: t('nav.howItWorks'), id: "how-it-works" },
    { label: t('nav.features'), id: "features" },
    { label: t('nav.testimonials'), id: "testimonials" },
    { label: t('nav.faq'), id: "faq" },
  ];

  return (
    <>
      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-500 top-[var(--banner-h,0px)] ${
          scrolled
            ? "bg-background/75 backdrop-blur-2xl border-b border-border/40 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto max-w-7xl px-4">
          <div className={`flex items-center justify-between transition-all duration-500 ${scrolled ? "h-14" : "h-16"}`}>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2.5 group shrink-0">
              <img src={logo} alt="UniVista.AI" className="w-7 h-7 object-contain group-hover:scale-110 transition-transform duration-300" />
              <span className="font-display font-semibold text-base tracking-tight">
                <span className="text-foreground">UniVista</span>
                <span className="text-accent">.ai</span>
              </span>
            </button>

            <div className="hidden lg:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
              {links.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="px-3.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/60"
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <LanguageSelector />
              <Button variant="ghost" size="sm" onClick={onGetStarted} className="text-muted-foreground hover:text-foreground rounded-full font-medium">
                {t('nav.signIn')}
              </Button>
              <Button size="sm" onClick={onGetStarted} className="bg-gradient-primary hover:shadow-glow rounded-full px-5 gap-1.5 transition-all font-medium">
                {t('nav.getStartedFree')}
                <Rocket className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="flex lg:hidden items-center gap-2">
              <LanguageSelector />
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-[calc(4rem+var(--banner-h,0px))] z-40 bg-background/95 backdrop-blur-xl border-b border-border/30 lg:hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {links.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl text-left transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="border-t border-border/30 mt-2 pt-3 flex gap-2">
                <Button variant="outline" size="sm" onClick={onGetStarted} className="flex-1 rounded-xl">
                  {t('nav.signIn')}
                </Button>
                <Button size="sm" onClick={onGetStarted} className="flex-1 bg-gradient-primary rounded-xl gap-2">
                  <Rocket className="w-4 h-4" />
                  {t('nav.getStarted')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
