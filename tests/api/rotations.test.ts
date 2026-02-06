/**
 * Rotations API Tests
 */

import { describe, test, expect } from "bun:test";
import { fetchApi } from "../utils/test-client";

describe("Rotations API", () => {
  describe("GET /api/rotations", () => {
    test("returns list of rotations", async () => {
      const res = await fetchApi("/api/rotations");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    test("each rotation has required fields", async () => {
      const res = await fetchApi("/api/rotations");
      const rotations = await res.json();

      for (const rotation of rotations) {
        expect(rotation.id).toBeDefined();
        expect(rotation.name).toBeDefined();
      }
    });

    test("rotations are sorted by name", async () => {
      const res = await fetchApi("/api/rotations");
      const rotations = await res.json();

      const names = rotations.map((r: { name: string }) => r.name);
      const sorted = [...names].sort();
      expect(names).toEqual(sorted);
    });
  });
});
