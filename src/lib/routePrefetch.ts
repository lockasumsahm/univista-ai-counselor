// Hover/focus prefetching for dashboard routes — calls the lazy import once
// so the chunk is in cache by the time the user clicks.
type Importer = () => Promise<unknown>;

const ROUTE_IMPORTERS: Record<string, Importer> = {
  "/dashboard": () => import("@/pages/Dashboard"),
  "/dashboard/profile": () => import("@/pages/ProfilePage"),
  "/dashboard/results": () => import("@/pages/ResultsPage"),
  "/dashboard/matches": () => import("@/pages/UniversityMatchPage"),
  "/dashboard/checker": () => import("@/pages/CheckerPage"),
  "/dashboard/settings": () => import("@/pages/SettingsPage"),
  "/dashboard/admin": () => import("@/pages/AdminPage"),
  "/dashboard/action-center": () => import("@/pages/ActionCenterPage"),
  // Generic feature pages share a single chunk
  "/dashboard/__generic__": () => import("@/pages/GenericFeaturePage"),
};

const fired = new Set<string>();

export function prefetchRoute(path: string): void {
  if (fired.has(path)) return;
  fired.add(path);
  const importer = ROUTE_IMPORTERS[path] ?? ROUTE_IMPORTERS["/dashboard/__generic__"];
  // Fire-and-forget. Errors here aren't user-visible.
  importer?.().catch(() => {
    fired.delete(path); // allow retry on next hover
  });
}
