/**
 * BandDistributionChart - Donut chart for Insight Dimension band distribution
 * 
 * [ANAL-005] Index Band Distribution Visualization
 * [NAMING-001] Uses "Insight Dimensions" terminology (EID framework)
 * 
 * Displays a donut chart showing the distribution of respondents
 * across performance bands (Critical → Highly Effective).
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Loader2, AlertCircle, RotateCcw, PieChartIcon } from "lucide-react";
import type { IndexBandDistributionData } from "@shared/analytics";

interface BandDistributionChartProps {
  data: IndexBandDistributionData | null;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

export function BandDistributionChart({
  data,
  isLoading = false,
  error = null,
  onRetry,
  title = "Band Distribution",
  description = "Respondents by performance band",
}: BandDistributionChartProps) {
  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-[var(--bg-card)] border border-[var(--border-default)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
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
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-[var(--status-error)] mb-3" />
            <p className="text-sm text-[var(--text-secondary)] mb-2">Failed to load band distribution data</p>
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

  // No data or empty state
  const hasData = data && data.totalResponses > 0 && data.bands.some(b => b.count > 0);

  if (!hasData) {
    return (
      <Card className="bg-[var(--bg-card)] border border-[var(--border-default)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[var(--neutral-100)] rounded-full flex items-center justify-center mb-4">
              <PieChartIcon className="w-8 h-8 text-[var(--text-subtle)]" />
            </div>
            <p className="text-sm text-[var(--text-muted)]">Not enough data yet</p>
            <p className="text-xs text-[var(--text-subtle)] mt-1">
              Band distribution will appear once responses are collected
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for chart - only include bands with count > 0
  const chartData = data.bands
    .filter(band => band.count > 0)
    .map(band => ({
      name: band.bandLabel,
      value: band.count,
      percentage: band.percentage,
      color: band.color,
    }));

  // Find dominant band (highest count)
  const dominantBand = [...data.bands].sort((a, b) => b.count - a.count)[0];

  // Custom legend renderer
  const renderLegend = () => (
    <div className="grid grid-cols-1 gap-1 text-sm">
      {data.bands.map((band) => (
        <div key={band.bandId} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: band.color }}
            />
            <span className="text-[var(--text-secondary)]">{band.bandLabel}</span>
          </div>
          <span className="text-[var(--text-muted)] tabular-nums">
            {band.count} ({band.percentage}%)
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="bg-[var(--bg-card)] border border-[var(--border-default)]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="text-right text-sm text-[var(--text-muted)]">
            <span className="font-medium text-[var(--text-primary)]">{data.totalResponses}</span> responses
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          {/* Donut Chart */}
          <div className="flex-1 h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--bg-card)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg shadow-lg p-3 text-sm">
                        <p className="font-medium text-[var(--text-primary)]">{data.name}</p>
                        <p className="text-[var(--text-secondary)]">
                          <span className="font-medium">{data.value}</span> respondents ({data.percentage}%)
                        </p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Most Common</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{dominantBand.bandLabel}</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="w-48 flex flex-col justify-center">
            {renderLegend()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BandDistributionChart;

