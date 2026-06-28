import { ShieldCheck, Globe, Heart, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.webp";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { t } = useLanguage();
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-border/40 bg-gradient-to-b from-background to-muted/30">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src={logo} alt="UniVista.AI" className="w-8 h-8 object-contain" />
              <span className="font-display font-semibold text-lg tracking-tight">
                <span className="text-foreground">UniVista</span>
                <span className="text-accent">.ai</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-xs">
              {t('footer.description')}
            </p>
            <a
              href="mailto:support@univista.ai"
              aria-label="Email support"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-3.5 h-3.5" aria-hidden="true" />
              support@univista.ai
            </a>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4 text-xs tracking-[0.14em] uppercase text-muted-foreground">{t('footer.product')}</h3>
            <ul className="space-y-2.5">
              {[
                { label: t('tools.profileScore') },
                { label: t('tools.uniMatches') },
                { label: t('tools.essayCoach') },
                { label: t('tools.aiCounselor') },
              ].map((item) => (
                <li key={item.label}>
                  <button onClick={() => scrollTo("features")} className="text-sm text-foreground/75 hover:text-foreground transition-colors">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-xs tracking-[0.14em] uppercase text-muted-foreground">{t('footer.company')}</h3>
            <ul className="space-y-2.5">
              {[
                { label: t('nav.howItWorks'), id: "how-it-works" },
                { label: t('nav.faq'), id: "faq" },
                { label: t('nav.testimonials'), id: "testimonials" },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollTo(item.id)}
                    className="text-sm text-foreground/75 hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-xs tracking-[0.14em] uppercase text-muted-foreground">{t('footer.trustSecurity')}</h3>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-sm text-foreground/75">
                <ShieldCheck className="w-3.5 h-3.5 text-success" />
                {t('footer.encrypted')}
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground/75">
                <Globe className="w-3.5 h-3.5 text-primary" />
                {t('footer.countriesSupported')}
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground/75">
                <Heart className="w-3.5 h-3.5 text-destructive" />
                {t('footer.madeForStudents')}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} UniVista.ai · {t('footer.allRights')}
          </p>
          <div className="flex items-center gap-5 text-xs text-muted-foreground flex-wrap justify-center">
            <Link to="/terms" className="hover:text-foreground transition-colors">{t('footer.terms')}</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">{t('footer.privacy')}</Link>
            <Link to="/refund" className="hover:text-foreground transition-colors">Refund</Link>
            <a href="mailto:support@univista.ai" className="hover:text-foreground transition-colors">{t('footer.contact')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
