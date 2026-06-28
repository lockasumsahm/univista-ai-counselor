-- university_matches: cache engine + AI per profile_hash
CREATE TABLE public.university_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  profile_hash TEXT NOT NULL,
  engine_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_explanations JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, profile_hash)
);

ALTER TABLE public.university_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own matches" ON public.university_matches
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own matches" ON public.university_matches
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own matches" ON public.university_matches
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own matches" ON public.university_matches
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_university_matches_user_hash ON public.university_matches(user_id, profile_hash);

CREATE TRIGGER update_university_matches_updated_at
  BEFORE UPDATE ON public.university_matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- match_outcomes: feedback loop
CREATE TABLE public.match_outcomes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  university_name TEXT NOT NULL,
  alignment_score INTEGER,
  alignment_category TEXT,
  status TEXT NOT NULL CHECK (status IN ('applied','accepted','rejected','waitlisted','deferred')),
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.match_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own outcomes" ON public.match_outcomes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own outcomes" ON public.match_outcomes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own outcomes" ON public.match_outcomes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own outcomes" ON public.match_outcomes
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_match_outcomes_user ON public.match_outcomes(user_id);
CREATE INDEX idx_match_outcomes_uni ON public.match_outcomes(university_name);

CREATE TRIGGER update_match_outcomes_updated_at
  BEFORE UPDATE ON public.match_outcomes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- outcome_insights view: aggregates per-user (RLS-friendly via underlying table)
CREATE OR REPLACE VIEW public.outcome_insights
WITH (security_invoker = true) AS
SELECT
  user_id,
  alignment_category,
  status,
  COUNT(*) AS outcome_count,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'accepted')
    / NULLIF(COUNT(*) FILTER (WHERE status IN ('accepted','rejected','waitlisted')), 0),
    1
  ) AS acceptance_pct,
  ARRAY(
    SELECT unnest(tags) AS tag
    FROM public.match_outcomes mo2
    WHERE mo2.user_id = mo.user_id
      AND mo2.alignment_category = mo.alignment_category
    GROUP BY tag
    ORDER BY COUNT(*) DESC
    LIMIT 5
  ) AS top_tags
FROM public.match_outcomes mo
GROUP BY user_id, alignment_category, status;