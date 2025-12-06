/**
 * MetricStatCard - Generic stat card for top-level analytics metrics
 * 
 * [BUILD-020] Analytics Component Library
 * 
 * Wrapper around Card for displaying individual statistics in the Overview tab.
 * Supports trend indicators, tone-based styling, and optional subtext.
 */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MetricStatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  trendDirection?: "up" | "down" | "neutral";
  trendValueLabel?: string; // e.g. "+12% vs previous"
  tone?: "primary" | "success" | "warning" | "critical" | "neutral";
}

// Tone-based styling for icon background and text
const toneStyles = {
  primary: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  success: {
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  warning: {
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  critical: {
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  neutral: {
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  },
};

// Trend styling
const trendStyles = {
  up: {
    icon: TrendingUp,
    color: "text-emerald-600",
  },
  down: {
    icon: TrendingDown,
    color: "text-red-500",
  },
  neutral: {
    icon: Minus,
    color: "text-gray-400",
  },
};

export function MetricStatCard({
  label,
  value,
  subtext,
  icon: Icon,
  trendDirection,
  trendValueLabel,
  tone = "neutral",
}: MetricStatCardProps) {
  const { iconBg, iconColor } = toneStyles[tone];
  const trend = trendDirection ? trendStyles[trendDirection] : null;
  const TrendIcon = trend?.icon;

  return (
    <Card className="bg-white border border-gray-200 hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("p-2 rounded-lg", iconBg)}>
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
          
          {/* Trend indicator */}
          {trend && TrendIcon && (
            <div className={cn("flex items-center text-xs gap-1", trend.color)}>
              <TrendIcon className="w-3 h-3" />
              {trendValueLabel && (
                <span className="font-medium">{trendValueLabel}</span>
              )}
            </div>
          )}
        </div>

        {/* Label */}
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          {label}
        </p>

        {/* Value */}
        <p className="text-2xl font-bold text-gray-900">{value}</p>

        {/* Subtext */}
        {subtext && (
          <p className="text-xs text-gray-400 mt-1">{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default MetricStatCard;

