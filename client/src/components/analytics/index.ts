/**
 * Analytics Component Library
 * 
 * [BUILD-020] Centralized exports for analytics components
 * [ANAL-004] Index Distribution components added
 * [ANAL-006] Question Summary components added
 * [ANAL-007] Manager Comparison components added
 * [ANAL-008] Trend Line Chart components added
 * [ANAL-009] Before/After Comparison components added
 * [ANAL-DIM-001] Dimension Leaderboard Table added
 * [ANAL-DASH-010] Generic Scoring Dashboard components added
 */

// Core components
export { MetricStatCard } from "./MetricStatCard";
export type { MetricStatCardProps } from "./MetricStatCard";

export { AnalyticsPlaceholderCard } from "./AnalyticsPlaceholderCard";
export type { AnalyticsPlaceholderCardProps } from "./AnalyticsPlaceholderCard";

export { AnalyticsSectionShell } from "./AnalyticsSectionShell";
export type { AnalyticsSectionShellProps } from "./AnalyticsSectionShell";

// Participation components
export { ParticipationMetricsCard, calculateParticipationMetrics } from "./ParticipationMetricsCard";
export type { ParticipationMetrics } from "./ParticipationMetricsCard";

// Index Distribution components [ANAL-004]
export { IndexDistributionChart } from "./IndexDistributionChart";

// Band Distribution components [ANAL-005]
export { BandDistributionChart } from "./BandDistributionChart";

// Question Summary components [ANAL-006]
export { QuestionSummaryTable } from "./QuestionSummaryTable";

// Manager Comparison components [ANAL-007]
export { ManagerComparisonTable } from "./ManagerComparisonTable";

// Dimension Trends components [ANAL-008]
export { DimensionTrendsChart } from "./DimensionTrendsChart";

// Before/After Comparison components [ANAL-009]
export { BeforeAfterComparisonChart } from "./BeforeAfterComparisonChart";

// Dimension Leaderboard [ANAL-DIM-001]
export { DimensionLeaderboardTable } from "./DimensionLeaderboardTable";

// Category-based components [ANAL-DASH-010]
export { CategoryLeaderboardTable } from "./CategoryLeaderboardTable";
export { CategoryScoreCard } from "./CategoryScoreCard";

// Basic analytics components [ANAL-DASH-020]
export { NoScoringBanner, NoScoringBannerCompact } from "./NoScoringBanner";
export { TopBottomItemsCard } from "./TopBottomItemsCard";

// Version selector
export { VersionSelector } from "./VersionSelector";
export type { Version } from "./VersionSelector";

// Hooks
export { useParticipationMetrics } from "./useParticipationMetrics";
export { useIndexDistribution } from "./useIndexDistribution";
export { useIndexBandDistribution } from "./useIndexBandDistribution";
export { useQuestionSummary } from "./useQuestionSummary";
export { useManagerIndexSummary } from "./useManagerIndexSummary";
export { useIndexTrendsSummary } from "./useIndexTrendsSummary";
export { useBeforeAfterComparison } from "./useBeforeAfterComparison";
