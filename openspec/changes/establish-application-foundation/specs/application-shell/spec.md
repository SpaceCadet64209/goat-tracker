## Purpose

Defines a responsive and resilient application shell that gives users consistent navigation, feedback, and safe failure behavior across foundational flows.

## ADDED Requirements

### Requirement: The authenticated shell is usable on mobile

The system SHALL provide farm context, primary navigation, and account actions without required horizontal scrolling at supported mobile viewport widths.

#### Scenario: User opens the shell on a mobile viewport

- **WHEN** an authenticated user opens an application page at a supported mobile viewport
- **THEN** primary content and navigation remain operable with touch and keyboard input

### Requirement: The shell communicates request state

The system SHALL present accessible loading, empty, success, validation, and failure states for foundational interactions.

#### Scenario: Server-rendered content is loading

- **WHEN** navigation waits for server-rendered content
- **THEN** the system presents a stable loading state that identifies the pending region

#### Scenario: Form validation fails

- **WHEN** a user submits invalid input
- **THEN** the system preserves safe input, identifies affected fields, and presents actionable errors

#### Scenario: Unexpected failure occurs

- **WHEN** an unexpected server failure prevents completion
- **THEN** the system presents a safe recovery message and a correlation identifier when available

### Requirement: Tenant navigation preserves explicit context

The system SHALL show the current farm context and provide a farm-selection path to users with multiple active memberships.

#### Scenario: User changes farm

- **WHEN** a user selects another authorized farm
- **THEN** navigation moves to that farm's explicit context and does not retain data from the previous farm

### Requirement: The application exposes installable metadata

The system SHALL provide valid application metadata, icons, name, theme, and standalone display configuration for supported browsers.

#### Scenario: Browser evaluates installability

- **WHEN** a supported browser reads the application metadata over a secure deployment
- **THEN** the required installable metadata is available

### Requirement: Installed mode remains safe when offline

The system SHALL not represent uncached private farm data as current and SHALL not queue offline mutations until an offline synchronization capability is explicitly implemented.

#### Scenario: Installed user loses network connectivity

- **WHEN** an installed user opens a network-dependent farm view while offline
- **THEN** the system presents an offline or unavailable state rather than stale data as current or accepting an unsynchronized write
