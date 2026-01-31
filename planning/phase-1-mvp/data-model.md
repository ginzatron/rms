# RMS Data Model: A Complete Guide

This document explains the data model for a Residency Management System, focusing on how real-world GME (Graduate Medical Education) concepts translate into database structures. It's designed to be read top-to-bottom, building understanding layer by layer.

---

## Table of Contents

1. [The Big Picture](#the-big-picture)
2. [Layer 1: The Institutional Hierarchy](#layer-1-the-institutional-hierarchy)
3. [Layer 2: Programs and People](#layer-2-programs-and-people)
4. [Layer 3: Academic Structure](#layer-3-academic-structure)
5. [Layer 4: EPA Assessments](#layer-4-epa-assessments)
6. [Layer 5: Reference Data](#layer-5-reference-data)
7. [Putting It All Together](#putting-it-all-together)
8. [Sample Data Scenarios](#sample-data-scenarios)

---

## The Big Picture

Before diving into tables, let's understand what we're modeling:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           THE GME ECOSYSTEM                                  │
│                                                                              │
│  ┌──────────────────┐         ┌──────────────────┐                          │
│  │    ACGME         │ ◀─────▶ │   Sponsoring     │                          │
│  │  (Accredits)     │         │   Institution    │                          │
│  └──────────────────┘         └────────┬─────────┘                          │
│                                        │                                     │
│                                        │ owns & operates                     │
│                                        ▼                                     │
│                               ┌──────────────────┐                          │
│                               │     Programs     │                          │
│                               │ (Surgery, IM...) │                          │
│                               └────────┬─────────┘                          │
│                                        │                                     │
│                    ┌───────────────────┼───────────────────┐                │
│                    │                   │                   │                │
│                    ▼                   ▼                   ▼                │
│            ┌─────────────┐     ┌─────────────┐     ┌─────────────┐         │
│            │  Residents  │     │   Faculty   │     │  Rotations  │         │
│            └──────┬──────┘     └──────┬──────┘     └──────┬──────┘         │
│                   │                   │                   │                 │
│                   └───────────────────┼───────────────────┘                │
│                                       │                                     │
│                                       ▼                                     │
│                              ┌──────────────────┐                          │
│                              │  EPA Assessments │                          │
│                              │  (The Core Data) │                          │
│                              └──────────────────┘                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

**The core transaction is simple**: A faculty member observes a resident performing a clinical activity and records an assessment. Everything else in this model exists to:
1. Organize who can assess whom
2. Provide context for assessments
3. Track progress toward competency
4. Meet accreditation requirements

---

## Layer 1: The Institutional Hierarchy

### The Real-World Problem

Medical education is complicated because training happens across multiple physical locations. A surgery resident at Mass General Hospital might:
- Operate at MGH's main campus
- Do a trauma rotation at a Level 1 trauma center across town
- Spend a month at the VA hospital
- Do a rural surgery elective at a community hospital

All of these count toward the same residency program, but each location has different relationships with the program.

### ACGME's Answer: Sponsoring vs. Participating

ACGME created a distinction:

**Sponsoring Institution**: The entity that holds accreditation and is responsible for the program. They have a DIO (Designated Institutional Official) and a GMEC (Graduate Medical Education Committee). They're legally and educationally responsible.

**Participating Sites**: Other places where residents train. They have a formal agreement (PLA - Program Letter Agreement) with the sponsoring institution that defines educational responsibilities.

### Why This Matters

If a resident makes an error at a participating site, who's responsible? The sponsoring institution. They need to ensure supervision standards, educational quality, and duty hour compliance at ALL sites. That's why these relationships must be explicitly modeled.

### The Twist: Institutions Can Be Both

Here's where it gets interesting. Massachusetts General Hospital might be:
- A **Sponsoring Institution** for its own General Surgery Residency
- A **Participating Site** for Harvard Medical School's Internal Medicine Residency

The same physical hospital plays different roles in different programs. This is why we can't just have a simple `institution_type` column.

### The Data Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INSTITUTIONAL HIERARCHY                              │
│                                                                              │
│  ┌─────────────┐                                                            │
│  │  companies  │  ◀── Your SaaS customers (multi-tenant root)               │
│  └──────┬──────┘                                                            │
│         │ 1:many                                                             │
│         ▼                                                                    │
│  ┌─────────────────┐                                                        │
│  │  institutions   │  ◀── Physical entities (hospitals, medical schools)    │
│  └────────┬────────┘                                                        │
│           │                                                                  │
│           │ An institution can PLAY ROLES:                                  │
│           │                                                                  │
│     ┌─────┴─────────────────────────────────┐                               │
│     │                                       │                                │
│     ▼                                       ▼                                │
│  ┌─────────────────────┐          ┌─────────────────────────┐               │
│  │ sponsoring_         │          │ participation_          │               │
│  │ institutions        │          │ agreements              │               │
│  │                     │          │                         │               │
│  │ (role: we sponsor   │          │ (role: we participate   │               │
│  │  our own programs)  │          │  in someone else's      │               │
│  │                     │          │  programs)              │               │
│  └──────────┬──────────┘          └─────────────────────────┘               │
│             │                                                                │
│             │ 1:many                                                         │
│             ▼                                                                │
│      ┌─────────────┐                                                        │
│      │  programs   │  ◀── Residency/Fellowship programs                     │
│      └─────────────┘                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Table: `companies`

The multi-tenant root. Each company is a separate customer of your SaaS platform.

```sql
companies
├── id                    UUID        -- Primary key
├── name                  TEXT        -- "Partners Healthcare System"
├── subdomain             TEXT        -- "partners" (for partners.rms.com)
├── settings              JSON        -- Company-wide configuration
└── created_at            TIMESTAMP
```

**Sample Data:**
| id | name | subdomain |
|----|------|-----------|
| `c-001` | Partners Healthcare | partners |
| `c-002` | Mayo Clinic | mayo |

### Table: `institutions`

Physical entities - hospitals, medical schools, VA facilities. An institution is just an institution - its *role* (sponsor vs. participant) is defined by relationships.

```sql
institutions
├── id                    UUID
├── company_id            UUID FK     -- Which SaaS customer owns this
├── name                  TEXT        -- "Massachusetts General Hospital"
├── acgme_institution_id  TEXT        -- ACGME's 7-digit identifier
├── type                  TEXT        -- 'academic_medical_center', 'community_hospital', 'va', 'medical_school'
├── address               TEXT
└── created_at            TIMESTAMP
```

**Sample Data:**
| id | company_id | name | type |
|----|------------|------|------|
| `i-mgh` | `c-001` | Massachusetts General Hospital | academic_medical_center |
| `i-bwh` | `c-001` | Brigham and Women's Hospital | academic_medical_center |
| `i-va-bos` | `c-001` | VA Boston Healthcare System | va |
| `i-nwh` | `c-001` | Newton-Wellesley Hospital | community_hospital |

### Table: `sponsoring_institutions`

When an institution takes on the *role* of sponsoring programs, we create this record. This holds all the ACGME-required information for that role.

```sql
sponsoring_institutions
├── id                         UUID
├── institution_id             UUID FK     -- Which institution is playing this role
├── dio_name                   TEXT        -- Designated Institutional Official
├── dio_email                  TEXT
├── acgme_accreditation_status TEXT        -- 'accredited', 'probation', etc.
├── next_site_visit            DATE        -- When ACGME will next visit
└── is_active                  BOOLEAN     -- Can be deactivated if they lose accreditation
```

**Why a separate table?**
- Not all institutions sponsor programs (a community hospital might only be a participating site)
- The sponsorship role has its own attributes (DIO, accreditation status)
- An institution could theoretically lose and regain sponsorship status over time

**Sample Data:**
| id | institution_id | dio_name | acgme_accreditation_status |
|----|----------------|----------|---------------------------|
| `si-mgh` | `i-mgh` | Dr. John Smith | accredited |

### Table: `participation_agreements`

When an institution participates in another institution's programs, there must be a formal agreement. This is ACGME-required.

```sql
participation_agreements
├── id                         UUID
├── sponsoring_institution_id  UUID FK     -- Who sponsors the program
├── participating_institution_id UUID FK   -- Who is participating
├── agreement_type             TEXT        -- 'PLA', 'affiliation_agreement'
├── effective_date             DATE
├── expiration_date            DATE
├── status                     TEXT        -- 'active', 'expired', 'pending'
├── applies_to_all_programs    BOOLEAN     -- Or specific programs only
└── covered_program_ids        JSON        -- If not all programs
```

**Sample Data:**
| id | sponsoring_institution_id | participating_institution_id | status |
|----|---------------------------|------------------------------|--------|
| `pla-001` | `si-mgh` | `i-bwh` | active |
| `pla-002` | `si-mgh` | `i-va-bos` | active |
| `pla-003` | `si-mgh` | `i-nwh` | active |

This says: "MGH (as sponsor) has agreements with BWH, VA Boston, and Newton-Wellesley to send residents there."

### Table: `clinical_sites`

Now we get to *where training actually happens*. A clinical site is a specific location within an institution where residents work.

```sql
clinical_sites
├── id                          UUID
├── institution_id              UUID FK     -- Which institution this site belongs to
├── participation_agreement_id  UUID FK     -- If this is an external site, which PLA covers it
├── name                        TEXT        -- "MGH Main OR", "BWH Surgical ICU"
├── site_classification         TEXT        -- 'primary', 'affiliate', 'community', 'va'
├── is_active                   BOOLEAN
└── address                     TEXT        -- Optional, may differ from institution
```

**Key Insight**: Clinical sites are nested under institutions, but we also track *which agreement* covers that site for external institutions. This lets us answer: "Which sites are MGH surgery residents allowed to train at?"

**Sample Data:**
| id | institution_id | participation_agreement_id | name | site_classification |
|----|----------------|---------------------------|------|---------------------|
| `cs-mgh-main` | `i-mgh` | NULL | MGH Main Campus | primary |
| `cs-mgh-or` | `i-mgh` | NULL | MGH Surgical OR Suite | primary |
| `cs-bwh-surg` | `i-bwh` | `pla-001` | BWH General Surgery Service | affiliate |
| `cs-va-surg` | `i-va-bos` | `pla-002` | VA Boston Surgical Service | va |
| `cs-nwh` | `i-nwh` | `pla-003` | NWH Surgical Service | community |

**Why "clinical_sites" vs just using institutions?**

An institution like MGH might have multiple distinct clinical sites:
- Main campus ORs
- Cancer center
- Outpatient surgical center
- Research labs

Each has different supervisors, different case mixes, different educational opportunities. Assessments need to be tagged to the specific site, not just "MGH."

---

## Layer 2: Programs and People

### Programs

A program is a specific residency or fellowship under a sponsoring institution.

```sql
programs
├── id                       UUID
├── sponsoring_institution_id UUID FK    -- Must be a sponsoring institution
├── specialty_code           TEXT FK     -- References ref_specialties
├── name                     TEXT        -- "MGH General Surgery Residency"
├── acgme_program_id         TEXT        -- ACGME's program identifier
├── program_director_id      UUID FK     -- References users
├── settings                 JSON        -- Program-specific configuration
└── created_at               TIMESTAMP
```

**Sample Data:**
| id | sponsoring_institution_id | specialty_code | name |
|----|---------------------------|----------------|------|
| `p-mgh-surg` | `si-mgh` | general_surgery | MGH General Surgery Residency |
| `p-mgh-vasc` | `si-mgh` | vascular_surgery | MGH Vascular Surgery Fellowship |

### Users

All humans in the system. We don't distinguish types at this level - role comes from relationships.

```sql
users
├── id                UUID
├── company_id        UUID FK      -- Multi-tenant isolation
├── email             TEXT UNIQUE
├── first_name        TEXT
├── last_name         TEXT
├── phone             TEXT
├── photo_url         TEXT
├── is_active         BOOLEAN
└── created_at        TIMESTAMP
```

### Program Memberships: The Role System

Here's a key insight: **A person's role is defined by their relationship to a program, not by who they are.**

Dr. Sarah Chen might be:
- A PGY-5 **resident** in the General Surgery program
- A **faculty member** in the same program (as chief resident, she supervises juniors)
- An **observer** in the Vascular Surgery program (considering fellowship)

This is why we have a many-to-many relationship with roles:

```sql
program_memberships
├── id            UUID
├── user_id       UUID FK
├── program_id    UUID FK
├── role          TEXT         -- 'resident', 'faculty', 'program_director', 'coordinator', 'observer'
├── is_active     BOOLEAN
├── started_at    DATE
├── ended_at      DATE         -- NULL if current
└── metadata      JSON         -- Role-specific data
```

**Sample Data:**
| id | user_id | program_id | role | is_active |
|----|---------|------------|------|-----------|
| `pm-001` | `u-sarah` | `p-mgh-surg` | resident | true |
| `pm-002` | `u-sarah` | `p-mgh-surg` | faculty | true |
| `pm-003` | `u-martinez` | `p-mgh-surg` | faculty | true |
| `pm-004` | `u-director` | `p-mgh-surg` | program_director | true |

Notice Sarah has TWO active memberships with different roles. This is intentional and correct.

### Residents: Extended Data

When someone is a resident, we need additional information beyond the basic user profile:

```sql
residents
├── id                      UUID
├── user_id                 UUID FK
├── program_id              UUID FK
├── pgy_level               INTEGER     -- Current year (1-10)
├── entry_pgy_level         INTEGER     -- What year they started at
├── matriculation_date      DATE        -- When they started
├── expected_graduation     DATE
├── actual_graduation       DATE        -- NULL until graduated
├── medical_school          TEXT
├── degree_type             TEXT        -- 'MD', 'DO', 'MBBS'
├── status                  TEXT        -- 'active', 'leave', 'remediation', 'completed', 'withdrawn'
├── track                   TEXT        -- 'research', 'clinical', etc.
└── npi                     TEXT        -- National Provider Identifier
```

**Why separate from users?**
- Not all users are residents
- Resident data is program-specific (same person could be resident in one program, then fellow in another)
- Lifecycle data (graduation, status) is resident-specific

**Sample Data:**
| id | user_id | program_id | pgy_level | status | medical_school |
|----|---------|------------|-----------|--------|----------------|
| `r-sarah` | `u-sarah` | `p-mgh-surg` | 5 | active | Harvard Medical School |
| `r-mike` | `u-mike` | `p-mgh-surg` | 4 | active | Stanford Medicine |
| `r-emma` | `u-emma` | `p-mgh-surg` | 3 | active | Johns Hopkins |
| `r-james` | `u-james` | `p-mgh-surg` | 1 | active | UCSF |

### Faculty: Extended Data

Similarly, faculty have their own extended attributes:

```sql
faculty
├── id                UUID
├── user_id           UUID FK
├── program_id        UUID FK
├── rank              TEXT        -- 'instructor', 'assistant_professor', 'associate_professor', 'professor'
├── specialty         TEXT
├── is_core_faculty   BOOLEAN     -- Core vs. voluntary/community
├── teaching_percent  INTEGER     -- % time dedicated to teaching
├── is_active         BOOLEAN
├── started_at        DATE
└── ended_at          DATE
```

**Sample Data:**
| id | user_id | program_id | rank | is_core_faculty |
|----|---------|------------|------|-----------------|
| `f-sarah` | `u-sarah` | `p-mgh-surg` | clinical_instructor | false |
| `f-martinez` | `u-martinez` | `p-mgh-surg` | associate_professor | true |
| `f-patel` | `u-patel` | `p-mgh-surg` | professor | true |

---

## Layer 3: Academic Structure

### Why Structure Time?

Residency programs are organized around time periods. Residents rotate through different services, and we need to know:
- What rotation is this resident on?
- Who is their supervisor?
- Where are they working?

This matters for EPA assessments because context helps interpret the assessment.

### Academic Years

```sql
academic_years
├── id            UUID
├── program_id    UUID FK
├── name          TEXT        -- "2024-2025"
├── start_date    DATE        -- July 1, 2024
├── end_date      DATE        -- June 30, 2025
└── is_current    BOOLEAN
```

### Blocks

Many programs divide the year into blocks (often 4-week periods):

```sql
blocks
├── id                UUID
├── academic_year_id  UUID FK
├── name              TEXT        -- "Block 1", "July"
├── block_number      INTEGER     -- For ordering
├── start_date        DATE
└── end_date          DATE
```

### Rotation Types

These are the *kinds* of rotations a program offers:

```sql
rotation_types
├── id              UUID
├── program_id      UUID FK
├── name            TEXT        -- "Acute Care Surgery"
├── code            TEXT        -- "ACS"
├── category        TEXT        -- 'core', 'elective', 'research'
├── is_required     BOOLEAN
├── minimum_weeks   INTEGER     -- If required
└── primary_epa_ids JSON        -- Which EPAs are primarily taught here
```

**Sample Data:**
| id | program_id | name | code | category | primary_epa_ids |
|----|------------|------|------|----------|-----------------|
| `rt-acs` | `p-mgh-surg` | Acute Care Surgery | ACS | core | [3, 9, 11, 12] |
| `rt-colorectal` | `p-mgh-surg` | Colorectal Surgery | CRS | core | [6, 10, 11] |
| `rt-research` | `p-mgh-surg` | Research | RSCH | elective | [18] |

The `primary_epa_ids` field tells us which EPAs are most commonly assessed during this rotation. EPA 3 (Appendectomy) and EPA 9 (Trauma Laparotomy) are primarily done on Acute Care Surgery.

### Rotation Assignments

When a resident is actually assigned to a rotation:

```sql
rotation_assignments
├── id                    UUID
├── resident_id           UUID FK
├── rotation_type_id      UUID FK
├── block_id              UUID FK
├── clinical_site_id      UUID FK      -- Where they're working
├── primary_supervisor_id UUID FK      -- Attending responsible for them
├── start_date            DATE
├── end_date              DATE
└── status                TEXT         -- 'scheduled', 'active', 'completed'
```

**Sample Data:**
| id | resident_id | rotation_type | clinical_site | supervisor | status |
|----|-------------|---------------|---------------|------------|--------|
| `ra-001` | `r-mike` | ACS | MGH Main Campus | Dr. Patel | active |
| `ra-002` | `r-emma` | Colorectal | BWH Surgery | Dr. Martinez | active |
| `ra-003` | `r-james` | ACS | VA Boston | Dr. Martinez | completed |

---

## Layer 4: EPA Assessments

Now we get to the core of the system: **capturing EPA assessments**.

### What's an EPA Assessment?

When Dr. Martinez watches Dr. Chen perform a laparoscopic cholecystectomy and then records:
- Which EPA it was (EPA 5: Lap Chole)
- How much autonomy she demonstrated (Level 3: Indirect Supervision)
- Narrative feedback ("Good case. Critical view was excellent...")

That's an EPA assessment.

### The Assessment Record

```sql
epa_assessments
├── id                      UUID
├── resident_id             UUID FK     -- Who was assessed
├── assessor_id             UUID FK     -- Who assessed (must be faculty)
├── epa_id                  INTEGER FK  -- Which EPA (1-18 for surgery)
├── entrustment_level       INTEGER     -- 1-5
├── assessment_date         TIMESTAMP   -- When it happened
├── submission_date         TIMESTAMP   -- When it was recorded (may differ)
│
│   -- Context (all optional but valuable)
├── rotation_assignment_id  UUID FK     -- What rotation they were on
├── clinical_site_id        UUID FK     -- Where it happened
├── case_type_id            UUID FK     -- Specific procedure type
├── case_urgency            TEXT        -- 'elective', 'urgent', 'emergent'
├── patient_asa_class       INTEGER     -- Patient complexity (1-6)
├── procedure_duration_min  INTEGER     -- How long it took
├── complications           BOOLEAN     -- Did complications occur?
├── location_type           TEXT        -- 'or', 'clinic', 'icu', 'ward'
├── location_details        TEXT        -- "OR 5", "ICU Bed 12"
│
│   -- Feedback
├── narrative_feedback      TEXT        -- The written feedback
├── specialty_context       JSON        -- Specialty-specific fields
│
│   -- Metadata
├── entry_method            TEXT        -- 'mobile_ios', 'mobile_android', 'web'
├── acknowledged            BOOLEAN     -- Has resident seen it?
├── acknowledged_at         TIMESTAMP
│
│   -- Soft delete for auditing
├── deleted                 BOOLEAN
├── deleted_at              TIMESTAMP
└── deleted_by              UUID FK
```

### Sample Assessment Data

Let's trace a real scenario:

**Scenario**: Dr. Patel (attending) supervises Dr. Rodriguez (PGY-4) performing a laparoscopic cholecystectomy on an elective patient. The case goes well, and afterward Dr. Patel pulls out his phone to record the assessment.

```json
{
  "id": "assess-001",
  "resident_id": "r-mike",           // Mike Rodriguez
  "assessor_id": "f-patel",          // Dr. Patel
  "epa_id": 5,                       // Lap Chole
  "entrustment_level": 4,            // Supervision on demand

  "assessment_date": "2025-01-30T14:30:00Z",
  "submission_date": "2025-01-30T14:35:00Z",

  "rotation_assignment_id": "ra-001",
  "clinical_site_id": "cs-mgh-or",
  "case_type_id": "ct-lap-chole",
  "case_urgency": "elective",
  "patient_asa_class": 2,
  "procedure_duration_min": 55,
  "complications": false,
  "location_type": "or",
  "location_details": "OR 5",

  "narrative_feedback": "Excellent case. Mike performed the entire procedure with minimal guidance. His critical view of safety was textbook - I didn't need to provide any prompting. Port placement was efficient. Only suggestion: consider using a 5mm camera for the initial look before placing the 10mm port. Ready for more independence.",

  "entry_method": "mobile_ios",
  "acknowledged": false
}
```

### The Entrustment Scale (Critical Concept)

The entrustment level is the core measure. Here's what each level means:

| Level | Name | Description | Supervisor Involvement |
|-------|------|-------------|----------------------|
| 1 | Observation Only | Resident observes, doesn't perform | Attending does everything |
| 2 | Direct Supervision | Resident performs with attending present | Attending scrubbed in, guiding |
| 3 | Indirect Supervision | Resident performs, attending immediately available | Attending in OR but not scrubbed |
| 4 | Supervision on Demand | Resident performs independently, calls if needed | Attending available if called |
| 5 | Practice Ready | Resident can supervise others | Resident is the expert |

The goal of residency is to progress from Level 1 to Level 5 across all EPAs.

### Feedback Tags (Structured Feedback)

To make feedback more useful for analytics while keeping it flexible:

```sql
feedback_tags
├── id          UUID
├── category    TEXT        -- 'strength', 'improvement_area'
├── name        TEXT        -- "Technical Skills", "Decision Making"
├── specialty   TEXT        -- NULL for universal, or 'general_surgery'
└── description TEXT

epa_assessment_feedback_tags
├── id                  UUID
├── epa_assessment_id   UUID FK
├── feedback_tag_id     UUID FK
└── tag_type            TEXT        -- 'went_well', 'needs_work'
```

This lets us say: "Mike's assessment had 'Technical Skills' tagged as went_well and 'Critical View of Safety' tagged as went_well."

---

## Layer 5: Reference Data

### The Distinction: Reference vs. Tenant Data

**Reference Data**: Shared across all tenants, maintained by the system
- Specialties (General Surgery, Internal Medicine)
- EPAs (the 18 surgery EPAs)
- Competencies (the 6 ACGME competencies)
- Milestones (specialty-specific developmental markers)

**Tenant Data**: Owned by specific companies/institutions
- Institutions
- Programs
- Residents
- Assessments

This distinction matters for:
- Data isolation (tenants can't modify reference data)
- Updates (when ACGME changes requirements, you update once)
- Consistency (everyone uses the same EPA definitions)

### Specialties

```sql
ref_specialties
├── code                      TEXT PK     -- 'general_surgery', 'internal_medicine'
├── name                      TEXT        -- "General Surgery"
├── category                  TEXT        -- 'surgical', 'medical', 'hospital_based'
├── acgme_specialty_code      TEXT        -- ACGME's code
├── typical_duration_years    INTEGER     -- 5 for surgery, 3 for IM
├── is_subspecialty           BOOLEAN     -- Vascular is subspecialty of Surgery
├── parent_specialty_code     TEXT FK     -- For subspecialties
├── requires_prerequisite     BOOLEAN
├── prerequisite_codes        JSON        -- What you must complete first
└── board_name                TEXT        -- "American Board of Surgery"
```

**Sample Data:**
| code | name | category | duration | is_subspecialty | parent |
|------|------|----------|----------|-----------------|--------|
| general_surgery | General Surgery | surgical | 5 | false | NULL |
| internal_medicine | Internal Medicine | medical | 3 | false | NULL |
| vascular_surgery | Vascular Surgery | surgical | 2 | true | general_surgery |
| cardiology | Cardiovascular Disease | medical | 3 | true | internal_medicine |

### EPAs

```sql
epas
├── id                  INTEGER PK   -- 1-18 for surgery (standardized)
├── specialty_code      TEXT FK
├── name                TEXT         -- "Laparoscopic Cholecystectomy"
├── short_name          TEXT         -- "Lap Chole"
├── description         TEXT         -- Full description
├── category            TEXT         -- 'preoperative', 'intraoperative', etc.
├── display_order       INTEGER
├── key_functions       JSON         -- What the EPA involves
├── entrustment_anchors JSON         -- What each level looks like for this EPA
└── version             TEXT         -- EPAs can be versioned
```

**Sample Data (General Surgery EPAs):**
| id | name | short_name | category |
|----|------|------------|----------|
| 1 | Preoperative Assessment and Informed Consent | Preop Assessment | preoperative |
| 2 | Preoperative Planning | Preop Planning | preoperative |
| 3 | Appendectomy | Appendectomy | intraoperative |
| 4 | Inguinal Hernia Repair | Hernia Repair | intraoperative |
| 5 | Laparoscopic Cholecystectomy | Lap Chole | intraoperative |
| ... | ... | ... | ... |
| 18 | Practice-Based Learning and QI | PBLI/QI | professional |

### Case Types

For EPAs that involve procedures, we enumerate the common case types:

```sql
case_types
├── id                      UUID
├── epa_id                  INTEGER FK
├── name                    TEXT         -- "Laparoscopic cholecystectomy"
├── code                    TEXT         -- "LAP_CHOLE"
├── typical_duration_min    INTEGER
└── complexity_notes        TEXT
```

**Sample Data (for EPA 5 - Lap Chole):**
| id | epa_id | name | code |
|----|--------|------|------|
| `ct-001` | 5 | Laparoscopic cholecystectomy | LAP_CHOLE |
| `ct-002` | 5 | Single-incision lap chole | SILC |
| `ct-003` | 5 | Lap chole converted to open | LAP_TO_OPEN |
| `ct-004` | 5 | Lap chole with IOC | LAP_CHOLE_IOC |
| `ct-005` | 5 | Lap chole with CBD exploration | LAP_CHOLE_CBDE |

This lets us track not just "EPA 5" but "EPA 5, specifically a SILC" which is a more complex variant.

---

## Putting It All Together

### The Complete Picture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  REFERENCE DATA (System-Maintained)                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │  ref_specialties │  │      epas        │  │   case_types     │          │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘          │
│           │                     │                     │                     │
└───────────│─────────────────────│─────────────────────│─────────────────────┘
            │                     │                     │
            ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  TENANT DATA (Company-Owned)                                                │
│                                                                              │
│  companies                                                                   │
│      │                                                                       │
│      └──▶ institutions                                                       │
│               │                                                              │
│               ├──▶ sponsoring_institutions ──▶ programs                      │
│               │                                    │                         │
│               └──▶ participation_agreements        ├──▶ program_memberships  │
│                         │                          │         │               │
│                         ▼                          │         ├──▶ residents  │
│                    clinical_sites                  │         └──▶ faculty    │
│                         │                          │                         │
│                         │                          └──▶ academic_years       │
│                         │                                    │               │
│                         │                                    └──▶ blocks     │
│                         │                                          │         │
│                         │    rotation_types ◀──────────────────────┤         │
│                         │          │                               │         │
│                         │          └────────────────┬──────────────┘         │
│                         │                           │                        │
│                         │                           ▼                        │
│                         │                  rotation_assignments              │
│                         │                           │                        │
│                         │                           │                        │
│                         ▼                           ▼                        │
│                    ┌─────────────────────────────────────┐                  │
│                    │         epa_assessments             │ ◀── THE CORE     │
│                    │                                     │                  │
│                    │  Links: resident, assessor, EPA,    │                  │
│                    │         rotation, site, case_type   │                  │
│                    └─────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Query Examples

**"Show me all EPA assessments for Dr. Rodriguez this month"**
```sql
SELECT
  e.short_name as epa,
  ea.entrustment_level,
  ea.assessment_date,
  u.last_name as assessor,
  ea.narrative_feedback
FROM epa_assessments ea
JOIN epas e ON e.id = ea.epa_id
JOIN faculty f ON f.id = ea.assessor_id
JOIN users u ON u.id = f.user_id
WHERE ea.resident_id = 'r-mike'
  AND ea.assessment_date >= '2025-01-01'
  AND ea.deleted = false
ORDER BY ea.assessment_date DESC;
```

**"What's Dr. Rodriguez's progress on EPA 5 (Lap Chole)?"**
```sql
SELECT
  ea.entrustment_level,
  COUNT(*) as count,
  MAX(ea.assessment_date) as most_recent
FROM epa_assessments ea
WHERE ea.resident_id = 'r-mike'
  AND ea.epa_id = 5
  AND ea.deleted = false
GROUP BY ea.entrustment_level
ORDER BY ea.entrustment_level;
```

Result might show:
| entrustment_level | count | most_recent |
|-------------------|-------|-------------|
| 2 | 3 | 2024-09-15 |
| 3 | 8 | 2024-12-20 |
| 4 | 4 | 2025-01-30 |

This tells us Mike is progressing - mostly at Level 3-4 now.

---

## Sample Data Scenarios

### Scenario 1: A Typical Teaching Hospital

**Partners Healthcare** (company) includes:
- **MGH** (institution, sponsoring institution)
  - General Surgery Residency (program)
    - 30 residents across PGY 1-5
    - 20 core faculty
  - Vascular Surgery Fellowship (program)
    - 4 fellows
    - 8 faculty
- **BWH** (institution, participating site for MGH programs)
- **VA Boston** (institution, participating site for MGH programs)

### Scenario 2: A Resident's Journey

**Dr. Emma Johnson** (PGY-3):
- Started July 2022
- Expected graduation: June 2027
- Current rotation: Colorectal Surgery at BWH
- Primary supervisor: Dr. Martinez

Her EPA assessment history might show:
- 150+ total assessments over 2.5 years
- Strong on EPAs 3 (Appendectomy), 4 (Hernia), 5 (Lap Chole) - Level 3-4
- Developing on EPA 6 (Bowel Resection) - mostly Level 2-3
- Limited exposure to EPA 9 (Trauma Lap) - only 5 assessments, all Level 2

This tells the CCC: "Emma is progressing well on common procedures but needs more trauma exposure."

### Scenario 3: A Complex Case Assessment

Dr. Martinez assesses Dr. Johnson on an emergent bowel resection at 2 AM:

```json
{
  "epa_id": 6,
  "entrustment_level": 3,
  "case_urgency": "emergent",
  "patient_asa_class": 4,
  "procedure_duration_min": 180,
  "complications": true,
  "location_type": "or",
  "location_details": "OR 3 - Trauma",
  "narrative_feedback": "Challenging case - perforated diverticulitis with fecal peritonitis. Emma led the case with me scrubbed. Good decision to proceed to Hartmann's rather than attempt anastomosis given sepsis. Needed some guidance on mobilization of the splenic flexure. Handled the complication (bleeding from mesentery) appropriately - recognized it, controlled it, and completed the case safely. This was a Level 4-quality decision-making effort in a high-stakes situation; scored as Level 3 only because of the technical assistance needed. She's ready for more independence on less complex bowel cases."
}
```

This assessment is rich because:
- Context (emergent, high ASA, complications) explains why Level 3 despite good performance
- Narrative provides specific, actionable feedback
- It will help the CCC understand Emma's progression in context

---

## Next Steps

With this model, we can:

1. **Build the schema** - Convert this to actual SQLite migrations
2. **Seed test data** - Create realistic scenarios for testing UX
3. **Design the assessment capture flow** - How does this data get created?
4. **Design the dashboards** - How does this data get consumed?

The model is designed to capture the real-world complexity of GME while staying practical for implementation.
