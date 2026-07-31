-- Nestly — Bills tables + RLS (idempotent)

do $$ begin
  create type public.bill_recurrence as enum ('once', 'monthly', 'yearly');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.bill_status as enum ('pending', 'paid');
exception when duplicate_object then null;
end $$;

create table if not exists public.bills (
  id uuid primary key default gen_random_uuid() not null,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  amount numeric(12, 2) not null default 0,
  currency text not null default 'BRL',
  category text,
  due_date date not null,
  recurrence public.bill_recurrence not null default 'monthly',
  status public.bill_status not null default 'pending',
  notes text,
  paid_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bills_workspace_idx on public.bills (workspace_id);
create index if not exists bills_workspace_due_idx on public.bills (workspace_id, due_date);
create index if not exists bills_workspace_status_idx on public.bills (workspace_id, status);

alter table public.bills enable row level security;

drop policy if exists bills_tenant on public.bills;
create policy bills_tenant on public.bills
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
