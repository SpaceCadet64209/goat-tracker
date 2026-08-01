-- SECURITY DEFINER functions have a pinned path, qualified table references, and
-- explicit caller grants. They are the only intended path for these invariants.

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(split_part(new.email, '@', 1), ''),
      'New member'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function public.create_farm(p_name text)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
  v_farm_id uuid;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if char_length(trim(p_name)) not between 1 and 120 then
    raise exception 'farm name must be between 1 and 120 characters' using errcode = '22023';
  end if;

  insert into public.farms (name, created_by)
  values (trim(p_name), v_user_id)
  returning id into v_farm_id;

  insert into public.farm_memberships (farm_id, user_id, role, status)
  values (v_farm_id, v_user_id, 'owner', 'active');

  return v_farm_id;
end;
$$;

create or replace function public.transfer_farm_ownership(p_farm_id uuid, p_new_owner_user_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  -- Lock every membership for this farm, serializing concurrent ownership changes.
  perform 1
  from public.farm_memberships
  where farm_id = p_farm_id
  for update;

  if not exists (
    select 1 from public.farm_memberships
    where farm_id = p_farm_id
      and user_id = v_user_id
      and role = 'owner'
      and status = 'active'
  ) then
    raise exception 'only an active owner may transfer ownership' using errcode = '42501';
  end if;

  update public.farm_memberships
  set role = 'owner', status = 'active'
  where farm_id = p_farm_id and user_id = p_new_owner_user_id;

  if not found then
    raise exception 'new owner must already be a farm member' using errcode = '23503';
  end if;

  update public.farm_memberships
  set role = 'manager'
  where farm_id = p_farm_id and user_id = v_user_id and user_id <> p_new_owner_user_id;
end;
$$;

revoke all on function private.handle_new_user() from public;
revoke all on function public.create_farm(text) from public;
revoke all on function public.transfer_farm_ownership(uuid, uuid) from public;
grant execute on function public.create_farm(text) to authenticated;
grant execute on function public.transfer_farm_ownership(uuid, uuid) to authenticated;
