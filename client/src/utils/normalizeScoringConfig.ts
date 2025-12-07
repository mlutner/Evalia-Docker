import type { SurveyScoreConfig } from '@shared/schema';

export function normalizeScoringConfig(config?: SurveyScoreConfig | null): SurveyScoreConfig | undefined {
  if (!config) return config ?? undefined;

  const categories = Array.isArray(config.categories) ? [...config.categories] : [];
  const seen = new Set<string>();
  const sanitizedCategories = categories.filter((cat) => {
    if (!cat?.id || seen.has(cat.id)) return false;
    seen.add(cat.id);
    return true;
  });

  const bands = Array.isArray(config.scoreRanges) ? [...config.scoreRanges] : [];
  const bandSeen = new Set<string>();
  const sanitizedBands = sanitizeBands(bands);

  const resultsScreen = config.resultsScreen
    ? {
        ...config.resultsScreen,
        scoreRanges: sanitizeBands(config.resultsScreen.scoreRanges),
        categories: Array.isArray(config.resultsScreen.categories)
          ? config.resultsScreen.categories.map((cat) => ({
              ...cat,
              bands: cat.bands ? sanitizeBands(cat.bands) : undefined,
            }))
          : undefined,
      }
    : undefined;

  return {
    ...config,
    categories: sanitizedCategories,
    scoreRanges: sanitizedBands,
    resultsScreen,
  };
}

function sanitizeBands(bands?: SurveyScoreConfig['scoreRanges']) {
  if (!bands) return undefined;
  const seen = new Set<string>();
  const deduped = bands
    .filter((b) => b && b.id && !seen.has(b.id))
    .map((b) => {
      seen.add(b.id!);
      if (b.min > b.max) {
        return { ...b, min: b.max, max: b.min };
      }
      return b;
    })
    .sort((a, b) => a.min - b.min);

  const nonOverlap: typeof deduped = [];
  deduped.forEach((band) => {
    const last = nonOverlap[nonOverlap.length - 1];
    if (last && band.min <= last.max) {
      // adjust or skip overlap; prefer keeping first band intact
      const adjustedMin = last.max;
      if (adjustedMin < band.max) {
        nonOverlap.push({ ...band, min: adjustedMin });
      }
    } else {
      nonOverlap.push(band);
    }
  });

  return nonOverlap;
}

export function clampScoreWeight(weight?: number | null): number | undefined {
  if (weight === null || weight === undefined) return undefined;
  if (!Number.isFinite(weight)) return undefined;
  // Prevent absurd weights
  return Math.max(0, Math.min(weight, 1000));
}

export function sanitizeOptionScores(optionScores?: Record<string, number> | null) {
  if (!optionScores) return undefined;
  return Object.fromEntries(
    Object.entries(optionScores).map(([k, v]) => [k, Number.isFinite(v) ? v : 0])
  );
}
