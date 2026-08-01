## Why

GoatTrack needs an independent, maintainable foundation before product features are rebuilt from the Base44 reference. Establishing the security, tenancy, data, testing, and deployment conventions first reduces the risk of feature teams embedding incompatible assumptions or weakening farm-data isolation.

## What Changes

- Establish a strict TypeScript Next.js App Router application foundation for Vercel, with Tailwind CSS and shadcn/ui conventions and a mobile-usable application shell.
- Use the screenshots in `Images/` as product and interaction references for the independent application shell, preserving the intended farm identity and Dashboard, Goats, Weigh, Vaccinations, and Programs information architecture without reproducing Base44 editor chrome or generated implementation.
- Define direct Supabase integration patterns for PostgreSQL, Auth, Storage, and Row-Level Security without carrying over Base44 architecture or SDK dependencies.
- Establish farm-based multi-tenancy in which a user may own or belong to multiple farms and all farm-management data is scoped to a farm.
- Define owner, manager, and worker authorization semantics, including server-side enforcement and database-backed policy boundaries.
- Establish migration, database-constraint, validation, error-handling, testing, environment, logging, and observability conventions.
- Provide only the minimum vertical foundation needed to prove authentication, farm selection, tenant isolation, protected storage, deployment readiness, responsive navigation, and safe mobile form/sheet behavior.
- Defer the full Dashboard, goat register/profile, weight, vaccination, account deletion, and PWA feature implementations to later changes.

## Capabilities

### New Capabilities

- `user-authentication`: Secure sign-in, sign-out, session refresh, and protected-route behavior using Supabase Auth.
- `farm-tenancy`: Farm creation, membership, active-farm selection, and mandatory farm ownership of farm-management records.
- `role-based-access`: Owner, manager, and worker permissions with least-privilege enforcement.
- `protected-data-access`: Row-Level Security, database constraints, and trusted server access conventions that preserve tenant isolation.
- `protected-file-access`: Farm-scoped private file storage with authorized upload and download behavior.
- `application-shell`: A mobile-usable authenticated shell with consistent validation, error, loading, and empty-state behavior.

### Modified Capabilities

None. This repository has no existing capability specifications.

## Impact

- Introduces the independent Next.js application structure and its core dependency/tooling conventions.
- Introduces Supabase schemas, migrations, policies, storage conventions, generated database types, and local test infrastructure.
- Establishes Vercel and Supabase environment boundaries for local development, preview, staging, and production.
- Creates security and architecture contracts that all later farm-management capabilities must follow.
- Treats the reference screenshots as evidence for visual hierarchy, mobile interaction constraints, and future feature boundaries rather than a pixel-for-pixel design or code source.
- Does not migrate Base44 code or data and does not implement the complete product feature set.
