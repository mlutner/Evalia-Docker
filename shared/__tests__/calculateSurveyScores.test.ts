/**
 * [SCORE-002] Golden unit tests for calculateSurveyScores
 * 
 * Validates that:
 * 1. Scores are calculated correctly from question answers
 * 2. Band matching uses min/max (not minScore/maxScore)
 * 3. Normalized scores are in 0-100 range
 */

import { describe, it, expect } from 'vitest';
import { calculateSurveyScores, type Question, type SurveyScoreConfig } from '../schema';

describe('calculateSurveyScores', () => {
  // Standard 5-band configuration matching scoreBandSchema (min/max)
  const standardBands = [
    { id: 'critical', min: 0, max: 39, label: 'Critical', category: 'engagement', interpretation: 'Critical level' },
    { id: 'needs-improvement', min: 40, max: 54, label: 'Needs Improvement', category: 'engagement', interpretation: 'Needs improvement' },
    { id: 'developing', min: 55, max: 69, label: 'Developing', category: 'engagement', interpretation: 'Developing' },
    { id: 'effective', min: 70, max: 84, label: 'Effective', category: 'engagement', interpretation: 'Effective level' },
    { id: 'highly-effective', min: 85, max: 100, label: 'Highly Effective', category: 'engagement', interpretation: 'Highly effective' },
  ];

  const baseScoreConfig: SurveyScoreConfig = {
    enabled: true,
    categories: [
      { id: 'engagement', name: 'Engagement Energy' },
    ],
    scoreRanges: standardBands,
  };

  const ratingQuestion: Question = {
    id: 'q1',
    type: 'rating',
    question: 'Rate your engagement',
    ratingScale: 5,
    scorable: true,
    scoringCategory: 'engagement',
    scoreWeight: 1,
    optionScores: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 },
  };

  it('calculates normalized scores correctly from rating answers', () => {
    const questions: Question[] = [ratingQuestion];
    const answers = { q1: '4' }; // 4 out of 5

    const results = calculateSurveyScores(questions, answers, baseScoreConfig);

    expect(results).not.toBeNull();
    expect(results).toHaveLength(1);
    expect(results![0].categoryId).toBe('engagement');
    expect(results![0].score).toBeGreaterThan(0);
    expect(results![0].maxScore).toBe(100);
  });

  it('uses min/max properties from scoreRanges (not minScore/maxScore)', () => {
    // This test ensures the SCORE-002 fix is in place
    // If the code uses minScore/maxScore, this will fail because
    // our bands only have min/max
    const questions: Question[] = [ratingQuestion];
    const answers = { q1: '5' }; // Max score

    const results = calculateSurveyScores(questions, answers, baseScoreConfig);

    expect(results).not.toBeNull();
    expect(results![0].score).toBeGreaterThan(0);
    // Score should be 100 (max) for perfect answer
    expect(results![0].score).toBe(100);
  });

  it('returns correct interpretation from matching band', () => {
    const questions: Question[] = [ratingQuestion];
    // Answer 4/5 = 80% → should match 'effective' band (70-84)
    const answers = { q1: '4' };

    const results = calculateSurveyScores(questions, answers, baseScoreConfig);

    expect(results).not.toBeNull();
    const score = results![0].score;
    // Score should be ~80 (4/5 * 100)
    expect(score).toBeGreaterThanOrEqual(70);
    expect(score).toBeLessThanOrEqual(85);
    expect(results![0].interpretation).toBe('Effective level');
  });

  it('returns null when scoring is disabled', () => {
    const disabledConfig: SurveyScoreConfig = {
      ...baseScoreConfig,
      enabled: false,
    };
    const questions: Question[] = [ratingQuestion];
    const answers = { q1: '5' };

    const results = calculateSurveyScores(questions, answers, disabledConfig);

    expect(results).toBeNull();
  });

  it('handles multiple categories correctly', () => {
    const multiCategoryConfig: SurveyScoreConfig = {
      enabled: true,
      categories: [
        { id: 'engagement', name: 'Engagement Energy' },
        { id: 'wellbeing', name: 'Team Wellbeing' },
      ],
      scoreRanges: [
        { id: 'eng-low', min: 0, max: 50, label: 'Low', category: 'engagement', interpretation: 'Low engagement' },
        { id: 'eng-high', min: 51, max: 100, label: 'High', category: 'engagement', interpretation: 'High engagement' },
        { id: 'wb-low', min: 0, max: 50, label: 'Low', category: 'wellbeing', interpretation: 'Low wellbeing' },
        { id: 'wb-high', min: 51, max: 100, label: 'High', category: 'wellbeing', interpretation: 'High wellbeing' },
      ],
    };

    const questions: Question[] = [
      { ...ratingQuestion, id: 'q1', scoringCategory: 'engagement' },
      { ...ratingQuestion, id: 'q2', scoringCategory: 'wellbeing' },
    ];
    const answers = { q1: '5', q2: '2' }; // High engagement (5/5=100%), low wellbeing (2/5=40%)

    const results = calculateSurveyScores(questions, answers, multiCategoryConfig);

    expect(results).not.toBeNull();
    expect(results).toHaveLength(2);
    
    const engagement = results!.find(r => r.categoryId === 'engagement');
    const wellbeing = results!.find(r => r.categoryId === 'wellbeing');
    
    expect(engagement?.interpretation).toBe('High engagement');
    expect(wellbeing?.interpretation).toBe('Low wellbeing');
  });

  it('handles likert questions with optionScores', () => {
    const likertQuestion: Question = {
      id: 'q1',
      type: 'likert',
      question: 'I feel motivated',
      likertPoints: 5,
      likertType: 'agreement',
      scorable: true,
      scoringCategory: 'engagement',
      scoreWeight: 1,
      optionScores: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 },
    };

    const questions: Question[] = [likertQuestion];
    const answers = { q1: '5' };

    const results = calculateSurveyScores(questions, answers, baseScoreConfig);

    expect(results).not.toBeNull();
    expect(results![0].score).toBe(100);
  });

  it('handles multiple_choice with text optionScores', () => {
    const mcQuestion: Question = {
      id: 'q1',
      type: 'multiple_choice',
      question: 'How are you feeling?',
      options: ['Much worse', 'Somewhat worse', 'About the same', 'Somewhat better', 'Much better'],
      scorable: true,
      scoringCategory: 'engagement',
      scoreWeight: 1,
      optionScores: { 
        'Much worse': 1, 
        'Somewhat worse': 2, 
        'About the same': 3, 
        'Somewhat better': 4, 
        'Much better': 5 
      },
    };

    const questions: Question[] = [mcQuestion];
    const answers = { q1: 'Much better' };

    const results = calculateSurveyScores(questions, answers, baseScoreConfig);

    expect(results).not.toBeNull();
    expect(results![0].score).toBe(100); // 5/5 = 100%
  });
});

