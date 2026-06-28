create or replace function public.match_ai_memory(
  query_embedding vector(1536),
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
language sql stable security invoker set search_path = public
as $$
  select m.id, m.kind, m.content, m.metadata,
         1 - (m.embedding <=> query_embedding) as similarity
  from public.ai_memory m
  where m.user_id = auth.uid()
    and m.embedding is not null
    and (match_kinds is null or m.kind = any(match_kinds))
  order by m.embedding <=> query_embedding
  limit match_count;
$$;

revoke all on function public.match_ai_memory(vector, int, text[]) from public, anon;
grant execute on function public.match_ai_memory(vector, int, text[]) to authenticated;