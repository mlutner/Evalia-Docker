import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { allQuestionFixtures } from "../../../../tests/fixtures/all-question-types";
import { QuestionRenderer } from "@/components/surveys/QuestionRenderer";

// Polyfill ResizeObserver for Radix components used in render tree
if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

describe("QuestionRenderer renders all question fixtures", () => {
  it("renders each question without crashing", () => {
    allQuestionFixtures.forEach((q) => {
      const { unmount } = render(
        <QuestionRenderer
          question={q as any}
          mode="preview"
          value={undefined}
          onChange={() => {}}
        />
      );
      // If render throws, the test will fail. Explicit expectation keeps vitest quiet.
      expect(true).toBe(true);
      unmount();
    });
  });
});
