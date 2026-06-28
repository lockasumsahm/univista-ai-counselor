import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSeo } from "@/components/PageSeo";
import { FAQSection } from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Sparkles, Rocket, ArrowRight, CheckCircle2 } from "lucide-react";

const FREE_FEATURES = [
  "15-Factor Profile Analysis",
  "Unlimited University Matching",
  "AI Counselor Chat (24/7)",
  "Essay Coach with Revisions",
  "Mock Interview with Honest Feedback",
  "Document Optimizer",
  "Scholarship Database",
  "Deadline & Program Tracker",
  "PDF Export Reports",
];

const PricingPage = () => {
  const navigate = useNavigate();
  const handleGetStarted = () => navigate("/auth");

  return (
    <div className="min-h-screen bg-background">
      <PageSeo
        title="Pricing — UniVista.AI"
        description="Simple, transparent pricing. Start free with full 15-factor analysis, university matching, essay coach, and AI counselor chat."
        path="/pricing"
      />
      <Navbar onGetStarted={handleGetStarted} />

      <section className="relative pt-32 pb-12 px-4 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-3xl mx-auto"
        >
          <Badge className="mb-4 bg-success/15 text-success border-success/30">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> 100% Free Right Now
          </Badge>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-4">
            UniVista is{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              completely free
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every feature is unlocked for every student. No credit card. No trial. No paywall.
          </p>
        </motion.div>
      </section>

      <section className="px-4 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/5 p-8 md:p-12">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="text-center">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-gradient-primary hover:shadow-glow rounded-xl px-8 group"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Sign up takes under a minute. No payment required.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FAQSection />
      <Footer />
    </div>
  );
};

export default PricingPage;
