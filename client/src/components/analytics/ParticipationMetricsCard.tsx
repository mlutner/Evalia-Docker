/**
 * ParticipationMetricsCard - Displays key participation metrics
 *
 * Shows: Total Responses, Response Rate %, Completion Rate %, Avg Completion Time
 * [ANAL-001]
 *
 * Updated: December 2024 - Coral/Teal warm design system
 */

import React from "react";
import { Users, TrendingUp, TrendingDown, Clock, AlertCircle, RotateCcw, CheckCircle } from "lucide-react";
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
      <div className="evalia-card">
        <h3 className="evalia-card-title mb-4">Participation Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[var(--paper-50)] rounded-[var(--radius-md)] p-4 border border-[var(--paper-200)]">
              <div className="h-10 w-10 bg-[var(--paper-200)] rounded-[var(--radius-md)] animate-pulse mb-3" />
              <div className="h-3 w-20 bg-[var(--paper-200)] rounded animate-pulse mb-2" />
              <div className="h-8 w-16 bg-[var(--paper-200)] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="evalia-card">
        <h3 className="evalia-card-title mb-4">Participation Metrics</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--coral-50)] flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6 text-[var(--coral-600)]" />
          </div>
          <p className="text-sm text-[var(--ink-300)] mb-2">Failed to load participation metrics</p>
          {onRetry && (
            <Button
              className="evalia-btn evalia-btn-outline evalia-btn-sm mt-2"
              onClick={onRetry}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  // No data state
  if (!metrics) {
    return (
      <div className="evalia-card">
        <h3 className="evalia-card-title mb-4">Participation Metrics</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-[var(--paper-100)] flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-[var(--ink-200)]" />
          </div>
          <p className="text-sm text-[var(--ink-200)]">No participation data available</p>
        </div>
      </div>
    );
  }

  const MetricItem = ({
    label,
    value,
    icon: Icon,
    accentColor,
    trend,
  }: {
    label: string;
    value: string | number;
    icon: React.ElementType;
    accentColor: 'coral' | 'teal' | 'sage' | 'yuzu';
    trend?: "up" | "down" | "neutral";
  }) => {
    const colorMap = {
      coral: {
        bg: 'bg-[var(--forest-50)]',
        icon: 'text-[var(--forest-600)]',
        border: 'border-l-[var(--forest-400)]',
      },
      teal: {
        bg: 'bg-[var(--sage-100)]',
        icon: 'text-[var(--forest-700)]',
        border: 'border-l-[var(--forest-500)]',
      },
      sage: {
        bg: 'bg-[var(--sage-50)]',
        icon: 'text-[var(--sage-500)]',
        border: 'border-l-[var(--sage-400)]',
      },
      yuzu: {
        bg: 'bg-[var(--status-warning-bg)]',
        icon: 'text-[var(--status-warning)]',
        border: 'border-l-[var(--status-warning)]',
      },
    };

    const colors = colorMap[accentColor];

    return (
      <div className={`bg-[var(--paper-white)] rounded-[var(--radius-md)] p-4 border border-[var(--paper-200)] border-l-4 ${colors.border} transition-all duration-200 hover:shadow-[var(--shadow-md)]`}>
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-[var(--radius-md)] ${colors.bg}`}>
            <Icon className={`w-5 h-5 ${colors.icon}`} />
          </div>
          {trend && trend !== "neutral" && (
            <div className={`flex items-center text-xs font-medium ${
              trend === "up" ? "text-[var(--success-fg)]" : "text-[var(--coral-600)]"
            }`}>
              {trend === "up" ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
            </div>
          )}
        </div>
        <p className="text-xs font-medium text-[var(--ink-200)] uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-[var(--ink-500)] font-[var(--font-mono)]">{value}</p>
      </div>
    );
  };

  return (
    <div className="evalia-card">
      <h3 className="evalia-card-title mb-4">Participation Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricItem
          label="Total Responses"
          value={metrics.totalResponses}
          icon={Users}
          accentColor="coral"
          trend={metrics.trendTotalResponses}
        />
        <MetricItem
          label="Response Rate"
          value={metrics.responseRate !== null ? `${metrics.responseRate}%` : "N/A"}
          icon={Users}
          accentColor="teal"
          trend={metrics.trendResponseRate}
        />
        <MetricItem
          label="Completion Rate"
          value={`${metrics.completionRate}%`}
          icon={CheckCircle}
          accentColor="sage"
          trend={metrics.trendCompletionRate}
        />
        <MetricItem
          label="Avg Completion Time"
          value={`${metrics.avgCompletionTimeMinutes}m`}
          icon={Clock}
          accentColor="yuzu"
          trend={metrics.trendAvgTime}
        />
      </div>
    </div>
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
