## Purpose

Defines private, farm-scoped storage behavior for future goat images and farm documents without exposing objects through public URLs.

## ADDED Requirements

### Requirement: Farm files are private and farm-scoped

The system SHALL store farm files in private storage under an unambiguous farm scope and SHALL associate file metadata with exactly one farm.

#### Scenario: Authorized member accesses a file

- **WHEN** an active member with view permission requests a file belonging to their farm
- **THEN** the system provides time-limited or authenticated access to that file

#### Scenario: Unrelated user requests a file

- **WHEN** a user requests a file belonging to a farm where they are not an active member
- **THEN** the system denies access and reveals no file contents

### Requirement: Uploads are validated and authorized

The system SHALL validate an upload's farm permission, size, declared and detected type where available, extension, and generated object path before accepting it.

#### Scenario: Valid authorized upload

- **WHEN** a permitted member uploads a file that satisfies configured restrictions
- **THEN** the system stores the object and its farm-owned metadata

#### Scenario: Disallowed upload

- **WHEN** an upload exceeds the configured size or has a disallowed type or extension
- **THEN** the system rejects it without creating accessible metadata

#### Scenario: User controls the supplied filename

- **WHEN** a user uploads a file with a path-like or unsafe filename
- **THEN** the system uses a generated object identifier and retains only safe display metadata

### Requirement: File mutations follow role permissions

The system SHALL apply farm role permissions to file creation and deletion and SHALL not treat possession of an object path as authorization.

#### Scenario: Worker attempts to delete a protected file

- **WHEN** a worker attempts a file deletion not granted to workers
- **THEN** the system rejects the operation

#### Scenario: Owner deletes a permitted file

- **WHEN** an owner deletes a file they are permitted to manage
- **THEN** the file becomes inaccessible and the metadata reflects the deletion outcome

### Requirement: Partial file-operation failures are recoverable

The system SHALL make object/metadata inconsistencies detectable and retryable when a multi-step upload or deletion fails.

#### Scenario: Object deletion succeeds but metadata update fails

- **WHEN** a file deletion completes only partially
- **THEN** the system records or exposes a recoverable state without granting unauthorized access
