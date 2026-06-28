CREATE TABLE public.premium_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  payment_ref text,
  amount_cad numeric NOT NULL DEFAULT 20,
  granted_at timestamptz NOT NULL DEFAULT now(),
  active boolean NOT NULL DEFAULT true
);

ALTER TABLE public.premium_passes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own pass" ON public.premium_passes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own pass" ON public.premium_passes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own pass" ON public.premium_passes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins view all passes" ON public.premium_passes
  FOR SELECT USING (is_admin(auth.uid()));