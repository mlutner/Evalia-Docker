/**
 * Analytics Confidence & Display Rules
 * 
 * [ANAL-QA-050] Centralized rules for determining what analytics to show
 * based on survey configuration and data availability.
 * 
 * GOAL: Make failure LOUD. No more charts quietly rendering zeros
 * when config is broken.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Analytics display mode based on survey configuration.
 */
export type AnalyticsMode = 
  | 'insight-dimensions'  // Full 5D EID analytics (has canonical dimensions)
  | 'generic-scoring'     // Category-based scoring (has categories but not 5D)
  | 'basic'               // No scoring - participation + questions only
  | 'misconfigured';      // Scoring enabled but broken config

/**
 * Result of analyzing survey configuration for analytics.
 */
export interface AnalyticsConfidenceResult {
  mode: AnalyticsMode;
  
  // What to show
  showParticipation: boolean;
  showQuestionSummary: boolean;
  showIndexDistribution: boolean;
  showBandDistribution: boolean;
  showDimensionLeaderboard: boolean;
  showManagerComparison: boolean;
  showTrends: boolean;
  showBeforeAfter: boolean;
  
  // Warnings/info
  warnings: AnalyticsWarning[];
  
  // Metadata
  responseCount: number;
  versionCount: number;
  categoryCount: number;
  hasScoringEnabled: boolean;
  hasValidCategories: boolean;
}

export interface AnalyticsWarning {
  type: 'low-responses' | 'single-version' | 'no-managers' | 'misconfigured' | 'no-responses';
  severity: 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

/**
 * Scoring configuration summary for analytics mode detection.
 */
export interface ScoringConfigSummary {
  enabled: boolean;
  categories: Array<{ id: string; name: string }>;
  hasScoreRanges: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Minimum responses for statistically meaningful data.
 * Below this, show a warning.
 */
export const MIN_RESPONSES_MEANINGFUL = 5;

/**
 * Minimum responses to show any charts.
 * With 0 responses, show empty state instead.
 */
export const MIN_RESPONSES_FOR_CHARTS = 1;

/**
 * Canonical 5D Insight Dimension category IDs.
 * If a survey has at least 3 of these, it's considered 5D.
 */
export const CANONICAL_5D_CATEGORY_IDS = [
  'engagement',
  'leadership-effectiveness',
  'psychological-safety',
  'team-wellbeing',
  'burnout-risk',
] as const;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Determine the analytics mode for a survey.
 * 
 * @param scoringConfig - The survey's scoreConfig
 * @returns The appropriate analytics mode
 */
export function determineAnalyticsMode(
  scoringConfig: ScoringConfigSummary | undefined | null
): AnalyticsMode {
  // No config or disabled → Basic mode
  if (!scoringConfig || !scoringConfig.enabled) {
    return 'basic';
  }
  
  // Enabled but no categories → Misconfigured
  if (!scoringConfig.categories || scoringConfig.categories.length === 0) {
    return 'misconfigured';
  }
  
  // Check if it matches 5D
  const categoryIds = scoringConfig.categories.map(c => c.id);
  const matching5D = CANONICAL_5D_CATEGORY_IDS.filter(id => categoryIds.includes(id));
  
  // At least 3 of 5 canonical dimensions → Insight Dimensions mode
  if (matching5D.length >= 3) {
    return 'insight-dimensions';
  }
  
  // Has categories but not 5D → Generic scoring
  return 'generic-scoring';
}

/**
 * Full confidence analysis for a survey's analytics.
 */
export function analyzeAnalyticsConfidence(params: {
  scoringConfig: ScoringConfigSummary | undefined | null;
  responseCount: number;
  versionCount: number;
  hasManagerData: boolean;
}): AnalyticsConfidenceResult {
  const { scoringConfig, responseCount, versionCount, hasManagerData } = params;
  
  const mode = determineAnalyticsMode(scoringConfig);
  const warnings: AnalyticsWarning[] = [];
  
  const hasScoringEnabled = scoringConfig?.enabled ?? false;
  const categoryCount = scoringConfig?.categories?.length ?? 0;
  const hasValidCategories = categoryCount > 0;
  
  // =========================================================================
  // Generate warnings
  // =========================================================================
  
  // No responses
  if (responseCount === 0) {
    warnings.push({
      type: 'no-responses',
      severity: 'info',
      title: 'No Responses Yet',
      message: 'This survey has not received any responses. Analytics will appear once responses are submitted.',
    });
  }
  // Low response count
  else if (responseCount < MIN_RESPONSES_MEANINGFUL) {
    warnings.push({
      type: 'low-responses',
      severity: 'warning',
      title: 'Limited Data',
      message: `Only ${responseCount} response${responseCount === 1 ? '' : 's'}. Results may not be representative. We recommend at least ${MIN_RESPONSES_MEANINGFUL} responses for meaningful analysis.`,
    });
  }
  
  // Single version (can't show trends)
  if (versionCount <= 1 && hasScoringEnabled) {
    warnings.push({
      type: 'single-version',
      severity: 'info',
      title: 'Single Snapshot Mode',
      message: 'Only one scoring version available. Trend analysis requires multiple versions over time.',
    });
  }
  
  // Misconfigured scoring
  if (mode === 'misconfigured') {
    warnings.push({
      type: 'misconfigured',
      severity: 'error',
      title: 'Scoring Misconfigured',
      message: 'Scoring is enabled but no categories are defined. Please configure scoring categories in the Survey Builder.',
    });
  }
  
  // No manager data for manager comparison
  if (!hasManagerData && (mode === 'insight-dimensions' || mode === 'generic-scoring')) {
    warnings.push({
      type: 'no-managers',
      severity: 'info',
      title: 'No Manager Data',
      message: 'Manager comparison requires responses to include manager metadata.',
    });
  }
  
  // =========================================================================
  // Determine what to show
  // =========================================================================
  
  const hasResponses = responseCount > 0;
  const canShowScoring = hasScoringEnabled && hasValidCategories && hasResponses;
  const canShowTrends = canShowScoring && versionCount > 1;
  const is5DMode = mode === 'insight-dimensions';
  
  return {
    mode,
    
    // Always show these if there are responses
    showParticipation: true, // Always show, even with 0 responses
    showQuestionSummary: hasResponses,
    
    // Scoring-dependent
    showIndexDistribution: canShowScoring,
    showBandDistribution: canShowScoring,
    showDimensionLeaderboard: canShowScoring && is5DMode,
    showManagerComparison: canShowScoring && hasManagerData,
    
    // Trend-dependent
    showTrends: canShowTrends,
    showBeforeAfter: canShowTrends,
    
    // Metadata
    warnings,
    responseCount,
    versionCount,
    categoryCount,
    hasScoringEnabled,
    hasValidCategories,
  };
}

/**
 * Check if all dimension scores are null/zero (indicates broken scoring).
 */
export function areAllScoresEmpty(scores: Record<string, number | null> | undefined): boolean {
  if (!scores) return true;
  return Object.values(scores).every(s => s === null || s === 0);
}

/**
 * Check if distribution data is effectively empty (all counts are 0).
 */
export function isDistributionEmpty(
  buckets: Array<{ count: number }> | undefined
): boolean {
  if (!buckets || buckets.length === 0) return true;
  return buckets.every(b => b.count === 0);
}

