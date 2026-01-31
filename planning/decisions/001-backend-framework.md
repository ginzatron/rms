# ADR-001: Backend Framework

## Status
ACCEPTED

## Context
Need a backend framework for an RMS reference implementation focused on data modeling and workflow exploration. Requirements:
- Fast iteration
- TypeScript support
- Lightweight
- Good DX for solo developer + AI workflow

## Decision
Use **Hono** with **Bun** runtime.

## Consequences

### Positive
- Extremely fast (Bun runtime)
- Minimal boilerplate
- Modern TypeScript-first design
- Works well with SQLite
- Easy to understand codebase

### Negative
- Smaller ecosystem than Express/Fastify
- Bun still maturing (though stable enough for this use case)

### Neutral
- Different patterns than traditional Node.js (minor learning curve)
