/**
 * TrendLineChart - Displays index trends over time
 * 
 * [ANAL-008] Dimension Trends (Historical Time Series)
 * 
 * Uses Recharts to visualize historical index scores as a line chart.
 * Shows multiple indices with different colors.
 */

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, TrendingUp, Calendar } from "lucide-react";
import { AnalyticsSectionShell } from "./AnalyticsSectionShell";
import type { IndexTrendData } from "@shared/analytics";

interface TrendLineChartProps {
  data: IndexTrendData | undefined;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  title?: string;
  description?: string;
}

// Index colors - Recharts requires hex values (not CSS vars)
const INDEX_COLORS = {
  engagementIndex: "#3b82f6", // Blue - equivalent to primary blue
  leadershipIndex: "#8b5cf6", // Purple
  wellbeingIndex: "#22c55e", // Green - equivalent to --status-success
  burnoutRiskIndex: "#ef4444", // Red - equivalent to --status-error
  psychologicalSafetyIndex: "#f59e0b", // Amber - equivalent to --status-warning
} as const;

// Friendly index labels
const INDEX_LABELS: Record<string, string> = {
  engagementIndex: "Engagement",
  leadershipIndex: "Leadership",
  wellbeingIndex: "Wellbeing",
  burnoutRiskIndex: "Burnout Risk",
  psychologicalSafetyIndex: "Psychological Safety",
};

// Format date for display
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-default)] shadow-lg rounded-md p-3 min-w-[160px]">
      <p className="font-semibold text-[var(--text-primary)] mb-2 text-sm">
        {formatDate(label)}
      </p>
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[var(--text-secondary)]">
                {INDEX_LABELS[entry.dataKey] || entry.dataKey}
              </span>
            </div>
            <span className="font-medium text-[var(--text-primary)]">
              {entry.value?.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  data,
  isLoading,
  error,
  onRetry,
  title = "Index Trends",
  description = "How Insight Dimension scores have changed over time",
}) => {
  // Loading state
  if (isLoading) {
    return (
      <AnalyticsSectionShell title={title} description="Loading trend data...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        </div>
      </AnalyticsSectionShell>
    );
  }

  // Error state
  if (error) {
    return (
      <AnalyticsSectionShell title={title} description="Failed to load trends.">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertTriangle className="w-10 h-10 mb-3 text-[var(--status-error)]" />
          <p className="text-lg font-semibold text-[var(--status-error)]">Error loading data</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{error.message}</p>
          <Button onClick={onRetry} className="mt-4" variant="outline">
            Retry
          </Button>
        </div>
      </AnalyticsSectionShell>
    );
  }

  // Empty state - no data or insufficient data points
  if (!data || !data.series || data.series.length < 2) {
    return (
      <AnalyticsSectionShell title={title} description={description}>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Calendar className="w-10 h-10 mb-3 text-[var(--text-subtle)]" />
          <p className="text-lg font-semibold text-[var(--text-secondary)]">Not Enough Data</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Trend visualization requires responses over multiple time periods.
          </p>
          <p className="text-xs text-[var(--text-subtle)] mt-2">
            {data?.series?.length === 1
              ? "All responses occurred on the same day."
              : "Collect more responses over time to see trends."}
          </p>
        </div>
      </AnalyticsSectionShell>
    );
  }

  // Determine which indices have data
  const availableIndices = Object.keys(INDEX_COLORS).filter((key) =>
    data.series.some((point) => point[key as keyof typeof point] !== undefined)
  );

  return (
    <AnalyticsSectionShell title={title} description={description}>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data.series}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EDEB" /* --neutral-100 */ />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12, fill: "#6B7573" /* --neutral-500 / --text-muted */ }}
              axisLine={{ stroke: "#D1D6D4" /* --neutral-200 / --border-default */ }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: "#6B7573" /* --neutral-500 / --text-muted */ }}
              axisLine={{ stroke: "#D1D6D4" /* --neutral-200 / --border-default */ }}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value: string) => (
                <span className="text-sm text-[var(--text-secondary)]">
                  {INDEX_LABELS[value] || value}
                </span>
              )}
            />
            {availableIndices.map((indexKey) => (
              <Line
                key={indexKey}
                type="monotone"
                dataKey={indexKey}
                stroke={INDEX_COLORS[indexKey as keyof typeof INDEX_COLORS]}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data summary */}
      <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
        <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>{data.series.length} data points</span>
          </div>
          <span>
            {formatDate(data.series[0].date)} – {formatDate(data.series[data.series.length - 1].date)}
          </span>
        </div>
      </div>
    </AnalyticsSectionShell>
  );
};

