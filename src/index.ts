/**
 * RMS - Residency Management System
 *
 * Backend API server using Hono + Bun
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { Database } from "bun:sqlite";

// Initialize database
const db = new Database("rms.db");

// Initialize Hono app
const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors());

// ============================================
// Health Check
// ============================================

app.get("/", (c) => {
  return c.json({
    name: "RMS API",
    version: "0.1.0",
    status: "ok",
  });
});

// ============================================
// Users API (for user selector auth)
// ============================================

app.get("/api/users", (c) => {
  const users = db
    .query(`
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.photo_url,
        GROUP_CONCAT(DISTINCT pm.role) as roles
      FROM users u
      LEFT JOIN program_memberships pm ON pm.user_id = u.id AND pm.is_active = 1
      WHERE u.is_active = 1
      GROUP BY u.id
      ORDER BY u.last_name, u.first_name
    `)
    .all();

  return c.json(users);
});

app.get("/api/users/:id", (c) => {
  const id = c.req.param("id");

  const user = db
    .query(`
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.photo_url
      FROM users u
      WHERE u.id = ? AND u.is_active = 1
    `)
    .get(id);

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  // Get roles
  const roles = db
    .query(`
      SELECT role, program_id, started_at
      FROM program_memberships
      WHERE user_id = ? AND is_active = 1
    `)
    .all(id);

  // Get resident data if applicable
  const resident = db
    .query(`
      SELECT id, pgy_level, status, medical_school
      FROM residents
      WHERE user_id = ?
    `)
    .get(id);

  // Get faculty data if applicable
  const faculty = db
    .query(`
      SELECT id, rank, is_core_faculty
      FROM faculty
      WHERE user_id = ? AND is_active = 1
    `)
    .get(id);

  return c.json({
    ...user,
    roles,
    resident,
    faculty,
  });
});

// ============================================
// Residents API
// ============================================

app.get("/api/residents", (c) => {
  const residents = db
    .query(`
      SELECT
        r.id,
        r.pgy_level,
        r.status,
        r.medical_school,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.photo_url
      FROM residents r
      JOIN users u ON u.id = r.user_id
      WHERE r.status = 'active'
      ORDER BY r.pgy_level DESC, u.last_name
    `)
    .all();

  return c.json(residents);
});

// ============================================
// Faculty API
// ============================================

app.get("/api/faculty", (c) => {
  const faculty = db
    .query(`
      SELECT
        f.id,
        f.rank,
        f.is_core_faculty,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.photo_url
      FROM faculty f
      JOIN users u ON u.id = f.user_id
      WHERE f.is_active = 1
      ORDER BY u.last_name
    `)
    .all();

  return c.json(faculty);
});

// ============================================
// EPAs API
// ============================================

app.get("/api/epas", (c) => {
  const epas = db
    .query(`
      SELECT id, name, short_name, category, display_order
      FROM epas
      WHERE specialty_code = 'general_surgery'
      ORDER BY display_order
    `)
    .all();

  return c.json(epas);
});

// ============================================
// Clinical Sites API
// ============================================

app.get("/api/clinical-sites", (c) => {
  const sites = db
    .query(`
      SELECT
        cs.id,
        cs.name,
        cs.site_classification,
        i.name as institution_name
      FROM clinical_sites cs
      JOIN institutions i ON i.id = cs.institution_id
      WHERE cs.is_active = 1
      ORDER BY cs.site_classification, cs.name
    `)
    .all();

  return c.json(sites);
});

// ============================================
// EPA Assessments API
// ============================================

// List assessments (with filters)
app.get("/api/assessments", (c) => {
  const residentId = c.req.query("resident_id");
  const assessorId = c.req.query("assessor_id");
  const epaId = c.req.query("epa_id");
  const limit = parseInt(c.req.query("limit") || "50");

  let query = `
    SELECT
      ea.id,
      ea.entrustment_level,
      ea.assessment_date,
      ea.case_urgency,
      ea.location_type,
      ea.location_details,
      ea.narrative_feedback,
      ea.acknowledged,
      e.id as epa_id,
      e.short_name as epa_name,
      e.category as epa_category,
      r.id as resident_id,
      u_res.first_name as resident_first_name,
      u_res.last_name as resident_last_name,
      res.pgy_level,
      f.id as assessor_id,
      u_fac.first_name as assessor_first_name,
      u_fac.last_name as assessor_last_name,
      cs.name as site_name
    FROM epa_assessments ea
    JOIN epas e ON e.id = ea.epa_id
    JOIN residents r ON r.id = ea.resident_id
    JOIN residents res ON res.id = ea.resident_id
    JOIN users u_res ON u_res.id = r.user_id
    JOIN faculty f ON f.id = ea.assessor_id
    JOIN users u_fac ON u_fac.id = f.user_id
    LEFT JOIN clinical_sites cs ON cs.id = ea.clinical_site_id
    WHERE ea.deleted = 0
  `;

  const params: any[] = [];

  if (residentId) {
    query += ` AND ea.resident_id = ?`;
    params.push(residentId);
  }

  if (assessorId) {
    query += ` AND ea.assessor_id = ?`;
    params.push(assessorId);
  }

  if (epaId) {
    query += ` AND ea.epa_id = ?`;
    params.push(parseInt(epaId));
  }

  query += ` ORDER BY ea.assessment_date DESC LIMIT ?`;
  params.push(limit);

  const assessments = db.query(query).all(...params);

  return c.json(assessments);
});

// Get single assessment
app.get("/api/assessments/:id", (c) => {
  const id = c.req.param("id");

  const assessment = db
    .query(`
      SELECT
        ea.*,
        e.name as epa_name,
        e.short_name as epa_short_name,
        e.category as epa_category,
        u_res.first_name as resident_first_name,
        u_res.last_name as resident_last_name,
        res.pgy_level,
        u_fac.first_name as assessor_first_name,
        u_fac.last_name as assessor_last_name,
        cs.name as site_name,
        i.name as institution_name
      FROM epa_assessments ea
      JOIN epas e ON e.id = ea.epa_id
      JOIN residents r ON r.id = ea.resident_id
      JOIN residents res ON res.id = ea.resident_id
      JOIN users u_res ON u_res.id = r.user_id
      JOIN faculty f ON f.id = ea.assessor_id
      JOIN users u_fac ON u_fac.id = f.user_id
      LEFT JOIN clinical_sites cs ON cs.id = ea.clinical_site_id
      LEFT JOIN institutions i ON i.id = cs.institution_id
      WHERE ea.id = ? AND ea.deleted = 0
    `)
    .get(id);

  if (!assessment) {
    return c.json({ error: "Assessment not found" }, 404);
  }

  return c.json(assessment);
});

// Create assessment
app.post("/api/assessments", async (c) => {
  const body = await c.req.json();

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.run(
    `
    INSERT INTO epa_assessments (
      id, resident_id, assessor_id, epa_id, entrustment_level,
      assessment_date, submission_date,
      clinical_site_id, case_urgency, patient_asa_class,
      procedure_duration_min, location_type, location_details,
      narrative_feedback, entry_method
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      id,
      body.resident_id,
      body.assessor_id,
      body.epa_id,
      body.entrustment_level,
      body.assessment_date || now,
      now,
      body.clinical_site_id || null,
      body.case_urgency || null,
      body.patient_asa_class || null,
      body.procedure_duration_min || null,
      body.location_type || null,
      body.location_details || null,
      body.narrative_feedback || null,
      body.entry_method || "web",
    ]
  );

  return c.json({ id, message: "Assessment created" }, 201);
});

// ============================================
// Resident Progress API
// ============================================

app.get("/api/residents/:id/progress", (c) => {
  const id = c.req.param("id");

  // Get all EPAs with assessment counts and levels
  const progress = db
    .query(`
      SELECT
        e.id as epa_id,
        e.name,
        e.short_name,
        e.category,
        COUNT(ea.id) as total_assessments,
        SUM(CASE WHEN ea.entrustment_level = 1 THEN 1 ELSE 0 END) as level_1,
        SUM(CASE WHEN ea.entrustment_level = 2 THEN 1 ELSE 0 END) as level_2,
        SUM(CASE WHEN ea.entrustment_level = 3 THEN 1 ELSE 0 END) as level_3,
        SUM(CASE WHEN ea.entrustment_level = 4 THEN 1 ELSE 0 END) as level_4,
        SUM(CASE WHEN ea.entrustment_level = 5 THEN 1 ELSE 0 END) as level_5,
        MAX(ea.entrustment_level) as highest_level,
        MAX(ea.assessment_date) as last_assessment
      FROM epas e
      LEFT JOIN epa_assessments ea ON ea.epa_id = e.id
        AND ea.resident_id = ?
        AND ea.deleted = 0
      WHERE e.specialty_code = 'general_surgery'
      GROUP BY e.id
      ORDER BY e.display_order
    `)
    .all(id);

  // Get overall stats
  const stats = db
    .query(`
      SELECT
        COUNT(*) as total_assessments,
        COUNT(DISTINCT epa_id) as epas_assessed,
        COUNT(DISTINCT assessor_id) as unique_assessors,
        AVG(entrustment_level) as avg_level
      FROM epa_assessments
      WHERE resident_id = ? AND deleted = 0
    `)
    .get(id);

  return c.json({ progress, stats });
});

// ============================================
// Start Server
// ============================================

const port = process.env.PORT || 3000;

console.log(`
╔═══════════════════════════════════════════════╗
║     RMS - Residency Management System         ║
║     API Server                                ║
╠═══════════════════════════════════════════════╣
║  Server running at http://localhost:${port}      ║
║                                               ║
║  Endpoints:                                   ║
║    GET  /api/users                            ║
║    GET  /api/residents                        ║
║    GET  /api/faculty                          ║
║    GET  /api/epas                             ║
║    GET  /api/clinical-sites                   ║
║    GET  /api/assessments                      ║
║    POST /api/assessments                      ║
║    GET  /api/residents/:id/progress           ║
╚═══════════════════════════════════════════════╝
`);

export default {
  port,
  fetch: app.fetch,
};
