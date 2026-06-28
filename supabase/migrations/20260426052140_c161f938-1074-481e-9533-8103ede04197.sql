-- 1. Role enum + user_roles table
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages roles" ON public.user_roles;
CREATE POLICY "Service role manages roles"
  ON public.user_roles FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 2. is_admin() security definer (no RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  );
$$;

-- 3. Admin access audit log
CREATE TABLE IF NOT EXISTS public.admin_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  target_user_id uuid,
  table_accessed text NOT NULL,
  action text NOT NULL DEFAULT 'view',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  accessed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_access_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view access log" ON public.admin_access_log;
CREATE POLICY "Admins view access log"
  ON public.admin_access_log FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Service role writes log" ON public.admin_access_log;
CREATE POLICY "Service role writes log"
  ON public.admin_access_log FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- 4. Interview sessions
CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_school text NOT NULL DEFAULT 'Generic',
  persona text NOT NULL DEFAULT 'generic',
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  readiness_score integer NOT NULL DEFAULT 0,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own interviews" ON public.interview_sessions;
CREATE POLICY "Users view own interviews"
  ON public.interview_sessions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users insert own interviews" ON public.interview_sessions;
CREATE POLICY "Users insert own interviews"
  ON public.interview_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own interviews" ON public.interview_sessions;
CREATE POLICY "Users update own interviews"
  ON public.interview_sessions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own interviews" ON public.interview_sessions;
CREATE POLICY "Users delete own interviews"
  ON public.interview_sessions FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_interview_sessions_updated_at
  BEFORE UPDATE ON public.interview_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Add admin read-only policies to user-data tables (keep existing user policies intact)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all factor_scores" ON public.factor_scores;
CREATE POLICY "Admins can view all factor_scores"
  ON public.factor_scores FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all university_matches" ON public.university_matches;
CREATE POLICY "Admins can view all university_matches"
  ON public.university_matches FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all match_outcomes" ON public.match_outcomes;
CREATE POLICY "Admins can view all match_outcomes"
  ON public.match_outcomes FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all chat_messages" ON public.chat_messages;
CREATE POLICY "Admins can view all chat_messages"
  ON public.chat_messages FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all document_analyses" ON public.document_analyses;
CREATE POLICY "Admins can view all document_analyses"
  ON public.document_analyses FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all user_programs" ON public.user_programs;
CREATE POLICY "Admins can view all user_programs"
  ON public.user_programs FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all user_deadlines" ON public.user_deadlines;
CREATE POLICY "Admins can view all user_deadlines"
  ON public.user_deadlines FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all user_applications" ON public.user_applications;
CREATE POLICY "Admins can view all user_applications"
  ON public.user_applications FOR SELECT
  USING (public.is_admin(auth.uid()));

-- 6. Seed admin role for owner email (idempotent, only if user exists)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = '2701507@scarsdale.edu.pk'
ON CONFLICT (user_id, role) DO NOTHING;