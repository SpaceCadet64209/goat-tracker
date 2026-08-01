## Purpose

Defines database-enforced tenant isolation and integrity so application mistakes cannot expose or corrupt user-owned farm data.

## ADDED Requirements

### Requirement: User-owned data is protected by Row-Level Security

The system SHALL enable Row-Level Security on every table containing user-owned or farm-owned data and SHALL deny access unless an explicit policy permits the authenticated operation.

#### Scenario: Unrelated user reads a farm row

- **WHEN** an authenticated user queries a farm-owned row for a farm where they are not an active member
- **THEN** the database returns no row

#### Scenario: Unrelated user writes a farm row

- **WHEN** an authenticated user attempts to create, update, or delete a row for a farm where they lack the required permission
- **THEN** the database rejects the operation

#### Scenario: Anonymous user queries protected data

- **WHEN** an anonymous request queries user-owned or farm-owned data
- **THEN** the database returns no protected rows

### Requirement: Database constraints enforce critical integrity

The system SHALL enforce required ownership, valid references, uniqueness, supported states, and cross-farm relationship integrity with database constraints or atomic database operations.

#### Scenario: Client validation is bypassed

- **WHEN** invalid data reaches the database without passing through the application form
- **THEN** the database rejects data that violates a critical invariant

#### Scenario: Concurrent ownership updates conflict

- **WHEN** concurrent operations would leave a farm without an active owner
- **THEN** at most the operations that preserve an active owner commit

### Requirement: Normal server operations retain user policy context

The system SHALL execute normal user-requested reads and writes with the authenticated user's policy context rather than a privileged policy-bypassing credential.

#### Scenario: Server-rendered page loads farm data

- **WHEN** an authenticated user requests a server-rendered farm page
- **THEN** the data query is constrained by that user's database policies

### Requirement: Privileged access is confined and auditable

The system SHALL keep policy-bypassing credentials outside browser-reachable code and SHALL use them only for explicitly privileged server operations that authenticate and authorize the caller.

#### Scenario: Browser bundle is built

- **WHEN** the application produces a browser bundle
- **THEN** no service-role credential or privileged client is included

#### Scenario: Privileged operation executes

- **WHEN** an authorized privileged server operation uses policy-bypassing access
- **THEN** the system records a safe audit event identifying the operation and outcome

### Requirement: Authorization failures disclose no protected data

The system SHALL return safe forbidden or not-found outcomes without including protected row contents, database internals, credentials, or policy details.

#### Scenario: Cross-farm identifier is submitted

- **WHEN** a user submits an identifier belonging to another farm
- **THEN** the system rejects the operation without revealing the protected record
