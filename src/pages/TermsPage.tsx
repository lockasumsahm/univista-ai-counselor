import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { PageSeo } from "@/components/PageSeo";

const TermsPage = () => (
  <div className="min-h-screen bg-background">
    <PageSeo
      title="Terms of Service — UniVista.AI"
      description="The terms governing your use of UniVista.AI's university counseling, matching, and essay tools."
      path="/terms"
    />
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <Link to="/">
        <Button variant="ghost" size="sm" className="gap-2 mb-6 text-muted-foreground hover:text-foreground rounded-xl">
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </Link>

      <h1 className="text-3xl font-display font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">UniVista.AI is operated by <strong>InkspireHQ</strong> ("InkspireHQ", "we", "us", or "our"). By accessing or using UniVista.AI (the "Service"), you enter into a binding agreement with InkspireHQ and agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
          <p className="text-muted-foreground leading-relaxed">UniVista.AI is an AI-powered university counseling platform that provides admission probability predictions, university matching, essay coaching, scholarship search, and other educational guidance tools. Our service is designed to supplement — not replace — professional academic counseling.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. User Accounts</h2>
          <p className="text-muted-foreground leading-relaxed">You must provide accurate, complete information when creating an account. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account. You must be at least 13 years of age to use this Service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. AI-Generated Content Disclaimer</h2>
          <p className="text-muted-foreground leading-relaxed">UniVista.AI uses artificial intelligence to generate predictions, recommendations, and guidance. These outputs are estimates and should not be considered guarantees of admission, scholarship awards, or any specific outcome. University admissions decisions are made solely by the respective institutions.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. User Content</h2>
          <p className="text-muted-foreground leading-relaxed">You retain ownership of all content you submit (profiles, essays, documents). By using the Service, you grant UniVista.AI a limited license to process your content solely for the purpose of providing the Service. We do not sell, share, or use your content for advertising.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. Prohibited Use</h2>
          <p className="text-muted-foreground leading-relaxed">You agree not to: (a) use the Service for any unlawful purpose; (b) submit false information; (c) attempt to reverse-engineer the AI models; (d) use automated tools to scrape or access the Service; (e) impersonate another person or entity.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">7. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">All content, features, and functionality of UniVista.AI (excluding user-submitted content) are owned by UniVista.AI and protected by international copyright, trademark, and other intellectual property laws.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">8. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">UniVista.AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service, including but not limited to unsuccessful university applications or missed deadlines.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">9. Payments, Subscriptions & Billing</h2>
          <p className="text-muted-foreground leading-relaxed">Paid access is processed through secure third-party payment services. You must provide accurate billing details and a valid payment reference when requested so we can verify access.</p>
          <p className="text-muted-foreground leading-relaxed mt-3">Paid plans may be offered as one-time purchases or recurring subscriptions depending on the product shown at checkout. If a recurring plan is offered, renewal terms, billing cycle, cancellation rights, and applicable taxes will be shown before purchase. Refunds are handled per our <Link to="/refund" className="text-primary hover:underline">Refund Policy</Link>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">10. Termination</h2>
          <p className="text-muted-foreground leading-relaxed">We reserve the right to suspend or terminate your account at any time for material breach of these Terms, non-payment, security or fraud risk, or repeated policy violations. You may delete your account and data at any time through the Settings page.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">11. Changes to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the revised Terms. We will notify users of material changes via email or in-app notification.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">12. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">For questions about these Terms, contact InkspireHQ at <a href="mailto:support@univista.ai" className="text-primary hover:underline">support@univista.ai</a>.</p>
        </section>
      </div>
    </div>
  </div>
);

export default TermsPage;
