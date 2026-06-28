CREATE OR REPLACE FUNCTION public.activate_premium_pass_after_payment_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved' THEN
    INSERT INTO public.premium_passes (user_id, payment_ref, active, amount_cad)
    VALUES (NEW.user_id, NEW.payment_reference, true, COALESCE(NEW.amount_cad, 20.00))
    ON CONFLICT (user_id) DO UPDATE
      SET payment_ref = EXCLUDED.payment_ref,
          active = true,
          amount_cad = EXCLUDED.amount_cad;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.activate_premium_pass_after_payment_review() FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.activate_premium_pass_after_payment_review() TO service_role;

DROP TRIGGER IF EXISTS activate_premium_pass_after_payment_review ON public.payment_review_requests;
CREATE TRIGGER activate_premium_pass_after_payment_review
AFTER UPDATE ON public.payment_review_requests
FOR EACH ROW
EXECUTE FUNCTION public.activate_premium_pass_after_payment_review();