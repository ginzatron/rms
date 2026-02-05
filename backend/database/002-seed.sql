-- ============================================================================
-- RMS Seed Data
-- Realistic General Surgery residency program for testing
-- ============================================================================

-- ============================================================================
-- PROGRAM
-- ============================================================================

INSERT INTO programs (id, name, specialty, acgme_program_id) VALUES
('11111111-1111-1111-1111-111111111111', 'MGH General Surgery Residency', 'General Surgery', '1234567890');

-- ============================================================================
-- USERS - Faculty (f = faculty prefix using hex-compatible IDs)
-- ============================================================================

INSERT INTO users (id, email, first_name, last_name, role) VALUES
('f0000001-0000-0000-0000-000000000001', 'jmartinez@mgh.edu', 'Julia', 'Martinez', 'faculty'),
('f0000002-0000-0000-0000-000000000002', 'rpatel@mgh.edu', 'Rajesh', 'Patel', 'faculty'),
('f0000003-0000-0000-0000-000000000003', 'lthompson@mgh.edu', 'Lisa', 'Thompson', 'faculty'),
('f0000004-0000-0000-0000-000000000004', 'dkim@mgh.edu', 'David', 'Kim', 'faculty'),
('f0000005-0000-0000-0000-000000000005', 'rwilliams@mgh.edu', 'Robert', 'Williams', 'program_director');

-- ============================================================================
-- USERS - Residents (a = resident prefix using hex-compatible IDs)
-- ============================================================================

INSERT INTO users (id, email, first_name, last_name, role) VALUES
('a0000001-0000-0000-0000-000000000001', 'schen@mgh.edu', 'Sarah', 'Chen', 'resident'),
('a0000002-0000-0000-0000-000000000002', 'mrodriguez@mgh.edu', 'Michael', 'Rodriguez', 'resident'),
('a0000003-0000-0000-0000-000000000003', 'ejohnson@mgh.edu', 'Emma', 'Johnson', 'resident'),
('a0000004-0000-0000-0000-000000000004', 'kpham@mgh.edu', 'Kevin', 'Pham', 'resident'),
('a0000005-0000-0000-0000-000000000005', 'moconnor@mgh.edu', 'Megan', 'O''Connor', 'resident'),
('a0000006-0000-0000-0000-000000000006', 'asingh@mgh.edu', 'Arjun', 'Singh', 'resident');

-- ============================================================================
-- FACULTY RECORDS
-- ============================================================================

INSERT INTO faculty (id, user_id, program_id, rank, is_core_faculty, can_assess) VALUES
('fac00001-0000-0000-0000-000000000001', 'f0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'associate_professor', true, true),
('fac00002-0000-0000-0000-000000000002', 'f0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'professor', true, true),
('fac00003-0000-0000-0000-000000000003', 'f0000003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'assistant_professor', true, true),
('fac00004-0000-0000-0000-000000000004', 'f0000004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'associate_professor', true, true),
('fac00005-0000-0000-0000-000000000005', 'f0000005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'professor', true, true);

-- ============================================================================
-- RESIDENT RECORDS (using b prefix for resident records - hex compatible)
-- ============================================================================

INSERT INTO residents (id, user_id, program_id, pgy_level, start_date, expected_graduation_date, status, medical_school) VALUES
('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'PGY-5', '2020-07-01', '2025-06-30', 'active', 'Harvard Medical School'),
('b0000002-0000-0000-0000-000000000002', 'a0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'PGY-4', '2021-07-01', '2026-06-30', 'active', 'Stanford University'),
('b0000003-0000-0000-0000-000000000003', 'a0000003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'PGY-3', '2022-07-01', '2027-06-30', 'active', 'Johns Hopkins'),
('b0000004-0000-0000-0000-000000000004', 'a0000004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'PGY-2', '2023-07-01', '2028-06-30', 'active', 'UCSF'),
('b0000005-0000-0000-0000-000000000005', 'a0000005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'PGY-1', '2024-07-01', '2029-06-30', 'active', 'Yale'),
('b0000006-0000-0000-0000-000000000006', 'a0000006-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'PGY-1', '2024-07-01', '2029-06-30', 'active', 'Columbia');

-- ============================================================================
-- CLINICAL SITES
-- ============================================================================

INSERT INTO clinical_sites (id, program_id, name, site_type) VALUES
('c0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'MGH Main OR', 'primary'),
('c0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'MGH Surgical ICU', 'primary'),
('c0000003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'MGH Surgical Clinic', 'primary'),
('c0000004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'MGH Emergency Department', 'primary'),
('c0000005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'BWH Surgical Service', 'affiliate'),
('c0000006-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'VA Boston', 'va'),
('c0000007-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'Newton-Wellesley Hospital', 'community');

-- ============================================================================
-- ROTATIONS
-- ============================================================================

INSERT INTO rotations (id, program_id, name) VALUES
('d0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'General Surgery'),
('d0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Surgical ICU'),
('d0000003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Trauma Surgery'),
('d0000004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Vascular Surgery'),
('d0000005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Surgical Oncology');

-- ============================================================================
-- EPA DEFINITIONS (General Surgery - 18 EPAs, using e prefix)
-- ============================================================================

INSERT INTO epa_definitions (id, program_id, epa_number, title, short_name, category, display_order) VALUES
-- Preoperative
('e0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'EPA 1', 'Preoperative Assessment and Informed Consent', 'Preop Assessment', 'preoperative', 1),
('e0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'EPA 2', 'Preoperative Planning', 'Preop Planning', 'preoperative', 2),

-- Intraoperative
('e0000003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'EPA 3', 'Appendectomy (Laparoscopic or Open)', 'Appendectomy', 'intraoperative', 3),
('e0000004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'EPA 4', 'Inguinal Hernia Repair', 'Hernia Repair', 'intraoperative', 4),
('e0000005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'EPA 5', 'Laparoscopic Cholecystectomy', 'Lap Chole', 'intraoperative', 5),
('e0000006-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'EPA 6', 'Bowel Resection', 'Bowel Resection', 'intraoperative', 6),
('e0000007-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'EPA 7', 'Soft Tissue Mass Excision', 'Soft Tissue', 'intraoperative', 7),
('e0000008-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'EPA 8', 'Central Venous Catheter Insertion', 'Central Line', 'intraoperative', 8),
('e0000009-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'EPA 9', 'Trauma Laparotomy', 'Trauma Lap', 'intraoperative', 9),
('e0000010-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'EPA 10', 'Create Intestinal Stoma', 'Stoma Creation', 'intraoperative', 10),

-- Postoperative
('e0000011-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', 'EPA 11', 'Postoperative Management', 'Postop Mgmt', 'postoperative', 11),
('e0000012-0000-0000-0000-000000000012', '11111111-1111-1111-1111-111111111111', 'EPA 12', 'Recognition and Management of Complications', 'Complications', 'postoperative', 12),

-- Longitudinal
('e0000013-0000-0000-0000-000000000013', '11111111-1111-1111-1111-111111111111', 'EPA 13', 'Multi-day Patient Management', 'Continuity Care', 'longitudinal', 13),
('e0000014-0000-0000-0000-000000000014', '11111111-1111-1111-1111-111111111111', 'EPA 14', 'End-of-Life Care', 'End of Life', 'longitudinal', 14),
('e0000015-0000-0000-0000-000000000015', '11111111-1111-1111-1111-111111111111', 'EPA 15', 'Care Transitions and Handoffs', 'Handoffs', 'longitudinal', 15),

-- Professional
('e0000016-0000-0000-0000-000000000016', '11111111-1111-1111-1111-111111111111', 'EPA 16', 'Leading a Healthcare Team', 'Team Leadership', 'professional', 16),
('e0000017-0000-0000-0000-000000000017', '11111111-1111-1111-1111-111111111111', 'EPA 17', 'Systems-Based Practice and Patient Safety', 'Patient Safety', 'professional', 17),
('e0000018-0000-0000-0000-000000000018', '11111111-1111-1111-1111-111111111111', 'EPA 18', 'Practice-Based Learning and Quality Improvement', 'QI/PBLI', 'professional', 18);

-- ============================================================================
-- EPA REQUIREMENTS
-- ============================================================================

INSERT INTO epa_requirements (program_id, epa_id, training_level, minimum_count, minimum_entrustment) VALUES
-- EPA 5 - Lap Chole requirements
('11111111-1111-1111-1111-111111111111', 'e0000005-0000-0000-0000-000000000005', 'PGY-2', 10, '3'),
('11111111-1111-1111-1111-111111111111', 'e0000005-0000-0000-0000-000000000005', 'PGY-3', 20, '4'),
('11111111-1111-1111-1111-111111111111', 'e0000005-0000-0000-0000-000000000005', NULL, 50, '4'),

-- EPA 3 - Appendectomy requirements
('11111111-1111-1111-1111-111111111111', 'e0000003-0000-0000-0000-000000000003', 'PGY-1', 5, '2'),
('11111111-1111-1111-1111-111111111111', 'e0000003-0000-0000-0000-000000000003', 'PGY-2', 15, '3'),
('11111111-1111-1111-1111-111111111111', 'e0000003-0000-0000-0000-000000000003', NULL, 40, '4'),

-- EPA 8 - Central Line requirements
('11111111-1111-1111-1111-111111111111', 'e0000008-0000-0000-0000-000000000008', 'PGY-1', 10, '3'),
('11111111-1111-1111-1111-111111111111', 'e0000008-0000-0000-0000-000000000008', NULL, 30, '4');

-- ============================================================================
-- SAMPLE EPA ASSESSMENTS
-- ============================================================================

-- Michael Rodriguez (PGY-4) - Lap Chole progression
INSERT INTO epa_assessments (resident_id, faculty_id, epa_id, entrustment_level, assessment_date, clinical_site_id, case_urgency, patient_asa_class, procedure_duration_min, location_type, location_details, narrative_feedback, entry_method) VALUES
('b0000002-0000-0000-0000-000000000002', 'fac00002-0000-0000-0000-000000000002', 'e0000005-0000-0000-0000-000000000005', '3', '2024-10-15 14:30:00-05', 'c0000001-0000-0000-0000-000000000001', 'elective', 2, 55, 'or', 'OR 5', 'Good case. Mike demonstrated solid decision-making and improving port placement. Still needs work on achieving critical view of safety - we talked through the approach. Ready for more independence on straightforward cases.', 'mobile_ios'),
('b0000002-0000-0000-0000-000000000002', 'fac00001-0000-0000-0000-000000000001', 'e0000005-0000-0000-0000-000000000005', '3', '2024-11-03 09:15:00-05', 'c0000001-0000-0000-0000-000000000001', 'urgent', 2, 68, 'or', 'OR 3', 'Excellent critical view. Decision to proceed was appropriate. Technique is improving consistently. Consider allowing more independence on next case.', 'mobile_ios'),
('b0000002-0000-0000-0000-000000000002', 'fac00002-0000-0000-0000-000000000002', 'e0000005-0000-0000-0000-000000000005', '4', '2024-12-10 15:45:00-05', 'c0000001-0000-0000-0000-000000000001', 'elective', 3, 72, 'or', 'OR 5', 'Performed case with minimal guidance. Good judgment throughout. Managed adhesions well. Ready for supervision on demand level for routine cases.', 'mobile_ios'),
('b0000002-0000-0000-0000-000000000002', 'fac00003-0000-0000-0000-000000000003', 'e0000005-0000-0000-0000-000000000005', '4', '2025-01-20 11:00:00-05', 'c0000005-0000-0000-0000-000000000005', 'elective', 2, 48, 'or', 'OR 8', 'Efficient case, excellent technique. Mike is ready to do these with supervision available only if needed. Textbook critical view.', 'web');

-- Michael on other EPAs
INSERT INTO epa_assessments (resident_id, faculty_id, epa_id, entrustment_level, assessment_date, clinical_site_id, case_urgency, patient_asa_class, procedure_duration_min, location_type, location_details, narrative_feedback, entry_method) VALUES
('b0000002-0000-0000-0000-000000000002', 'fac00002-0000-0000-0000-000000000002', 'e0000003-0000-0000-0000-000000000003', '4', '2024-11-20 02:30:00-05', 'c0000001-0000-0000-0000-000000000001', 'emergent', 2, 35, 'or', 'OR 2', 'Middle of the night acute appy. Mike handled it independently, called me to scrub in but didn''t need my help. Excellent decision-making under pressure.', 'mobile_ios'),
('b0000002-0000-0000-0000-000000000002', 'fac00001-0000-0000-0000-000000000001', 'e0000004-0000-0000-0000-000000000004', '3', '2024-12-05 08:00:00-05', 'c0000001-0000-0000-0000-000000000001', 'elective', 2, 90, 'or', 'OR 4', 'Bilateral inguinal hernia repair. Good mesh placement on right side. Left side needed some coaching on dissection near the cord. Solid overall.', 'mobile_android');

-- Emma Johnson (PGY-3)
INSERT INTO epa_assessments (resident_id, faculty_id, epa_id, entrustment_level, assessment_date, clinical_site_id, case_urgency, patient_asa_class, procedure_duration_min, location_type, location_details, narrative_feedback, entry_method) VALUES
('b0000003-0000-0000-0000-000000000003', 'fac00001-0000-0000-0000-000000000001', 'e0000005-0000-0000-0000-000000000005', '3', '2024-11-12 14:00:00-05', 'c0000005-0000-0000-0000-000000000005', 'elective', 2, 65, 'or', 'OR 6', 'Good case for Emma. She''s progressing well on lap choles. Critical view was achieved safely. Minor coaching on retraction angles. Keep building volume.', 'mobile_ios'),
('b0000003-0000-0000-0000-000000000003', 'fac00004-0000-0000-0000-000000000004', 'e0000006-0000-0000-0000-000000000006', '2', '2024-12-01 10:30:00-05', 'c0000001-0000-0000-0000-000000000001', 'urgent', 3, 180, 'or', 'OR 1', 'Perforated diverticulitis requiring Hartmann''s. Complex case. Emma assisted well and performed the sigmoid mobilization. Needs more experience before leading these independently. Good learning case.', 'mobile_ios'),
('b0000003-0000-0000-0000-000000000003', 'fac00002-0000-0000-0000-000000000002', 'e0000008-0000-0000-0000-000000000008', '4', '2025-01-15 16:00:00-05', 'c0000002-0000-0000-0000-000000000002', 'urgent', 3, 15, 'icu', 'SICU Bed 4', 'IJ central line placed independently. Ultrasound-guided, first pass. Emma is proficient at line placement.', 'web');

-- Megan O'Connor (PGY-1)
INSERT INTO epa_assessments (resident_id, faculty_id, epa_id, entrustment_level, assessment_date, clinical_site_id, case_urgency, patient_asa_class, procedure_duration_min, location_type, location_details, narrative_feedback, entry_method) VALUES
('b0000005-0000-0000-0000-000000000005', 'fac00003-0000-0000-0000-000000000003', 'e0000003-0000-0000-0000-000000000003', '2', '2024-09-10 03:20:00-05', 'c0000006-0000-0000-0000-000000000006', 'emergent', 2, 48, 'or', 'OR 2', 'Megan assisted on emergent lap appy. Good retraction and camera work. Needs more practice with dissection before taking the lead. Discussed anatomy and safe approach. Good attitude.', 'mobile_ios'),
('b0000005-0000-0000-0000-000000000005', 'fac00003-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000001', '3', '2024-10-05 09:00:00-05', 'c0000003-0000-0000-0000-000000000003', 'elective', 1, 30, 'clinic', 'Surgical Clinic Room 4', 'Megan performed a thorough preop assessment for elective cholecystectomy. Good history, appropriate physical exam. Consent discussion was complete. She''s doing well with clinic evaluations.', 'web'),
('b0000005-0000-0000-0000-000000000005', 'fac00004-0000-0000-0000-000000000004', 'e0000011-0000-0000-0000-000000000011', '2', '2024-11-20 07:00:00-05', 'c0000001-0000-0000-0000-000000000001', 'elective', 2, NULL, 'ward', 'Ellison 12', 'Rounding with Megan on postop patients. She presented well and had appropriate plans. Needed prompting on fluid management for the pancreatitis patient. Learning curve appropriate for PGY-1.', 'mobile_ios');
