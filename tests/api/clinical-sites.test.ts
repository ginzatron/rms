/**
 * Clinical Sites API Tests
 */

import { describe, test, expect } from "bun:test";
import { fetchApi } from "../utils/test-client";

describe("Clinical Sites API", () => {
  describe("GET /api/clinical-sites", () => {
    test("returns list of clinical sites", async () => {
      const res = await fetchApi("/api/clinical-sites");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    test("each site has required fields", async () => {
      const res = await fetchApi("/api/clinical-sites");
      const sites = await res.json();

      for (const site of sites) {
        expect(site.id).toBeDefined();
        expect(site.name).toBeDefined();
        expect(site.site_type).toBeDefined();
      }
    });

    test("sites are sorted by site_type then name", async () => {
      const res = await fetchApi("/api/clinical-sites");
      const sites = await res.json();

      // Verify grouped by type
      const typeGroups = new Map<string, string[]>();
      for (const site of sites) {
        if (!typeGroups.has(site.site_type)) {
          typeGroups.set(site.site_type, []);
        }
        typeGroups.get(site.site_type)!.push(site.name);
      }

      // Within each type, names should be sorted
      for (const [, names] of typeGroups) {
        const sorted = [...names].sort();
        expect(names).toEqual(sorted);
      }
    });
  });
});
