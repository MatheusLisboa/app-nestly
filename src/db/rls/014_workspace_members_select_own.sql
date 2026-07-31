-- Allow members to always read their own membership rows.
-- Listing "my workspaces" must not depend solely on is_workspace_member(),
-- which can fail in edge cases and look like the user has no family.

drop policy if exists workspace_members_select on public.workspace_members;
create policy workspace_members_select on public.workspace_members
  for select using (
    user_id = auth.uid()
    or public.is_workspace_member(workspace_id)
  );
