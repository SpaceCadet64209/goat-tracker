# Deployment and environment promotion

This runbook defines the release boundary for GoatTrack. It is deliberately
environment-specific: a preview or staging deployment must never use a
production Supabase URL, publishable key, service-role key, Auth configuration,
or Storage bucket.

Provisioning projects, adding real credentials, and executing promotions are
operator actions. Do not put project IDs, access tokens, service-role keys, or
production connection strings in this repository.

## Environment inventory and access boundary

Maintain the following inventory in the team's approved secret manager or
deployment system, not in a committed file. Record the account owner, region,
project reference, application URL, and last verification date for each row.

| Environment | Vercel project         | Supabase target                                                          | Permitted use                                         | Must not use                                                |
| ----------- | ---------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------- | ----------------------------------------------------------- |
| Local       | local Next.js process  | local Supabase stack                                                     | development, migrations, integration and policy tests | any hosted project                                          |
| Preview     | `goattrack-preview`    | isolated Supabase branch, or an explicitly non-production shared project | pull-request review and smoke tests                   | production project, production data, production credentials |
| Staging     | `goattrack-staging`    | dedicated staging Supabase project                                       | release candidates and migration rehearsals           | production project, production data, production credentials |
| Production  | `goattrack-production` | dedicated production Supabase project                                    | live customer traffic                                 | preview/staging service-role keys                           |

The project names above are conventions, not existing resources. If the
operator uses different names, update the private environment inventory while
retaining one distinct Vercel project and one isolated Supabase target for each
hosted environment.

### Required Vercel setup

Create and link three separate Vercel projects. Connect the preview project to
pull-request/branch deployments, keep staging on a protected release branch,
and use only the production project for the production branch. Restrict project
administration and production deployments to named release operators. Treat
preview deployments as untrusted review artifacts: use non-production data and
enable the team's appropriate deployment protection.

For each Vercel project, set only these runtime variables. Values are unique to
that environment and are entered through Vercel's encrypted environment
settings or an approved secrets integration.

| Variable                               | Visibility         | Preview value                   | Staging value                   | Production value                   |
| -------------------------------------- | ------------------ | ------------------------------- | ------------------------------- | ---------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | browser-visible    | preview target URL              | staging target URL              | production target URL              |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | browser-visible    | preview target publishable key  | staging target publishable key  | production target publishable key  |
| `APP_URL`                              | server-only        | preview deployment origin       | stable staging origin           | canonical production origin        |
| `APP_ENV`                              | server-only        | `preview`                       | `staging`                       | `production`                       |
| `SUPABASE_SERVICE_ROLE_KEY`            | server-only secret | preview target service-role key | staging target service-role key | production target service-role key |

`NEXT_PUBLIC_*` variables are intentionally shipped to the browser and are not
secrets; they must still identify only their matching Supabase target.
`SUPABASE_SERVICE_ROLE_KEY` is a secret, is never prefixed with `NEXT_PUBLIC_`,
and is limited to the server-only admin module. Do not add secrets to
`vercel.json`, `.env.example`, GitHub Actions logs, build output, or client
code. The application validates this variable contract at startup through
`lib/env/schemas.ts`.

### Supabase non-production rule

Preview and staging credentials, branch references, and `APP_URL` values must
be reviewed together before every deployment. A preview may use a Supabase
branch when that feature is available; otherwise it may use a shared project
only when that project is explicitly designated **non-production**, contains no
production data, and has isolated test tenants. Staging always uses its own
dedicated non-production Supabase project.

Never repoint preview or staging at production to diagnose an issue, reproduce
data, or avoid provisioning work. Use fictional fixtures, sanitized data under
an approved process, or a dedicated incident environment instead. If a hosted
environment's target cannot be independently verified, stop the deployment.

## Promotion order and database/type gate

Supabase migrations are ordered, immutable source files under
`supabase/migrations`. An applied migration is never edited: use a new,
forward-only migration to correct it. Database migrations precede an
application release only when the application version is compatible with both
the old and new schema.

Before proposing any hosted promotion, the author must run the local gate:

```sh
pnpm db:start
pnpm db:reset
pnpm db:types
pnpm db:types:check
pnpm test:integration
pnpm build
```

The committed `lib/supabase/database.types.ts` must match the reset local
schema. CI repeats `pnpm db:types:check`; a mismatch blocks the change.

For each target, a release operator follows this ordered checklist:

1. Confirm the target's project reference, `APP_ENV`, Supabase URL, and
   credentials against the private environment inventory. Confirm that preview
   and staging are not production.
2. Review the migration list and the compatibility plan. Use expand/contract:
   add compatible schema/policies first, deploy compatible code, run any
   idempotent observable backfill, enforce stricter constraints only after
   validation, and remove obsolete structures in a later release.
3. Take or verify a restorable database backup for staging/production, and
   record its timestamp and restore location in the release record.
4. Apply the ordered migrations to **staging** using the approved, linked
   Supabase target. Inspect the command result and Supabase database logs.
5. Generate TypeScript types from that linked staging schema and compare them
   with the committed `lib/supabase/database.types.ts`. If they differ, stop:
   update types in a reviewed change, repeat the local checks, and rehearse
   staging again. Do not deploy an application against unreviewed schema drift.
6. Run staging health, authentication, tenant-isolation, private-file, and
   mobile smoke checks. Check Vercel runtime/build logs and Supabase Auth,
   database/policy, and Storage logs for errors.
7. Only after the checks pass, deploy the compatible application version to
   staging. Production uses the same sequence: verify the production backup,
   apply compatible migrations, verify generated types and migration logs, then
   deploy the compatible Vercel production build.

The concrete Supabase command is intentionally not committed as a universal
copy/paste command: it must run against the operator-verified linked target
with non-interactive credentials supplied by the approved release system.
Never run a remote migration command until the target reference has been
confirmed in the release record.

## Operational procedures

### Secret rotation

Rotate immediately after suspected exposure, personnel/access changes, or the
provider's required interval. Plan routine rotation per environment; do not
reuse a secret between environments.

1. Create the replacement in the relevant Supabase/Vercel or approved secrets
   system. Keep the old credential valid only for the shortest overlap needed.
2. Update the matching Vercel project only. Verify variable names and that a
   service-role key remains server-only.
3. Redeploy that one environment and validate `/api/health`, authentication,
   one user-scoped request, and any affected privileged operation. Review logs
   without printing credential values.
4. Revoke the old credential, record the rotation and verification result, and
   investigate potentially exposed logs, build artifacts, or access paths.

When rotating Supabase keys that affect browser sessions or Auth configuration,
communicate expected session impact and verify the email redirect and allowed
application origins for the environment before rollout.

### Least-privilege access

- Grant Vercel project access separately for preview, staging, and production;
  production deployment/configuration access is restricted to release
  operators.
- Grant Supabase organization/project roles only for the target environment and
  only for the duties required. Production database access is time-bound where
  the provider supports it and is logged/audited.
- Keep CI deploy credentials scoped to the one project/target and secret store;
  never give browser code, ordinary server reads, or tests the service-role key.
- Review membership and stale access at least quarterly and immediately after a
  role change. Revoke inactive accounts rather than sharing credentials.

### Migration rehearsal and backup verification

Every migration reaching production is rehearsed on staging with production-like
schema size/shape where safely available. Measure runtime/lock impact, verify
RLS and policy behavior, run the release smoke tests, and document any
backfill's idempotency, progress signal, and stop condition.

Before staging and production migration, verify that the provider backup is
enabled and that the backup is recent enough for the release. Periodically
perform a documented restore drill to an isolated non-production target; a
backup is not considered verified solely because it appears in a provider UI.
Record restore duration, integrity checks, and any recovery gaps.

### Forward fixes and application rollback

Database rollback is not the default response to a failed release. Applied
migrations remain immutable, so use a reviewed forward migration or a controlled
restore when recovery requires it. Do not make destructive schema contractions
part of the same release as an application change.

Rolling Vercel back to the previous deployment is allowed only after confirming
that the prior application version works with the migrated schema, policies,
and generated types. If compatibility is uncertain, keep the compatible
application deployed and ship a forward fix. After any rollback or forward fix,
verify health, authentication, tenant isolation, private-file access, migration
state, and Vercel/Supabase logs; attach the outcome to the incident or release
record.

## Release record minimum

For staging and production, retain a release record with the commit/deployment
identifier, operator, environment/project references, migration names and
outcome, generated-type verification result, backup/restore verification,
smoke-test evidence, log review result, and rollback compatibility decision.
