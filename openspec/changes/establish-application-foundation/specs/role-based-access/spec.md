## Purpose

Defines predictable least-privilege permissions for farm owners, managers, and workers across farm-management operations.

## ADDED Requirements

### Requirement: Farm memberships have a constrained role

The system SHALL assign each active farm membership exactly one supported role: owner, manager, or worker.

#### Scenario: Unsupported role is assigned

- **WHEN** a write attempts to assign a role outside the supported set
- **THEN** the system rejects the write

### Requirement: Owners control farm administration

The system SHALL allow owners to manage farm settings, memberships, member roles, ownership transfer, and farm deletion, and SHALL deny those operations to managers and workers.

#### Scenario: Owner changes a member role

- **WHEN** an owner assigns a supported role while preserving the farm owner invariant
- **THEN** the system applies the role change

#### Scenario: Manager attempts membership administration

- **WHEN** a manager attempts to add, remove, or change a farm membership
- **THEN** the system rejects the operation

#### Scenario: Worker attempts farm deletion

- **WHEN** a worker attempts to delete a farm
- **THEN** the system rejects the operation

### Requirement: Members receive operation-specific access

The system SHALL allow active owners and managers to create, view, update, and delete routine farm records, and SHALL allow active workers to create, view, and update routine farm records while denying deletion by default.

#### Scenario: Worker creates a routine record

- **WHEN** an active worker submits a valid routine farm record for their farm
- **THEN** the system accepts the record

#### Scenario: Worker deletes a routine record

- **WHEN** an active worker attempts to delete a routine farm record
- **THEN** the system rejects the deletion

#### Scenario: Manager deletes a routine record

- **WHEN** an active manager deletes a permitted routine farm record
- **THEN** the system accepts the deletion

### Requirement: Inactive memberships grant no farm permissions

The system SHALL grant farm permissions only through an active membership.

#### Scenario: Removed member reuses an existing session

- **WHEN** a removed or inactive member requests farm data with an otherwise valid user session
- **THEN** the system returns no farm data and rejects protected mutations
