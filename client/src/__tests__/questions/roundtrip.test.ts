import { describe, it, expect } from "vitest";
import { allQuestionFixtures } from "../../../../tests/fixtures/all-question-types";
import { normalizeQuestion } from "@shared/questionNormalization";
import { evaliaToBuilder, builderToEvalia } from "@/contexts/SurveyBuilderContext";

describe("Question round-trip through builder adapters", () => {
  it("preserves type and stays valid after evalia->builder->evalia", () => {
    allQuestionFixtures.forEach((q, idx) => {
      const builder = evaliaToBuilder(q as any, idx);
      const back = builderToEvalia(builder);

      expect(back.type).toBe(q.type);
      expect(() => normalizeQuestion(back)).not.toThrow();
    });
  });
});
