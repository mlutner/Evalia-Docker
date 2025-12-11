/**
 * NoScoringBanner - Informational banner for basic analytics
 * 
 * [ANAL-DASH-020] Clear messaging for surveys without scoring configuration.
 * Explains what analytics are available and why view is limited.
 */

import React from "react";
import { Info, BarChart3 } from "lucide-react";

interface NoScoringBannerProps {
  className?: string;
}

export function NoScoringBanner({ className = "" }: NoScoringBannerProps) {
  return (
    <div className={`bg-[var(--neutral-50)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-[var(--neutral-100)] rounded-full flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-[var(--text-muted)]" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
            Question-Level Analytics
          </h4>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            This survey does not have a scoring model configured. Results are shown at
            the question level only. To enable score-based analytics like performance bands
            and dimension trends, configure scoring in the survey builder.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact variant for use in smaller spaces
 */
export function NoScoringBannerCompact({ className = "" }: NoScoringBannerProps) {
  return (
    <div className={`bg-[var(--neutral-50)] border-l-4 border-[var(--neutral-400)] px-4 py-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
        <p className="text-sm text-[var(--text-secondary)]">
          Question-level analytics only — no scoring model configured.
        </p>
      </div>
    </div>
  );
}

