import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SurveyBuilderProvider, useSurveyBuilder } from '@/contexts/SurveyBuilderContext';

const wrapper = ({ children }: any) => {
  const client = new QueryClient();
  return (
    <QueryClientProvider client={client}>
      <SurveyBuilderProvider surveyId="new">{children}</SurveyBuilderProvider>
    </QueryClientProvider>
  );
};

describe('Question invariants and selection', () => {
  it('maintains unique ids and contiguous order on add/remove/reorder', () => {
    const { result } = renderHook(() => useSurveyBuilder(), { wrapper });

    act(() => result.current.addQuestion('text'));
    act(() => result.current.addQuestion('multiple_choice'));
    act(() => result.current.addQuestion('rating'));

    const ids = result.current.questions.map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(result.current.questions.map(q => q.order)).toEqual([0, 1, 2]);

    // Reorder last to first
    act(() => result.current.reorderQuestions(2, 0));
    expect(result.current.questions.map(q => q.order)).toEqual([0, 1, 2]);

    // Remove middle
    const removeId = result.current.questions[1].id;
    act(() => result.current.removeQuestion(removeId));
    expect(result.current.questions.map(q => q.order)).toEqual([0, 1]);
  });

  it('updateQuestion only touches targeted question', () => {
    const { result } = renderHook(() => useSurveyBuilder(), { wrapper });

    act(() => result.current.addQuestion('text'));
    act(() => result.current.addQuestion('text'));
    const [first, second] = result.current.questions;

    act(() => result.current.updateQuestion(first.id, { text: 'Changed' }));
    expect(result.current.questions.find(q => q.id === first.id)?.text).toBe('Changed');
    expect(result.current.questions.find(q => q.id === second.id)?.text).not.toBe('Changed');
  });

  it('selection updates on add/remove', () => {
    const { result } = renderHook(() => useSurveyBuilder(), { wrapper });
    act(() => result.current.addQuestion('text'));
    const addedId = result.current.selectedQuestionId;
    expect(addedId).toBeTruthy();

    act(() => result.current.removeQuestion(addedId!));
    expect(result.current.selectedQuestionId).toBeNull();
  });
});
