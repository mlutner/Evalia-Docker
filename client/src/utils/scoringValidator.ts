/**
 * Scoring Validation Layer
 * 
 * Validates survey scoring configuration before save/publish.
 * Catches misconfigurations that could produce incorrect or confusing results.
 */

import type { Question, SurveyScoreConfig, ScoreBandConfig } from '@shared/schema';

// ============================================================================
// TYPES
// ============================================================================

export type ScoringIssueSeverity = 'error' | 'warning' | 'info';

export interface ScoringValidationResult {
  code: string;
  severity: ScoringIssueSeverity;
  message: string;
  questionId?: string;
  categoryId?: string;
  bandId?: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// MAIN VALIDATION
// ============================================================================

/**
 * Main validation entry point for scoring configuration
 */
export function validateScoreConfig(
  questions: Question[],
  scoreConfig?: SurveyScoreConfig | null
): ScoringValidationResult[] {
  const results: ScoringValidationResult[] = [];

  // If scoring is disabled, skip validation
  if (!scoreConfig?.enabled) {
    return results;
  }

  // Run all validation checks
  results.push(...checkBandCoverage(scoreConfig));
  results.push(...checkBandOverlaps(scoreConfig));
  results.push(...checkBandMinMax(scoreConfig));
  results.push(...checkCategoryUsage(questions, scoreConfig));
  results.push(...checkScorableQuestions(questions, scoreConfig));
  results.push(...checkWeightDistribution(questions));

  return results;
}

// ============================================================================
// BAND VALIDATION
// ============================================================================

/**
 * Check that bands fully cover the 0-100 score range without gaps
 */
function checkBandCoverage(scoreConfig: SurveyScoreConfig): ScoringValidationResult[] {
  const results: ScoringValidationResult[] = [];
  const bands = scoreConfig.scoreRanges || scoreConfig.resultsScreen?.scoreRanges || [];

  if (bands.length === 0) {
    results.push({
      code: 'NO_BANDS_DEFINED',
      severity: 'warning',
      message: 'Scoring is enabled but no score bands are defined',
    });
    return results;
  }

  // Sort bands by min value
  const sortedBands = [...bands].sort((a, b) => a.min - b.max);

  // Check coverage from 0 to 100
  const ranges: Array<{ min: number; max: number; bandId: string }> = sortedBands.map(b => ({
    min: b.min,
    max: b.max,
    bandId: b.id,
  }));

  // Find gaps
  let currentCoverage = 0;
  for (const range of ranges.sort((a, b) => a.min - b.min)) {
    if (range.min > currentCoverage) {
      results.push({
        code: 'BAND_GAP',
        severity: 'error',
        message: `Score range ${currentCoverage}-${range.min - 1} has no assigned band`,
        details: { gapStart: currentCoverage, gapEnd: range.min - 1 },
      });
    }
    currentCoverage = Math.max(currentCoverage, range.max + 1);
  }

  // Check if we reach 100
  if (currentCoverage <= 100) {
    results.push({
      code: 'BAND_GAP',
      severity: 'error',
      message: `Score range ${currentCoverage}-100 has no assigned band`,
      details: { gapStart: currentCoverage, gapEnd: 100 },
    });
  }

  return results;
}

/**
 * Check for overlapping band ranges
 */
function checkBandOverlaps(scoreConfig: SurveyScoreConfig): ScoringValidationResult[] {
  const results: ScoringValidationResult[] = [];
  const bands = scoreConfig.scoreRanges || scoreConfig.resultsScreen?.scoreRanges || [];

  if (bands.length < 2) {
    return results;
  }

  // Check each pair of bands for overlap
  for (let i = 0; i < bands.length; i++) {
    for (let j = i + 1; j < bands.length; j++) {
      const a = bands[i];
      const b = bands[j];

      // Two ranges overlap if: a.min <= b.max && b.min <= a.max
      if (a.min <= b.max && b.min <= a.max) {
        const overlapStart = Math.max(a.min, b.min);
        const overlapEnd = Math.min(a.max, b.max);
        
        results.push({
          code: 'BAND_OVERLAP',
          severity: 'error',
          message: `Bands "${a.label}" and "${b.label}" overlap in range ${overlapStart}-${overlapEnd}`,
          bandId: a.id,
          details: {
            band1: { id: a.id, label: a.label, min: a.min, max: a.max },
            band2: { id: b.id, label: b.label, min: b.min, max: b.max },
            overlapRange: { start: overlapStart, end: overlapEnd },
          },
        });
      }
    }
  }

  return results;
}

/**
 * Check that band min/max values are sensible
 */
function checkBandMinMax(scoreConfig: SurveyScoreConfig): ScoringValidationResult[] {
  const results: ScoringValidationResult[] = [];
  const bands = scoreConfig.scoreRanges || scoreConfig.resultsScreen?.scoreRanges || [];

  for (const band of bands) {
    // min should be less than max
    if (band.min >= band.max) {
      results.push({
        code: 'INVALID_BAND_RANGE',
        severity: 'error',
        message: `Band "${band.label}" has invalid range: min (${band.min}) >= max (${band.max})`,
        bandId: band.id,
        details: { min: band.min, max: band.max },
      });
    }

    // Values should be 0-100
    if (band.min < 0) {
      results.push({
        code: 'BAND_OUT_OF_RANGE',
        severity: 'error',
        message: `Band "${band.label}" has negative min value (${band.min})`,
        bandId: band.id,
      });
    }

    if (band.max > 100) {
      results.push({
        code: 'BAND_OUT_OF_RANGE',
        severity: 'warning',
        message: `Band "${band.label}" max value (${band.max}) exceeds 100`,
        bandId: band.id,
      });
    }
  }

  return results;
}

// ============================================================================
// CATEGORY VALIDATION
// ============================================================================

/**
 * Check that all defined categories are used by at least one question
 */
function checkCategoryUsage(
  questions: Question[],
  scoreConfig: SurveyScoreConfig
): ScoringValidationResult[] {
  const results: ScoringValidationResult[] = [];
  const categories = scoreConfig.categories || [];

  if (categories.length === 0) {
    return results;
  }

  // Count questions per category
  const categoryQuestionCount = new Map<string, number>();
  for (const cat of categories) {
    categoryQuestionCount.set(cat.id, 0);
  }

  for (const q of questions) {
    if (q.scorable && q.scoringCategory) {
      const count = categoryQuestionCount.get(q.scoringCategory) || 0;
      categoryQuestionCount.set(q.scoringCategory, count + 1);
    }
  }

  // Find unused categories
  for (const [catId, count] of categoryQuestionCount) {
    if (count === 0) {
      const cat = categories.find(c => c.id === catId);
      results.push({
        code: 'UNUSED_CATEGORY',
        severity: 'warning',
        message: `Category "${cat?.name || catId}" is defined but no questions are assigned to it`,
        categoryId: catId,
      });
    }
  }

  return results;
}

/**
 * Check that scorable questions have proper configuration
 */
function checkScorableQuestions(
  questions: Question[],
  scoreConfig: SurveyScoreConfig
): ScoringValidationResult[] {
  const results: ScoringValidationResult[] = [];
  const categoryIds = new Set((scoreConfig.categories || []).map(c => c.id));

  for (const q of questions) {
    if (!q.scorable) continue;

    // Check if scorable question has a category
    if (!q.scoringCategory) {
      results.push({
        code: 'SCORABLE_NO_CATEGORY',
        severity: 'warning',
        message: `Scorable question "${q.question?.slice(0, 50)}..." has no category assigned`,
        questionId: q.id,
      });
    } else if (categoryIds.size > 0 && !categoryIds.has(q.scoringCategory)) {
      results.push({
        code: 'INVALID_CATEGORY_REF',
        severity: 'error',
        message: `Question references non-existent category "${q.scoringCategory}"`,
        questionId: q.id,
        categoryId: q.scoringCategory,
      });
    }

    // Check if choice-based question has optionScores
    const needsOptionScores = ['multiple_choice', 'dropdown', 'yes_no', 'checkbox'].includes(q.type);
    if (needsOptionScores && (!q.optionScores || Object.keys(q.optionScores).length === 0)) {
      results.push({
        code: 'MISSING_OPTION_SCORES',
        severity: 'warning',
        message: `Scorable ${q.type} question has no option scores defined`,
        questionId: q.id,
      });
    }
  }

  return results;
}

// ============================================================================
// WEIGHT VALIDATION
// ============================================================================

/**
 * Flag suspicious weight distributions
 */
function checkWeightDistribution(questions: Question[]): ScoringValidationResult[] {
  const results: ScoringValidationResult[] = [];
  
  const scorableQuestions = questions.filter(q => q.scorable);
  if (scorableQuestions.length < 3) {
    return results; // Not enough questions to detect imbalance
  }

  const weights = scorableQuestions.map(q => q.scoreWeight ?? 1);
  const sum = weights.reduce((a, b) => a + b, 0);
  const avg = sum / weights.length;
  const max = Math.max(...weights);
  const min = Math.min(...weights);

  // Flag if any single question has weight > 50% of total
  const totalWeight = sum;
  for (const q of scorableQuestions) {
    const weight = q.scoreWeight ?? 1;
    const percentage = (weight / totalWeight) * 100;
    
    if (percentage > 50) {
      results.push({
        code: 'WEIGHT_IMBALANCE',
        severity: 'warning',
        message: `Question has ${percentage.toFixed(0)}% of total weight (${weight} of ${totalWeight})`,
        questionId: q.id,
        details: { weight, totalWeight, percentage },
      });
    }
  }

  // Flag if weight variance is extreme (max > 5x min)
  if (max > min * 5 && min > 0) {
    results.push({
      code: 'EXTREME_WEIGHT_VARIANCE',
      severity: 'info',
      message: `Weight variance is high: max weight (${max}) is ${(max / min).toFixed(1)}x the min weight (${min})`,
      details: { maxWeight: max, minWeight: min, ratio: max / min },
    });
  }

  return results;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get human-readable summary of validation results
 */
export function summarizeScoringValidation(results: ScoringValidationResult[]): {
  errorCount: number;
  warningCount: number;
  infoCount: number;
  isValid: boolean;
} {
  const errorCount = results.filter(r => r.severity === 'error').length;
  const warningCount = results.filter(r => r.severity === 'warning').length;
  const infoCount = results.filter(r => r.severity === 'info').length;

  return {
    errorCount,
    warningCount,
    infoCount,
    isValid: errorCount === 0,
  };
}

/**
 * Filter results by severity
 */
export function filterScoringBySeverity(
  results: ScoringValidationResult[],
  severity: ScoringIssueSeverity
): ScoringValidationResult[] {
  return results.filter(r => r.severity === severity);
}

