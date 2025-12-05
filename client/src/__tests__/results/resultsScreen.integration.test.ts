import { describe, it, expect } from 'vitest';
import { scoreSurvey } from '@shared/scoringEngine';
import type { Question, SurveyScoreConfig } from '@shared/schema';

describe('results + scoring integration', () => {
  it('computes bands for total and categories', () => {
    const questions: Question[] = [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: 'Engagement',
        options: ['Low', 'High'],
        scorable: true,
        scoringCategory: 'engagement',
        optionScores: { Low: 1, High: 5 },
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: 'Satisfaction',
        options: ['Low', 'High'],
        scorable: true,
        scoringCategory: 'satisfaction',
        optionScores: { Low: 1, High: 5 },
      },
    ];

    const responses = { q1: 'High', q2: 'High' };

    const scoreConfig: SurveyScoreConfig = {
      enabled: true,
      categories: [
        { id: 'engagement', name: 'Engagement' },
        { id: 'satisfaction', name: 'Satisfaction' },
      ],
      scoreRanges: [
        { id: 'low', min: 0, max: 50, label: 'Low' },
        { id: 'high', min: 51, max: 100, label: 'High' },
      ],
      resultsScreen: {
        enabled: true,
        layout: 'bands',
        showTotalScore: true,
        showPercentage: true,
        showOverallBand: true,
        showCategoryBreakdown: true,
        showCategoryBands: true,
        showStrengthsAndRisks: false,
        showCallToAction: false,
      },
    };

    const result = scoreSurvey({ questions, responses, scoreConfig });
    expect(result.percentage).toBeGreaterThan(0);
    expect(result.byCategory.engagement.score).toBeGreaterThan(0);
  });
});
