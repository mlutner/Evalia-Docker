import { describe, it, expect } from 'vitest';
import { scoreSurvey } from '@shared/scoringEngine';
import type { Question, SurveyScoreConfig } from '@shared/schema';
import { normalizeScoringConfig } from '@/utils/normalizeScoringConfig';

describe('results + scoring integration (bands)', () => {
  it('computes total and category scores with bands intact', () => {
    const questions: Question[] = [
      {
        id: 'eng1',
        type: 'rating',
        question: 'Engagement',
        ratingScale: 5,
        scorable: true,
        scoringCategory: 'engagement',
        scoreWeight: 1,
      },
      {
        id: 'sat1',
        type: 'rating',
        question: 'Satisfaction',
        ratingScale: 5,
        scorable: true,
        scoringCategory: 'satisfaction',
        scoreWeight: 1,
      },
    ];

    const scoreConfig: SurveyScoreConfig = {
      enabled: true,
      categories: [
        { id: 'engagement', name: 'Engagement' },
        { id: 'satisfaction', name: 'Satisfaction' },
      ],
      scoreRanges: [
        { id: 'low', min: 0, max: 4, label: 'Low' },
        { id: 'medium', min: 5, max: 7, label: 'Medium' },
        { id: 'high', min: 8, max: 10, label: 'High' },
      ],
      resultsScreen: {
        enabled: true,
        layout: 'bands',
        showTotalScore: true,
        showPercentage: true,
        showOverallBand: true,
        showCategoryBreakdown: true,
        showCategoryBands: true,
        showStrengthsAndRisks: true,
        showCallToAction: false,
        scoreRanges: [
          { id: 'low', min: 0, max: 40, label: 'Low' },
          { id: 'medium', min: 41, max: 70, label: 'Medium' },
          { id: 'high', min: 71, max: 100, label: 'High' },
        ],
      },
    };

    const responses = { eng1: 5, sat1: 5 };
    const result = scoreSurvey({ questions, responses, scoreConfig });

    expect(result.totalScore).toBe(10);
    expect(result.maxScore).toBe(10);
    expect(result.percentage).toBe(100);
    expect(result.byCategory.engagement.score).toBe(5);
    expect(result.byCategory.satisfaction.score).toBe(5);

    const normalized = normalizeScoringConfig(scoreConfig);
    expect(normalized?.scoreRanges).toEqual(scoreConfig.scoreRanges);
    expect(normalized?.resultsScreen?.scoreRanges).toEqual(scoreConfig.resultsScreen?.scoreRanges);
  });
});
