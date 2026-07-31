-- Nestly — Baby medical appointments (consultas/exames) + optional calendar link
-- Run after 012_baby_prep_items_category.sql

do $$ begin
  create type public.baby_medical_type as enum (
    'consultation',
    'exam',
    'ultrasound',
    'vaccine',
    'other'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.baby_medical_appointments (
  id uuid primary key default gen_random_uuid() not null,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  type public.baby_medical_type not null default 'consultation',
  title text not null,
  scheduled_at timestamptz not null,
  location text,
  professional text,
  notes text,
  calendar_event_id uuid references public.calendar_events(id) on delete set null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists baby_medical_appointments_baby_idx
  on public.baby_medical_appointments (baby_id);
create index if not exists baby_medical_appointments_scheduled_idx
  on public.baby_medical_appointments (baby_id, scheduled_at);
create index if not exists baby_medical_appointments_workspace_idx
  on public.baby_medical_appointments (workspace_id);

alter table public.baby_medical_appointments enable row level security;

drop policy if exists baby_medical_appointments_tenant on public.baby_medical_appointments;
create policy baby_medical_appointments_tenant on public.baby_medical_appointments
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
