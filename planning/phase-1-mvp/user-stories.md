# Phase 1 User Stories

## Epic 1: Assessment Capture

### US-1.1: Quick Assessment Submission
**As a** faculty member
**I want to** submit an EPA assessment in under 60 seconds
**So that** I can assess residents without disrupting my workflow

**Acceptance Criteria:**
- [ ] Can select resident from recent list in 2 taps
- [ ] Can select EPA in 1-2 taps
- [ ] Can rate entrustment level in 1 tap
- [ ] Can use voice-to-text for feedback
- [ ] Total flow completes in <60 seconds
- [ ] Works offline, syncs when connected

### US-1.2: Offline Assessment
**As a** faculty member
**I want to** submit assessments without internet connection
**So that** I can assess in the OR or areas with poor connectivity

**Acceptance Criteria:**
- [ ] Assessments saved locally when offline
- [ ] Clear indicator of offline status
- [ ] Automatic sync when connection restored
- [ ] Conflict resolution for edge cases
- [ ] No data loss

### US-1.3: Voice-to-Text Feedback
**As a** faculty member
**I want to** dictate my feedback
**So that** I can provide detailed narrative without typing

**Acceptance Criteria:**
- [ ] Microphone button prominently displayed
- [ ] Real-time transcription visible
- [ ] Can edit transcribed text
- [ ] Works with medical terminology
- [ ] Saves if user switches away mid-dictation

### US-1.4: Assessment Context
**As a** faculty member
**I want to** optionally add case context
**So that** the assessment is more meaningful for the resident and CCC

**Acceptance Criteria:**
- [ ] Optional fields: case type, urgency, location
- [ ] Quick-select for common case types
- [ ] Can skip context and still submit
- [ ] Context helps filter assessments later

---

## Epic 2: Resident Dashboard

### US-2.1: EPA Progress Overview
**As a** resident
**I want to** see my progress across all 18 EPAs
**So that** I know where I stand and what to focus on

**Acceptance Criteria:**
- [ ] Visual display of all 18 EPAs
- [ ] Progress indicator per EPA (assessments, current level)
- [ ] Color coding for ahead/on-track/behind
- [ ] Comparison to cohort average (anonymized)

### US-2.2: EPA Detail View
**As a** resident
**I want to** drill into a specific EPA
**So that** I can see my assessment history and feedback

**Acceptance Criteria:**
- [ ] Level distribution chart (counts at 1-5)
- [ ] Chronological assessment list
- [ ] Full narrative feedback visible
- [ ] Assessor names visible
- [ ] Filter by date range

### US-2.3: Gap Identification
**As a** resident
**I want to** see EPAs where I'm falling behind
**So that** I can proactively seek more assessments

**Acceptance Criteria:**
- [ ] Highlight EPAs below expected threshold
- [ ] Show recommended number of assessments
- [ ] Suggestions for which EPAs to focus on
- [ ] Notification when falling behind

### US-2.4: Acknowledge Assessment
**As a** resident
**I want to** acknowledge that I've reviewed an assessment
**So that** faculty know their feedback was received

**Acceptance Criteria:**
- [ ] Notification when new assessment received
- [ ] One-tap acknowledgment
- [ ] Acknowledgment timestamp recorded
- [ ] Can add reflection notes (optional)

---

## Epic 3: Faculty Dashboard

### US-3.1: Pending Assessments
**As a** faculty member
**I want to** see residents I should assess
**So that** I don't forget to submit assessments

**Acceptance Criteria:**
- [ ] List of recent/current residents
- [ ] Quick action to start assessment
- [ ] Indication of time since last assessment per resident
- [ ] Optional: integration with schedule

### US-3.2: Assessment History
**As a** faculty member
**I want to** see assessments I've submitted
**So that** I can review my feedback patterns

**Acceptance Criteria:**
- [ ] Chronological list of my assessments
- [ ] Filter by resident, EPA, date range
- [ ] View full assessment details
- [ ] Edit window (within 24 hours?)

### US-3.3: Assessment Analytics
**As a** faculty member
**I want to** see my assessment patterns
**So that** I can ensure I'm assessing fairly

**Acceptance Criteria:**
- [ ] Assessment count over time
- [ ] Distribution of entrustment levels given
- [ ] Comparison to program average (anonymized)
- [ ] Feedback quality metrics (length, substantive %)

---

## Epic 4: CCC Dashboard

### US-4.1: Resident Summary Report
**As a** program director
**I want to** generate a summary report for each resident
**So that** I can efficiently run CCC meetings

**Acceptance Criteria:**
- [ ] One-page summary per resident
- [ ] EPA progression visualization
- [ ] Assessment counts and level distribution
- [ ] Notable feedback excerpts
- [ ] Comparison to cohort
- [ ] Flags for concerns (low activity, stalled progress)

### US-4.2: Cohort Overview
**As a** program director
**I want to** see program-level metrics
**So that** I can identify trends and issues

**Acceptance Criteria:**
- [ ] Assessment activity over time
- [ ] Faculty participation rates
- [ ] Residents above/below thresholds
- [ ] EPA coverage across program

### US-4.3: Export Reports
**As a** program director
**I want to** export CCC reports
**So that** I can share them in meetings

**Acceptance Criteria:**
- [ ] Export individual resident summaries (PDF)
- [ ] Export cohort overview (PDF)
- [ ] Export raw data (CSV)

---

## Epic 5: Program Administration

### US-5.1: Roster Management
**As a** program coordinator
**I want to** manage the resident and faculty roster
**So that** the right people have access

**Acceptance Criteria:**
- [ ] Add/edit/deactivate residents
- [ ] Add/edit/deactivate faculty
- [ ] CSV import for bulk operations
- [ ] Set PGY levels and expected graduation
- [ ] Assign roles

### US-5.2: Program Settings
**As a** program director
**I want to** configure program-specific settings
**So that** the system matches our requirements

**Acceptance Criteria:**
- [ ] Set assessment thresholds (e.g., min per EPA)
- [ ] Configure notification preferences
- [ ] Set academic year dates
- [ ] Customize case types (optional)

### US-5.3: Data Export
**As a** program coordinator
**I want to** export all program data
**So that** I can analyze it externally or report to ACGME

**Acceptance Criteria:**
- [ ] Export all assessments (CSV)
- [ ] Export resident progress (CSV)
- [ ] Export faculty activity (CSV)
- [ ] Date range filter

---

## Epic 6: Authentication & Multi-Tenancy

### US-6.1: Secure Login
**As a** user
**I want to** log in securely
**So that** my data is protected

**Acceptance Criteria:**
- [ ] Email/password login
- [ ] SSO integration option
- [ ] Password reset flow
- [ ] Biometric login on mobile (Face ID, fingerprint)
- [ ] Session management

### US-6.2: Role-Based Access
**As a** system
**I want to** enforce role-based permissions
**So that** users only see what they should

**Acceptance Criteria:**
- [ ] Residents see only their data
- [ ] Faculty see residents in their program
- [ ] Program directors see all program data
- [ ] Cross-program access blocked

### US-6.3: Multi-Tenant Isolation
**As a** system
**I want to** isolate data between companies/institutions
**So that** there's no data leakage

**Acceptance Criteria:**
- [ ] Company-level data isolation
- [ ] Institution/program scoping
- [ ] All queries include tenant filter
- [ ] Security audit logging
