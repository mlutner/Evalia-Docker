import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScoringView } from "../../ScoringView";
import type {
  BuilderQuestion,
  QuestionScoringConfig,
  ScoringCategory,
  BuilderScoreBand,
} from "../../INTEGRATION_GUIDE";

function makeQuestion(id: string, text: string): BuilderQuestion {
  return {
    id,
    text,
    type: "multiple_choice",
    order: 0,
    required: true,
    hasLogic: false,
    displayType: "Multiple choice",
    question: text,
  } as BuilderQuestion;
}

const defaultProps = {
  onSelectQuestion: vi.fn(),
  onSelectCategory: vi.fn(),
  onSelectBand: vi.fn(),
  onChangeQuestionScoring: vi.fn(),
  onChangeCategory: vi.fn(),
  onChangeBand: vi.fn(),
  onClosePanel: vi.fn(),
  isAILoading: false,
};

describe("ScoringView", () => {
  it("renders tabs and mapping content", () => {
    const questions: BuilderQuestion[] = [makeQuestion("q1", "How engaged are you?")];
    const scoringByQuestionId: Record<string, QuestionScoringConfig> = {
      q1: { scorable: true, scoreWeight: 1, scoringCategory: "engagement" },
    };
    const categories: ScoringCategory[] = [
      { id: "engagement", name: "Engagement" } as ScoringCategory,
    ];
    const bands: BuilderScoreBand[] = [{ id: "mid", label: "Mid", min: 50, max: 74 } as BuilderScoreBand];

    render(
      <ScoringView
        questions={questions}
        scoringByQuestionId={scoringByQuestionId}
        categories={categories}
        bands={bands}
        selectedQuestionId={undefined}
        selectedCategoryId={undefined}
        selectedBandId={undefined}
        {...defaultProps}
      />
    );

    expect(screen.getByRole("button", { name: /Question Mapping/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Categories & Bands/i })).toBeInTheDocument();
  });

  it("switches to Categories & Bands tab", () => {
    const questions: BuilderQuestion[] = [makeQuestion("q1", "How engaged are you?")];
    const scoringByQuestionId: Record<string, QuestionScoringConfig> = {
      q1: { scorable: true, scoreWeight: 1, scoringCategory: "engagement" },
    };
    const categories: ScoringCategory[] = [
      { id: "engagement", name: "Engagement" } as ScoringCategory,
    ];
    const bands: BuilderScoreBand[] = [{ id: "mid", label: "Mid", min: 50, max: 74 } as BuilderScoreBand];

    render(
      <ScoringView
        questions={questions}
        scoringByQuestionId={scoringByQuestionId}
        categories={categories}
        bands={bands}
        selectedQuestionId={undefined}
        selectedCategoryId={undefined}
        selectedBandId={undefined}
        {...defaultProps}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Categories & Bands/i }));

    expect(screen.getAllByText(/Bands/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Engagement/i)).toBeInTheDocument();
    expect(screen.getByText(/Mid/i)).toBeInTheDocument();
  });
});
