import { describe, it, expect, beforeAll, vi } from "vitest";

// Prevent real DB connection during test
vi.mock("../db", () => ({
  db: {} as any,
}));

let MemStorage: any;

beforeAll(async () => {
  // Dynamically import after mocks are set up
  const mod = await import("../storage");
  MemStorage = mod.MemStorage;
});

describe("scoring engine id wiring", () => {
  it("defaults to engagement_v1 when not provided", async () => {
    const storage = new MemStorage();
    const response = await storage.createResponse("survey-1", { q1: "Yes" });
    expect(response.scoringEngineId).toBe("engagement_v1");
  });

  it("persists provided scoring engine id", async () => {
    const storage = new MemStorage();
    const response = await storage.createResponse("survey-2", { q1: "No" }, "engagement_v1");
    expect(response.scoringEngineId).toBe("engagement_v1");
  });
});
