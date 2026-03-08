import { describe, it, expect } from "vitest";

// Basic smoke test — the hook module should export correctly
describe("useAgentRun hook", () => {
  it("exports a function", async () => {
    const mod = await import("@/hooks/useAgentRun");
    expect(typeof mod.useAgentRun).toBe("function");
  });
});
