#!/usr/bin/env sh
set -eu

# Every public application table is user-owned or farm-owned. Requiring RLS for
# all of them makes a newly added table fail closed until its policies are added.
docker exec supabase_db_goattrack psql -U postgres -d postgres -v ON_ERROR_STOP=1 -c '
do $$
begin
  if exists (
    select 1
    from pg_catalog.pg_class as relation
    join pg_catalog.pg_namespace as namespace on namespace.oid = relation.relnamespace
    where namespace.nspname = $$public$$
      and relation.relkind = $$r$$
      and not relation.relispartition
      and not relation.relrowsecurity
  ) then
    raise exception $$Every public application table must have row-level security enabled.$$;
  end if;
end;
$$;'
