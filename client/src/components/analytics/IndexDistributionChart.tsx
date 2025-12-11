/**
 * IndexDistributionChart - Bar chart for Insight Dimension score distribution
 *
 * [ANAL-004] Index Distribution Visualization
 * [NAMING-001] Uses "Insight Dimensions" terminology (EID framework)
 *
 * Displays a bar chart showing the distribution of dimension scores
 * across 5 buckets (0-20, 21-40, 41-60, 61-80, 81-100).
 *
 * Updated: December 2024 - Coral/Teal warm design system
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Loader2, AlertCircle, RotateCcw } from "lucide-react";
import type { IndexDistributionData } from "@shared/analytics";
import { isDistributionEmpty } from "@shared/analyticsConfidence";
import { NoScoreDataState } from "./DataEmptyState";

// Design system chart colors - score band gradient
// NOTE: Hex values required for Recharts SVG fill (CSS variables don't work in SVG)
// These map to CSS variables: --band-critical, --band-concerning, --band-emerging, --band-developing, --band-thriving
const BUCKET_COLORS_HEX = [
  '#B91C1C',   // Critical (0-20) - var(--band-critical)
  '#D97706',   // Concerning (21-40) - var(--band-concerning)
  '#EAB308',   // Emerging (41-60) - var(--band-emerging)
  '#74A892',   // Developing (61-80) - var(--band-developing) = var(--sage-500)
  '#2D6A4F',   // Thriving (81-100) - var(--band-thriving) = var(--forest-500)
];

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
  title = "Score Distribution",
  description = "How scores are distributed across all respondents",
}: IndexDistributionChartProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="evalia-card">
        <div className="evalia-card-header">
          <div>
            <h3 className="evalia-card-title">{title}</h3>
            <p className="evalia-card-subtitle">{description}</p>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--coral-500)]" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="evalia-card">
        <div className="evalia-card-header">
          <div>
            <h3 className="evalia-card-title">{title}</h3>
            <p className="evalia-card-subtitle">{description}</p>
          </div>
        </div>
        <div className="h-64 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--coral-50)] flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6 text-[var(--coral-600)]" />
          </div>
          <p className="text-sm text-[var(--ink-300)] mb-2">Failed to load distribution data</p>
          {onRetry && (
            <Button className="evalia-btn evalia-btn-outline evalia-btn-sm" onClick={onRetry}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  // No data state
  if (!data || isDistributionEmpty(data.overall.buckets)) {
    return (
      <div className="evalia-card">
        <div className="evalia-card-header">
          <div>
            <h3 className="evalia-card-title">{title}</h3>
            <p className="evalia-card-subtitle">{description}</p>
          </div>
        </div>
        <NoScoreDataState />
      </div>
    );
  }

  // Transform data for chart
  const chartData = data.overall.buckets.map((bucket, index) => ({
    range: bucket.range,
    count: bucket.count,
    percentage: bucket.percentage,
    fill: BUCKET_COLORS_HEX[index],
  }));

  const { statistics } = data.overall;
  const totalResponses = chartData.reduce((sum, b) => sum + b.count, 0);

  return (
    <div className="evalia-card">
      <div className="evalia-card-header">
        <div>
          <h3 className="evalia-card-title">{title}</h3>
          <p className="evalia-card-subtitle">{description}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-[var(--ink-500)] font-[var(--font-mono)]">{totalResponses}</span>
          <span className="text-sm text-[var(--ink-200)] ml-1">responses</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-56 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EDEB" />
            <XAxis
              dataKey="range"
              tick={{ fontSize: 12, fill: '#6B7573' }}
              tickLine={false}
              axisLine={{ stroke: '#D1D6D4' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7573' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-[var(--paper-white)] border border-[var(--paper-200)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] p-3 text-sm">
                    <p className="font-medium text-[var(--ink-500)]">Score Range: {d.range}</p>
                    <p className="text-[var(--ink-300)]">
                      <span className="font-bold text-[var(--ink-500)]">{d.count}</span> responses ({d.percentage}%)
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics row */}
      <div className="grid grid-cols-5 gap-2 pt-4 border-t border-[var(--paper-100)]">
        <StatItem label="Min" value={statistics.min} />
        <StatItem label="Max" value={statistics.max} />
        <StatItem label="Mean" value={statistics.mean} />
        <StatItem label="Median" value={statistics.median} />
        <StatItem label="Std Dev" value={statistics.stdDev} />
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-xs text-[var(--ink-200)] uppercase tracking-wider">{label}</p>
      <p className="text-lg font-semibold text-[var(--ink-500)] font-[var(--font-mono)]">{value}</p>
    </div>
  );
}

export default IndexDistributionChart;
