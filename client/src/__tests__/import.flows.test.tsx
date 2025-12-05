import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SurveyBuilderProvider, useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import aiFixture from './fixtures/aiSurvey.json';
import templateFixture from './fixtures/templateSurvey.json';
import existingFixture from './fixtures/existingSurvey.json';
import * as queryClientModule from '@/lib/queryClient';

const makeWrapper = (surveyId?: string) => {
  const client = new QueryClient();
  return ({ children }: any) => (
    <QueryClientProvider client={client}>
      <SurveyBuilderProvider surveyId={surveyId || 'new'}>{children}</SurveyBuilderProvider>
    </QueryClientProvider>
  );
};

describe('import flows', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('AI-generated survey populates title/desc/questions and sets dirty', async () => {
    sessionStorage.setItem('aiGeneratedSurvey', JSON.stringify(aiFixture));
    const wrapper = makeWrapper('new');
    const { result } = renderHook(() => useSurveyBuilder(), { wrapper });

    await waitFor(() => expect(result.current.survey.title).toBe('AI Generated Survey'));
    expect(result.current.survey.questions).toHaveLength(2);
    expect(result.current.isDirty).toBe(true);
  });

  it('template survey populates and sets dirty', async () => {
    sessionStorage.setItem('templateSurvey', JSON.stringify(templateFixture));
    const wrapper = makeWrapper('new');
    const { result } = renderHook(() => useSurveyBuilder(), { wrapper });

    await waitFor(() => expect(result.current.survey.title).toBe('Template Survey'));
    expect(result.current.survey.questions).toHaveLength(2);
    expect(result.current.isDirty).toBe(true);
  });

  it('existing survey loads from API and stays clean', async () => {
    const apiSpy = vi.spyOn(queryClientModule, 'apiRequest');
    apiSpy.mockResolvedValue({ json: async () => existingFixture } as any);

    const wrapper = makeWrapper('persisted-123');
    const { result } = renderHook(() => useSurveyBuilder(), { wrapper });

    await waitFor(() => expect(result.current.survey.title).toBe('Existing Survey'));
    expect(result.current.survey.questions).toHaveLength(2);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.survey.welcomeScreen.layout).toBe('left-aligned');
    expect(result.current.survey.surveyBody?.questionLayout).toBe('single');
  });
});
