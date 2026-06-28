create table public.ai_diagnostics (
  id uuid primary key default gen_random_uuid(),
  request_id text not null,
  user_id uuid,
  task text not null,
  model text not null,
  attempt_no int not null default 1,
  status text not null,
  http_status int,
  latency_ms int,
  payload_valid boolean,
  error text,
  created_at timestamptz not null default now()
);

alter table public.ai_diagnostics enable row level security;

create policy "Admins read ai_diagnostics"
  on public.ai_diagnostics
  for select
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "Service role writes ai_diagnostics"
  on public.ai_diagnostics
  for insert
  to public
  with check (auth.role() = 'service_role');

create index ai_diagnostics_created_at_idx on public.ai_diagnostics (created_at desc);
create index ai_diagnostics_task_status_idx on public.ai_diagnostics (task, status);
create index ai_diagnostics_request_id_idx on public.ai_diagnostics (request_id);