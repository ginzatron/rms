/**
 * Users API Tests
 */

import { describe, test, expect } from "bun:test";
import { fetchApi } from "../utils/test-client";

describe("Users API", () => {
  describe("GET /api/users", () => {
    test("returns list of active users", async () => {
      const res = await fetchApi("/api/users");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    test("each user has required fields", async () => {
      const res = await fetchApi("/api/users");
      const users = await res.json();

      for (const user of users) {
        expect(user.id).toBeDefined();
        expect(user.first_name).toBeDefined();
        expect(user.last_name).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.role).toBeDefined();
      }
    });

    test("users are sorted by last name", async () => {
      const res = await fetchApi("/api/users");
      const users = await res.json();

      const lastNames = users.map((u: { last_name: string }) => u.last_name);
      const sorted = [...lastNames].sort();
      expect(lastNames).toEqual(sorted);
    });
  });

  describe("GET /api/users/:id", () => {
    test("returns user with resident/faculty data", async () => {
      // First get a user ID
      const listRes = await fetchApi("/api/users");
      const users = await listRes.json();
      const userId = users[0].id;

      const res = await fetchApi(`/api/users/${userId}`);
      const user = await res.json();

      expect(res.status).toBe(200);
      expect(user.id).toBe(userId);
      expect(user.first_name).toBeDefined();
      expect(user.last_name).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.role).toBeDefined();
      // Should have resident or faculty data (or null for both)
      expect("resident" in user).toBe(true);
      expect("faculty" in user).toBe(true);
    });

    test("returns 404 for non-existent user", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const res = await fetchApi(`/api/users/${fakeId}`);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("User not found");
    });
  });
});
