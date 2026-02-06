/**
 * Residents API Tests
 */

import { describe, test, expect } from "bun:test";
import { fetchApi } from "../utils/test-client";

describe("Residents API", () => {
  describe("GET /api/residents", () => {
    test("returns list of active residents", async () => {
      const res = await fetchApi("/api/residents");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    test("each resident has required fields", async () => {
      const res = await fetchApi("/api/residents");
      const residents = await res.json();

      for (const resident of residents) {
        expect(resident.id).toBeDefined();
        expect(resident.user_id).toBeDefined();
        expect(resident.pgy_level).toBeDefined();
        expect(resident.status).toBe("active"); // Only active residents
        expect(resident.first_name).toBeDefined();
        expect(resident.last_name).toBeDefined();
        expect(resident.email).toBeDefined();
      }
    });

    test("residents are sorted by PGY level (desc) then last name", async () => {
      const res = await fetchApi("/api/residents");
      const residents = await res.json();

      // Verify sorting: higher PGY levels first
      for (let i = 1; i < residents.length; i++) {
        const prev = residents[i - 1];
        const curr = residents[i];
        const prevLevel = parseInt(prev.pgy_level.replace("PGY-", ""));
        const currLevel = parseInt(curr.pgy_level.replace("PGY-", ""));

        if (prevLevel === currLevel) {
          // Same PGY, should be sorted by last name
          expect(prev.last_name <= curr.last_name).toBe(true);
        } else {
          // Different PGY, higher should come first
          expect(prevLevel >= currLevel).toBe(true);
        }
      }
    });
  });

  describe("GET /api/residents/:id/progress", () => {
    let residentId: string;

    test("returns EPA progress for resident", async () => {
      // Get a resident ID first
      const listRes = await fetchApi("/api/residents");
      const residents = await listRes.json();
      residentId = residents[0].id;

      const res = await fetchApi(`/api/residents/${residentId}/progress`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.progress).toBeDefined();
      expect(Array.isArray(data.progress)).toBe(true);
      expect(data.stats).toBeDefined();
    });

    test("progress contains EPA details", async () => {
      const listRes = await fetchApi("/api/residents");
      const residents = await listRes.json();
      residentId = residents[0].id;

      const res = await fetchApi(`/api/residents/${residentId}/progress`);
      const data = await res.json();

      if (data.progress.length > 0) {
        const epa = data.progress[0];
        expect(epa.epa_id).toBeDefined();
        expect(epa.epa_number).toBeDefined();
        expect(epa.title).toBeDefined();
        expect(epa.category).toBeDefined();
        expect(typeof epa.total_assessments).toBe("number");
        expect(typeof epa.level_1).toBe("number");
        expect(typeof epa.level_2).toBe("number");
        expect(typeof epa.level_3).toBe("number");
        expect(typeof epa.level_4).toBe("number");
        expect(typeof epa.level_5).toBe("number");
      }
    });

    test("stats include requirement tracking", async () => {
      const listRes = await fetchApi("/api/residents");
      const residents = await listRes.json();
      residentId = residents[0].id;

      const res = await fetchApi(`/api/residents/${residentId}/progress`);
      const data = await res.json();

      expect(data.stats.total_assessments).toBeDefined();
      expect(data.stats.epas_assessed).toBeDefined();
      expect(data.stats.unique_assessors).toBeDefined();
      expect(data.stats.requirements_met).toBeDefined();
      expect(data.stats.requirements_total).toBeDefined();
    });

    test("returns 404 for non-existent resident", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const res = await fetchApi(`/api/residents/${fakeId}/progress`);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("Resident not found");
    });
  });

  describe("GET /api/residents/:id/unacknowledged", () => {
    test("returns unacknowledged assessments for resident", async () => {
      const listRes = await fetchApi("/api/residents");
      const residents = await listRes.json();
      const residentId = residents[0].id;

      const res = await fetchApi(`/api/residents/${residentId}/unacknowledged`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);

      // All should be unacknowledged
      for (const assessment of data) {
        expect(assessment.acknowledged).toBe(false);
      }
    });
  });
});
