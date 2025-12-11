/**
 * AnalyticsPlaceholderCard - Standardized placeholder for upcoming analytics features
 * 
 * [BUILD-020] Analytics Component Library
 * 
 * Used for analytics sections that are not yet implemented.
 * Provides a consistent "Coming soon" UI pattern.
 */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export interface AnalyticsPlaceholderCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  footnote?: string; // default: "Coming soon"
}

export function AnalyticsPlaceholderCard({
  title,
  description,
  icon: Icon,
  footnote = "Coming soon",
}: AnalyticsPlaceholderCardProps) {
  return (
    <Card className="bg-[var(--bg-card)] border border-[var(--border-default)]">
      <CardContent className="py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-[var(--neutral-100)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-[var(--text-subtle)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            {title}
          </h3>
          <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
            {description}
          </p>
          <p className="text-xs text-[var(--text-subtle)] mt-4">
            {footnote}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default AnalyticsPlaceholderCard;

