/**
 * Golden Test: Engagement Survey with Scoring
 * 
 * Validates end-to-end scoring behavior for an engagement survey:
 * 1. Questions are scored correctly
 * 2. Categories aggregate properly
 * 3. Bands match based on score ranges
 * 4. Results payload is valid for ResultsScreen
 */

import { describe, it, expect } from 'vitest';
import { calculateSurveyScores, type Question, type SurveyScoreConfig } from '../schema';

describe('Golden Test: Engagement Survey', () => {
  // Engagement survey with 5-band scoring (matching engagement_v1 engine)
  const engagementBands = [
    { id: 'critical', min: 0, max: 39, label: 'Critical', category: 'engagement', interpretation: 'Critical engagement level - immediate action needed' },
    { id: 'needs-improvement', min: 40, max: 54, label: 'Needs Improvement', category: 'engagement', interpretation: 'Engagement below target - focus areas identified' },
    { id: 'developing', min: 55, max: 69, label: 'Developing', category: 'engagement', interpretation: 'Engagement developing - on track with room for growth' },
    { id: 'effective', min: 70, max: 84, label: 'Effective', category: 'engagement', interpretation: 'Strong engagement - sustain current practices' },
    { id: 'highly-effective', min: 85, max: 100, label: 'Highly Effective', category: 'engagement', interpretation: 'Exceptional engagement - model for others' },
  ];

  const scoreConfig: SurveyScoreConfig = {
    enabled: true,
    categories: [
      { id: 'engagement', name: 'Engagement Energy' },
    ],
    scoreRanges: engagementBands,
  };

  const engagementQuestions: Question[] = [
    {
      id: 'q1',
      type: 'rating',
      question: 'How motivated do you feel at work?',
      ratingScale: 5,
      scorable: true,
      scoringCategory: 'engagement',
      scoreWeight: 1,
      optionScores: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 },
    },
    {
      id: 'q2',
      type: 'nps',
      question: 'How likely are you to recommend this company as a place to work?',
      scorable: true,
      scoringCategory: 'engagement',
      scoreWeight: 1,
    },
    {
      id: 'q3',
      type: 'likert',
      question: 'I feel energized by my work',
      likertPoints: 5,
      likertType: 'agreement',
      scorable: true,
      scoringCategory: 'engagement',
      scoreWeight: 1,
      optionScores: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 },
    },
  ];

  it('calculates engagement score correctly for high engagement responses', () => {
    const answers = {
      q1: '5', // Max rating
      q2: '10', // Promoter (NPS 10)
      q3: '5', // Strongly agree
    };

    const results = calculateSurveyScores(engagementQuestions, answers, scoreConfig);

    expect(results).not.toBeNull();
    expect(results).toHaveLength(1);
    
    const engagement = results![0];
    expect(engagement.categoryId).toBe('engagement');
    expect(engagement.categoryName).toBe('Engagement Energy');
    expect(engagement.score).toBe(100); // Perfect score
    expect(engagement.maxScore).toBe(100);
    expect(engagement.interpretation).toBe('Exceptional engagement - model for others');
  });

  it('calculates engagement score correctly for moderate engagement responses', () => {
    const answers = {
      q1: '3', // Middle rating
      q2: '7', // Passive (NPS 7)
      q3: '3', // Neutral
    };

    const results = calculateSurveyScores(engagementQuestions, answers, scoreConfig);

    expect(results).not.toBeNull();
    const engagement = results![0];
    
    // 3/5 + 7/10 + 3/5 = 0.6 + 0.7 + 0.6 = 1.9/3 = 63.3% → ~63
    expect(engagement.score).toBeGreaterThanOrEqual(60);
    expect(engagement.score).toBeLessThanOrEqual(70);
    expect(engagement.interpretation).toBe('Engagement developing - on track with room for growth');
  });

  it('calculates engagement score correctly for low engagement responses', () => {
    const answers = {
      q1: '1', // Lowest rating
      q2: '2', // Detractor (NPS 2)
      q3: '1', // Strongly disagree
    };

    const results = calculateSurveyScores(engagementQuestions, answers, scoreConfig);

    expect(results).not.toBeNull();
    const engagement = results![0];
    
    // 1/5 + 2/10 + 1/5 = 0.2 + 0.2 + 0.2 = 0.6/3 = 20% → ~20
    expect(engagement.score).toBeLessThan(40);
    expect(engagement.interpretation).toBe('Critical engagement level - immediate action needed');
  });

  it('returns valid payload structure for ResultsScreen', () => {
    const answers = {
      q1: '4',
      q2: '8',
      q3: '4',
    };

    const results = calculateSurveyScores(engagementQuestions, answers, scoreConfig);

    expect(results).not.toBeNull();
    expect(Array.isArray(results)).toBe(true);
    
    const engagement = results![0];
    
    // Verify all required fields for ResultsScreen
    expect(engagement).toHaveProperty('categoryId');
    expect(engagement).toHaveProperty('categoryName');
    expect(engagement).toHaveProperty('score');
    expect(engagement).toHaveProperty('maxScore');
    expect(engagement).toHaveProperty('interpretation');
    
    // Verify types
    expect(typeof engagement.categoryId).toBe('string');
    expect(typeof engagement.categoryName).toBe('string');
    expect(typeof engagement.score).toBe('number');
    expect(typeof engagement.maxScore).toBe('number');
    expect(typeof engagement.interpretation).toBe('string');
    
    // Verify score is normalized to 0-100
    expect(engagement.score).toBeGreaterThanOrEqual(0);
    expect(engagement.score).toBeLessThanOrEqual(100);
    expect(engagement.maxScore).toBe(100);
  });

  it('handles partial responses (some questions unanswered)', () => {
    const answers = {
      q1: '5', // Answered
      // q2 skipped
      q3: '5', // Answered
    };

    const results = calculateSurveyScores(engagementQuestions, answers, scoreConfig);

    expect(results).not.toBeNull();
    const engagement = results![0];
    
    // Score should be based only on answered questions
    // 5/5 + 5/5 = 2/2 = 100%
    expect(engagement.score).toBe(100);
  });

  it('returns null when scoring is disabled', () => {
    const disabledConfig: SurveyScoreConfig = {
      ...scoreConfig,
      enabled: false,
    };

    const answers = { q1: '5', q2: '10', q3: '5' };
    const results = calculateSurveyScores(engagementQuestions, answers, disabledConfig);

    expect(results).toBeNull();
  });
});
