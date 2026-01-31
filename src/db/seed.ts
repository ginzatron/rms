/**
 * RMS Seed Data
 *
 * Populates the database with realistic test data for a surgery residency program.
 * Run with: bun run src/db/seed.ts
 */

import { Database } from "bun:sqlite";
import { createSchema } from "./schema";

// Helper to generate simple UUIDs for seed data
function uuid(prefix: string, num: number): string {
  return `${prefix}-${String(num).padStart(4, "0")}`;
}

export function seedDatabase(db: Database) {
  console.log("Seeding database...\n");

  // ============================================
  // REFERENCE DATA
  // ============================================

  console.log("Seeding reference data...");

  // Core Competencies
  const competencies = [
    { code: "patient_care", name: "Patient Care", abbr: "PC", order: 1 },
    { code: "medical_knowledge", name: "Medical Knowledge", abbr: "MK", order: 2 },
    { code: "practice_based_learning", name: "Practice-Based Learning and Improvement", abbr: "PBLI", order: 3 },
    { code: "interpersonal_communication", name: "Interpersonal and Communication Skills", abbr: "ICS", order: 4 },
    { code: "professionalism", name: "Professionalism", abbr: "PROF", order: 5 },
    { code: "systems_based_practice", name: "Systems-Based Practice", abbr: "SBP", order: 6 },
  ];

  const insertCompetency = db.prepare(`
    INSERT OR REPLACE INTO ref_competencies (code, name, abbreviation, display_order)
    VALUES (?, ?, ?, ?)
  `);

  for (const c of competencies) {
    insertCompetency.run(c.code, c.name, c.abbr, c.order);
  }

  // Specialties
  const specialties = [
    { code: "general_surgery", name: "General Surgery", category: "surgical", acgme: "440", years: 5, board: "American Board of Surgery" },
    { code: "internal_medicine", name: "Internal Medicine", category: "medical", acgme: "140", years: 3, board: "American Board of Internal Medicine" },
    { code: "emergency_medicine", name: "Emergency Medicine", category: "hospital_based", acgme: "110", years: 3, board: "American Board of Emergency Medicine" },
    { code: "vascular_surgery", name: "Vascular Surgery", category: "surgical", acgme: "451", years: 2, board: "American Board of Surgery", parent: "general_surgery", prereq: true },
    { code: "surgical_critical_care", name: "Surgical Critical Care", category: "surgical", acgme: "442", years: 1, board: "American Board of Surgery", parent: "general_surgery", prereq: true },
  ];

  const insertSpecialty = db.prepare(`
    INSERT OR REPLACE INTO ref_specialties
    (code, name, category, acgme_specialty_code, typical_duration_years, board_name, is_subspecialty, parent_specialty_code, requires_prerequisite)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const s of specialties) {
    insertSpecialty.run(
      s.code, s.name, s.category, s.acgme, s.years, s.board,
      s.parent ? 1 : 0, s.parent || null, s.prereq ? 1 : 0
    );
  }

  // General Surgery EPAs (all 18)
  const surgeryEPAs = [
    // Preoperative
    { id: 1, name: "Preoperative Assessment and Informed Consent", short: "Preop Assessment", cat: "preoperative" },
    { id: 2, name: "Preoperative Planning", short: "Preop Planning", cat: "preoperative" },
    // Intraoperative
    { id: 3, name: "Appendectomy (Laparoscopic or Open)", short: "Appendectomy", cat: "intraoperative" },
    { id: 4, name: "Inguinal Hernia Repair", short: "Hernia Repair", cat: "intraoperative" },
    { id: 5, name: "Laparoscopic Cholecystectomy", short: "Lap Chole", cat: "intraoperative" },
    { id: 6, name: "Bowel Resection", short: "Bowel Resection", cat: "intraoperative" },
    { id: 7, name: "Soft Tissue Mass Excision", short: "Soft Tissue", cat: "intraoperative" },
    { id: 8, name: "Central Venous Catheter Insertion", short: "Central Line", cat: "intraoperative" },
    { id: 9, name: "Trauma Laparotomy", short: "Trauma Lap", cat: "intraoperative" },
    { id: 10, name: "Create Intestinal Stoma", short: "Stoma Creation", cat: "intraoperative" },
    // Postoperative
    { id: 11, name: "Postoperative Management", short: "Postop Mgmt", cat: "postoperative" },
    { id: 12, name: "Recognition and Management of Complications", short: "Complications", cat: "postoperative" },
    // Longitudinal
    { id: 13, name: "Multi-day Patient Management", short: "Continuity Care", cat: "longitudinal" },
    { id: 14, name: "End-of-Life Care", short: "End of Life", cat: "longitudinal" },
    { id: 15, name: "Care Transitions and Handoffs", short: "Handoffs", cat: "longitudinal" },
    // Professional
    { id: 16, name: "Leading a Healthcare Team", short: "Team Leadership", cat: "professional" },
    { id: 17, name: "Systems-Based Practice and Patient Safety", short: "Patient Safety", cat: "professional" },
    { id: 18, name: "Practice-Based Learning and Quality Improvement", short: "QI/PBLI", cat: "professional" },
  ];

  const insertEPA = db.prepare(`
    INSERT OR REPLACE INTO epas (id, specialty_code, name, short_name, category, display_order)
    VALUES (?, 'general_surgery', ?, ?, ?, ?)
  `);

  for (const epa of surgeryEPAs) {
    insertEPA.run(epa.id, epa.name, epa.short, epa.cat, epa.id);
  }

  // ============================================
  // TENANT DATA - Partners Healthcare
  // ============================================

  console.log("Seeding tenant data...");

  // Company
  db.run(`
    INSERT OR REPLACE INTO companies (id, name, subdomain)
    VALUES ('comp-0001', 'Partners Healthcare', 'partners')
  `);

  // Institutions
  const institutions = [
    { id: "inst-mgh", name: "Massachusetts General Hospital", type: "academic_medical_center", acgme: "1234567" },
    { id: "inst-bwh", name: "Brigham and Women's Hospital", type: "academic_medical_center", acgme: "1234568" },
    { id: "inst-va", name: "VA Boston Healthcare System", type: "va", acgme: "1234569" },
    { id: "inst-nwh", name: "Newton-Wellesley Hospital", type: "community_hospital", acgme: "1234570" },
  ];

  const insertInstitution = db.prepare(`
    INSERT OR REPLACE INTO institutions (id, company_id, name, type, acgme_institution_id)
    VALUES (?, 'comp-0001', ?, ?, ?)
  `);

  for (const i of institutions) {
    insertInstitution.run(i.id, i.name, i.type, i.acgme);
  }

  // Sponsoring Institution (MGH)
  db.run(`
    INSERT OR REPLACE INTO sponsoring_institutions
    (id, institution_id, dio_name, dio_email, acgme_accreditation_status, effective_date, is_active)
    VALUES ('si-mgh', 'inst-mgh', 'Dr. Robert Williams', 'rwilliams@partners.org', 'accredited', '2020-01-01', 1)
  `);

  // Participation Agreements (MGH with BWH, VA, NWH)
  const plas = [
    { id: "pla-bwh", participating: "inst-bwh" },
    { id: "pla-va", participating: "inst-va" },
    { id: "pla-nwh", participating: "inst-nwh" },
  ];

  const insertPLA = db.prepare(`
    INSERT OR REPLACE INTO participation_agreements
    (id, sponsoring_institution_id, participating_institution_id, agreement_type, effective_date, status)
    VALUES (?, 'si-mgh', ?, 'PLA', '2024-07-01', 'active')
  `);

  for (const pla of plas) {
    insertPLA.run(pla.id, pla.participating);
  }

  // Clinical Sites
  const clinicalSites = [
    // Primary sites at MGH
    { id: "site-mgh-main", inst: "inst-mgh", pla: null, name: "MGH Main Campus", class: "primary" },
    { id: "site-mgh-or", inst: "inst-mgh", pla: null, name: "MGH Surgical OR Suite", class: "primary" },
    { id: "site-mgh-sicu", inst: "inst-mgh", pla: null, name: "MGH Surgical ICU", class: "primary" },
    { id: "site-mgh-clinic", inst: "inst-mgh", pla: null, name: "MGH Surgical Clinic", class: "primary" },
    // Affiliate sites
    { id: "site-bwh-surg", inst: "inst-bwh", pla: "pla-bwh", name: "BWH General Surgery Service", class: "affiliate" },
    { id: "site-bwh-or", inst: "inst-bwh", pla: "pla-bwh", name: "BWH Surgical OR Suite", class: "affiliate" },
    { id: "site-va-surg", inst: "inst-va", pla: "pla-va", name: "VA Boston Surgical Service", class: "va" },
    { id: "site-nwh-surg", inst: "inst-nwh", pla: "pla-nwh", name: "Newton-Wellesley Surgical Service", class: "community" },
  ];

  const insertSite = db.prepare(`
    INSERT OR REPLACE INTO clinical_sites
    (id, institution_id, participation_agreement_id, name, site_classification, is_active)
    VALUES (?, ?, ?, ?, ?, 1)
  `);

  for (const site of clinicalSites) {
    insertSite.run(site.id, site.inst, site.pla, site.name, site.class);
  }

  // Program - MGH General Surgery
  db.run(`
    INSERT OR REPLACE INTO programs
    (id, sponsoring_institution_id, specialty_code, name, acgme_program_id)
    VALUES ('prog-mgh-surg', 'si-mgh', 'general_surgery', 'MGH General Surgery Residency', '1234567890')
  `);

  // ============================================
  // USERS
  // ============================================

  console.log("Seeding users...");

  // Faculty
  const facultyUsers = [
    { id: "user-martinez", first: "Julia", last: "Martinez", email: "jmartinez@partners.org" },
    { id: "user-patel", first: "Rajesh", last: "Patel", email: "rpatel@partners.org" },
    { id: "user-thompson", first: "Lisa", last: "Thompson", email: "lthompson@partners.org" },
    { id: "user-kim", first: "David", last: "Kim", email: "dkim@partners.org" },
    { id: "user-williams", first: "Robert", last: "Williams", email: "rwilliams@partners.org" }, // Program Director
  ];

  // Residents
  const residentUsers = [
    { id: "user-chen", first: "Sarah", last: "Chen", email: "schen@partners.org" },           // PGY-5
    { id: "user-rodriguez", first: "Michael", last: "Rodriguez", email: "mrodriguez@partners.org" }, // PGY-4
    { id: "user-johnson", first: "Emma", last: "Johnson", email: "ejohnson@partners.org" },   // PGY-3
    { id: "user-pham", first: "Kevin", last: "Pham", email: "kpham@partners.org" },           // PGY-2
    { id: "user-oconnor", first: "Megan", last: "O'Connor", email: "moconnor@partners.org" }, // PGY-1
    { id: "user-singh", first: "Arjun", last: "Singh", email: "asingh@partners.org" },        // PGY-1
  ];

  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, company_id, email, first_name, last_name, is_active)
    VALUES (?, 'comp-0001', ?, ?, ?, 1)
  `);

  for (const u of [...facultyUsers, ...residentUsers]) {
    insertUser.run(u.id, u.email, u.first, u.last);
  }

  // ============================================
  // PROGRAM MEMBERSHIPS
  // ============================================

  console.log("Seeding program memberships...");

  const insertMembership = db.prepare(`
    INSERT OR REPLACE INTO program_memberships (id, user_id, program_id, role, is_active, started_at)
    VALUES (?, ?, 'prog-mgh-surg', ?, 1, ?)
  `);

  // Faculty memberships
  insertMembership.run("pm-martinez-fac", "user-martinez", "faculty", "2018-07-01");
  insertMembership.run("pm-patel-fac", "user-patel", "faculty", "2015-07-01");
  insertMembership.run("pm-thompson-fac", "user-thompson", "faculty", "2020-07-01");
  insertMembership.run("pm-kim-fac", "user-kim", "faculty", "2019-07-01");
  insertMembership.run("pm-williams-pd", "user-williams", "program_director", "2019-07-01");

  // Resident memberships
  insertMembership.run("pm-chen-res", "user-chen", "resident", "2020-07-01");
  insertMembership.run("pm-rodriguez-res", "user-rodriguez", "resident", "2021-07-01");
  insertMembership.run("pm-johnson-res", "user-johnson", "resident", "2022-07-01");
  insertMembership.run("pm-pham-res", "user-pham", "resident", "2023-07-01");
  insertMembership.run("pm-oconnor-res", "user-oconnor", "resident", "2024-07-01");
  insertMembership.run("pm-singh-res", "user-singh", "resident", "2024-07-01");

  // Sarah Chen (PGY-5) also has faculty role (chief resident who supervises)
  insertMembership.run("pm-chen-fac", "user-chen", "faculty", "2024-07-01");

  // ============================================
  // FACULTY RECORDS
  // ============================================

  console.log("Seeding faculty records...");

  const insertFaculty = db.prepare(`
    INSERT OR REPLACE INTO faculty
    (id, user_id, program_id, rank, specialty, is_core_faculty, teaching_percent, is_active, started_at)
    VALUES (?, ?, 'prog-mgh-surg', ?, 'General Surgery', ?, ?, 1, ?)
  `);

  insertFaculty.run("fac-martinez", "user-martinez", "associate_professor", 1, 40, "2018-07-01");
  insertFaculty.run("fac-patel", "user-patel", "professor", 1, 30, "2015-07-01");
  insertFaculty.run("fac-thompson", "user-thompson", "assistant_professor", 1, 50, "2020-07-01");
  insertFaculty.run("fac-kim", "user-kim", "associate_professor", 1, 35, "2019-07-01");
  insertFaculty.run("fac-williams", "user-williams", "professor", 1, 25, "2019-07-01");
  // Sarah Chen as chief resident faculty
  insertFaculty.run("fac-chen", "user-chen", "clinical_instructor", 0, 20, "2024-07-01");

  // ============================================
  // RESIDENT RECORDS
  // ============================================

  console.log("Seeding resident records...");

  const insertResident = db.prepare(`
    INSERT OR REPLACE INTO residents
    (id, user_id, program_id, pgy_level, entry_pgy_level, matriculation_date, expected_graduation_date, medical_school, degree_type, status)
    VALUES (?, ?, 'prog-mgh-surg', ?, 1, ?, ?, ?, 'MD', 'active')
  `);

  insertResident.run("res-chen", "user-chen", 5, "2020-07-01", "2025-06-30", "Harvard Medical School");
  insertResident.run("res-rodriguez", "user-rodriguez", 4, "2021-07-01", "2026-06-30", "Stanford University");
  insertResident.run("res-johnson", "user-johnson", 3, "2022-07-01", "2027-06-30", "Johns Hopkins");
  insertResident.run("res-pham", "user-pham", 2, "2023-07-01", "2028-06-30", "UCSF");
  insertResident.run("res-oconnor", "user-oconnor", 1, "2024-07-01", "2029-06-30", "Yale");
  insertResident.run("res-singh", "user-singh", 1, "2024-07-01", "2029-06-30", "Columbia");

  // ============================================
  // SAMPLE EPA ASSESSMENTS
  // ============================================

  console.log("Seeding sample EPA assessments...");

  const insertAssessment = db.prepare(`
    INSERT OR REPLACE INTO epa_assessments
    (id, resident_id, assessor_id, epa_id, entrustment_level, assessment_date, submission_date,
     clinical_site_id, case_urgency, patient_asa_class, procedure_duration_min, location_type, location_details,
     narrative_feedback, entry_method, acknowledged)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Mike Rodriguez (PGY-4) - showing progression on Lap Chole
  const mikeAssessments = [
    {
      id: "assess-001", resident: "res-rodriguez", assessor: "fac-patel", epa: 5, level: 3,
      date: "2024-10-15T14:30:00Z", site: "site-mgh-or", urgency: "elective", asa: 2, duration: 55,
      location: "or", details: "OR 5",
      feedback: "Good case. Mike demonstrated solid decision-making and improving port placement. Still needs work on achieving critical view of safety - we talked through the approach. Ready for more independence on straightforward cases.",
      method: "mobile_ios", ack: 1
    },
    {
      id: "assess-002", resident: "res-rodriguez", assessor: "fac-martinez", epa: 5, level: 3,
      date: "2024-11-03T09:15:00Z", site: "site-mgh-or", urgency: "urgent", asa: 2, duration: 68,
      location: "or", details: "OR 3",
      feedback: "Excellent critical view. Decision to proceed was appropriate. Technique is improving consistently. Consider allowing more independence on next case.",
      method: "mobile_ios", ack: 1
    },
    {
      id: "assess-003", resident: "res-rodriguez", assessor: "fac-patel", epa: 5, level: 4,
      date: "2024-12-10T15:45:00Z", site: "site-mgh-or", urgency: "elective", asa: 3, duration: 72,
      location: "or", details: "OR 5",
      feedback: "Performed case with minimal guidance. Good judgment throughout. Managed adhesions well. Ready for supervision on demand level for routine cases.",
      method: "mobile_ios", ack: 1
    },
    {
      id: "assess-004", resident: "res-rodriguez", assessor: "fac-thompson", epa: 5, level: 4,
      date: "2025-01-20T11:00:00Z", site: "site-bwh-or", urgency: "elective", asa: 2, duration: 48,
      location: "or", details: "OR 8",
      feedback: "Efficient case, excellent technique. Mike is ready to do these with supervision available only if needed. Textbook critical view.",
      method: "web", ack: 0
    },
    // Mike on other EPAs
    {
      id: "assess-005", resident: "res-rodriguez", assessor: "fac-patel", epa: 3, level: 4,
      date: "2024-11-20T02:30:00Z", site: "site-mgh-or", urgency: "emergent", asa: 2, duration: 35,
      location: "or", details: "OR 2",
      feedback: "Middle of the night acute appy. Mike handled it independently, called me to scrub in but didn't need my help. Excellent decision-making under pressure.",
      method: "mobile_ios", ack: 1
    },
    {
      id: "assess-006", resident: "res-rodriguez", assessor: "fac-martinez", epa: 4, level: 3,
      date: "2024-12-05T08:00:00Z", site: "site-mgh-or", urgency: "elective", asa: 2, duration: 90,
      location: "or", details: "OR 4",
      feedback: "Bilateral inguinal hernia repair. Good mesh placement on right side. Left side needed some coaching on dissection near the cord. Solid overall.",
      method: "mobile_android", ack: 1
    },
  ];

  // Emma Johnson (PGY-3) - developing on various EPAs
  const emmaAssessments = [
    {
      id: "assess-010", resident: "res-johnson", assessor: "fac-martinez", epa: 5, level: 3,
      date: "2024-11-12T14:00:00Z", site: "site-bwh-or", urgency: "elective", asa: 2, duration: 65,
      location: "or", details: "OR 6",
      feedback: "Good case for Emma. She's progressing well on lap choles. Critical view was achieved safely. Minor coaching on retraction angles. Keep building volume.",
      method: "mobile_ios", ack: 1
    },
    {
      id: "assess-011", resident: "res-johnson", assessor: "fac-kim", epa: 6, level: 2,
      date: "2024-12-01T10:30:00Z", site: "site-mgh-or", urgency: "urgent", asa: 3, duration: 180,
      location: "or", details: "OR 1",
      feedback: "Perforated diverticulitis requiring Hartmann's. Complex case. Emma assisted well and performed the sigmoid mobilization. Needs more experience before leading these independently. Good learning case.",
      method: "mobile_ios", ack: 1
    },
    {
      id: "assess-012", resident: "res-johnson", assessor: "fac-patel", epa: 8, level: 4,
      date: "2025-01-15T16:00:00Z", site: "site-mgh-sicu", urgency: "urgent", asa: 3, duration: 15,
      location: "icu", details: "SICU Bed 4",
      feedback: "IJ central line placed independently. Ultrasound-guided, first pass. Emma is proficient at line placement.",
      method: "web", ack: 1
    },
  ];

  // James O'Connor (PGY-1) - early assessments
  const jamesAssessments = [
    {
      id: "assess-020", resident: "res-oconnor", assessor: "fac-chen", epa: 3, level: 2,
      date: "2024-09-10T03:20:00Z", site: "site-va-surg", urgency: "emergent", asa: 2, duration: 48,
      location: "or", details: "OR 2",
      feedback: "Megan assisted on emergent lap appy. Good retraction and camera work. Needs more practice with dissection before taking the lead. Discussed anatomy and safe approach. Good attitude.",
      method: "mobile_ios", ack: 1
    },
    {
      id: "assess-021", resident: "res-oconnor", assessor: "fac-thompson", epa: 1, level: 3,
      date: "2024-10-05T09:00:00Z", site: "site-mgh-clinic", urgency: "elective", asa: 1, duration: 30,
      location: "clinic", details: "Surgical Clinic Room 4",
      feedback: "Megan performed a thorough preop assessment for elective cholecystectomy. Good history, appropriate physical exam. Consent discussion was complete. She's doing well with clinic evaluations.",
      method: "web", ack: 1
    },
    {
      id: "assess-022", resident: "res-oconnor", assessor: "fac-kim", epa: 11, level: 2,
      date: "2024-11-20T07:00:00Z", site: "site-mgh-main", urgency: "elective", asa: 2, duration: null,
      location: "ward", details: "Ellison 12",
      feedback: "Rounding with Megan on postop patients. She presented well and had appropriate plans. Needed prompting on fluid management for the pancreatitis patient. Learning curve appropriate for PGY-1.",
      method: "mobile_ios", ack: 0
    },
  ];

  for (const a of [...mikeAssessments, ...emmaAssessments, ...jamesAssessments]) {
    insertAssessment.run(
      a.id, a.resident, a.assessor, a.epa, a.level,
      a.date, a.date, // assessment_date and submission_date same for seed data
      a.site, a.urgency, a.asa, a.duration, a.location, a.details,
      a.feedback, a.method, a.ack
    );
  }

  // Update program director reference
  db.run(`UPDATE programs SET program_director_id = 'user-williams' WHERE id = 'prog-mgh-surg'`);

  console.log("\n✓ Database seeded successfully!");
  console.log("\nSummary:");
  console.log("  - 1 company (Partners Healthcare)");
  console.log("  - 4 institutions (MGH, BWH, VA, NWH)");
  console.log("  - 1 sponsoring institution (MGH)");
  console.log("  - 3 participation agreements");
  console.log("  - 8 clinical sites");
  console.log("  - 1 program (MGH General Surgery)");
  console.log("  - 5 specialties (including 2 subspecialties)");
  console.log("  - 18 EPAs (General Surgery)");
  console.log("  - 6 competencies");
  console.log("  - 11 users (5 faculty + 6 residents)");
  console.log("  - 12 sample EPA assessments");
}

// Run if executed directly
if (import.meta.main) {
  const db = new Database("rms.db");
  createSchema(db);
  seedDatabase(db);
  db.close();
  console.log("\nDatabase file: rms.db");
}
