ALTER TABLE public.major_admit_rates 
  ADD COLUMN IF NOT EXISTS data_source TEXT NOT NULL DEFAULT 'verified',
  ADD COLUMN IF NOT EXISTS confidence NUMERIC;

CREATE UNIQUE INDEX IF NOT EXISTS major_admit_rates_uni_major_uniq
  ON public.major_admit_rates (lower(university_name), lower(major_normalized));

GRANT INSERT, UPDATE ON public.major_admit_rates TO service_role;