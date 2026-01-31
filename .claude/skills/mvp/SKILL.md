---
name: mvp
description: MVP scope, features, and requirements for Phase 1 - EPA Assessment Platform for General Surgery
---

# MVP: EPA Assessment Platform for General Surgery

## Strategic Rationale

### Why EPAs First

1. **Market Timing** - EPAs actively being adopted (ABS surgery 2023-2025, other specialties following)
2. **High Pain Point** - Current tools are clunky, low adoption, unreliable data
3. **Natural Integration Hub** - EPAs need data from schedules/rotations, feed data to milestones/CCC
4. **Technical Differentiation** - Mobile-first, offline capability, AI-assisted feedback
5. **Clear Monetization** - SaaS model, $8-15K/year per program

### Beachhead Strategy

Focus on ONE specialty initially: **General Surgery**
- 18 EPAs defined by ABS (American Board of Surgery)
- Large programs, well-funded, tech-forward
- Build deep domain expertise, then expand

## MVP Features

### 1. Mobile Assessment Capture (Core Product)

The key interaction (must be <60 seconds):
1. Faculty selects resident
2. Selects EPA (e.g., Lap Chole)
3. Rates entrustment level (1-5)
4. Provides feedback (voice-to-text primary)
5. Submits

**Requirements:**
- iOS app (primary) + Android
- Offline-first with sync
- Voice-to-text for narratives
- Quick entry (<60 seconds)
- Recent residents/EPAs for fast access

### 2. Resident Dashboard

**Features:**
- EPA progression visualization (all 18 EPAs)
- Level distribution per EPA (counts at each level)
- Gap identification (not enough assessments, stalled progress)
- Narrative feedback history (searchable, filterable)
- Comparison to cohort (anonymized)
- Downloadable reports for CCC meetings

### 3. Faculty Dashboard

**Features:**
- Pending assessments (suggested based on schedule if integrated)
- Recent cases (quick access)
- Historical assessments submitted
- Assessment analytics (calibration vs peers)

### 4. CCC Dashboard (Basic)

**Features:**
- Resident summary reports (auto-generated)
- EPA progression visualization per resident
- Cohort-level analytics
- Export for CCC meetings

### 5. Program Admin Panel

**Features:**
- Resident roster management (CSV import, manual)
- Faculty list management
- EPA configuration (benchmarks, thresholds)
- Data export (CSV, API)
- Basic analytics (assessment activity, faculty engagement)

## Technical Requirements

### Mobile App

- **Platform**: React Native or Flutter (cross-platform)
- **Offline**: SQLite for local storage, background sync
- **Performance**: <500ms submission, <2s dashboard load
- **Auth**: Institutional SSO integration, biometric
- **Features**: Voice-to-text, push notifications, camera

### Backend

- **API**: REST or GraphQL
- **Database**: PostgreSQL
- **Auth**: JWT + refresh tokens, SSO support
- **Multi-tenancy**: Company-level isolation
- **Compliance**: HIPAA-adjacent (audit logs, encryption)

### Web App

- **Framework**: React/Next.js or similar
- **Responsive**: Desktop-first for admin, responsive for dashboards
- **Real-time**: WebSocket for notifications

## Data Requirements

### Must Capture Per Assessment

- Resident + Assessor + EPA
- Entrustment level (1-5)
- Assessment date/time
- Narrative feedback
- Entry method (mobile/web)

### Should Capture (When Available)

- Case type (from case_types table)
- Case urgency (elective/urgent/emergent)
- Patient complexity (ASA class)
- Location type + details
- Rotation context

### Nice to Have

- Structured feedback tags
- Procedure duration
- Complications flag

## User Roles (MVP)

| Role | Capabilities |
|------|-------------|
| Resident | View own progress, acknowledge assessments |
| Faculty | Submit assessments, view own history |
| Program Director | All faculty + admin panel + CCC dashboards |
| Coordinator | Admin panel (roster, reports) |

## Integration Points (MVP)

### Import

- Resident roster (CSV)
- Faculty list (CSV)
- Basic rotation assignments (CSV, optional)

### Export

- Assessment data (CSV)
- Resident progress reports (PDF)
- CCC summary reports (PDF)

### Future Integrations (Post-MVP)

- Schedule systems (know who's working with whom)
- Evaluation platforms (New Innovations, MedHub)
- ACGME ADS (milestone submission)

## Success Metrics

### Adoption

- Assessment submission rate (target: 2/week/resident)
- Faculty participation (target: 80%+ active)
- Mobile vs web usage (target: 70%+ mobile)

### Quality

- Substantive feedback rate (target: 80%+ with narrative)
- Average feedback length (target: 30+ words)
- Assessment timeliness (target: <24 hours)

### Outcomes

- CCC meeting prep time reduction
- Resident awareness of progress
- Early identification of struggling residents

## Out of Scope (MVP)

- Detailed scheduling/duty hours
- 360 evaluations
- Procedure logging (separate from EPAs)
- Full milestone management
- ACGME ADS integration
- Multiple specialties (surgery only)
- Remediation workflow tracking

## Go-to-Market

### Initial Target

- 5-10 surgical residency programs as design partners
- Academic medical centers (innovative, well-resourced)
- Geographic clustering (easier to support)

### Pricing

- Pilot: Free for design partners (6-12 months)
- Launch: $8-12K/year per program (scales with size)
- Enterprise: Custom for large institutions
