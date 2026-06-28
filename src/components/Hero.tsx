import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, GraduationCap, Target, Rocket, ArrowRight, Globe, Brain, Award, ShieldCheck, Lock, Eye, ChevronDown, Users, Star, CheckCircle2, BookOpen, BarChart3, FileText, MessageCircle, Zap } from "lucide-react";
import logo from "@/assets/logo.webp";
import heroBg from "@/assets/hero-campus.webp";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { motion, useInView } from "framer-motion";

// Lazy-load below-the-fold heavy sections to slash initial JS payload & main-thread work
const FAQSection = lazy(() => import("@/components/FAQSection").then(m => ({ default: m.FAQSection })));
const UniversityMarquee = lazy(() => import("@/components/UniversityMarquee").then(m => ({ default: m.UniversityMarquee })));

const SectionFallback = () => <div className="h-32" aria-hidden="true" />;

const AnimatedCounter = ({ end, suffix = "" }: { end: number; suffix?: string; duration?: number }) => {
  // Render the final value on first paint to avoid LCP element-render-delay churn.
  // Lighthouse treats every text mutation as a new LCP candidate, which was pushing
  // the metric out by ~8s while the count-up animation ran.
  return <span>{end.toLocaleString()}{suffix}</span>;
};

export const Hero = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationId: number;
    let cancelled = false;
    const ric: any = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 1));
    const handle = ric(() => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
      // Cache dimensions to avoid forced reflows from reading window.innerWidth/Height each frame
      let cw = window.innerWidth;
      let ch = window.innerHeight * 3;
      let resizeScheduled = false;
      const applyResize = () => {
        cw = window.innerWidth;
        ch = window.innerHeight * 3;
        canvas.width = cw;
        canvas.height = ch;
        resizeScheduled = false;
      };
      const onResize = () => {
        if (resizeScheduled) return;
        resizeScheduled = true;
        requestAnimationFrame(applyResize);
      };
      canvas.width = cw;
      canvas.height = ch;
      window.addEventListener("resize", onResize, { passive: true });
      const isMobile = cw < 768;
      for (let i = 0; i < (isMobile ? 20 : 60); i++) {
        particles.push({ x: Math.random() * cw, y: Math.random() * ch, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, size: Math.random() * 2.5 + 0.5, opacity: Math.random() * 0.3 + 0.05 });
      }
      const animate = () => {
        ctx.clearRect(0, 0, cw, ch);
        particles.forEach((p) => {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x = cw; if (p.x > cw) p.x = 0;
          if (p.y < 0) p.y = ch; if (p.y > ch) p.y = 0;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(100, 130, 200, ${p.opacity})`; ctx.fill();
        });
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x; const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
              ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(100, 130, 200, ${0.04 * (1 - dist / 100)})`; ctx.lineWidth = 0.5; ctx.stroke();
            }
          }
        }
        animationId = requestAnimationFrame(animate);
      };
      animate();
      (window as any).__particleCleanup = () => { cancelAnimationFrame(animationId); window.removeEventListener("resize", onResize); };
    });
    return () => {
      cancelled = true;
      if ((window as any).cancelIdleCallback && handle) (window as any).cancelIdleCallback(handle);
      if ((window as any).__particleCleanup) (window as any).__particleCleanup();
    };
  }, []);

  const HOW_IT_WORKS = [
    { step: "01", icon: FileText, title: t('howItWorks.step1.title'), desc: t('howItWorks.step1.desc') },
    { step: "02", icon: Brain, title: t('howItWorks.step2.title'), desc: t('howItWorks.step2.desc') },
    { step: "03", icon: BarChart3, title: t('howItWorks.step3.title'), desc: t('howItWorks.step3.desc') },
  ];

  const TESTIMONIALS = [
    { name: "Priya S.", country: "India 🇮🇳", uni: "MIT", quote: "UniVista showed me exactly what top schools look for. The personalized roadmap was game-changing!", rating: 5 },
    { name: "Alex M.", country: "Brazil 🇧🇷", uni: "Harvard", quote: "I had no idea how to navigate US admissions. The AI chatbot answered every question about financial aid.", rating: 5 },
    { name: "Wei L.", country: "China 🇨🇳", uni: "Oxford", quote: "The mock interview feature simulated real questions and improved my confidence dramatically.", rating: 5 },
    { name: "Fatima A.", country: "Egypt 🇪🇬", uni: "ETH Zurich", quote: "The scholarship matching found me funding I didn't know existed. Saved me thousands!", rating: 5 },
    { name: "Carlos R.", country: "Mexico 🇲🇽", uni: "Stanford", quote: "The document analyzer caught mistakes in my SOP I would have never noticed. Truly invaluable!", rating: 5 },
    { name: "Yuki T.", country: "Japan 🇯🇵", uni: "Cambridge", quote: "The essay coach helped me write a personal statement that truly represented who I am.", rating: 5 },
    { name: "Sofia K.", country: "Germany 🇩🇪", uni: "TU Munich", quote: "Having all my applications in one dashboard saved me so much time and stress.", rating: 5 },
    { name: "Ahmed H.", country: "Pakistan 🇵🇰", uni: "UCL", quote: "From a small town with zero counseling, UniVista became my personal admissions advisor.", rating: 5 },
  ];

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => { setActiveTestimonial((prev) => (prev + 1) % Math.ceil(TESTIMONIALS.length / 2)); }, 5000);
    return () => clearInterval(timer);
  }, []);

  const TOOLS = [
    { icon: BarChart3, label: t('tools.profileScore'), desc: t('tools.profileScoreDesc') },
    { icon: GraduationCap, label: t('tools.uniMatches'), desc: t('tools.uniMatchesDesc') },
    { icon: Target, label: t('tools.uniChecker'), desc: t('tools.uniCheckerDesc') },
    { icon: BookOpen, label: t('tools.essayCoach'), desc: t('tools.essayCoachDesc') },
    { icon: MessageCircle, label: t('tools.aiCounselor'), desc: t('tools.aiCounselorDesc') },
    { icon: FileText, label: t('tools.docAnalysis'), desc: t('tools.docAnalysisDesc') },
    { icon: Award, label: t('tools.scholarships'), desc: t('tools.scholarshipsDesc') },
    { icon: Users, label: t('tools.mockInterview'), desc: t('tools.mockInterviewDesc') },
  ];

  return (
    <div className="relative overflow-hidden bg-background">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* === HERO SECTION === */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Quiet, layered Apple-like background */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-mesh" aria-hidden="true" />
        <div
          className="absolute inset-0 z-0 pointer-events-none bg-cover bg-center bg-no-repeat opacity-100 dark:opacity-90"
          style={{ backgroundImage: `url(${heroBg})`, filter: 'saturate(1.1) contrast(1.05)' }}
          aria-hidden="true"
        >
          {/* Lighter readability overlay — campus stays vivid; text is shielded by a focused vignette behind copy */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/20 to-background/70" />
          <div className="absolute inset-x-0 top-1/4 h-1/2 bg-[radial-gradient(ellipse_at_center,hsl(var(--background)/0.55),transparent_70%)]" />
        </div>

        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/[0.05] blur-[120px]" />

        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="text-center max-w-5xl mx-auto">
            {/* Trust pill — single, calm */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/40 bg-card/60 backdrop-blur-md mb-8 shadow-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-success/60 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
              </span>
              <span className="text-xs font-medium tracking-wide text-foreground/75">{t('hero.trustedBadge')}</span>
            </div>

            {/* Logo */}
            <div className="relative inline-block mb-8">
              <img
                src={logo}
                alt="UniVista AI - AI University Counseling Platform"
                width={144}
                height={144}
                {...({ fetchpriority: "high" } as any)}
                decoding="async"
                className="relative mx-auto w-20 h-20 md:w-24 md:h-24 object-contain animate-float drop-shadow-[0_8px_32px_rgba(36,80,160,0.18)]"
              />
            </div>

            {/* Headline — tighter hierarchy */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-display font-semibold mb-6 tracking-[-0.045em] leading-[0.98] text-foreground text-balance">
              {t('hero.title1')}{" "}
              <span className="text-muted-foreground/70">{t('hero.title2')}</span>
              <br />
              {t('hero.title3')}
            </h1>

            {/* Single subhead — no duplicated free note */}
            <p className="text-lg md:text-xl text-foreground/65 font-light mb-10 max-w-2xl mx-auto leading-relaxed text-balance">
              {t('hero.subtitle')}
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
              <Button
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-primary hover:shadow-elevated text-base px-8 py-6 rounded-full font-semibold transition-all duration-500 hover:scale-[1.03] group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {t('hero.cta')}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground/80 mb-16 inline-flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-accent" />
              {t('hero.quickStart')}
              <span className="mx-1.5 text-border">·</span>
              <ShieldCheck className="w-3 h-3 text-success" />
              {t('hero.encrypted')}
            </p>

            {/* Quiet stats — divider rhythm, no boxes */}
            <div className="flex flex-wrap items-center justify-center divide-x divide-border/40 max-w-3xl mx-auto rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md shadow-sm">
              {[
                { value: 50, suffix: "+", label: t('hero.statCountries') },
                { value: 15, suffix: "", label: t('hero.statFactors') },
                { value: 500, suffix: "+", label: t('hero.statUniversities') },
                { value: 7, suffix: "", label: t('hero.statLanguages') },
              ].map((stat) => (
                <div key={stat.label} className="flex-1 min-w-[140px] px-6 py-5 text-center">
                  <div className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-foreground">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1 tracking-[0.12em] uppercase">{stat.label}</div>
                </div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="flex justify-center mt-12">
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="text-muted-foreground/40">
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* === STUDENTS GET ACCEPTED AT — moving marquee === */}
      <Suspense fallback={<SectionFallback />}>
        <UniversityMarquee heading="Students get accepted at" />
      </Suspense>

      {/* === HOW IT WORKS === */}
      <section id="how-it-works" className="relative z-10 py-24 px-4 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Badge className="bg-primary/10 text-primary border-0 mb-4 px-4 py-1.5">{t('howItWorks.badge')}</Badge>
            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4">
              {t('howItWorks.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t('howItWorks.subtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={step.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="relative group"
              >
                <div className="bg-card/80 backdrop-blur-xl p-8 rounded-3xl border border-border/30 hover:border-primary/30 transition-all duration-500 hover:shadow-hover hover:-translate-y-1 h-full">
                  <div className="text-6xl font-display font-bold text-primary/10 mb-4">{step.step}</div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform">
                    <step.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-3 tracking-tight text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 text-primary/20">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === MID-PAGE CTA 1 === */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-r from-primary/10 via-card to-accent/10 p-10 rounded-3xl border border-border/30 text-center"
          >
            <h3 className="text-2xl md:text-3xl font-display font-bold mb-3">
              {t('cta1.title')}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">{t('cta1.subtitle')}</p>
            <Button onClick={onGetStarted} size="lg" className="bg-gradient-primary hover:shadow-glow rounded-2xl px-8 py-6 font-semibold group">
              <Rocket className="w-5 h-5 mr-2" /> {t('cta1.button')}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* === TOOLS GRID === */}
      <section id="features" className="relative z-10 py-24 px-4 bg-muted/30 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Badge className="bg-accent/10 text-accent border-0 mb-4 px-4 py-1.5">{t('tools.badge')}</Badge>
            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4">
              {t('tools.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t('tools.subtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {TOOLS.map((tool, i) => (
              <motion.div key={tool.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group bg-card/80 backdrop-blur-sm p-5 sm:p-6 rounded-2xl border border-border/30 hover:border-primary/30 hover:shadow-card transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-primary mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <tool.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">{tool.label}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{tool.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === TESTIMONIALS CAROUSEL === */}
      <section id="testimonials" className="relative z-10 py-24 px-4 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Badge className="bg-success/10 text-success border-0 mb-4 px-4 py-1.5">{t('testimonials.badge')}</Badge>
            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4">
              {t('testimonials.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t('testimonials.subtitle')}</p>
          </motion.div>

          <div className="relative overflow-hidden" aria-live="polite" aria-atomic="true">
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" key={activeTestimonial}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }}
            >
              {TESTIMONIALS.slice(activeTestimonial * 2, activeTestimonial * 2 + 2).map((testimonial) => (
                <div key={testimonial.name} className="bg-card/80 backdrop-blur-sm p-6 rounded-2xl border border-border/30 hover:shadow-card transition-all">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-accent fill-accent" />
                    ))}
                  </div>
                  <p className="text-foreground/90 mb-4 italic leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.country}</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-0">
                      <GraduationCap className="w-3 h-3 mr-1" />
                      {testimonial.uni}
                    </Badge>
                  </div>
                </div>
              ))}
            </motion.div>

            <div className="flex items-center justify-center gap-1 mt-8">
              {Array.from({ length: Math.ceil(TESTIMONIALS.length / 2) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className="inline-flex items-center justify-center w-6 h-6 bg-transparent border-0 p-0 cursor-pointer"
                  aria-label={`Show testimonials ${i * 2 + 1}-${i * 2 + 2}`}
                >
                  <span
                    aria-hidden="true"
                    className={`block h-2.5 rounded-full transition-all ${i === activeTestimonial ? "bg-primary w-6" : "bg-border hover:bg-muted-foreground w-2.5"}`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* === MID-PAGE CTA 2 === */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-r from-accent/10 via-card to-primary/10 p-10 rounded-3xl border border-border/30 text-center"
          >
            <h3 className="text-2xl md:text-3xl font-display font-bold mb-3">
              {t('cta2.title')}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">{t('cta2.subtitle')}</p>
            <Button onClick={onGetStarted} size="lg" className="bg-gradient-primary hover:shadow-glow rounded-2xl px-8 py-6 font-semibold group">
              <Sparkles className="w-5 h-5 mr-2" /> {t('cta2.button')}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* === FREE BANNER (replaces Pricing for now) === */}
      <section id="pricing" className="relative z-10 py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-10 md:p-14 text-center"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
            <div className="relative">
              <Badge className="mb-4 bg-success/15 text-success border-success/30">
                <Sparkles className="w-3.5 h-3.5 mr-1" /> 100% Free Right Now
              </Badge>
              <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4">
                Every feature. <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Free for every student.</span>
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                No credit card. No trial. No paywall. Profile analysis, university matching, essay coach, mock interviews, deadline tracker — all unlocked.
              </p>
              <Button size="lg" onClick={onGetStarted} className="bg-gradient-primary hover:shadow-glow rounded-xl px-8 group">
                <Rocket className="w-5 h-5 mr-2" />
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Suspense fallback={<SectionFallback />}>
        <FAQSection />
      </Suspense>

      {/* === FINAL CTA === */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center bg-gradient-to-br from-primary/10 via-card to-accent/10 p-12 md:p-16 rounded-3xl border border-border/30 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
                {t('ctaFinal.title')}
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-lg">
                {t('ctaFinal.subtitle')}
              </p>
              <Button onClick={onGetStarted} size="lg"
                className="bg-gradient-primary hover:shadow-glow text-lg px-10 py-7 rounded-2xl font-semibold transition-all duration-500 hover:scale-105 group"
              >
                <Rocket className="w-5 h-5 mr-2" />
                {t('ctaFinal.button')}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-success" />{t('ctaFinal.freeForever')}</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-success" />{t('ctaFinal.noCreditCard')}</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-success" />{t('ctaFinal.fiveMinSetup')}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
