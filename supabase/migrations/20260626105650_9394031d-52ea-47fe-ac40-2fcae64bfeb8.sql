
CREATE TABLE public.counseling_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  timezone TEXT,
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.counseling_bookings TO authenticated;
GRANT ALL ON public.counseling_bookings TO service_role;

ALTER TABLE public.counseling_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own bookings" ON public.counseling_bookings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own bookings" ON public.counseling_bookings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins view all bookings" ON public.counseling_bookings
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
