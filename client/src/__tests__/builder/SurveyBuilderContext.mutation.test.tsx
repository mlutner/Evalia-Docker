import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  SurveyBuilderProvider,
  useSurveyBuilder,
  type BuilderSurvey,
} from '@/contexts/SurveyBuilderContext';

// ─────────────────────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────────────────────

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(),
}));

// ─────────────────────────────────────────────────────────────
// Harness
// ─────────────────────────────────────────────────────────────

let lastContext: ReturnType<typeof useSurveyBuilder> | null = null;

function Harness() {
  // This will be reassigned on every render, so tests always see latest state
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ctx = useSurveyBuilder();
  lastContext = ctx;
  return null;
}

function renderWithBuilder() {
  const client = new QueryClient();
  render(
    <QueryClientProvider client={client}>
      <SurveyBuilderProvider>
        <Harness />
      </SurveyBuilderProvider>
    </QueryClientProvider>
  );
}

// ─────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────

describe('SurveyBuilderContext mutations', () => {
  beforeEach(() => {
    cleanup();
    lastContext = null;
  });

  it('initializes with an empty survey and no questions', () => {
    renderWithBuilder();
    expect(lastContext).not.toBeNull();

    const { survey, questions, isDirty } = lastContext!;
    expect(survey.title).toBe('Untitled Survey');
    expect(questions.length).toBe(0);
    expect(isDirty).toBe(false);
  });

  it('addQuestion adds a question with proper defaults and order', () => {
    renderWithBuilder();
    const ctx = lastContext!;
    expect(ctx.questions.length).toBe(0);

    act(() => {
      ctx.addQuestion('text');
      ctx.addQuestion('multiple_choice');
    });

    const { questions } = lastContext!;
    expect(questions.length).toBe(2);

    const [q1, q2] = questions;

    expect(q1.id).toBeTruthy();
    expect(q1.type).toBe('text');
    expect(q1.order).toBe(0);
    expect(q1.text).toBeTruthy();

    expect(q2.type).toBe('multiple_choice');
    expect(q2.order).toBe(1);

    // selectedQuestionId should be last added question
    expect(lastContext!.selectedQuestionId).toBe(q2.id);
  });

  it('addQuestion does not exceed 200 questions', () => {
    renderWithBuilder();
    const ctx = lastContext!;

    act(() => {
      for (let i = 0; i < 205; i++) {
        ctx.addQuestion('text');
      }
    });

    const { questions } = lastContext!;
    expect(questions.length).toBe(200);
    expect(questions[0].order).toBe(0);
    expect(questions[199].order).toBe(199);
  });

  it('removeQuestion removes the question and reorders remaining questions', () => {
    renderWithBuilder();
    const ctx = lastContext!;

    act(() => {
      ctx.addQuestion('text');
      ctx.addQuestion('text');
      ctx.addQuestion('text');
    });

    const ids = lastContext!.questions.map((q) => q.id);
    const middleId = ids[1];

    // Select the middle question for extra check
    act(() => {
      ctx.setSelectedQuestionId(middleId);
    });
    expect(lastContext!.selectedQuestionId).toBe(middleId);

    // Remove the middle question
    act(() => {
      ctx.removeQuestion(middleId);
    });

    const { questions, selectedQuestionId } = lastContext!;
    expect(questions.length).toBe(2);
    expect(questions.some((q) => q.id === middleId)).toBe(false);

    // Orders should be normalized again
    expect(questions[0].order).toBe(0);
    expect(questions[1].order).toBe(1);

    // Selected question should be cleared if the selected one was removed
    expect(selectedQuestionId).toBeNull();
  });

  it('reorderQuestions moves the question and updates order indices', () => {
    renderWithBuilder();
    const ctx = lastContext!;

    act(() => {
      ctx.addQuestion('text'); // index 0
      ctx.addQuestion('multiple_choice'); // index 1
      ctx.addQuestion('rating'); // index 2
    });

    const beforeIds = lastContext!.questions.map((q) => q.id);

    // Move first question to index 2
    act(() => {
      ctx.reorderQuestions(0, 2);
    });

    const after = lastContext!.questions;
    const afterIds = after.map((q) => q.id);

    expect(after.length).toBe(3);
    // Confirm it is a permutation (same IDs)
    expect(new Set(afterIds)).toEqual(new Set(beforeIds));
    // Confirm the first ID moved to end
    expect(afterIds[2]).toBe(beforeIds[0]);

    // Orders should be 0,1,2 in new order
    expect(after[0].order).toBe(0);
    expect(after[1].order).toBe(1);
    expect(after[2].order).toBe(2);
  });

  it('updateQuestion updates only the targeted question', () => {
    renderWithBuilder();
    const ctx = lastContext!;

    act(() => {
      ctx.addQuestion('text');
      ctx.addQuestion('multiple_choice');
    });

    const [first, second] = lastContext!.questions;
    const firstId = first.id;
    const secondId = second.id;

    act(() => {
      ctx.updateQuestion(firstId, {
        text: 'Updated question text',
        required: true,
      });
    });

    const { questions } = lastContext!;
    const updatedFirst = questions.find((q) => q.id === firstId)!;
    const untouchedSecond = questions.find((q) => q.id === secondId)!;

    expect(updatedFirst.text).toBe('Updated question text');
    expect(updatedFirst.required).toBe(true);

    // Ensure second question was not mutated
    expect(untouchedSecond.id).toBe(secondId);
    expect(untouchedSecond.text).toBe(second.text);
    expect(untouchedSecond.required).toBe(second.required);
  });

  it('updateWelcomeScreen and updateSurveyBody mutate only their segments', () => {
    renderWithBuilder();
    const ctx = lastContext!;

    const original = ctx.survey;

    act(() => {
      ctx.updateWelcomeScreen({
        title: 'New Welcome Title',
        showQuestionCount: false,
      });
      ctx.updateSurveyBody({
        showProgressBar: false,
        questionLayout: 'single',
      });
    });

    const { survey } = lastContext!;

    // Welcome screen changed
    expect(survey.welcomeScreen.title).toBe('New Welcome Title');
    expect(survey.welcomeScreen.showQuestionCount).toBe(false);

    // Body settings changed
    expect(survey.surveyBody?.showProgressBar).toBe(false);
    expect(survey.surveyBody?.questionLayout).toBe('single');

    // Other core fields unchanged
    expect(survey.id).toBe(original.id);
    expect(survey.title).toBe(original.title);
  });
});
