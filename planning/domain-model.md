# RMS Domain Model

This document maps the **business domain** of Graduate Medical Education, showing what we've modeled, what each concept means, and where we need to expand.

The goal: **Capture the full complexity of GME before building features.**

---

## How to Read This Document

Each section follows this pattern:
1. **The Concept** - What is this thing in the real world?
2. **Current Model** - What we've built
3. **Relationships** - How it connects to other concepts
4. **What's Missing** - Where we need to expand
5. **Questions to Answer** - Domain questions that drive the next iteration

---

## The Domain at a Glance

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                              ACGME (External Regulator)                         │
│                                       │                                         │
│                                       │ accredits                               │
│                                       ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                            INSTITUTION                                   │   │
│  │                    (Physical entity - hospital)                          │   │
│  │                                                                          │   │
│  │   ┌────────────────────────┐    ┌────────────────────────┐              │   │
│  │   │    SPONSORING ROLE     │    │   PARTICIPATING ROLE   │              │   │
│  │   │                        │    │                        │              │   │
│  │   │  DIO, GMEC, Policies   │◄──►│   (via PLAs)           │              │   │
│  │   │  Accreditation status  │PLA │   Clinical Sites       │              │   │
│  │   │                        │    │   Local Supervisors    │              │   │
│  │   │  ┌─────────────────┐   │    │                        │              │   │
│  │   │  │    Programs     │   │    └────────────────────────┘              │   │
│  │   │  │  ┌───────────┐  │   │                                            │   │
│  │   │  │  │ Residents │  │   │    Note: Same institution can have         │   │
│  │   │  │  │ Faculty   │  │   │    BOTH roles (MGH sponsors its own        │   │
│  │   │  │  │ EPAs      │  │   │    programs AND participates in HMS)       │   │
│  │   │  │  └───────────┘  │   │                                            │   │
│  │   │  └─────────────────┘   │                                            │   │
│  │   └────────────────────────┘                                            │   │
│  │                                                                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  KEY INSIGHT: Institutions play ROLES. The same institution can be both        │
│  a sponsor (running programs) and a participant (in other programs).           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

# LAYER 1: The Foundation

## 1.1 Company (Multi-Tenant Root)

### The Concept
In our SaaS model, a **Company** is a customer - a healthcare system that purchases our software. This is purely a technical/business construct, not a GME concept.

Examples: Partners Healthcare, Mayo Clinic, Cleveland Clinic

### Current Model
```sql
companies
├── id              -- UUID
├── name            -- "Partners Healthcare"
├── subdomain       -- "partners" (for partners.rms.com)
├── settings        -- JSON configuration
└── created_at
```

### Relationships
- **Owns →** Institutions (1:many)
- **Owns →** Users (1:many, for data isolation)

### What's Missing
| Gap | Why It Matters |
|-----|----------------|
| Subscription/billing info | Track what features they've paid for |
| Company-level admins | Who can manage the whole company? |
| Company-level settings | Branding, default configurations |

### Questions to Answer
- Can a company have multiple "brands" or is it always one unified system?
- Do companies share any data (benchmarking) or is it fully isolated?

---

## 1.2 Institution

### The Concept
An **Institution** is a physical/legal entity - a hospital, medical school, or healthcare facility. It's a place that exists in the real world with a physical address, legal status, and potentially its own ACGME identifier.

Institutions are the building blocks. They can take on different *roles* (sponsor, participant) but the institution itself is just an entity.

Examples: Massachusetts General Hospital, Harvard Medical School, VA Boston

### Current Model
```sql
institutions
├── id                    -- UUID
├── company_id            -- Which SaaS customer
├── name                  -- "Massachusetts General Hospital"
├── acgme_institution_id  -- ACGME's 7-digit identifier
├── type                  -- 'academic_medical_center', 'community_hospital', 'va', 'medical_school'
├── address
├── settings              -- JSON
└── created_at
```

### Relationships
- **Belongs to →** Company (many:1)
- **Can become →** Sponsoring Institution (1:1, optional)
- **Can be →** Participating Site in another's programs (via PLAs)
- **Contains →** Clinical Sites (1:many)

### What's Missing
| Gap | Why It Matters |
|-----|----------------|
| Leadership (CEO, CMO, CNO) | Who runs this institution? |
| Contact information | Phone, website, main address |
| Tax ID / NPI | Legal identifiers |
| Accreditation info | Joint Commission, state licenses |
| Bed count, trauma level | Size and capability indicators |
| Departments | Organizational structure within |

### Questions to Answer
- Do we need to model the internal org structure of an institution (departments, divisions)?
- How do multi-campus institutions work (MGH Main vs MGH satellite)?
- What about institutions that merge or change names?

---

# LAYER 2: Institutional Roles & Governance

## 2.1 Institution Roles (Hybrid Model)

### The Concept
When an institution decides to run residency programs, it takes on a **Sponsoring Role**. When it hosts residents from other programs, it takes on a **Participating Role**. These are separate *roles* the same institution can play.

**Key insight**: MGH can be BOTH:
- A sponsor (runs MGH General Surgery)
- A participant (in Harvard Medical School programs)

This is why we model roles separately from institutions.

### Design Decision: Why Roles?

We considered several approaches (see ADR 007):
- Single table with type column - rejected (can't be "both")
- Boolean flags - rejected (leads to null columns)
- Separate institution tables - rejected (duplicates base data)

**Solution**: Hybrid role-based model with extension tables for role-specific data.

### Current Model

**Institution Roles** (what roles does this institution play?):
```sql
institution_roles
├── id                -- UUID
├── institution_id    -- Which institution plays this role
├── role              -- 'sponsoring' or 'participating'
├── is_active         -- Currently active?
├── effective_date    -- When they started this role
├── ended_date        -- NULL if current
└── UNIQUE(institution_id, role, effective_date)
```

**Sponsoring Details** (1:1 extension for sponsoring roles):
```sql
sponsoring_details
├── institution_role_id   -- FK to institution_roles (PK)
├── acgme_sponsor_id      -- ACGME's sponsor identifier
├── dio_user_id           -- FK to users
├── dio_name              -- Fallback if user not in system
├── dio_email
├── acgme_status          -- 'accredited', 'probation', 'initial', etc.
├── next_site_visit       -- When ACGME will visit
└── last_site_visit
```

### Relationships
- **Institution can have →** Multiple roles (1:N)
- **Sponsoring role has →** Sponsoring details (1:1)
- **Sponsoring role owns →** Programs (1:many)
- **Sponsoring role links to →** Participating roles (via PLAs)
- **Participating role links to →** Sponsoring roles (via PLAs)

### What's Missing
| Gap | Why It Matters |
|-----|----------------|
| **DIO as User reference** | DIO should link to users table, not just be a name |
| **GMEC structure** | Chair, members, meeting schedule |
| **Institutional policies** | Duty hours policy, supervision policy, moonlighting policy |
| **Accreditation history** | Track changes in status over time |
| **Site visit history** | Past visits, findings, responses |
| **Annual reporting** | ADS submission tracking |

### Questions to Answer
- What happens when the DIO changes? Do we need history?
- How do we model GMEC membership and meetings?
- What institutional policies need to be tracked?
- How do we track ACGME citations and responses?

### Next Entities to Model
```
┌─────────────────────────────────────────────────────────┐
│  SPONSORING INSTITUTION GOVERNANCE                       │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │     DIO      │    │    GMEC      │                   │
│  │              │    │              │                   │
│  │  - User ref  │    │  - Chair     │                   │
│  │  - Start date│    │  - Members   │                   │
│  │  - End date  │    │  - Meetings  │                   │
│  └──────────────┘    └──────────────┘                   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              INSTITUTIONAL POLICIES               │   │
│  │                                                   │   │
│  │  - Duty hours policy                              │   │
│  │  - Supervision policy                             │   │
│  │  - Moonlighting policy                            │   │
│  │  - Fatigue mitigation policy                      │   │
│  │  - Grievance procedures                           │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              ACCREDITATION TRACKING               │   │
│  │                                                   │   │
│  │  - Status history                                 │   │
│  │  - Site visits (past & upcoming)                  │   │
│  │  - Citations & responses                          │   │
│  │  - Annual reports (ADS submissions)               │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 2.2 Participation Agreements (PLAs)

### The Concept
When residents train at a site that isn't the sponsoring institution, there must be a formal **Program Letter of Agreement (PLA)**. This is an ACGME requirement.

The PLA defines:
- Educational objectives at that site
- Who's responsible for supervision
- How duty hours are tracked
- How evaluations flow back to the program
- Duration and renewal terms

### Current Model
```sql
participation_agreements
├── id
├── sponsor_role_id       -- FK to institution_roles (where role='sponsoring')
├── participant_role_id   -- FK to institution_roles (where role='participating')
├── agreement_type        -- 'PLA', 'affiliation', 'MOU'
├── effective_date
├── expiration_date
├── status                -- 'active', 'expired', 'pending', 'terminated'
├── applies_to_all_programs  -- Or specific programs only
├── covered_program_ids   -- JSON array if not all
├── document_url          -- Link to signed agreement
├── notes
└── UNIQUE(sponsor_role_id, participant_role_id, effective_date)
```

### Relationships
- **Links →** Sponsor Role to Participant Role (via institution_roles)
- **Covers →** Programs (all or specific)
- **Enables →** Clinical Sites at that institution

**Note**: PLAs now link *roles* not institutions directly. This allows:
- Same institution to have multiple PLAs with different sponsors (if participating in multiple programs)
- Clean separation between the institutional relationship and the agreement terms

### What's Missing
| Gap | Why It Matters |
|-----|----------------|
| **Renewal tracking** | When does it expire? Who's responsible for renewal? |
| **Required content** | ACGME requires specific elements in PLAs |
| **Site director at each location** | Who's the responsible faculty at the participating site? |
| **Rotation-specific details** | Different rotations may have different terms |
| **Approval workflow** | Who signs? Legal review? |
| **Version history** | Track changes over time |

### Questions to Answer
- What are the required elements of a PLA per ACGME?
- How do we track the renewal process?
- Can a PLA be partially active (some programs but not others)?
- What happens when a PLA expires mid-rotation?

---

## 2.3 Clinical Sites

### The Concept
A **Clinical Site** is a specific location where training happens. It's more granular than an institution - MGH might have:
- Main OR suite
- Ambulatory surgery center
- Cancer center
- Various clinics
- ICUs

Each site may have different supervisors, different case types, different educational opportunities.

### Current Model
```sql
clinical_sites
├── id
├── institution_id             -- Which institution
├── participation_agreement_id -- NULL for primary, set for affiliates
├── name                       -- "MGH Surgical OR Suite"
├── site_classification        -- 'primary', 'affiliate', 'community', 'va'
├── address
├── is_active
└── created_at
```

### Relationships
- **Belongs to →** Institution (many:1)
- **Covered by →** Participation Agreement (if affiliate)
- **Used in →** Rotation Assignments
- **Location for →** EPA Assessments

### What's Missing
| Gap | Why It Matters |
|-----|----------------|
| **Site director/coordinator** | Who's responsible at this site? |
| **Available rotations** | Which rotation types happen here? |
| **Case volume/types** | What educational opportunities exist? |
| **Supervision model** | How is supervision structured here? |
| **Contact information** | How to reach the site |
| **Operating hours** | When is the site active? |
| **Capacity** | How many residents can train here at once? |

### Questions to Answer
- How granular should sites be? (OR suite vs individual ORs?)
- Do we need to track case volume by site?
- How do supervision structures vary by site?

---

# LAYER 3: Programs

## 3.1 Program

### The Concept
A **Program** is a specific residency or fellowship. It's the educational entity that:
- Is accredited by ACGME (separately from the institution)
- Has a **Program Director** responsible for education
- Has a **curriculum** residents must complete
- Has **faculty** who teach and assess
- Has **residents** progressing through training
- Reports to ACGME on milestones, duty hours, etc.

### Current Model
```sql
programs
├── id
├── sponsor_role_id      -- FK to institution_roles (where role='sponsoring')
├── specialty_code       -- References ref_specialties
├── name                 -- "MGH General Surgery Residency"
├── acgme_program_id     -- ACGME's program identifier
├── program_director_id  -- References users
├── settings             -- JSON for program config
└── created_at
```

### Relationships
- **Sponsored by →** Institution Role (many:1) - specifically, a sponsoring role
- **In specialty →** Reference Specialty (many:1)
- **Led by →** Program Director (who is a User/Faculty)
- **Contains →** Residents (1:many)
- **Has →** Faculty (many:many via program_memberships)
- **Follows →** Curriculum
- **Conducts →** CCC Reviews

### What's Missing
| Gap | Why It Matters |
|-----|----------------|
| **Associate/Assistant PDs** | Most programs have multiple leaders |
| **Program Coordinator** | Administrative lead (critical role) |
| **Program accreditation status** | Separate from institutional accreditation |
| **Complement (resident count)** | Approved number of residents per year |
| **Curriculum** | What must residents learn/do? |
| **Competency Committee** | The CCC structure |
| **Program Evaluation Committee** | Required by ACGME |
| **Selection Committee** | For recruitment |
| **Contact info** | Program phone, email, address |

### Questions to Answer
- How do we model the program leadership structure?
- What curriculum elements need to be tracked?
- How do complement limits work (approved vs actual)?
- What committees does a program have?

### Next Entities to Model
```
┌─────────────────────────────────────────────────────────┐
│  PROGRAM STRUCTURE                                       │
│                                                          │
│  LEADERSHIP                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│  │   Program    │ │  Associate   │ │   Program    │     │
│  │   Director   │ │     PDs      │ │ Coordinator  │     │
│  └──────────────┘ └──────────────┘ └──────────────┘     │
│                                                          │
│  COMMITTEES                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│  │     CCC      │ │     PEC      │ │  Selection   │     │
│  │ (Competency) │ │ (Evaluation) │ │  Committee   │     │
│  └──────────────┘ └──────────────┘ └──────────────┘     │
│                                                          │
│  CURRICULUM                                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Rotation requirements                            │   │
│  │  Procedure minimums                               │   │
│  │  Conference attendance                            │   │
│  │  Scholarly activity requirements                  │   │
│  │  EPA/Milestone targets                            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ACCREDITATION                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Status history                                   │   │
│  │  Site visits                                      │   │
│  │  Citations & responses                            │   │
│  │  Self-studies                                     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

# LAYER 4: People

## 4.1 Users

### The Concept
A **User** is any person in the system. We separate the *person* from their *roles* because:
- The same person can have multiple roles (resident AND faculty)
- Roles change over time (resident becomes faculty)
- Some attributes belong to the person, others to the role

### Current Model
```sql
users
├── id
├── company_id      -- For multi-tenant isolation
├── email
├── first_name
├── last_name
├── phone
├── photo_url
├── is_active
└── created_at
```

### Relationships
- **Belongs to →** Company (many:1)
- **Has →** Program Memberships (1:many) - defines roles
- **Can be →** Resident (1:many across programs/time)
- **Can be →** Faculty (1:many across programs/time)

### What's Missing
| Gap | Why It Matters |
|-----|----------------|
| **Credentials** | NPI, DEA, state licenses |
| **Demographics** | For reporting requirements |
| **Emergency contact** | Required for residents |
| **ERAS ID** | For matching/application tracking |
| **Preferred name** | May differ from legal name |
| **Pronouns** | Inclusion |
| **Communication preferences** | How do they want to be contacted? |

---

## 4.2 Program Memberships

### The Concept
A **Program Membership** links a user to a program with a specific role. This is the many-to-many with attributes pattern.

Key insight: A user can have MULTIPLE active memberships:
- Sarah Chen: resident in Surgery (since 2020)
- Sarah Chen: faculty in Surgery (since 2024, as chief)

### Current Model
```sql
program_memberships
├── id
├── user_id
├── program_id
├── role              -- 'resident', 'faculty', 'program_director', 'coordinator', 'observer'
├── is_active
├── started_at
├── ended_at
├── metadata          -- JSON for role-specific data
└── created_at
```

### Relationships
- **Links →** User to Program
- **Defines →** What the user can do in that program

### What's Missing
| Gap | Why It Matters |
|-----|----------------|
| **More granular roles** | 'faculty' is broad - what about 'core_faculty', 'voluntary_faculty', 'consulting_faculty'? |
| **Permissions** | What can each role actually do? |
| **Role history** | Track all role changes over time |

---

## 4.3 Residents

### The Concept
A **Resident** is a physician in training. They have attributes specific to being a trainee:
- Current training level (PGY-1, PGY-2, etc.)
- When they started and when they'll finish
- Their background (medical school, prior training)
- Their status (active, on leave, in remediation)

### Current Model
```sql
residents
├── id
├── user_id
├── program_id
├── pgy_level                  -- Current level (1-10)
├── entry_pgy_level            -- What level they started at
├── matriculation_date
├── expected_graduation_date
├── actual_graduation_date
├── medical_school
├── degree_type                -- 'MD', 'DO', 'MBBS'
├── status                     -- 'active', 'leave', 'remediation', 'completed', 'withdrawn'
├── track                      -- 'research', 'clinical', 'global_health'
├── npi
└── created_at
```

### Relationships
- **Is a →** User in role of resident
- **In →** Program (many:1)
- **Receives →** EPA Assessments (1:many)
- **Has →** Milestone Assessments (1:many)
- **Assigned to →** Rotations (1:many)
- **Reviewed by →** CCC (periodically)

### What's Missing
| Gap | Why It Matters |
|-----|----------------|
| **ECFMG certification** | Required for IMGs |
| **Visa status** | J-1, H-1B affects what they can do |
| **Board exam status** | Step 1/2/3, specialty boards |
| **Prior training** | Previous residency/fellowship |
| **Leave history** | LOA, parental leave, medical leave |
| **Remediation details** | If in remediation, what's the plan? |
| **Contract details** | Start date, salary, benefits |
| **Duty hour preferences** | Request patterns |
| **Scholarly activity** | Research, publications, presentations |
| **Procedure log** | What procedures have they done? |
| **Advisor/Mentor** | Who's guiding them? |

### Questions to Answer
- How do we track leaves of absence?
- How do we track remediation (separate table with plan, progress)?
- How do we model the path from resident to fellow to attending?

---

## 4.4 Faculty

### The Concept
**Faculty** are the teachers and assessors. They supervise residents, evaluate them, and contribute to education.

Types of faculty:
- **Core Faculty** - Significant time devoted to teaching (ACGME requirement)
- **Voluntary/Community Faculty** - Part-time teachers
- **Program Leadership** - PD, APDs
- **Consulting Faculty** - Specialists who teach occasionally

### Current Model
```sql
faculty
├── id
├── user_id
├── program_id
├── rank                -- 'instructor', 'assistant_professor', 'associate_professor', 'professor'
├── specialty
├── is_core_faculty     -- Required distinction for ACGME
├── teaching_percent    -- % time dedicated to teaching
├── is_active
├── started_at
├── ended_at
└── created_at
```

### Relationships
- **Is a →** User in role of faculty
- **In →** Program (many:1)
- **Gives →** EPA Assessments (1:many)
- **Participates in →** CCC (as committee member)
- **Supervises on →** Rotations

### What's Missing
| Gap | Why It Matters |
|-----|----------------|
| **Academic appointment** | Which medical school? What department? |
| **Board certifications** | Are they board certified in what they teach? |
| **Faculty development** | Training in assessment, education |
| **Scholarly activity** | Required for core faculty |
| **Administrative roles** | Committee memberships, leadership positions |
| **Evaluation performance** | Are their evaluations high quality? |
| **Teaching evaluations** | How do residents rate their teaching? |
| **Protected time** | Do they have time allocated for teaching? |

---

# LAYER 5: Reference Data

## 5.1 Specialties

### The Concept
**Specialties** are the fields of medicine that residency programs train in. They're defined by ACGME and the specialty boards.

Hierarchy matters:
- **Primary specialties**: General Surgery, Internal Medicine, Pediatrics
- **Subspecialties**: Vascular Surgery (requires General Surgery first)
- **Some have multiple pathways**: Vascular can be 5+2 (fellowship) or 0+5 (integrated)

### Current Model
```sql
ref_specialties
├── code                      -- 'general_surgery'
├── name                      -- 'General Surgery'
├── category                  -- 'surgical', 'medical', 'hospital_based'
├── acgme_specialty_code      -- ACGME's official code
├── typical_duration_years
├── is_subspecialty
├── parent_specialty_code     -- For subspecialties
├── requires_prerequisite
├── prerequisite_codes        -- JSON array
├── board_name                -- 'American Board of Surgery'
└── created_at
```

### What's Missing
| Gap | Why It Matters |
|-----|----------------|
| **Multiple training pathways** | Integrated vs traditional fellowship |
| **Required rotations** | What rotations does ACGME require? |
| **Case minimums** | Minimum procedures required |
| **Milestone versions** | Link to appropriate milestone set |
| **EPA versions** | Link to appropriate EPA set |

---

## 5.2 EPAs (Entrustable Professional Activities)

### The Concept
**EPAs** are the specific clinical activities that residents must demonstrate competency in. Unlike milestones (which describe abilities), EPAs describe **what residents actually do**.

The entrustment scale:
1. Observe only
2. Direct supervision (supervisor present)
3. Indirect supervision (supervisor immediately available)
4. Supervision on demand (supervisor available if needed)
5. Can supervise others

### Current Model
```sql
epas
├── id                    -- Standardized (1-18 for surgery)
├── specialty_code
├── name                  -- 'Laparoscopic Cholecystectomy'
├── short_name            -- 'Lap Chole'
├── description
├── category              -- 'preoperative', 'intraoperative', etc.
├── display_order
├── key_functions         -- JSON
├── entrustment_anchors   -- JSON (what each level looks like)
├── version
└── created_at
```

### What's Missing
| Gap | Why It Matters |
|-----|----------------|
| **Assessment criteria** | What should assessors look for? |
| **Expected progression** | When should residents reach each level? |
| **Related milestones** | Which milestones does this EPA map to? |
| **Case types** | What specific procedures count for this EPA? |
| **Required assessment volume** | How many assessments are needed? |

---

## 5.3 Competencies & Milestones

### The Concept (not fully modeled yet)
**Competencies** are the 6 domains ACGME uses to assess residents:
1. Patient Care
2. Medical Knowledge
3. Practice-Based Learning and Improvement
4. Interpersonal and Communication Skills
5. Professionalism
6. Systems-Based Practice

**Milestones** are developmental markers within each competency. They describe what residents should be able to do at each level of training.

### Current Model
```sql
ref_competencies
├── code           -- 'patient_care'
├── name
├── abbreviation   -- 'PC'
├── description
└── display_order
```

### What's Missing
| Gap | Why It Matters |
|-----|----------------|
| **Milestones table** | The actual milestone definitions |
| **Milestone → Competency mapping** | Which milestones belong to which competency |
| **Milestone → EPA mapping** | How do milestones relate to EPAs |
| **Specialty-specific milestones** | Each specialty has different milestones |
| **Milestone versions** | ACGME updates these periodically |
| **Expected levels by PGY year** | What level should a PGY-3 be at? |

---

# LAYER 6: Educational Structure (To Be Built)

## 6.1 Academic Years

### The Concept
Programs run on **academic years** (typically July 1 - June 30). Everything is organized around this cycle:
- Resident promotions happen at year boundaries
- Milestones are reported twice per year
- Rotations are scheduled within the year
- CCC reviews happen on a regular cycle

### To Model
```sql
academic_years
├── id
├── program_id
├── name              -- '2024-2025'
├── start_date        -- July 1
├── end_date          -- June 30
├── is_current
├── milestone_periods -- ['fall', 'spring'] or ['mid-year', 'year-end']
└── created_at
```

---

## 6.2 Blocks & Rotations

### The Concept
Most programs divide the year into **blocks** (often 4-week periods). Residents rotate through different services during each block.

**Rotation Types** are the kinds of rotations a program offers (Trauma, ICU, Research).
**Rotation Assignments** are when a specific resident is assigned to a specific rotation.

### To Model
```sql
blocks
├── id
├── academic_year_id
├── name              -- 'Block 1'
├── block_number
├── start_date
├── end_date

rotation_types
├── id
├── program_id
├── name              -- 'Acute Care Surgery'
├── code              -- 'ACS'
├── category          -- 'core', 'elective', 'research'
├── is_required
├── minimum_weeks
├── primary_epa_ids   -- Which EPAs are taught here
├── typical_site_ids  -- Where does this rotation happen

rotation_assignments
├── id
├── resident_id
├── rotation_type_id
├── block_id
├── clinical_site_id
├── primary_supervisor_id
├── start_date
├── end_date
├── status            -- 'scheduled', 'active', 'completed', 'cancelled'
```

---

## 6.3 Schedules (Beyond Rotations)

### The Concept
Beyond monthly rotations, programs need to track:
- **Call schedules** - Who's on call each night?
- **Clinic schedules** - When are residents in clinic?
- **Conference schedules** - Required educational sessions
- **Duty hour tracking** - Are limits being met?

### To Model (Future)
This is complex and might be its own module:
- Shift definitions
- Schedule generation (constraints-based)
- Swap requests and approvals
- Duty hour calculations
- Time off requests

---

# LAYER 7: Assessments & Reviews (To Be Built)

## 7.1 EPA Assessments (Current Focus)

### The Concept
The **EPA Assessment** is the core transaction: A faculty observes a resident and records their entrustment level.

### Current Model
```sql
epa_assessments
├── id
├── resident_id
├── assessor_id
├── epa_id
├── entrustment_level      -- 1-5
├── assessment_date
├── submission_date
├── clinical_site_id
├── case_urgency
├── patient_asa_class
├── procedure_duration_min
├── complications
├── location_type
├── location_details
├── narrative_feedback
├── specialty_context      -- JSON
├── entry_method
├── acknowledged
├── deleted (soft delete)
└── created_at
```

### What's Missing
| Gap | Why It Matters |
|-----|----------------|
| **Case types table** | Specific procedure types for granular tracking |
| **Feedback tags** | Structured feedback (strengths, areas for improvement) |
| **Entrustment rationale** | Why this level? |
| **Follow-up actions** | Did this trigger any follow-up? |
| **Assessment quality** | Was this a meaningful assessment? |
| **Multi-EPA assessments** | Can one case cover multiple EPAs? |

---

## 7.2 Milestone Assessments (To Build)

### The Concept
Twice yearly, the **CCC** reviews each resident and assigns **milestone levels**. This is a committee decision, not an individual assessment.

### To Model
```sql
milestone_assessments
├── id
├── resident_id
├── milestone_id
├── academic_year_id
├── period               -- 'fall', 'spring'
├── level                -- 1.0 - 5.0 (can be 2.5)
├── rationale
├── supporting_evidence  -- Links to EPAs, evaluations
├── ccc_meeting_id
├── submitted_to_acgme
├── submitted_at
```

---

## 7.3 CCC Reviews (To Build)

### The Concept
The **Clinical Competency Committee (CCC)** is a group of faculty who:
- Meet regularly (often monthly or bi-monthly)
- Review resident performance
- Assign milestone levels
- Identify residents who need support
- Make promotion recommendations

### To Model
```sql
ccc_meetings
├── id
├── program_id
├── meeting_date
├── period               -- For milestone reporting
├── chair_id
├── attendees            -- Who was present
├── status               -- 'scheduled', 'in_progress', 'completed'
├── minutes

ccc_resident_reviews
├── id
├── ccc_meeting_id
├── resident_id
├── overall_performance  -- 'exceeding', 'meeting', 'below'
├── strengths
├── areas_for_improvement
├── action_items
├── promotion_recommendation
├── requires_remediation
├── next_review_date
```

---

## 7.4 Other Evaluations (To Build)

### The Concept
Beyond EPAs and milestones, programs collect:
- **End-of-rotation evaluations** - Faculty evaluates resident after each rotation
- **Resident evaluations of faculty** - Residents evaluate their teachers
- **Resident evaluations of program** - Annual program evaluation
- **360 evaluations** - Feedback from nurses, peers, patients
- **In-training exams** - Annual knowledge tests

### To Model (Future)
```
evaluations (generic)
├── type           -- 'end_of_rotation', '360', 'faculty_of_resident', etc.
├── evaluator_id
├── evaluatee_id
├── template_id    -- Which questions to ask
├── responses      -- JSON of answers
├── completed_at
```

---

# DOMAIN EXPANSION ROADMAP

## Where We Are Now
```
✅ Companies (multi-tenant root)
✅ Institutions (physical entities)
✅ Sponsoring Institutions (basic)
✅ Participation Agreements (basic)
✅ Clinical Sites (basic)
✅ Programs (basic)
✅ Users
✅ Program Memberships
✅ Residents (basic)
✅ Faculty (basic)
✅ EPAs (reference data)
✅ Competencies (reference data)
✅ EPA Assessments (core feature)
```

## Next Priority: Deepen What We Have
```
🔲 DIO as proper user reference
🔲 GMEC structure (members, meetings)
🔲 Program leadership (APDs, coordinators)
🔲 Site directors for clinical sites
🔲 Case types for EPA assessments
🔲 Feedback tags for structured feedback
```

## Then: Add Academic Structure
```
🔲 Academic years
🔲 Blocks
🔲 Rotation types
🔲 Rotation assignments
```

## Then: Complete Assessment Picture
```
🔲 Milestones (reference data)
🔲 Milestone assessments
🔲 CCC meetings
🔲 CCC resident reviews
```

## Then: Policies & Compliance
```
🔲 Institutional policies
🔲 Duty hour tracking
🔲 Accreditation tracking
🔲 Leave management
🔲 Remediation tracking
```

## Then: Rich Evaluations
```
🔲 End-of-rotation evaluations
🔲 360 evaluations
🔲 Faculty evaluations
🔲 Program evaluations
```

## Then: Advanced Features
```
🔲 Procedure logging
🔲 Scholarly activity tracking
🔲 Conference attendance
🔲 Scheduling & call
🔲 Recruitment
```

---

# Summary: The Core Insight

The GME domain has this fundamental structure:

1. **Institutions** are places
2. **Sponsoring Institutions** take on responsibility for education
3. **Programs** are the educational units within sponsors
4. **People** have roles within programs (resident, faculty, leadership)
5. **Residents** progress through training
6. **Assessments** measure that progress
7. **Committees** make decisions about progression
8. **ACGME** oversees it all

Every feature we build should map to this structure. EPA capture? It's an assessment of a resident by faculty. CCC review? It's a committee making decisions about progression. Scheduling? It's organizing where residents go within their program.

**The model IS the product.** Get this right, and features flow naturally.
