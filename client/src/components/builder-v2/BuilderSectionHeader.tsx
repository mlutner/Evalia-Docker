/**
 * BuilderSectionHeader - Unified header for Build, Logic, and Scoring modes
 * Minimal, understated design that doesn't scream "AI built this"
 */
import React from 'react';

interface BuilderSectionHeaderProps {
  title: string;
  context?: string;
  count?: number;
}

export function BuilderSectionHeader({ title, context, count }: BuilderSectionHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-baseline gap-3">
        <h2 className="text-[15px] font-medium text-gray-900 tracking-tight">
          {title}
        </h2>
        {count !== undefined && (
          <span className="text-[13px] text-gray-400 tabular-nums">
            {count}
          </span>
        )}
      </div>
      {context && (
        <p className="text-[13px] text-gray-400 mt-1">
          {context}
        </p>
      )}
    </div>
  );
}

