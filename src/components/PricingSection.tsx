import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Sparkles, Zap, Crown, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePolarCheckout } from "@/hooks/usePolarCheckout";
import { useSubscription } from "@/hooks/useSubscription";
import { Link } from "react-router-dom";

type Cycle = "monthly" | "yearly";

export const PricingSection = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { tier, isActive } = useSubscription();
  const { openCheckout } = usePolarCheckout();
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [pendingPrice, setPendingPrice] = useState<string | null>(null);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);

  const checkoutBlocked = useMemo(() => !acceptedPolicies, [acceptedPolicies]);

  const handleSelect = async (priceId: string | null) => {
    if (!user) return onGetStarted();
    if (!priceId) return; // Free tier
    if (checkoutBlocked) return;
    setPendingPrice(priceId);
    try {
      await openCheckout();
    } finally {
      setPendingPrice(null);
    }
  };

  const PLANS = [
    {
      name: t('pricing.free'),
      monthly: { price: "$0", period: "/forever", priceId: null as string | null },
      yearly: { price: "$0", period: "/forever", priceId: null as string | null },
      icon: Zap,
      desc: t('pricing.freeDesc'),
      tier: "free" as const,
      features: [
        t('pricing.f.profileAnalysis'),
        t('pricing.f.uniMatching10'),
        t('pricing.f.aiChat'),
        t('pricing.f.essayBasic'),
        t('pricing.f.deadlineTracker'),
        t('pricing.f.programTracker'),
      ],
      popular: false,
    },
    {
      name: "Pro",
      monthly: { price: "$17.99", period: "/month", priceId: "pro_monthly_1799" },
      yearly: { price: "$172.70", period: "/year", priceId: "pro_yearly_17270" },
      icon: Sparkles,
      desc: t('pricing.proDesc'),
      tier: "pro" as const,
      features: [
        t('pricing.f.everythingFree'),
        t('pricing.f.unlimitedMatches'),
        t('pricing.f.advancedEssay'),
        t('pricing.f.mockInterview'),
        t('pricing.f.docOptimizer'),
        t('pricing.f.scholarshipMatcher'),
        t('pricing.f.priorityAI'),
        t('pricing.f.pdfExport'),
      ],
      popular: true,
    },
    {
      name: "Premium",
      monthly: { price: "$35.99", period: "/month", priceId: "premium_monthly_3599" },
      yearly: { price: "$345.50", period: "/year", priceId: "premium_yearly_34550" },
      icon: Crown,
      desc: t('pricing.premiumDesc'),
      tier: "premium" as const,
      features: [
        t('pricing.f.everythingPro'),
        t('pricing.f.unlimitedAI'),
        t('pricing.f.mentorMatching'),
        t('pricing.f.financialAid'),
        t('pricing.f.timeline'),
        t('pricing.f.benchmarking'),
        t('pricing.f.prioritySupport'),
        t('pricing.f.recLetters'),
      ],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="relative z-10 py-24 px-4 bg-muted/30 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">{t('pricing.badge')}</div>
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4">
            {t('pricing.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t('pricing.subtitle')}</p>
        </motion.div>

        {/* Billing cycle toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-card/80 backdrop-blur-xl border border-border/40 rounded-full p-1">
            <button
              onClick={() => setCycle("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${cycle === "monthly" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setCycle("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${cycle === "yearly" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
            >
              Yearly
              <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {PLANS.map((plan, i) => {
            const priceData = cycle === "monthly" ? plan.monthly : plan.yearly;
            const isCurrent = isActive && tier === plan.tier;
            const isLoading = !!pendingPrice && pendingPrice === priceData.priceId;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className={`group relative rounded-3xl p-8 flex flex-col transition-all duration-500 ${
                  plan.popular
                    ? "bg-card shadow-elevated md:scale-[1.04] md:-translate-y-1 gradient-border ring-1 ring-primary/10"
                    : "bg-card/70 backdrop-blur-xl border border-border/40 shadow-card hover:shadow-hover hover:-translate-y-0.5"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-primary text-primary-foreground text-[10px] font-semibold tracking-[0.14em] uppercase shadow-glow">
                    {t('pricing.mostPopular')}
                  </div>
                )}

                <div className="mb-6">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                    plan.popular
                      ? "bg-gradient-primary text-primary-foreground shadow-glow"
                      : "bg-muted/60 text-foreground/70"
                  }`}>
                    <plan.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-display font-semibold tracking-tight">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{plan.desc}</p>
                </div>

                <div className="mb-6 pb-6 border-b border-border/40">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl font-display font-semibold tracking-[-0.03em]">{priceData.price}</span>
                    <span className="text-muted-foreground text-sm">{priceData.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${plan.popular ? "text-primary" : "text-success/80"}`} />
                      <span className="text-foreground/85 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelect(priceData.priceId)}
                  disabled={isCurrent || isLoading || (!!priceData.priceId && checkoutBlocked)}
                  className={`w-full h-12 rounded-2xl font-semibold transition-all ${
                    plan.popular ? "bg-gradient-primary hover:shadow-elevated hover:scale-[1.02]" : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading…</> :
                    isCurrent ? "Current plan" :
                    plan.tier === "free" ? (user ? "Your free plan" : t('pricing.freeCta')) :
                    `Get ${plan.name}`}
                </Button>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 max-w-3xl mx-auto rounded-2xl border border-border/50 bg-card/60 p-4 md:p-5">
          <div className="flex items-start gap-3">
            <Checkbox
              id="accept-policies"
              checked={acceptedPolicies}
              onCheckedChange={(checked) => setAcceptedPolicies(checked === true)}
              className="mt-0.5"
            />
            <div className="space-y-1.5">
              <Label htmlFor="accept-policies" className="text-sm leading-6 text-foreground">
                I understand the plan, billing cycle, and auto-renewal, and I agree to the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/refund" className="text-primary hover:underline">Refund Policy</Link> before purchase.
              </Label>
              <p className="text-sm text-muted-foreground">
                Paid plans renew automatically until canceled. You can cancel anytime before renewal from your account settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
