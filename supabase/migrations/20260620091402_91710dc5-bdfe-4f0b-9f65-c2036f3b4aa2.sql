
REVOKE EXECUTE ON FUNCTION public.activate_premium_pass_after_payment_review() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rollback_calibration(bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.match_ai_memory(vector, uuid, integer, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.match_ai_memory(vector, uuid, integer, text[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.activate_premium_pass_after_payment_review() TO service_role;
GRANT EXECUTE ON FUNCTION public.rollback_calibration(bigint) TO service_role;
