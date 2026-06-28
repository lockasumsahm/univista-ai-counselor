CREATE TABLE public.profile_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  resume_file_name TEXT,
  resume_text TEXT,
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_profile_versions_user_created
  ON public.profile_versions (user_id, created_at DESC);

ALTER TABLE public.profile_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile versions"
  ON public.profile_versions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own profile versions"
  ON public.profile_versions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own profile versions"
  ON public.profile_versions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all profile versions"
  ON public.profile_versions FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));