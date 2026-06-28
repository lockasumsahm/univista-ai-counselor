import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";
import { useDocumentAnalyses } from "@/hooks/useDocumentAnalyses";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PremiumGate } from "@/components/PremiumGate";
import { PremiumPassLock } from "@/components/PremiumPassLock";

const TabFallback = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-32 w-full rounded-2xl" />
    <Skeleton className="h-24 w-full rounded-2xl" />
  </div>
);

const Roadmap = lazy(() => import("@/components/Roadmap").then(m => ({ default: m.Roadmap })));
const EssayScholarship = lazy(() => import("@/components/EssayScholarship").then(m => ({ default: m.EssayScholarship })));
const Chatbot = lazy(() => import("@/components/Chatbot").then(m => ({ default: m.Chatbot })));
const DashboardCharts = lazy(() => import("@/components/DashboardCharts").then(m => ({ default: m.DashboardCharts })));
const EssayUpload = lazy(() => import("@/components/EssayUpload").then(m => ({ default: m.EssayUpload })));
const DeadlineTracker = lazy(() => import("@/components/DeadlineTracker").then(m => ({ default: m.DeadlineTracker })));
const MockInterview = lazy(() => import("@/components/MockInterview").then(m => ({ default: m.MockInterview })));
const Community = lazy(() => import("@/components/Community").then(m => ({ default: m.Community })));
const ScholarshipDatabase = lazy(() => import("@/components/ScholarshipDatabase").then(m => ({ default: m.ScholarshipDatabase })));
const DocumentOptimizer = lazy(() => import("@/components/DocumentOptimizer").then(m => ({ default: m.DocumentOptimizer })));
const UniversityComparison = lazy(() => import("@/components/UniversityComparison").then(m => ({ default: m.UniversityComparison })));
const EssayCoach = lazy(() => import("@/components/EssayCoach").then(m => ({ default: m.EssayCoach })));
const ApplicationProgress = lazy(() => import("@/components/ApplicationProgress").then(m => ({ default: m.ApplicationProgress })));
const ProgramTracker = lazy(() => import("@/components/ProgramTracker").then(m => ({ default: m.ProgramTracker })));
const DocumentUploader = lazy(() => import("@/components/DocumentUploader").then(m => ({ default: m.DocumentUploader })));
const VisaGuide = lazy(() => import("@/components/VisaGuide").then(m => ({ default: m.VisaGuide })));
const FitMatrix = lazy(() => import("@/components/FitMatrix").then(m => ({ default: m.FitMatrix })));
const PDFExport = lazy(() => import("@/components/PDFExport").then(m => ({ default: m.PDFExport })));
const FeedbackSurvey = lazy(() => import("@/components/FeedbackSurvey").then(m => ({ default: m.FeedbackSurvey })));

interface FeaturePageProps {
  feature: string;
  title: string;
}

const GenericFeaturePage = ({ feature, title }: FeaturePageProps) => {
  const { profile } = useProfile();
  const { analyses, updateAnalyses } = useDocumentAnalyses();

  const renderFeature = () => {
    switch (feature) {
      case "compare": return <UniversityComparison profile={profile} />;
      case "documents": return <DocumentUploader profile={profile} onAnalysisUpdate={updateAnalyses} />;
      case "roadmap": return <Roadmap />;
      case "deadlines": return <DeadlineTracker />;
      case "scholarships": return (
        <PremiumPassLock featureName="Scholarships Database" description="Explore curated full-ride and partial scholarships matched to your profile — part of the one-time $20 Premium Pass.">
          <ScholarshipDatabase profile={profile} />
        </PremiumPassLock>
      );
      case "essay-coach": return (
        <PremiumPassLock featureName="AI Essay Coach" description="Line-by-line rewrites, 8-dimension scoring, and admissions-officer feedback on your personal statement — included in the one-time $20 Premium Pass.">
          <EssayCoach />
        </PremiumPassLock>
      );
      case "essay-upload": return (
        <PremiumPassLock featureName="Essay Review & Upload" description="Upload any draft and get instant AI feedback on hook, structure, voice, and impact — part of the one-time $20 Premium Pass.">
          <EssayUpload profile={profile} />
        </PremiumPassLock>
      );
      case "interview": return (
        <PremiumPassLock featureName="Live AI Interview" description="Voice-based mock interviews with AI admissions officers. Part of the AdmitIQ Premium Pass.">
          <MockInterview profile={profile} />
        </PremiumPassLock>
      );
      case "doc-optimizer": return <DocumentOptimizer profile={profile} />;
      case "chat": return <Chatbot profile={profile} />;
      case "community": return <Community />;
      case "progress": return <ApplicationProgress />;
      case "programs": return <ProgramTracker />;
      case "visa-guide": return (
        <PremiumPassLock featureName="Visa & Immigration Guide" description="Step-by-step F-1, Tier 4, and study-permit playbooks for 6 destination countries with AI Q&A — included in the one-time $20 Premium Pass.">
          <VisaGuide />
        </PremiumPassLock>
      );
      case "fitmatrix": return <FitMatrix />;
      case "export": return <PDFExport />;
      case "feedback": return <FeedbackSurvey />;
      default: return <p className="text-muted-foreground">Feature not found.</p>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Breadcrumbs items={[{ label: title }]} />
        <h1 className="text-2xl font-display font-bold mb-6">{title}</h1>
        <ErrorBoundary>
          <Suspense fallback={<TabFallback />}>
            {renderFeature()}
          </Suspense>
        </ErrorBoundary>
      </motion.div>
    </div>
  );
};

export default GenericFeaturePage;
