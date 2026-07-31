-- Nestly — Calendar events + RLS (idempotent)

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid() not null,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  all_day boolean not null default false,
  location text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists calendar_events_workspace_idx on public.calendar_events (workspace_id);
create index if not exists calendar_events_workspace_starts_idx
  on public.calendar_events (workspace_id, starts_at);

alter table public.calendar_events enable row level security;

drop policy if exists calendar_events_tenant on public.calendar_events;
create policy calendar_events_tenant on public.calendar_events
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
