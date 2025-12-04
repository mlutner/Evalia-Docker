import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SurveyView from "@/pages/SurveyView";

const invalidSurvey = {
  id: "bad-runtime",
  title: "Bad Runtime",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  questions: [{ id: "q1", type: "text" }], // missing question text
};

vi.mock("wouter", () => ({
  useParams: () => ({ id: "bad-runtime" }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({
    data: invalidSurvey,
    isLoading: false,
    error: null,
  })),
  useMutation: () => ({
    mutate: vi.fn(),
    isLoading: false,
  }),
  QueryClientProvider: ({ children }: any) => children,
  QueryClient: class {},
}));

vi.mock("@/lib/queryClient", () => ({
  apiRequest: vi.fn(),
  queryClient: { invalidateQueries: vi.fn() },
}));

vi.mock("@/hooks/useNormalizedTheme", () => ({
  useNormalizedTheme: () => ({ headerImageUrl: null, backgroundImageUrl: null }),
}));

vi.mock("@/components/SurveyLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/pages/SurveyWelcome", () => ({
  __esModule: true,
  default: () => <div data-testid="welcome-mock" />,
}));

describe("SurveyView handles invalid questions gracefully", () => {
  it("renders an error screen instead of crashing", async () => {
    render(<SurveyView />);
    expect(await screen.findByTestId("text-runtime-error")).toBeInTheDocument();
  });
});
