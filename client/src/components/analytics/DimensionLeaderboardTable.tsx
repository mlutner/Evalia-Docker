/**
 * DimensionLeaderboardTable - Ranked view of all 5 Insight Dimensions
 * 
 * [ANAL-DIM-001] Shows dimensions ranked by performance score.
 * 
 * Features:
 * - Ranks all 5 dimensions by performance score (highest = #1)
 * - Version-aware: respects global VersionSelector
 * - Burnout Risk handling: lower raw score = better performance
 * - Change indicators vs previous version
 * - Mini progress bars for visual comparison
 */

import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle, Trophy, AlertCircle, TrendingUp, TrendingDown, Minus, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  INSIGHT_DIMENSIONS, 
  type IndexTrendsSummaryData,
  type IndexTrendPoint,
} from "@shared/analytics";
import {
  resolveIndexBand,
  resolveTrendDirection,
  calculatePerformanceScore,
  getColorForScore,
  type IndexBandInfo,
} from "@shared/analyticsBands";

// ============================================================================
// TYPES
// ============================================================================

interface DimensionLeaderboardRow {
  dimensionId: string;
  label: string;
  shortLabel: string;
  rawScore: number;
  performanceScore: number;
  band: IndexBandInfo;
  change: number | null;
  trend: 'up' | 'down' | 'neutral';
  isBurnout: boolean;
  rank: number;
}

interface DimensionLeaderboardTableProps {
  data: IndexTrendsSummaryData | undefined;
  selectedVersionId?: string;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
}

// ============================================================================
// DIMENSION KEY MAPPING
// ============================================================================

// Map from IndexTrendPoint.scores keys to INSIGHT_DIMENSIONS
const DIMENSION_KEYS: Array<{
  scoreKey: keyof IndexTrendPoint['scores'];
  dimensionKey: keyof typeof INSIGHT_DIMENSIONS;
  isBurnout: boolean;
}> = [
  { scoreKey: 'leadershipEffectiveness', dimensionKey: 'leadershipEffectiveness', isBurnout: false },
  { scoreKey: 'teamWellbeing', dimensionKey: 'teamWellbeing', isBurnout: false },
  { scoreKey: 'burnoutRisk', dimensionKey: 'burnoutRisk', isBurnout: true },
  { scoreKey: 'psychologicalSafety', dimensionKey: 'psychologicalSafety', isBurnout: false },
  { scoreKey: 'engagement', dimensionKey: 'engagement', isBurnout: false },
];

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get the version's scores from trends data.
 * If selectedVersionId is provided, find that version.
 * Otherwise, use the last (most recent) version.
 */
function getVersionScores(
  data: IndexTrendsSummaryData,
  selectedVersionId?: string
): { current: IndexTrendPoint | undefined; previous: IndexTrendPoint | undefined } {
  if (!data.trends.length) {
    return { current: undefined, previous: undefined };
  }
  
  if (selectedVersionId) {
    const currentIdx = data.trends.findIndex(t => t.versionId === selectedVersionId);
    if (currentIdx === -1) {
      // Version not found, fallback to latest
      return {
        current: data.trends[data.trends.length - 1],
        previous: data.trends.length > 1 ? data.trends[data.trends.length - 2] : undefined,
      };
    }
    return {
      current: data.trends[currentIdx],
      previous: currentIdx > 0 ? data.trends[currentIdx - 1] : undefined,
    };
  }
  
  // No version selected: use latest
  return {
    current: data.trends[data.trends.length - 1],
    previous: data.trends.length > 1 ? data.trends[data.trends.length - 2] : undefined,
  };
}

/**
 * Build leaderboard rows from version scores.
 */
function buildLeaderboardRows(
  current: IndexTrendPoint,
  previous: IndexTrendPoint | undefined
): DimensionLeaderboardRow[] {
  const rows: DimensionLeaderboardRow[] = [];

  for (const { scoreKey, dimensionKey, isBurnout } of DIMENSION_KEYS) {
    const dimension = INSIGHT_DIMENSIONS[dimensionKey];
    if (!dimension) continue;

    const rawScore = current.scores[scoreKey];
    if (rawScore === null) continue;

    const performanceScore = calculatePerformanceScore(rawScore, isBurnout);
    
    // Calculate change vs previous version
    let change: number | null = null;
    if (previous && previous.scores[scoreKey] !== null) {
      change = rawScore - (previous.scores[scoreKey] as number);
    }

    const band = resolveIndexBand(rawScore, { 
      usePerformanceScore: true, 
      isBurnout 
    });

    rows.push({
      dimensionId: dimension.id,
      label: dimension.label,
      shortLabel: dimension.shortLabel,
      rawScore,
      performanceScore,
      band,
      change,
      trend: resolveTrendDirection(change),
      isBurnout,
      rank: 0, // Will be set after sorting
    });
  }

  // Sort by performanceScore descending, tie-break by label
  rows.sort((a, b) => {
    if (b.performanceScore !== a.performanceScore) {
      return b.performanceScore - a.performanceScore;
    }
    return a.label.localeCompare(b.label);
  });

  // Assign ranks
  rows.forEach((row, index) => {
    row.rank = index + 1;
  });

  return rows;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="flex items-center gap-1 text-amber-600 font-bold">
        <Trophy className="w-4 h-4" />
        {rank}
      </span>
    );
  }
  if (rank === 5) {
    return (
      <span className="flex items-center gap-1 text-red-500 font-medium">
        <AlertCircle className="w-4 h-4" />
        {rank}
      </span>
    );
  }
  return <span className="text-gray-600 font-medium">{rank}</span>;
}

function ScoreBadge({ score, band, isBurnout }: { score: number; band: IndexBand; isBurnout: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span 
        className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-semibold"
        style={{ 
          backgroundColor: `${band.color}20`, 
          color: band.color 
        }}
      >
        {score.toFixed(1)}
      </span>
      {isBurnout && (
        <span className="text-xs text-gray-500 flex items-center gap-0.5">
          <ArrowDown className="w-3 h-3" />
          Lower is better
        </span>
      )}
    </div>
  );
}

function TrendIndicator({ change, trend }: { change: number | null; trend: 'up' | 'down' | 'neutral' }) {
  if (change === null) {
    return <span className="text-gray-400">—</span>;
  }

  const Icon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const colorClass = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400';
  const sign = change > 0 ? '+' : '';

  return (
    <span className={`flex items-center gap-1 ${colorClass}`}>
      {sign}{change.toFixed(1)}
      <Icon className="w-4 h-4" />
    </span>
  );
}

function PerformanceBar({ score }: { score: number }) {
  // Performance score is 0-100, show as a mini bar
  const width = Math.max(5, Math.min(100, score));
  
  // [ANAL-QA-030] Use shared helper for color resolution
  const barColor = getColorForScore(score);

  return (
    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${width}%`, backgroundColor: barColor }}
      />
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DimensionLeaderboardTable: React.FC<DimensionLeaderboardTableProps> = ({
  data,
  selectedVersionId,
  isLoading,
  error,
  onRetry,
}) => {
  // Build leaderboard rows
  const { rows, versionLabel } = useMemo(() => {
    if (!data || !data.trends.length) {
      return { rows: [], versionLabel: '' };
    }

    const { current, previous } = getVersionScores(data, selectedVersionId);
    if (!current) {
      return { rows: [], versionLabel: '' };
    }

    return {
      rows: buildLeaderboardRows(current, previous),
      versionLabel: current.versionLabel,
    };
  }, [data, selectedVersionId]);

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Dimension Leaderboard</CardTitle>
          <CardDescription>Your Insight Dimensions ranked by performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Dimension Leaderboard</CardTitle>
          <CardDescription>Your Insight Dimensions ranked by performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
            <p className="text-gray-600 mb-3">{error.message}</p>
            <Button onClick={onRetry} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (rows.length === 0) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Dimension Leaderboard</CardTitle>
          <CardDescription>Your Insight Dimensions ranked by performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500">
            <AlertTriangle className="w-10 h-10 mb-3 text-gray-400" />
            <p>No dimension data available</p>
            <p className="text-sm">Submit survey responses to see rankings</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Dimension Leaderboard</CardTitle>
            <CardDescription>
              Your Insight Dimensions ranked by performance
              {versionLabel && <span className="ml-1">• {versionLabel}</span>}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                  #
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Dimension
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Band
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Change
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr 
                  key={row.dimensionId} 
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-2">
                    <RankBadge rank={row.rank} />
                  </td>
                  <td className="py-3 px-2">
                    <span className="font-medium text-gray-900">
                      {row.shortLabel}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <ScoreBadge 
                      score={row.rawScore} 
                      band={row.band} 
                      isBurnout={row.isBurnout} 
                    />
                  </td>
                  <td className="py-3 px-2">
                    <span 
                      className="text-sm font-medium"
                      style={{ color: row.band.color }}
                    >
                      {row.band.label}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <TrendIndicator change={row.change} trend={row.trend} />
                  </td>
                  <td className="py-3 px-2">
                    <PerformanceBar score={row.performanceScore} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footnote */}
        <p className="text-xs text-gray-400 mt-4">
          Ranked by performance score. For Burnout Risk, lower scores indicate better performance.
        </p>
      </CardContent>
    </Card>
  );
};

export default DimensionLeaderboardTable;

