## Context

See `proposal.md` for motivation. The repository has an OpenSpec root but no existing application architecture or capability specifications. GoatTrack is being rebuilt from a Base44 product reference as an independent application; Base44-generated code, architecture, and SDK dependencies are not inputs to this design.

The target is a mobile-usable Next.js App Router application hosted on Vercel, backed by Supabase PostgreSQL, Auth, and Storage. The design must make farm tenancy and authorization structural properties rather than feature-by-feature conventions.

## Goals / Non-Goals

**Goals:**

- Create a small, production-shaped foundation that proves authentication, farm context, authorization, RLS, private storage, validation, testing, and deployment.
- Make the secure path the simplest path for later feature development.
- Keep reads close to Server Components and mutations close to their owning feature.
- Use database constraints and policies as authoritative integrity and isolation controls.
- Preserve good mobile usability from the first application shell.

**Non-Goals:**

- Rebuild the complete dashboard, goat, weight, vaccination, account settings, account deletion, or offline-sync experiences.
- Copy or adapt Base44-generated source code, data access patterns, or SDKs.
- Create a generic repository/service abstraction over Supabase.
- Design a public API, background-job platform, real-time collaboration model, or cross-farm analytics system.
- Perform production data migration from Base44.

## Product Boundaries

This change includes:

- Application bootstrap, strict TypeScript, code-quality gates, styling primitives, and responsive authenticated/public shells.
- Email/password authentication foundations, verification, password reset, session refresh, and protected navigation.
- Profiles, farms, memberships, roles, current-farm navigation, RLS helpers, and a minimal farm onboarding flow.
- A private farm-file storage convention and one minimal upload/download proof.
- Shared validation/error conventions, test harnesses, deployment configuration, and operational baselines.
- PWA metadata and an installable shell; responsive web behavior is required.

This change excludes:

- Domain tables and full interfaces for goats, weights, vaccinations, vaccination programs, or dashboards.
- Full account settings and account deletion workflows. The architecture reserves a server-only privileged path for later account deletion.
- Offline data writes, conflict resolution, push notifications, and background synchronization.
- Invitations and custom roles unless needed to prove membership boundaries; the initial foundation may seed memberships directly in tests.

Later domain changes must satisfy two invariants:

1. Every farm-management row has a non-null `farm_id`.
2. Authorization is enforced in PostgreSQL RLS and constraints, not only in the UI or route code.

## Architecture Overview

```text
Browser
  |
  | HTTPS + Supabase user session
  v
Next.js on Vercel
  +-- Server Components: read-heavy pages using user-scoped Supabase client
  +-- Client Components: forms, charts, menus, upload interaction
  +-- Server Actions: validated application mutations
  +-- Route Handlers: auth callbacks, health checks, binary/webhook boundaries
  |
  | publishable key + user JWT (normal path)
  v
Supabase
  +-- Auth
  +-- PostgreSQL constraints, functions, transactions, and RLS
  +-- Private Storage buckets and storage policies

Server-only exceptional path
  Vercel function -- service-role key --> narrow administrative operations
```

The Next.js application is a backend-for-frontend, not a second authorization database. Normal server-side requests use the signed-in user's Supabase session so RLS remains effective. Privileged credentials are reserved for a small, explicitly named server-only module and are never used as a convenience to bypass policy checks.

## Repository Structure

```text
/
├── app/
│   ├── (public)/                 # landing and public metadata
│   ├── (auth)/                   # sign-in, sign-up, reset, callback views
│   ├── (app)/
│   │   └── farms/[farmId]/       # explicit tenant context in every farm URL
│   ├── api/health/               # operational route
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── loading.tsx
│   └── manifest.ts
├── components/
│   ├── ui/                       # shadcn/ui-owned primitives
│   └── app-shell/                # navigation and layout components
├── features/
│   ├── auth/                     # auth-specific schemas, actions, UI
│   ├── farms/                    # farm/member schemas, actions, queries, UI
│   └── files/                    # farm-file schemas, actions, UI
├── lib/
│   ├── supabase/                 # browser, server, middleware, admin clients
│   ├── auth/                     # request identity and authorization helpers
│   ├── errors/                   # typed public error contract and mapping
│   ├── validation/               # shared primitives only
│   ├── logging/                  # structured logger and redaction
│   └── env/                      # server/client environment parsing
├── supabase/
│   ├── migrations/
│   ├── seed.sql                  # local/test data only
│   ├── tests/                    # SQL policy/constraint tests
│   └── config.toml
├── tests/
│   ├── integration/              # Vitest against local Supabase
│   ├── fixtures/
│   └── helpers/
├── e2e/                          # Playwright journeys
├── public/                       # icons and static assets
└── openspec/
```

Feature folders may import shared infrastructure from `lib`, but shared infrastructure must not import features. A feature can contain small query functions and Server Actions. A generic service or repository layer is introduced only when repeated policy or transaction behavior creates a concrete abstraction boundary.

## Decisions

### 1. Server-first App Router composition

Read-heavy pages and layouts are Server Components. They fetch data through a server Supabase client under the current user's session and pass serializable view data into the smallest practical Client Components. React Hook Form is used only for interactive forms; Recharts is isolated behind client boundaries and loaded only on pages that need charts.

Mutations live in feature-owned Server Actions when they originate in the web UI. Route Handlers are reserved for protocol boundaries such as auth callbacks, health checks, future webhooks, or responses that Server Actions do not model cleanly.

Middleware refreshes auth cookies and performs only coarse redirect assistance. It is not an authorization boundary because it cannot replace server checks or RLS.

**Alternatives considered:** A client-rendered SPA would increase bundles and loading states; a custom API for every read would duplicate the backend-for-frontend; a universal repository layer would conceal Supabase/RLS semantics without a current reuse benefit.

### 2. Explicit farm context in URLs

Authenticated farm routes use `/farms/[farmId]/...`. The ID is validated as a UUID and access is verified for every request. A remembered last farm may improve redirects after sign-in, but it never grants access and is not the sole source of tenant context.

This makes links unambiguous, supports multiple memberships, and reduces accidental cross-farm reads caused by hidden global state. Human-readable slugs can be added later without changing the database key.

**Alternatives considered:** A farm stored only in a cookie or client context is convenient but unsafe for deep links, concurrent tabs, and server rendering.

### 3. Direct Supabase integration with four explicit client types

- Browser client: uses only the public Supabase URL and publishable key.
- Server request client: reads/writes session cookies and uses the user's JWT.
- Middleware client: refreshes sessions and propagates cookies.
- Admin client: imports from a `server-only` module and uses the service-role key for narrowly reviewed operations.

Normal reads and writes, including Server Actions, use the user-scoped client. Admin access is limited to operations that inherently require Supabase Auth administration, such as the future final account deletion step. Each admin call must first establish the user's identity, re-check authorization, validate input, and emit an audit event. The service-role key is never placed in a `NEXT_PUBLIC_` variable, serialized into props, logged, or imported by a Client Component.

Generated Supabase database types are committed and regenerated after migrations. Query functions return deliberately shaped data rather than leaking broad generated row types into UI components.

**Alternatives considered:** Using the service role for all server code would make RLS testing less representative and turn application mistakes into tenant-data exposure.

### 4. Authentication architecture

The initial supported credential flow is email/password with email verification, password reset, sign-out, and secure session refresh. Supabase owns credentials and token issuance. The application owns a `profiles` row keyed one-to-one to `auth.users.id`; a database trigger creates the minimal profile safely and idempotently after signup.

Protected layouts verify the current user server-side. Unauthenticated requests are redirected to sign-in with a validated same-origin return path. Authenticated users with no farm membership enter farm onboarding. Users with one farm may be redirected to it; users with multiple farms select explicitly.

OAuth providers, MFA, and enterprise identity are deferred. Their later addition must converge on the same profile, session, and farm authorization model.

### 5. Farm tenancy and ownership model

Core relations:

```text
auth.users 1---1 profiles
     |
     | user_id
     v
farm_memberships >---1 farms
                         |
                         | farm_id (NOT NULL)
                         v
                 future farm records
```

`farms` has a UUID primary key, display name, creator audit field, timestamps, and lifecycle state. `farm_memberships` has `(farm_id, user_id)` uniqueness, a constrained role, membership status, and timestamps. Ownership is represented by an active membership with role `owner`; `farms.created_by` is audit provenance, not the authorization source.

Farm creation occurs through a transactional database function that inserts both the farm and its first owner membership. Owner removal, transfer, or departure must use a transaction that preserves at least one active owner. Direct writes that could violate these invariants are denied.

Every future farm-owned table must include:

- `farm_id uuid NOT NULL REFERENCES farms(id)`;
- RLS enabled and forced where appropriate;
- indexes beginning with `farm_id` for tenant-filtered access paths;
- constraints for domain invariants;
- composite foreign keys where a child references another farm-owned parent, preventing cross-farm links even if application validation fails.

### 6. Roles and permissions

The initial roles are intentionally fixed:

| Capability                           | Owner | Manager |                 Worker |
| ------------------------------------ | ----: | ------: | ---------------------: |
| View farm and operational records    |   Yes |     Yes |                    Yes |
| Create/update routine farm records   |   Yes |     Yes |                    Yes |
| Delete routine farm records          |   Yes |     Yes |                     No |
| Manage files used by routine records |   Yes |     Yes | Limited to create/view |
| Manage members and roles             |   Yes |      No |                     No |
| Change farm settings                 |   Yes |      No |                     No |
| Delete farm / transfer ownership     |   Yes |      No |                     No |

Feature specs may narrow worker permissions for sensitive record types. They cannot broaden manager/worker access to ownership operations without modifying this capability.

Permission checks are centralized as small, named predicates at the database policy layer and mirrored by server helpers for early, user-friendly failures. UI visibility is a convenience, never enforcement.

### 7. Database migration strategy

Supabase CLI migrations under `supabase/migrations` are the source of truth. Schema changes are authored locally, reviewed as SQL, applied to a reset local database, tested, and promoted in order. Applied migrations are immutable; corrections use a new forward migration.

The first migrations establish extensions and private helper schemas, then enum/domain types, tables and constraints, transactional functions, indexes, RLS policies, storage configuration, and grants. Migrations should be small enough to review but keep a table's initial security controls in the same deployable sequence so no environment contains an exposed user table.

Production changes follow expand/contract when data or code compatibility is involved:

1. Add backward-compatible schema and policies.
2. Deploy compatible application code.
3. Backfill with an idempotent, observable operation where needed.
4. Enforce new constraints after validation.
5. Remove obsolete structures in a later release.

Local-only seeds use fictional data and never contain production exports or real credentials. Database types are regenerated and checked for drift in CI.

### 8. Row-Level Security strategy

RLS is enabled on every table containing user-owned or farm-owned data. Policies use `auth.uid()` plus small `SECURITY DEFINER` membership predicates in a non-exposed schema to avoid recursive membership-policy evaluation. Such functions pin `search_path`, use fully qualified objects, expose only boolean/identifier results, and receive explicit execute grants only for necessary roles.

Policy shape:

- `profiles`: a user can read/update the permitted fields of their own profile.
- `farms`: active members can select; only owners can change ownership/settings operations.
- `farm_memberships`: members can see appropriate membership information; owners manage membership; users cannot promote themselves.
- Future farm records: select/write policies require active membership and the minimum role for the operation.
- Storage objects: the first path segment identifies `farm_id`; policies require matching active membership and operation-level role.

RLS does not replace constraints. `NOT NULL`, foreign keys, unique constraints, checks, and transaction functions enforce integrity. Conversely, application validation and constraints do not replace RLS.

Policy tests must prove both permitted behavior and forbidden cross-farm behavior. Tests run as anonymous, owner, manager, worker, unrelated authenticated user, and service roles where relevant.

### 9. File storage strategy

Farm files use a private Supabase Storage bucket. Object paths follow:

`<farm_id>/<logical-area>/<random-object-id>.<validated-extension>`

User-supplied filenames are stored as sanitized display metadata, never trusted as object paths. A farm-owned metadata row records the storage bucket/path, MIME type, byte size, uploader, and related entity when one exists. A unique constraint prevents duplicate path records.

Uploads validate authorization, size, MIME type, and extension. Bucket limits provide a second control. Downloads use short-lived signed URLs or authenticated object access after membership checks. Public URLs are not used for farm records. Deleting a domain record and its object uses an explicit, retryable workflow so failures can be reconciled rather than silently orphaning files.

The foundation proves the pattern with a minimal farm-file interaction but does not define goat-photo or vaccination-document UX.

### 10. Validation and error handling

Zod schemas define untrusted input boundaries: forms, route parameters, environment variables, and external payloads. React Hook Form uses the same feature-owned schemas where the browser needs immediate feedback. Server Actions always validate again; client validation is advisory.

Database constraints remain authoritative for critical integrity. Known PostgreSQL/Supabase errors are mapped to stable application error codes without exposing SQL text, table internals, or secrets.

Server Action results use a discriminated shape:

```text
success: { ok: true, data? }
failure: { ok: false, code, message, fieldErrors?, correlationId? }
```

Messages are safe and actionable. Unexpected errors are logged with a correlation ID and surface a generic recovery message. Authentication failures, authorization failures, not-found results, conflicts, validation errors, rate limits, and unexpected failures remain distinguishable. Next.js error boundaries cover route-level failures; expected form errors stay inline.

### 11. Mobile and PWA foundation

The shell starts mobile-first: touch targets, readable form sizing, responsive navigation, safe-area support, keyboard-visible form behavior, and no required horizontal scrolling at supported viewport widths. Semantic HTML, visible focus, labels, and color contrast are baseline requirements.

The foundation supplies manifest metadata, icons, theme color, and installable display configuration. Offline mutation queues, cached private data, and synchronization are deferred because they introduce security and conflict-resolution requirements. The initial app remains a network-dependent responsive web application when installed.

### 12. Testing architecture

Testing follows the security boundary rather than relying on a single test style:

- Vitest unit tests: Zod schemas, permission mappings, error mapping, pure view-model transformations, and environment parsing.
- Vitest integration tests: feature queries/actions against a reset local Supabase instance using real migrations and distinct authenticated identities.
- SQL policy/constraint tests: direct assertions for grants, RLS allow/deny matrices, ownership invariants, and cross-farm foreign-key protection.
- Playwright end-to-end tests: sign-up/sign-in, protected redirects, farm onboarding/selection, role-visible behavior, forbidden cross-farm URL access, private file access, sign-out, and key mobile viewport behavior.

Tests create isolated users and farms through controlled fixtures and clean up deterministically. CI runs formatting/linting, strict type checking, unit tests, migration reset and database tests, integration tests, production build, and a focused Playwright suite. Broader browser coverage can run on the default branch or pre-release pipeline.

No test is allowed to depend on production or shared mutable production-like data.

### 13. Deployment environments

| Environment | Application              | Supabase                                                                                         | Purpose                                               |
| ----------- | ------------------------ | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| Local       | Next.js local server     | Local Supabase stack                                                                             | Development, migration, integration, and policy tests |
| Preview     | Vercel preview           | Isolated Supabase branch where available; otherwise explicitly configured non-production project | Per-change review and E2E smoke tests                 |
| Staging     | Stable Vercel deployment | Dedicated staging project                                                                        | Release candidate and migration rehearsal             |
| Production  | Vercel production        | Dedicated production project                                                                     | Live customer data                                    |

Preview and staging must never point at production. Production migrations run as an explicit release step before compatible application deployment, with backups and rollback/recovery procedures verified. Application rollback uses the previous Vercel deployment only when its schema compatibility is known.

### 14. Environment-variable management

Environment variables are parsed and validated at process startup/build boundaries with separate client-safe and server-only schemas.

Client-visible:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- explicitly public application origin/telemetry identifiers if introduced

Server-only:

- `SUPABASE_SERVICE_ROLE_KEY`
- deployment or observability secrets
- any future webhook signing secrets

Local values live in ignored environment files generated from a committed redacted example. Vercel environment settings hold preview/staging/production values; secrets are never committed. Rotation is documented and environment access follows least privilege. CI checks that server-only modules are not reachable from client bundles.

### 15. Logging and observability

Server logs are structured and include timestamp, severity, environment, operation, correlation/request ID, and safe identifiers such as internal farm/user UUIDs only when needed. Logs exclude access/refresh tokens, passwords, service keys, signed URLs, request cookies, raw form payloads, and unnecessary personal data.

The initial baseline uses Vercel runtime/build logs, Supabase database/Auth logs, and a health endpoint that checks application liveness without exposing secrets. Unexpected errors carry a correlation ID between the user-safe response and server log.

Release checks monitor error rate, latency, auth failures, database/policy errors, migration outcome, and storage errors. A dedicated error tracker can be added later behind the same logger interface when retention, data residency, alert routing, and cost are chosen. Security-relevant owner/member/admin actions are candidates for a durable database audit log in a later capability; privileged service-role actions must be logged from the start.

### 16. No generic service/repository layer

Queries and mutations remain feature-local and call the typed Supabase client directly. Small shared helpers are permitted for concrete cross-cutting needs: authenticated identity, farm authorization predicates, pagination primitives, error translation, logging, and client construction.

An abstraction is added only when at least two real call sites share transaction/policy behavior and the abstraction makes that behavior safer or easier to test. It must not merely rename Supabase methods.

## Risks / Trade-offs

- **[Hidden RLS gaps as new tables are added]** → Require a migration checklist, negative policy tests, and CI inspection that every user/farm table has RLS enabled.
- **[Service-role bypass causes tenant exposure]** → Keep the admin client server-only, prohibit it in normal reads/writes, review every import, and test the user-scoped path.
- **[Recursive or slow membership policies]** → Use reviewed helper predicates, index membership and `farm_id` access paths, and inspect query plans for representative data.
- **[Owner invariant is difficult under concurrent changes]** → Route ownership changes through transactional database functions and lock relevant membership rows.
- **[Explicit farm IDs make URLs less friendly]** → Prefer correctness and stable links now; add slugs later as presentation aliases.
- **[Direct Supabase calls couple features to the provider]** → Accept deliberate coupling to the selected platform; isolate client creation and policy helpers without speculative repositories.
- **[Preview infrastructure cost or branch availability]** → Permit an explicitly non-production shared project for low-risk previews, while keeping tests isolated by generated tenant data and never using production.
- **[Installed PWA implies offline expectations]** → Clearly treat the first release as network-dependent and defer caching private records until an offline security design exists.
- **[Database and application deployment drift]** → Enforce migration/type drift checks and use backward-compatible expand/contract releases.

## Migration Plan

There is no existing independent GoatTrack production schema to migrate in this change.

1. Bootstrap the Next.js and Supabase local toolchain.
2. Apply foundational schema, functions, grants, RLS, and storage policies locally.
3. Prove policy and constraint behavior with automated tests.
4. Deploy to preview against non-production Supabase and run smoke/E2E tests.
5. Rehearse migrations in staging, verify logs and health checks, then deploy the compatible application.
6. Provision production secrets and database independently; apply migrations and run post-deploy tenant-isolation smoke checks.

Rollback favors forward database fixes. Application rollback is allowed only while the prior version is compatible with the migrated schema. Destructive schema contractions are excluded from the initial foundation.

## Initial Implementation Phases

1. **Tooling and shell** — Bootstrap strict Next.js, styling, shadcn/ui ownership, environment validation, responsive layouts, manifests, and quality scripts.
2. **Local Supabase and schema** — Establish migrations, generated types, profile/farm/membership schema, constraints, transactional functions, seeds, and type-drift checks.
3. **Authentication** — Add Supabase clients, cookie refresh, auth flows, protected routing, profile bootstrap, and auth tests.
4. **Tenant authorization** — Add explicit farm routing, farm onboarding/selection, role predicates, RLS policies, and exhaustive isolation tests.
5. **Private storage proof** — Add private bucket policies, metadata, a minimal interaction, validation, and access tests.
6. **Operational readiness** — Add structured errors/logging, health checks, CI gates, Vercel environments, staging rehearsal, and focused Playwright journeys.
7. **Foundation acceptance** — Threat-model review, mobile/accessibility pass, documentation, and confirmation that deferred product modules remain unimplemented.

## Open Questions

- The final South African deployment region and any data-retention obligations can be selected during environment provisioning without changing this architecture.
- A dedicated error-tracking vendor and alert destination can be chosen after baseline traffic and operational ownership are known.
- Brand assets beyond the name “Kallanko Boerbok Stoet” can be supplied later without changing the foundation contracts.
