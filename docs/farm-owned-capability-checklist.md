# Checklist: adding a farm-owned capability

Use this checklist when adding a capability that stores or exposes farm data.
Complete it in the capability's OpenSpec change and pull request. UI controls
and client validation improve usability, but they are never the authorization
or integrity boundary.

## Scope and application design

- [ ] Define the capability's rows, lifecycle states, role permissions, and
      sensitive operations in its specification.
- [ ] Put pages under an explicit `/farms/[farmId]/...` context (or document an
      equivalent explicit, validated farm context for a non-page entry point).
- [ ] Validate route parameters and all untrusted Server Action/Route Handler
      input with feature-owned Zod schemas.
- [ ] Keep queries and Server Actions in the owning feature and use the typed,
      user-scoped Supabase client directly.
- [ ] Shape database results into a feature view model before passing them to
      UI components.
- [ ] Do not add a generic repository/service wrapper. Propose a narrowly
      scoped shared helper only after two real call sites share policy or
      transaction behaviour, and document why it is safer or easier to test.
- [ ] Use server authorization helpers only for friendly early outcomes; retain
      RLS and constraints as the enforcement boundary.

## Migration and integrity

- [ ] Add a new, forward-only migration; do not modify an applied migration.
- [ ] Add `farm_id uuid NOT NULL REFERENCES public.farms(id)` to every
      farm-owned table.
- [ ] Add tenant-leading indexes beginning with `farm_id` for expected
      farm-scoped reads, writes, and uniqueness paths.
- [ ] Add `NOT NULL`, `CHECK`, foreign-key, and uniqueness constraints for all
      critical domain invariants.
- [ ] When referencing another farm-owned record, include `farm_id` in a
      composite foreign key or equivalent constraint that rejects cross-farm links.
- [ ] Use an atomic database function/transaction for invariants that must
      survive concurrent writes.
- [ ] Keep types, extensions, tables, constraints, indexes, grants, functions,
      and policies in a deployable sequence with no exposed user/farm table.

## RLS, grants, and privileged operations

- [ ] Enable RLS (and force it where appropriate) before the table is usable.
- [ ] Grant only the database operations needed by `anon`, `authenticated`, and
      service roles; do not rely on default privileges.
- [ ] Add explicit `SELECT`, `INSERT`, `UPDATE`, and `DELETE` policies for the
      operations the feature supports, using active-membership semantics and the
      minimum permitted role.
- [ ] Use only reviewed, pinned-search-path membership predicate functions;
      grant their execution narrowly.
- [ ] Confirm workers cannot perform deletion unless the capability explicitly
      changes that permission in its approved specification.
- [ ] Keep normal reads and writes on the user-scoped client so RLS is tested
      in the real application path.
- [ ] If a service-role operation is truly required, keep it in a `server-only`
      module; establish identity, re-check authorization, validate input, and emit
      a redacted audit event before it executes.

## Verification and promotion

- [ ] Add SQL policy/constraint tests for every allowed role operation and for
      anonymous, inactive-member, unrelated-user, and cross-farm denial cases.
- [ ] Add integration tests with distinct authenticated identities, including
      a direct database attempt that bypasses frontend validation.
- [ ] Add focused E2E coverage for the farm context and role-visible behaviour
      where the capability has user-facing interaction.
- [ ] Run the local migration reset and confirm test data is fictional and
      isolated from production.
- [ ] Regenerate committed Supabase TypeScript types and run the type-drift
      check.
- [ ] Use the CI database inspection to confirm RLS is enabled for every
      user-owned or farm-owned table.
- [ ] Use expand/contract for incompatible changes: deploy compatible schema
      and policies first, backfill observably, then enforce/remove in a later
      release.
- [ ] Rehearse migration and smoke tests in non-production before production;
      verify backup, forward-fix, and application rollback compatibility.
