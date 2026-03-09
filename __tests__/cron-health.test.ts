import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/cron/health/route";

describe("GET /api/cron/health", () => {
  it("returns ok status", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("ok");
    expect(json.timestamp).toBeTruthy();
  });
});
