# ADR-002: Frontend Framework

## Status
ACCEPTED

## Context
Need a frontend framework for testing different role experiences. Requirements:
- React (team familiarity)
- No bloat (Next.js rejected)
- Fast iteration
- Mobile-first capable

## Decision
Use **Vite + React** (no meta-framework).

## Consequences

### Positive
- Minimal bundle size
- Fast HMR (hot module replacement)
- Full control over architecture
- No framework opinions to fight

### Negative
- No SSR (not needed for this use case)
- Manual routing setup (TanStack Router if needed)

### Neutral
- Standard React patterns apply
