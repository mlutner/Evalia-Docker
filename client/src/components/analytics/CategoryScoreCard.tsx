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
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, Layers } from "lucide-react";
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
      <Card className="bg-white border border-gray-200">
        <CardContent className="pt-6">
          <div className="h-32 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasScore = overallScore !== null && !isNaN(overallScore);
  const band = hasScore ? resolveBandFromRanges(overallScore, scoreRanges) : null;
  const scoreColor = hasScore ? (band?.color || getColorForScore(overallScore)) : '#6b7280';

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between">
          {/* Score Display */}
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span 
                className="text-5xl font-bold"
                style={{ color: scoreColor }}
              >
                {hasScore ? Math.round(overallScore) : '—'}
              </span>
              {hasScore && (
                <span className="text-xl text-gray-400">/100</span>
              )}
            </div>
            
            {/* Band Badge */}
            {band && (
              <div className="mt-2">
                <span 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: `${band.color}20`, 
                    color: band.color 
                  }}
                >
                  {band.label}
                </span>
                {band.interpretation && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {band.interpretation}
                  </p>
                )}
              </div>
            )}
            
            {!hasScore && (
              <p className="text-sm text-gray-500 mt-2">
                No score data available
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-3 text-right">
            <div className="flex items-center gap-2 justify-end">
              <div>
                <div className="text-2xl font-bold text-gray-900">{responseCount}</div>
                <div className="text-xs text-gray-500">Responses</div>
              </div>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <div>
                <div className="text-2xl font-bold text-gray-900">{categoryCount}</div>
                <div className="text-xs text-gray-500">Categories</div>
              </div>
              <Layers className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Score Bar */}
        {hasScore && (
          <div className="mt-4">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(100, overallScore)}%`, 
                  backgroundColor: scoreColor 
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

