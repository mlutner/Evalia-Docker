/**
 * Analytics State Derivation
 * 
 * [ANAL-QA-050] Helper to classify survey analytics state and drive
 * appropriate empty-state behavior. Makes failures obvious and safe.
 * 
 * CONSTRAINT: Does NOT change any scoring calculations or APIs.
 * Only provides classification for UX decisions.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Possible analytics states that drive UX behavior.
 */
export type AnalyticsScoringState = 
  | 'no-scoring'           // Scoring disabled
  | 'misconfigured-scoring' // Scoring enabled but broken config
  | 'no-responses'         // No responses yet
  | 'single-version'       // Only one scoring version (can't show trends)
  | 'healthy';             // Everything looks good

/**
 * Input for state derivation.
 */
export interface AnalyticsStateInput {
  /** Is scoring enabled on the survey? */
  scoringEnabled: boolean;
  /** Categories defined in scoreConfig */
  categories: Array<{ id: string; name: string }> | undefined;
  /** Score ranges defined in scoreConfig */
  scoreRanges: Array<unknown> | undefined;
  /** Total response count */
  responseCount: number;
  /** Number of scoring versions available */
  versionCount: number;
  /** Dimension scores from indexTrendsSummary (current snapshot) */
  dimensionScores: Record<string, number | null> | undefined;
}

/**
 * Result of state derivation with messages.
 */
export interface AnalyticsStateResult {
  state: AnalyticsScoringState;
  /** Human-readable title for the state */
  title: string;
  /** Detailed message explaining the state */
  message: string;
  /** What charts/sections to show */
  showScoring: boolean;
  showTrends: boolean;
  showParticipation: boolean;
  showQuestionSummary: boolean;
  /** Severity for UI styling */
  severity: 'info' | 'warning' | 'error';
}

// ============================================================================
// STATE DERIVATION
// ============================================================================

/**
 * Derive the analytics state from survey configuration and data.
 * 
 * Priority order:
 * 1. no-responses (nothing to analyze)
 * 2. no-scoring (intentionally disabled)
 * 3. misconfigured-scoring (enabled but broken)
 * 4. single-version (healthy but limited trends)
 * 5. healthy (all good)
 */
export function deriveAnalyticsScoringState(input: AnalyticsStateInput): AnalyticsStateResult {
  const {
    scoringEnabled,
    categories,
    scoreRanges,
    responseCount,
    versionCount,
    dimensionScores,
  } = input;

  // =========================================================================
  // State 1: No responses yet
  // =========================================================================
  if (responseCount === 0) {
    return {
      state: 'no-responses',
      title: 'Waiting for Responses',
      message: 'This survey hasn\'t received any responses yet. Analytics will appear once participants submit their responses.',
      showScoring: false,
      showTrends: false,
      showParticipation: true, // Show participation with 0s
      showQuestionSummary: false,
      severity: 'info',
    };
  }

  // =========================================================================
  // State 2: Scoring disabled
  // =========================================================================
  if (!scoringEnabled) {
    return {
      state: 'no-scoring',
      title: 'Scoring Not Enabled',
      message: 'This survey does not have scoring configured. Only participation metrics and question summaries are available.',
      showScoring: false,
      showTrends: false,
      showParticipation: true,
      showQuestionSummary: true,
      severity: 'info',
    };
  }

  // =========================================================================
  // State 3: Scoring misconfigured
  // =========================================================================
  const hasCategories = categories && categories.length > 0;
  const hasScoreRanges = scoreRanges && scoreRanges.length > 0;
  
  if (!hasCategories) {
    return {
      state: 'misconfigured-scoring',
      title: 'Scoring Misconfigured',
      message: 'Scoring is enabled but no categories are defined. Please configure scoring categories in the Survey Builder.',
      showScoring: false,
      showTrends: false,
      showParticipation: true,
      showQuestionSummary: true,
      severity: 'error',
    };
  }

  if (!hasScoreRanges) {
    return {
      state: 'misconfigured-scoring',
      title: 'Score Ranges Missing',
      message: 'Scoring categories exist but no score ranges (bands) are configured. Please define score ranges in the Survey Builder.',
      showScoring: false,
      showTrends: false,
      showParticipation: true,
      showQuestionSummary: true,
      severity: 'error',
    };
  }

  // Check for broken dimension scores (all null despite having responses)
  // This indicates questions aren't mapped to categories
  if (dimensionScores) {
    const allNull = Object.values(dimensionScores).every(s => s === null);
    if (allNull && responseCount > 0) {
      // Log invariant violation in dev mode
      logInvariantViolation(
        'SCORES_ALL_NULL',
        'Scoring enabled with responses but all dimension scores are null. ' +
        'Questions may not be mapped to scoring categories.'
      );
      
      return {
        state: 'misconfigured-scoring',
        title: 'No Dimension Data',
        message: 'Responses exist but no scores were calculated. Ensure questions are mapped to scoring categories.',
        showScoring: false,
        showTrends: false,
        showParticipation: true,
        showQuestionSummary: true,
        severity: 'error',
      };
    }
  }

  // =========================================================================
  // State 4: Single version (healthy but limited)
  // =========================================================================
  if (versionCount <= 1) {
    return {
      state: 'single-version',
      title: 'Single Snapshot Mode',
      message: 'Only one scoring version available. Trend analysis and before/after comparisons require multiple versions.',
      showScoring: true,
      showTrends: false,
      showParticipation: true,
      showQuestionSummary: true,
      severity: 'info',
    };
  }

  // =========================================================================
  // State 5: Healthy
  // =========================================================================
  return {
    state: 'healthy',
    title: 'Analytics Ready',
    message: 'All analytics data is available.',
    showScoring: true,
    showTrends: true,
    showParticipation: true,
    showQuestionSummary: true,
    severity: 'info',
  };
}

// ============================================================================
// DEV MODE LOGGING
// ============================================================================

/**
 * Log an analytics invariant violation in development mode.
 * These indicate clearly broken states that should be investigated.
 */
function logInvariantViolation(code: string, message: string): void {
  if (process.env.NODE_ENV === 'development' || import.meta.env.DEV) {
    console.warn(`[ANALYTICS-INVARIANT] ${code}: ${message}`);
  }
}

/**
 * Check for and log common invariant violations.
 * Call this when analytics data loads to catch issues early.
 */
export function checkAnalyticsInvariants(input: {
  scoringEnabled: boolean;
  responseCount: number;
  dimensionScores: Record<string, number | null> | undefined;
  bandDistribution: Array<{ count: number }> | undefined;
  indexDistribution: Array<{ count: number }> | undefined;
}): void {
  const { scoringEnabled, responseCount, dimensionScores, bandDistribution, indexDistribution } = input;

  // Invariant: If scoring enabled + responses > 0, dimension scores should not all be null
  if (scoringEnabled && responseCount > 0 && dimensionScores) {
    const allNull = Object.values(dimensionScores).every(s => s === null);
    if (allNull) {
      logInvariantViolation(
        'SCORES_ALL_NULL',
        `${responseCount} responses but all dimension scores are null`
      );
    }
  }

  // Invariant: If scoring enabled + responses > 0, band distribution should have counts
  if (scoringEnabled && responseCount > 0 && bandDistribution) {
    const allZero = bandDistribution.every(b => b.count === 0);
    if (allZero) {
      logInvariantViolation(
        'BANDS_ALL_ZERO',
        `${responseCount} responses but all band counts are 0`
      );
    }
  }

  // Invariant: If scoring enabled + responses > 0, index distribution should have counts
  if (scoringEnabled && responseCount > 0 && indexDistribution) {
    const allZero = indexDistribution.every(b => b.count === 0);
    if (allZero) {
      logInvariantViolation(
        'INDEX_DIST_ALL_ZERO',
        `${responseCount} responses but all index distribution counts are 0`
      );
    }
  }
}

// ============================================================================
// HELPER: Check if distribution is empty
// ============================================================================

/**
 * Check if a distribution array is effectively empty (all counts are 0).
 */
export function isDistributionEmpty(buckets: Array<{ count: number }> | undefined): boolean {
  if (!buckets || buckets.length === 0) return true;
  return buckets.every(b => b.count === 0);
}

