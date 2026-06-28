REVOKE EXECUTE ON FUNCTION public.rollback_calibration(bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rollback_calibration(bigint) TO service_role;

REVOKE EXECUTE ON FUNCTION public.activate_premium_pass_after_payment_review() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.activate_premium_pass_after_payment_review() TO service_role;

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;