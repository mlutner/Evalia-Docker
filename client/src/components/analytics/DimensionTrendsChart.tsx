/**
 * DimensionTrendsChart - Displays index score trends over time/versions
 * 
 * [ANAL-008] Dimension Trends (Index Trend Over Time)
 * 
 * Shows a line chart with each Insight Dimension as a separate line,
 * tracking scores across scoring versions.
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
import { Loader2, AlertTriangle, TrendingUp, Info } from "lucide-react";
import { AnalyticsSectionShell } from "./AnalyticsSectionShell";
import type { IndexTrendsSummaryData, IndexTrendPoint } from "@shared/analytics";

interface DimensionTrendsChartProps {
  data: IndexTrendsSummaryData | undefined;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
}

// Dimension colors - matching the design system
// NOTE: Hex values required for Recharts SVG (CSS variables don't work in SVG)
// These map to CSS variables: --dimension-*
const DIMENSION_COLORS = {
  leadershipEffectiveness: "#2563EB", // Blue - var(--dimension-leadership)
  teamWellbeing: "#40916C",           // Forest-400 - var(--dimension-wellbeing)
  burnoutRisk: "#DC2626",             // Red - var(--dimension-burnout) (inverted - higher is worse)
  psychologicalSafety: "#7C3AED",     // Purple - var(--dimension-safety)
  engagement: "#22543D",              // Forest-600 - var(--dimension-engagement)
};

const DIMENSION_LABELS = {
  leadershipEffectiveness: "Leadership Effectiveness",
  teamWellbeing: "Team Wellbeing",
  burnoutRisk: "Burnout Risk",
  psychologicalSafety: "Psychological Safety",
  engagement: "Engagement",
};

/**
 * Transform trend data for Recharts
 */
function transformTrendData(trends: IndexTrendPoint[]) {
  return trends.map((point) => ({
    version: point.versionLabel,
    versionDate: new Date(point.versionDate).toLocaleDateString(),
    responseCount: point.responseCount,
    leadershipEffectiveness: point.scores.leadershipEffectiveness,
    teamWellbeing: point.scores.teamWellbeing,
    burnoutRisk: point.scores.burnoutRisk,
    psychologicalSafety: point.scores.psychologicalSafety,
    engagement: point.scores.engagement,
  }));
}

/**
 * Custom tooltip for the chart
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const firstPayload = payload[0]?.payload;
  
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-default)] shadow-[var(--shadow-lg)] rounded-[var(--radius-md)] p-3 min-w-[200px]">
      <p className="font-semibold text-[var(--text-primary)] mb-1">{label}</p>
      <p className="text-xs text-[var(--text-muted)] mb-2">
        {firstPayload?.versionDate} • {firstPayload?.responseCount} responses
      </p>
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[var(--text-secondary)]">{entry.name}</span>
            </div>
            <span className="font-medium">
              {entry.value !== null ? entry.value.toFixed(1) : "N/A"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DimensionTrendsChart: React.FC<DimensionTrendsChartProps> = ({
  data,
  isLoading,
  error,
  onRetry,
}) => {
  // Loading state
  if (isLoading) {
    return (
      <AnalyticsSectionShell
        title="Insight Dimension Trends"
        description="Loading trend data..."
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        </div>
      </AnalyticsSectionShell>
    );
  }

  // Error state
  if (error) {
    return (
      <AnalyticsSectionShell
        title="Insight Dimension Trends"
        description="Failed to load trend data."
      >
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

  // Empty state - no trends
  if (!data || data.trends.length === 0) {
    return (
      <AnalyticsSectionShell
        title="Insight Dimension Trends"
        description="No trend data available for this survey."
      >
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <TrendingUp className="w-10 h-10 mb-3 text-[var(--text-subtle)]" />
          <p className="text-lg font-semibold text-[var(--text-secondary)]">No Trend Data</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Trends will appear once there are responses with scores.
          </p>
        </div>
      </AnalyticsSectionShell>
    );
  }

  // Single version state
  if (!data.hasMultipleVersions) {
    const point = data.trends[0];
    const avgScore = point.scores.engagement;

    return (
      <AnalyticsSectionShell
        title="Insight Dimension Trends"
        description={`Single version (${point.versionLabel}) with ${point.responseCount} responses.`}
      >
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Info className="w-10 h-10 mb-3 text-[var(--status-info)]" />
          <p className="text-lg font-semibold text-[var(--text-secondary)]">Single Version Available</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Create additional scoring versions to see trends over time.
          </p>
          {avgScore !== null && (
            <div className="mt-4 p-4 bg-[var(--forest-50)] rounded-[var(--radius-md)]">
              <p className="text-sm text-[var(--forest-700)]">Current Average Score</p>
              <p className="text-3xl font-bold text-[var(--forest-900)]">{avgScore.toFixed(1)}</p>
            </div>
          )}
        </div>
      </AnalyticsSectionShell>
    );
  }

  // Transform data for chart
  const chartData = transformTrendData(data.trends);

  return (
    <AnalyticsSectionShell
      title="Insight Dimension Trends"
      description={`Showing ${data.totalVersions} versions across time.`}
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EDEB" />
            <XAxis
              dataKey="version"
              tick={{ fontSize: 12, fill: '#6B7573' }}
              tickLine={{ stroke: "#8A9290" }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: '#6B7573' }}
              tickLine={{ stroke: "#8A9290" }}
              label={{
                value: "Score",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle", fill: "#6B7573", fontSize: 12 },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "10px" }}
              formatter={(value) => (
                <span className="text-sm text-[var(--text-secondary)]">{value}</span>
              )}
            />
            
            {/* Render a line for each dimension */}
            <Line
              type="monotone"
              dataKey="engagement"
              name={DIMENSION_LABELS.engagement}
              stroke={DIMENSION_COLORS.engagement}
              strokeWidth={2}
              dot={{ r: 4, fill: DIMENSION_COLORS.engagement }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="leadershipEffectiveness"
              name={DIMENSION_LABELS.leadershipEffectiveness}
              stroke={DIMENSION_COLORS.leadershipEffectiveness}
              strokeWidth={2}
              dot={{ r: 4, fill: DIMENSION_COLORS.leadershipEffectiveness }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="teamWellbeing"
              name={DIMENSION_LABELS.teamWellbeing}
              stroke={DIMENSION_COLORS.teamWellbeing}
              strokeWidth={2}
              dot={{ r: 4, fill: DIMENSION_COLORS.teamWellbeing }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="psychologicalSafety"
              name={DIMENSION_LABELS.psychologicalSafety}
              stroke={DIMENSION_COLORS.psychologicalSafety}
              strokeWidth={2}
              dot={{ r: 4, fill: DIMENSION_COLORS.psychologicalSafety }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="burnoutRisk"
              name={DIMENSION_LABELS.burnoutRisk}
              stroke={DIMENSION_COLORS.burnoutRisk}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: DIMENSION_COLORS.burnoutRisk }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Note about burnout risk */}
      <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
        Note: Burnout Risk shown with dashed line — for this metric, lower scores indicate better outcomes.
      </p>
    </AnalyticsSectionShell>
  );
};

