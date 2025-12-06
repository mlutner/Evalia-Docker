/**
 * Tests for analyticsState.ts
 * 
 * [ANAL-QA-050] Tests for analytics state derivation logic.
 * Covers: non-scored surveys, misconfigured scoring, no responses, single-version trends.
 * 
 * [ANAL-QA-020] Aligned with INDEX_BAND_DEFINITIONS from shared/analyticsBands.ts
 * to ensure consistency with golden fixtures and prevent band threshold drift.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  deriveAnalyticsScoringState, 
  checkAnalyticsInvariants,
  isDistributionEmpty,
  type AnalyticsStateInput 
} from '../analyticsState';

// Import shared band definitions for consistent test fixtures
import { INDEX_BAND_DEFINITIONS } from '@shared/analyticsBands';

// Helper to create score ranges from canonical band definitions
const createCanonicalScoreRanges = () => 
  INDEX_BAND_DEFINITIONS.map(band => ({
    id: band.bandId,
    min: band.min,
    max: band.max,
    label: band.label,
  }));

describe('deriveAnalyticsScoringState', () => {
  // =========================================================================
  // No Responses State
  // =========================================================================
  
  describe('no-responses state', () => {
    it('returns no-responses when responseCount is 0', () => {
      const input: AnalyticsStateInput = {
        scoringEnabled: true,
        categories: [{ id: 'engagement', name: 'Engagement' }],
        scoreRanges: createCanonicalScoreRanges(), // Use canonical bands
        responseCount: 0,
        versionCount: 1,
        dimensionScores: undefined,
      };

      const result = deriveAnalyticsScoringState(input);

      expect(result.state).toBe('no-responses');
      expect(result.showScoring).toBe(false);
      expect(result.showTrends).toBe(false);
      expect(result.showParticipation).toBe(true);
      expect(result.showQuestionSummary).toBe(false);
      expect(result.severity).toBe('info');
    });

    it('shows participation metrics even with no responses', () => {
      const input: AnalyticsStateInput = {
        scoringEnabled: false,
        categories: undefined,
        scoreRanges: undefined,
        responseCount: 0,
        versionCount: 0,
        dimensionScores: undefined,
      };

      const result = deriveAnalyticsScoringState(input);

      expect(result.showParticipation).toBe(true);
    });
  });

  // =========================================================================
  // No Scoring State
  // =========================================================================
  
  describe('no-scoring state', () => {
    it('returns no-scoring when scoringEnabled is false', () => {
      const input: AnalyticsStateInput = {
        scoringEnabled: false,
        categories: undefined,
        scoreRanges: undefined,
        responseCount: 10,
        versionCount: 1,
        dimensionScores: undefined,
      };

      const result = deriveAnalyticsScoringState(input);

      expect(result.state).toBe('no-scoring');
      expect(result.showScoring).toBe(false);
      expect(result.showTrends).toBe(false);
      expect(result.showParticipation).toBe(true);
      expect(result.showQuestionSummary).toBe(true);
      expect(result.severity).toBe('info');
    });

    it('shows question summary for non-scored survey', () => {
      const input: AnalyticsStateInput = {
        scoringEnabled: false,
        categories: [],
        scoreRanges: [],
        responseCount: 50,
        versionCount: 0,
        dimensionScores: undefined,
      };

      const result = deriveAnalyticsScoringState(input);

      expect(result.showQuestionSummary).toBe(true);
      expect(result.title).toBe('Scoring Not Enabled');
    });
  });

  // =========================================================================
  // Misconfigured Scoring State
  // =========================================================================
  
  describe('misconfigured-scoring state', () => {
    it('returns misconfigured when scoring enabled but no categories', () => {
      const input: AnalyticsStateInput = {
        scoringEnabled: true,
        categories: [], // Empty!
        scoreRanges: createCanonicalScoreRanges(), // Use canonical bands
        responseCount: 10,
        versionCount: 1,
        dimensionScores: undefined,
      };

      const result = deriveAnalyticsScoringState(input);

      expect(result.state).toBe('misconfigured-scoring');
      expect(result.showScoring).toBe(false);
      expect(result.severity).toBe('error');
      expect(result.title).toBe('Scoring Misconfigured');
    });

    it('returns misconfigured when scoring enabled but no score ranges', () => {
      const input: AnalyticsStateInput = {
        scoringEnabled: true,
        categories: [{ id: 'engagement', name: 'Engagement' }],
        scoreRanges: [], // Empty!
        responseCount: 10,
        versionCount: 1,
        dimensionScores: undefined,
      };

      const result = deriveAnalyticsScoringState(input);

      expect(result.state).toBe('misconfigured-scoring');
      expect(result.title).toBe('Score Ranges Missing');
      expect(result.severity).toBe('error');
    });

    it('returns misconfigured when all dimension scores are null despite responses', () => {
      const input: AnalyticsStateInput = {
        scoringEnabled: true,
        categories: [{ id: 'engagement', name: 'Engagement' }],
        scoreRanges: createCanonicalScoreRanges(), // Use canonical bands
        responseCount: 10,
        versionCount: 1,
        dimensionScores: {
          leadershipEffectiveness: null,
          teamWellbeing: null,
          burnoutRisk: null,
          psychologicalSafety: null,
          engagement: null,
        },
      };

      const result = deriveAnalyticsScoringState(input);

      expect(result.state).toBe('misconfigured-scoring');
      expect(result.title).toBe('No Dimension Data');
      expect(result.severity).toBe('error');
    });
  });

  // =========================================================================
  // Single Version State
  // =========================================================================
  
  describe('single-version state', () => {
    it('returns single-version when only one version exists', () => {
      const input: AnalyticsStateInput = {
        scoringEnabled: true,
        categories: [{ id: 'engagement', name: 'Engagement' }],
        scoreRanges: createCanonicalScoreRanges(), // Use canonical bands
        responseCount: 10,
        versionCount: 1, // Only one version!
        dimensionScores: {
          engagement: 75, // Falls in "effective" band (70-84)
        },
      };

      const result = deriveAnalyticsScoringState(input);

      expect(result.state).toBe('single-version');
      expect(result.showScoring).toBe(true);
      expect(result.showTrends).toBe(false); // Can't show trends with single version
      expect(result.severity).toBe('info');
      expect(result.title).toBe('Single Snapshot Mode');
    });

    it('shows scoring charts in single-version mode', () => {
      const input: AnalyticsStateInput = {
        scoringEnabled: true,
        categories: [{ id: 'engagement', name: 'Engagement' }],
        scoreRanges: createCanonicalScoreRanges(), // Use canonical bands
        responseCount: 50,
        versionCount: 1,
        dimensionScores: { engagement: 80 }, // Falls in "effective" band (70-84)
      };

      const result = deriveAnalyticsScoringState(input);

      expect(result.showScoring).toBe(true);
      expect(result.showParticipation).toBe(true);
      expect(result.showQuestionSummary).toBe(true);
    });
  });

  // =========================================================================
  // Healthy State
  // =========================================================================
  
  describe('healthy state', () => {
    it('returns healthy when all conditions are met', () => {
      const input: AnalyticsStateInput = {
        scoringEnabled: true,
        categories: [
          { id: 'engagement', name: 'Engagement' },
          { id: 'team-wellbeing', name: 'Team Wellbeing' },
        ],
        scoreRanges: createCanonicalScoreRanges(), // Use canonical bands
        responseCount: 100,
        versionCount: 3, // Multiple versions
        dimensionScores: {
          engagement: 75,    // Falls in "effective" band (70-84)
          teamWellbeing: 80, // Falls in "effective" band (70-84)
        },
      };

      const result = deriveAnalyticsScoringState(input);

      expect(result.state).toBe('healthy');
      expect(result.showScoring).toBe(true);
      expect(result.showTrends).toBe(true);
      expect(result.showParticipation).toBe(true);
      expect(result.showQuestionSummary).toBe(true);
      expect(result.severity).toBe('info');
    });

    it('shows all analytics features for healthy state', () => {
      const input: AnalyticsStateInput = {
        scoringEnabled: true,
        categories: [{ id: 'engagement', name: 'Engagement' }],
        scoreRanges: createCanonicalScoreRanges(), // Use canonical bands
        responseCount: 200,
        versionCount: 5,
        dimensionScores: { engagement: 65 }, // Falls in "developing" band (55-69)
      };

      const result = deriveAnalyticsScoringState(input);

      expect(result.showScoring).toBe(true);
      expect(result.showTrends).toBe(true);
    });
  });
});

describe('checkAnalyticsInvariants', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Mock console.warn to capture invariant violations
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('logs SCORES_ALL_NULL when scoring enabled with responses but all scores null', () => {
    checkAnalyticsInvariants({
      scoringEnabled: true,
      responseCount: 10,
      dimensionScores: {
        engagement: null,
        teamWellbeing: null,
      },
      bandDistribution: undefined,
      indexDistribution: undefined,
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ANALYTICS-INVARIANT] SCORES_ALL_NULL')
    );
  });

  it('logs BANDS_ALL_ZERO when band distribution has all zero counts', () => {
    checkAnalyticsInvariants({
      scoringEnabled: true,
      responseCount: 10,
      dimensionScores: { engagement: 75 },
      bandDistribution: [
        { count: 0 },
        { count: 0 },
        { count: 0 },
      ],
      indexDistribution: undefined,
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ANALYTICS-INVARIANT] BANDS_ALL_ZERO')
    );
  });

  it('logs INDEX_DIST_ALL_ZERO when index distribution has all zero counts', () => {
    checkAnalyticsInvariants({
      scoringEnabled: true,
      responseCount: 10,
      dimensionScores: { engagement: 75 },
      bandDistribution: undefined,
      indexDistribution: [
        { count: 0 },
        { count: 0 },
      ],
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ANALYTICS-INVARIANT] INDEX_DIST_ALL_ZERO')
    );
  });

  it('does not log when data is healthy', () => {
    checkAnalyticsInvariants({
      scoringEnabled: true,
      responseCount: 10,
      dimensionScores: { engagement: 75, teamWellbeing: 80 },
      bandDistribution: [{ count: 5 }, { count: 5 }],
      indexDistribution: [{ count: 3 }, { count: 7 }],
    });

    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('does not log when scoring is disabled', () => {
    checkAnalyticsInvariants({
      scoringEnabled: false,
      responseCount: 10,
      dimensionScores: undefined,
      bandDistribution: undefined,
      indexDistribution: undefined,
    });

    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });
});

describe('isDistributionEmpty', () => {
  it('returns true for undefined buckets', () => {
    expect(isDistributionEmpty(undefined)).toBe(true);
  });

  it('returns true for empty array', () => {
    expect(isDistributionEmpty([])).toBe(true);
  });

  it('returns true when all counts are 0', () => {
    expect(isDistributionEmpty([{ count: 0 }, { count: 0 }, { count: 0 }])).toBe(true);
  });

  it('returns false when any count is > 0', () => {
    expect(isDistributionEmpty([{ count: 0 }, { count: 1 }, { count: 0 }])).toBe(false);
  });

  it('returns false when all counts are > 0', () => {
    expect(isDistributionEmpty([{ count: 5 }, { count: 10 }, { count: 3 }])).toBe(false);
  });
});

