
-- ─────────────────────────────────────────────────────────────────
-- PASS 2: Semantic similarity grounding — verified_admits embeddings
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.verified_admits
  ADD COLUMN IF NOT EXISTS embedding vector(1536),
  ADD COLUMN IF NOT EXISTS summary_text text,
  ADD COLUMN IF NOT EXISTS tier text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS embedded_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_verified_admits_embedding
  ON public.verified_admits USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_verified_admits_tier_region
  ON public.verified_admits (tier, region);

CREATE OR REPLACE FUNCTION public.match_verified_admits(
  query_embedding vector,
  match_count int DEFAULT 5,
  f_university text DEFAULT NULL,
  f_country text DEFAULT NULL,
  f_tier text DEFAULT NULL,
  f_region text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  university_name text,
  country text,
  intended_major text,
  student_country text,
  gpa_unweighted numeric,
  sat_total int,
  act_composite int,
  spike text,
  awards text[],
  leadership_summary text,
  essay_themes text[],
  recommendations_strength text,
  first_generation boolean,
  source text,
  source_url text,
  verified boolean,
  summary_text text,
  similarity float
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT v.id, v.university_name, v.country, v.intended_major, v.student_country,
         v.gpa_unweighted, v.sat_total, v.act_composite, v.spike, v.awards,
         v.leadership_summary, v.essay_themes, v.recommendations_strength,
         v.first_generation, v.source, v.source_url, v.verified, v.summary_text,
         1 - (v.embedding <=> query_embedding) AS similarity
  FROM public.verified_admits v
  WHERE v.embedding IS NOT NULL
    AND v.decision = 'admit'
    AND (f_university IS NULL OR v.university_name ILIKE '%' || f_university || '%')
    AND (f_country   IS NULL OR v.country = f_country)
    AND (f_tier      IS NULL OR v.tier = f_tier)
    AND (f_region    IS NULL OR v.region = f_region)
  ORDER BY v.embedding <=> query_embedding
  LIMIT match_count;
$$;
GRANT EXECUTE ON FUNCTION public.match_verified_admits(vector,int,text,text,text,text)
  TO authenticated;

-- ─────────────────────────────────────────────────────────────────
-- PASS 3: Major-specific admit rates (priors from public CDS data)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.major_admit_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_name text NOT NULL,
  major_normalized text NOT NULL,    -- matches client `normalizeMajor()`
  admit_rate numeric(5,4) NOT NULL,  -- 0..1
  overall_admit_rate numeric(5,4),
  data_year int NOT NULL,
  source_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (university_name, major_normalized)
);

GRANT SELECT ON public.major_admit_rates TO anon, authenticated;
GRANT ALL    ON public.major_admit_rates TO service_role;
ALTER TABLE public.major_admit_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "major_admit_rates_public_read"
  ON public.major_admit_rates FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "major_admit_rates_admin_write"
  ON public.major_admit_rates FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_major_admit_rates_updated
BEFORE UPDATE ON public.major_admit_rates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with well-known public data points. Sources are CDS / school news releases.
-- Conservative figures used; updateable later by admin.
INSERT INTO public.major_admit_rates
  (university_name, major_normalized, admit_rate, overall_admit_rate, data_year, source_url, notes)
VALUES
  ('Stanford University',                    'computer_science', 0.030, 0.036, 2023, 'https://cs.stanford.edu', 'CS undergrad admit historically <5%'),
  ('Stanford University',                    'engineering',      0.040, 0.036, 2023, 'https://engineering.stanford.edu', 'SoE undergrad admit'),
  ('Massachusetts Institute of Technology',  'computer_science', 0.040, 0.045, 2023, 'https://web.mit.edu/registrar/stats', 'EECS / 6-3 / 6-7'),
  ('Massachusetts Institute of Technology',  'engineering',      0.045, 0.045, 2023, 'https://web.mit.edu/registrar/stats', 'School of Engineering'),
  ('University of California, Berkeley',     'computer_science', 0.045, 0.115, 2023, 'https://opa.berkeley.edu', 'EECS L&S+CoE — far below overall'),
  ('University of California, Berkeley',     'engineering',      0.080, 0.115, 2023, 'https://opa.berkeley.edu', 'CoE majors'),
  ('Carnegie Mellon University',             'computer_science', 0.060, 0.140, 2023, 'https://www.cmu.edu/ira', 'SCS notoriously selective'),
  ('University of California, Los Angeles',  'computer_science', 0.046, 0.087, 2023, 'https://www.admission.ucla.edu', 'CS impacted major'),
  ('Cornell University',                     'engineering',      0.080, 0.071, 2023, 'https://irp.dpb.cornell.edu', 'College of Engineering'),
  ('Cornell University',                     'computer_science', 0.060, 0.071, 2023, 'https://irp.dpb.cornell.edu', 'CS within Engineering/CAS'),
  ('Harvard University',                     'engineering',      0.050, 0.034, 2023, 'https://oir.harvard.edu', 'SEAS — slightly above overall'),
  ('University of Michigan, Ann Arbor',      'computer_science', 0.090, 0.180, 2023, 'https://obp.umich.edu', 'CS-LSA / CSE impacted'),
  ('University of Illinois Urbana-Champaign','computer_science', 0.070, 0.450, 2023, 'https://dmi.illinois.edu', 'Grainger CS extremely impacted'),
  ('Georgia Institute of Technology',        'computer_science', 0.110, 0.170, 2023, 'https://lite.gatech.edu', 'CoC undergrad'),
  ('University of Washington',               'computer_science', 0.080, 0.480, 2023, 'https://www.washington.edu/cic', 'Allen School direct admit'),
  ('University of Texas at Austin',          'computer_science', 0.075, 0.310, 2023, 'https://reports.utexas.edu', 'Texas CS major'),
  ('University of Cambridge',                'computer_science', 0.080, 0.180, 2023, 'https://www.undergraduate.study.cam.ac.uk', 'CompSci Tripos'),
  ('University of Oxford',                   'computer_science', 0.100, 0.170, 2023, 'https://www.ox.ac.uk/about/facts-and-figures', 'CS undergrad'),
  ('Imperial College London',                'computer_science', 0.090, 0.140, 2023, 'https://www.imperial.ac.uk', 'DoC undergrad'),
  ('University of Toronto',                  'computer_science', 0.070, 0.430, 2023, 'https://www.utoronto.ca', 'CS specialist — very selective'),
  ('University of Waterloo',                 'computer_science', 0.080, 0.530, 2023, 'https://uwaterloo.ca', 'CS / SE — very selective')
ON CONFLICT (university_name, major_normalized) DO NOTHING;
