/**
 * BeforeAfterComparisonChart - Compare Insight Dimension scores between two versions
 * 
 * [ANAL-009] Before/After Index Comparison Visualization
 * 
 * Displays a grouped bar chart showing before/after scores for each dimension,
 * with change indicators and trend summary.
 */

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import type { BeforeAfterIndexComparisonData, DimensionComparison } from "@shared/analytics";
import { TREND_COLORS } from "@shared/analyticsBands";
import type { Version } from "./VersionSelector";

interface BeforeAfterComparisonChartProps {
  data: BeforeAfterIndexComparisonData | undefined;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  availableVersions?: Version[];
  selectedVersionBefore?: string;
  selectedVersionAfter?: string;
  onVersionBeforeChange?: (versionId: string) => void;
  onVersionAfterChange?: (versionId: string) => void;
  title?: string;
  description?: string;
}

// [ANAL-QA-030] Colors for comparison bars (not band-related)
const BEFORE_COLOR = "#94a3b8"; // Slate-400
const AFTER_COLOR = "#3b82f6"; // Blue-500

/**
 * Custom tooltip for the bar chart
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    const beforeValue = payload.find((p: any) => p.dataKey === "scoreBefore")?.value;
    const afterValue = payload.find((p: any) => p.dataKey === "scoreAfter")?.value;
    const dimension = payload[0]?.payload as DimensionComparison;

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-md shadow-lg text-sm">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-gray-600">
            <span className="inline-block w-3 h-3 rounded mr-2" style={{ backgroundColor: BEFORE_COLOR }} />
            Before: <span className="font-medium">{beforeValue ?? "N/A"}</span>
          </p>
          <p className="text-gray-600">
            <span className="inline-block w-3 h-3 rounded mr-2" style={{ backgroundColor: AFTER_COLOR }} />
            After: <span className="font-medium">{afterValue ?? "N/A"}</span>
          </p>
          {dimension?.change !== null && (
            <p className="mt-2 pt-2 border-t border-gray-100">
              Change:{" "}
              <span
                className="font-semibold"
                style={{ color: TREND_COLORS[dimension.trend] }}
              >
                {dimension.change > 0 ? "+" : ""}
                {dimension.change.toFixed(1)}
                {dimension.changePercent !== null && (
                  <span className="text-xs ml-1">
                    ({dimension.changePercent > 0 ? "+" : ""}
                    {dimension.changePercent.toFixed(1)}%)
                  </span>
                )}
              </span>
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Summary card showing overall comparison results
 */
function ComparisonSummary({ data }: { data: BeforeAfterIndexComparisonData }) {
  const { summary, versionBefore, versionAfter } = data;

  const trendIcon = {
    positive: <TrendingUp className="w-5 h-5 text-green-500" />,
    negative: <TrendingDown className="w-5 h-5 text-red-500" />,
    mixed: <Minus className="w-5 h-5 text-amber-500" />,
    stable: <Minus className="w-5 h-5 text-gray-400" />,
  };

  const trendLabel = {
    positive: "Overall Improvement",
    negative: "Overall Decline",
    mixed: "Mixed Results",
    stable: "Stable",
  };

  const trendColor = {
    positive: "text-green-600 bg-green-50",
    negative: "text-red-600 bg-red-50",
    mixed: "text-amber-600 bg-amber-50",
    stable: "text-gray-600 bg-gray-50",
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {trendIcon[summary.overallTrend]}
          <span className={`font-semibold px-2 py-1 rounded ${trendColor[summary.overallTrend]}`}>
            {trendLabel[summary.overallTrend]}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          {versionBefore.label} → {versionAfter.label}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="flex items-center justify-center gap-1">
            <ArrowUpRight className="w-4 h-4 text-green-500" />
            <span className="text-xl font-bold text-green-600">{summary.totalDimensionsImproved}</span>
          </div>
          <p className="text-xs text-gray-500">Improved</p>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1">
            <ArrowDownRight className="w-4 h-4 text-red-500" />
            <span className="text-xl font-bold text-red-600">{summary.totalDimensionsDeclined}</span>
          </div>
          <p className="text-xs text-gray-500">Declined</p>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1">
            <Minus className="w-4 h-4 text-gray-400" />
            <span className="text-xl font-bold text-gray-600">{summary.totalDimensionsStable}</span>
          </div>
          <p className="text-xs text-gray-500">Stable</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-500">
        <span>Before: {versionBefore.responseCount} responses ({versionBefore.date.split('T')[0]})</span>
        <span>After: {versionAfter.responseCount} responses ({versionAfter.date.split('T')[0]})</span>
      </div>
    </div>
  );
}

export function BeforeAfterComparisonChart({
  data,
  isLoading,
  error,
  onRetry,
  availableVersions = [],
  selectedVersionBefore,
  selectedVersionAfter,
  onVersionBeforeChange,
  onVersionAfterChange,
  title = "Before/After Index Comparison",
  description = "Compare Insight Dimension scores between two scoring versions",
}: BeforeAfterComparisonChartProps) {
  // Prepare chart data
  const chartData = useMemo(() => {
    if (!data?.comparison) return [];
    return data.comparison.map((dim) => ({
      ...dim,
      name: dim.dimensionLabel,
    }));
  }, [data]);

  // Check if we have enough versions for comparison
  const hasEnoughVersions = availableVersions.length >= 2;
  const canCompare = !!selectedVersionBefore && !!selectedVersionAfter && selectedVersionBefore !== selectedVersionAfter;

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
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
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
            <p className="text-gray-700 font-medium mb-2">Failed to load comparison</p>
            <p className="text-sm text-gray-500 mb-4">{error.message}</p>
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not enough versions state
  if (!hasEnoughVersions && availableVersions.length > 0) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <TrendingUp className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-gray-700 font-medium mb-2">Not Enough Versions</p>
            <p className="text-sm text-gray-500">
              Create at least two scoring versions to compare changes over time.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          
          {/* Version Selectors */}
          {availableVersions.length >= 2 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Before:</span>
                <Select
                  value={selectedVersionBefore}
                  onValueChange={onVersionBeforeChange}
                >
                  <SelectTrigger className="w-[120px] h-8">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVersions
                      .filter((v) => v.id !== selectedVersionAfter)
                      .map((version) => (
                        <SelectItem key={version.id} value={version.id}>
                          {version.label || `v${version.versionNumber}`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">After:</span>
                <Select
                  value={selectedVersionAfter}
                  onValueChange={onVersionAfterChange}
                >
                  <SelectTrigger className="w-[120px] h-8">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVersions
                      .filter((v) => v.id !== selectedVersionBefore)
                      .map((version) => (
                        <SelectItem key={version.id} value={version.id}>
                          {version.label || `v${version.versionNumber}`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Show message if no versions selected yet */}
        {!canCompare ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <TrendingUp className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-gray-700 font-medium mb-2">Select Versions to Compare</p>
            <p className="text-sm text-gray-500">
              Choose a "Before" and "After" version above to see the comparison.
            </p>
          </div>
        ) : data ? (
          <>
            {/* Summary Card */}
            <ComparisonSummary data={data} />

            {/* Chart */}
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="scoreBefore" 
                    name={data.versionBefore.label} 
                    fill={BEFORE_COLOR}
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar 
                    dataKey="scoreAfter" 
                    name={data.versionAfter.label} 
                    fill={AFTER_COLOR}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Change Indicators */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
              {data.comparison.map((dim) => (
                <div
                  key={dim.dimensionId}
                  className="text-center p-2 rounded bg-gray-50"
                >
                  <p className="text-xs text-gray-500 truncate">{dim.dimensionLabel}</p>
                  <p
                    className="font-bold"
                    style={{ color: TREND_COLORS[dim.trend] }}
                  >
                    {dim.change !== null ? (
                      <>
                        {dim.change > 0 ? "+" : ""}
                        {dim.change.toFixed(1)}
                      </>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

