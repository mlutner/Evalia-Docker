/**
 * CategoryLeaderboardTable - Ranked view of scoring categories
 * 
 * [ANAL-DASH-010] Generic category-based leaderboard for non-5D surveys.
 * 
 * Features:
 * - Ranks all categories by score (highest = #1)
 * - Uses bands from scoreConfig.scoreRanges (not hardcoded 5D bands)
 * - No burnout inversion logic
 * - Shows interpretation text if available
 */

import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle, Trophy, Medal, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getColorForScore } from "@shared/analyticsBands";

// ============================================================================
// TYPES
// ============================================================================

interface CategoryScore {
  categoryId: string;
  categoryName: string;
  score: number;
  normalizedScore: number;
  interpretation?: string;
  bandLabel?: string;
  bandColor?: string;
}

interface ScoreRange {
  id: string;
  min: number;
  max: number;
  label: string;
  color?: string;
  interpretation?: string;
}

interface CategoryLeaderboardTableProps {
  categories: CategoryScore[];
  scoreRanges?: ScoreRange[];
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

interface RankedCategory extends CategoryScore {
  rank: number;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Resolve band from score ranges.
 */
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

/**
 * Get rank icon based on position.
 */
function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="w-5 h-5 text-[var(--status-warning)]" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-[var(--text-subtle)]" />;
  if (rank === 3) return <Award className="w-5 h-5 text-[var(--status-warning)]" />;
  return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-[var(--text-subtle)]">#{rank}</span>;
}

/**
 * Performance bar component.
 */
function PerformanceBar({ score, color }: { score: number; color: string }) {
  const width = Math.max(5, Math.min(100, score));

  return (
    <div className="w-24 h-2 bg-[var(--neutral-200)] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CategoryLeaderboardTable({
  categories,
  scoreRanges,
  isLoading,
  error,
  onRetry,
  title = "Category Leaderboard",
  description = "Categories ranked by performance score",
}: CategoryLeaderboardTableProps) {
  // Rank categories by score (highest first)
  const rankedCategories: RankedCategory[] = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    
    return [...categories]
      .sort((a, b) => b.normalizedScore - a.normalizedScore)
      .map((cat, index) => ({
        ...cat,
        rank: index + 1,
      }));
  }, [categories]);

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-[var(--bg-card)] border border-[var(--border-default)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="bg-[var(--bg-card)] border border-[var(--border-default)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex flex-col items-center justify-center text-center">
            <AlertTriangle className="w-12 h-12 text-[var(--status-warning)] mb-3" />
            <p className="text-sm text-[var(--text-secondary)] mb-2">Failed to load category data</p>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (rankedCategories.length === 0) {
    return (
      <Card className="bg-[var(--bg-card)] border border-[var(--border-default)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[var(--neutral-100)] rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-[var(--text-subtle)]" />
            </div>
            <p className="text-sm text-[var(--text-muted)]">No category data available</p>
            <p className="text-xs text-[var(--text-subtle)] mt-1">
              Configure scoring categories to see rankings
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[var(--bg-card)] border border-[var(--border-default)]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-default)]">
                <th className="text-left py-3 px-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide w-12">
                  Rank
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                  Category
                </th>
                <th className="text-right py-3 px-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide w-20">
                  Score
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide w-32">
                  Performance
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                  Band
                </th>
              </tr>
            </thead>
            <tbody>
              {rankedCategories.map((category) => {
                const band = category.bandLabel 
                  ? { label: category.bandLabel, color: category.bandColor || getColorForScore(category.normalizedScore) }
                  : resolveBandFromRanges(category.normalizedScore, scoreRanges);
                
                const color = band?.color || getColorForScore(category.normalizedScore);
                
                return (
                  <tr
                    key={category.categoryId}
                    className="border-b border-[var(--border-subtle)] hover:bg-[var(--hover-tint)] transition-colors"
                  >
                    <td className="py-3 px-2">
                      <RankIcon rank={category.rank} />
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-medium text-[var(--text-primary)]">{category.categoryName}</div>
                      {category.interpretation && (
                        <div className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">
                          {category.interpretation}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="text-lg font-bold" style={{ color }}>
                        {Math.round(category.normalizedScore)}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <PerformanceBar score={category.normalizedScore} color={color} />
                    </td>
                    <td className="py-3 px-2">
                      {band && (
                        <span 
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: `${band.color}20`, 
                            color: band.color 
                          }}
                        >
                          {band.label}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

