---
name: data-model
description: Database schema and relationships for the RMS platform including multi-tenant structure, reference data, and assessment models
---

# RMS Data Model

## Design Principles

1. **UUIDs for Primary Keys** - Distributed-friendly, non-enumerable
2. **Reference Data vs Tenant Data** - Shared reference tables, isolated tenant data
3. **Structured over JSONB** - Use proper tables/columns for queryable data
4. **Soft Deletes for Auditing** - Assessment data uses soft deletes
5. **Temporal Tracking** - Track effective dates, history for key entities
6. **Multi-tenancy at Company Level** - Companies own institutions

## Multi-Tenant Hierarchy

```
Company (SaaS tenant - top level)
└── Institution (hospital/medical school)
    ├── Sponsoring Institution Role
    │   ├── Programs
    │   │   ├── Residents
    │   │   ├── Faculty
    │   │   └── Academic Years → Blocks → Rotation Assignments
    │   └── DIO, GMEC info
    └── Participating Institution Role (via PLAs)
        └── Clinical Sites
```

## Reference Data (Shared Across All Tenants)

### ref_specialties
```sql
- code: VARCHAR(50) PK -- 'general_surgery', 'internal_medicine'
- name: VARCHAR(255)
- category: VARCHAR(100) -- 'surgical', 'medical', 'hospital_based'
- acgme_specialty_code: VARCHAR(20)
- typical_duration_years: INTEGER
- is_subspecialty: BOOLEAN
- parent_specialty_code: VARCHAR(50) FK -- for subspecialties
- pathway_type: VARCHAR(50) -- 'categorical', 'fellowship', 'integrated'
- requires_prerequisite: BOOLEAN
- prerequisite_specialty_codes: VARCHAR(50)[]
- board_certification_body: VARCHAR(255)
```

### ref_competencies
```sql
- code: VARCHAR(50) PK -- 'patient_care', 'medical_knowledge'
- name: VARCHAR(255)
- abbreviation: VARCHAR(10) -- 'PC', 'MK'
- description: TEXT
- display_order: INTEGER
```

### epas
```sql
- id: INTEGER PK -- standardized (1-18 for surgery)
- specialty_code: VARCHAR(50) FK → ref_specialties
- name: VARCHAR(255)
- short_name: VARCHAR(100)
- description: TEXT
- category: VARCHAR(100) -- 'preoperative', 'intraoperative', etc.
- display_order: INTEGER
- entrustment_levels: JSONB -- level definitions
- version: VARCHAR(20)
```

### milestones
```sql
- id: UUID PK
- specialty_code: VARCHAR(50) FK
- version: VARCHAR(20)
- competency: VARCHAR(100) -- FK to ref_competencies.code
- subcompetency: VARCHAR(255)
- milestone_number: VARCHAR(20) -- 'PC1', 'MK2'
- description: TEXT
- level_descriptors: JSONB -- levels 1-5 descriptions
- effective_date: DATE
```

### case_types (for surgical EPAs)
```sql
- id: UUID PK
- epa_id: INTEGER FK → epas
- name: VARCHAR(100) -- 'Laparoscopic cholecystectomy'
- code: VARCHAR(50) -- 'LAP_CHOLE'
- typical_duration_minutes: INTEGER
```

### feedback_tags
```sql
- id: UUID PK
- category: VARCHAR(50) -- 'strength', 'area_for_improvement'
- name: VARCHAR(100)
- description: TEXT
- specialty: VARCHAR(100) -- NULL = applies to all
```

## Tenant Data

### companies (Top-Level Tenant)
```sql
- id: UUID PK
- name: VARCHAR(255)
- subdomain: VARCHAR(100) UNIQUE -- for multi-tenant routing
- settings: JSONB
- subscription_tier: VARCHAR(50)
- created_at, updated_at: TIMESTAMP
```

### institutions
```sql
- id: UUID PK
- company_id: UUID FK → companies
- name: VARCHAR(255)
- acgme_institution_id: VARCHAR(50)
- type: VARCHAR(50) -- 'academic_medical_center', 'community_hospital', 'va'
- address: TEXT
- settings: JSONB
- acgme_verified: BOOLEAN
```

### sponsoring_institutions
```sql
- id: UUID PK
- institution_id: UUID FK → institutions
- dio_user_id: UUID FK → users
- dio_name, dio_email: VARCHAR(255)
- gmec_chair_id: UUID FK → users
- acgme_accreditation_status: VARCHAR(50)
- next_site_visit: DATE
- effective_date: DATE
- is_active: BOOLEAN
```

### participation_agreements (PLAs)
```sql
- id: UUID PK
- sponsoring_institution_id: UUID FK → sponsoring_institutions
- participating_institution_id: UUID FK → institutions
- agreement_type: VARCHAR(50) -- 'PLA', 'affiliation_agreement'
- effective_date, expiration_date: DATE
- status: VARCHAR(50) -- 'active', 'pending', 'expired'
- applies_to_all_programs: BOOLEAN
- covered_program_ids: UUID[]
```

### programs
```sql
- id: UUID PK
- sponsoring_institution_id: UUID FK → sponsoring_institutions
- name: VARCHAR(255)
- specialty_code: VARCHAR(50) FK → ref_specialties
- acgme_program_id: VARCHAR(50)
- program_director_id: UUID FK → users
- acgme_verified: BOOLEAN
- settings: JSONB
```

### clinical_sites
```sql
- id: UUID PK
- institution_id: UUID FK → institutions
- participation_agreement_id: UUID FK (optional)
- name: VARCHAR(255)
- type: VARCHAR(50) -- 'primary', 'affiliate', 'va'
- site_classification: VARCHAR(50)
- is_participating_site: BOOLEAN
```

## Users & Roles

### users
```sql
- id: UUID PK
- company_id: UUID FK → companies
- email: VARCHAR(255) UNIQUE
- first_name, last_name: VARCHAR(100)
- password_hash: VARCHAR(255)
- sso_provider, sso_subject: VARCHAR(255)
- phone: VARCHAR(20)
- photo_url: TEXT
- is_active: BOOLEAN
- email_verified: BOOLEAN
- last_login_at: TIMESTAMP
```

### program_memberships
```sql
- id: UUID PK
- user_id: UUID FK → users
- program_id: UUID FK → programs
- role: VARCHAR(50) -- 'resident', 'faculty', 'program_director', 'coordinator'
- metadata: JSONB
- is_active: BOOLEAN
- started_at, ended_at: DATE
```

**Key**: A user can have MULTIPLE active memberships with different roles (e.g., chief resident who is both 'resident' and 'faculty').

### residents
```sql
- id: UUID PK
- user_id: UUID FK → users
- program_id: UUID FK → programs
- pgy_level: INTEGER (1-10)
- entry_pgy_level: INTEGER
- matriculation_date: DATE
- expected_graduation_date, actual_graduation_date: DATE
- track: VARCHAR(100) -- 'research', 'global_health'
- medical_school: VARCHAR(255)
- degree_type: VARCHAR(20) -- 'MD', 'DO', 'MBBS'
- npi, state_license_number, dea_number: VARCHAR
- status: VARCHAR(50) -- 'active', 'leave_of_absence', 'completed'
```

### faculty
```sql
- id: UUID PK
- user_id: UUID FK → users
- program_id: UUID FK → programs
- rank: VARCHAR(100) -- 'assistant_professor', 'professor'
- department, specialty: VARCHAR
- is_core_faculty: BOOLEAN
- teaching_percentage: INTEGER
- is_active: BOOLEAN
- started_at, ended_at: DATE
```

## Academic Structure

### academic_years
```sql
- id: UUID PK
- program_id: UUID FK
- name: VARCHAR(50) -- '2024-2025'
- start_date, end_date: DATE
- is_current: BOOLEAN
```

### blocks
```sql
- id: UUID PK
- academic_year_id: UUID FK
- name: VARCHAR(50) -- 'Block 1'
- block_number: INTEGER
- start_date, end_date: DATE
```

### rotation_types
```sql
- id: UUID PK
- program_id: UUID FK
- name: VARCHAR(255) -- 'Acute Care Surgery'
- code: VARCHAR(50) -- 'ACS'
- category: VARCHAR(100) -- 'core', 'elective'
- is_required: BOOLEAN
- minimum_weeks: INTEGER
- primary_epa_ids: INTEGER[]
```

### rotation_assignments
```sql
- id: UUID PK
- resident_id: UUID FK → residents
- rotation_type_id: UUID FK → rotation_types
- block_id: UUID FK → blocks
- clinical_site_id: UUID FK → clinical_sites
- primary_supervisor_id: UUID FK → faculty
- start_date, end_date: DATE
- status: VARCHAR(50) -- 'scheduled', 'active', 'completed'
```

## EPA Assessments (MVP Core)

### epa_assessments
```sql
- id: UUID PK
- resident_id: UUID FK → residents
- assessor_id: UUID FK → faculty
- epa_id: INTEGER FK → epas
- assessment_date, submission_date: TIMESTAMP
- entrustment_level: INTEGER (1-5)

-- Context (structured, not JSONB)
- rotation_assignment_id: UUID FK (optional)
- clinical_site_id: UUID FK (optional)
- case_type_id: UUID FK → case_types (optional)
- case_urgency: VARCHAR(20) -- 'elective', 'urgent', 'emergent'
- patient_asa_class: INTEGER (1-6)
- procedure_duration_minutes: INTEGER
- complications_occurred: BOOLEAN
- location_type: VARCHAR(50) -- 'operating_room', 'clinic', 'icu'
- location_details: VARCHAR(100)

-- Feedback
- narrative_feedback: TEXT
- specialty_context: JSONB -- minimal, specialty-specific only

-- Metadata
- entry_method: VARCHAR(50) -- 'mobile_ios', 'mobile_android', 'web'
- edited: BOOLEAN
- acknowledged_by_resident: BOOLEAN

-- Soft delete
- deleted: BOOLEAN
- deleted_at: TIMESTAMP
- deleted_by: UUID FK
```

### epa_assessment_feedback_tags (Many-to-Many)
```sql
- id: UUID PK
- epa_assessment_id: UUID FK → epa_assessments
- feedback_tag_id: UUID FK → feedback_tags
- tag_type: VARCHAR(50) -- 'went_well', 'needs_work'
```

## Milestones & CCC (Future)

### milestone_assessments
```sql
- id: UUID PK
- resident_id: UUID FK
- milestone_id: UUID FK
- academic_year_id: UUID FK
- period: VARCHAR(20) -- 'fall', 'spring'
- assessment_date: DATE
- level: DECIMAL(2,1) -- allows 2.5, 3.5
- rationale: TEXT
- ccc_meeting_id: UUID FK
- submitted_to_acgme: BOOLEAN
```

### ccc_meetings
```sql
- id: UUID PK
- program_id: UUID FK
- academic_year_id: UUID FK
- meeting_date: DATE
- period: VARCHAR(20)
- chair_id: UUID FK → faculty
- attendee_ids: UUID[]
- status: VARCHAR(50)
- minutes: TEXT
```

### ccc_resident_reviews
```sql
- id: UUID PK
- ccc_meeting_id: UUID FK
- resident_id: UUID FK
- overall_performance: VARCHAR(50)
- promotion_recommendation: VARCHAR(50)
- strengths, areas_for_improvement: TEXT
- requires_remediation: BOOLEAN
```

## Supporting Tables

### audit_logs
```sql
- id: UUID PK
- user_id: UUID FK
- entity_type: VARCHAR(100)
- entity_id: UUID
- action: VARCHAR(50) -- 'created', 'updated', 'deleted'
- changes: JSONB
- ip_address: INET
- created_at: TIMESTAMP
```

### notifications
```sql
- id: UUID PK
- user_id: UUID FK
- type: VARCHAR(50) -- 'assessment_reminder', 'milestone_achieved'
- priority: VARCHAR(20)
- title, message: TEXT
- read: BOOLEAN
- scheduled_for, sent_at: TIMESTAMP
```

## Key Indexes

```sql
-- EPA Assessments (performance critical)
CREATE INDEX idx_epa_assessments_resident ON epa_assessments(resident_id) WHERE deleted = false;
CREATE INDEX idx_epa_assessments_resident_epa ON epa_assessments(resident_id, epa_id) WHERE deleted = false;
CREATE INDEX idx_epa_assessments_assessor_date ON epa_assessments(assessor_id, assessment_date DESC) WHERE deleted = false;

-- Multi-tenant isolation
CREATE INDEX idx_institutions_company ON institutions(company_id);
CREATE INDEX idx_users_company ON users(company_id);
```

## Materialized Views (Analytics)

### resident_epa_progress
Aggregates assessment counts, levels, and progression metrics per resident per EPA.

### program_assessment_metrics
Program-level analytics: assessment activity, faculty engagement, quality metrics.
