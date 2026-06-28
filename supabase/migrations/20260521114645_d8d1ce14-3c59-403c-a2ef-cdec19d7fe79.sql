-- pgvector for semantic memory
create extension if not exists vector;

-- =========================================================
-- AI MEMORY (per-user embedded snippets for long-term recall)
-- =========================================================
create table public.ai_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  kind text not null, -- 'profile' | 'essay' | 'chat' | 'resume' | 'note'
  content text not null,
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index ai_memory_user_idx on public.ai_memory(user_id, kind, created_at desc);
create index ai_memory_embedding_idx on public.ai_memory using hnsw (embedding vector_cosine_ops);

alter table public.ai_memory enable row level security;
create policy "users manage own memory" on public.ai_memory
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "admins read all memory" on public.ai_memory
  for select to authenticated using (is_admin(auth.uid()));

-- =========================================================
-- RESPONSE CACHE (profile-hash + task keyed)
-- =========================================================
create table public.ai_response_cache (
  id uuid primary key default gen_random_uuid(),
  cache_key text not null unique, -- hash(task + profile_hash + input)
  task text not null,
  profile_hash text,
  user_id uuid,
  payload jsonb not null,
  model text,
  hit_count integer not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);
create index ai_response_cache_key_idx on public.ai_response_cache(cache_key);
create index ai_response_cache_user_idx on public.ai_response_cache(user_id, task);
create index ai_response_cache_expires_idx on public.ai_response_cache(expires_at);

alter table public.ai_response_cache enable row level security;
create policy "users read own cache" on public.ai_response_cache
  for select using (user_id is null or auth.uid() = user_id);
create policy "service writes cache" on public.ai_response_cache
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- =========================================================
-- VERIFIED ADMITS (curated dataset of real admission outcomes)
-- =========================================================
create table public.verified_admits (
  id uuid primary key default gen_random_uuid(),
  university_name text not null,
  country text not null,
  admit_year integer not null,
  decision text not null, -- 'admit' | 'waitlist' | 'reject'
  round text, -- 'ED' | 'EA' | 'RD' | 'rolling'
  student_country text,
  intended_major text,
  gpa_unweighted numeric(3,2),
  gpa_weighted numeric(3,2),
  sat_total integer,
  act_composite integer,
  test_optional boolean default false,
  course_rigor text, -- 'low'|'medium'|'high'|'maximum'
  class_rank_percentile integer,
  extracurricular_tier text, -- 'tier1'..'tier4'
  spike text, -- short description of the standout angle
  awards text[],
  research_publications integer default 0,
  leadership_summary text,
  essay_themes text[],
  recommendations_strength text, -- 'weak'|'solid'|'strong'|'exceptional'
  first_generation boolean default false,
  legacy boolean default false,
  recruited_athlete boolean default false,
  financial_aid_awarded numeric,
  scholarship_amount numeric,
  source text not null default 'seed', -- 'seed' | 'cds' | 'user_submitted' | 'verified_import'
  source_url text,
  verified boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);
create index verified_admits_uni_idx on public.verified_admits(university_name, decision, admit_year desc);
create index verified_admits_country_idx on public.verified_admits(country, intended_major);
create index verified_admits_scores_idx on public.verified_admits(sat_total, gpa_unweighted);

alter table public.verified_admits enable row level security;
create policy "authenticated read verified admits" on public.verified_admits
  for select to authenticated using (true);
create policy "service writes verified admits" on public.verified_admits
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "admins manage verified admits" on public.verified_admits
  for all to authenticated using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- =========================================================
-- VERIFIED SCHOLARSHIPS
-- =========================================================
create table public.verified_scholarships (
  id uuid primary key default gen_random_uuid(),
  scholarship_name text not null,
  awarding_body text not null,
  country text,
  university_name text,
  amount_usd numeric,
  award_year integer not null,
  recipient_country text,
  intended_major text,
  gpa_unweighted numeric(3,2),
  sat_total integer,
  spike text,
  essay_themes text[],
  awards text[],
  source text not null default 'seed',
  source_url text,
  verified boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);
create index verified_scholarships_name_idx on public.verified_scholarships(scholarship_name, award_year desc);
create index verified_scholarships_country_idx on public.verified_scholarships(country, intended_major);

alter table public.verified_scholarships enable row level security;
create policy "authenticated read verified scholarships" on public.verified_scholarships
  for select to authenticated using (true);
create policy "service writes verified scholarships" on public.verified_scholarships
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "admins manage verified scholarships" on public.verified_scholarships
  for all to authenticated using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- Helpful vector search RPC for ai_memory
create or replace function public.match_ai_memory(
  query_embedding vector(1536),
  match_user_id uuid,
  match_count int default 6,
  match_kinds text[] default null
)
returns table (
  id uuid,
  kind text,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable security definer set search_path = public
as $$
  select m.id, m.kind, m.content, m.metadata,
         1 - (m.embedding <=> query_embedding) as similarity
  from public.ai_memory m
  where m.user_id = match_user_id
    and m.embedding is not null
    and (match_kinds is null or m.kind = any(match_kinds))
  order by m.embedding <=> query_embedding
  limit match_count;
$$;