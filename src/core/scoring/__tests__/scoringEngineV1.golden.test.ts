import { describe, it, expect } from 'vitest';
import type { Question, SurveyScoreConfig } from '@shared/schema';
import { scoreSurvey } from '../../scoring/scoringEngineV1';
import { resolveBand } from '../../scoring/resolveBand';

const bands = [
  { id: 'low', min: 0, max: 40, label: 'Low' },
  { id: 'mid', min: 41, max: 74, label: 'Mid' },
  { id: 'high', min: 75, max: 100, label: 'High' },
];

describe('scoringEngineV1 golden tests', () => {
  it('engagement survey high scores', () => {
    const questions: Question[] = [
      { id: 'q1', type: 'rating', question: 'Proud', ratingScale: 5, scorable: true, scoreWeight: 1, scoringCategory: 'engagement' },
      { id: 'q2', type: 'rating', question: 'Recommend', ratingScale: 5, scorable: true, scoreWeight: 1, scoringCategory: 'engagement' },
      { id: 'q3', type: 'rating', question: 'Resources', ratingScale: 5, scorable: true, scoreWeight: 1, scoringCategory: 'enablement' },
    ];
    const responses = { q1: 5, q2: 5, q3: 5 };
    const scoreConfig: SurveyScoreConfig = {
      enabled: true,
      categories: [
        { id: 'engagement', name: 'Engagement' },
        { id: 'enablement', name: 'Enablement' },
      ],
      scoreRanges: bands,
      resultsScreen: { enabled: true, layout: 'bands', showTotalScore: true, showPercentage: true, showOverallBand: true, showCategoryBreakdown: true, showCategoryBands: true, showStrengthsAndRisks: false, showCallToAction: false, scoreRanges: bands },
    };

    const result = scoreSurvey({ questions, responses, scoreConfig });
    expect(result.totalScore).toBe(15);
    expect(result.maxScore).toBe(15);
    expect(result.percentage).toBeCloseTo(100);
    expect(result.byCategory.engagement.score).toBe(10);
    expect(result.byCategory.engagement.maxScore).toBe(10);
    expect(result.byCategory.enablement.score).toBe(5);
    expect(result.byCategory.enablement.maxScore).toBe(5);

    const band = resolveBand(result.percentage, scoreConfig);
    expect(band?.id).toBe('high');
  });

  it('engagement survey mid scores', () => {
    const questions: Question[] = [
      { id: 'q1', type: 'rating', question: 'Proud', ratingScale: 5, scorable: true, scoreWeight: 1, scoringCategory: 'engagement' },
      { id: 'q2', type: 'rating', question: 'Recommend', ratingScale: 5, scorable: true, scoreWeight: 1, scoringCategory: 'engagement' },
      { id: 'q3', type: 'rating', question: 'Resources', ratingScale: 5, scorable: true, scoreWeight: 1, scoringCategory: 'enablement' },
    ];
    const responses = { q1: 3, q2: 3, q3: 3 };
    const scoreConfig: SurveyScoreConfig = {
      enabled: true,
      categories: [
        { id: 'engagement', name: 'Engagement' },
        { id: 'enablement', name: 'Enablement' },
      ],
      scoreRanges: bands,
      resultsScreen: { enabled: true, layout: 'bands', showTotalScore: true, showPercentage: true, showOverallBand: true, showCategoryBreakdown: true, showCategoryBands: true, showStrengthsAndRisks: false, showCallToAction: false, scoreRanges: bands },
    };

    const result = scoreSurvey({ questions, responses, scoreConfig });
    expect(result.totalScore).toBe(9);
    expect(result.maxScore).toBe(15);
    expect(result.percentage).toBeCloseTo(60);
    expect(result.byCategory.engagement.score).toBe(6);
    expect(result.byCategory.engagement.maxScore).toBe(10);
    expect(result.byCategory.enablement.score).toBe(3);
    expect(result.byCategory.enablement.maxScore).toBe(5);

    const band = resolveBand(result.percentage, scoreConfig);
    expect(band?.id).toBe('mid');
  });

  it('engagement survey low scores', () => {
    const questions: Question[] = [
      { id: 'q1', type: 'rating', question: 'Proud', ratingScale: 5, scorable: true, scoreWeight: 1, scoringCategory: 'engagement' },
      { id: 'q2', type: 'rating', question: 'Recommend', ratingScale: 5, scorable: true, scoreWeight: 1, scoringCategory: 'engagement' },
      { id: 'q3', type: 'rating', question: 'Resources', ratingScale: 5, scorable: true, scoreWeight: 1, scoringCategory: 'enablement' },
    ];
    const responses = { q1: 1, q2: 1, q3: 1 };
    const scoreConfig: SurveyScoreConfig = {
      enabled: true,
      categories: [
        { id: 'engagement', name: 'Engagement' },
        { id: 'enablement', name: 'Enablement' },
      ],
      scoreRanges: bands,
      resultsScreen: { enabled: true, layout: 'bands', showTotalScore: true, showPercentage: true, showOverallBand: true, showCategoryBreakdown: true, showCategoryBands: true, showStrengthsAndRisks: false, showCallToAction: false, scoreRanges: bands },
    };

    const result = scoreSurvey({ questions, responses, scoreConfig });
    expect(result.totalScore).toBe(3);
    expect(result.maxScore).toBe(15);
    expect(result.percentage).toBeCloseTo(20);
    expect(result.byCategory.engagement.score).toBe(2);
    expect(result.byCategory.engagement.maxScore).toBe(10);
    expect(result.byCategory.enablement.score).toBe(1);
    expect(result.byCategory.enablement.maxScore).toBe(5);

    const band = resolveBand(result.percentage, scoreConfig);
    expect(band?.id).toBe('low');
  });

  it('band configuration invariants', () => {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    expect(sorted[0].min).toBe(0);
    expect(sorted[sorted.length - 1].max).toBe(100);
    for (let i = 0; i < sorted.length; i++) {
      expect(sorted[i].min).toBeLessThanOrEqual(sorted[i].max);
      if (i > 0) {
        expect(sorted[i].min).toBeGreaterThan(sorted[i - 1].max);
      }
    }
  });
});
