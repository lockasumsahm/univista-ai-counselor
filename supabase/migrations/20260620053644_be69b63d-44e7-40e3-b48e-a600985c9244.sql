
CREATE OR REPLACE FUNCTION public.get_active_calibration()
RETURNS TABLE (
  version bigint,
  tier text,
  region text,
  major text,
  sample_size integer,
  correction_factor numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT w.version, w.tier, w.region, w.major, w.sample_size, w.correction_factor
  FROM public.calibration_weights w
  JOIN public.calibration_active a ON a.active_version = w.version
  WHERE w.applied = true;
$$;
GRANT EXECUTE ON FUNCTION public.get_active_calibration() TO anon, authenticated;
