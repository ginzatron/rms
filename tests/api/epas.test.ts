/**
 * EPAs API Tests
 */

import { describe, test, expect } from "bun:test";
import { fetchApi } from "../utils/test-client";

describe("EPAs API", () => {
  describe("GET /api/epas", () => {
    test("returns list of EPA definitions", async () => {
      const res = await fetchApi("/api/epas");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    test("each EPA has required fields", async () => {
      const res = await fetchApi("/api/epas");
      const epas = await res.json();

      for (const epa of epas) {
        expect(epa.id).toBeDefined();
        expect(epa.epa_number).toBeDefined();
        expect(epa.title).toBeDefined();
        expect(epa.short_name).toBeDefined();
        expect(epa.category).toBeDefined();
        expect(epa.display_order).toBeDefined();
      }
    });

    test("EPAs are sorted by display_order", async () => {
      const res = await fetchApi("/api/epas");
      const epas = await res.json();

      const orders = epas.map((e: { display_order: number }) => e.display_order);
      const sorted = [...orders].sort((a, b) => a - b);
      expect(orders).toEqual(sorted);
    });

    test("EPA categories are valid", async () => {
      const validCategories = [
        "preoperative",
        "intraoperative",
        "postoperative",
        "longitudinal",
        "professional",
      ];

      const res = await fetchApi("/api/epas");
      const epas = await res.json();

      for (const epa of epas) {
        expect(validCategories).toContain(epa.category);
      }
    });
  });
});
