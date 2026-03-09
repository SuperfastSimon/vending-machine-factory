import { describe, it, expect } from "vitest";
import { productConfig, availableAgents } from "@/config/product";

describe("productConfig", () => {
  it("has required fields", () => {
    expect(productConfig.name).toBeTruthy();
    expect(productConfig.slug).toBeTruthy();
    expect(productConfig.agent.graphId).toBeTruthy();
    expect(productConfig.agent.libraryId).toBeTruthy();
  });

  it("has at least one pricing plan", () => {
    expect(productConfig.pricing.plans.length).toBeGreaterThan(0);
  });

  it("includes a free plan with 0 price", () => {
    const free = productConfig.pricing.plans.find((p) => p.id === "free");
    expect(free).toBeDefined();
    expect(free!.price).toBe(0);
  });

  it("all plans have credits", () => {
    for (const plan of productConfig.pricing.plans) {
      expect(plan.credits).toBeGreaterThanOrEqual(0);
    }
  });

  it("has credit packs with valid prices and credits", () => {
    expect(productConfig.pricing.creditPacks).toBeDefined();
    expect(productConfig.pricing.creditPacks!.length).toBeGreaterThan(0);
    for (const pack of productConfig.pricing.creditPacks!) {
      expect(pack.id).toBeTruthy();
      expect(pack.credits).toBeGreaterThan(0);
      expect(pack.price).toBeGreaterThan(0);
    }
  });
});

describe("availableAgents", () => {
  it("has at least one agent", () => {
    expect(Object.keys(availableAgents).length).toBeGreaterThan(0);
  });

  it("all agents have libraryId and graphId", () => {
    for (const [, agent] of Object.entries(availableAgents)) {
      expect(agent.libraryId).toBeTruthy();
      expect(agent.graphId).toBeTruthy();
    }
  });
});
