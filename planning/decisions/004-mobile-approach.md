# ADR-004: Mobile Approach

## Status
ACCEPTED

## Context
EPA assessments are captured on mobile devices (faculty between cases). Need to determine native app vs web approach.

## Decision
Use **mobile-first responsive web**, not a native app.

If offline capability is needed, add **PWA features** (Service Worker + IndexedDB).

## Consequences

### Positive
- Single codebase
- Faster iteration
- Easier to demo (just share URL)
- No app store friction
- Works on any device

### Negative
- Offline is more complex than native
- No push notifications without PWA setup
- Slightly less "native" feel

### Neutral
- Can add PWA capabilities incrementally if needed
- Most modern mobile browsers support required features
