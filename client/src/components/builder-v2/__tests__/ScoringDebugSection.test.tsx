/**
 * ScoringDebugSection Tests
 * 
 * [SCORING-DEBUG] Minimal tests for the scoring debug component.
 * Ensures it renders correctly and handles edge cases.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ScoringDebugSection } from '../ScoringDebugSection';

// Mock import.meta.env.DEV to true for tests
vi.stubGlobal('import.meta', { env: { DEV: true } });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('ScoringDebugSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders only in dev mode', () => {
    render(
      <ScoringDebugSection surveyId="test-123" />,
      { wrapper }
    );
    
    expect(screen.getByText('Scoring Debug')).toBeInTheDocument();
    expect(screen.getByText('DEV ONLY')).toBeInTheDocument();
  });

  it('shows message when no surveyId provided', () => {
    render(
      <ScoringDebugSection surveyId={undefined} />,
      { wrapper }
    );
    
    expect(screen.getByText(/Save survey first/i)).toBeInTheDocument();
  });

  it('shows expand/collapse toggle', () => {
    render(
      <ScoringDebugSection surveyId="test-123" />,
      { wrapper }
    );
    
    expect(screen.getByText('Expand')).toBeInTheDocument();
    expect(screen.getByText(/Click "Expand" to load/i)).toBeInTheDocument();
  });

  it('does not crash with empty surveyId string', () => {
    render(
      <ScoringDebugSection surveyId="" />,
      { wrapper }
    );
    
    // Should show the "save survey first" message for empty string
    expect(screen.getByText(/Save survey first/i)).toBeInTheDocument();
  });
});

