---
name: data-model
description: Database schema and relationships for the RMS platform including multi-tenant structure, reference data, and assessment models
---

# RMS Data Model

## Design Principles

1. **Role-Based Over Type Columns** - Entities that can "play different roles" use separate role tables instead of boolean flags or type columns with conditional nulls (see Institution Roles pattern below)
2. **UUIDs for Primary Keys** - Distributed-friendly, non-enumerable
3. **Reference Data vs Tenant Data** - Shared reference tables, isolated tenant data
4. **Structured over JSONB** - Use proper tables/columns for queryable data
5. **Soft Deletes for Auditing** - Assessment data uses soft deletes
6. **Temporal Tracking** - Track effective dates, history for key entities
7. **Multi-tenancy at Company Level** - Companies own institutions

## Key Design Pattern: Role-Based Modeling

**Problem**: An institution can be both a "sponsoring institution" (holds ACGME accreditation, has programs) AND a "participating institution" (provides clinical training sites for another sponsor's programs). How do we model this?

**Anti-patterns we avoided**:
- Single table with `is_sponsoring`, `is_participating` booleans (leads to null columns)
- Type column with `type = 'sponsoring' | 'participating'` (can't be both)
- Separate `sponsoring_institutions` and `participating_institutions` tables (duplicates institution data)

**Solution: Hybrid Role-Based Model**

```
institutions (base entity - physical location)
    ↓
institution_roles (1:N - what roles does this institution play?)
    ├── role = 'sponsoring' → sponsoring_details (1:1 extension)
    └── role = 'participating' → (no extra table, just the role record)

participation_agreements (links sponsor role ↔ participant role)
```

This allows:
- MGH to be BOTH a sponsor (runs programs) AND a participant (sends residents to VA)
- An institution to have multiple PLAs with different sponsors
- Clean separation of concerns (institution data vs role-specific data)
- Proper foreign keys throughout

## Multi-Tenant Hierarchy

```
Company (SaaS tenant - top level)
└── Institution (physical entity - hospital/medical school)
    └── Institution Roles
        ├── Sponsoring Role (has ACGME accreditation)
        │   ├── Sponsoring Details (DIO, site visits, etc.)
        │   └── Programs
        │       ├── Residents
        │       ├── Faculty
        │       └── Academic Years → Blocks → Rotations
        └── Participating Role (provides training sites)
            └── Participation Agreements → Clinical Sites
```

## Reference Data (Shared Across All Tenants)

### ref_specialties
```sql
- code TEXT PRIMARY KEY -- 'general_surgery', 'internal_medicine'
- name TEXT NOT NULL
- category TEXT -- 'surgical', 'medical', 'hospital_based'
- acgme_specialty_code TEXT
- typical_duration_years INTEGER
- is_subspecialty INTEGER (boolean)
- parent_specialty_code TEXT FK -- for subspecialties
- requires_prerequisite INTEGER (boolean)
- prerequisite_codes TEXT -- JSON array
- board_name TEXT
```

### ref_competencies
The 6 ACGME Core Competencies.
```sql
- code TEXT PRIMARY KEY -- 'patient_care', 'medical_knowledge'
- name TEXT NOT NULL
- abbreviation TEXT -- 'PC', 'MK'
- description TEXT
- display_order INTEGER
```

### epas
Entrustable Professional Activities - specific clinical tasks.
```sql
- id INTEGER PRIMARY KEY -- standardized (1-18 for surgery)
- specialty_code TEXT FK → ref_specialties
- name TEXT NOT NULL
- short_name TEXT NOT NULL
- description TEXT
- category TEXT -- 'preoperative', 'intraoperative', 'postoperative', 'longitudinal', 'professional'
- display_order INTEGER
- key_functions TEXT -- JSON array
- entrustment_anchors TEXT -- JSON object with level descriptions
- version TEXT
```

## Tenant Data

### companies (Top-Level Tenant)
```sql
- id TEXT PRIMARY KEY (UUID)
- name TEXT NOT NULL
- subdomain TEXT UNIQUE -- for multi-tenant routing
- settings TEXT -- JSON
- created_at, updated_at TEXT (TIMESTAMP)
```

### institutions
The base physical entity. Does NOT contain role-specific data.
```sql
- id TEXT PRIMARY KEY (UUID)
- company_id TEXT FK → companies
- name TEXT NOT NULL
- acgme_institution_id TEXT -- ACGME's 7-digit identifier
- type TEXT -- 'academic_medical_center', 'community_hospital', 'va', 'medical_school'
- address TEXT
- settings TEXT -- JSON
```

### institution_roles
What roles does this institution play?
```sql
- id TEXT PRIMARY KEY (UUID)
- institution_id TEXT FK → institutions
- role TEXT CHECK (role IN ('sponsoring', 'participating'))
- is_active INTEGER (boolean)
- effective_date TEXT (DATE) -- when they started this role
- ended_date TEXT (DATE) -- NULL if current
- UNIQUE (institution_id, role, effective_date)
```

**Key insight**: An institution can have MULTIPLE roles. MGH is both a sponsor (runs its own programs) and a participant (in HMS programs).

### sponsoring_details
1:1 extension for institutions with role='sponsoring'. Contains ACGME-specific data.
```sql
- institution_role_id TEXT PRIMARY KEY FK → institution_roles
- acgme_sponsor_id TEXT UNIQUE -- ACGME's sponsor identifier
- dio_user_id TEXT FK → users -- Designated Institutional Official
- dio_name TEXT -- fallback if not in system
- dio_email TEXT
- acgme_status TEXT -- 'accredited', 'probation', 'initial', 'warning', 'withdrawn'
- next_site_visit TEXT (DATE)
- last_site_visit TEXT (DATE)
```

### participation_agreements
Links a sponsor role to a participant role. Represents the formal PLA (Program Letter of Agreement).
```sql
- id TEXT PRIMARY KEY (UUID)
- sponsor_role_id TEXT FK → institution_roles (where role='sponsoring')
- participant_role_id TEXT FK → institution_roles (where role='participating')
- agreement_type TEXT -- 'PLA', 'affiliation', 'MOU'
- effective_date TEXT (DATE)
- expiration_date TEXT (DATE)
- status TEXT -- 'active', 'expired', 'pending', 'terminated'
- applies_to_all_programs INTEGER (boolean)
- covered_program_ids TEXT -- JSON array if not all programs
- document_url TEXT
- notes TEXT
- UNIQUE (sponsor_role_id, participant_role_id, effective_date)
```

### clinical_sites
Specific locations where training happens.
```sql
- id TEXT PRIMARY KEY (UUID)
- institution_id TEXT FK → institutions
- participation_agreement_id TEXT FK (optional) -- NULL for primary sites
- name TEXT NOT NULL
- site_classification TEXT -- 'primary', 'affiliate', 'community', 'va'
- address TEXT
- is_active INTEGER (boolean)
```

### programs
Residency and fellowship programs.
```sql
- id TEXT PRIMARY KEY (UUID)
- sponsor_role_id TEXT FK → institution_roles (where role='sponsoring')
- specialty_code TEXT FK → ref_specialties
- name TEXT NOT NULL
- acgme_program_id TEXT
- program_director_id TEXT FK → users
- settings TEXT -- JSON
```

## Users & Roles

### users
All people in the system.
```sql
- id TEXT PRIMARY KEY (UUID)
- company_id TEXT FK → companies
- email TEXT NOT NULL
- first_name TEXT NOT NULL
- last_name TEXT NOT NULL
- phone TEXT
- photo_url TEXT
- is_active INTEGER (boolean)
- UNIQUE(company_id, email)
```

### program_memberships
Links users to programs with roles. A user can have MULTIPLE memberships.
```sql
- id TEXT PRIMARY KEY (UUID)
- user_id TEXT FK → users
- program_id TEXT FK → programs
- role TEXT -- 'resident', 'faculty', 'program_director', 'coordinator', 'observer'
- is_active INTEGER (boolean)
- started_at TEXT (DATE)
- ended_at TEXT (DATE)
- metadata TEXT -- JSON for role-specific data
```

**Key**: Same user can be both 'resident' AND 'faculty' (e.g., chief resident who supervises).

### residents
Extended data for users who are residents.
```sql
- id TEXT PRIMARY KEY (UUID)
- user_id TEXT FK → users
- program_id TEXT FK → programs
- pgy_level INTEGER (1-10)
- entry_pgy_level INTEGER
- matriculation_date TEXT (DATE)
- expected_graduation_date TEXT (DATE)
- actual_graduation_date TEXT (DATE)
- medical_school TEXT
- degree_type TEXT -- 'MD', 'DO', 'MBBS'
- status TEXT -- 'active', 'leave', 'remediation', 'completed', 'withdrawn'
- track TEXT -- 'research', 'clinical', 'global_health'
- npi TEXT
- UNIQUE(user_id, program_id)
```

### faculty
Extended data for users who are faculty.
```sql
- id TEXT PRIMARY KEY (UUID)
- user_id TEXT FK → users
- program_id TEXT FK → programs
- rank TEXT -- 'instructor', 'assistant_professor', 'associate_professor', 'professor'
- specialty TEXT
- is_core_faculty INTEGER (boolean)
- teaching_percent INTEGER -- % time dedicated to teaching
- is_active INTEGER (boolean)
- started_at TEXT (DATE)
- ended_at TEXT (DATE)
- UNIQUE(user_id, program_id)
```

## EPA Assessments (MVP Core)

### epa_assessments
```sql
- id TEXT PRIMARY KEY (UUID)
- resident_id TEXT FK → residents
- assessor_id TEXT FK → faculty
- epa_id INTEGER FK → epas
- entrustment_level INTEGER (1-5) CHECK (1-5)
- assessment_date TEXT (TIMESTAMP)
- submission_date TEXT (TIMESTAMP)

-- Context (structured, not JSON)
- clinical_site_id TEXT FK (optional)
- case_urgency TEXT -- 'elective', 'urgent', 'emergent'
- patient_asa_class INTEGER (1-6)
- procedure_duration_min INTEGER
- complications INTEGER (boolean)
- location_type TEXT -- 'or', 'clinic', 'icu', 'ed', 'ward'
- location_details TEXT -- 'OR 5', 'ICU Bed 12'

-- Feedback
- narrative_feedback TEXT
- specialty_context TEXT -- JSON for specialty-specific fields

-- Metadata
- entry_method TEXT -- 'mobile_ios', 'mobile_android', 'web'
- acknowledged INTEGER (boolean)
- acknowledged_at TEXT (TIMESTAMP)

-- Soft delete
- deleted INTEGER (boolean)
- deleted_at TEXT (TIMESTAMP)
- deleted_by TEXT FK → users
```

## Key Indexes

```sql
-- Multi-tenant isolation
CREATE INDEX idx_institutions_company ON institutions(company_id);
CREATE INDEX idx_users_company ON users(company_id);

-- Institution roles
CREATE INDEX idx_institution_roles_institution ON institution_roles(institution_id);
CREATE INDEX idx_institution_roles_role ON institution_roles(role);
CREATE INDEX idx_institution_roles_active ON institution_roles(is_active) WHERE is_active = 1;

-- Participation agreements
CREATE INDEX idx_agreements_sponsor ON participation_agreements(sponsor_role_id);
CREATE INDEX idx_agreements_participant ON participation_agreements(participant_role_id);

-- Program lookups
CREATE INDEX idx_programs_sponsor ON programs(sponsor_role_id);
CREATE INDEX idx_programs_specialty ON programs(specialty_code);

-- EPA Assessments (performance critical)
CREATE INDEX idx_assessments_resident ON epa_assessments(resident_id) WHERE deleted = 0;
CREATE INDEX idx_assessments_resident_epa ON epa_assessments(resident_id, epa_id) WHERE deleted = 0;
CREATE INDEX idx_assessments_assessor ON epa_assessments(assessor_id) WHERE deleted = 0;
CREATE INDEX idx_assessments_date ON epa_assessments(assessment_date) WHERE deleted = 0;
```

## Future Tables (Not Yet Implemented)

### Academic Structure
- `academic_years` - Program years (2024-2025)
- `blocks` - Time periods within academic year
- `rotation_types` - Types of clinical rotations
- `rotation_assignments` - Resident rotation schedules

### Milestones & CCC
- `milestones` - ACGME developmental markers
- `milestone_assessments` - Semi-annual milestone ratings
- `ccc_meetings` - Clinical Competency Committee meetings
- `ccc_resident_reviews` - CCC review outcomes

### Supporting
- `audit_logs` - Track all changes
- `notifications` - User notifications
- `feedback_tags` - Structured feedback options
