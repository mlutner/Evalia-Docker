/**
 * IndexDistributionChart - Bar chart for Insight Dimension score distribution
 * 
 * [ANAL-004] Index Distribution Visualization
 * [NAMING-001] Uses "Insight Dimensions" terminology (EID framework)
 * 
 * Displays a bar chart showing the distribution of dimension scores
 * across 5 buckets (0-20, 21-40, 41-60, 61-80, 81-100).
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Loader2, AlertCircle, RotateCcw, BarChart3 } from "lucide-react";
import type { IndexDistributionData } from "@shared/analytics";
import { DISTRIBUTION_BUCKET_COLORS } from "@shared/analyticsBands";
import { isDistributionEmpty } from "@shared/analyticsConfidence";
import { NoScoreDataState } from "./DataEmptyState";

// [ANAL-QA-030] Use shared color constants instead of hardcoding
const BUCKET_COLORS = DISTRIBUTION_BUCKET_COLORS;

interface IndexDistributionChartProps {
  data: IndexDistributionData | null;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

export function IndexDistributionChart({
  data,
  isLoading = false,
  error = null,
  onRetry,
  title = "Insight Dimension Distribution",
  description = "Score distribution across all responses",
}: IndexDistributionChartProps) {
  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
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
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
            <p className="text-sm text-gray-600 mb-2">Failed to load distribution data</p>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // [ANAL-QA-050] No data state - use shared empty state component
  if (!data || isDistributionEmpty(data.overall.buckets)) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <NoScoreDataState />
        </CardContent>
      </Card>
    );
  }

  // Transform data for chart
  const chartData = data.overall.buckets.map((bucket, index) => ({
    range: bucket.range,
    count: bucket.count,
    percentage: bucket.percentage,
    fill: BUCKET_COLORS[index],
  }));

  const { statistics } = data.overall;
  const totalResponses = chartData.reduce((sum, b) => sum + b.count, 0);

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="text-right text-sm text-gray-500">
            <span className="font-medium text-gray-900">{totalResponses}</span> responses
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="h-56 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="range" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
                      <p className="font-medium text-gray-900">Score Range: {data.range}</p>
                      <p className="text-gray-600">
                        <span className="font-medium">{data.count}</span> responses ({data.percentage}%)
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Statistics row */}
        <div className="grid grid-cols-5 gap-2 pt-4 border-t border-gray-100">
          <StatItem label="Min" value={statistics.min} />
          <StatItem label="Max" value={statistics.max} />
          <StatItem label="Mean" value={statistics.mean} />
          <StatItem label="Median" value={statistics.median} />
          <StatItem label="Std Dev" value={statistics.stdDev} />
        </div>
      </CardContent>
    </Card>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export default IndexDistributionChart;

