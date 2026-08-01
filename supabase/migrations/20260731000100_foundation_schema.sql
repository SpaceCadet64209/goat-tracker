-- Foundation tables are intentionally created before application access policies.
-- Later migrations must be forward-only; never edit an applied migration.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public;

do $$
begin
  create type public.farm_role as enum ('owner', 'manager', 'worker');
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.farm_membership_status as enum ('active', 'inactive');
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.farm_status as enum ('active', 'archived');
exception
  when duplicate_object then null;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.farms (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  status public.farm_status not null default 'active',
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.farm_memberships (
  id uuid primary key default extensions.gen_random_uuid(),
  farm_id uuid not null references public.farms (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.farm_role not null,
  status public.farm_membership_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint farm_memberships_farm_id_user_id_key unique (farm_id, user_id)
);

create index if not exists farm_memberships_user_id_status_farm_id_idx
  on public.farm_memberships (user_id, status, farm_id);
create index if not exists farm_memberships_farm_id_status_role_idx
  on public.farm_memberships (farm_id, status, role);
create index if not exists farms_created_by_idx on public.farms (created_by);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function private.set_updated_at();

drop trigger if exists farms_set_updated_at on public.farms;
create trigger farms_set_updated_at before update on public.farms
for each row execute function private.set_updated_at();

drop trigger if exists farm_memberships_set_updated_at on public.farm_memberships;
create trigger farm_memberships_set_updated_at before update on public.farm_memberships
for each row execute function private.set_updated_at();

revoke all on function private.set_updated_at() from public;
