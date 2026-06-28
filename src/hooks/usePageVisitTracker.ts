import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// In-memory dedupe so we only hit the network once per (user, route) per session.
const sessionVisited = new Set<string>();

/** Event name fired whenever a new (user, route) visit is recorded this session. */
export const PAGE_VISIT_EVENT = "univista:page-visited";

function broadcast(route: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PAGE_VISIT_EVENT, { detail: { route } }));
}

/**
 * Records that the current user has opened the current route.
 * Call once high in the dashboard tree (DashboardLayout).
 */
export function usePageVisitTracker(): void {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!user?.id) return;
    const route = location.pathname;
    const key = `${user.id}::${route}`;
    if (sessionVisited.has(key)) return;
    sessionVisited.add(key);
    broadcast(route);

    // Fire-and-forget; never block the UI.
    void supabase
      .from("page_visits")
      .upsert(
        { user_id: user.id, route, visited_at: new Date().toISOString() },
        { onConflict: "user_id,route" },
      )
      .then(({ error }) => {
        if (error) sessionVisited.delete(key); // allow retry next nav
      });
  }, [user?.id, location.pathname]);
}

/** Imperatively mark a route as seen (used by NotificationCenter on click-through). */
export async function markRouteSeen(userId: string, route: string): Promise<void> {
  if (!userId || !route) return;
  const key = `${userId}::${route}`;
  if (sessionVisited.has(key)) return;
  sessionVisited.add(key);
  broadcast(route);
  await supabase
    .from("page_visits")
    .upsert(
      { user_id: userId, route, visited_at: new Date().toISOString() },
      { onConflict: "user_id,route" },
    );
}
