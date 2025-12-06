/**
 * useAnalyticsConfidence - Hook for determining analytics display mode
 * 
 * [ANAL-QA-050] Centralized logic for what analytics to show based on
 * survey configuration and data availability.
 */

import { useMemo } from "react";
import { 
  analyzeAnalyticsConfidence, 
  type AnalyticsConfidenceResult,
  type ScoringConfigSummary,
} from "@shared/analyticsConfidence";
import type { Survey, SurveyScoreConfig } from "@shared/schema";

interface UseAnalyticsConfidenceParams {
  survey: Survey | undefined | null;
  responseCount: number;
  versionCount: number;
  hasManagerData: boolean;
}

/**
 * Analyze survey for analytics confidence.
 * Returns what charts to show and any warnings.
 */
export function useAnalyticsConfidence({
  survey,
  responseCount,
  versionCount,
  hasManagerData,
}: UseAnalyticsConfidenceParams): AnalyticsConfidenceResult {
  return useMemo(() => {
    // Convert survey scoreConfig to summary format
    const scoringConfig: ScoringConfigSummary | undefined = survey?.scoreConfig ? {
      enabled: survey.scoreConfig.enabled ?? false,
      categories: survey.scoreConfig.categories ?? [],
      hasScoreRanges: (survey.scoreConfig.scoreRanges?.length ?? 0) > 0,
    } : undefined;

    return analyzeAnalyticsConfidence({
      scoringConfig,
      responseCount,
      versionCount,
      hasManagerData,
    });
  }, [survey, responseCount, versionCount, hasManagerData]);
}

/**
 * Simplified hook that just checks if scoring is properly configured.
 */
export function useScoringValid(scoreConfig: SurveyScoreConfig | undefined | null): {
  isValid: boolean;
  issue: 'no-categories' | 'no-mappings' | 'no-score-ranges' | null;
} {
  return useMemo(() => {
    if (!scoreConfig || !scoreConfig.enabled) {
      return { isValid: true, issue: null }; // Scoring disabled is valid
    }
    
    if (!scoreConfig.categories || scoreConfig.categories.length === 0) {
      return { isValid: false, issue: 'no-categories' };
    }
    
    if (!scoreConfig.scoreRanges || scoreConfig.scoreRanges.length === 0) {
      return { isValid: false, issue: 'no-score-ranges' };
    }
    
    return { isValid: true, issue: null };
  }, [scoreConfig]);
}

