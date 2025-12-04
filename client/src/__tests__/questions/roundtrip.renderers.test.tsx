import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { allQuestionFixtures } from "../../../../tests/fixtures/all-question-types";
import { evaliaToBuilder, builderToEvalia } from "@/contexts/SurveyBuilderContext";
import { QuestionRenderer } from "@/components/surveys/QuestionRenderer";

if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

describe("QuestionRenderer after builder roundtrip", () => {
  it("renders every question after evalia->builder->evalia", () => {
    allQuestionFixtures.forEach((q, idx) => {
      const builder = evaliaToBuilder(q as any, idx);
      const back = builderToEvalia(builder);

      const { unmount } = render(
        <QuestionRenderer question={back as any} mode="preview" value={undefined} onChange={() => {}} />
      );
      expect(true).toBe(true);
      unmount();
    });
  });
});
