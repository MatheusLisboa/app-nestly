-- MyNinho — Baby care tables + RLS (idempotent)

do $$ begin
  create type public.baby_care_type as enum ('feeding', 'diaper', 'sleep', 'note');
exception when duplicate_object then null;
end $$;

create table if not exists public.babies (
  id uuid primary key default gen_random_uuid() not null,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  birth_date date,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.baby_care_logs (
  id uuid primary key default gen_random_uuid() not null,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  type public.baby_care_type not null,
  occurred_at timestamptz not null default now(),
  detail text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists babies_workspace_idx on public.babies (workspace_id);
create index if not exists baby_care_logs_baby_idx on public.baby_care_logs (baby_id);
create index if not exists baby_care_logs_workspace_idx on public.baby_care_logs (workspace_id);
create index if not exists baby_care_logs_occurred_idx
  on public.baby_care_logs (baby_id, occurred_at);

alter table public.babies enable row level security;
alter table public.baby_care_logs enable row level security;

drop policy if exists babies_tenant on public.babies;
create policy babies_tenant on public.babies
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop policy if exists baby_care_logs_tenant on public.baby_care_logs;
create policy baby_care_logs_tenant on public.baby_care_logs
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
