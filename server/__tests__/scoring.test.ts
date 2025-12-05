import { describe, it, expect } from 'vitest';
import { scoreSurvey } from '@shared/scoringEngine';
import type { Question, SurveyScoreConfig } from '@shared/schema';

describe('backend scoring', () => {
  it('correctly scores simple survey', () => {
    const questions: Question[] = [
      {
        id: 'q1',
        type: 'rating',
        question: 'How engaged are you?',
        ratingScale: 5,
        scorable: true,
        scoreWeight: 1,
        scoringCategory: 'engagement',
      },
    ];

    const scoreConfig: SurveyScoreConfig = {
      enabled: true,
      categories: [],
      scoreRanges: [],
    };

    const responses = { q1: 4 };

    const result = scoreSurvey({
      questions,
      responses,
      scoreConfig,
    });

    expect(result.totalScore).toBe(4);
    expect(result.maxScore).toBe(5);
  });
});
