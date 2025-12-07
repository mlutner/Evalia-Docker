import { describe, it, expect } from 'vitest';
import type { Question as EvaliaQuestion } from '@shared/schema';
import { evaliaToBuilder, builderToEvalia } from '@/contexts/SurveyBuilderContext';

describe('Adapter round-trip with scoring and logic', () => {
  it('preserves scoring and logic fields through Evalia ↔ Builder', () => {
    const evaliaQuestions: EvaliaQuestion[] = [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: 'Pick one',
        options: ['A', 'B'],
        scorable: true,
        scoreWeight: 2,
        scoringCategory: 'engagement',
        optionScores: { A: 1, B: 3 },
        logicRules: [
          { id: 'r1', condition: 'answer("q2") >= 3', action: 'skip', targetQuestionId: 'q3' },
        ],
      } as EvaliaQuestion,
      {
        id: 'q2',
        type: 'rating',
        question: 'Rate',
        ratingScale: 5,
        scorable: true,
        scoreWeight: 1,
      } as EvaliaQuestion,
    ];

    const builder = evaliaQuestions.map((q, idx) => evaliaToBuilder(q, idx));
    const roundTripped = builder.map(builderToEvalia);

    expect(roundTripped[0].scorable).toBe(true);
    expect(roundTripped[0].scoreWeight).toBe(2);
    expect(roundTripped[0].scoringCategory).toBe('engagement');
    expect(roundTripped[0].optionScores).toEqual({ A: 1, B: 3 });
    expect(roundTripped[0].logicRules).toEqual([
      { id: 'r1', condition: 'answer("q2") >= 3', action: 'skip', targetQuestionId: 'q3' },
    ]);

    expect(roundTripped[1].ratingScale).toBe(5);
    expect(roundTripped[1].scorable).toBe(true);
  });
});
