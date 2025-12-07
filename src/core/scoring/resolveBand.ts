/**
 * EVALIA CORE MODULE
 *
 * DO NOT CHANGE existing function signatures, return types, or field names.
 * You may ONLY:
 * - Add new functions
 * - Add new types that do not break existing ones
 *
 * These modules are shared between frontend and backend and must remain deterministic.
 * To change behavior in a breaking way, create a new versioned module instead.
 */

import type { SurveyScoreConfig, ScoreBandConfig } from '@shared/schema';

export function resolveBand(
  percentage: number,
  scoreConfigOrBands?: SurveyScoreConfig | ScoreBandConfig[] | null
): ScoreBandConfig | null {
  if (!scoreConfigOrBands) return null;

  const ranges = Array.isArray(scoreConfigOrBands)
    ? scoreConfigOrBands
    : scoreConfigOrBands.resultsScreen?.scoreRanges ||
      scoreConfigOrBands.scoreRanges ||
      [];
  if (!ranges.length) return null;
  return (
    ranges.find((band) => percentage >= band.min && percentage <= band.max) ||
    null
  );
}
