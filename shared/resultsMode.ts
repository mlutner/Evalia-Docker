/**
 * Results Mode Resolution
 * 
 * Determines how to render ResultsScreen and Analytics based on survey type:
 * - "index" - Index-based surveys (engagement, 5D) with index-style UI
 * - "self_assessment" - Self-assessment surveys with personal band/narrative UI
 * - "none" - Non-scored surveys (Thank You screen only)
 * 
 * This abstraction allows proper differentiation between:
 * - Engagement/5D surveys (show "Engagement Index" wording)
 * - Leadership/Burnout self-assessments (show "Your Score" wording, no "index")
 * - Feedback surveys (no scoring, Thank You only)
 */

import type { SurveyScoreConfig } from './schema';

export type ResultsMode = 'index' | 'self_assessment' | 'none';

/**
 * Index-based scoring engine IDs
 * These represent surveys that measure organizational indices (engagement, 5D)
 */
const INDEX_ENGINE_IDS = [
  'engagement_v1',
  '5d_wellbeing_v1',
  '5d_engagement_v1',
  'evalia_5d_v1',
] as const;

/**
 * Resolve the results mode for a survey
 * 
 * @param scoreConfig - Survey scoring configuration
 * @param scoringEngineId - Optional scoring engine ID
 * @param tags - Optional survey tags
 * @returns ResultsMode - "index", "self_assessment", or "none"
 */
export function resolveResultsMode(
  scoreConfig: SurveyScoreConfig | undefined,
  scoringEngineId?: string | null,
  tags?: string[]
): ResultsMode {
  // No scoring enabled → none
  if (!scoreConfig?.enabled) {
    return 'none';
  }

  // Check if this is an index-based survey via engine ID
  if (scoringEngineId && INDEX_ENGINE_IDS.includes(scoringEngineId as any)) {
    return 'index';
  }

  // Check if this is an index-based survey via tags
  const indexTags = ['engagement', '5d', 'organizational-index', 'team-index'];
  if (tags?.some(tag => indexTags.includes(tag.toLowerCase()))) {
    return 'index';
  }

  // Check if categories match canonical 5D dimension IDs
  const canonical5DCategories = [
    'leadership-effectiveness',
    'team-wellbeing',
    'burnout-risk',
    'psychological-safety',
    'engagement',
  ];

  const categoryIds = scoreConfig.categories?.map(c => c.id) || [];
  const has5DCategories = canonical5DCategories.some(id => categoryIds.includes(id));
  
  if (has5DCategories && categoryIds.length >= 3) {
    // If survey has 3+ canonical 5D categories, treat as index
    return 'index';
  }

  // Otherwise, it's a self-assessment (scored but not index-based)
  return 'self_assessment';
}

/**
 * Check if a survey should show ResultsScreen
 * 
 * This preserves the existing branching invariant:
 * - resultsScreen.enabled AND scoringPayload !== null → ResultsScreen
 * - otherwise → Thank You screen
 * 
 * @param resultsScreenEnabled - Whether resultsScreen is enabled in config
 * @param scoringPayload - Scoring calculation result
 * @returns boolean - true if ResultsScreen should be shown
 */
export function shouldShowResultsScreen(
  resultsScreenEnabled: boolean | undefined,
  scoringPayload: any
): boolean {
  return Boolean(resultsScreenEnabled && scoringPayload !== null);
}

/**
 * Get display labels for a results mode
 */
export function getResultsModeLabels(mode: ResultsMode) {
  switch (mode) {
    case 'index':
      return {
        title: 'Your Results',
        scoreLabel: 'Index Score',
        bandLabel: 'Performance Band',
        description: 'See how your responses compare to organizational benchmarks',
      };
    case 'self_assessment':
      return {
        title: 'Your Results',
        scoreLabel: 'Your Score',
        bandLabel: 'Your Band',
        description: 'Personal insights based on your responses',
      };
    case 'none':
      return {
        title: 'Thank You',
        scoreLabel: '',
        bandLabel: '',
        description: 'Your responses have been recorded',
      };
  }
}
