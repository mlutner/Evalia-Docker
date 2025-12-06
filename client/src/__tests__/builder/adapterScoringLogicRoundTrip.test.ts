import { describe, it, expect } from 'vitest';
import type { Question as EvaliaQuestion } from '@shared/schema';
import { evaliaToBuilder, builderToEvalia } from '@/contexts/SurveyBuilderContext';

describe('evaliaToBuilder / builderToEvalia round-trip (scoring + logic)', () => {
  it('preserves scoring and logic fields through Evalia ↔ Builder', () => {
    const q1: EvaliaQuestion = {
      id: 'q1',
      type: 'multiple_choice',
      question: 'Pick one',
      options: ['A', 'B'],
      required: true,
      scorable: true,
      scoreWeight: 2,
      scoringCategory: 'engagement',
      optionScores: { A: 1, B: 3 },
      logicRules: [
        {
          id: 'r1',
          condition: 'answer("q2") >= 3',
          action: 'skip',
          targetQuestionId: 'q3',
        },
      ],
    };

    const q2: EvaliaQuestion = {
      id: 'q2',
      type: 'rating',
      question: 'Rate',
      ratingScale: 5,
      required: false,
      scorable: true,
      scoreWeight: 1,
    };

    const evaliaQuestions: EvaliaQuestion[] = [q1, q2];

    const builderQuestions = evaliaQuestions.map((q, idx) => evaliaToBuilder(q, idx));
    const roundTripped = builderQuestions.map(builderToEvalia);

    expect(roundTripped).toHaveLength(2);

    expect(roundTripped[0]).toMatchObject({
      id: 'q1',
      type: 'multiple_choice',
      question: 'Pick one',
      scorable: true,
      scoreWeight: 2,
      scoringCategory: 'engagement',
      optionScores: { A: 1, B: 3 },
      logicRules: [
        {
          id: 'r1',
          condition: 'answer("q2") >= 3',
          action: 'skip',
          targetQuestionId: 'q3',
        },
      ],
    });

    expect(roundTripped[1]).toMatchObject({
      id: 'q2',
      type: 'rating',
      question: 'Rate',
      ratingScale: 5,
      scorable: true,
      scoreWeight: 1,
    });
  });
});
