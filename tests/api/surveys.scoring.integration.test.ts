import express from "express";
import request from "supertest";
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import type { Survey } from "@shared/schema";

let responseRoutes: any;
let storage: any;
let app: express.Express;

beforeAll(async () => {
  process.env.DATABASE_URL = process.env.DATABASE_URL || "postgres://example.com/test";
  responseRoutes = (await import("../../server/routes/responses")).default;
  storage = (await import("../../server/storage")).storage;
  app = express().use(express.json()).use("/api/surveys", responseRoutes);
});

describe("Survey scoring integration", () => {
  const bands = [
    { id: "low", min: 0, max: 49, label: "Low" },
    { id: "high", min: 50, max: 100, label: "High" },
  ];

  const scoredSurvey: Survey = {
    id: "s-integration-1",
    userId: "u-1",
    title: "Integration Scored survey",
    description: "",
    status: "Active",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "Pick",
        options: ["A", "B"],
        required: true,
        scorable: true,
        scoringCategory: "eng",
        optionScores: { A: 1, B: 5 },
      },
    ] as any,
    scoreConfig: {
      enabled: true,
      categories: [{ id: "eng", name: "Engagement" }],
      scoreRanges: bands,
      resultsScreen: {
        enabled: true,
        layout: "simple",
        showTotalScore: true,
        showPercentage: true,
        showOverallBand: true,
        showCategoryBreakdown: true,
        showCategoryBands: true,
        showStrengthsAndRisks: false,
        showCallToAction: false,
        scoreRanges: bands,
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const thankYouSurvey: Survey = {
    ...scoredSurvey,
    id: "s-integration-2",
    scoreConfig: {
      enabled: false,
      categories: [],
      scoreRanges: [],
      resultsScreen: {
        enabled: false,
        layout: "simple",
        showTotalScore: false,
        showPercentage: false,
        showOverallBand: false,
        showCategoryBreakdown: false,
        showCategoryBands: false,
        showStrengthsAndRisks: false,
        showCallToAction: false,
        scoreRanges: [],
      },
    },
  };

  beforeEach(() => {
    vi.spyOn(storage, "getSurvey").mockReset();
    vi.spyOn(storage, "createResponse").mockReset();
  });

  it("returns scoring payload and band when scoring is enabled", async () => {
    (storage.getSurvey as any).mockResolvedValue(scoredSurvey);
    (storage.createResponse as any).mockResolvedValue({
      id: "r-integration-1",
      surveyId: scoredSurvey.id,
      answers: { q1: "B" },
      scoringEngineId: "engagement_v1",
    });

    const res = await request(app)
      .post(`/api/surveys/${scoredSurvey.id}/responses`)
      .send({ answers: { q1: "B" } })
      .expect(201);

    expect(res.body.scoring).toBeDefined();
    expect(res.body.band?.id).toBe("high");
    expect(JSON.stringify(res.body)).not.toContain("scoringEngineId");
  });

  it("omits scoring when scoring is disabled (Thank You path)", async () => {
    (storage.getSurvey as any).mockResolvedValue(thankYouSurvey);
    (storage.createResponse as any).mockResolvedValue({
      id: "r-integration-2",
      surveyId: thankYouSurvey.id,
      answers: { q1: "A" },
    });

    const res = await request(app)
      .post(`/api/surveys/${thankYouSurvey.id}/responses`)
      .send({ answers: { q1: "A" } })
      .expect(201);

    expect(res.body.scoring).toBeUndefined();
    expect(res.body.band).toBeUndefined();
  });
});
