import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { lazy, Suspense } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CookieBanner } from "@/components/CookieBanner";

import Index from "./pages/Index";
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const RefundPage = lazy(() => import("./pages/RefundPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ProfileHistoryPage = lazy(() => import("./pages/ProfileHistoryPage"));
const ResultsPage = lazy(() => import("./pages/ResultsPage"));
const UniversityMatchPage = lazy(() => import("./pages/UniversityMatchPage"));
const CheckerPage = lazy(() => import("./pages/CheckerPage"));
const GenericFeaturePage = lazy(() => import("./pages/GenericFeaturePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const MethodologyPage = lazy(() => import("./pages/MethodologyPage"));
const ActionCenterPage = lazy(() => import("./pages/ActionCenterPage"));
const AdmitIQPage = lazy(() => import("./pages/AdmitIQPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const AIDiagnosticsPage = lazy(() => import("./pages/AIDiagnosticsPage"));
const AdminGate = lazy(() => import("./components/admin/AdminGate").then(m => ({ default: m.AdminGate })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const LoadingSpinner = () => (
  <div role="status" aria-live="polite" aria-busy="true" className="flex items-center justify-center py-20">
    <div className="relative w-16 h-16" aria-hidden="true">
      <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
    <span className="sr-only">Loading…</span>
  </div>
);

import { DashboardRouteSkeleton } from "@/components/DashboardRouteSkeleton";
const RouteFallback = () => <DashboardRouteSkeleton />;

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <ErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Suspense fallback={<RouteFallback />}><Auth /></Suspense>} />
              <Route path="/reset-password" element={<Suspense fallback={<RouteFallback />}><ResetPassword /></Suspense>} />
              <Route path="/terms" element={<Suspense fallback={<RouteFallback />}><TermsPage /></Suspense>} />
              <Route path="/privacy" element={<Suspense fallback={<RouteFallback />}><PrivacyPage /></Suspense>} />
              <Route path="/refund" element={<Suspense fallback={<RouteFallback />}><RefundPage /></Suspense>} />
              <Route path="/pricing" element={<Suspense fallback={<RouteFallback />}><PricingPage /></Suspense>} />
              <Route path="/checkout/success" element={<Suspense fallback={<RouteFallback />}><CheckoutSuccess /></Suspense>} />
              <Route path="/dashboard" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><Dashboard /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/admitiq" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><AdmitIQPage /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/action-center" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><ActionCenterPage /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/profile" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><ProfilePage /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/profile/history" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><ProfileHistoryPage /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/results" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><ResultsPage /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/matches" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><UniversityMatchPage /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/checker" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><CheckerPage /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/compare" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><GenericFeaturePage feature="compare" title="University Comparison" /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/documents" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><GenericFeaturePage feature="documents" title="Documents" /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/roadmap" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><GenericFeaturePage feature="roadmap" title="Roadmap" /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/deadlines" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><GenericFeaturePage feature="deadlines" title="Deadline Tracker" /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/scholarships" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><GenericFeaturePage feature="scholarships" title="Scholarships" /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/essay-coach" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><GenericFeaturePage feature="essay-coach" title="Essay Coach" /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/essay-upload" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><GenericFeaturePage feature="essay-upload" title="Essay AI" /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/interview" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><GenericFeaturePage feature="interview" title="Mock Interview" /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/doc-optimizer" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><GenericFeaturePage feature="doc-optimizer" title="Document Optimizer" /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/chat" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><GenericFeaturePage feature="chat" title="AI Counselor Chat" /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/community" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><GenericFeaturePage feature="community" title="Community" /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/progress" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><GenericFeaturePage feature="progress" title="Application Progress" /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/programs" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><GenericFeaturePage feature="programs" title="Program Tracker" /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/visa-guide" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><GenericFeaturePage feature="visa-guide" title="Visa & Immigration Guide" /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/fitmatrix" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><GenericFeaturePage feature="fitmatrix" title="FitMatrix™" /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/export" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><GenericFeaturePage feature="export" title="Export Reports" /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/feedback" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><GenericFeaturePage feature="feedback" title="Give Feedback" /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><SettingsPage /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/methodology" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><MethodologyPage /></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/admin" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><AdminGate><AdminPage /></AdminGate></Suspense></ProtectedRoute>} />
              <Route path="/dashboard/admin/ai-diagnostics" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><AdminGate><AIDiagnosticsPage /></AdminGate></Suspense></ProtectedRoute>} />
              <Route path="*" element={<Suspense fallback={<RouteFallback />}><NotFound /></Suspense>} />
            </Routes>
          </BrowserRouter>
          <CookieBanner />
          </ErrorBoundary>

        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
