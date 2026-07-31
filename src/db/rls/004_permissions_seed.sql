-- Seed permission catalog + default role matrix (idempotent)

insert into public.permissions (id, code, description)
select gen_random_uuid(), code, description
from (values
  ('workspace.manage', 'Manage workspace settings'),
  ('workspace.delete', 'Delete workspace'),
  ('members.invite', 'Invite members'),
  ('members.manage', 'Manage members'),
  ('shopping.read', 'Read shopping lists'),
  ('shopping.write', 'Write shopping lists'),
  ('inventory.read', 'Read inventory'),
  ('inventory.write', 'Write inventory'),
  ('checklists.read', 'Read checklists'),
  ('checklists.write', 'Write checklists'),
  ('cleaning.read', 'Read cleaning'),
  ('cleaning.write', 'Write cleaning'),
  ('bills.read', 'Read bills'),
  ('bills.write', 'Write bills'),
  ('calendar.read', 'Read calendar'),
  ('calendar.write', 'Write calendar'),
  ('baby.read', 'Read baby care'),
  ('baby.write', 'Write baby care')
) as v(code, description)
where not exists (
  select 1 from public.permissions p where p.code = v.code
);

-- Clear and reseed role_permissions for known roles
delete from public.role_permissions;

insert into public.role_permissions (role, permission_id)
select 'owner', id from public.permissions;

insert into public.role_permissions (role, permission_id)
select 'admin', id from public.permissions
where code <> 'workspace.delete';

insert into public.role_permissions (role, permission_id)
select 'member', id from public.permissions
where code in (
  'shopping.read','shopping.write',
  'inventory.read','inventory.write',
  'checklists.read','checklists.write',
  'cleaning.read','cleaning.write',
  'bills.read','bills.write',
  'calendar.read','calendar.write',
  'baby.read','baby.write'
);

insert into public.role_permissions (role, permission_id)
select 'viewer', id from public.permissions
where code like '%.read';
