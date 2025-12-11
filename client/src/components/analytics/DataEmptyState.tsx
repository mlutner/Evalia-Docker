/**
 * DataEmptyState - Generic empty state for analytics components
 * 
 * [ANAL-QA-050] Clear, helpful empty states instead of misleading zeros.
 */

import React from "react";
import { AlertTriangle, BarChart3, Users, TrendingUp, Clock, Database } from "lucide-react";

interface DataEmptyStateProps {
  title: string;
  description: string;
  icon?: React.ElementType;
  variant?: 'default' | 'compact';
}


export function DataEmptyState({ 
  title, 
  description, 
  icon: Icon = AlertTriangle,
  variant = 'default',
}: DataEmptyStateProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 py-4 px-3 text-[var(--text-muted)]">
        <Icon className="w-5 h-5 text-[var(--text-subtle)]" />
        <div>
          <span className="font-medium text-[var(--text-secondary)]">{title}</span>
          <span className="text-[var(--text-muted)]"> – {description}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--neutral-100)] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[var(--text-subtle)]" />
      </div>
      <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] max-w-md">{description}</p>
    </div>
  );
}

/**
 * Pre-configured empty states for common scenarios.
 */
export function NoResponsesState() {
  return (
    <DataEmptyState
      icon={Clock}
      title="Waiting for Responses"
      description="This survey hasn't received any responses yet. Analytics will appear once participants submit their responses."
    />
  );
}

export function NoScoreDataState() {
  return (
    <DataEmptyState
      icon={BarChart3}
      title="No Score Data"
      description="No responses have been scored yet. This may happen if scoring is disabled or no responses match the scoring criteria."
    />
  );
}

export function NoBandDataState() {
  return (
    <DataEmptyState
      icon={BarChart3}
      title="No Band Data"
      description="No responses have been assigned to performance bands. Ensure scoring is configured and responses have been submitted."
    />
  );
}

export function NoTrendDataState() {
  return (
    <DataEmptyState
      icon={TrendingUp}
      title="No Trend Data"
      description="Trend analysis requires responses across multiple scoring versions. Create additional versions to track changes over time."
    />
  );
}

export function NoManagerDataState() {
  return (
    <DataEmptyState
      icon={Users}
      title="No Manager Data"
      description="Manager comparison requires responses to include manager metadata. Ensure surveys collect manager information."
    />
  );
}

export function NoDimensionDataState() {
  return (
    <DataEmptyState
      icon={Database}
      title="No Dimension Data"
      description="This survey's scoring categories don't map to Insight Dimensions. Configure categories that align with the 5D framework."
    />
  );
}

/**
 * Single snapshot mode indicator for trends.
 */
export function SingleSnapshotModeIndicator({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm text-[var(--forest-700)] bg-[var(--forest-50)] px-3 py-2 rounded-[var(--radius-md)] ${className}`}>
      <Clock className="w-4 h-4" />
      <span>
        <strong>Single Snapshot Mode</strong> – Trend analysis requires multiple scoring versions.
      </span>
    </div>
  );
}

