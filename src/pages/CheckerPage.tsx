import { Suspense, lazy } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useDocumentAnalyses } from "@/hooks/useDocumentAnalyses";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { PremiumPassLock } from "@/components/PremiumPassLock";
import { CheckCircle2 } from "lucide-react";

const UniversityChecker = lazy(() => import("@/components/UniversityChecker"));

const CheckerPage = () => {
  const { profile } = useProfile();
  const { analyses } = useDocumentAnalyses();

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        eyebrow="Admissions"
        title="University Checker"
        subtitle="Run a deep admissions report on any university and see your real chances against verified admit data."
        icon={CheckCircle2}
      />
      <PremiumPassLock featureName="University Checker" description="Deep admissions report for any university — included in the one-time $20 Premium Pass.">
        <ErrorBoundary>
          <Suspense fallback={<div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32 w-full rounded-2xl" /></div>}>
            <UniversityChecker profile={profile as any} documentAnalyses={analyses} />
          </Suspense>
        </ErrorBoundary>
      </PremiumPassLock>
    </div>
  );
};

export default CheckerPage;
