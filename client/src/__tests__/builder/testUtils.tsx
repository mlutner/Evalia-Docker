import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, act } from '@testing-library/react';
import { SurveyBuilderProvider, useSurveyBuilder } from '@/contexts/SurveyBuilderContext';

export interface BuilderTestHarnessProps {
  surveyId?: string;
  children?: ReactNode;
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function renderWithBuilder(
  ui?: ReactNode,
  { surveyId = 'new' }: { surveyId?: string } = {}
) {
  const queryClient = createTestQueryClient();

  const Wrapper: React.FC<{ children?: ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <SurveyBuilderProvider surveyId={surveyId}>
        {children}
      </SurveyBuilderProvider>
    </QueryClientProvider>
  );

  return {
    ...render(ui ?? <></>, { wrapper: Wrapper }),
    queryClient,
  };
}

// Expose context to tests without RTL component boilerplate
export function captureBuilderContext() {
  let latest: ReturnType<typeof useSurveyBuilder> | null = null;

  const Consumer: React.FC = () => {
    const ctx = useSurveyBuilder();
    latest = ctx;
    return null;
  };

  function getContext() {
    if (!latest) {
      throw new Error('Builder context not captured yet');
    }
    return latest;
  }

  return { Consumer, getContext, act };
}
