/**
 * EPA Assessments API Tests
 */

import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { fetchApi } from "../utils/test-client";

describe("EPA Assessments API", () => {
  // Store IDs for use across tests
  let testResidentId: string;
  let testFacultyId: string;
  let testEpaId: string;
  let createdAssessmentId: string;

  beforeAll(async () => {
    // Get test data IDs
    const [residentsRes, facultyRes, epasRes] = await Promise.all([
      fetchApi("/api/residents"),
      fetchApi("/api/faculty"),
      fetchApi("/api/epas"),
    ]);

    const residents = await residentsRes.json();
    const faculty = await facultyRes.json();
    const epas = await epasRes.json();

    testResidentId = residents[0]?.id;
    testFacultyId = faculty[0]?.id;
    testEpaId = epas[0]?.id;
  });

  describe("GET /api/assessments", () => {
    test("returns list of assessments", async () => {
      const res = await fetchApi("/api/assessments");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    test("each assessment has required fields", async () => {
      const res = await fetchApi("/api/assessments");
      const assessments = await res.json();

      if (assessments.length > 0) {
        const assessment = assessments[0];
        expect(assessment.id).toBeDefined();
        expect(assessment.entrustment_level).toBeDefined();
        expect(assessment.assessment_date).toBeDefined();
        expect(assessment.epa_id).toBeDefined();
        expect(assessment.epa_number).toBeDefined();
        expect(assessment.resident_id).toBeDefined();
        expect(assessment.resident_first_name).toBeDefined();
        expect(assessment.faculty_id).toBeDefined();
        expect(assessment.faculty_first_name).toBeDefined();
      }
    });

    test("assessments are sorted by date descending", async () => {
      const res = await fetchApi("/api/assessments");
      const assessments = await res.json();

      if (assessments.length > 1) {
        const dates = assessments.map(
          (a: { assessment_date: string }) => new Date(a.assessment_date).getTime()
        );
        for (let i = 1; i < dates.length; i++) {
          expect(dates[i - 1] >= dates[i]).toBe(true);
        }
      }
    });

    test("filters by resident_id", async () => {
      const res = await fetchApi(`/api/assessments?resident_id=${testResidentId}`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);

      for (const assessment of data) {
        expect(assessment.resident_id).toBe(testResidentId);
      }
    });

    test("filters by faculty_id", async () => {
      const res = await fetchApi(`/api/assessments?faculty_id=${testFacultyId}`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);

      for (const assessment of data) {
        expect(assessment.faculty_id).toBe(testFacultyId);
      }
    });

    test("filters by epa_id", async () => {
      const res = await fetchApi(`/api/assessments?epa_id=${testEpaId}`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);

      for (const assessment of data) {
        expect(assessment.epa_id).toBe(testEpaId);
      }
    });

    test("respects limit parameter", async () => {
      const res = await fetchApi("/api/assessments?limit=5");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.length).toBeLessThanOrEqual(5);
    });
  });

  describe("POST /api/assessments", () => {
    test("creates a new assessment", async () => {
      const newAssessment = {
        resident_id: testResidentId,
        faculty_id: testFacultyId,
        epa_id: testEpaId,
        entrustment_level: "3",
        narrative_feedback: "Test assessment from API test suite",
        case_urgency: "elective",
        location_type: "or",
      };

      const res = await fetchApi("/api/assessments", {
        method: "POST",
        body: JSON.stringify(newAssessment),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.id).toBeDefined();
      expect(data.message).toBe("Assessment created");

      // Store for later tests
      createdAssessmentId = data.id;
    });

    test("creates assessment with minimal required fields", async () => {
      const minimalAssessment = {
        resident_id: testResidentId,
        faculty_id: testFacultyId,
        epa_id: testEpaId,
        entrustment_level: "2",
      };

      const res = await fetchApi("/api/assessments", {
        method: "POST",
        body: JSON.stringify(minimalAssessment),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.id).toBeDefined();
    });
  });

  describe("GET /api/assessments/:id", () => {
    test("returns single assessment with full details", async () => {
      // Get an assessment ID first
      const listRes = await fetchApi("/api/assessments?limit=1");
      const assessments = await listRes.json();

      if (assessments.length === 0) {
        // Skip if no assessments
        return;
      }

      const assessmentId = assessments[0].id;
      const res = await fetchApi(`/api/assessments/${assessmentId}`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.id).toBe(assessmentId);
      expect(data.entrustment_level).toBeDefined();
      expect(data.epa_number).toBeDefined();
      expect(data.epa_title).toBeDefined();
      expect(data.resident_first_name).toBeDefined();
      expect(data.faculty_first_name).toBeDefined();
    });

    test("returns 404 for non-existent assessment", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const res = await fetchApi(`/api/assessments/${fakeId}`);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("Assessment not found");
    });
  });

  describe("PATCH /api/assessments/:id/acknowledge", () => {
    test("acknowledges an assessment", async () => {
      // Create a fresh assessment to acknowledge
      const newAssessment = {
        resident_id: testResidentId,
        faculty_id: testFacultyId,
        epa_id: testEpaId,
        entrustment_level: "3",
      };

      const createRes = await fetchApi("/api/assessments", {
        method: "POST",
        body: JSON.stringify(newAssessment),
      });
      const { id: assessmentId } = await createRes.json();

      // Acknowledge it
      const res = await fetchApi(`/api/assessments/${assessmentId}/acknowledge`, {
        method: "PATCH",
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe(assessmentId);
      expect(data.acknowledged).toBe(true);
      expect(data.acknowledged_at).toBeDefined();
    });

    test("returns 404 for non-existent assessment", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const res = await fetchApi(`/api/assessments/${fakeId}/acknowledge`, {
        method: "PATCH",
      });

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("Assessment not found");
    });
  });
});
