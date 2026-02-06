/**
 * Faculty API Tests
 */

import { describe, test, expect } from "bun:test";
import { fetchApi } from "../utils/test-client";

describe("Faculty API", () => {
  describe("GET /api/faculty", () => {
    test("returns list of faculty who can assess", async () => {
      const res = await fetchApi("/api/faculty");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    test("each faculty member has required fields", async () => {
      const res = await fetchApi("/api/faculty");
      const faculty = await res.json();

      for (const member of faculty) {
        expect(member.id).toBeDefined();
        expect(member.user_id).toBeDefined();
        expect(member.rank).toBeDefined();
        expect(typeof member.is_core_faculty).toBe("boolean");
        expect(member.can_assess).toBe(true); // Only assessors returned
        expect(member.first_name).toBeDefined();
        expect(member.last_name).toBeDefined();
        expect(member.email).toBeDefined();
      }
    });

    test("faculty are sorted by last name", async () => {
      const res = await fetchApi("/api/faculty");
      const faculty = await res.json();

      const lastNames = faculty.map((f: { last_name: string }) => f.last_name);
      const sorted = [...lastNames].sort();
      expect(lastNames).toEqual(sorted);
    });
  });
});
