-- Run with a local Supabase PostgreSQL superuser. This intentionally exercises
-- the authenticated role and request JWT claims rather than service-role access.
begin;

create temporary table policy_fixture (
  owner_id uuid,
  manager_id uuid,
  worker_id uuid,
  inactive_id uuid,
  unrelated_id uuid,
  farm_a uuid,
  farm_b uuid
);

insert into policy_fixture values (
  '90000000-0000-0000-0000-000000000001',
  '90000000-0000-0000-0000-000000000002',
  '90000000-0000-0000-0000-000000000003',
  '90000000-0000-0000-0000-000000000004',
  '90000000-0000-0000-0000-000000000005',
  '91000000-0000-0000-0000-000000000001',
  '91000000-0000-0000-0000-000000000002'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
select owner_id, '00000000-0000-0000-0000-000000000000', 'authenticated',
  'authenticated', 'policy-owner@example.test', extensions.crypt('fixture-password', extensions.gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()
from policy_fixture
union all select manager_id, '00000000-0000-0000-0000-000000000000', 'authenticated',
  'authenticated', 'policy-manager@example.test', extensions.crypt('fixture-password', extensions.gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}', '{}', now(), now() from policy_fixture
union all select worker_id, '00000000-0000-0000-0000-000000000000', 'authenticated',
  'authenticated', 'policy-worker@example.test', extensions.crypt('fixture-password', extensions.gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}', '{}', now(), now() from policy_fixture
union all select inactive_id, '00000000-0000-0000-0000-000000000000', 'authenticated',
  'authenticated', 'policy-inactive@example.test', extensions.crypt('fixture-password', extensions.gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}', '{}', now(), now() from policy_fixture
union all select unrelated_id, '00000000-0000-0000-0000-000000000000', 'authenticated',
  'authenticated', 'policy-unrelated@example.test', extensions.crypt('fixture-password', extensions.gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}', '{}', now(), now() from policy_fixture;

-- Insert as the migration owner so these fixtures do not depend on policies.
insert into public.farms (id, name, created_by)
select farm_a, 'Policy Farm A', owner_id from policy_fixture
union all
select farm_b, 'Policy Farm B', unrelated_id from policy_fixture;

insert into public.farm_memberships (farm_id, user_id, role, status)
select farm_a, owner_id, 'owner', 'active' from policy_fixture union all
select farm_a, manager_id, 'manager', 'active' from policy_fixture union all
select farm_a, worker_id, 'worker', 'active' from policy_fixture union all
select farm_a, inactive_id, 'worker', 'inactive' from policy_fixture union all
select farm_b, unrelated_id, 'owner', 'active' from policy_fixture;

set local role authenticated;
select set_config('request.jwt.claim.sub', (select owner_id::text from policy_fixture), true);

do $$
begin
  if (select count(*) from public.farms) <> 1 then
    raise exception 'owner should see exactly its farm';
  end if;
end $$;

-- Owner can add a worker but an active manager cannot promote themself.
insert into public.farm_memberships (farm_id, user_id, role)
select farm_a, unrelated_id, 'worker' from policy_fixture;
delete from public.farm_memberships
where farm_id = (select farm_a from policy_fixture)
  and user_id = (select unrelated_id from policy_fixture);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', (select manager_id::text from policy_fixture), true);

do $$
begin
  begin
    update public.farm_memberships
    set role = 'owner'
    where farm_id = (select farm_a from policy_fixture)
      and user_id = (select manager_id from policy_fixture);
    raise exception 'manager self-promotion was unexpectedly allowed';
  exception when insufficient_privilege then null;
  end;
end $$;

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', (select inactive_id::text from policy_fixture), true);

do $$
begin
  if exists (select 1 from public.farms) then
    raise exception 'inactive membership must not see farm data';
  end if;
end $$;

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', (select unrelated_id::text from policy_fixture), true);

do $$
begin
  if exists (
    select 1 from public.farms where id = (select farm_a from policy_fixture)
  ) then
    raise exception 'unrelated user must not see another farm';
  end if;
end $$;

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', (select owner_id::text from policy_fixture), true);

do $$
begin
  begin
    update public.farm_memberships
    set status = 'inactive'
    where farm_id = (select farm_a from policy_fixture)
      and user_id = (select owner_id from policy_fixture);
    raise exception 'sole owner deactivation was unexpectedly allowed';
  exception when check_violation then null;
  end;
end $$;

reset role;
rollback;
