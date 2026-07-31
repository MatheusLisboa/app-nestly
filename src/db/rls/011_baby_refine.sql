-- MyNinho — Baby refine: pregnancy/born + prep lists (idempotent)
-- Run after 010_baby_rls.sql

do $$ begin
  create type public.baby_status as enum ('expected', 'born');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.baby_prep_category as enum ('enxoval', 'pharmacy', 'nursery');
exception when duplicate_object then null;
end $$;

alter table public.babies
  add column if not exists status public.baby_status not null default 'expected';

alter table public.babies
  add column if not exists due_date date;

-- If birth_date already set, treat as born
update public.babies
set status = 'born'
where birth_date is not null and status = 'expected';

create table if not exists public.baby_prep_items (
  id uuid primary key default gen_random_uuid() not null,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  category public.baby_prep_category not null,
  title text not null,
  checked boolean not null default false,
  notes text,
  position integer not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists baby_prep_items_baby_idx on public.baby_prep_items (baby_id);
create index if not exists baby_prep_items_category_idx
  on public.baby_prep_items (baby_id, category);
create index if not exists baby_prep_items_workspace_idx on public.baby_prep_items (workspace_id);

alter table public.baby_prep_items enable row level security;

drop policy if exists baby_prep_items_tenant on public.baby_prep_items;
create policy baby_prep_items_tenant on public.baby_prep_items
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
