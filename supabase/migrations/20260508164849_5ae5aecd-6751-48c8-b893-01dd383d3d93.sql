DROP POLICY IF EXISTS "Admins view access log" ON public.admin_access_log;
CREATE POLICY "Admins view access log"
ON public.admin_access_log
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

DROP POLICY IF EXISTS "Admins can view all chat_messages" ON public.chat_messages;
CREATE POLICY "Admins can view all chat_messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

DROP POLICY IF EXISTS "Admins can view all document_analyses" ON public.document_analyses;
CREATE POLICY "Admins can view all document_analyses"
ON public.document_analyses
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

DROP POLICY IF EXISTS "Admins can view all factor_scores" ON public.factor_scores;
CREATE POLICY "Admins can view all factor_scores"
ON public.factor_scores
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

DROP POLICY IF EXISTS "Users view own interviews" ON public.interview_sessions;
CREATE POLICY "Users view own interviews"
ON public.interview_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

DROP POLICY IF EXISTS "Admins can view all match_outcomes" ON public.match_outcomes;
CREATE POLICY "Admins can view all match_outcomes"
ON public.match_outcomes
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

DROP POLICY IF EXISTS "Admins can update payment reviews" ON public.payment_review_requests;
CREATE POLICY "Admins can update payment reviews"
ON public.payment_review_requests
FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

DROP POLICY IF EXISTS "Admins can view all payment reviews" ON public.payment_review_requests;
CREATE POLICY "Admins can view all payment reviews"
ON public.payment_review_requests
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

DROP POLICY IF EXISTS "Admins view all passes" ON public.premium_passes;
CREATE POLICY "Admins view all passes"
ON public.premium_passes
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

DROP POLICY IF EXISTS "Admins can view all university_matches" ON public.university_matches;
CREATE POLICY "Admins can view all university_matches"
ON public.university_matches
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

DROP POLICY IF EXISTS "Admins can view all user_applications" ON public.user_applications;
CREATE POLICY "Admins can view all user_applications"
ON public.user_applications
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

DROP POLICY IF EXISTS "Admins can view all user_deadlines" ON public.user_deadlines;
CREATE POLICY "Admins can view all user_deadlines"
ON public.user_deadlines
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

DROP POLICY IF EXISTS "Admins can view all user_programs" ON public.user_programs;
CREATE POLICY "Admins can view all user_programs"
ON public.user_programs
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM authenticated;