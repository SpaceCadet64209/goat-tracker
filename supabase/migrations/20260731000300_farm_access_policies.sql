-- Farm access controls are deliberately forward-only.  Policy predicates live
-- in the private schema to avoid recursive evaluation of membership policies.

create or replace function private.is_active_farm_member(p_farm_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select exists (
    select 1
    from public.farm_memberships as membership
    where membership.farm_id = p_farm_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'::public.farm_membership_status
  );
$$;

create or replace function private.has_farm_role(
  p_farm_id uuid,
  p_roles public.farm_role[]
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select exists (
    select 1
    from public.farm_memberships as membership
    where membership.farm_id = p_farm_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'::public.farm_membership_status
      and membership.role = any (p_roles)
  );
$$;

-- Direct membership changes may never leave a farm without an active owner.
-- Ownership transfer remains available through the reviewed RPC.
create or replace function private.prevent_last_active_owner()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if tg_op = 'DELETE' then
    if old.role = 'owner'::public.farm_role
      and old.status = 'active'::public.farm_membership_status
      and not exists (
        select 1
        from public.farm_memberships as membership
        where membership.farm_id = old.farm_id
          and membership.user_id <> old.user_id
          and membership.role = 'owner'::public.farm_role
          and membership.status = 'active'::public.farm_membership_status
      ) then
      raise exception 'a farm must retain an active owner' using errcode = '23514';
    end if;
    return old;
  end if;

  if old.role = 'owner'::public.farm_role
    and old.status = 'active'::public.farm_membership_status
    and (new.role <> 'owner'::public.farm_role
      or new.status <> 'active'::public.farm_membership_status)
    and not exists (
      select 1
      from public.farm_memberships as membership
      where membership.farm_id = old.farm_id
        and membership.user_id <> old.user_id
        and membership.role = 'owner'::public.farm_role
        and membership.status = 'active'::public.farm_membership_status
    ) then
    raise exception 'a farm must retain an active owner' using errcode = '23514';
  end if;
  return new;
end;
$$;

create or replace function private.prevent_farm_creator_change()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if new.created_by <> old.created_by then
    raise exception 'farm creator cannot be changed' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists farm_memberships_retain_active_owner on public.farm_memberships;
create trigger farm_memberships_retain_active_owner
before update or delete on public.farm_memberships
for each row execute function private.prevent_last_active_owner();

drop trigger if exists farms_creator_is_immutable on public.farms;
create trigger farms_creator_is_immutable
before update on public.farms
for each row execute function private.prevent_farm_creator_change();

revoke all on function private.is_active_farm_member(uuid) from public;
revoke all on function private.has_farm_role(uuid, public.farm_role[]) from public;
revoke all on function private.prevent_last_active_owner() from public;
revoke all on function private.prevent_farm_creator_change() from public;
grant execute on function private.is_active_farm_member(uuid) to authenticated;
grant execute on function private.has_farm_role(uuid, public.farm_role[]) to authenticated;

alter table public.profiles enable row level security;
alter table public.farms enable row level security;
alter table public.farm_memberships enable row level security;

grant select, update on public.profiles to authenticated;
grant select, update on public.farms to authenticated;
grant select, insert, update, delete on public.farm_memberships to authenticated;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
for select to authenticated using ((select auth.uid()) = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists farms_select_active_members on public.farms;
create policy farms_select_active_members on public.farms
for select to authenticated
using (private.is_active_farm_member(id));

drop policy if exists farms_update_owners on public.farms;
create policy farms_update_owners on public.farms
for update to authenticated
using (private.has_farm_role(id, array['owner']::public.farm_role[]))
with check (private.has_farm_role(id, array['owner']::public.farm_role[]));

drop policy if exists farm_memberships_select_active_members on public.farm_memberships;
create policy farm_memberships_select_active_members on public.farm_memberships
for select to authenticated
using (private.is_active_farm_member(farm_id));

drop policy if exists farm_memberships_insert_owners on public.farm_memberships;
create policy farm_memberships_insert_owners on public.farm_memberships
for insert to authenticated
with check (private.has_farm_role(farm_id, array['owner']::public.farm_role[]));

drop policy if exists farm_memberships_update_owners on public.farm_memberships;
create policy farm_memberships_update_owners on public.farm_memberships
for update to authenticated
using (private.has_farm_role(farm_id, array['owner']::public.farm_role[]))
with check (private.has_farm_role(farm_id, array['owner']::public.farm_role[]));

drop policy if exists farm_memberships_delete_owners on public.farm_memberships;
create policy farm_memberships_delete_owners on public.farm_memberships
for delete to authenticated
using (private.has_farm_role(farm_id, array['owner']::public.farm_role[]));
