## 1. Application Bootstrap

- [x] 1.1 Bootstrap a Next.js App Router project with strict TypeScript and the agreed package-manager/runtime versions
- [x] 1.2 Add Tailwind CSS, shadcn/ui ownership conventions, React Hook Form, Zod, Recharts, Vitest, and Playwright dependencies without any Base44 SDK dependency
- [x] 1.3 Configure formatting, linting, strict type checking, unit-test, integration-test, E2E, and production-build scripts
- [x] 1.4 Create the public, authentication, and authenticated route groups plus feature and shared-infrastructure directory boundaries
- [x] 1.5 Add validated client-safe and server-only environment schemas with a redacted example environment file

## 2. Responsive Application Shell

- [x] 2.1 Establish accessible typography, color tokens, focus treatment, form sizing, and mobile-first layout primitives
- [x] 2.2 Build the Server Component application shell with responsive primary navigation, account actions, and an explicit current-farm region
- [x] 2.3 Add route loading, empty, not-found, route error, and global error states with safe recovery behavior
- [x] 2.4 Add application manifest metadata, branded placeholder icons, theme metadata, and standalone display configuration
- [x] 2.5 Verify the shell at supported mobile widths for touch targets, keyboard access, safe areas, and absence of required horizontal scrolling

## 3. Supabase Local Foundation

- [ ] 3.1 Initialize the local Supabase configuration and document local start, reset, seed, and status commands
- [ ] 3.2 Add ordered migrations for the private helper schema, required extensions, constrained role/status types, profiles, farms, and farm memberships
- [ ] 3.3 Add database constraints and indexes for profile identity, unique memberships, valid states, tenant-filtered access, and timestamps
- [ ] 3.4 Add an idempotent authenticated-user profile bootstrap trigger with restricted privileges and pinned search path
- [ ] 3.5 Add transactional database functions for farm creation and ownership changes that preserve at least one active owner
- [ ] 3.6 Add fictional local/test seed data with multiple users, farms, and roles and no real credentials or production data
- [ ] 3.7 Generate and commit Supabase database TypeScript types and add a CI drift check

## 4. Supabase Client and Authentication

- [x] 4.1 Implement separate browser, server-request, and middleware Supabase client factories using only publishable browser credentials
- [x] 4.2 Add a server-only admin client module and an import boundary test that prevents it from entering browser-reachable code
- [x] 4.3 Implement cookie-based session refresh middleware with validated same-origin return paths and no authorization logic
- [x] 4.4 Implement sign-up with email verification, sign-in, sign-out, password recovery, and password update flows using shared Zod schemas
- [x] 4.5 Protect authenticated layouts with server-side identity checks and handle unverified, expired, and absent sessions safely
- [x] 4.6 Add Vitest coverage for auth validation, return-path validation, and safe authentication error mapping
- [x] 4.7 Add Playwright coverage for sign-up/sign-in prerequisites, protected redirects, password recovery entry, session expiry behavior, and sign-out

## 5. Farm Tenancy and Role Authorization

- [x] 5.1 Add reviewed database membership predicates with explicit grants, pinned search paths, and active-membership semantics
- [x] 5.2 Enable RLS and add policies for profiles, farms, and farm memberships for anonymous, owner, manager, worker, and unrelated-user cases
- [x] 5.3 Add database policy tests covering allowed operations, denied cross-farm operations, self-promotion denial, inactive membership, and sole-owner protection
- [x] 5.4 Implement farm onboarding that invokes the atomic farm-creation operation and establishes the creator as owner
- [x] 5.5 Implement `/farms/[farmId]` routing with UUID validation and user-scoped server reads
- [x] 5.6 Implement no-farm, single-farm, and multi-farm entry behavior plus explicit farm switching
- [x] 5.7 Add small server authorization helpers for friendly early failures while retaining RLS as the enforcement boundary
- [x] 5.8 Add integration tests using distinct authenticated identities to prove owner, manager, worker, inactive-member, and unrelated-user behavior
- [x] 5.9 Add Playwright journeys for onboarding, farm selection, cross-farm URL denial, role-visible controls, and mobile tenant switching

## 6. Farm-Owned Data Security Pattern

- [ ] 6.1 Document and encode a migration checklist requiring non-null `farm_id`, foreign keys, tenant-leading indexes, RLS, grants, and policy tests for every future farm-owned table
- [ ] 6.2 Add a minimal test-only or foundation-owned parent/child schema fixture that proves composite foreign keys reject cross-farm relationships
- [ ] 6.3 Add a CI database inspection that fails when a user-owned or farm-owned table lacks enabled RLS
- [ ] 6.4 Add negative integration tests showing that bypassing frontend validation cannot violate required ownership, state, uniqueness, or cross-farm constraints

## 7. Private Farm File Pattern

- [ ] 7.1 Add migrations for private farm-file metadata with non-null farm ownership, generated object-path uniqueness, uploader provenance, and recoverable lifecycle state
- [ ] 7.2 Provision a private storage bucket with explicit file-size and allowed-type limits
- [ ] 7.3 Add storage object policies that derive farm scope from the object path and enforce active membership plus operation-specific role permissions
- [ ] 7.4 Implement feature-owned upload validation and generated `<farmId>/<logicalArea>/<objectId>.<extension>` paths without trusting supplied filenames
- [ ] 7.5 Implement a minimal authorized upload and short-lived/authenticated download interaction to prove the storage pattern
- [ ] 7.6 Implement retryable deletion/reconciliation behavior for partial object-and-metadata failures
- [ ] 7.7 Add policy and integration tests for permitted access, cross-farm denial, unsafe filenames, disallowed types/sizes, worker deletion denial, and partial failure recovery

## 8. Validation, Errors, and Observability

- [x] 8.1 Define the discriminated Server Action result contract and stable public error-code taxonomy
- [x] 8.2 Implement safe mapping for validation, authentication, authorization, not-found, conflict, rate-limit, database-constraint, and unexpected failures
- [x] 8.3 Add structured server logging with correlation IDs and redaction of tokens, cookies, secrets, signed URLs, and raw personal payloads
- [x] 8.4 Instrument privileged admin operations with safe operation and outcome audit logs
- [x] 8.5 Add a liveness health route that exposes no configuration, credentials, or protected dependency details
- [x] 8.6 Add tests for error serialization, correlation behavior, and log redaction

## 9. Continuous Integration and Test Harness

- [x] 9.1 Configure Vitest projects for isolated unit tests and local-Supabase integration tests
- [x] 9.2 Build deterministic test helpers for isolated auth users, farms, memberships, sessions, and cleanup
- [x] 9.3 Configure Playwright web-server startup, test identity setup, mobile viewport coverage, traces, screenshots, and failure artifacts
- [x] 9.4 Create a CI pipeline that runs formatting/linting, strict type checking, unit tests, local database reset, SQL policy tests, integration tests, production build, and focused E2E tests in dependency order
- [x] 9.5 Verify tests use only local or explicitly non-production Supabase projects and fail closed when production configuration is detected

## 10. Deployment and Environment Promotion

- [ ] 10.1 Configure Vercel preview, staging, and production projects/settings with environment-specific public and server-only variables
- [x] 10.2 Provision or document isolated non-production Supabase targets for preview and staging, with an explicit prohibition on production use
- [x] 10.3 Add an explicit migration promotion and generated-type verification step before compatible application deployment
- [x] 10.4 Document secret rotation, least-privilege access, migration rehearsal, backup verification, forward-fix, and application rollback compatibility procedures
- [ ] 10.5 Deploy to preview and run health, authentication, tenant-isolation, private-file, and mobile smoke tests
- [ ] 10.6 Rehearse the release in staging and verify application, Vercel, Supabase Auth, database/policy, storage, and migration logs

## 11. Foundation Acceptance

- [ ] 11.1 Run a threat-model review focused on session handling, return paths, service-role isolation, RLS helpers, farm switching, signed file access, and log redaction
- [ ] 11.2 Run the complete clean-environment pipeline from dependency install through local database reset, tests, production build, and E2E
- [ ] 11.3 Perform an accessibility and mobile usability pass over authentication, onboarding, farm selection, shell navigation, forms, and failure states
- [x] 11.4 Document architecture decisions and the contributor checklist for adding a future farm-owned capability without a generic repository layer
- [ ] 11.5 Confirm the change contains no complete dashboard, goat, weight, vaccination, account deletion, offline-sync, or Base44-derived implementation
- [ ] 11.6 Obtain foundation acceptance before opening product-feature implementation changes
