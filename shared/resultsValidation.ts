import type { SurveyScoreConfig, ScoreBandConfig, ResultsScreenConfig, CategoryResultConfig } from './schema';

export type ResultsConfigValidation = {
  valid: boolean;
  errors: string[];
};

export function validateResultsConfig(
  scoreConfig?: SurveyScoreConfig | null,
): ResultsConfigValidation {
  const errors: string[] = [];
  if (!scoreConfig?.resultsScreen) {
    return { valid: true, errors };
  }
  const rs: ResultsScreenConfig = scoreConfig.resultsScreen;

  const globalBands = rs.scoreRanges?.length ? rs.scoreRanges : scoreConfig.scoreRanges || [];
  validateBands(globalBands, 'overall', errors);

  const categoryIds = new Set((scoreConfig.categories || []).map((c) => c.id));

  (rs.categories || []).forEach((cat) => {
    if (!categoryIds.has(cat.categoryId)) {
      errors.push(`Category ${cat.categoryId} is not defined in scoreConfig.categories`);
    }
    const bands = cat.bandsMode === 'custom' && cat.bands?.length ? cat.bands : globalBands;
    validateBands(bands, `category:${cat.categoryId}`, errors);
    validateBandNarratives(cat, bands, errors);
  });

  return { valid: errors.length === 0, errors };
}

function validateBands(bands: ScoreBandConfig[] | undefined, context: string, errors: string[]) {
  if (!bands || !bands.length) return;
  const sorted = [...bands].sort((a, b) => a.min - b.min);
  const seenIds = new Set<string>();
  sorted.forEach((b, idx) => {
    if (!b.id || seenIds.has(b.id)) {
      errors.push(`Duplicate or missing band id in ${context}`);
    }
    seenIds.add(b.id);
    if (b.min > b.max) {
      errors.push(`Band ${b.id} in ${context} has min > max`);
    }
    if (idx > 0) {
      const prev = sorted[idx - 1];
      if (b.min < prev.max) {
        errors.push(`Band ${b.id} in ${context} overlaps with ${prev.id}`);
      }
    }
  });
}

function validateBandNarratives(cat: CategoryResultConfig, bands: ScoreBandConfig[] | undefined, errors: string[]) {
  if (!cat.bandNarratives || !cat.bandNarratives.length) return;
  const validBandIds = new Set((bands || []).map((b) => b.id));
  cat.bandNarratives.forEach((bn) => {
    if (!validBandIds.has(bn.bandId)) {
      errors.push(`Narrative bandId ${bn.bandId} for category ${cat.categoryId} does not match available bands`);
    }
  });
}
