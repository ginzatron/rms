/**
 * RMS - Residency Management System
 *
 * Backend API server using Hono + Bun + PostgreSQL
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { sql, checkConnection } from "./db/connection";

// Initialize Hono app
const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors());

// ============================================
// Health Check
// ============================================

app.get("/", async (c) => {
  const dbOk = await checkConnection();
  return c.json({
    name: "RMS API",
    version: "0.2.0",
    status: dbOk ? "ok" : "degraded",
    database: dbOk ? "connected" : "disconnected",
  });
});

// ============================================
// Users API
// ============================================

app.get("/api/users", async (c) => {
  const users = await sql`
    SELECT
      id,
      first_name,
      last_name,
      email,
      role,
      photo_url
    FROM users
    WHERE is_active = true
    ORDER BY last_name, first_name
  `;

  return c.json(users);
});

app.get("/api/users/:id", async (c) => {
  const id = c.req.param("id");

  const [user] = await sql`
    SELECT
      id,
      first_name,
      last_name,
      email,
      role,
      photo_url
    FROM users
    WHERE id = ${id} AND is_active = true
  `;

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  // Get resident data if applicable
  const [resident] = await sql`
    SELECT id, pgy_level, status, medical_school
    FROM residents
    WHERE user_id = ${id}
  `;

  // Get faculty data if applicable
  const [faculty] = await sql`
    SELECT id, rank, is_core_faculty, can_assess
    FROM faculty
    WHERE user_id = ${id} AND is_active = true
  `;

  return c.json({
    ...user,
    resident: resident || null,
    faculty: faculty || null,
  });
});

// ============================================
// Residents API
// ============================================

app.get("/api/residents", async (c) => {
  const residents = await sql`
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
  `;

  return c.json(residents);
});

app.get("/api/residents/:id/progress", async (c) => {
  const id = c.req.param("id");

  // Get EPA progress
  const progress = await sql`
    SELECT
      e.id as epa_id,
      e.epa_number,
      e.title,
      e.short_name,
      e.category,
      COUNT(ea.id) as total_assessments,
      SUM(CASE WHEN ea.entrustment_level = '1' THEN 1 ELSE 0 END)::int as level_1,
      SUM(CASE WHEN ea.entrustment_level = '2' THEN 1 ELSE 0 END)::int as level_2,
      SUM(CASE WHEN ea.entrustment_level = '3' THEN 1 ELSE 0 END)::int as level_3,
      SUM(CASE WHEN ea.entrustment_level = '4' THEN 1 ELSE 0 END)::int as level_4,
      SUM(CASE WHEN ea.entrustment_level = '5' THEN 1 ELSE 0 END)::int as level_5,
      MAX(ea.entrustment_level) as highest_level,
      MAX(ea.assessment_date) as last_assessment
    FROM epa_definitions e
    LEFT JOIN epa_assessments ea ON ea.epa_id = e.id
      AND ea.resident_id = ${id}
      AND ea.deleted = false
    WHERE e.is_active = true
    GROUP BY e.id
    ORDER BY e.display_order
  `;

  // Get overall stats
  const [stats] = await sql`
    SELECT
      COUNT(*)::int as total_assessments,
      COUNT(DISTINCT epa_id)::int as epas_assessed,
      COUNT(DISTINCT faculty_id)::int as unique_assessors,
      AVG(entrustment_level::int) as avg_level
    FROM epa_assessments
    WHERE resident_id = ${id} AND deleted = false
  `;

  return c.json({ progress, stats });
});

// ============================================
// Faculty API
// ============================================

app.get("/api/faculty", async (c) => {
  const faculty = await sql`
    SELECT
      f.id,
      f.rank,
      f.is_core_faculty,
      f.can_assess,
      u.id as user_id,
      u.first_name,
      u.last_name,
      u.email,
      u.photo_url
    FROM faculty f
    JOIN users u ON u.id = f.user_id
    WHERE f.is_active = true AND f.can_assess = true
    ORDER BY u.last_name
  `;

  return c.json(faculty);
});

// ============================================
// EPAs API
// ============================================

app.get("/api/epas", async (c) => {
  const epas = await sql`
    SELECT
      id,
      epa_number,
      title,
      short_name,
      category,
      display_order
    FROM epa_definitions
    WHERE is_active = true
    ORDER BY display_order
  `;

  return c.json(epas);
});

// ============================================
// Clinical Sites API
// ============================================

app.get("/api/clinical-sites", async (c) => {
  const sites = await sql`
    SELECT
      id,
      name,
      site_type
    FROM clinical_sites
    WHERE is_active = true
    ORDER BY site_type, name
  `;

  return c.json(sites);
});

// ============================================
// Rotations API
// ============================================

app.get("/api/rotations", async (c) => {
  const rotations = await sql`
    SELECT id, name
    FROM rotations
    WHERE is_active = true
    ORDER BY name
  `;

  return c.json(rotations);
});

// ============================================
// EPA Assessments API
// ============================================

app.get("/api/assessments", async (c) => {
  const residentId = c.req.query("resident_id");
  const facultyId = c.req.query("faculty_id");
  const epaId = c.req.query("epa_id");
  const limit = parseInt(c.req.query("limit") || "50");

  // Build dynamic query
  const assessments = await sql`
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
      e.epa_number,
      e.short_name as epa_name,
      e.category as epa_category,
      r.id as resident_id,
      r.pgy_level,
      u_res.first_name as resident_first_name,
      u_res.last_name as resident_last_name,
      f.id as faculty_id,
      u_fac.first_name as faculty_first_name,
      u_fac.last_name as faculty_last_name,
      cs.name as site_name
    FROM epa_assessments ea
    JOIN epa_definitions e ON e.id = ea.epa_id
    JOIN residents r ON r.id = ea.resident_id
    JOIN users u_res ON u_res.id = r.user_id
    JOIN faculty f ON f.id = ea.faculty_id
    JOIN users u_fac ON u_fac.id = f.user_id
    LEFT JOIN clinical_sites cs ON cs.id = ea.clinical_site_id
    WHERE ea.deleted = false
      AND (${residentId}::uuid IS NULL OR ea.resident_id = ${residentId}::uuid)
      AND (${facultyId}::uuid IS NULL OR ea.faculty_id = ${facultyId}::uuid)
      AND (${epaId}::uuid IS NULL OR ea.epa_id = ${epaId}::uuid)
    ORDER BY ea.assessment_date DESC
    LIMIT ${limit}
  `;

  return c.json(assessments);
});

app.get("/api/assessments/:id", async (c) => {
  const id = c.req.param("id");

  const [assessment] = await sql`
    SELECT
      ea.*,
      e.epa_number,
      e.title as epa_title,
      e.short_name as epa_short_name,
      e.category as epa_category,
      r.pgy_level,
      u_res.first_name as resident_first_name,
      u_res.last_name as resident_last_name,
      u_fac.first_name as faculty_first_name,
      u_fac.last_name as faculty_last_name,
      cs.name as site_name
    FROM epa_assessments ea
    JOIN epa_definitions e ON e.id = ea.epa_id
    JOIN residents r ON r.id = ea.resident_id
    JOIN users u_res ON u_res.id = r.user_id
    JOIN faculty f ON f.id = ea.faculty_id
    JOIN users u_fac ON u_fac.id = f.user_id
    LEFT JOIN clinical_sites cs ON cs.id = ea.clinical_site_id
    WHERE ea.id = ${id} AND ea.deleted = false
  `;

  if (!assessment) {
    return c.json({ error: "Assessment not found" }, 404);
  }

  return c.json(assessment);
});

app.post("/api/assessments", async (c) => {
  const body = await c.req.json();

  const [result] = await sql`
    INSERT INTO epa_assessments (
      resident_id,
      faculty_id,
      epa_id,
      entrustment_level,
      assessment_date,
      clinical_site_id,
      rotation_id,
      case_urgency,
      patient_asa_class,
      procedure_duration_min,
      location_type,
      location_details,
      clinical_context,
      narrative_feedback,
      entry_method
    ) VALUES (
      ${body.resident_id},
      ${body.faculty_id},
      ${body.epa_id},
      ${body.entrustment_level},
      ${body.assessment_date || new Date().toISOString()},
      ${body.clinical_site_id || null},
      ${body.rotation_id || null},
      ${body.case_urgency || null},
      ${body.patient_asa_class || null},
      ${body.procedure_duration_min || null},
      ${body.location_type || null},
      ${body.location_details || null},
      ${body.clinical_context || null},
      ${body.narrative_feedback || null},
      ${body.entry_method || 'web'}
    )
    RETURNING id
  `;

  return c.json({ id: result.id, message: "Assessment created" }, 201);
});

// ============================================
// Start Server
// ============================================

const port = parseInt(process.env.PORT || "3000");

console.log(`
╔═══════════════════════════════════════════════╗
║     RMS - Residency Management System         ║
║     API Server (PostgreSQL)                   ║
╠═══════════════════════════════════════════════╣
║  Server running at http://localhost:${port}      ║
║                                               ║
║  Endpoints:                                   ║
║    GET  /                     - Health check  ║
║    GET  /api/users                            ║
║    GET  /api/residents                        ║
║    GET  /api/residents/:id/progress           ║
║    GET  /api/faculty                          ║
║    GET  /api/epas                             ║
║    GET  /api/clinical-sites                   ║
║    GET  /api/rotations                        ║
║    GET  /api/assessments                      ║
║    POST /api/assessments                      ║
╚═══════════════════════════════════════════════╝
`);

export default {
  port,
  fetch: app.fetch,
};
