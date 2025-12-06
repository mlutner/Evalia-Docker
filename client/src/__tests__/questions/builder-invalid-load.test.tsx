import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SurveyBuilderProvider, useSurveyBuilder } from "@/contexts/SurveyBuilderContext";

const invalidSurvey = {
  id: "bad-survey",
  title: "Bad Survey",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  questions: [
    // Missing required "question" field to force normalization failure
    { id: "q1", type: "text" } as any,
  ],
};

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({
    data: invalidSurvey,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })),
  useMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
  QueryClientProvider: ({ children }: any) => children,
  QueryClient: class {},
}));

vi.mock("@/lib/queryClient", () => ({
  apiRequest: vi.fn(),
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}));

function LoadErrorProbe() {
  const { loadError } = useSurveyBuilder();
  return <div data-testid="load-error">{loadError || "no-error"}</div>;
}

describe("SurveyBuilderProvider handles invalid surveys gracefully", () => {
  it("does not crash and surfaces a load error", () => {
    render(
      <SurveyBuilderProvider surveyId="bad-survey">
        <LoadErrorProbe />
      </SurveyBuilderProvider>
    );

    expect(screen.getByTestId("load-error").textContent).toContain("invalid questions");
  });
});
