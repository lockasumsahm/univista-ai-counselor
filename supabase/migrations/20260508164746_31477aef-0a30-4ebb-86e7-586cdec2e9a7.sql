CREATE TABLE IF NOT EXISTS public.payment_review_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  payment_reference text NOT NULL,
  payer_email text,
  amount_cad numeric(10,2) NOT NULL DEFAULT 20.00,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payment_review_requests_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

ALTER TABLE public.payment_review_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment reviews"
ON public.payment_review_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can submit own payment reviews"
ON public.payment_review_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all payment reviews"
ON public.payment_review_requests
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update payment reviews"
ON public.payment_review_requests
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_payment_review_requests_user_id ON public.payment_review_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_review_requests_status ON public.payment_review_requests(status);

DROP TRIGGER IF EXISTS update_payment_review_requests_updated_at ON public.payment_review_requests;
CREATE TRIGGER update_payment_review_requests_updated_at
BEFORE UPDATE ON public.payment_review_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();