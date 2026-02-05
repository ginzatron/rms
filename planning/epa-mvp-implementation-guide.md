# EPA Assessment MVP - Complete Implementation Guide

## Executive Summary

This document provides a complete specification for building a minimum viable product (MVP) for EPA (Entrustable Professional Activities) assessment in graduate medical education. The system focuses on delivering immediate value through EPA documentation and progress tracking, with a database schema designed to accommodate future expansion into a full residency management system.

**Core Value Proposition:** Enable faculty to quickly log EPA assessments and residents to track their progress toward graduation requirements.

---

## Table of Contents

1. [Product Strategy & Approach](#product-strategy--approach)
2. [MVP Features](#mvp-features)
3. [Database Schema](#database-schema)
4. [Sample Data](#sample-data)
5. [Essential Queries](#essential-queries)
6. [API Endpoints](#api-endpoints)
7. [Future Enhancements](#future-enhancements)
8. [Implementation Notes](#implementation-notes)

---

## Product Strategy & Approach

### Why Start with EPAs?

**The Problem:**
- Residency programs are drowning in assessment documentation requirements
- Faculty struggle to provide timely, meaningful feedback
- Residents can't easily track their progress toward competency milestones
- Program directors lack visibility into resident development

**The Solution - Start Small:**
Instead of building the entire institutional hierarchy first (institutions → programs → sites → rotations → assessments), we start with the atomic unit of value: **logging and tracking EPA assessments**.

### Development Philosophy

**Build for One Thing Well:**
1. Make EPA assessment capture effortless for faculty
2. Make progress tracking clear for residents
3. Make oversight simple for program directors

**Defer Complexity:**
- Don't build multi-institutional hierarchies until you have users
- Don't build complex rotation scheduling until it's a pain point
- Don't integrate milestones until EPA tracking is solid

**Work Backwards from Value:**
Start with "log an EPA assessment" and discover what data you actually need, rather than building a complete data model upfront.

---

## MVP Features

### For Residents

**Primary Dashboard:**
- View EPA progress toward graduation requirements
  - "You've completed 12/15 required EPA 1 assessments at Level 4+"
  - "You need 3 more EPA 5 assessments"
- Visual progress indicators (progress bars, completion percentages)
- Filter by training level requirements (PGY-1 vs. graduation)

**Assessment History:**
- View all EPA assessments received
- Filter by EPA type, faculty, date range, entrustment level
- Read narrative feedback from faculty

**What Residents CANNOT Do (MVP):**
- ❌ Request specific EPA assessments (workflow complexity)
- ❌ Self-assess (policy/permission questions)
- ❌ Challenge or dispute assessments (appeals process)
- ❌ See peer comparisons (privacy/competitive dynamics)

### For Faculty

**Primary Function: Log EPA Assessments**
- Simple form workflow:
  1. Select resident from their assigned program
  2. Select EPA from program's EPA library
  3. Rate entrustment level (1-5 scale)
  4. Add narrative comment
  5. Optional: specify rotation/clinical context
  6. Submit

**Assessment History:**
- View all assessments they've logged
- Filter by resident, EPA, date
- Edit recent assessments (within 24-48 hours?)

**What Faculty CANNOT Do (MVP):**
- ❌ Bulk import assessments (manual entry only)
- ❌ Delegate assessment to fellows/residents
- ❌ See other faculty's assessments (privacy)
- ❌ Generate reports (PD function)

### For Program Directors

**Oversight Dashboard:**
- View all residents' EPA progress at a glance
  - Sortable table: Resident | PGY Level | EPAs Completed | At Risk?
- Identify residents falling behind requirements
  - "Jane Resident needs 5 more EPA 3 assessments by end of PGY-2"
- Filter by training level, EPA type, time period

**Individual Resident View:**
- Complete EPA assessment history
- Progress toward all requirements
- Faculty assessment patterns (who's assessing frequently)

**Basic Reporting:**
- Export assessment data (CSV format minimum)
- Generate simple reports for CCC preparation
  - List all assessments for a resident
  - Summary statistics (total assessments by EPA)

**What PDs CANNOT Do (MVP):**
- ❌ Auto-generate CCC review packets (future feature)
- ❌ Compare across cohorts (analytics complexity)
- ❌ Manage rotation schedules (separate system initially)
- ❌ Milestone integration (EPA-first approach)

### For Program Coordinators/Admins

**User Management:**
- Add/remove residents, faculty, program directors
- Assign faculty to programs (permission to assess)
- Manage resident enrollments (program, PGY level, dates)

**EPA Library Management:**
- Define EPAs for programs (number, title, description)
- Set requirements by training level
  - "PGY-1 residents need 10 EPA 1 assessments at Level 3+"
  - "All residents need 25 EPA 1 assessments at Level 4+ by graduation"

**Basic Configuration:**
- Create/edit programs
- Create/edit rotations (for context tagging)
- Deactivate users/programs (soft delete)

---

## Database Schema

### Technology Assumptions
- PostgreSQL 14+ (for advanced constraints and GIST indexes)
- UUID primary keys (distributed system ready)
- TIMESTAMPTZ for all dates (timezone aware)
- Required extension: `btree_gist` (for overlapping date range prevention)

### Complete SQL Schema

```sql
-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CUSTOM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM (
    'resident',
    'faculty', 
    'program_director',
    'program_coordinator',
    'admin'
);

CREATE TYPE training_level AS ENUM (
    'PGY-1',
    'PGY-2', 
    'PGY-3',
    'PGY-4',
    'PGY-5',
    'PGY-6',
    'PGY-7',
    'PGY-8'
);

CREATE TYPE entrustment_level AS ENUM (
    '1', -- Observation only - not trusted to perform
    '2', -- Direct supervision - perform with proactive guidance
    '3', -- Indirect supervision - perform with reactive guidance available
    '4', -- Supervision available - perform independently, supervisor available
    '5'  -- Independent/supervisory - can supervise others
);

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

COMMENT ON TABLE users IS 'All system users including residents, faculty, program directors, and coordinators';
COMMENT ON COLUMN users.role IS 'Primary role - users may have multiple roles via other tables';
COMMENT ON COLUMN users.is_active IS 'Soft delete flag - deactivated users retain historical data';

-- ============================================================================
-- PROGRAM STRUCTURE
-- ============================================================================

CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    acgme_program_number VARCHAR(50), -- stub for future ACGME integration
    institution_id UUID, -- stub for future multi-institution support
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_programs_specialty ON programs(specialty);
CREATE INDEX idx_programs_active ON programs(is_active) WHERE is_active = true;

COMMENT ON TABLE programs IS 'Residency/fellowship training programs';
COMMENT ON COLUMN programs.acgme_program_number IS 'ACGME accreditation number - not enforced in MVP';
COMMENT ON COLUMN programs.institution_id IS 'Reserved for future sponsoring institution hierarchy';

-- ============================================================================
-- RESIDENT ENROLLMENT
-- ============================================================================

CREATE TABLE resident_program_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    current_training_level training_level NOT NULL,
    start_date DATE NOT NULL,
    expected_graduation_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- A resident should only have one active enrollment per program
    CONSTRAINT unique_active_enrollment UNIQUE(resident_id, program_id, is_active) 
        WHERE is_active = true,
    
    -- Graduation must be after start
    CONSTRAINT valid_date_range CHECK (expected_graduation_date > start_date)
);

CREATE INDEX idx_enrollments_resident ON resident_program_enrollments(resident_id);
CREATE INDEX idx_enrollments_program ON resident_program_enrollments(program_id);
CREATE INDEX idx_enrollments_active ON resident_program_enrollments(is_active, program_id);
CREATE INDEX idx_enrollments_level ON resident_program_enrollments(current_training_level);

COMMENT ON TABLE resident_program_enrollments IS 'Tracks which residents are enrolled in which programs and their training level';
COMMENT ON COLUMN resident_program_enrollments.current_training_level IS 'Must be manually updated each academic year';
COMMENT ON COLUMN resident_program_enrollments.is_active IS 'Set to false when resident graduates or transfers';

-- ============================================================================
-- FACULTY ASSIGNMENTS
-- ============================================================================

CREATE TABLE faculty_program_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    can_assess BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    assigned_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate active assignments
    CONSTRAINT unique_active_assignment UNIQUE(faculty_id, program_id, is_active) 
        WHERE is_active = true
);

CREATE INDEX idx_faculty_assignments_faculty ON faculty_program_assignments(faculty_id);
CREATE INDEX idx_faculty_assignments_program ON faculty_program_assignments(program_id);
CREATE INDEX idx_faculty_assignments_can_assess ON faculty_program_assignments(can_assess) WHERE can_assess = true;

COMMENT ON TABLE faculty_program_assignments IS 'Grants faculty permission to assess residents in specific programs';
COMMENT ON COLUMN faculty_program_assignments.can_assess IS 'Future: may support view-only faculty roles';

-- ============================================================================
-- EPA DEFINITIONS
-- ============================================================================

CREATE TABLE epa_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    epa_number VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    competency_domain VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Each program should have unique EPA numbers
    CONSTRAINT unique_epa_number UNIQUE(program_id, epa_number)
);

CREATE INDEX idx_epa_definitions_program ON epa_definitions(program_id);
CREATE INDEX idx_epa_definitions_active ON epa_definitions(is_active, program_id);

COMMENT ON TABLE epa_definitions IS 'Library of EPAs specific to each program/specialty';
COMMENT ON COLUMN epa_definitions.epa_number IS 'Program-specific identifier like "EPA 1", "EPA 2a"';
COMMENT ON COLUMN epa_definitions.competency_domain IS 'ACGME competency: Patient Care, Medical Knowledge, etc.';

-- ============================================================================
-- ROTATIONS (for assessment context)
-- ============================================================================

CREATE TABLE rotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    site_id UUID, -- stub for future participating sites
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rotations_program ON rotations(program_id);
CREATE INDEX idx_rotations_active ON rotations(is_active) WHERE is_active = true;

COMMENT ON TABLE rotations IS 'Clinical rotations for contextualizing assessments';
COMMENT ON COLUMN rotations.site_id IS 'Reserved for future multi-site tracking';

-- ============================================================================
-- ROTATION ASSIGNMENTS
-- ============================================================================

CREATE TABLE resident_rotation_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rotation_id UUID NOT NULL REFERENCES rotations(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Validate date range
    CONSTRAINT valid_rotation_dates CHECK (end_date > start_date),
    
    -- Prevent overlapping rotation assignments for same resident
    EXCLUDE USING gist (
        resident_id WITH =,
        daterange(start_date, end_date, '[]') WITH &&
    )
);

CREATE INDEX idx_rotation_assignments_resident ON resident_rotation_assignments(resident_id);
CREATE INDEX idx_rotation_assignments_rotation ON resident_rotation_assignments(rotation_id);
CREATE INDEX idx_rotation_assignments_dates ON resident_rotation_assignments(start_date, end_date);

COMMENT ON TABLE resident_rotation_assignments IS 'Tracks which residents are on which rotations and when';
COMMENT ON CONSTRAINT valid_rotation_dates ON resident_rotation_assignments IS 'End date must be after start date';

-- ============================================================================
-- EPA ASSESSMENTS (THE CORE VALUE)
-- ============================================================================

CREATE TABLE epa_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    epa_id UUID NOT NULL REFERENCES epa_definitions(id) ON DELETE CASCADE,
    entrustment_level entrustment_level NOT NULL,
    assessment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    rotation_id UUID REFERENCES rotations(id) ON DELETE SET NULL,
    clinical_context TEXT,
    narrative_comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assessments_resident ON epa_assessments(resident_id);
CREATE INDEX idx_assessments_faculty ON epa_assessments(faculty_id);
CREATE INDEX idx_assessments_epa ON epa_assessments(epa_id);
CREATE INDEX idx_assessments_date ON epa_assessments(assessment_date DESC);
CREATE INDEX idx_assessments_entrustment ON epa_assessments(entrustment_level);

-- Composite index for most common query: resident's EPA progress
CREATE INDEX idx_assessments_resident_epa ON epa_assessments(resident_id, epa_id, assessment_date DESC);

COMMENT ON TABLE epa_assessments IS 'Individual EPA assessment observations - the atomic unit of value';
COMMENT ON COLUMN epa_assessments.clinical_context IS 'Free-form description of clinical scenario (MVP)';
COMMENT ON COLUMN epa_assessments.narrative_comment IS 'Faculty feedback and coaching points';
COMMENT ON COLUMN epa_assessments.rotation_id IS 'Optional: which rotation was resident on';

-- ============================================================================
-- EPA REQUIREMENTS (for progress tracking)
-- ============================================================================

CREATE TABLE epa_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    epa_id UUID NOT NULL REFERENCES epa_definitions(id) ON DELETE CASCADE,
    training_level training_level, -- NULL means "by graduation"
    minimum_count INTEGER NOT NULL DEFAULT 1,
    minimum_entrustment_level entrustment_level NOT NULL DEFAULT '4',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Each EPA can only have one requirement per training level per program
    CONSTRAINT unique_requirement UNIQUE(program_id, epa_id, training_level),
    CONSTRAINT positive_minimum CHECK (minimum_count > 0)
);

CREATE INDEX idx_requirements_program ON epa_requirements(program_id);
CREATE INDEX idx_requirements_epa ON epa_requirements(epa_id);
CREATE INDEX idx_requirements_level ON epa_requirements(training_level);

COMMENT ON TABLE epa_requirements IS 'Defines how many assessments residents need at what level';
COMMENT ON COLUMN epa_requirements.training_level IS 'NULL = by graduation, otherwise specific PGY level';
COMMENT ON COLUMN epa_requirements.minimum_entrustment_level IS 'Assessments below this level do not count';

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at 
    BEFORE UPDATE ON programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at 
    BEFORE UPDATE ON resident_program_enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faculty_assignments_updated_at 
    BEFORE UPDATE ON faculty_program_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_epa_definitions_updated_at 
    BEFORE UPDATE ON epa_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rotations_updated_at 
    BEFORE UPDATE ON rotations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rotation_assignments_updated_at 
    BEFORE UPDATE ON resident_rotation_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at 
    BEFORE UPDATE ON epa_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requirements_updated_at 
    BEFORE UPDATE ON epa_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Sample Data

### Seed Data for Testing

```sql
-- ============================================================================
-- SAMPLE PROGRAM
-- ============================================================================

INSERT INTO programs (id, name, specialty, acgme_program_number) VALUES
('11111111-1111-1111-1111-111111111111', 'General Surgery Residency', 'General Surgery', '1234567890');

-- ============================================================================
-- SAMPLE USERS
-- ============================================================================

-- Residents
INSERT INTO users (id, email, first_name, last_name, role) VALUES
('22222222-2222-2222-2222-222222222222', 'jane.resident@hospital.edu', 'Jane', 'Resident', 'resident'),
('23232323-2323-2323-2323-232323232323', 'john.intern@hospital.edu', 'John', 'Intern', 'resident'),
('24242424-2424-2424-2424-242424242424', 'sarah.chief@hospital.edu', 'Sarah', 'Chief', 'resident');

-- Faculty
INSERT INTO users (id, email, first_name, last_name, role) VALUES
('33333333-3333-3333-3333-333333333333', 'dr.attending@hospital.edu', 'Robert', 'Attending', 'faculty'),
('34343434-3434-3434-3434-343434343434', 'dr.smith@hospital.edu', 'Emily', 'Smith', 'faculty'),
('35353535-3535-3535-3535-353535353535', 'dr.jones@hospital.edu', 'Michael', 'Jones', 'faculty');

-- Program Director
INSERT INTO users (id, email, first_name, last_name, role) VALUES
('44444444-4444-4444-4444-444444444444', 'dr.director@hospital.edu', 'Sarah', 'Director', 'program_director');

-- Program Coordinator
INSERT INTO users (id, email, first_name, last_name, role) VALUES
('45454545-4545-4545-4545-454545454545', 'coordinator@hospital.edu', 'Lisa', 'Coordinator', 'program_coordinator');

-- ============================================================================
-- ENROLL RESIDENTS
-- ============================================================================

INSERT INTO resident_program_enrollments (resident_id, program_id, current_training_level, start_date, expected_graduation_date) VALUES
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'PGY-2', '2024-07-01', '2029-06-30'),
('23232323-2323-2323-2323-232323232323', '11111111-1111-1111-1111-111111111111', 'PGY-1', '2024-07-01', '2029-06-30'),
('24242424-2424-2424-2424-242424242424', '11111111-1111-1111-1111-111111111111', 'PGY-5', '2020-07-01', '2025-06-30');

-- ============================================================================
-- ASSIGN FACULTY TO PROGRAM
-- ============================================================================

INSERT INTO faculty_program_assignments (faculty_id, program_id) VALUES
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111'),
('34343434-3434-3434-3434-343434343434', '11111111-1111-1111-1111-111111111111'),
('35353535-3535-3535-3535-353535353535', '11111111-1111-1111-1111-111111111111');

-- ============================================================================
-- CREATE EPA LIBRARY (General Surgery EPAs)
-- ============================================================================

INSERT INTO epa_definitions (id, program_id, epa_number, title, description, competency_domain) VALUES
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 
 'EPA 1', 'Preoperative Assessment and Consent', 
 'Perform comprehensive preoperative assessment and obtain informed consent', 
 'Patient Care'),
 
('56565656-5656-5656-5656-565656565656', '11111111-1111-1111-1111-111111111111', 
 'EPA 2', 'Technical Skills: Basic Suturing and Wound Closure', 
 'Perform basic suturing techniques and wound closure', 
 'Patient Care'),
 
('57575757-5757-5757-5757-575757575757', '11111111-1111-1111-1111-111111111111', 
 'EPA 3', 'Postoperative Management', 
 'Manage routine postoperative care including pain control and complication recognition', 
 'Patient Care'),
 
('58585858-5858-5858-5858-585858585858', '11111111-1111-1111-1111-111111111111', 
 'EPA 4', 'Emergency Assessment and Resuscitation', 
 'Perform initial assessment and resuscitation of emergency surgical patients', 
 'Patient Care'),
 
('59595959-5959-5959-5959-595959595959', '11111111-1111-1111-1111-111111111111', 
 'EPA 5', 'Participate in Handoffs', 
 'Effectively communicate patient care during transitions', 
 'Interpersonal and Communication Skills');

-- ============================================================================
-- SET EPA REQUIREMENTS
-- ============================================================================

-- EPA 1 Requirements
INSERT INTO epa_requirements (program_id, epa_id, training_level, minimum_count, minimum_entrustment_level) VALUES
('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'PGY-1', 10, '3'), -- 10 at level 3+ by end PGY-1
('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', NULL, 25, '4'); -- 25 at level 4+ by graduation

-- EPA 2 Requirements
INSERT INTO epa_requirements (program_id, epa_id, training_level, minimum_count, minimum_entrustment_level) VALUES
('11111111-1111-1111-1111-111111111111', '56565656-5656-5656-5656-565656565656', 'PGY-1', 15, '3'),
('11111111-1111-1111-1111-111111111111', '56565656-5656-5656-5656-565656565656', 'PGY-2', 20, '4'),
('11111111-1111-1111-1111-111111111111', '56565656-5656-5656-5656-565656565656', NULL, 50, '4');

-- EPA 3 Requirements
INSERT INTO epa_requirements (program_id, epa_id, training_level, minimum_count, minimum_entrustment_level) VALUES
('11111111-1111-1111-1111-111111111111', '57575757-5757-5757-5757-575757575757', 'PGY-2', 20, '3'),
('11111111-1111-1111-1111-111111111111', '57575757-5757-5757-5757-575757575757', NULL, 40, '4');

-- EPA 4 Requirements
INSERT INTO epa_requirements (program_id, epa_id, training_level, minimum_count, minimum_entrustment_level) VALUES
('11111111-1111-1111-1111-111111111111', '58585858-5858-5858-5858-585858585858', 'PGY-1', 5, '2'),
('11111111-1111-1111-1111-111111111111', '58585858-5858-5858-5858-585858585858', 'PGY-2', 10, '3'),
('11111111-1111-1111-1111-111111111111', '58585858-5858-5858-5858-585858585858', NULL, 30, '4');

-- EPA 5 Requirements
INSERT INTO epa_requirements (program_id, epa_id, training_level, minimum_count, minimum_entrustment_level) VALUES
('11111111-1111-1111-1111-111111111111', '59595959-5959-5959-5959-595959595959', 'PGY-1', 20, '3'),
('11111111-1111-1111-1111-111111111111', '59595959-5959-5959-5959-595959595959', NULL, 100, '4');

-- ============================================================================
-- CREATE SAMPLE ROTATIONS
-- ============================================================================

INSERT INTO rotations (id, program_id, name) VALUES
('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'General Surgery'),
('67676767-6767-6767-6767-676767676767', '11111111-1111-1111-1111-111111111111', 'Surgical ICU'),
('68686868-6868-6868-6868-686868686868', '11111111-1111-1111-1111-111111111111', 'Trauma Surgery'),
('69696969-6969-6969-6969-696969696969', '11111111-1111-1111-1111-111111111111', 'Vascular Surgery'),
('70707070-7070-7070-7070-707070707070', '11111111-1111-1111-1111-111111111111', 'Pediatric Surgery');

-- ============================================================================
-- ASSIGN RESIDENTS TO CURRENT ROTATIONS
-- ============================================================================

INSERT INTO resident_rotation_assignments (resident_id, rotation_id, start_date, end_date) VALUES
('22222222-2222-2222-2222-222222222222', '67676767-6767-6767-6767-676767676767', '2025-01-01', '2025-01-31'), -- Jane on SICU
('23232323-2323-2323-2323-232323232323', '66666666-6666-6666-6666-666666666666', '2025-01-01', '2025-02-28'), -- John on General
('24242424-2424-2424-2424-242424242424', '68686868-6868-6868-6868-686868686868', '2025-01-01', '2025-01-31'); -- Sarah on Trauma

-- ============================================================================
-- LOG SAMPLE EPA ASSESSMENTS
-- ============================================================================

-- Jane Resident (PGY-2) - various assessments
INSERT INTO epa_assessments (resident_id, faculty_id, epa_id, entrustment_level, assessment_date, rotation_id, narrative_comment) VALUES
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 
 '55555555-5555-5555-5555-555555555555', '3', '2025-01-15 14:30:00',
 '67676767-6767-6767-6767-676767676767',
 'Good consent discussion for elective cholecystectomy. Clearly explained procedure, risks, benefits. Needs to improve explanation of alternative treatments.'),

('22222222-2222-2222-2222-222222222222', '34343434-3434-3434-3434-343434343434', 
 '55555555-5555-5555-5555-555555555555', '4', '2025-01-22 09:15:00',
 '67676767-6767-6767-6767-676767676767',
 'Excellent. Handled complex trauma consent independently with family present. Addressed questions appropriately.'),

('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 
 '56565656-5656-5656-5656-565656565656', '4', '2025-01-20 16:45:00',
 '67676767-6767-6767-6767-676767676767',
 'Solid technique on abdominal closure. Knot security good. Ready for more complex cases.'),

('22222222-2222-2222-2222-222222222222', '35353535-3535-3535-3535-353535353535', 
 '57575757-5757-5757-5757-575757575757', '3', '2025-01-18 08:00:00',
 '67676767-6767-6767-6767-676767676767',
 'Managing POD#2 patient after colectomy. Appropriate orders, but needed prompting on early mobilization importance.'),

('22222222-2222-2222-2222-222222222222', '34343434-3434-3434-3434-343434343434', 
 '58585858-5858-5858-5858-585858585858', '4', '2025-01-19 03:30:00',
 '67676767-6767-6767-6767-676767676767',
 'Impressive management of acute abdomen overnight. Systematic assessment, appropriate imaging, excellent communication with attending.'),

('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 
 '59595959-5959-5959-5959-595959595959', '4', '2025-01-16 06:00:00',
 '67676767-6767-6767-6767-676767676767',
 'Clear, concise morning handoff. Highlighted critical issues, pending tasks, and anticipatory guidance for day team.');

-- John Intern (PGY-1) - early learner assessments
INSERT INTO epa_assessments (resident_id, faculty_id, epa_id, entrustment_level, assessment_date, rotation_id, narrative_comment) VALUES
('23232323-2323-2323-2323-232323232323', '33333333-3333-3333-3333-333333333333', 
 '55555555-5555-5555-5555-555555555555', '2', '2025-01-10 10:00:00',
 '66666666-6666-6666-6666-666666666666',
 'First consent observed. Understands basic elements but needs more confidence. Review informed consent documentation requirements.'),

('23232323-2323-2323-2323-232323232323', '34343434-3434-3434-3434-343434343434', 
 '56565656-5656-5656-5656-565656565656', '2', '2025-01-12 14:00:00',
 '66666666-6666-6666-6666-666666666666',
 'Learning basic suturing. Instrument handling improving but knot technique needs work. Recommend suture lab practice.'),

('23232323-2323-2323-2323-232323232323', '35353535-3535-3535-3535-353535353535', 
 '59595959-5959-5959-5959-595959595959', '3', '2025-01-14 06:30:00',
 '66666666-6666-6666-6666-666666666666',
 'Good handoff structure. Included all necessary information. Work on being more concise - handoff took 20 minutes.'),

('23232323-2323-2323-2323-232323232323', '33333333-3333-3333-3333-333333333333', 
 '58585858-5858-5858-5858-585858585858', '2', '2025-01-17 02:00:00',
 '66666666-6666-6666-6666-666666666666',
 'Evaluated acute RLQ pain overnight. Appropriate differential but needed guidance on imaging selection. Discussed with me before ordering.'),

('23232323-2323-2323-2323-232323232323', '34343434-3434-3434-3434-343434343434', 
 '55555555-5555-5555-5555-555555555555', '3', '2025-01-21 11:00:00',
 '66666666-6666-6666-6666-666666666666',
 'Much improved from first consent. Explained hernia repair well to patient. Still working on discussing realistic recovery expectations.');

-- Sarah Chief (PGY-5) - advanced assessments
INSERT INTO epa_assessments (resident_id, faculty_id, epa_id, entrustment_level, assessment_date, rotation_id, narrative_comment) VALUES
('24242424-2424-2424-2424-242424242424', '35353535-3535-3535-3535-353535353535', 
 '55555555-5555-5555-5555-555555555555', '5', '2025-01-11 09:00:00',
 '68686868-6868-6868-6868-686868686868',
 'Exemplary. Consented complex trauma patient with multiple injuries and family present. Handled difficult questions with professionalism. Ready to supervise junior residents.'),

('24242424-2424-2424-2424-242424242424', '35353535-3535-3535-3535-353535353535', 
 '58585858-5858-5858-5858-585858585858', '5', '2025-01-13 01:00:00',
 '68686868-6868-6868-6868-686868686868',
 'Led trauma activation independently. Excellent teamwork, clear communication, appropriate decision-making. Supervised PGY-2 through procedure.'),

('24242424-2424-2424-2424-242424242424', '33333333-3333-3333-3333-333333333333', 
 '57575757-5757-5757-5757-575757575757', '5', '2025-01-16 07:00:00',
 '68686868-6868-6868-6868-686868686868',
 'Managing complex trauma ICU patients independently. Recognized early sepsis, initiated appropriate interventions. Teaching junior residents effectively.'),

('24242424-2424-2424-2424-242424242424', '34343434-3434-3434-3434-343434343434', 
 '59595959-5959-5959-5959-595959595959', '5', '2025-01-18 06:00:00',
 '68686868-6868-6868-6868-686868686868',
 'Outstanding handoff to day team covering 12 trauma patients. Prioritized effectively, identified potential issues, provided clear plan.');
```

---

## Essential Queries

### Query 1: Resident EPA Progress Dashboard

**Purpose:** Show resident their progress toward all EPA requirements

```sql
SELECT 
    ed.epa_number,
    ed.title,
    er.training_level,
    er.minimum_count,
    er.minimum_entrustment_level,
    COUNT(ea.id) FILTER (
        WHERE ea.entrustment_level >= er.minimum_entrustment_level
    ) as qualified_assessments,
    COUNT(ea.id) as total_assessments,
    CASE 
        WHEN COUNT(ea.id) FILTER (
            WHERE ea.entrustment_level >= er.minimum_entrustment_level
        ) >= er.minimum_count THEN true
        ELSE false
    END as requirement_met
FROM epa_definitions ed
JOIN epa_requirements er ON ed.id = er.epa_id
LEFT JOIN epa_assessments ea ON ed.id = ea.epa_id 
    AND ea.resident_id = '22222222-2222-2222-2222-222222222222'
WHERE ed.program_id = '11111111-1111-1111-1111-111111111111'
    AND ed.is_active = true
    AND (
        er.training_level = 'PGY-2'  -- Current level
        OR er.training_level IS NULL -- Graduation requirements
    )
GROUP BY 
    ed.id, 
    ed.epa_number, 
    ed.title, 
    er.training_level,
    er.minimum_count, 
    er.minimum_entrustment_level
ORDER BY ed.epa_number, er.training_level NULLS LAST;
```

**Expected Output:**
```
epa_number | title                          | training_level | min_count | min_level | qualified | total | met
-----------+--------------------------------+---------------+-----------+-----------+-----------+-------+-----
EPA 1      | Preoperative Assessment        | NULL          | 25        | 4         | 1         | 2     | f
EPA 2      | Basic Suturing                 | PGY-2         | 20        | 4         | 1         | 1     | f
EPA 2      | Basic Suturing                 | NULL          | 50        | 4         | 1         | 1     | f
...
```

### Query 2: All Assessments for a Resident

**Purpose:** Assessment history view, sortable and filterable

```sql
SELECT 
    ea.assessment_date,
    ed.epa_number,
    ed.title,
    ea.entrustment_level,
    u.first_name || ' ' || u.last_name as faculty_name,
    r.name as rotation_name,
    ea.narrative_comment,
    ea.clinical_context
FROM epa_assessments ea
JOIN epa_definitions ed ON ea.epa_id = ed.id
JOIN users u ON ea.faculty_id = u.id
LEFT JOIN rotations r ON ea.rotation_id = r.id
WHERE ea.resident_id = '22222222-2222-2222-2222-222222222222'
ORDER BY ea.assessment_date DESC;
```

### Query 3: Faculty Assessment History

**Purpose:** Show faculty which residents they've assessed

```sql
SELECT 
    ea.assessment_date,
    ru.first_name || ' ' || ru.last_name as resident_name,
    rpe.current_training_level,
    ed.epa_number,
    ed.title,
    ea.entrustment_level,
    r.name as rotation_name
FROM epa_assessments ea
JOIN users ru ON ea.resident_id = ru.id
JOIN epa_definitions ed ON ea.epa_id = ed.id
JOIN resident_program_enrollments rpe ON ea.resident_id = rpe.resident_id
LEFT JOIN rotations r ON ea.rotation_id = r.id
WHERE ea.faculty_id = '33333333-3333-3333-3333-333333333333'
    AND rpe.is_active = true
ORDER BY ea.assessment_date DESC
LIMIT 50;
```

### Query 4: Program Director - Residents At Risk

**Purpose:** Identify residents not meeting EPA requirements

```sql
WITH resident_progress AS (
    SELECT 
        rpe.resident_id,
        rpe.current_training_level,
        er.epa_id,
        ed.epa_number,
        ed.title,
        er.minimum_count,
        er.minimum_entrustment_level,
        er.training_level as required_by_level,
        COUNT(ea.id) FILTER (
            WHERE ea.entrustment_level >= er.minimum_entrustment_level
        ) as qualified_count
    FROM resident_program_enrollments rpe
    JOIN epa_requirements er ON rpe.program_id = er.program_id
    JOIN epa_definitions ed ON er.epa_id = ed.id
    LEFT JOIN epa_assessments ea ON ea.resident_id = rpe.resident_id 
        AND ea.epa_id = er.epa_id
    WHERE rpe.is_active = true
        AND rpe.program_id = '11111111-1111-1111-1111-111111111111'
        AND ed.is_active = true
        AND (
            er.training_level = rpe.current_training_level 
            OR er.training_level IS NULL
        )
    GROUP BY 
        rpe.resident_id,
        rpe.current_training_level,
        er.epa_id,
        ed.epa_number,
        ed.title,
        er.minimum_count,
        er.minimum_entrustment_level,
        er.training_level
),
residents_behind AS (
    SELECT 
        resident_id,
        COUNT(*) as epas_behind,
        SUM(minimum_count - qualified_count) as total_assessments_needed
    FROM resident_progress
    WHERE qualified_count < minimum_count
    GROUP BY resident_id
)
SELECT 
    u.first_name || ' ' || u.last_name as resident_name,
    rpe.current_training_level,
    rb.epas_behind,
    rb.total_assessments_needed
FROM residents_behind rb
JOIN users u ON rb.resident_id = u.id
JOIN resident_program_enrollments rpe ON rb.resident_id = rpe.resident_id
WHERE rpe.is_active = true
ORDER BY rb.epas_behind DESC, rb.total_assessments_needed DESC;
```

### Query 5: Program Overview - Assessment Volume

**Purpose:** Show assessment activity across program

```sql
SELECT 
    DATE_TRUNC('month', ea.assessment_date) as month,
    COUNT(*) as total_assessments,
    COUNT(DISTINCT ea.resident_id) as residents_assessed,
    COUNT(DISTINCT ea.faculty_id) as faculty_assessing,
    COUNT(*) FILTER (WHERE ea.entrustment_level >= '4') as high_level_assessments
FROM epa_assessments ea
JOIN resident_program_enrollments rpe ON ea.resident_id = rpe.resident_id
WHERE rpe.program_id = '11111111-1111-1111-1111-111111111111'
    AND rpe.is_active = true
    AND ea.assessment_date >= NOW() - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', ea.assessment_date)
ORDER BY month DESC;
```

### Query 6: Detailed Resident Progress Report (for CCC)

**Purpose:** Generate comprehensive assessment report for CCC review

```sql
SELECT 
    ed.epa_number,
    ed.title,
    er.training_level as requirement_level,
    er.minimum_count,
    er.minimum_entrustment_level,
    COUNT(ea.id) as total_assessments,
    COUNT(ea.id) FILTER (WHERE ea.entrustment_level = '1') as level_1_count,
    COUNT(ea.id) FILTER (WHERE ea.entrustment_level = '2') as level_2_count,
    COUNT(ea.id) FILTER (WHERE ea.entrustment_level = '3') as level_3_count,
    COUNT(ea.id) FILTER (WHERE ea.entrustment_level = '4') as level_4_count,
    COUNT(ea.id) FILTER (WHERE ea.entrustment_level = '5') as level_5_count,
    COUNT(ea.id) FILTER (
        WHERE ea.entrustment_level >= er.minimum_entrustment_level
    ) as qualified_count,
    MAX(ea.assessment_date) as most_recent_assessment,
    COUNT(DISTINCT ea.faculty_id) as unique_faculty_assessors
FROM epa_definitions ed
JOIN epa_requirements er ON ed.id = er.epa_id
LEFT JOIN epa_assessments ea ON ed.id = ea.epa_id 
    AND ea.resident_id = '22222222-2222-2222-2222-222222222222'
WHERE ed.program_id = '11111111-1111-1111-1111-111111111111'
    AND ed.is_active = true
GROUP BY 
    ed.id,
    ed.epa_number,
    ed.title,
    er.training_level,
    er.minimum_count,
    er.minimum_entrustment_level
ORDER BY ed.epa_number, er.training_level NULLS LAST;
```

---

## API Endpoints

### Authentication & User Management

```
POST   /auth/login
POST   /auth/logout
GET    /auth/me
POST   /auth/reset-password

GET    /users
GET    /users/:id
POST   /users
PATCH  /users/:id
DELETE /users/:id (soft delete - set is_active = false)
```

### Programs

```
GET    /programs
GET    /programs/:id
POST   /programs
PATCH  /programs/:id
DELETE /programs/:id (soft delete)

GET    /programs/:id/residents
GET    /programs/:id/faculty
GET    /programs/:id/epas
```

### Residents

```
GET    /residents/:id/progress
       Query params: ?training_level=PGY-2
       
GET    /residents/:id/assessments
       Query params: ?epa_id=xxx&faculty_id=xxx&start_date=xxx&end_date=xxx
       
GET    /residents/:id/enrollment
PATCH  /residents/:id/enrollment (update training level)

GET    /residents/:id/rotations
POST   /residents/:id/rotations (assign to rotation)
```

### Faculty

```
GET    /faculty/:id/residents (residents they can assess)
GET    /faculty/:id/assessments (assessments they've logged)
POST   /faculty/:id/assign-program (grant assessment permission)
DELETE /faculty/:id/assign-program/:program_id
```

### EPAs

```
GET    /epas
       Query params: ?program_id=xxx
       
GET    /epas/:id
POST   /epas (create EPA definition)
PATCH  /epas/:id
DELETE /epas/:id (soft delete)

GET    /epas/:id/requirements
POST   /epas/:id/requirements
PATCH  /epa-requirements/:id
DELETE /epa-requirements/:id
```

### Assessments (THE CORE)

```
POST   /assessments
       Body: {
         resident_id: uuid,
         faculty_id: uuid,
         epa_id: uuid,
         entrustment_level: 1-5,
         rotation_id?: uuid,
         clinical_context?: string,
         narrative_comment?: string
       }

GET    /assessments/:id
PATCH  /assessments/:id (edit within 48 hours only)
DELETE /assessments/:id (only if created_at < 1 hour ago)

GET    /assessments
       Query params: 
         ?resident_id=xxx
         &faculty_id=xxx
         &program_id=xxx
         &epa_id=xxx
         &start_date=xxx
         &end_date=xxx
         &min_entrustment_level=xxx
```

### Program Director Dashboard

```
GET    /programs/:id/dashboard
       Returns:
       {
         residents_at_risk: [...],
         recent_assessments: [...],
         assessment_volume: {...},
         faculty_participation: [...]
       }

GET    /programs/:id/residents/:resident_id/ccc-report
       Generate CCC preparation packet
```

### Rotations

```
GET    /rotations
       Query params: ?program_id=xxx
       
POST   /rotations
PATCH  /rotations/:id
DELETE /rotations/:id (soft delete)

POST   /rotation-assignments
PATCH  /rotation-assignments/:id
DELETE /rotation-assignments/:id
```

---

## Future Enhancements

### Phase 2: Enhanced Context & Workflow (3-4 months post-MVP)

**Multi-Site Tracking:**
- Add `clinical_sites` table (participating sites)
- Link rotations to specific sites
- Track where assessments occurred
- Report by site for ACGME

**Assessment Request Workflow:**
- Residents can request specific EPA assessments
- Faculty receive notifications
- Track response time
- Remind faculty of pending assessments

**Rotation Scheduling:**
- Block scheduling (4-week, 2-week rotations)
- Conflict detection (duty hours, required rotations)
- Automatic assignment suggestions
- Integration with assessment capture

**Data needed:**
```sql
clinical_sites (id, name, institution_id, is_active)
assessment_requests (id, resident_id, epa_id, requested_date, status)
rotation_schedules (id, program_id, academic_year, start_date, end_date)
rotation_blocks (id, schedule_id, block_number, start_date, end_date)
```

### Phase 3: Milestone Integration (3-4 months)

**ACGME Milestone Mapping:**
- Map EPAs to ACGME milestones
- Semi-annual milestone ratings
- Milestone progression visualization
- Subcompetency tracking

**CCC Review Workflows:**
- Schedule CCC meetings
- Generate review packets automatically
- Track decisions and action items
- Remediation plan documentation

**Data needed:**
```sql
milestones (id, program_id, milestone_number, competency, subcompetency)
epa_milestone_mappings (epa_id, milestone_id, relationship_type)
milestone_assessments (id, resident_id, milestone_id, rating, assessment_date)
ccc_meetings (id, program_id, meeting_date, academic_year)
ccc_reviews (id, meeting_id, resident_id, decision, notes)
```

### Phase 4: Analytics & Benchmarking (2-3 months)

**Resident Analytics:**
- Competency progression curves
- Peer comparison (anonymized)
- Learning velocity
- Predicted graduation readiness

**Faculty Analytics:**
- Assessment frequency
- Entrustment level distributions
- Feedback quality metrics
- Engagement tracking

**Program Analytics:**
- Cohort comparisons
- Year-over-year trends
- ACGME compliance dashboards
- Benchmarking against national data

**Data needed:**
```sql
analytics_snapshots (id, snapshot_date, program_id, metrics_json)
benchmarks (id, specialty, metric_name, percentile_data)
```

### Phase 5: Advanced Features (4-6 months)

**Procedure Logging:**
- Link procedures to EPAs
- Case complexity tracking
- Volume requirements by procedure type
- Supervision level documentation

**Duty Hours Integration:**
- Track resident hours
- Violation detection
- Educational vs. service time
- Moonlighting tracking

**Prerequisite Management:**
- EPA dependencies ("must complete EPA 1 before EPA 5")
- Training level progression rules
- Remediation tracking
- Promotion decisions

**360 Evaluations:**
- Multi-source feedback
- Peer assessments
- Nursing evaluations
- Patient feedback

**Data needed:**
```sql
procedures (id, procedure_name, cpt_code, complexity)
procedure_logs (id, resident_id, procedure_id, epa_id, date, role)
duty_hours (id, resident_id, date, hours_worked, type)
epa_prerequisites (epa_id, prerequisite_epa_id, required_level, required_count)
multisource_evaluations (id, resident_id, evaluator_id, evaluation_type, date)
```

### Phase 6: Multi-Institution Platform (6+ months)

**Sponsoring Institution Hierarchy:**
- Institution management
- Program portfolios
- Shared participating sites
- Cross-program faculty
- GME office tools

**Centralized GME Office:**
- Institution-wide dashboards
- Accreditation readiness
- Resource allocation
- Cross-program analytics

**Shared Resource Management:**
- Faculty teaching across programs
- Shared rotations
- Combined conferences
- Inter-program transfers

**Data needed:**
```sql
institutions (id, name, type, acgme_id)
institution_hierarchies (parent_id, child_id, relationship_type)
shared_resources (id, resource_type, owner_id, shared_with_programs)
```

---

## Implementation Notes

### Technology Stack Recommendations

**Backend:**
- Node.js with Express or NestJS
- TypeScript for type safety
- PostgreSQL 14+
- Prisma or TypeORM for database access
- JWT for authentication

**Frontend:**
- React with TypeScript
- TailwindCSS for styling
- React Query for data fetching
- Recharts for data visualization
- React Hook Form for form handling

**Infrastructure:**
- Docker for development
- AWS or GCP for hosting
- CloudFlare for CDN
- Sentry for error tracking
- LogRocket for session replay

### Development Workflow

**Week 1-2: Foundation**
1. Set up database schema
2. Seed sample data
3. Build authentication
4. Create basic user CRUD

**Week 3-4: Core EPA Assessment**
1. EPA assessment form (faculty view)
2. Assessment storage and validation
3. Assessment history views
4. Basic filtering

**Week 5-6: Resident Dashboard**
1. Progress calculation logic
2. Progress visualization
3. Requirement tracking
4. Assessment detail views

**Week 7-8: Program Director Tools**
1. Program overview dashboard
2. At-risk resident identification
3. Assessment volume analytics
4. Export functionality

**Week 9-10: Polish & Testing**
1. Mobile responsiveness
2. Performance optimization
3. User testing
4. Bug fixes

### Key Design Decisions

**Why UUID primary keys?**
- Distributed system ready (multiple servers can generate IDs)
- No sequential ID enumeration attacks
- Easier data migration between environments
- Standard in modern applications

**Why soft deletes (`is_active` flags)?**
- Historical data preservation for accreditation
- Audit trail requirements
- Ability to "undelete" accidental deletions
- Maintain referential integrity

**Why TIMESTAMPTZ over TIMESTAMP?**
- Timezone-aware (critical for multi-site programs)
- Automatic UTC storage
- Correct sorting across time zones
- Future-proof for geographic expansion

**Why ENUMs for training_level/entrustment_level?**
- Database-level constraint enforcement
- Clear valid values in schema
- Performance benefit (stored as integers)
- Type safety in ORM layer

**Trade-offs made:**
- ✅ Structured data over JSONB (type safety)
- ✅ Normalization over denormalization (data integrity)
- ✅ Explicit relationships over polymorphic (clarity)
- ❌ Not using soft deletes everywhere (performance on large tables)
- ❌ Not storing audit logs in MVP (adds complexity)

### Security Considerations

**Authentication:**
- JWT tokens with refresh token rotation
- Password requirements (length, complexity)
- Account lockout after failed attempts
- Email verification required

**Authorization:**
- Role-based access control (RBAC)
- Row-level security for multi-tenancy
- Faculty can only assess assigned programs
- Residents can only view their own data
- PDs can view all residents in their program

**Data Protection:**
- HIPAA compliance considerations
- Encrypted data at rest
- TLS for data in transit
- Regular security audits
- PHI logging restrictions

**Input Validation:**
- Strict schema validation on all inputs
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitize user content)
- CSRF tokens for state-changing operations
- Rate limiting on API endpoints

### Performance Optimization

**Database:**
- Strategic indexes on foreign keys
- Composite indexes for common queries
- Partial indexes for `is_active` flags
- Connection pooling
- Query result caching (Redis)

**API:**
- Pagination for list endpoints (default: 50 items)
- Field selection (only return requested fields)
- Rate limiting (100 req/min per user)
- Response compression (gzip)

**Frontend:**
- Code splitting by route
- Lazy loading images
- Debounced search inputs
- Optimistic UI updates
- Service worker for offline capability

### Testing Strategy

**Unit Tests:**
- Business logic functions
- Utility functions
- Form validation
- Data transformation

**Integration Tests:**
- API endpoints
- Database operations
- Authentication flows
- Authorization rules

**End-to-End Tests:**
- Critical user journeys
  - Faculty logs assessment
  - Resident views progress
  - PD identifies at-risk resident
- Cross-browser compatibility
- Mobile device testing

**Load Testing:**
- 100 concurrent users
- 1000 assessments/hour
- Report generation performance
- Database query optimization

### Deployment Strategy

**Environments:**
- Local (Docker Compose)
- Development (shared dev server)
- Staging (production mirror)
- Production (HA, auto-scaling)

**CI/CD Pipeline:**
1. Push to GitHub
2. Run linting and tests
3. Build Docker images
4. Deploy to staging
5. Run smoke tests
6. Manual approval for production
7. Blue-green deployment
8. Automated rollback on errors

**Database Migrations:**
- Version controlled (Prisma migrations)
- Tested in staging first
- Backup before production migration
- Rollback plan documented

---

## Getting Started Checklist

### Prerequisites
- [ ] PostgreSQL 14+ installed
- [ ] Node.js 18+ installed
- [ ] Git repository created
- [ ] Development environment configured

### Initial Setup
- [ ] Run database schema creation script
- [ ] Load sample data
- [ ] Verify all tables created successfully
- [ ] Test sample queries
- [ ] Set up environment variables

### First Feature to Build
**Log EPA Assessment (Faculty View)**

This single feature exercises the entire data model:
1. Faculty authentication (users table)
2. Program assignment check (faculty_program_assignments)
3. Resident selection (resident_program_enrollments)
4. EPA library (epa_definitions)
5. Assessment capture (epa_assessments)
6. Rotation context (rotations, resident_rotation_assignments)

Start here. Build this one feature well. Everything else follows.

---

## Questions to Answer During Implementation

1. **Should faculty be able to edit assessments after submission?**
   - Yes, within 24-48 hours?
   - Require audit trail of changes?

2. **Should residents see assessments immediately?**
   - Or require faculty/PD approval first?
   - Impact on feedback culture?

3. **How should PGY level progression happen?**
   - Manual update by coordinator?
   - Automatic on July 1st?
   - What about residents who don't advance?

4. **What entrustment level should be required for "graduation ready"?**
   - Always Level 4?
   - Varies by EPA?
   - Program configurable?

5. **Should we track WHO entered data?**
   - Separate from who performed assessment?
   - Faculty vs. coordinator entering?
   - Audit implications?

---

## Success Metrics

### For MVP Launch (3 months)
- ✅ 100% of faculty can log assessments without training
- ✅ 100% of residents can view their progress
- ✅ PD can identify at-risk residents in < 5 minutes
- ✅ Assessment capture takes < 2 minutes
- ✅ Zero data loss or corruption
- ✅ 99%+ uptime

### For Product-Market Fit (6 months)
- ✅ 80%+ weekly active faculty
- ✅ Average 5+ assessments per resident per month
- ✅ Faculty report time savings vs. paper forms
- ✅ Residents engage with platform weekly
- ✅ PD uses system for CCC preparation
- ✅ 90%+ user satisfaction score

### For Expansion (12 months)
- ✅ 5+ programs actively using system
- ✅ 200+ residents tracked
- ✅ 50+ faculty regularly assessing
- ✅ Feature requests indicate growth needs
- ✅ Word-of-mouth referrals from users
- ✅ Revenue positive (if applicable)

---

## Conclusion

This document provides everything needed to implement an EPA assessment MVP that delivers immediate value while being architected for future expansion into a complete residency management system.

**The key insight:** Start with one thing that solves a real problem (EPA assessment), build it extremely well, then let user needs drive the expansion into rotation scheduling, milestone integration, and institutional hierarchies.

**Next steps:**
1. Set up database schema
2. Load sample data
3. Build faculty assessment form
4. Deploy to staging
5. Get feedback from real users
6. Iterate based on actual usage

Good luck building!
