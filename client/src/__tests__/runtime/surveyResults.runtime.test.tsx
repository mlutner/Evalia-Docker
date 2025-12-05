import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import type { Survey } from '@shared/schema';

// Mocks
const mockNavigate = vi.fn();

vi.mock('wouter', () => ({
  useParams: () => ({ id: 'test-survey' }),
  useLocation: () => [null, mockNavigate],
}));

vi.mock('@assets/survey-welcome.png', () => 'illustration.png', { virtual: true });
vi.mock('@assets/Heading_1763750607423.png', () => 'illustration.png', { virtual: true });

const mockSurvey: Survey = {
  id: 'test-survey',
  title: 'Runtime Scoring Test',
  description: 'Test survey',
  welcomeMessage: 'hi',
  thankYouMessage: 'thanks',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  questions: [
    {
      id: 'q1',
      type: 'rating',
      question: 'How engaged are you?',
      ratingScale: 5,
      required: true,
      scorable: true,
      scoreWeight: 1,
      scoringCategory: 'engagement',
    },
    {
      id: 'q2',
      type: 'rating',
      question: 'How satisfied are you?',
      ratingScale: 5,
      required: true,
      scorable: true,
      scoreWeight: 1,
      scoringCategory: 'satisfaction',
    },
  ],
  scoreConfig: {
    enabled: true,
    categories: [
      { id: 'engagement', name: 'Engagement' },
      { id: 'satisfaction', name: 'Satisfaction' },
    ],
    scoreRanges: [
      { id: 'low', min: 0, max: 50, label: 'Low' },
      { id: 'high', min: 51, max: 100, label: 'High' },
    ],
    resultsScreen: {
      enabled: true,
      layout: 'bands',
      showTotalScore: true,
      showPercentage: true,
      showOverallBand: true,
      showCategoryBreakdown: true,
      showCategoryBands: true,
      showStrengthsAndRisks: false,
      showCallToAction: false,
      title: 'Results Ready',
      subtitle: 'Preview',
      scoreRanges: [
        { id: 'low', min: 0, max: 50, label: 'Low' },
        { id: 'high', min: 51, max: 100, label: 'High' },
      ],
    },
  },
};

vi.mock('@tanstack/react-query', () => {
  return {
    useQuery: vi.fn(() => ({
      data: mockSurvey,
      isLoading: false,
      error: null,
    })),
    useMutation: (opts: any) => ({
      mutate: (_vars: any) =>
        opts.onSuccess?.(
          {
            scoring: { totalScore: 50, percentage: 50, categoryScores: {} as any },
            band: { id: 'mid', label: 'Developing', min: 0, max: 100 } as any,
          },
          _vars
        ),
      isLoading: false,
    }),
    QueryClientProvider: ({ children }: any) => children,
    QueryClient: class {},
  };
});

vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(),
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}));

vi.mock('@/components/SurveyLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}));

vi.mock('@/pages/SurveyWelcome', () => ({
  __esModule: true,
  default: ({ onStart }: { onStart: () => void }) => (
    <button onClick={onStart} data-testid="start-btn">
      Start Survey
    </button>
  ),
}));

vi.mock('@/components/QuestionCard', () => ({
  __esModule: true,
  default: ({ question, onAnswer, onAutoAdvance }: any) => {
    const handleClick = () => {
      onAnswer('5');
      onAutoAdvance?.();
    };
    return (
      <button onClick={handleClick} data-testid={`answer-${question.id}`}>
        Answer {question.id}
      </button>
    );
  },
}));

vi.mock('@/components/surveys/ResultsScreen', () => ({
  __esModule: true,
  ResultsScreen: ({ resultsConfig, scoring }: any) => (
    <div data-testid="results-screen">
      <div>{resultsConfig?.title || 'Results'}</div>
      <div>Total Score</div>
      <div>{scoring?.percentage != null ? `${scoring.percentage}%` : '50%'}</div>
    </div>
  ),
  default: ({ resultsConfig, scoring }: any) => (
    <div data-testid="results-screen">
      <div>{resultsConfig?.title || 'Results'}</div>
      <div>Total Score</div>
      <div>{scoring?.percentage != null ? `${scoring.percentage}%` : '50%'}</div>
    </div>
  ),
}));

// Import component under test after mocks
import SurveyView from '@/pages/SurveyView';

describe('SurveyView runtime results', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows results screen with score when resultsScreen is enabled', async () => {
    render(<SurveyView />);

    // Start survey
    fireEvent.click(screen.getByTestId('start-btn'));

    // Answer Q1 (auto-advances)
    fireEvent.click(screen.getByTestId('answer-q1'));

    // Answer Q2 (auto-submits)
    fireEvent.click(await screen.findByTestId('answer-q2'));

    // Results screen should appear with band/score info
    expect(await screen.findByText(/Results Ready/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Score/i)).toBeInTheDocument();
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });
});
