-- ============================================================================
-- RMS - Residency Management System
-- PostgreSQL Schema (MVP)
--
-- Philosophy: Feature-first development. Start with EPA assessment capture,
-- add complexity only when use cases demand it.
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================================================
-- ENUMS - PostgreSQL native types for type safety
-- ============================================================================

CREATE TYPE user_role AS ENUM (
    'resident',
    'faculty',
    'program_director',
    'coordinator',
    'admin'
);

CREATE TYPE training_level AS ENUM (
    'PGY-1', 'PGY-2', 'PGY-3', 'PGY-4', 'PGY-5',
    'PGY-6', 'PGY-7', 'PGY-8'
);

CREATE TYPE entrustment_level AS ENUM (
    '1',  -- Observation only
    '2',  -- Direct supervision
    '3',  -- Indirect supervision
    '4',  -- Supervision available
    '5'   -- Independent/supervisory
);

CREATE TYPE resident_status AS ENUM (
    'active',
    'leave',
    'remediation',
    'graduated',
    'withdrawn'
);

CREATE TYPE case_urgency AS ENUM (
    'elective',
    'urgent',
    'emergent'
);

CREATE TYPE location_type AS ENUM (
    'or',
    'clinic',
    'icu',
    'ed',
    'ward',
    'other'
);

CREATE TYPE epa_category AS ENUM (
    'preoperative',
    'intraoperative',
    'postoperative',
    'longitudinal',
    'professional'
);

CREATE TYPE case_complexity AS ENUM (
    'straightforward',  -- Easiest 1/3 of similar cases in assessor's practice
    'moderate',         -- Middle 1/3
    'complex'           -- Hardest 1/3
);

-- ============================================================================
-- PROGRAMS (simplified for MVP - single institution assumed)
-- ============================================================================

CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    acgme_program_id VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_programs_specialty ON programs(specialty);
CREATE INDEX idx_programs_active ON programs(is_active) WHERE is_active = true;

COMMENT ON TABLE programs IS 'Residency/fellowship training programs';

-- ============================================================================
-- USERS
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX idx_users_name ON users(last_name, first_name);

COMMENT ON TABLE users IS 'All system users - residents, faculty, coordinators';

-- ============================================================================
-- RESIDENTS (extends users with resident-specific data)
-- ============================================================================

CREATE TABLE residents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    pgy_level training_level NOT NULL,
    start_date DATE NOT NULL,
    expected_graduation_date DATE NOT NULL,
    status resident_status DEFAULT 'active',
    medical_school VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_dates CHECK (expected_graduation_date > start_date),
    CONSTRAINT unique_resident_program UNIQUE(user_id, program_id)
);

CREATE INDEX idx_residents_user ON residents(user_id);
CREATE INDEX idx_residents_program ON residents(program_id);
CREATE INDEX idx_residents_pgy ON residents(pgy_level);
CREATE INDEX idx_residents_active ON residents(status) WHERE status = 'active';

COMMENT ON TABLE residents IS 'Extended data for users who are residents';

-- ============================================================================
-- FACULTY (extends users with faculty-specific data)
-- ============================================================================

CREATE TABLE faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    rank VARCHAR(50),
    is_core_faculty BOOLEAN DEFAULT false,
    can_assess BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_faculty_program UNIQUE(user_id, program_id)
);

CREATE INDEX idx_faculty_user ON faculty(user_id);
CREATE INDEX idx_faculty_program ON faculty(program_id);
CREATE INDEX idx_faculty_can_assess ON faculty(can_assess) WHERE can_assess = true;

COMMENT ON TABLE faculty IS 'Extended data for users who are faculty';

-- ============================================================================
-- EPA DEFINITIONS (library of EPAs per specialty)
-- ============================================================================

CREATE TABLE epa_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    epa_number VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    description TEXT,
    category epa_category NOT NULL,
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_epa_per_program UNIQUE(program_id, epa_number)
);

CREATE INDEX idx_epa_definitions_program ON epa_definitions(program_id);
CREATE INDEX idx_epa_definitions_category ON epa_definitions(category);
CREATE INDEX idx_epa_definitions_active ON epa_definitions(is_active) WHERE is_active = true;

COMMENT ON TABLE epa_definitions IS 'Library of EPAs for each program/specialty';

-- ============================================================================
-- EPA REQUIREMENTS (graduation/level requirements)
-- ============================================================================

CREATE TABLE epa_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    epa_id UUID NOT NULL REFERENCES epa_definitions(id) ON DELETE CASCADE,
    training_level training_level,  -- NULL = by graduation
    minimum_count INTEGER NOT NULL DEFAULT 1,
    minimum_entrustment entrustment_level NOT NULL DEFAULT '4',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_requirement UNIQUE(program_id, epa_id, training_level),
    CONSTRAINT positive_count CHECK (minimum_count > 0)
);

CREATE INDEX idx_requirements_program ON epa_requirements(program_id);
CREATE INDEX idx_requirements_epa ON epa_requirements(epa_id);
CREATE INDEX idx_requirements_level ON epa_requirements(training_level);

COMMENT ON TABLE epa_requirements IS 'Defines assessment count/level requirements per training level';
COMMENT ON COLUMN epa_requirements.training_level IS 'NULL means by graduation';

-- ============================================================================
-- CLINICAL SITES (for assessment context)
-- ============================================================================

CREATE TABLE clinical_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    site_type VARCHAR(50) NOT NULL DEFAULT 'primary',  -- primary, affiliate, va, community
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sites_program ON clinical_sites(program_id);
CREATE INDEX idx_sites_active ON clinical_sites(is_active) WHERE is_active = true;

COMMENT ON TABLE clinical_sites IS 'Training locations for contextualizing assessments';

-- ============================================================================
-- ROTATIONS (for assessment context - MVP simplified)
-- ============================================================================

CREATE TABLE rotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rotations_program ON rotations(program_id);
CREATE INDEX idx_rotations_active ON rotations(is_active) WHERE is_active = true;

COMMENT ON TABLE rotations IS 'Clinical rotations for contextualizing assessments';

-- ============================================================================
-- EPA ASSESSMENTS (THE CORE VALUE)
-- ============================================================================

CREATE TABLE epa_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Core relationships
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    epa_id UUID NOT NULL REFERENCES epa_definitions(id) ON DELETE CASCADE,

    -- The assessment
    entrustment_level entrustment_level NOT NULL,
    observation_date DATE NOT NULL DEFAULT CURRENT_DATE,  -- When the clinical observation occurred
    assessment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- When the assessment was submitted (for staleness tracking)

    -- Context (all optional but valuable)
    clinical_site_id UUID REFERENCES clinical_sites(id) ON DELETE SET NULL,
    rotation_id UUID REFERENCES rotations(id) ON DELETE SET NULL,
    case_urgency case_urgency,
    case_complexity case_complexity,  -- Relative to assessor's typical cases
    patient_asa_class INTEGER CHECK (patient_asa_class IS NULL OR (patient_asa_class >= 1 AND patient_asa_class <= 6)),
    procedure_duration_min INTEGER,
    location_type location_type,
    location_details VARCHAR(100),
    clinical_context TEXT,

    -- Feedback
    narrative_feedback TEXT,

    -- Metadata
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    entry_method VARCHAR(20) DEFAULT 'web',

    -- Resident acknowledgment
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_at TIMESTAMPTZ,

    -- Soft delete
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Core query indexes
CREATE INDEX idx_assessments_resident ON epa_assessments(resident_id) WHERE NOT deleted;
CREATE INDEX idx_assessments_faculty ON epa_assessments(faculty_id) WHERE NOT deleted;
CREATE INDEX idx_assessments_epa ON epa_assessments(epa_id) WHERE NOT deleted;
CREATE INDEX idx_assessments_date ON epa_assessments(assessment_date DESC) WHERE NOT deleted;
CREATE INDEX idx_assessments_entrustment ON epa_assessments(entrustment_level) WHERE NOT deleted;

-- Composite index for resident progress queries
CREATE INDEX idx_assessments_resident_epa ON epa_assessments(resident_id, epa_id, assessment_date DESC) WHERE NOT deleted;

COMMENT ON TABLE epa_assessments IS 'EPA assessment observations - the atomic unit of value';
COMMENT ON COLUMN epa_assessments.entrustment_level IS '1=observe, 2=direct, 3=indirect, 4=available, 5=independent';

-- ============================================================================
-- TRIGGERS FOR updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_programs_updated_at BEFORE UPDATE ON programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_residents_updated_at BEFORE UPDATE ON residents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_faculty_updated_at BEFORE UPDATE ON faculty
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_epa_definitions_updated_at BEFORE UPDATE ON epa_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_epa_requirements_updated_at BEFORE UPDATE ON epa_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_clinical_sites_updated_at BEFORE UPDATE ON clinical_sites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_rotations_updated_at BEFORE UPDATE ON rotations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_epa_assessments_updated_at BEFORE UPDATE ON epa_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
