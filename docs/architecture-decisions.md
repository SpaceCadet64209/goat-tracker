# Architecture decisions

This document records the foundation decisions that product capabilities must
preserve. It complements the OpenSpec foundation design; it does not replace
feature specifications, SQL review, or security tests.

## ADR-001: Keep database access feature-owned and direct

**Decision.** Server Components, feature-owned query functions, and Server
Actions call the generated, typed Supabase client directly. A feature may shape
its query result into an explicit view model before passing it to UI
components.

**Rationale.** Supabase queries carry meaningful PostgreSQL and RLS semantics.
A generic repository or service layer would mostly rename those operations,
hide policy-relevant filters and transactions, and add an abstraction before
there is a demonstrated reuse boundary.

**Consequences.**

- Keep normal queries and mutations in the feature that owns their behaviour.
- Keep shared `lib/` modules limited to concrete cross-cutting concerns such
  as Supabase client construction, request identity, authorization helpers,
  pagination primitives, error mapping, and logging.
- Introduce a shared abstraction only after at least two real call sites share
  the same transaction or policy behaviour and the abstraction makes that
  behaviour safer or easier to test. It must not merely wrap Supabase method
  names.
- Return deliberately shaped data to UI code; do not expose broad generated
  database row types as component contracts.

## ADR-002: Farm identity is explicit and database-enforced

**Decision.** Every farm-owned capability uses an explicit farm UUID, normally
in the `/farms/[farmId]/...` route. The server validates the UUID and reads or
writes with the current user's Supabase session. PostgreSQL constraints and RLS
remain the enforcement boundary.

**Rationale.** Explicit context is safe for deep links, concurrent tabs, and
multiple farm memberships. A cookie, local storage value, or client context may
improve navigation but never grants access or substitutes for the URL and RLS.

**Consequences.**

- A route or Server Action must derive and validate farm context from trusted,
  request-scoped input.
- Server authorization helpers may provide early, user-friendly failures, but
  they do not replace RLS policies or database constraints.
- Unrelated, anonymous, and inactive users must receive no protected rows or
  protected error details.

## ADR-003: Treat a farm-owned table as a secure unit of change

**Decision.** A new farm-owned table is not complete until its ownership,
integrity, access paths, grants, RLS policies, and allowed/denied tests ship in
the same reviewed change.

**Rationale.** Client validation and route checks can be bypassed. Tenant
isolation must survive direct database access and future application mistakes.

**Consequences.**

- `farm_id uuid NOT NULL REFERENCES public.farms(id)` is required for every
  farm-owned row.
- Tenant-filtered indexes begin with `farm_id`.
- Domain checks, foreign keys, uniqueness constraints, and transactional
  database functions enforce critical invariants.
- When a row references another farm-owned row, use a composite key or
  equivalent database constraint that includes `farm_id`, so cross-farm links
  are impossible.
- Enable RLS (and force it where appropriate), grant only required operations,
  and write operation-specific policies using the reviewed active-membership
  predicates.
- Test permitted role behaviour and denied anonymous, inactive, unrelated, and
  cross-farm behaviour directly against local Supabase.

## ADR-004: Preserve user-scoped Supabase access; isolate admin access

**Decision.** Normal application reads and writes use the browser or
server-request client under the signed-in user's JWT. The service-role client
is confined to an explicitly named `server-only` module and narrowly reviewed
operations that inherently require it.

**Rationale.** Using the service role for ordinary server code bypasses RLS and
turns application defects into tenant-data exposure.

**Consequences.**

- Browser-reachable code uses only the Supabase URL and publishable key.
- Every privileged operation establishes the caller's identity, re-checks
  authorization, validates input, and logs a safe operation/outcome audit
  event.
- Service-role credentials are never public environment variables, props,
  browser imports, or log data.
- Middleware refreshes session cookies only; it is not an authorization
  boundary.

## ADR-005: Migrations are forward-only and deployment-safe

**Decision.** Supabase migrations are the source of truth. Applied migrations
are immutable; corrections use a new forward migration. Releases use an
expand/contract sequence when application and schema compatibility matters.

**Rationale.** An application deployment must not temporarily expose a new
table, break an older deployment, or drift from generated database types.

**Consequences.**

1. Add compatible schema, indexes, grants, constraints, functions, and RLS
   policies.
2. Reset and test the local database; regenerate and verify committed types.
3. Deploy application code compatible with both old and new schema shapes.
4. Run idempotent, observable backfills where needed, then enforce stricter
   constraints after validation.
5. Remove obsolete structures only in a later compatible release.

Preview and staging must use explicitly non-production Supabase projects.
Production database changes are promoted before application code that depends
on them, with backup verification and a forward-fix plan. Roll back an
application only when its schema compatibility is known.
