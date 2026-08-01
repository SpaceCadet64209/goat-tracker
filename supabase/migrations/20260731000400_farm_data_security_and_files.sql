-- This migration establishes the reusable farm-owned-data integrity pattern and
-- the foundation's private-file proof. Future feature migrations should follow
-- docs/farm-owned-capability-checklist.md rather than copying these tables.

do $$
begin
  create type public.farm_file_status as enum (
    'pending_upload',
    'available',
    'upload_failed',
    'delete_pending',
    'deleted'
  );
exception
  when duplicate_object then null;
end;
$$;

-- These intentionally small foundation fixtures demonstrate the composite
-- foreign-key pattern required when one farm-owned row references another.
create table if not exists public.farm_data_parents (
  id uuid primary key default extensions.gen_random_uuid(),
  farm_id uuid not null references public.farms (id) on delete cascade,
  label text not null check (char_length(trim(label)) between 1 and 120),
  created_at timestamptz not null default now(),
  constraint farm_data_parents_id_farm_id_key unique (id, farm_id)
);

create index if not exists farm_data_parents_farm_id_idx
  on public.farm_data_parents (farm_id, id);

create table if not exists public.farm_data_children (
  id uuid primary key default extensions.gen_random_uuid(),
  farm_id uuid not null references public.farms (id) on delete cascade,
  parent_id uuid not null,
  label text not null check (char_length(trim(label)) between 1 and 120),
  created_at timestamptz not null default now(),
  constraint farm_data_children_parent_farm_key
    foreign key (parent_id, farm_id)
    references public.farm_data_parents (id, farm_id)
    on delete cascade
);

create index if not exists farm_data_children_farm_id_parent_id_idx
  on public.farm_data_children (farm_id, parent_id);

create table if not exists public.farm_files (
  id uuid primary key default extensions.gen_random_uuid(),
  farm_id uuid not null references public.farms (id) on delete cascade,
  bucket_id text not null default 'farm-files' check (bucket_id = 'farm-files'),
  object_path text not null check (object_path ~ '^[0-9a-f-]{36}/[a-z0-9-]+/[0-9a-f-]{36}\\.(jpg|png|pdf)$'),
  logical_area text not null check (logical_area ~ '^[a-z0-9-]{1,40}$'),
  display_name text not null check (char_length(trim(display_name)) between 1 and 120),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'application/pdf')),
  byte_size integer not null check (byte_size > 0 and byte_size <= 10485760),
  uploaded_by uuid not null references auth.users (id) on delete restrict,
  status public.farm_file_status not null default 'pending_upload',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint farm_files_bucket_id_object_path_key unique (bucket_id, object_path),
  constraint farm_files_object_path_matches_farm check (object_path like farm_id::text || '/%'),
  constraint farm_files_deleted_state check (
    (status = 'deleted' and deleted_at is not null)
    or (status <> 'deleted' and deleted_at is null)
  )
);

create index if not exists farm_files_farm_id_status_created_at_idx
  on public.farm_files (farm_id, status, created_at desc);

drop trigger if exists farm_files_set_updated_at on public.farm_files;
create trigger farm_files_set_updated_at before update on public.farm_files
for each row execute function private.set_updated_at();

alter table public.farm_data_parents enable row level security;
alter table public.farm_data_children enable row level security;
alter table public.farm_files enable row level security;

grant select, insert, update, delete on public.farm_data_parents to authenticated;
grant select, insert, update, delete on public.farm_data_children to authenticated;
grant select, insert, update on public.farm_files to authenticated;

create policy farm_data_parents_members on public.farm_data_parents
for all to authenticated
using (private.is_active_farm_member(farm_id))
with check (private.has_farm_role(farm_id, array['owner', 'manager', 'worker']::public.farm_role[]));

create policy farm_data_children_members on public.farm_data_children
for all to authenticated
using (private.is_active_farm_member(farm_id))
with check (private.has_farm_role(farm_id, array['owner', 'manager', 'worker']::public.farm_role[]));

create policy farm_files_select_active_members on public.farm_files
for select to authenticated
using (
  (status = 'available' and private.is_active_farm_member(farm_id))
  or private.has_farm_role(farm_id, array['owner', 'manager']::public.farm_role[])
);

create policy farm_files_insert_active_members on public.farm_files
for insert to authenticated
with check (
  uploaded_by = (select auth.uid())
  and private.has_farm_role(farm_id, array['owner', 'manager', 'worker']::public.farm_role[])
);

create policy farm_files_update_managers on public.farm_files
for update to authenticated
using (private.has_farm_role(farm_id, array['owner', 'manager']::public.farm_role[]))
with check (private.has_farm_role(farm_id, array['owner', 'manager']::public.farm_role[]));

create policy farm_files_update_own_upload on public.farm_files
for update to authenticated
using (
  uploaded_by = (select auth.uid())
  and status in ('pending_upload', 'upload_failed')
)
with check (
  uploaded_by = (select auth.uid())
  and status in ('pending_upload', 'available', 'upload_failed')
  and private.has_farm_role(farm_id, array['owner', 'manager', 'worker']::public.farm_role[])
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'farm-files',
  'farm-files',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'application/pdf']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy farm_files_storage_select on storage.objects
for select to authenticated
using (
  bucket_id = 'farm-files'
  and private.is_active_farm_member((storage.foldername(name))[1]::uuid)
);

create policy farm_files_storage_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'farm-files'
  and private.has_farm_role(
    (storage.foldername(name))[1]::uuid,
    array['owner', 'manager', 'worker']::public.farm_role[]
  )
);

create policy farm_files_storage_update on storage.objects
for update to authenticated
using (
  bucket_id = 'farm-files'
  and private.has_farm_role(
    (storage.foldername(name))[1]::uuid,
    array['owner', 'manager']::public.farm_role[]
  )
)
with check (
  bucket_id = 'farm-files'
  and private.has_farm_role(
    (storage.foldername(name))[1]::uuid,
    array['owner', 'manager']::public.farm_role[]
  )
);

create policy farm_files_storage_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'farm-files'
  and private.has_farm_role(
    (storage.foldername(name))[1]::uuid,
    array['owner', 'manager']::public.farm_role[]
  )
);
