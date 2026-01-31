/**
 * RMS Database Schema
 *
 * Creates all tables needed for EPA assessment capture.
 * Run with: bun run src/db/schema.ts
 */

import { Database } from "bun:sqlite";

export function createSchema(db: Database) {
  console.log("Creating schema...\n");

  // ============================================
  // REFERENCE DATA (System-maintained, shared across all tenants)
  // ============================================

  console.log("Creating reference tables...");

  // Specialties - General Surgery, Internal Medicine, etc.
  db.run(`
    CREATE TABLE IF NOT EXISTS ref_specialties (
      code TEXT PRIMARY KEY,                    -- 'general_surgery', 'internal_medicine'
      name TEXT NOT NULL,                       -- 'General Surgery'
      category TEXT NOT NULL,                   -- 'surgical', 'medical', 'hospital_based'
      acgme_specialty_code TEXT,                -- ACGME's official code
      typical_duration_years INTEGER NOT NULL,  -- 5 for surgery, 3 for IM
      is_subspecialty INTEGER DEFAULT 0,        -- SQLite uses INTEGER for boolean
      parent_specialty_code TEXT,               -- For subspecialties (e.g., vascular -> general_surgery)
      requires_prerequisite INTEGER DEFAULT 0,
      prerequisite_codes TEXT,                  -- JSON array of prerequisite specialty codes
      board_name TEXT,                          -- 'American Board of Surgery'
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (parent_specialty_code) REFERENCES ref_specialties(code)
    )
  `);

  // The 6 ACGME Core Competencies
  db.run(`
    CREATE TABLE IF NOT EXISTS ref_competencies (
      code TEXT PRIMARY KEY,                    -- 'patient_care', 'medical_knowledge'
      name TEXT NOT NULL,                       -- 'Patient Care'
      abbreviation TEXT NOT NULL,               -- 'PC', 'MK'
      description TEXT,
      display_order INTEGER NOT NULL
    )
  `);

  // EPAs - Entrustable Professional Activities
  db.run(`
    CREATE TABLE IF NOT EXISTS epas (
      id INTEGER PRIMARY KEY,                   -- 1-18 for surgery (standardized IDs)
      specialty_code TEXT NOT NULL,             -- Which specialty this EPA belongs to
      name TEXT NOT NULL,                       -- 'Laparoscopic Cholecystectomy'
      short_name TEXT NOT NULL,                 -- 'Lap Chole'
      description TEXT,
      category TEXT NOT NULL,                   -- 'preoperative', 'intraoperative', 'postoperative', 'longitudinal', 'professional'
      display_order INTEGER NOT NULL,
      key_functions TEXT,                       -- JSON array of key functions
      entrustment_anchors TEXT,                 -- JSON object with level descriptions
      version TEXT DEFAULT '1.0',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (specialty_code) REFERENCES ref_specialties(code)
    )
  `);

  // ============================================
  // TENANT DATA - Multi-tenant hierarchy
  // ============================================

  console.log("Creating tenant tables...");

  // Companies - SaaS customers (top-level tenant)
  db.run(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,                      -- UUID
      name TEXT NOT NULL,
      subdomain TEXT UNIQUE,                    -- For multi-tenant routing
      settings TEXT DEFAULT '{}',               -- JSON
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Institutions - Hospitals, medical schools
  db.run(`
    CREATE TABLE IF NOT EXISTS institutions (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      name TEXT NOT NULL,
      acgme_institution_id TEXT,                -- ACGME's 7-digit identifier
      type TEXT NOT NULL,                       -- 'academic_medical_center', 'community_hospital', 'va', 'medical_school'
      address TEXT,
      settings TEXT DEFAULT '{}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);

  // Sponsoring Institutions - Institutions that sponsor their own programs
  db.run(`
    CREATE TABLE IF NOT EXISTS sponsoring_institutions (
      id TEXT PRIMARY KEY,
      institution_id TEXT NOT NULL UNIQUE,      -- One institution can only be one sponsoring institution
      dio_name TEXT,                            -- Designated Institutional Official
      dio_email TEXT,
      acgme_accreditation_status TEXT,          -- 'accredited', 'probation', 'initial'
      next_site_visit TEXT,                     -- DATE
      is_active INTEGER DEFAULT 1,
      effective_date TEXT NOT NULL,             -- DATE
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (institution_id) REFERENCES institutions(id)
    )
  `);

  // Participation Agreements - PLAs between sponsors and participating sites
  db.run(`
    CREATE TABLE IF NOT EXISTS participation_agreements (
      id TEXT PRIMARY KEY,
      sponsoring_institution_id TEXT NOT NULL,
      participating_institution_id TEXT NOT NULL,
      agreement_type TEXT NOT NULL,             -- 'PLA', 'affiliation_agreement', 'MOU'
      effective_date TEXT NOT NULL,             -- DATE
      expiration_date TEXT,                     -- DATE
      status TEXT DEFAULT 'active',             -- 'active', 'expired', 'pending', 'terminated'
      applies_to_all_programs INTEGER DEFAULT 1,
      covered_program_ids TEXT,                 -- JSON array of program IDs if not all
      document_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (sponsoring_institution_id) REFERENCES sponsoring_institutions(id),
      FOREIGN KEY (participating_institution_id) REFERENCES institutions(id)
    )
  `);

  // Clinical Sites - Specific locations where training happens
  db.run(`
    CREATE TABLE IF NOT EXISTS clinical_sites (
      id TEXT PRIMARY KEY,
      institution_id TEXT NOT NULL,
      participation_agreement_id TEXT,          -- NULL for primary sites, set for affiliate sites
      name TEXT NOT NULL,
      site_classification TEXT NOT NULL,        -- 'primary', 'affiliate', 'community', 'va'
      address TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (institution_id) REFERENCES institutions(id),
      FOREIGN KEY (participation_agreement_id) REFERENCES participation_agreements(id)
    )
  `);

  // Programs - Residency and fellowship programs
  db.run(`
    CREATE TABLE IF NOT EXISTS programs (
      id TEXT PRIMARY KEY,
      sponsoring_institution_id TEXT NOT NULL,
      specialty_code TEXT NOT NULL,
      name TEXT NOT NULL,
      acgme_program_id TEXT,
      program_director_id TEXT,                 -- Will reference users
      settings TEXT DEFAULT '{}',               -- JSON for program-specific config
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (sponsoring_institution_id) REFERENCES sponsoring_institutions(id),
      FOREIGN KEY (specialty_code) REFERENCES ref_specialties(code)
    )
  `);

  // ============================================
  // USERS & ROLES
  // ============================================

  console.log("Creating user tables...");

  // Users - All people in the system
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      email TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      photo_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (company_id) REFERENCES companies(id),
      UNIQUE(company_id, email)
    )
  `);

  // Program Memberships - Links users to programs with roles
  db.run(`
    CREATE TABLE IF NOT EXISTS program_memberships (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      program_id TEXT NOT NULL,
      role TEXT NOT NULL,                       -- 'resident', 'faculty', 'program_director', 'coordinator', 'observer'
      is_active INTEGER DEFAULT 1,
      started_at TEXT NOT NULL,                 -- DATE
      ended_at TEXT,                            -- DATE, NULL if current
      metadata TEXT DEFAULT '{}',               -- JSON for role-specific data
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (program_id) REFERENCES programs(id)
    )
  `);

  // Residents - Extended data for users who are residents
  db.run(`
    CREATE TABLE IF NOT EXISTS residents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      program_id TEXT NOT NULL,
      pgy_level INTEGER NOT NULL,               -- Current PGY level (1-10)
      entry_pgy_level INTEGER NOT NULL,         -- What level they started at
      matriculation_date TEXT NOT NULL,         -- DATE
      expected_graduation_date TEXT NOT NULL,   -- DATE
      actual_graduation_date TEXT,              -- DATE, NULL until graduated
      medical_school TEXT,
      degree_type TEXT,                         -- 'MD', 'DO', 'MBBS'
      status TEXT DEFAULT 'active',             -- 'active', 'leave', 'remediation', 'completed', 'withdrawn'
      track TEXT,                               -- 'research', 'clinical', 'global_health'
      npi TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (program_id) REFERENCES programs(id),
      UNIQUE(user_id, program_id)
    )
  `);

  // Faculty - Extended data for users who are faculty
  db.run(`
    CREATE TABLE IF NOT EXISTS faculty (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      program_id TEXT NOT NULL,
      rank TEXT,                                -- 'instructor', 'assistant_professor', 'associate_professor', 'professor'
      specialty TEXT,
      is_core_faculty INTEGER DEFAULT 0,
      teaching_percent INTEGER,                 -- % time dedicated to teaching
      is_active INTEGER DEFAULT 1,
      started_at TEXT,                          -- DATE
      ended_at TEXT,                            -- DATE
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (program_id) REFERENCES programs(id),
      UNIQUE(user_id, program_id)
    )
  `);

  // ============================================
  // EPA ASSESSMENTS - The core feature
  // ============================================

  console.log("Creating assessment tables...");

  // EPA Assessments
  db.run(`
    CREATE TABLE IF NOT EXISTS epa_assessments (
      id TEXT PRIMARY KEY,
      resident_id TEXT NOT NULL,                -- References residents.id
      assessor_id TEXT NOT NULL,                -- References faculty.id
      epa_id INTEGER NOT NULL,                  -- References epas.id
      entrustment_level INTEGER NOT NULL,       -- 1-5
      assessment_date TEXT NOT NULL,            -- TIMESTAMP when it happened
      submission_date TEXT NOT NULL,            -- TIMESTAMP when recorded

      -- Context (all optional but valuable)
      clinical_site_id TEXT,
      case_urgency TEXT,                        -- 'elective', 'urgent', 'emergent'
      patient_asa_class INTEGER,                -- 1-6
      procedure_duration_min INTEGER,
      complications INTEGER DEFAULT 0,          -- boolean
      location_type TEXT,                       -- 'or', 'clinic', 'icu', 'ed', 'ward'
      location_details TEXT,                    -- 'OR 5', 'ICU Bed 12'

      -- Feedback
      narrative_feedback TEXT,
      specialty_context TEXT DEFAULT '{}',      -- JSON for specialty-specific fields

      -- Metadata
      entry_method TEXT DEFAULT 'web',          -- 'mobile_ios', 'mobile_android', 'web'
      acknowledged INTEGER DEFAULT 0,
      acknowledged_at TEXT,

      -- Soft delete
      deleted INTEGER DEFAULT 0,
      deleted_at TEXT,
      deleted_by TEXT,

      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (resident_id) REFERENCES residents(id),
      FOREIGN KEY (assessor_id) REFERENCES faculty(id),
      FOREIGN KEY (epa_id) REFERENCES epas(id),
      FOREIGN KEY (clinical_site_id) REFERENCES clinical_sites(id)
    )
  `);

  // ============================================
  // INDEXES for performance
  // ============================================

  console.log("Creating indexes...");

  // Multi-tenant isolation
  db.run(`CREATE INDEX IF NOT EXISTS idx_institutions_company ON institutions(company_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id)`);

  // Program lookups
  db.run(`CREATE INDEX IF NOT EXISTS idx_programs_sponsor ON programs(sponsoring_institution_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_programs_specialty ON programs(specialty_code)`);

  // Membership lookups
  db.run(`CREATE INDEX IF NOT EXISTS idx_memberships_user ON program_memberships(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_memberships_program ON program_memberships(program_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_memberships_role ON program_memberships(role)`);

  // Resident/Faculty lookups
  db.run(`CREATE INDEX IF NOT EXISTS idx_residents_program ON residents(program_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_residents_user ON residents(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_faculty_program ON faculty(program_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_faculty_user ON faculty(user_id)`);

  // EPA Assessment lookups (critical for performance)
  db.run(`CREATE INDEX IF NOT EXISTS idx_assessments_resident ON epa_assessments(resident_id) WHERE deleted = 0`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_assessments_assessor ON epa_assessments(assessor_id) WHERE deleted = 0`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_assessments_epa ON epa_assessments(epa_id) WHERE deleted = 0`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_assessments_resident_epa ON epa_assessments(resident_id, epa_id) WHERE deleted = 0`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_assessments_date ON epa_assessments(assessment_date) WHERE deleted = 0`);

  // Clinical site lookups
  db.run(`CREATE INDEX IF NOT EXISTS idx_clinical_sites_institution ON clinical_sites(institution_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_clinical_sites_pla ON clinical_sites(participation_agreement_id)`);

  console.log("\n✓ Schema created successfully!");
}

// Run if executed directly
if (import.meta.main) {
  const db = new Database("rms.db");
  createSchema(db);
  db.close();
}
