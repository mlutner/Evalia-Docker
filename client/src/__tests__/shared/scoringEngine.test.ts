import { describe, it, expect } from 'vitest';
import type { Question, SurveyScoreConfig } from '@shared/schema';
import { scoreQuestion, scoreSurvey } from '@shared/scoringEngine';

describe('scoringEngine', () => {
  it('scores multiple_choice with optionScores', () => {
    const q: Question = {
      id: 'q1',
      type: 'multiple_choice',
      question: 'Pick one',
      options: ['A', 'B'],
      scorable: true,
      optionScores: { A: 1, B: 3 },
    };

    const result = scoreQuestion({ question: q, answer: 'B' });
    expect(result.score).toBe(3);
    expect(result.maxScore).toBe(3);
  });

  it('scores checkbox by summing selected optionScores', () => {
    const q: Question = {
      id: 'q2',
      type: 'checkbox',
      question: 'Pick many',
      options: ['A', 'B', 'C'],
      scorable: true,
      optionScores: { A: 1, B: 2, C: -1 },
    };

    const result = scoreQuestion({ question: q, answer: ['A', 'B'] });
    expect(result.score).toBe(3);
    expect(result.maxScore).toBe(3); // only positive scores summed
  });

  it('scores rating with numeric answer and weight', () => {
    const q: Question = {
      id: 'q3',
      type: 'rating',
      question: 'Rate',
      ratingScale: 5,
      scorable: true,
      scoreWeight: 2,
    };
    const result = scoreQuestion({ question: q, answer: '4' });
    expect(result.score).toBe(8);
    expect(result.maxScore).toBe(10);
  });

  it('aggregates survey scores and categories', () => {
    const questions: Question[] = [
      {
        id: 'mc',
        type: 'multiple_choice',
        question: 'MC',
        options: ['A', 'B'],
        scorable: true,
        scoringCategory: 'engagement',
        optionScores: { A: 1, B: 2 },
      },
      {
        id: 'rate',
        type: 'rating',
        question: 'Rate',
        ratingScale: 5,
        scorable: true,
        scoringCategory: 'satisfaction',
        scoreWeight: 1,
      },
    ];

    const responses = {
      mc: 'B',
      rate: 5,
    };

    const scoreConfig: SurveyScoreConfig = {
      enabled: true,
      categories: [
        { id: 'engagement', name: 'Engagement' },
        { id: 'satisfaction', name: 'Satisfaction' },
      ],
      scoreRanges: [],
    };

    const result = scoreSurvey({ questions, responses, scoreConfig });

    expect(result.totalScore).toBe(7); // 2 + 5
    expect(result.maxScore).toBeGreaterThan(0);
    expect(result.byCategory.engagement.score).toBe(2);
    expect(result.byCategory.engagement.label).toBe('Engagement');
    expect(result.byCategory.satisfaction.score).toBe(5);
  });
});
