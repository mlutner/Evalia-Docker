/**
 * Tests for Results Mode Resolution
 * 
 * Validates that resolveResultsMode correctly classifies surveys into:
 * - index (engagement, 5D)
 * - self_assessment (other scored surveys)
 * - none (non-scored)
 */

import { describe, it, expect } from 'vitest';
import { resolveResultsMode, shouldShowResultsScreen, getResultsModeLabels } from '../resultsMode';
import type { SurveyScoreConfig } from '../schema';

describe('resolveResultsMode', () => {
  describe('none mode (non-scored surveys)', () => {
    it('returns "none" when scoreConfig is undefined', () => {
      const mode = resolveResultsMode(undefined);
      expect(mode).toBe('none');
    });

    it('returns "none" when scoreConfig.enabled is false', () => {
      const scoreConfig: SurveyScoreConfig = {
        enabled: false,
        categories: [],
        scoreRanges: [],
      };
      const mode = resolveResultsMode(scoreConfig);
      expect(mode).toBe('none');
    });
  });

  describe('index mode (engagement/5D surveys)', () => {
    it('returns "index" for engagement_v1 engine', () => {
      const scoreConfig: SurveyScoreConfig = {
        enabled: true,
        categories: [{ id: 'engagement', name: 'Engagement' }],
        scoreRanges: [],
      };
      const mode = resolveResultsMode(scoreConfig, 'engagement_v1');
      expect(mode).toBe('index');
    });

    it('returns "index" for 5d_wellbeing_v1 engine', () => {
      const scoreConfig: SurveyScoreConfig = {
        enabled: true,
        categories: [{ id: 'wellbeing', name: 'Wellbeing' }],
        scoreRanges: [],
      };
      const mode = resolveResultsMode(scoreConfig, '5d_wellbeing_v1');
      expect(mode).toBe('index');
    });

    it('returns "index" when survey has "engagement" tag', () => {
      const scoreConfig: SurveyScoreConfig = {
        enabled: true,
        categories: [{ id: 'engagement', name: 'Engagement' }],
        scoreRanges: [],
      };
      const mode = resolveResultsMode(scoreConfig, null, ['engagement', 'pulse']);
      expect(mode).toBe('index');
    });

    it('returns "index" when survey has "5d" tag', () => {
      const scoreConfig: SurveyScoreConfig = {
        enabled: true,
        categories: [{ id: 'wellbeing', name: 'Wellbeing' }],
        scoreRanges: [],
      };
      const mode = resolveResultsMode(scoreConfig, null, ['5d', 'organizational']);
      expect(mode).toBe('index');
    });

    it('returns "index" when survey has 3+ canonical 5D categories', () => {
      const scoreConfig: SurveyScoreConfig = {
        enabled: true,
        categories: [
          { id: 'leadership-effectiveness', name: 'Leadership' },
          { id: 'team-wellbeing', name: 'Wellbeing' },
          { id: 'psychological-safety', name: 'Safety' },
        ],
        scoreRanges: [],
      };
      const mode = resolveResultsMode(scoreConfig);
      expect(mode).toBe('index');
    });

    it('returns "index" when survey has all 5 canonical 5D categories', () => {
      const scoreConfig: SurveyScoreConfig = {
        enabled: true,
        categories: [
          { id: 'leadership-effectiveness', name: 'Leadership' },
          { id: 'team-wellbeing', name: 'Wellbeing' },
          { id: 'burnout-risk', name: 'Burnout' },
          { id: 'psychological-safety', name: 'Safety' },
          { id: 'engagement', name: 'Engagement' },
        ],
        scoreRanges: [],
      };
      const mode = resolveResultsMode(scoreConfig);
      expect(mode).toBe('index');
    });
  });

  describe('self_assessment mode (other scored surveys)', () => {
    it('returns "self_assessment" for leadership survey', () => {
      const scoreConfig: SurveyScoreConfig = {
        enabled: true,
        categories: [{ id: 'leadership', name: 'Leadership Skills' }],
        scoreRanges: [],
      };
      const mode = resolveResultsMode(scoreConfig);
      expect(mode).toBe('self_assessment');
    });

    it('returns "self_assessment" for burnout survey', () => {
      const scoreConfig: SurveyScoreConfig = {
        enabled: true,
        categories: [{ id: 'burnout', name: 'Burnout Level' }],
        scoreRanges: [],
      };
      const mode = resolveResultsMode(scoreConfig);
      expect(mode).toBe('self_assessment');
    });

    it('returns "self_assessment" for confidence survey', () => {
      const scoreConfig: SurveyScoreConfig = {
        enabled: true,
        categories: [{ id: 'confidence', name: 'Confidence Level' }],
        scoreRanges: [],
      };
      const mode = resolveResultsMode(scoreConfig);
      expect(mode).toBe('self_assessment');
    });

    it('returns "self_assessment" when survey has only 1-2 canonical 5D categories', () => {
      const scoreConfig: SurveyScoreConfig = {
        enabled: true,
        categories: [
          { id: 'leadership-effectiveness', name: 'Leadership' },
          { id: 'team-wellbeing', name: 'Wellbeing' },
        ],
        scoreRanges: [],
      };
      const mode = resolveResultsMode(scoreConfig);
      expect(mode).toBe('self_assessment');
    });

    it('returns "self_assessment" for custom category survey', () => {
      const scoreConfig: SurveyScoreConfig = {
        enabled: true,
        categories: [
          { id: 'customer-satisfaction', name: 'Customer Satisfaction' },
          { id: 'product-quality', name: 'Product Quality' },
        ],
        scoreRanges: [],
      };
      const mode = resolveResultsMode(scoreConfig);
      expect(mode).toBe('self_assessment');
    });
  });
});

describe('shouldShowResultsScreen', () => {
  it('returns true when resultsScreen enabled and scoringPayload exists', () => {
    const scoringPayload = [{ categoryId: 'test', score: 50 }];
    expect(shouldShowResultsScreen(true, scoringPayload)).toBe(true);
  });

  it('returns false when resultsScreen disabled', () => {
    const scoringPayload = [{ categoryId: 'test', score: 50 }];
    expect(shouldShowResultsScreen(false, scoringPayload)).toBe(false);
  });

  it('returns false when scoringPayload is null', () => {
    expect(shouldShowResultsScreen(true, null)).toBe(false);
  });

  it('returns false when both are falsy', () => {
    expect(shouldShowResultsScreen(false, null)).toBe(false);
  });

  it('returns false when resultsScreen is undefined', () => {
    const scoringPayload = [{ categoryId: 'test', score: 50 }];
    expect(shouldShowResultsScreen(undefined, scoringPayload)).toBe(false);
  });
});

describe('getResultsModeLabels', () => {
  it('returns index labels for index mode', () => {
    const labels = getResultsModeLabels('index');
    expect(labels.scoreLabel).toBe('Index Score');
    expect(labels.bandLabel).toBe('Performance Band');
    expect(labels.description).toContain('organizational benchmarks');
  });

  it('returns self-assessment labels for self_assessment mode', () => {
    const labels = getResultsModeLabels('self_assessment');
    expect(labels.scoreLabel).toBe('Your Score');
    expect(labels.bandLabel).toBe('Your Band');
    expect(labels.description).toContain('Personal insights');
    expect(labels.description).not.toContain('index');
  });

  it('returns thank you labels for none mode', () => {
    const labels = getResultsModeLabels('none');
    expect(labels.title).toBe('Thank You');
    expect(labels.scoreLabel).toBe('');
    expect(labels.bandLabel).toBe('');
  });
});
