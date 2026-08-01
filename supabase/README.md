# Local Supabase

Supabase migrations in `supabase/migrations` are the database source of truth. Never edit an applied migration; add a new, forward-only migration instead.

Prerequisites: Docker Desktop running and the Supabase CLI available through `pnpm dlx supabase`.

```sh
pnpm db:start   # starts the local Supabase stack
pnpm db:status  # shows local URLs and keys
pnpm db:reset   # reapplies all migrations and supabase/seed.sql
pnpm db:seed    # alias for reset; seeds are reset-safe and fictional
pnpm db:types   # regenerates committed TypeScript database types
pnpm db:types:check # verifies committed types match the local schema
```

`supabase/seed.sql` creates only fictional `.test` users and farms. Its fixture password is deliberately local-only; never copy seed data or credentials to preview, staging, or production.

After `pnpm db:start`, copy the local API URL, publishable key, and service-role key printed by `pnpm db:status` to `.env.local`. The service-role key stays server-only.

Before opening a pull request that changes migrations, run `pnpm db:reset`, `pnpm db:types`, and `pnpm db:types:check` with the local stack running.
