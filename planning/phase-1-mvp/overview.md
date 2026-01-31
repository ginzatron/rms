# Phase 1: MVP - EPA Assessment Platform

## Goal

Build a mobile-first EPA assessment capture platform for General Surgery residency programs that makes assessment so easy faculty actually do it.

## Target Users

| User | Primary Need |
|------|-------------|
| **Attending Surgeon** | Submit assessments in <60 seconds between cases |
| **Resident** | See progress, identify gaps, prepare for CCC |
| **Program Director** | Monitor program health, prepare CCC meetings |
| **Coordinator** | Manage rosters, generate reports |

## Core Value Proposition

> "I can assess a resident in 45 seconds while walking between cases, and I actually remember to do it because the UX is so smooth."

## MVP Scope

### In Scope ✅

1. **Mobile App** (iOS + Android)
   - Assessment capture (<60 seconds)
   - Offline-first with sync
   - Voice-to-text for narratives
   - Recent residents/EPAs quick access

2. **Resident Dashboard** (Web)
   - EPA progression visualization
   - Level distribution per EPA
   - Narrative feedback history
   - Gap identification

3. **Faculty Dashboard** (Web)
   - Pending assessments
   - Assessment history
   - Basic analytics

4. **CCC Dashboard** (Web, Basic)
   - Resident summary reports
   - Cohort analytics
   - Export functionality

5. **Admin Panel** (Web)
   - Roster management (import/manual)
   - Data export
   - Program settings

6. **Multi-Tenancy**
   - Company → Institution → Program hierarchy
   - Data isolation
   - Basic role-based access

### Out of Scope ❌

- Detailed scheduling/duty hours
- 360 evaluations
- Procedure logging (separate from EPAs)
- Full milestone management (Phase 2)
- ACGME ADS integration
- Multiple specialties (surgery only)
- Remediation workflow tracking

## Technical Decisions Needed

See `/planning/decisions/` for ADRs.

| Decision | Status | Options |
|----------|--------|---------|
| Backend Framework | Pending | Django, FastAPI, Node.js/Express, Go |
| Database | Pending | PostgreSQL (likely) |
| Mobile Framework | Pending | React Native, Flutter |
| Frontend Framework | Pending | React/Next.js, Vue/Nuxt |
| Hosting | Pending | AWS, GCP, Vercel |
| Auth | Pending | Auth0, Clerk, Custom JWT |

## Milestones

### M1: Foundation
- [ ] Finalize tech stack decisions
- [ ] Set up monorepo structure
- [ ] Database schema implementation
- [ ] Basic auth system
- [ ] CI/CD pipeline

### M2: Core API
- [ ] User/Program/Resident CRUD
- [ ] EPA assessment endpoints
- [ ] Multi-tenant middleware
- [ ] Basic seed data (surgery EPAs)

### M3: Mobile App v1
- [ ] Assessment capture flow
- [ ] Offline storage + sync
- [ ] Push notifications
- [ ] iOS TestFlight release

### M4: Web Dashboards
- [ ] Resident progress dashboard
- [ ] Faculty dashboard
- [ ] Program admin panel

### M5: CCC & Reporting
- [ ] CCC summary reports
- [ ] Cohort analytics
- [ ] PDF export

### M6: Beta Launch
- [ ] 2-3 pilot programs
- [ ] Feedback collection
- [ ] Bug fixes
- [ ] Android release

## Success Criteria

| Metric | Target |
|--------|--------|
| Assessment submission time | <60 seconds |
| Faculty adoption | 80%+ submitting weekly |
| Mobile usage | 70%+ of assessments |
| Substantive feedback | 80%+ with narrative |
| System uptime | 99.5%+ |

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Faculty won't adopt | Medium | High | Focus on UX, <60s goal |
| Offline sync issues | Medium | Medium | Robust conflict resolution |
| Multi-tenant data leak | Low | Critical | Security reviews, testing |
| Scope creep | High | Medium | Strict MVP boundary |

## Next Steps

1. **Tech Stack Decisions** - Create ADRs for key choices
2. **Project Setup** - Initialize monorepo, CI/CD
3. **Schema Implementation** - Create migrations from data model
4. **API Design** - Define endpoints, document in OpenAPI
5. **Mobile Prototype** - Assessment capture flow
