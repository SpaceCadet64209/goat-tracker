## Purpose

Defines secure user identity and session behavior for accessing protected GoatTrack experiences without coupling farm authorization to browser state.

## ADDED Requirements

### Requirement: Users can establish and end an authenticated session

The system SHALL allow a user to sign up and sign in with a supported email/password credential, and SHALL allow the user to sign out from any authenticated page.

#### Scenario: Verified user signs in

- **WHEN** a verified user submits valid credentials
- **THEN** the system establishes a session and continues to the validated destination or farm entry flow

#### Scenario: Invalid credentials are submitted

- **WHEN** a user submits invalid credentials
- **THEN** the system rejects the attempt with a safe error that does not reveal whether an account exists

#### Scenario: User signs out

- **WHEN** an authenticated user signs out
- **THEN** the system ends the local session and prevents subsequent access to protected pages

### Requirement: Email ownership is verified

The system SHALL require verification of a user's email address before granting access to protected farm data.

#### Scenario: Unverified user attempts protected access

- **WHEN** a signed-in but unverified user requests a protected farm page
- **THEN** the system withholds farm data and directs the user to complete verification

### Requirement: Users can recover access

The system SHALL provide a password reset flow using a time-limited recovery mechanism.

#### Scenario: Password reset completes

- **WHEN** a user follows a valid recovery link and submits a valid new password
- **THEN** the system updates the credential and permits a new authenticated session

#### Scenario: Recovery token is invalid

- **WHEN** a user presents an invalid or expired recovery token
- **THEN** the system rejects the reset and offers a safe path to request another recovery

### Requirement: Protected requests are authenticated on the server

The system SHALL verify the current identity at the server boundary before returning protected content or processing protected mutations.

#### Scenario: Anonymous request targets a protected route

- **WHEN** an unauthenticated request targets a protected route
- **THEN** the system returns no protected data and redirects or responds with an authentication-required result

#### Scenario: Session expires during use

- **WHEN** a request no longer has a valid refreshable session
- **THEN** the system returns no protected data and requires the user to authenticate again
