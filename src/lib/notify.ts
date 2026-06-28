// Lightweight helper to drop a persistent notification row.
// Toasts handle the immediate UX; this row makes it visible in the bell + history.
import { supabase } from "@/integrations/supabase/client";

export type NotifyType = "info" | "success" | "warning" | "error";

interface NotifyPayload {
  title: string;
  message?: string;
  link?: string;
  type?: NotifyType;
  /**
   * If supplied, while there's already an UNREAD notification for this user
   * with the same dedupeKey, we update that row instead of inserting a new one.
   * Once the user reads it, the next call inserts a fresh row.
   */
  dedupeKey?: string;
  /**
   * If supplied, skip inserting/updating entirely when the student has already
   * visited this route — they've seen the page, no need to nag again.
   */
  suppressIfVisited?: string;
  /**
   * When true, NEVER insert a new row if any notification with the same
   * dedupe_key already exists for this user (read or unread). Use this for
   * notices that should fire at most once per user, regardless of payload.
   */
  once?: boolean;
}

export async function pushNotification(
  userId: string | null | undefined,
  payload: NotifyPayload,
): Promise<void> {
  if (!userId) return;

  // Page-seen suppression: once they've opened the destination, never re-nag.
  if (payload.suppressIfVisited) {
    try {
      const { data: visit } = await supabase
        .from("page_visits")
        .select("route")
        .eq("user_id", userId)
        .eq("route", payload.suppressIfVisited)
        .maybeSingle();
      if (visit) return;
    } catch {
      // If the visits table check fails, fall through to normal insert.
    }
  }

  const row = {
    user_id: userId,
    title: payload.title,
    message: payload.message ?? "",
    link: payload.link ?? null,
    type: payload.type ?? "info",
    dedupe_key: payload.dedupeKey ?? null,
  };

  try {
    if (payload.dedupeKey) {
      // "once": if ANY row exists for this dedupe_key, skip entirely.
      if (payload.once) {
        const { data: ever } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", userId)
          .eq("dedupe_key", payload.dedupeKey)
          .limit(1)
          .maybeSingle();
        if (ever?.id) return;
      }

      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", userId)
        .eq("dedupe_key", payload.dedupeKey)
        .eq("read", false)
        .maybeSingle();

      if (existing?.id) {
        await supabase
          .from("notifications")
          .update({
            title: row.title,
            message: row.message,
            link: row.link,
            type: row.type,
            created_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        return;
      }
    }

    const { error } = await supabase.from("notifications").insert(row);
    if (error && (error as any).code === "23505" && payload.dedupeKey) {
      await supabase
        .from("notifications")
        .update({
          title: row.title,
          message: row.message,
          link: row.link,
          type: row.type,
          created_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("dedupe_key", payload.dedupeKey)
        .eq("read", false);
    }
  } catch (err) {
    console.warn("[notify] failed to upsert notification", err);
  }
}
