
-- 1) Tighten ai_response_cache read policy: drop NULL-user_id public-read branch
DROP POLICY IF EXISTS "users read own cache" ON public.ai_response_cache;
CREATE POLICY "users read own cache"
ON public.ai_response_cache
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2) Lock down SECURITY DEFINER functions: revoke EXECUTE from anon/authenticated
--    Keep service_role + trigger usage intact.
REVOKE EXECUTE ON FUNCTION public.activate_premium_pass_after_payment_review() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.match_ai_memory(vector, uuid, integer, text[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_ai_memory(vector, uuid, integer, text[]) TO service_role;
