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
  it("renders 3-panel layout with categories and questions", () => {
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

    // Verify left panel shows categories (appears in both left panel and question badge)
    const engagementElements = screen.getAllByText("Engagement");
    expect(engagementElements.length).toBeGreaterThan(0);
    
    // Verify center panel shows "Scoring" header
    expect(screen.getByText("Scoring")).toBeInTheDocument();
    
    // Verify question appears in center panel
    expect(screen.getByText("How engaged are you?")).toBeInTheDocument();
  });

  it("displays categories and bands in left panel", () => {
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

    // Left panel shows both categories and bands
    const engagementElements = screen.getAllByText("Engagement");
    expect(engagementElements.length).toBeGreaterThan(0);
    
    expect(screen.getByText("Mid")).toBeInTheDocument();
    
    // Verify band range is displayed (50–74)
    expect(screen.getByText(/50/)).toBeInTheDocument();
    expect(screen.getByText(/74/)).toBeInTheDocument();
  });
});
