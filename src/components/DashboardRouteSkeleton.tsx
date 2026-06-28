import { Skeleton } from "@/components/ui/skeleton";

/**
 * Lightweight placeholder shown during route-level Suspense.
 * Eliminates the blank-flash between dashboard pages.
 */
export const DashboardRouteSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center gap-4">
      <Skeleton className="w-14 h-14 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-7 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-32 w-full rounded-xl" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
  </div>
);

export default DashboardRouteSkeleton;
