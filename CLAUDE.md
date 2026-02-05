# Residency Management System (RMS)

An EPA (Entrustable Professional Activities) assessment platform for Graduate Medical Education.

## Development Philosophy

**Feature-First Development**: Build value first, add complexity as use cases demand it.

1. Start with the atomic unit of value (EPA assessment capture)
2. Work backwards from features to data models
3. Add schema complexity only when a real use case requires it
4. Defer multi-tenant, institutional hierarchy until needed

## Project Context

- **Domain**: Graduate Medical Education (ACGME-compliant)
- **MVP Focus**: EPA Assessment capture and progress tracking
- **Stack**: Hono + Bun (backend), PostgreSQL (database), React + Vite (frontend, planned)

## Quick Start

```bash
# Start PostgreSQL
bun run db:start

# Wait for it to be ready, then verify
bun run db:shell
# Type \dt to see tables, \q to exit

# Start dev server
bun run dev

# Test the API
curl http://localhost:3000/
curl http://localhost:3000/api/residents
curl http://localhost:3000/api/epas
```

## Key Commands

```bash
# Database (Docker PostgreSQL)
bun run db:start     # Start PostgreSQL container
bun run db:stop      # Stop container
bun run db:reset     # Drop volume and recreate (full reset)
bun run db:shell     # Open psql shell
bun run db:logs      # View PostgreSQL logs

# Server
bun run dev          # Start with hot reload
bun run start        # Production mode
```

## Database

**PostgreSQL 16** running in Docker with native ENUMs for type safety:

| ENUM Type | Values |
|-----------|--------|
| `user_role` | resident, faculty, program_director, coordinator, admin |
| `training_level` | PGY-1 through PGY-8 |
| `entrustment_level` | 1-5 (observe → independent) |
| `resident_status` | active, leave, remediation, graduated, withdrawn |
| `case_urgency` | elective, urgent, emergent |
| `location_type` | or, clinic, icu, ed, ward, other |
| `epa_category` | preoperative, intraoperative, postoperative, longitudinal, professional |

### Schema Files

- `backend/database/001-schema.sql` - Table definitions and indexes
- `backend/database/002-seed.sql` - Test data (MGH General Surgery)

### Core Tables

```
programs
  └── users (faculty, residents)
        ├── residents (extends users)
        └── faculty (extends users)
  └── epa_definitions
        └── epa_requirements
  └── clinical_sites
  └── rotations
  └── epa_assessments (THE CORE VALUE)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/users` | All users |
| GET | `/api/users/:id` | User with resident/faculty data |
| GET | `/api/residents` | Active residents |
| GET | `/api/residents/:id/progress` | EPA progress dashboard |
| GET | `/api/faculty` | Faculty who can assess |
| GET | `/api/epas` | EPA definitions |
| GET | `/api/clinical-sites` | Training locations |
| GET | `/api/rotations` | Rotation list |
| GET | `/api/assessments` | Assessments (filterable) |
| GET | `/api/assessments/:id` | Single assessment |
| POST | `/api/assessments` | Create assessment |

## Domain Concepts

- **EPA**: Entrustable Professional Activity - specific clinical tasks residents must master
- **Entrustment Levels**: 1=observe, 2=direct supervision, 3=indirect, 4=available, 5=independent
- **CCC**: Clinical Competency Committee - reviews resident progress (future feature)

## MVP Features (Current Focus)

### For Faculty
- [x] Log EPA assessment (resident, EPA, level, feedback)
- [ ] Assessment history view
- [ ] Quick assessment from mobile

### For Residents
- [x] View EPA progress (via API)
- [ ] Progress dashboard UI
- [ ] Assessment history

### For Program Directors
- [ ] Oversight dashboard
- [ ] At-risk resident identification
- [ ] Basic reporting

## Future Complexity (Add When Needed)

These are documented but **NOT implemented** until use cases demand:

- Multi-institutional hierarchy (companies → institutions → programs)
- Institution roles (sponsoring vs participating)
- Participation agreements (PLAs)
- Rotation scheduling and assignments
- Milestone integration
- Multi-specialty support

## When Implementing

- Always run the API against real PostgreSQL (not mocks)
- Use TypeScript strict mode
- Follow existing patterns in the codebase
- Prefer editing existing files over creating new ones
- Test API endpoints with curl or httpie

## Current Status

- [x] PostgreSQL schema with ENUMs
- [x] Seed data (MGH General Surgery scenario)
- [x] Basic API server
- [x] EPA assessment CRUD
- [x] Resident progress endpoint
- [ ] Frontend - not started
- [ ] Mobile app - not started
- [ ] Authentication - not started (using user dropdown for MVP)
