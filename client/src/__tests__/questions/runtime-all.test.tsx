import React from "react";
import { describe, it, beforeEach, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import type { Survey } from "@shared/schema";
import { allQuestionFixtures } from "../../../../tests/fixtures/all-question-types";

const mockNavigate = vi.fn();

vi.mock("wouter", () => ({
  useParams: () => ({ id: "all-questions" }),
  useLocation: () => [null, mockNavigate],
}));

const surveyWithAllQuestions: Survey = {
  id: "all-questions",
  title: "All Questions Survey",
  description: "Covers every question type",
  welcomeMessage: "Welcome",
  thankYouMessage: "Thanks!",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  questions: allQuestionFixtures,
  scoreConfig: undefined,
};

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({
    data: surveyWithAllQuestions,
    isLoading: false,
    error: null,
  })),
  useMutation: (opts: any) => ({
    mutate: (_vars: any) => opts.onSuccess?.({}, _vars),
    isLoading: false,
  }),
  QueryClientProvider: ({ children }: any) => children,
  QueryClient: class {},
}));

vi.mock("@/lib/queryClient", () => ({
  apiRequest: vi.fn(),
  queryClient: { invalidateQueries: vi.fn() },
}));

vi.mock("@/components/SurveyLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}));

vi.mock("@/pages/SurveyWelcome", () => ({
  __esModule: true,
  default: ({ onStart }: { onStart: () => void }) => (
    <button onClick={onStart} data-testid="start-all">
      Start All Questions
    </button>
  ),
}));

vi.mock("@/components/QuestionCard", () => ({
  __esModule: true,
  default: ({ question, onAnswer, onAutoAdvance }: any) => (
    <button
      data-testid={`answer-${question.id}`}
      onClick={() => {
        onAnswer("test");
        onAutoAdvance?.();
      }}
    >
      Answer {question.id}
    </button>
  ),
}));

// Component under test
import SurveyView from "@/pages/SurveyView";

describe("SurveyView runtime with all question fixtures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders and completes without crashing", async () => {
    render(<SurveyView />);

    // Start survey
    fireEvent.click(screen.getByTestId("start-all"));

    // Answer each question via mocked QuestionCard buttons
    for (const q of allQuestionFixtures) {
      const btn = await screen.findByTestId(`answer-${q.id}`);
      fireEvent.click(btn);
    }

    // Should reach thank you screen (since scoreConfig disabled)
    expect(await screen.findByTestId("text-thank-you-message")).toBeInTheDocument();
  });
});
