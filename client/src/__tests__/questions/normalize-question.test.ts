import { describe, it, expect } from "vitest";
import { allQuestionFixtures } from "../../../../tests/fixtures/all-question-types";
import { normalizeQuestion } from "@shared/questionNormalization";

describe("normalizeQuestion covers all question types", () => {
  it("parses every fixture without throwing", () => {
    allQuestionFixtures.forEach((q) => {
      expect(() => normalizeQuestion(q)).not.toThrow();
    });
  });
});
