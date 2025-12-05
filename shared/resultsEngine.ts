import type { SurveyScoreConfig, ScoreBandConfig } from './schema';

type CategorySnapshot = {
  score: number;
  maxScore: number;
  label: string;
};

export function resolveScoreBand(
  percentage: number,
  scoreConfig?: SurveyScoreConfig | null
): ScoreBandConfig | null {
  if (!scoreConfig) return null;
  const ranges =
    scoreConfig.resultsScreen?.scoreRanges ||
    scoreConfig.scoreRanges ||
    [];
  if (!ranges.length) return null;
  return (
    ranges.find((band) => percentage >= band.min && percentage <= band.max) ||
    null
  );
}

export function resolveCategoryBands(
  byCategory: Record<string, CategorySnapshot>,
  scoreConfig?: SurveyScoreConfig | null
): Record<string, ScoreBandConfig | null> {
  const result: Record<string, ScoreBandConfig | null> = {};
  if (!scoreConfig) return result;

  const globalBands =
    scoreConfig.resultsScreen?.scoreRanges ||
    scoreConfig.scoreRanges ||
    [];
  const categoryConfigs = scoreConfig.resultsScreen?.categories || [];

  for (const [categoryId, cat] of Object.entries(byCategory)) {
    const pct = cat.maxScore > 0 ? (cat.score / cat.maxScore) * 100 : 0;
    const categoryConfig = categoryConfigs.find(
      (c) => c.categoryId === categoryId
    );
    const bands =
      categoryConfig?.bandsMode === 'custom' && categoryConfig.bands?.length
        ? categoryConfig.bands
        : globalBands;
    if (!bands || !bands.length) {
      result[categoryId] = null;
      continue;
    }
    result[categoryId] =
      bands.find((b) => pct >= b.min && pct <= b.max) || null;
  }
  return result;
}
