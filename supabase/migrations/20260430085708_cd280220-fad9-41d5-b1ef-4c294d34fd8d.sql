CREATE TABLE IF NOT EXISTS public.page_visits (
  user_id uuid NOT NULL,
  route text NOT NULL,
  visited_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, route)
);

ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users select own visits" ON public.page_visits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own visits" ON public.page_visits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own visits" ON public.page_visits
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users delete own visits" ON public.page_visits
  FOR DELETE USING (auth.uid() = user_id);