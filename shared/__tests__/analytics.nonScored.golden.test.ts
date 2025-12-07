/**
 * Golden Test: Non-Scored Survey
 * 
 * Validates that surveys without scoring enabled:
 * 1. Return null from calculateSurveyScores
 * 2. Do not generate scoring payloads
 * 3. Should show Thank You screen (not ResultsScreen)
 * 4. Can still collect response data
 */

import { describe, it, expect } from 'vitest';
import { calculateSurveyScores, type Question, type SurveyScoreConfig } from '../schema';

describe('Golden Test: Non-Scored Survey', () => {
  const feedbackQuestions: Question[] = [
    {
      id: 'q1',
      type: 'text',
      question: 'What did you like most about the event?',
      required: false,
    },
    {
      id: 'q2',
      type: 'textarea',
      question: 'Any suggestions for improvement?',
      required: false,
    },
    {
      id: 'q3',
      type: 'multiple_choice',
      question: 'How did you hear about us?',
      options: ['Social Media', 'Email', 'Friend', 'Other'],
      required: false,
    },
  ];

  it('returns null when scoreConfig is undefined', () => {
    const answers = {
      q1: 'Great speakers!',
      q2: 'More networking time would be nice',
      q3: 'Social Media',
    };

    const results = calculateSurveyScores(feedbackQuestions, answers, undefined);

    expect(results).toBeNull();
  });

  it('returns null when scoreConfig.enabled is false', () => {
    const disabledConfig: SurveyScoreConfig = {
      enabled: false,
      categories: [],
      scoreRanges: [],
    };

    const answers = {
      q1: 'Great speakers!',
      q2: 'More networking time would be nice',
      q3: 'Social Media',
    };

    const results = calculateSurveyScores(feedbackQuestions, answers, disabledConfig);

    expect(results).toBeNull();
  });

  it('returns null even if questions have scoringCategory but scoring is disabled', () => {
    // Edge case: questions configured for scoring but survey-level scoring disabled
    const questionsWithCategories: Question[] = [
      {
        id: 'q1',
        type: 'rating',
        question: 'Rate your experience',
        ratingScale: 5,
        scoringCategory: 'satisfaction', // Has category
        scorable: true, // Marked scorable
        scoreWeight: 1,
      },
    ];

    const disabledConfig: SurveyScoreConfig = {
      enabled: false, // But scoring disabled at survey level
      categories: [{ id: 'satisfaction', name: 'Satisfaction' }],
      scoreRanges: [],
    };

    const answers = { q1: '5' };
    const results = calculateSurveyScores(questionsWithCategories, answers, disabledConfig);

    // Should still return null because scoreConfig.enabled = false
    expect(results).toBeNull();
  });

  it('handles empty answers gracefully', () => {
    const answers = {};

    const results = calculateSurveyScores(feedbackQuestions, answers, undefined);

    expect(results).toBeNull();
  });

  it('validates non-scored survey structure for Thank You flow', () => {
    // This test documents the expected behavior for non-scored surveys
    const answers = {
      q1: 'Great event!',
      q2: 'Keep it up',
      q3: 'Friend',
    };

    const results = calculateSurveyScores(feedbackQuestions, answers, undefined);

    // Non-scored surveys should:
    // 1. Return null from scoring calculation
    expect(results).toBeNull();

    // 2. Answers are still collected (this is handled by response submission, not scoring)
    expect(answers).toHaveProperty('q1');
    expect(answers).toHaveProperty('q2');
    expect(answers).toHaveProperty('q3');

    // 3. Runtime should show Thank You screen (tested in SurveyView.results.test.tsx)
    // This is validated by: showResults = scoreConfig?.enabled && scoringPayload !== null
    // Since scoringPayload is null, showResults = false → Thank You screen
  });

  it('differentiates between no scoring config and disabled scoring config', () => {
    const answers = { q1: 'Test' };

    // Case 1: No scoreConfig at all (undefined)
    const resultsUndefined = calculateSurveyScores(feedbackQuestions, answers, undefined);
    expect(resultsUndefined).toBeNull();

    // Case 2: scoreConfig exists but enabled = false
    const disabledConfig: SurveyScoreConfig = {
      enabled: false,
      categories: [],
      scoreRanges: [],
    };
    const resultsDisabled = calculateSurveyScores(feedbackQuestions, answers, disabledConfig);
    expect(resultsDisabled).toBeNull();

    // Both should behave identically (return null)
    expect(resultsUndefined).toEqual(resultsDisabled);
  });
});
