-- MyNinho — Cleaning tables + RLS
-- Safe to run in Supabase SQL Editor (idempotent). Prefer over db:push.

do $$ begin
  create type public.cleaning_frequency as enum ('daily', 'weekly', 'biweekly', 'monthly');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.cleaning_tasks (
  id uuid primary key default gen_random_uuid() not null,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  area text,
  frequency public.cleaning_frequency not null default 'weekly',
  notes text,
  last_cleaned_at timestamptz,
  last_cleaned_by uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cleaning_logs (
  id uuid primary key default gen_random_uuid() not null,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  task_id uuid not null references public.cleaning_tasks(id) on delete cascade,
  cleaned_at timestamptz not null default now(),
  cleaned_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists cleaning_tasks_workspace_idx on public.cleaning_tasks (workspace_id);
create index if not exists cleaning_tasks_workspace_frequency_idx
  on public.cleaning_tasks (workspace_id, frequency);
create index if not exists cleaning_logs_task_idx on public.cleaning_logs (task_id);
create index if not exists cleaning_logs_workspace_idx on public.cleaning_logs (workspace_id);

alter table public.cleaning_tasks enable row level security;
alter table public.cleaning_logs enable row level security;

drop policy if exists cleaning_tasks_tenant on public.cleaning_tasks;
create policy cleaning_tasks_tenant on public.cleaning_tasks
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop policy if exists cleaning_logs_tenant on public.cleaning_logs;
create policy cleaning_logs_tenant on public.cleaning_logs
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
