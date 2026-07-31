-- MyNinho — domain RLS for shopping + inventory
-- Run after tables exist (db:push or full bootstrap SQL).

alter table public.shopping_lists enable row level security;
alter table public.shopping_items enable row level security;
alter table public.inventory_locations enable row level security;
alter table public.inventory_items enable row level security;

drop policy if exists shopping_lists_tenant on public.shopping_lists;
create policy shopping_lists_tenant on public.shopping_lists
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop policy if exists shopping_items_tenant on public.shopping_items;
create policy shopping_items_tenant on public.shopping_items
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop policy if exists inventory_locations_tenant on public.inventory_locations;
create policy inventory_locations_tenant on public.inventory_locations
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop policy if exists inventory_items_tenant on public.inventory_items;
create policy inventory_items_tenant on public.inventory_items
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
