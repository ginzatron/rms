# ADR-005: Authentication

## Status
ACCEPTED

## Context
This is a reference implementation for data modeling, not a production system. Need to test different role experiences without auth complexity.

## Decision
Use a **user selector** instead of real authentication.

- Login screen shows list of test users
- Click to "become" that user
- Session stored in localStorage
- No passwords, no tokens, no OAuth

## Consequences

### Positive
- Zero auth complexity
- Easy to switch between roles for testing
- Focus stays on data modeling and UX

### Negative
- Not production-representative for auth flows
- No real security (acceptable for local dev)

### Neutral
- Real auth can be added later if needed
- User/role model still fully designed
