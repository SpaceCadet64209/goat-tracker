## Purpose

Defines farms as the mandatory tenant boundary so users can participate in multiple farms without records or navigation leaking between them.

## ADDED Requirements

### Requirement: A user can own or belong to multiple farms

The system SHALL support an authenticated user having active memberships in one or more farms, including ownership of more than one farm.

#### Scenario: User belongs to several farms

- **WHEN** an authenticated user has active memberships in multiple farms
- **THEN** the system allows the user to select and navigate to each authorized farm

#### Scenario: User has no farm

- **WHEN** an authenticated user has no active farm membership
- **THEN** the system directs the user to a farm onboarding path without exposing another farm

### Requirement: Farm creation establishes ownership atomically

The system SHALL create a farm and its first owner membership as one atomic operation.

#### Scenario: Farm creation succeeds

- **WHEN** an authenticated user submits valid farm details
- **THEN** the system creates the farm and an active owner membership for that user together

#### Scenario: Owner membership cannot be created

- **WHEN** farm creation cannot also establish the first owner
- **THEN** the system creates neither the farm nor a partial membership

### Requirement: Farm context is explicit and authorized

The system SHALL identify the requested farm explicitly and SHALL verify the user's active membership before returning farm content.

#### Scenario: Member opens an authorized farm link

- **WHEN** an active member opens a valid route for that farm
- **THEN** the system renders the requested farm context

#### Scenario: User changes an authorized farm identifier

- **WHEN** a user changes a route from one authorized farm identifier to another authorized farm identifier
- **THEN** the system evaluates and renders only the newly requested farm's data

#### Scenario: User opens an unauthorized farm link

- **WHEN** an authenticated user requests a farm for which they have no active membership
- **THEN** the system returns no farm data and presents a not-found or forbidden outcome

### Requirement: Every farm-management record belongs to one farm

The system SHALL require every goat and other farm-management record to reference exactly one existing farm and SHALL prevent relationships between records from different farms.

#### Scenario: Farm record omits farm ownership

- **WHEN** a write attempts to create a farm-management record without a farm
- **THEN** the system rejects the write

#### Scenario: Child links to parent in another farm

- **WHEN** a write attempts to associate a farm-owned child record with a parent record from another farm
- **THEN** the system rejects the relationship

### Requirement: Every farm retains an owner

The system SHALL prevent a farm from having fewer than one active owner.

#### Scenario: Sole owner attempts to leave

- **WHEN** the only active owner attempts to leave or remove their owner membership
- **THEN** the system rejects the operation until ownership is transferred or another owner exists
