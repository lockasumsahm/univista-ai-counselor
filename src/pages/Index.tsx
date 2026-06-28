import { useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { PageSeo } from "@/components/PageSeo";

const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleGetStarted = () => {
    navigate("/auth");
  };

  // Render landing page immediately for fast LCP. Authenticated users will be redirected by the effect above.
  return (
    <div className="relative animate-fade-in">
      <PageSeo
        title="UniVista.AI — Free AI University Counselor"
        description="Free AI university counselor with admission predictions, personalized matches, essay coaching, and scholarship search across 500+ universities."
        path="/"
      />
      <PaymentTestModeBanner />
      <Navbar onGetStarted={handleGetStarted} />
      <main>
        <Hero onGetStarted={handleGetStarted} />
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
