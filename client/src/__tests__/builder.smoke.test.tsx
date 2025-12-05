import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SurveyBuilderV2 from '@/pages/SurveyBuilderV2';
import * as queryClientModule from '@/lib/queryClient';

// Smoke test to catch crashes on initial render

describe('Builder smoke', () => {
  it('renders with new survey and shows welcome text', async () => {
    vi.spyOn(queryClientModule, 'apiRequest').mockResolvedValue({ json: async () => null } as any);

    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <SurveyBuilderV2 />
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Welcome to our survey/i)).toBeInTheDocument();
  });
});
