-- Nestly Phase 0 — Row Level Security foundation
-- Apply after Drizzle migrations (or merge into a SQL migration).
-- Isolates every tenant row by workspace membership.

-- Helper: current user is a member of the workspace
create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members m
    where m.workspace_id = p_workspace_id
      and m.user_id = auth.uid()
  );
$$;

create or replace function public.workspace_role(p_workspace_id uuid)
returns public.workspace_role
language sql
stable
security definer
set search_path = public
as $$
  select m.role
  from public.workspace_members m
  where m.workspace_id = p_workspace_id
    and m.user_id = auth.uid()
  limit 1;
$$;

-- Profiles: users can read/update themselves
alter table public.profiles enable row level security;

create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());

create policy profiles_update_own on public.profiles
  for update using (id = auth.uid());

create policy profiles_insert_own on public.profiles
  for insert with check (id = auth.uid());

-- Workspaces: members only
alter table public.workspaces enable row level security;

create policy workspaces_select_member on public.workspaces
  for select using (
    public.is_workspace_member(id)
    or created_by = auth.uid()
  );

create policy workspaces_insert_authenticated on public.workspaces
  for insert with check (
    auth.uid() is not null
    and (created_by is null or created_by = auth.uid())
  );

create policy workspaces_update_admin on public.workspaces
  for update using (
    public.workspace_role(id) in ('owner', 'admin')
  );

create policy workspaces_delete_owner on public.workspaces
  for delete using (public.workspace_role(id) = 'owner');

-- Members
alter table public.workspace_members enable row level security;

create policy workspace_members_select on public.workspace_members
  for select using (public.is_workspace_member(workspace_id));

create policy workspace_members_insert_admin on public.workspace_members
  for insert with check (
    public.workspace_role(workspace_id) in ('owner', 'admin')
    or user_id = auth.uid() -- allow self-join via accepted invite flow (tighten in app)
  );

create policy workspace_members_update_admin on public.workspace_members
  for update using (public.workspace_role(workspace_id) in ('owner', 'admin'));

create policy workspace_members_delete_admin on public.workspace_members
  for delete using (public.workspace_role(workspace_id) in ('owner', 'admin'));

-- Invitations
alter table public.workspace_invitations enable row level security;

create policy workspace_invitations_select on public.workspace_invitations
  for select using (
    public.is_workspace_member(workspace_id)
    or email = auth.jwt() ->> 'email'
  );

create policy workspace_invitations_insert_admin on public.workspace_invitations
  for insert with check (public.workspace_role(workspace_id) in ('owner', 'admin'));

create policy workspace_invitations_update_admin on public.workspace_invitations
  for update using (public.workspace_role(workspace_id) in ('owner', 'admin'));

-- Permissions catalog is readable by authenticated users
alter table public.permissions enable row level security;
create policy permissions_select_authenticated on public.permissions
  for select to authenticated using (true);

alter table public.role_permissions enable row level security;
create policy role_permissions_select_authenticated on public.role_permissions
  for select to authenticated using (true);

-- Sync meta scoped by workspace
alter table public.sync_meta enable row level security;
create policy sync_meta_member on public.sync_meta
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- TEMPLATE for future domain tables:
-- alter table public.<table> enable row level security;
-- create policy <table>_tenant_isolation on public.<table>
--   for all using (public.is_workspace_member(workspace_id))
--   with check (public.is_workspace_member(workspace_id));
