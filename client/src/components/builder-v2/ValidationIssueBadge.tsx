/**
 * ValidationIssueBadge - Shows issue counts for logic/scoring validation
 * Used in BuilderModeToggle and other places to indicate problems
 */
import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface ValidationIssueBadgeProps {
  errorCount: number;
  warningCount: number;
  showZero?: boolean;
  size?: 'sm' | 'md';
}

export function ValidationIssueBadge({
  errorCount,
  warningCount,
  showZero = false,
  size = 'sm',
}: ValidationIssueBadgeProps) {
  if (errorCount === 0 && warningCount === 0 && !showZero) {
    return null;
  }

  const iconSize = size === 'sm' ? 12 : 14;
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1';

  if (errorCount > 0) {
    return (
      <span
        className={`inline-flex items-center gap-1 ${padding} ${textSize} font-medium bg-red-50 text-red-600 rounded-full`}
        title={`${errorCount} error${errorCount !== 1 ? 's' : ''}`}
      >
        <AlertCircle size={iconSize} />
        {errorCount}
      </span>
    );
  }

  if (warningCount > 0) {
    return (
      <span
        className={`inline-flex items-center gap-1 ${padding} ${textSize} font-medium bg-amber-50 text-amber-600 rounded-full`}
        title={`${warningCount} warning${warningCount !== 1 ? 's' : ''}`}
      >
        <AlertTriangle size={iconSize} />
        {warningCount}
      </span>
    );
  }

  return null;
}

/**
 * Inline issue indicator - small dot for lists
 */
export function IssueIndicatorDot({
  severity,
}: {
  severity: 'error' | 'warning' | 'info' | null;
}) {
  if (!severity) return null;

  const colorClass = {
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
  }[severity];

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${colorClass}`}
      title={severity}
    />
  );
}

/**
 * Compact issue message for cards
 */
export function IssueMessage({
  message,
  severity,
}: {
  message: string;
  severity: 'error' | 'warning' | 'info';
}) {
  const colorClass = {
    error: 'text-red-600 bg-red-50',
    warning: 'text-amber-600 bg-amber-50',
    info: 'text-blue-600 bg-blue-50',
  }[severity];

  const Icon = severity === 'error' ? AlertCircle : AlertTriangle;

  return (
    <div className={`flex items-start gap-1.5 px-2 py-1.5 rounded-md ${colorClass} text-[11px]`}>
      <Icon size={12} className="flex-shrink-0 mt-0.5" />
      <span className="line-clamp-2">{message}</span>
    </div>
  );
}

