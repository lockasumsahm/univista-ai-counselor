
-- ─────────────────────────────────────────────────────────────────
-- PASS 1: Outcome-Driven Calibration Infrastructure (additive, reversible)
-- ─────────────────────────────────────────────────────────────────

-- Extend match_outcomes with denormalized fields used by the recalibration job.
-- All nullable so existing rows / inserts keep working unchanged.
ALTER TABLE public.match_outcomes
  ADD COLUMN IF NOT EXISTS uni_country text,
  ADD COLUMN IF NOT EXISTS uni_tier text,          -- 'elite' | 'highly_selective' | 'selective' | 'accessible'
  ADD COLUMN IF NOT EXISTS uni_region text,        -- 'us' | 'uk' | 'canada' | 'eu' | 'asia' | 'oceania' | 'other'
  ADD COLUMN IF NOT EXISTS intended_major text,
  ADD COLUMN IF NOT EXISTS predicted_score integer,
  ADD COLUMN IF NOT EXISTS predicted_category text;

CREATE INDEX IF NOT EXISTS idx_match_outcomes_calib_bucket
  ON public.match_outcomes (uni_tier, uni_region, intended_major)
  WHERE status IN ('accepted','rejected','waitlisted','deferred');

-- ─────────────────────────────────────────────────────────────────
-- Calibration runs log (one row per recalibration pass)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.calibration_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version bigint NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL DEFAULT 'running', -- running | success | failed | superseded
  total_outcomes integer NOT NULL DEFAULT 0,
  buckets_evaluated integer NOT NULL DEFAULT 0,
  buckets_applied integer NOT NULL DEFAULT 0,
  avg_shift_pts numeric(6,3),
  max_shift_pts numeric(6,3),
  capped_count integer NOT NULL DEFAULT 0,
  notes text,
  error text,
  created_by uuid
);

GRANT SELECT ON public.calibration_runs TO authenticated;
GRANT ALL    ON public.calibration_runs TO service_role;
ALTER TABLE public.calibration_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "calibration_runs_admin_read"
  ON public.calibration_runs FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- ─────────────────────────────────────────────────────────────────
-- Calibration weights — versioned, one row per bucket
-- bucket = (tier, region, major) — wildcards allowed via NULL
-- correction_factor multiplied into the base alignment score, clipped at the job.
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.calibration_weights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version bigint NOT NULL,
  tier text,           -- nullable wildcard
  region text,         -- nullable wildcard
  major text,          -- nullable wildcard
  sample_size integer NOT NULL,
  observed_admit_rate numeric(5,4) NOT NULL,
  expected_admit_rate numeric(5,4) NOT NULL,
  correction_factor numeric(5,3) NOT NULL,        -- clipped 0.7..1.3
  applied boolean NOT NULL DEFAULT false,         -- only buckets w/ N>=30 are applied
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_calibration_weights_bucket
  ON public.calibration_weights (
    version,
    COALESCE(tier,''),
    COALESCE(region,''),
    COALESCE(major,'')
  );

CREATE INDEX IF NOT EXISTS idx_calibration_weights_version
  ON public.calibration_weights (version);

GRANT SELECT ON public.calibration_weights TO anon, authenticated;
GRANT ALL    ON public.calibration_weights TO service_role;
ALTER TABLE public.calibration_weights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "calibration_weights_public_read"
  ON public.calibration_weights FOR SELECT TO anon, authenticated
  USING (true);

-- ─────────────────────────────────────────────────────────────────
-- Active calibration pointer (single-row table). Enables instant rollback.
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.calibration_active (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  active_version bigint,
  activated_at timestamptz NOT NULL DEFAULT now(),
  activated_by uuid,
  note text
);

INSERT INTO public.calibration_active (id, active_version, note)
VALUES (true, NULL, 'initial — fallback to base scoring only')
ON CONFLICT (id) DO NOTHING;

GRANT SELECT ON public.calibration_active TO anon, authenticated;
GRANT ALL    ON public.calibration_active TO service_role;
ALTER TABLE public.calibration_active ENABLE ROW LEVEL SECURITY;

CREATE POLICY "calibration_active_public_read"
  ON public.calibration_active FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "calibration_active_admin_write"
  ON public.calibration_active FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ─────────────────────────────────────────────────────────────────
-- RPC: get_active_calibration() — returns applied weights for the live version.
-- ─────────────────────────────────────────────────────────────────
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
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT w.version, w.tier, w.region, w.major, w.sample_size, w.correction_factor
  FROM public.calibration_weights w
  JOIN public.calibration_active a ON a.active_version = w.version
  WHERE w.applied = true;
$$;

GRANT EXECUTE ON FUNCTION public.get_active_calibration() TO anon, authenticated;

-- ─────────────────────────────────────────────────────────────────
-- RPC: rollback_calibration(target_version) — admin-only instant rollback.
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.rollback_calibration(target_version bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'admin only';
  END IF;
  UPDATE public.calibration_active
     SET active_version = target_version,
         activated_at = now(),
         activated_by = auth.uid(),
         note = 'rollback'
   WHERE id = true;
  UPDATE public.calibration_runs
     SET status = 'superseded'
   WHERE version > target_version AND status = 'success';
END;
$$;

REVOKE ALL ON FUNCTION public.rollback_calibration(bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rollback_calibration(bigint) TO authenticated;
