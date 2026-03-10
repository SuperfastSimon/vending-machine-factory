import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/cron/health/route";

describe("GET /api/cron/health", () => {
  it("returns health status with timestamp and checks", async () => {
    const res = await GET();
    const json = await res.json();
    // Status is "ok" (200) when DB is available, "degraded" (503) when not
    expect([200, 503]).toContain(res.status);
    expect(["ok", "degraded"]).toContain(json.status);
    expect(json.timestamp).toBeTruthy();
    expect(json.checks).toBeDefined();
    expect(json.checks.database).toBeDefined();
    expect(["ok", "error"]).toContain(json.checks.database.status);
  });
});
