-- Nestly — Checklists tables + RLS
-- Safe to run in Supabase SQL Editor after shopping/inventory exist.
-- Prefer this over `db:push` if drizzle wants to drop existing RLS policies.

do $$ begin
  create type public.checklist_status as enum ('active', 'archived');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.checklists (
  id uuid primary key default gen_random_uuid() not null,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  description text,
  status public.checklist_status not null default 'active',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid() not null,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  checklist_id uuid not null references public.checklists(id) on delete cascade,
  title text not null,
  checked boolean not null default false,
  checked_at timestamptz,
  position integer not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists checklists_workspace_idx on public.checklists (workspace_id);
create index if not exists checklists_workspace_status_idx on public.checklists (workspace_id, status);
create index if not exists checklist_items_checklist_idx on public.checklist_items (checklist_id);
create index if not exists checklist_items_workspace_idx on public.checklist_items (workspace_id);
create index if not exists checklist_items_checked_idx on public.checklist_items (checklist_id, checked);

alter table public.checklists enable row level security;
alter table public.checklist_items enable row level security;

drop policy if exists checklists_tenant on public.checklists;
create policy checklists_tenant on public.checklists
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop policy if exists checklist_items_tenant on public.checklist_items;
create policy checklist_items_tenant on public.checklist_items
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
