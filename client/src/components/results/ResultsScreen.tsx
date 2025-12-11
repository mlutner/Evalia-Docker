/**
 * ResultsScreen - Survey results display for respondents
 *
 * This component displays survey results to respondents after they complete a survey.
 * It shows:
 * - Overall score percentage and band
 * - Category breakdown with progress bars
 * - Band-specific messaging and colors
 * - Thank you message
 *
 * @module components/results/ResultsScreen
 */

import React from 'react';
import type { ScoringResult } from '@core/scoring/strategies';
import type { ResultsScreenConfig, ScoreBandConfig } from '@core/results/resultsSchemas';
import { resolveIndexBand, INDEX_BAND_DEFINITIONS } from '@shared/analyticsBands';
import { CheckCircle2 } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ResultsScreenProps {
  /** Scoring result containing total score and category breakdowns */
  scoring: ScoringResult;
  /** Results configuration from survey settings */
  resultsConfig?: ResultsScreenConfig | null;
  /** Optional override for band configuration */
  customBand?: ScoreBandConfig | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED STYLES (V2 Design System)
// ═══════════════════════════════════════════════════════════════════════════════

const V2_COLORS = {
  primary: '#2F8FA5',
  primaryLight: '#E1F6F3',
  border: '#E2E7EF',
  background: '#F7F9FC',
  text: '#1C2635',
  textSecondary: '#6A7789',
  success: '#37C0A3',
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Resolve score band from custom config or default bands
 */
function resolveScoreBand(
  percentage: number,
  scoreRanges?: ScoreBandConfig[]
): ScoreBandConfig | null {
  // Try custom score ranges first
  if (scoreRanges && scoreRanges.length > 0) {
    const band = scoreRanges.find(
      (range) => percentage >= range.min && percentage <= range.max
    );
    if (band) return band;
  }

  // Fall back to default index bands
  const indexBand = resolveIndexBand(percentage);
  const bandDef = INDEX_BAND_DEFINITIONS.find((b) => b.bandId === indexBand.bandId);

  if (bandDef) {
    return {
      id: bandDef.bandId,
      min: bandDef.min,
      max: bandDef.max,
      label: bandDef.label,
      color: bandDef.color,
      tone: bandDef.severity === 'critical' || bandDef.severity === 'warning'
        ? 'risk'
        : bandDef.severity === 'excellent' || bandDef.severity === 'good'
        ? 'strength'
        : 'neutral',
    };
  }

  return null;
}

/**
 * Calculate percentage
 */
function calculatePercentage(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function ResultsScreen({
  scoring,
  resultsConfig,
  customBand,
}: ResultsScreenProps) {
  // Don't render if results are disabled
  if (resultsConfig && !resultsConfig.enabled) {
    return null;
  }

  const percentage = scoring.percentage;
  const band = customBand || resolveScoreBand(percentage, resultsConfig?.scoreRanges);

  // Get categories from scoring result
  const categories = Object.entries(scoring.byCategory).map(([id, data]) => ({
    id,
    label: data.label || id,
    score: data.score,
    maxScore: data.maxScore,
    percentage: calculatePercentage(data.score, data.maxScore),
  }));

  // Determine if we should show various sections
  const showTotalScore = resultsConfig?.showTotalScore ?? true;
  const showPercentage = resultsConfig?.showPercentage ?? true;
  const showOverallBand = resultsConfig?.showOverallBand ?? true;
  const showCategoryBreakdown = resultsConfig?.showCategoryBreakdown ?? true;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Thank You Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
        <div
          className="p-8 text-center"
          style={{
            background: `linear-gradient(135deg, ${V2_COLORS.primary}15 0%, ${V2_COLORS.primaryLight} 100%)`,
          }}
        >
          <div className="flex justify-center mb-4">
            <CheckCircle2
              size={64}
              style={{ color: V2_COLORS.success }}
              strokeWidth={2}
            />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: V2_COLORS.text }}>
            {resultsConfig?.title || 'Thank You!'}
          </h1>
          <p className="text-lg" style={{ color: V2_COLORS.textSecondary }}>
            {resultsConfig?.subtitle || 'Your responses have been submitted successfully.'}
          </p>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8">
          {/* Overall Score */}
          <div className="text-center mb-8">
            <p
              className="text-sm uppercase tracking-wide font-semibold mb-2"
              style={{ color: V2_COLORS.textSecondary }}
            >
              Your Score
            </p>
            <div className="flex items-center justify-center gap-4 mb-4">
              {showPercentage && (
                <div
                  className="text-6xl font-bold"
                  style={{ color: band?.color || V2_COLORS.primary }}
                >
                  {percentage}%
                </div>
              )}
              {showTotalScore && (
                <div className="text-left">
                  <div className="text-2xl font-semibold" style={{ color: V2_COLORS.text }}>
                    {scoring.totalScore.toFixed(1)}
                  </div>
                  <div className="text-sm" style={{ color: V2_COLORS.textSecondary }}>
                    out of {scoring.maxScore.toFixed(1)}
                  </div>
                </div>
              )}
            </div>

            {/* Band Badge */}
            {showOverallBand && band && (
              <div className="flex justify-center mb-4">
                <div
                  className="px-6 py-3 rounded-full font-semibold text-lg"
                  style={{
                    backgroundColor: `${band.color}20`,
                    color: band.color,
                    border: `2px solid ${band.color}`,
                  }}
                >
                  {band.label}
                </div>
              </div>
            )}

            {/* Band Summary */}
            {band?.summary && (
              <p
                className="text-base max-w-2xl mx-auto"
                style={{ color: V2_COLORS.text }}
              >
                {band.summary}
              </p>
            )}
          </div>

          {/* Category Breakdown */}
          {showCategoryBreakdown && categories.length > 0 && (
            <div className="border-t pt-8" style={{ borderColor: V2_COLORS.border }}>
              <h2
                className="text-xl font-semibold mb-6"
                style={{ color: V2_COLORS.text }}
              >
                Category Breakdown
              </h2>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-sm font-medium"
                        style={{ color: V2_COLORS.text }}
                      >
                        {category.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: V2_COLORS.textSecondary }}
                        >
                          {category.score.toFixed(1)} / {category.maxScore.toFixed(1)}
                        </span>
                        <span
                          className="text-sm font-bold min-w-[45px] text-right"
                          style={{ color: V2_COLORS.primary }}
                        >
                          {category.percentage}%
                        </span>
                      </div>
                    </div>
                    <div
                      className="h-3 rounded-full overflow-hidden"
                      style={{ backgroundColor: V2_COLORS.background }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${category.percentage}%`,
                          backgroundColor: V2_COLORS.primary,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manager Tips */}
          {band?.managerTips && band.managerTips.length > 0 && (
            <div
              className="mt-8 p-6 rounded-xl"
              style={{
                backgroundColor: V2_COLORS.background,
                border: `1px solid ${V2_COLORS.border}`,
              }}
            >
              <h3
                className="text-sm font-semibold uppercase tracking-wide mb-3"
                style={{ color: V2_COLORS.textSecondary }}
              >
                Recommendations
              </h3>
              <ul className="space-y-2">
                {band.managerTips.map((tip, idx) => (
                  <li
                    key={idx}
                    className="text-sm flex items-start gap-2"
                    style={{ color: V2_COLORS.text }}
                  >
                    <span style={{ color: V2_COLORS.primary }}>•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Organization Actions */}
          {band?.orgActions && band.orgActions.length > 0 && (
            <div
              className="mt-4 p-6 rounded-xl"
              style={{
                backgroundColor: V2_COLORS.background,
                border: `1px solid ${V2_COLORS.border}`,
              }}
            >
              <h3
                className="text-sm font-semibold uppercase tracking-wide mb-3"
                style={{ color: V2_COLORS.textSecondary }}
              >
                Next Steps
              </h3>
              <ul className="space-y-2">
                {band.orgActions.map((action, idx) => (
                  <li
                    key={idx}
                    className="text-sm flex items-start gap-2"
                    style={{ color: V2_COLORS.text }}
                  >
                    <span style={{ color: V2_COLORS.primary }}>•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer Note */}
          {resultsConfig?.footerNote && (
            <div className="mt-8 pt-6 border-t" style={{ borderColor: V2_COLORS.border }}>
              <p
                className="text-sm text-center"
                style={{ color: V2_COLORS.textSecondary }}
              >
                {resultsConfig.footerNote}
              </p>
            </div>
          )}

          {/* Call to Action */}
          {resultsConfig?.showCallToAction &&
            resultsConfig.ctaLabel &&
            resultsConfig.ctaUrl && (
              <div className="mt-8 text-center">
                <a
                  href={resultsConfig.ctaUrl}
                  className="inline-block px-8 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg"
                  style={{
                    backgroundColor: V2_COLORS.primary,
                  }}
                >
                  {resultsConfig.ctaLabel}
                </a>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
