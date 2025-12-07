/**
 * AnalyticsWarningBanner - Display warnings about data confidence
 * 
 * [ANAL-QA-050] Shows clear messages when:
 * - Response count is low
 * - Scoring is misconfigured
 * - Single version mode (no trends)
 * - No manager data
 */

import React from "react";
import { AlertTriangle, Info, AlertCircle, XCircle } from "lucide-react";
import type { AnalyticsWarning } from "@shared/analyticsConfidence";

interface AnalyticsWarningBannerProps {
  warnings: AnalyticsWarning[];
  className?: string;
}

const SEVERITY_STYLES = {
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: Info,
    iconColor: 'text-blue-500',
    textColor: 'text-blue-800',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    textColor: 'text-amber-800',
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    icon: XCircle,
    iconColor: 'text-red-500',
    textColor: 'text-red-800',
  },
};

export function AnalyticsWarningBanner({ warnings, className = '' }: AnalyticsWarningBannerProps) {
  if (warnings.length === 0) return null;

  // Group by severity, show errors first
  const sortedWarnings = [...warnings].sort((a, b) => {
    const order = { error: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className={`space-y-2 ${className}`}>
      {sortedWarnings.map((warning, index) => {
        const style = SEVERITY_STYLES[warning.severity];
        const Icon = style.icon;
        
        return (
          <div
            key={`${warning.type}-${index}`}
            className={`p-4 rounded-lg border ${style.bg} flex items-start gap-3`}
          >
            <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${style.iconColor}`} />
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium ${style.textColor}`}>
                {warning.title}
              </h4>
              <p className={`text-sm mt-0.5 ${style.textColor} opacity-90`}>
                {warning.message}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Single warning display for inline use.
 */
export function InlineWarning({ warning }: { warning: AnalyticsWarning }) {
  const style = SEVERITY_STYLES[warning.severity];
  const Icon = style.icon;
  
  return (
    <div className={`p-3 rounded-lg border ${style.bg} flex items-start gap-2 text-sm`}>
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style.iconColor}`} />
      <span className={style.textColor}>{warning.message}</span>
    </div>
  );
}

