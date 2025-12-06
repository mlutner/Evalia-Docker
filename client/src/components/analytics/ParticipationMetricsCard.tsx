/**
 * ParticipationMetricsCard - Displays key participation metrics
 * 
 * Shows: Total Responses, Response Rate %, Completion Rate %, Avg Completion Time
 * [ANAL-001]
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, TrendingDown, Clock, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SurveyResponse } from "@shared/schema";

export interface ParticipationMetrics {
  totalResponses: number;
  responseRate: number | null; // null if invites not available
  completionRate: number;
  avgCompletionTimeMinutes: number;
  // Optional trend data
  trendTotalResponses?: "up" | "down" | "neutral";
  trendResponseRate?: "up" | "down" | "neutral";
  trendCompletionRate?: "up" | "down" | "neutral";
  trendAvgTime?: "up" | "down" | "neutral";
}

interface ParticipationMetricsCardProps {
  metrics: ParticipationMetrics | null;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export function ParticipationMetricsCard({
  metrics,
  isLoading = false,
  error = null,
  onRetry,
}: ParticipationMetricsCardProps) {
  // Loading skeleton
  if (isLoading) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Participation Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
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
          <CardTitle className="text-lg font-semibold text-gray-900">Participation Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
            <p className="text-sm text-gray-600 mb-2">Failed to load participation metrics</p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-2"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!metrics) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Participation Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">No participation data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const MetricItem = ({
    label,
    value,
    icon: Icon,
    iconBg,
    trend,
  }: {
    label: string;
    value: string | number;
    icon: React.ElementType;
    iconBg: string;
    trend?: "up" | "down" | "neutral";
  }) => (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className="w-5 h-5 text-gray-700" />
        </div>
        {trend && trend !== "neutral" && (
          <div className={`flex items-center text-xs ${
            trend === "up" ? "text-emerald-600" : "text-red-500"
          }`}>
            {trend === "up" ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
          </div>
        )}
      </div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Participation Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricItem
            label="Total Responses"
            value={metrics.totalResponses}
            icon={Users}
            iconBg="bg-blue-100"
            trend={metrics.trendTotalResponses}
          />
          <MetricItem
            label="Response Rate"
            value={metrics.responseRate !== null ? `${metrics.responseRate}%` : "N/A"}
            icon={Users}
            iconBg="bg-purple-100"
            trend={metrics.trendResponseRate}
          />
          <MetricItem
            label="Completion Rate"
            value={`${metrics.completionRate}%`}
            icon={Users}
            iconBg="bg-emerald-100"
            trend={metrics.trendCompletionRate}
          />
          <MetricItem
            label="Avg Completion Time"
            value={`${metrics.avgCompletionTimeMinutes}m`}
            icon={Clock}
            iconBg="bg-amber-100"
            trend={metrics.trendAvgTime}
          />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Calculate participation metrics from survey responses
 */
export function calculateParticipationMetrics(
  responses: SurveyResponse[],
  totalInvites?: number
): ParticipationMetrics {
  const totalResponses = responses.length;

  // Response rate (if invites available)
  const responseRate = totalInvites && totalInvites > 0
    ? Math.round((totalResponses / totalInvites) * 100)
    : null;

  // Completion rate (completed / started)
  // Note: We assume all responses in the array are "started"
  // If we have metadata.completionPercentage, we can use that
  const completedResponses = responses.filter(r => {
    // Consider a response "completed" if it has answers for most questions
    // or if completionPercentage is high
    const completionPct = r.completionPercentage ?? 100;
    return completionPct >= 80; // 80%+ completion threshold
  }).length;

  const completionRate = totalResponses > 0
    ? Math.round((completedResponses / totalResponses) * 100)
    : 0;

  // Average completion time
  const durationsMs = responses
    .filter(r => r.startedAt && r.completedAt && r.totalDurationMs)
    .map(r => r.totalDurationMs!)
    .filter(d => d > 0 && d < 3600000); // Filter outliers (< 1 hour)

  const avgDurationMs = durationsMs.length > 0
    ? durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length
    : 0;

  const avgCompletionTimeMinutes = Math.round(avgDurationMs / 60000);

  return {
    totalResponses,
    responseRate,
    completionRate,
    avgCompletionTimeMinutes,
  };
}

