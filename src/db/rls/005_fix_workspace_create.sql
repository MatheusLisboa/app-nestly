-- Fix workspace creation chicken-and-egg under RLS.
-- INSERT ... RETURNING / .select() requires SELECT policy; membership does not exist yet.

-- Allow creators to read workspaces they just created (before membership row exists)
drop policy if exists workspaces_select_member on public.workspaces;
create policy workspaces_select_member on public.workspaces
  for select using (
    public.is_workspace_member(id)
    or created_by = auth.uid()
  );

-- Tighten insert: creator must be the authenticated user
drop policy if exists workspaces_insert_authenticated on public.workspaces;
create policy workspaces_insert_authenticated on public.workspaces
  for insert with check (
    auth.uid() is not null
    and (created_by is null or created_by = auth.uid())
  );

-- Atomic create: workspace + owner membership (bypasses RLS safely inside definer)
create or replace function public.create_workspace(p_name text, p_slug text)
returns public.workspaces
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace public.workspaces;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_name is null or length(trim(p_name)) < 2 then
    raise exception 'Invalid workspace name';
  end if;

  if p_slug is null or length(trim(p_slug)) < 2 then
    raise exception 'Invalid workspace slug';
  end if;

  insert into public.workspaces (name, slug, created_by)
  values (trim(p_name), trim(p_slug), v_uid)
  returning * into v_workspace;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_workspace.id, v_uid, 'owner');

  return v_workspace;
end;
$$;

revoke all on function public.create_workspace(text, text) from public;
grant execute on function public.create_workspace(text, text) to authenticated;
