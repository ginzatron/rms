# Resident Progress Dashboard

## Feature Overview

The Resident Progress Dashboard provides residents with a comprehensive view of their EPA (Entrustable Professional Activities) progress throughout their training. It enables residents to:

1. Track progress toward graduation requirements
2. Identify EPAs needing more assessments (deficiencies)
3. Review and acknowledge faculty feedback on recent assessments
4. Drill down into assessment history for specific EPAs

## User Stories

### US-1: View Progress Summary
**As a** resident
**I want to** see a summary of my overall EPA progress
**So that** I can quickly understand where I stand in my training

**Acceptance Criteria:**
- [ ] Display total number of assessments received
- [ ] Show count of requirements met vs total requirements for current PGY level
- [ ] Display average entrustment level across all assessments
- [ ] Show count of unacknowledged assessments (feedback to review)

### US-2: View EPA Progress List
**As a** resident
**I want to** see my progress on each EPA
**So that** I can identify which areas need more focus

**Acceptance Criteria:**
- [ ] List all EPAs with progress indicators
- [ ] Show current count vs required count for each EPA
- [ ] Display progress bar visualization (current/target)
- [ ] Show highest entrustment level achieved per EPA
- [ ] Display date of last assessment per EPA
- [ ] Highlight EPAs below target count with warning indicator

### US-3: Identify Deficiencies
**As a** resident
**I want to** easily identify EPAs where I'm behind on requirements
**So that** I can proactively seek more assessments in those areas

**Acceptance Criteria:**
- [ ] EPAs with fewer assessments than required are marked with warning icon
- [ ] Deficient EPAs show "Needs X more at Level Y" message
- [ ] Deficient EPAs are visually distinct (yellow/amber styling)

### US-4: Review Unacknowledged Assessments
**As a** resident
**I want to** see assessments I haven't reviewed yet
**So that** I can read and learn from faculty feedback

**Acceptance Criteria:**
- [ ] "To Review" tab shows unacknowledged assessments
- [ ] Badge count in tab header shows number pending
- [ ] Each assessment shows: EPA name, faculty name, date, feedback preview
- [ ] "Mark as Reviewed" button acknowledges the assessment
- [ ] Acknowledged assessments disappear from "To Review" list

### US-5: Drill Down into EPA
**As a** resident
**I want to** see detailed assessment history for a specific EPA
**So that** I can review my progression over time

**Acceptance Criteria:**
- [ ] Tapping an EPA card opens detail view
- [ ] Detail view shows full EPA title and description
- [ ] Shows requirement status (X of Y at Level Z)
- [ ] Lists recent assessments for that EPA
- [ ] Each assessment shows entrustment level, faculty, date, feedback

### US-6: Role-Based Navigation
**As a** user (resident or faculty)
**I want to** see the appropriate view based on my role
**So that** I can access the features relevant to me

**Acceptance Criteria:**
- [ ] User selector dropdown shows all users (residents and faculty)
- [ ] Selecting a resident shows the Progress Dashboard
- [ ] Selecting a faculty shows the Assessment Form
- [ ] Selected user persists across page refreshes

---

## UI Mockups

### Main Dashboard View
```
┌─────────────────────────────────────────────────────┐
│  ← RMS                    [Sarah Chen ▼] PGY-3     │ Header with user selector
├─────────────────────────────────────────────────────┤
│                                                     │
│  Progress Summary                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│
│  │    23    │ │   8/12   │ │   3.4    │ │   4    ││
│  │  Total   │ │   Met    │ │   Avg    │ │ Review ││
│  │Assessmnts│ │ Require- │ │  Level   │ │Pending ││
│  │          │ │  ments   │ │          │ │        ││
│  └──────────┘ └──────────┘ └──────────┘ └────────┘│
│                                                     │
├─────────────────────────────────────────────────────┤
│  [  Progress  ]  [  To Review (4)  ]               │ Tab bar
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ EPA 5: Lap Chole                               ││
│  │ ████████████░░░░ 15/20 at Level 4              ││
│  │ Highest: 4 · Last assessed: 2 days ago         ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ EPA 3: Appendectomy                    ⚠️      ││
│  │ ███░░░░░░░░░░░░░ 5/15 at Level 3               ││
│  │ Needs 10 more · Last assessed: 2 weeks ago     ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ EPA 8: Central Line                    ✓       ││
│  │ ████████████████ 12/10 at Level 3              ││
│  │ Requirement met · Highest: 4                   ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
└─────────────────────────────────────────────────────┘
```

### To Review Tab
```
┌─────────────────────────────────────────────────────┐
│  ← RMS                    [Sarah Chen ▼] PGY-3     │
├─────────────────────────────────────────────────────┤
│  [  Progress  ]  [  To Review (4)  ]               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ EPA 5: Lap Chole                               ││
│  │ Dr. Martinez · Jan 20, 2025                    ││
│  │ Level 4                                        ││
│  │                                                ││
│  │ "Excellent critical view. Ready to do these   ││
│  │  with supervision available only..."          ││
│  │                                                ││
│  │              [  Mark as Reviewed  ]            ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ EPA 11: Postop Mgmt                            ││
│  │ Dr. Patel · Jan 18, 2025                       ││
│  │ Level 3                                        ││
│  │                                                ││
│  │ "Good presentation on rounds. Continue        ││
│  │  working on fluid management..."              ││
│  │                                                ││
│  │              [  Mark as Reviewed  ]            ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
└─────────────────────────────────────────────────────┘
```

### EPA Detail Bottom Sheet
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  EPA 5: Laparoscopic Cholecystectomy               │
│  Intraoperative                                    │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Requirement Progress                               │
│  15 of 20 assessments at Level 4 or higher         │
│  ████████████░░░░ 75%                              │
│  5 more needed to meet PGY-3 requirement           │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Level Distribution                                 │
│  Level 5: ██ 2                                     │
│  Level 4: ████████ 8                               │
│  Level 3: ████ 4                                   │
│  Level 2: █ 1                                      │
│  Level 1: 0                                        │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Recent Assessments                                 │
│                                                     │
│  Level 4 · Dr. Thompson · Jan 20                   │
│  "Textbook critical view..."                       │
│                                                     │
│  Level 4 · Dr. Martinez · Jan 15                   │
│  "Performed case with minimal guidance..."         │
│                                                     │
│  Level 3 · Dr. Patel · Jan 8                       │
│  "Good decision-making, needs work on..."          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Data Requirements

### Progress Endpoint Response
`GET /api/residents/:id/progress`

```json
{
  "progress": [
    {
      "epa_id": "uuid",
      "epa_number": "EPA 5",
      "title": "Laparoscopic Cholecystectomy",
      "short_name": "Lap Chole",
      "category": "intraoperative",
      "total_assessments": 15,
      "level_1": 0,
      "level_2": 1,
      "level_3": 4,
      "level_4": 8,
      "level_5": 2,
      "highest_level": "5",
      "last_assessment": "2025-01-20T11:00:00Z",
      "requirement": {
        "target_count": 20,
        "target_level": "4",
        "current_count_at_level": 10,
        "is_met": false,
        "deficit": 10
      }
    }
  ],
  "stats": {
    "total_assessments": 23,
    "epas_assessed": 8,
    "unique_assessors": 4,
    "avg_level": 3.4,
    "requirements_met": 8,
    "requirements_total": 12
  }
}
```

### Unacknowledged Endpoint Response
`GET /api/residents/:id/unacknowledged`

```json
[
  {
    "id": "uuid",
    "entrustment_level": "4",
    "assessment_date": "2025-01-20T11:00:00Z",
    "narrative_feedback": "Excellent critical view...",
    "acknowledged": false,
    "epa_number": "EPA 5",
    "epa_name": "Lap Chole",
    "faculty_first_name": "Julia",
    "faculty_last_name": "Martinez"
  }
]
```

### Acknowledge Endpoint
`PATCH /api/assessments/:id/acknowledge`

Response: Updated assessment with `acknowledged: true`

---

## Business Rules

1. **Requirement Scope**: Show requirements for the resident's current PGY level only
2. **Deficiency Definition**: An EPA is deficient if `current_count_at_level < target_count`
3. **Requirement Met**: When `current_count_at_level >= target_count` for the target level
4. **Count at Level**: Only assessments at or above the target entrustment level count toward requirement
5. **Assessment Age**: Show relative time for assessments < 7 days, full date otherwise

---

## Out of Scope (Future)

- Graduation requirements view (showing all PGY levels)
- Peer comparison / cohort statistics
- Assessment velocity trends (assessments per month)
- Faculty assessment patterns
- CCC review status
- Push notifications for new assessments
