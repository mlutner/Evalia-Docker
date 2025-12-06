/**
 * useDashboardMode - Determine which analytics dashboard to show
 * 
 * [ANAL-DASH-010] Routes surveys to the appropriate dashboard:
 * - insight-dimensions: Full 5D EID dashboard (canonical dimensions)
 * - generic-scoring: Category-based dashboard (has scoring but not 5D)
 * - basic: No scoring - participation + questions only
 * 
 * This decouples "Evalia = platform" from "Evalia Insight 5D = one scoring model".
 */

import { useMemo } from "react";
import type { Survey, SurveyScoreConfig } from "@shared/schema";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Dashboard modes based on survey configuration.
 */
export type DashboardMode = 
  | 'insight-dimensions'  // Full 5D EID analytics
  | 'generic-scoring'     // Category-based scoring (not 5D)
  | 'basic';              // No scoring

/**
 * Result of dashboard mode detection.
 */
export interface DashboardModeResult {
  mode: DashboardMode;
  /** Human-readable dashboard title */
  title: string;
  /** Whether survey has scoring enabled */
  hasScoringEnabled: boolean;
  /** Whether survey matches 5D canonical categories */
  is5DDashboard: boolean;
  /** Number of categories */
  categoryCount: number;
  /** Category names for display */
  categoryNames: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Canonical 5D Insight Dimension category IDs.
 * If a survey has at least 3 of these, it qualifies for 5D dashboard.
 */
export const CANONICAL_5D_CATEGORY_IDS = [
  'engagement',
  'leadership-effectiveness', 
  'psychological-safety',
  'team-wellbeing',
  'burnout-risk',
] as const;

/**
 * Minimum number of canonical 5D categories needed to qualify.
 */
const MIN_5D_CATEGORIES = 3;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Check if score config matches the canonical 5D Insight Dimensions.
 */
export function isCanonical5DDashboard(
  categories: Array<{ id: string; name: string }> | undefined
): boolean {
  if (!categories || categories.length === 0) return false;
  
  const categoryIds = categories.map(c => c.id.toLowerCase());
  const matching5D = CANONICAL_5D_CATEGORY_IDS.filter(id => 
    categoryIds.includes(id) || categoryIds.includes(id.replace(/-/g, ''))
  );
  
  return matching5D.length >= MIN_5D_CATEGORIES;
}

/**
 * Determine dashboard mode from score config.
 */
export function determineDashboardMode(
  scoreConfig: SurveyScoreConfig | undefined | null
): DashboardMode {
  // No config or disabled → Basic mode
  if (!scoreConfig || !scoreConfig.enabled) {
    return 'basic';
  }
  
  // Enabled but no categories → Basic (can't score without categories)
  if (!scoreConfig.categories || scoreConfig.categories.length === 0) {
    return 'basic';
  }
  
  // Check if it matches 5D
  if (isCanonical5DDashboard(scoreConfig.categories)) {
    return 'insight-dimensions';
  }
  
  // Has categories but not 5D → Generic scoring
  return 'generic-scoring';
}

/**
 * Get dashboard title based on mode.
 */
function getDashboardTitle(mode: DashboardMode): string {
  switch (mode) {
    case 'insight-dimensions':
      return 'Insight Dimensions Analytics';
    case 'generic-scoring':
      return 'Category Analytics';
    case 'basic':
      return 'Survey Analytics';
  }
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to determine which analytics dashboard to show for a survey.
 * 
 * @param survey - The survey to analyze (or just scoreConfig)
 * @returns Dashboard mode information
 */
export function useDashboardMode(
  survey: Survey | undefined | null
): DashboardModeResult {
  return useMemo(() => {
    const scoreConfig = survey?.scoreConfig;
    const mode = determineDashboardMode(scoreConfig);
    const categories = scoreConfig?.categories ?? [];
    
    return {
      mode,
      title: getDashboardTitle(mode),
      hasScoringEnabled: scoreConfig?.enabled ?? false,
      is5DDashboard: mode === 'insight-dimensions',
      categoryCount: categories.length,
      categoryNames: categories.map(c => c.name),
    };
  }, [survey]);
}

/**
 * Hook variant that takes scoreConfig directly.
 */
export function useDashboardModeFromConfig(
  scoreConfig: SurveyScoreConfig | undefined | null
): DashboardModeResult {
  return useMemo(() => {
    const mode = determineDashboardMode(scoreConfig);
    const categories = scoreConfig?.categories ?? [];
    
    return {
      mode,
      title: getDashboardTitle(mode),
      hasScoringEnabled: scoreConfig?.enabled ?? false,
      is5DDashboard: mode === 'insight-dimensions',
      categoryCount: categories.length,
      categoryNames: categories.map(c => c.name),
    };
  }, [scoreConfig]);
}

