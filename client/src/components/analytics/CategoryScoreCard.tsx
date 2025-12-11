/**
 * CategoryScoreCard - Overall score summary card
 *
 * [ANAL-DASH-010] Summary card for generic scoring dashboard.
 *
 * Shows:
 * - Overall average score across categories
 * - Overall band (if scoreRanges defined)
 * - Response count
 * - Category count
 *
 * Updated: December 2024 - Coral/Teal warm design system
 */

import React from "react";
import { Loader2, Users, Layers } from "lucide-react";
import { getColorForScore } from "@shared/analyticsBands";

// ============================================================================
// TYPES
// ============================================================================

interface ScoreRange {
  id: string;
  min: number;
  max: number;
  label: string;
  color?: string;
  interpretation?: string;
}

interface CategoryScoreCardProps {
  overallScore: number | null;
  categoryCount: number;
  responseCount: number;
  scoreRanges?: ScoreRange[];
  isLoading?: boolean;
  title?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function resolveBandFromRanges(
  score: number,
  scoreRanges: ScoreRange[] | undefined
): { label: string; color: string; interpretation?: string } | null {
  if (!scoreRanges || scoreRanges.length === 0) return null;

  const band = scoreRanges.find(r => score >= r.min && score <= r.max);
  if (!band) return null;

  return {
    label: band.label,
    color: band.color || getColorForScore(score),
    interpretation: band.interpretation,
  };
}

// Map old red-based colors to new coral/teal palette
function mapScoreToDesignSystemColor(score: number): string {
  if (score >= 80) return 'var(--teal-500)';      // Thriving
  if (score >= 60) return 'var(--sage)';          // Developing
  if (score >= 40) return 'var(--yuzu)';          // Emerging
  if (score >= 20) return 'var(--peach)';         // Concerning
  return 'var(--coral-500)';                       // Critical
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CategoryScoreCard({
  overallScore,
  categoryCount,
  responseCount,
  scoreRanges,
  isLoading = false,
  title = "Overall Score",
}: CategoryScoreCardProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="evalia-card">
        <div className="h-32 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--coral-500)]" />
        </div>
      </div>
    );
  }

  const hasScore = overallScore !== null && !isNaN(overallScore);
  const band = hasScore ? resolveBandFromRanges(overallScore, scoreRanges) : null;
  const scoreColor = hasScore
    ? (band?.color || mapScoreToDesignSystemColor(overallScore))
    : 'var(--ink-200)';

  return (
    <div className="evalia-card">
      <h3 className="evalia-card-title mb-4">{title}</h3>
      <div className="flex items-start justify-between">
        {/* Score Display */}
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span
              className="text-5xl font-bold font-[var(--font-mono)]"
              style={{ color: scoreColor }}
            >
              {hasScore ? Math.round(overallScore) : '—'}
            </span>
            {hasScore && (
              <span className="text-xl text-[var(--ink-200)]">/100</span>
            )}
          </div>

          {/* Band Badge */}
          {band && (
            <div className="mt-3">
              <span
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: `${band.color}15`,
                  color: band.color,
                  border: `1px solid ${band.color}30`
                }}
              >
                {band.label}
              </span>
              {band.interpretation && (
                <p className="text-sm text-[var(--ink-300)] mt-2 line-clamp-2">
                  {band.interpretation}
                </p>
              )}
            </div>
          )}

          {!hasScore && (
            <p className="text-sm text-[var(--ink-200)] mt-2">
              No score data available
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-4 text-right">
          <div className="flex items-center gap-3 justify-end">
            <div>
              <div className="text-2xl font-bold text-[var(--ink-500)] font-[var(--font-mono)]">{responseCount}</div>
              <div className="text-xs text-[var(--ink-200)] uppercase tracking-wider">Responses</div>
            </div>
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--coral-50)] flex items-center justify-center">
              <Users className="w-5 h-5 text-[var(--coral-600)]" />
            </div>
          </div>
          <div className="flex items-center gap-3 justify-end">
            <div>
              <div className="text-2xl font-bold text-[var(--ink-500)] font-[var(--font-mono)]">{categoryCount}</div>
              <div className="text-xs text-[var(--ink-200)] uppercase tracking-wider">Categories</div>
            </div>
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--teal-50)] flex items-center justify-center">
              <Layers className="w-5 h-5 text-[var(--teal-600)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Score Bar */}
      {hasScore && (
        <div className="mt-6">
          <div className="evalia-progress">
            <div
              className="evalia-progress-bar animate-progress"
              style={{
                width: `${Math.min(100, overallScore)}%`,
                background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}dd)`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
