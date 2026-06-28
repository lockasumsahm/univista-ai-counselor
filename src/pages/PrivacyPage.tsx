import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { PageSeo } from "@/components/PageSeo";

const PrivacyPage = () => (
  <div className="min-h-screen bg-background">
    <PageSeo
      title="Privacy Policy — UniVista.AI"
      description="How UniVista.AI collects, stores, and protects your personal and academic data, including your rights and controls."
      path="/privacy"
    />
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <Link to="/">
        <Button variant="ghost" size="sm" className="gap-2 mb-6 text-muted-foreground hover:text-foreground rounded-xl">
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </Link>

      <h1 className="text-3xl font-display font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

      <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
        <section>
          <h2 className="text-xl font-semibold text-foreground">Who We Are</h2>
          <p className="text-muted-foreground leading-relaxed">UniVista.AI is operated by <strong>InkspireHQ</strong> ("InkspireHQ", "we", "us", or "our"). InkspireHQ is the <strong>data controller</strong> responsible for the personal data processed through the Service. For privacy questions, contact <a href="mailto:support@univista.ai" className="text-primary hover:underline">support@univista.ai</a>.</p>
        </section>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">We collect information you provide directly: name, email, academic records (GPA, test scores), extracurricular activities, essays, uploaded documents (CVs, transcripts, recommendation letters), and university preferences. We also collect usage data such as pages visited, features used, and interaction patterns to improve the Service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed">Your data is used to: (a) provide AI-powered university counseling and predictions; (b) personalize your experience and recommendations; (c) improve our AI models and Service quality; (d) send important notifications about deadlines and application updates; (e) respond to your support requests.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. AI Data Processing</h2>
          <p className="text-muted-foreground leading-relaxed">Your profile and documents are processed by AI models to generate admission predictions, essay feedback, and university matches. This processing is essential to providing the Service. AI-generated outputs are not stored permanently beyond your session unless you explicitly save them. We do not use your personal data to train third-party AI models.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">We implement industry-standard security measures including 256-bit TLS encryption for data in transit, encrypted storage at rest, and role-based access controls. Your data is stored on secure, SOC 2 compliant infrastructure. We conduct regular security audits to maintain the highest protection standards.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. Legal Basis for Processing (GDPR)</h2>
          <p className="text-muted-foreground leading-relaxed">For users in the UK and EEA, we rely on the following legal bases under Article 6 of the GDPR: (a) <strong>Performance of a contract</strong> — to create your account, deliver the Service, and process subscription payments; (b) <strong>Legitimate interests</strong> — to improve the Service, prevent fraud and abuse, and ensure security (balanced against your rights); (c) <strong>Consent</strong> — for optional marketing communications and non-essential cookies, which you may withdraw at any time; (d) <strong>Legal obligation</strong> — to comply with tax, accounting, and other applicable laws.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. Data Sharing</h2>
          <p className="text-muted-foreground leading-relaxed">We do not sell or rent your personal data. We share data only with the following categories of recipients:</p>
          <ul className="text-muted-foreground leading-relaxed list-disc pl-6 mt-2 space-y-1">
            <li><strong>Service providers / subprocessors</strong> — hosting, database, and AI processing infrastructure essential to operating the Service.</li>
            <li><strong>Payment processors</strong> — secure third-party payment services may process your name, email, billing details, payment method details, IP address, and transaction data to handle checkout, payment verification, tax compliance, invoicing, fraud prevention, and refund/customer-service inquiries.</li>
            <li><strong>Professional advisers</strong> — legal, accounting, and audit professionals where necessary.</li>
            <li><strong>Authorities</strong> — law enforcement or regulators where required by law or to protect our rights and users' safety.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. Your Rights (GDPR & Global)</h2>
          <p className="text-muted-foreground leading-relaxed">You have the right to: (a) access all data we hold about you; (b) export your data in a portable format (available in Settings → Data Export); (c) request correction of inaccurate data; (d) request deletion of your account and all associated data; (e) withdraw consent for data processing at any time. To exercise these rights, use the in-app settings or contact us at support@univista.ai.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">7. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">We retain your data for as long as your account is active. When you delete your account, all personal data is permanently removed within 30 days. Anonymous, aggregated data may be retained for analytical purposes.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">8. Cookies & Analytics</h2>
          <p className="text-muted-foreground leading-relaxed">We use essential cookies for authentication and session management. We may use anonymous analytics to understand usage patterns and improve the Service. You can control cookie preferences through your browser settings.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">9. Children's Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">UniVista.AI is not intended for children under 13. We do not knowingly collect personal data from children under 13. If we become aware that we have collected data from a child under 13, we will delete it promptly.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">10. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">We may update this Privacy Policy periodically. We will notify you of significant changes via email or in-app notification. Continued use of the Service after changes constitutes acceptance.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">11. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">For privacy-related inquiries, contact our Data Protection team at <a href="mailto:support@univista.ai" className="text-primary hover:underline">support@univista.ai</a>.</p>
        </section>
      </div>
    </div>
  </div>
);

export default PrivacyPage;
