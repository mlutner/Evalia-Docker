import request from "supertest";
import express from "express";
import { vi, beforeAll, afterEach } from "vitest";

// Provide a dummy DB URL before any module loads
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/testdb";

// Mock storage to avoid pulling in the real database
vi.mock("../storage", () => ({ storage: {} as any }));

// Mock the AI service to avoid network calls and DB dependencies
const suggestScoringConfigMock = vi.fn(async () => ({
  categories: [{ id: "cat1", name: "Cat 1" }],
  scoreRanges: [
    { category: "cat1", label: "Low", minScore: 0, maxScore: 5, interpretation: "" },
  ],
}));

vi.mock("../aiService", () => ({
  suggestScoringConfig: suggestScoringConfigMock,
}));

let app: express.Express;

beforeAll(async () => {
  const aiRoutes = (await import("../routes/ai")).default;
  app = express();
  app.use(express.json());
  app.use("/api", aiRoutes);
});

afterEach(() => {
  suggestScoringConfigMock.mockClear();
});

describe("/api/generate-scoring-config", () => {
  const validBody = {
    surveyTitle: "Assessment Survey",
    questions: [
      { id: "q1", question: "How are you?", type: "multiple_choice", options: ["Good", "Bad"], required: true },
      { id: "q2", question: "Rate", type: "rating", ratingScale: 5, required: true },
    ],
  };

  it("accepts a valid suggestion", async () => {
    const res = await request(app)
      .post("/api/generate-scoring-config")
      .send(validBody);
    expect(res.status).toBe(200);
    expect(res.body?.config?.categories?.length).toBeGreaterThan(0);
  });

  it("rejects suggestions containing forbidden scoring fields", async () => {
    // Override mock to include forbidden field
    suggestScoringConfigMock.mockResolvedValueOnce({
      categories: [{ id: "cat1", name: "Cat 1" }],
      scoreRanges: [
        { category: "cat1", label: "Low", minScore: 0, maxScore: 5, interpretation: "" },
      ],
      scoringEngineId: "forbidden",
    } as any);

    const res = await request(app)
      .post("/api/generate-scoring-config")
      .send(validBody);
    expect(res.status).toBe(400);
    expect(res.body?.error).toBeDefined();
  });
});
