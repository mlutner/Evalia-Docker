import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SurveyBuilderProvider, useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import * as queryClientModule from '@/lib/queryClient';

  const makeWrapper = () => {
    const client = new QueryClient();
    return ({ children }: any) => (
      <QueryClientProvider client={client}>
        <SurveyBuilderProvider surveyId="new">{children}</SurveyBuilderProvider>
      </QueryClientProvider>
    );
  };

describe('SurveyBuilder store ops', () => {
  beforeEach(() => {
    // fresh state per test
  });

  it('add/remove/reorder update order and selection', () => {
    const wrapper = makeWrapper();
    const { result } = renderHook(() => useSurveyBuilder(), { wrapper });

    act(() => result.current.addQuestion('text'));
    act(() => result.current.addQuestion('multiple_choice'));

    expect(result.current.questions).toHaveLength(2);
    expect(result.current.questions.map(q => q.order)).toEqual([0, 1]);

    const idToRemove = result.current.questions[0].id;
    act(() => result.current.removeQuestion(idToRemove));
    expect(result.current.questions).toHaveLength(1);
    expect(result.current.questions[0].order).toBe(0);

    act(() => result.current.addQuestion('text'));
    act(() => result.current.reorderQuestions(0, 1));
    expect(result.current.questions.map(q => q.order)).toEqual([0, 1]);
  });

  it('update welcome/scoring only touches their subtree', () => {
    const wrapper = makeWrapper();
    const { result } = renderHook(() => useSurveyBuilder(), { wrapper });

    act(() => result.current.updateWelcomeScreen({ title: 'Hi' }));
    expect(result.current.survey.welcomeScreen.title).toBe('Hi');
  });

  it('lifecycle: new survey saves via POST then switches to PUT with persisted id', async () => {
    const wrapper = makeWrapper();
    const apiSpy = vi.spyOn(queryClientModule, 'apiRequest');
    apiSpy.mockResolvedValueOnce({ json: async () => ({ id: 'new-id' }) } as any); // first save POST
    apiSpy.mockResolvedValueOnce({ json: async () => ({ id: 'new-id' }) } as any); // second save PUT

    const { result } = renderHook(() => useSurveyBuilder(), { wrapper });

    expect(result.current.survey.id).toContain('survey-'); // transient id

    await act(async () => { await result.current.saveSurvey(); });
    expect(apiSpy).toHaveBeenNthCalledWith(1, 'POST', '/api/surveys', expect.anything());
    expect(result.current.survey.id).toBe('new-id');

    await act(async () => { await result.current.saveSurvey(); });
    expect(apiSpy).toHaveBeenNthCalledWith(2, 'PUT', '/api/surveys/new-id', expect.anything());
  });
});
