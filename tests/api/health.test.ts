/**
 * Health Check API Tests
 */

import { describe, test, expect } from "bun:test";
import { getBaseUrl, fetchApi } from "../utils/test-client";

describe("Health Check", () => {
  test("GET / returns API info", async () => {
    const res = await fetchApi("/");
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.name).toBe("RMS API");
    expect(data.version).toBeDefined();
    expect(data.status).toBeOneOf(["ok", "degraded"]);
    expect(data.database).toBeOneOf(["connected", "disconnected"]);
  });

  test("GET / with database connected shows ok status", async () => {
    const res = await fetchApi("/");
    const data = await res.json();

    // If we can run tests, DB should be connected
    expect(data.status).toBe("ok");
    expect(data.database).toBe("connected");
  });
});
