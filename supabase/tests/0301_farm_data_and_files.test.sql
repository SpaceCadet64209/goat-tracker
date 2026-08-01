-- Constraint and policy checks for the reusable farm-owned-data and file patterns.
begin;

create temporary table security_fixture (
  owner_id uuid,
  worker_id uuid,
  outsider_id uuid,
  farm_a uuid,
  farm_b uuid,
  parent_a uuid
);

insert into security_fixture values (
  '92000000-0000-0000-0000-000000000001',
  '92000000-0000-0000-0000-000000000002',
  '92000000-0000-0000-0000-000000000003',
  '93000000-0000-0000-0000-000000000001',
  '93000000-0000-0000-0000-000000000002',
  '94000000-0000-0000-0000-000000000001'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
select owner_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'security-owner@example.test', extensions.crypt('fixture-password', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now() from security_fixture
union all select worker_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'security-worker@example.test', extensions.crypt('fixture-password', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now() from security_fixture
union all select outsider_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'security-outsider@example.test', extensions.crypt('fixture-password', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now() from security_fixture;

insert into public.farms (id, name, created_by)
select farm_a, 'Security Farm A', owner_id from security_fixture
union all
select farm_b, 'Security Farm B', outsider_id from security_fixture;

insert into public.farm_memberships (farm_id, user_id, role)
select farm_a, owner_id, 'owner' from security_fixture
union all select farm_a, worker_id, 'worker' from security_fixture
union all select farm_b, outsider_id, 'owner' from security_fixture;

insert into public.farm_data_parents (id, farm_id, label)
select parent_a, farm_a, 'Parent in farm A' from security_fixture;

-- This direct SQL write deliberately bypasses form validation. The composite
-- foreign key must still reject a child that points to a parent in another farm.
do $$
begin
  begin
    insert into public.farm_data_children (farm_id, parent_id, label)
    select farm_b, parent_a, 'Cross-farm child' from security_fixture;
    raise exception 'cross-farm child was unexpectedly accepted';
  exception when foreign_key_violation then null;
  end;

  begin
    insert into public.farm_files (
      farm_id, object_path, logical_area, display_name, mime_type, byte_size, uploaded_by
    )
    select farm_a, 'not-a-farm-path', 'foundation', 'Unsafe path', 'image/jpeg', 1, owner_id
    from security_fixture;
    raise exception 'unsafe generated path was unexpectedly accepted';
  exception when check_violation then null;
  end;
end $$;

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', (select worker_id::text from security_fixture), true);

-- A worker may upload inside their own farm but cannot delete an object.
insert into storage.objects (bucket_id, name, owner, metadata)
select 'farm-files', farm_a::text || '/foundation/95000000-0000-0000-0000-000000000001.jpg', worker_id, '{}'
from security_fixture;

do $$
begin
  begin
    delete from storage.objects
    where bucket_id = 'farm-files'
      and name = (select farm_a::text || '/foundation/95000000-0000-0000-0000-000000000001.jpg' from security_fixture);
    raise exception 'worker file deletion was unexpectedly allowed';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into storage.objects (bucket_id, name, owner, metadata)
    select 'farm-files', farm_b::text || '/foundation/95000000-0000-0000-0000-000000000002.jpg', worker_id, '{}'
    from security_fixture;
    raise exception 'cross-farm storage insert was unexpectedly allowed';
  exception when insufficient_privilege then null;
  end;
end $$;

reset role;
rollback;
