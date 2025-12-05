import { describe, it, expect } from "vitest";
import type { Question, SurveyScoreConfig } from "@shared/schema";
import { scoreSurvey } from "../scoringEngineV1";
import { resolveBand } from "../resolveBand";

const bands = [
  { id: "at-risk", min: 0, max: 49, label: "At Risk" },
  { id: "vulnerable", min: 50, max: 69, label: "Vulnerable" },
  { id: "healthy", min: 70, max: 100, label: "Healthy" },
];

const scoreConfig: SurveyScoreConfig = {
  enabled: true,
  categories: [
    { id: "engagement", name: "Engagement" },
    { id: "enablement", name: "Enablement" },
  ],
  scoreRanges: bands,
  resultsScreen: {
    enabled: true,
    layout: "bands",
    showTotalScore: true,
    showPercentage: true,
    showOverallBand: true,
    showCategoryBreakdown: true,
    showCategoryBands: true,
    showStrengthsAndRisks: false,
    showCallToAction: false,
    scoreRanges: bands,
  },
};

const questions: Question[] = [
  { id: "q1", type: "rating", question: "Recommend", ratingScale: 5, scorable: true, scoreWeight: 1, scoringCategory: "engagement" },
  { id: "q2", type: "rating", question: "Proud", ratingScale: 5, scorable: true, scoreWeight: 1, scoringCategory: "engagement" },
  { id: "q3", type: "rating", question: "Tools", ratingScale: 5, scorable: true, scoreWeight: 1, scoringCategory: "enablement" },
];

describe("engagement_v1 scoring – golden tests", () => {
  it("produces stable results for the happy path", () => {
    const responses = { q1: 4, q2: 5, q3: 3 };

    const result = scoreSurvey({ questions, responses, scoreConfig });

    expect(result.totalScore).toBe(12);
    expect(result.maxScore).toBe(15);
    expect(result.percentage).toBeCloseTo(80);
    expect(result.byCategory.engagement.score).toBe(9);
    expect(result.byCategory.engagement.maxScore).toBe(10);
    expect(result.byCategory.enablement.score).toBe(3);
    expect(result.byCategory.enablement.maxScore).toBe(5);

    const band = resolveBand(result.percentage, scoreConfig);
    expect(band?.id).toBe("healthy");
  });

  it("resolves lower band for weaker responses", () => {
    const responses = { q1: 2, q2: 2, q3: 1 };

    const result = scoreSurvey({ questions, responses, scoreConfig });

    expect(result.totalScore).toBe(5);
    expect(result.maxScore).toBe(15);
    expect(result.percentage).toBeCloseTo(33.333, 2);
    const band = resolveBand(result.percentage, scoreConfig);
    expect(band?.id).toBe("at-risk");
  });
});
