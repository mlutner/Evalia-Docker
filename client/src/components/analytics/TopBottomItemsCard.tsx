/**
 * TopBottomItemsCard - Top and bottom performing questions
 * 
 * [ANAL-DASH-020] Shows highest and lowest rated questions for basic analytics.
 * Derived from QuestionSummary data, filtered to numeric questions only.
 */

import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Loader2, AlertTriangle } from "lucide-react";
import type { QuestionSummaryItem } from "@shared/analytics";

// ============================================================================
// TYPES
// ============================================================================

interface TopBottomItemsCardProps {
  questionSummary: QuestionSummaryItem[] | undefined;
  isLoading: boolean;
  error: Error | null;
  topN?: number;
  onRetry?: () => void;
}

interface RankedItem {
  questionId: string;
  questionText: string;
  avgValue: number;
  maxPossible: number;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Filter to numeric question types only
 */
function isNumericQuestion(type: string): boolean {
  return ['rating', 'likert', 'nps', 'scale', 'number'].includes(type.toLowerCase());
}

/**
 * Truncate question text for display
 */
function truncateText(text: string, maxLength: number = 60): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Get max possible score based on question type
 */
function getMaxPossible(item: QuestionSummaryItem): number {
  if (item.maxValue != null && item.maxValue > 0) return item.maxValue;
  if (item.questionType.toLowerCase() === 'nps') return 10;
  return 5; // Default for rating/likert
}

// ============================================================================
// ITEM ROW COMPONENT
// ============================================================================

function ItemRow({
  item,
  isTop,
  rank
}: {
  item: RankedItem;
  isTop: boolean;
  rank: number;
}) {
  const percentage = (item.avgValue / item.maxPossible) * 100;
  const barColor = isTop ? '#22c55e' : '#ef4444'; // Recharts requires hex: --status-success / --status-error
  const Icon = isTop ? TrendingUp : TrendingDown;

  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
        isTop ? 'bg-[var(--status-success-bg)]' : 'bg-[var(--status-error-bg)]'
      }`}>
        <Icon className={`w-3 h-3 ${isTop ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--text-primary)] truncate" title={item.questionText}>
          {truncateText(item.questionText)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 bg-[var(--neutral-200)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${percentage}%`, backgroundColor: barColor }}
            />
          </div>
          <span className="text-xs font-medium text-[var(--text-secondary)] w-12 text-right">
            {item.avgValue.toFixed(1)}/{item.maxPossible}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TopBottomItemsCard({
  questionSummary,
  isLoading,
  error,
  topN = 5,
  onRetry,
}: TopBottomItemsCardProps) {
  // Process and rank items
  const { topItems, bottomItems } = useMemo(() => {
    if (!questionSummary || questionSummary.length === 0) {
      return { topItems: [], bottomItems: [] };
    }

    // Filter to numeric questions with valid avg values
    const numericItems: RankedItem[] = questionSummary
      .filter(q => isNumericQuestion(q.questionType) && q.avgValue != null && q.totalAnswers > 0)
      .map(q => ({
        questionId: q.questionId,
        questionText: q.questionText,
        avgValue: q.avgValue!,
        maxPossible: getMaxPossible(q),
      }));

    if (numericItems.length === 0) {
      return { topItems: [], bottomItems: [] };
    }

    // Sort by avgValue
    const sorted = [...numericItems].sort((a, b) => b.avgValue - a.avgValue);
    
    // Get top and bottom N (avoiding duplicates if list is small)
    const top = sorted.slice(0, Math.min(topN, Math.floor(sorted.length / 2) || 1));
    const bottom = sorted.slice(-Math.min(topN, Math.floor(sorted.length / 2) || 1)).reverse();

    return { topItems: top, bottomItems: bottom };
  }, [questionSummary, topN]);

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-[var(--bg-card)] border border-[var(--border-default)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
            Top & Bottom Items
          </CardTitle>
          <CardDescription>Questions ranked by average rating</CardDescription>
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
          <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
            Top & Bottom Items
          </CardTitle>
          <CardDescription>Questions ranked by average rating</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex flex-col items-center justify-center text-center">
            <AlertTriangle className="w-12 h-12 text-[var(--status-warning)] mb-3" />
            <p className="text-sm text-[var(--text-secondary)] mb-2">Failed to load question data</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-sm text-[var(--color-primary)] hover:underline"
              >
                Retry
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state - no numeric questions
  if (topItems.length === 0 && bottomItems.length === 0) {
    return (
      <Card className="bg-[var(--bg-card)] border border-[var(--border-default)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
            Top & Bottom Items
          </CardTitle>
          <CardDescription>Questions ranked by average rating</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[var(--neutral-100)] rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-[var(--text-subtle)]" />
            </div>
            <p className="text-sm text-[var(--text-muted)]">No numeric questions to rank</p>
            <p className="text-xs text-[var(--text-subtle)] mt-1">
              Add rating or scale questions to see top/bottom items
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[var(--bg-card)] border border-[var(--border-default)]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
          Top & Bottom Items
        </CardTitle>
        <CardDescription>Questions ranked by average rating</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Items */}
          <div>
            <h4 className="text-sm font-medium text-[var(--status-success)] mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Highest Rated
            </h4>
            <div className="space-y-1">
              {topItems.map((item, idx) => (
                <ItemRow
                  key={item.questionId}
                  item={item}
                  isTop={true}
                  rank={idx + 1}
                />
              ))}
            </div>
          </div>

          {/* Bottom Items */}
          <div>
            <h4 className="text-sm font-medium text-[var(--status-error)] mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Lowest Rated
            </h4>
            <div className="space-y-1">
              {bottomItems.map((item, idx) => (
                <ItemRow
                  key={item.questionId}
                  item={item}
                  isTop={false}
                  rank={idx + 1}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

