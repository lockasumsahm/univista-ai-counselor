import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Mail, ShieldCheck } from "lucide-react";
import { PageSeo } from "@/components/PageSeo";

const RefundPage = () => {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <PageSeo
        title="Refund Policy — UniVista.AI"
        description="UniVista.AI's fair-billing and refund process, including how to request a review and what's eligible."
        path="/refund"
      />
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">Refund Policy</h1>
          <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>

        <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-6 mb-8 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            UniVista.AI is committed to fair and transparent billing. We verify paid access carefully and review refund
            requests through our support process.
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-display font-bold mb-3">1. 14-Day Money-Back Guarantee</h2>
            <p className="text-muted-foreground leading-relaxed">
              We offer a <strong className="text-foreground">14-day money-back guarantee</strong> on all paid
              subscriptions (Pro and Premium). If you are not satisfied with UniVista.AI within 14 days of your initial
              purchase, you are entitled to a full refund of your subscription fee — no questions asked.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-3">2. Subscription Cancellations</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You may cancel your subscription at any time from the <strong className="text-foreground">Settings</strong>{" "}
              page or via the customer portal. Upon cancellation:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Your subscription remains <strong className="text-foreground">active until the end of the current billing period</strong>.</li>
              <li>You will not be charged again after cancellation.</li>
              <li>Cancelling does not automatically issue a refund for the current period.</li>
              <li>You retain full access to all paid features until the period expires.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-3">3. Refund Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              As a digital SaaS product, refunds are granted under the following specific conditions:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Within 14 days</strong> of the initial subscription purchase (full refund, no reason required).</li>
              <li><strong className="text-foreground">Duplicate charges</strong> due to technical errors.</li>
              <li><strong className="text-foreground">Unauthorized transactions</strong> (please contact us immediately).</li>
              <li><strong className="text-foreground">Service unavailability</strong> caused by prolonged technical issues on our end.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-3">4. Non-Refundable Situations</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The following situations are generally <strong className="text-foreground">not eligible</strong> for a refund:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Refund requests made <strong className="text-foreground">more than 14 days</strong> after purchase.</li>
              <li>Subscription renewals (you may cancel before renewal to avoid charges).</li>
              <li>Partial month/year usage of a subscription period.</li>
              <li>Dissatisfaction with university match outcomes — UniVista.AI provides AI-generated guidance and does not guarantee admissions decisions.</li>
              <li>Failure to use the service during the subscription period.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-3">5. Annual Subscriptions</h2>
            <p className="text-muted-foreground leading-relaxed">
              Annual plans are also covered by the 14-day money-back guarantee from the date of initial purchase.
              After 14 days, annual subscriptions are non-refundable, but you may cancel auto-renewal at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-3">6. How to Request a Refund</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              To request a refund:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-3">
              <li>
                Email our support team at{" "}
                <a href="mailto:support@univista.ai" className="text-primary hover:underline font-medium">
                  support@univista.ai
                </a>{" "}
                with your transaction details.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Please include your order ID, the email used for purchase, and a brief reason. Refunds are typically
              processed within <strong className="text-foreground">5–10 business days</strong> back to your original
              payment method.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-3">7. Free Plan</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Free plan does not involve any charges, so refunds do not apply. You can upgrade or downgrade between
              plans at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-3">8. Chargebacks</h2>
            <p className="text-muted-foreground leading-relaxed">
              We strongly encourage you to contact us before initiating a chargeback with your bank. Most issues can be
              resolved quickly through our support team. Disputed chargebacks may result in immediate account suspension.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-3">9. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Refund Policy from time to time. Material changes will be communicated via email or an
              in-app notification. The “Last updated” date at the top reflects the most recent revision.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-3">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For any refund-related questions, reach out to us:
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/20">
              <Mail className="w-4 h-4 text-primary" />
              <a href="mailto:support@univista.ai" className="text-primary font-medium hover:underline">
                support@univista.ai
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPage;
