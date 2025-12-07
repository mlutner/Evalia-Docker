import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import type { Survey } from "@shared/schema";

const mockNavigate = vi.fn();

vi.mock("wouter", () => ({
  useParams: () => ({ id: "test-survey" }),
  useLocation: () => [null, mockNavigate],
}));

const baseSurvey: Survey = {
  id: "test-survey",
  title: "Runtime Theme/Results Test",
  description: "Test survey",
  welcomeMessage: "hi",
  thankYouMessage: "thanks",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  questions: [
    {
      id: "q1",
      type: "rating",
      question: "How engaged are you?",
      ratingScale: 5,
      required: true,
      scorable: true,
      scoreWeight: 1,
      scoringCategory: "engagement",
    },
  ],
  scoreConfig: {
    enabled: true,
    categories: [{ id: "engagement", name: "Engagement" }],
    scoreRanges: [
      { id: "low", min: 0, max: 50, label: "Low" },
      { id: "high", min: 51, max: 100, label: "High" },
    ],
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
      title: "Results Ready",
      subtitle: "Preview",
      scoreRanges: [
        { id: "low", min: 0, max: 50, label: "Low" },
        { id: "high", min: 51, max: 100, label: "High" },
      ],
    },
  },
};

// Mocks
vi.mock("@tanstack/react-query", () => {
  return {
    useQuery: vi.fn(() => ({
      data: baseSurvey,
      isLoading: false,
      error: null,
    })),
    useMutation: (opts: any) => ({
      mutate: (_vars: any) =>
        opts.onSuccess?.(
          (baseSurvey as any).scoreConfig?.enabled
            ? {
                scoring: { totalScore: 50, percentage: 50, categoryScores: {} as any },
                band: { id: "mid", label: "Developing", min: 0, max: 100 } as any,
              }
            : {},
          _vars
        ),
      isLoading: false,
    }),
    QueryClientProvider: ({ children }: any) => children,
    QueryClient: class {},
  };
});

vi.mock("@/lib/queryClient", () => ({
  apiRequest: vi.fn(),
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}));

vi.mock("@/components/SurveyLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}));

vi.mock("@/pages/SurveyWelcome", () => ({
  __esModule: true,
  default: ({ onStart }: { onStart: () => void }) => (
    <button onClick={onStart} data-testid="start-btn">
      Start Survey
    </button>
  ),
}));

vi.mock("@/components/QuestionCard", () => ({
  __esModule: true,
  default: ({ question, onAnswer, onAutoAdvance }: any) => {
    const handleClick = () => {
      onAnswer("5");
      onAutoAdvance?.();
    };
    return (
      <button onClick={handleClick} data-testid={`answer-${question.id}`}>
        Answer {question.id}
      </button>
    );
  },
}));

vi.mock("@/components/surveys/ResultsScreen", () => ({
  __esModule: true,
  ResultsScreen: ({ resultsConfig, scoring }: any) => (
    <div data-testid="results-screen">
      <div>{resultsConfig?.title || "Results"}</div>
      <div>Total Score</div>
      <div>{scoring?.percentage != null ? `${scoring.percentage}%` : "50%"}</div>
    </div>
  ),
  default: ({ resultsConfig, scoring }: any) => (
    <div data-testid="results-screen">
      <div>{resultsConfig?.title || "Results"}</div>
      <div>Total Score</div>
      <div>{scoring?.percentage != null ? `${scoring.percentage}%` : "50%"}</div>
    </div>
  ),
}));

// Component under test
import SurveyView from "@/pages/SurveyView";

describe("SurveyView runtime theme + results branching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mutable survey fields between tests
    (baseSurvey as any).theme = undefined;
    (baseSurvey as any).scoreConfig = {
      enabled: true,
      categories: [{ id: "engagement", name: "Engagement" }],
      scoreRanges: [
        { id: "low", min: 0, max: 50, label: "Low" },
        { id: "high", min: 51, max: 100, label: "High" },
      ],
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
        title: "Results Ready",
        subtitle: "Preview",
        scoreRanges: [
          { id: "low", min: 0, max: 50, label: "Low" },
          { id: "high", min: 51, max: 100, label: "High" },
        ],
      },
    };
  });

  it("normalizes theme images and renders results when enabled + scoring present", async () => {
    // Provide nested theme images to exercise normalization
    (baseSurvey as any).theme = {
      headerImage: { url: "https://example.com/header.png" },
      backgroundImage: { url: "https://example.com/bg.png" },
    };

    render(<SurveyView />);

    // Start survey
    fireEvent.click(screen.getByTestId("start-btn"));
    // Answer (auto-advance/submit)
    fireEvent.click(await screen.findByTestId("answer-q1"));

    // Results should show (scoring present + resultsScreen enabled)
    expect(await screen.findByTestId("results-screen")).toBeInTheDocument();
  });

  it("shows Thank You when resultsScreen disabled even if scoring exists", async () => {
    (baseSurvey as any).scoreConfig = {
      ...baseSurvey.scoreConfig,
      resultsScreen: { ...baseSurvey.scoreConfig!.resultsScreen!, enabled: false },
    };

    render(<SurveyView />);

    fireEvent.click(screen.getByTestId("start-btn"));
    fireEvent.click(await screen.findByTestId("answer-q1"));

    expect(screen.queryByTestId("results-screen")).toBeNull();
    expect(screen.getByTestId("text-thank-you-message")).toBeInTheDocument();
  });

  it("shows Thank You when scoring is disabled (no scoring payload)", async () => {
    (baseSurvey as any).scoreConfig = { ...baseSurvey.scoreConfig, enabled: false };

    render(<SurveyView />);

    fireEvent.click(screen.getByTestId("start-btn"));
    fireEvent.click(await screen.findByTestId("answer-q1"));

    expect(screen.queryByTestId("results-screen")).toBeNull();
    expect(screen.getByTestId("text-thank-you-message")).toBeInTheDocument();
  });
});
