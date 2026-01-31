# ADR-003: Database

## Status
ACCEPTED

## Context
Need a database for local development focused on data modeling exploration. Requirements:
- Easy setup (no Docker, no cloud)
- SQL (relational model is core to this project)
- Good tooling for inspection

## Decision
Use **SQLite** for local development.

## Consequences

### Positive
- Zero setup (file-based)
- Fast for development
- Easy to reset/recreate
- Bun has native SQLite support
- Can use DB Browser for SQLite for inspection

### Negative
- Not production-representative for concurrent writes
- Some PostgreSQL features unavailable (but we can design for Postgres compatibility)

### Neutral
- Schema should be designed for eventual PostgreSQL migration
- Use standard SQL, avoid SQLite-specific features
