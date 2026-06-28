ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS dedupe_key text;
CREATE UNIQUE INDEX IF NOT EXISTS notifications_dedupe_unread
  ON public.notifications(user_id, dedupe_key)
  WHERE read = false AND dedupe_key IS NOT NULL;