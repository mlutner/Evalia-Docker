/**
 * Analytics Types - Source of Truth
 * 
 * This file defines all TypeScript interfaces for analytics metrics.
 * All shapes must match docs/ANALYTICS_METRIC_SPEC_PEOPLE_DEV.md
 * 
 * [NAMING-001] Uses "Evalia Insight Dimensions (EID)" terminology.
 * See docs/INSIGHT_DIMENSIONS_NAMING.md for naming conventions.
 * 
 * If there is a conflict between code and spec, update the spec first, then the code.
 * 
 * @module shared/analytics
 */

// ============================================================================
// STANDARD RESPONSE STRUCTURE
// ============================================================================

/**
 * Standard analytics response wrapper.
 * All analytics endpoints return this structure.
 */
export interface AnalyticsResponse<T> {
  meta: AnalyticsMeta;
  data: T;
}

export interface AnalyticsMeta {
  surveyId: string;
  version?: string; // score_config_version_id
  indexType?: string; // e.g., "leadership-effectiveness"
  segmentBy?: string; // e.g., "manager", "team"
  managerId?: string; // For self_vs_team_comparison
  versionBefore?: string; // For before_after comparison
  versionAfter?: string; // For before_after comparison
  generatedAt: string; // ISO 8601 timestamp
}

// ============================================================================
// METRIC TYPE 1: INDEX DISTRIBUTION
// ============================================================================

export interface IndexDistributionBucket {
  range: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
}

export interface IndexDistributionStatistics {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
}

export interface IndexDistributionData {
  overall: {
    buckets: IndexDistributionBucket[];
    statistics: IndexDistributionStatistics;
  };
}

export type IndexDistributionResponse = AnalyticsResponse<IndexDistributionData>;

// ============================================================================
// METRIC TYPE 2: INDEX BAND DISTRIBUTION
// ============================================================================

export interface IndexBand {
  bandId: string;
  bandLabel: string;
  color: string;
  count: number;
  percentage: number;
  minScore: number;
  maxScore: number;
}

export interface IndexBandDistributionData {
  bands: IndexBand[];
  totalResponses: number;
}

export type IndexBandDistributionResponse = AnalyticsResponse<IndexBandDistributionData>;

// ============================================================================
// METRIC TYPE 3: DOMAIN OVERVIEW
// ============================================================================

export interface DomainCategory {
  categoryId: string;
  categoryName: string;
  averageScore: number;
  minScore: number;
  maxScore: number;
  responseCount: number;
  weight: number;
  contributionToTotal: number;
}

export interface DomainOverviewData {
  categories: DomainCategory[];
}

export type DomainOverviewResponse = AnalyticsResponse<DomainOverviewData>;

// ============================================================================
// METRIC TYPE 4: DOMAIN OVERVIEW BY SEGMENT
// ============================================================================

export interface SegmentCategory {
  categoryId: string;
  categoryName: string;
  averageScore: number;
  responseCount: number;
}

export interface DomainSegment {
  segmentId: string;
  segmentLabel: string;
  categories: SegmentCategory[];
}

export interface DomainOverviewBySegmentData {
  segments: DomainSegment[];
}

export type DomainOverviewBySegmentResponse = AnalyticsResponse<DomainOverviewBySegmentData>;

// ============================================================================
// METRIC TYPE 5: INDEX TREND
// ============================================================================

export interface IndexTrendDataPoint {
  date: string;
  leadershipIndex?: number;
  wellbeingIndex?: number;
  burnoutRiskIndex?: number;
  psychologicalSafetyIndex?: number;
  engagementIndex?: number;
  [key: string]: string | number | undefined; // Allow additional index types
}

export interface IndexTrendData {
  series: IndexTrendDataPoint[];
}

export type IndexTrendResponse = AnalyticsResponse<IndexTrendData>;

// ============================================================================
// METRIC TYPE 6: HOTSPOT SUMMARY
// ============================================================================

export interface HotspotIssue {
  indexType?: string;
  indexValue?: number;
  domainId?: string;
  domainValue?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

export interface Hotspot {
  segmentId: string;
  segmentLabel: string;
  segmentType: 'manager' | 'team' | 'department' | 'location';
  issues: HotspotIssue[];
  priority: 'low' | 'medium' | 'high';
}

export interface HotspotSummaryData {
  hotspots: Hotspot[];
}

export type HotspotSummaryResponse = AnalyticsResponse<HotspotSummaryData>;

// ============================================================================
// METRIC TYPE 7: SELF VS TEAM COMPARISON
// ============================================================================

export interface IndexScores {
  leadershipIndex?: number;
  wellbeingIndex?: number;
  burnoutRiskIndex?: number;
  psychologicalSafetyIndex?: number;
  engagementIndex?: number;
  domains?: Record<string, number>;
}

export interface SelfVsTeamComparisonData {
  manager: {
    selfAssessment: IndexScores;
    teamAssessment: IndexScores;
    gaps: IndexScores;
  };
}

export type SelfVsTeamComparisonResponse = AnalyticsResponse<SelfVsTeamComparisonData>;

// ============================================================================
// METRIC TYPE 8: INDEX SUMMARY BY SEGMENT
// ============================================================================

export interface IndexSummarySegment {
  segmentId: string;
  segmentLabel: string;
  indices: {
    leadershipEffectiveness?: number;
    teamWellbeing?: number;
    burnoutRisk?: number;
    psychologicalSafety?: number;
    engagement?: number;
  };
  responseCount: number;
}

export interface IndexSummaryBySegmentData {
  segments: IndexSummarySegment[];
}

export type IndexSummaryBySegmentResponse = AnalyticsResponse<IndexSummaryBySegmentData>;

// ============================================================================
// METRIC TYPE 9: DOMAIN HEATMAP BY SEGMENT
// ============================================================================

export interface DomainHeatmapCell {
  domainId: string;
  score: number;
  band: string;
}

export interface DomainHeatmapRow {
  segmentId: string;
  segmentLabel: string;
  domains: DomainHeatmapCell[];
}

export interface DomainHeatmapBySegmentData {
  matrix: DomainHeatmapRow[];
}

export type DomainHeatmapBySegmentResponse = AnalyticsResponse<DomainHeatmapBySegmentData>;

// ============================================================================
// METRIC TYPE 10: BEFORE/AFTER INDEX COMPARISON (ANAL-009)
// ============================================================================

/**
 * Version metadata for comparison
 */
export interface ComparisonVersionInfo {
  id: string;
  label: string;
  versionNumber: number;
  date: string;
  responseCount: number;
}

/**
 * Per-dimension comparison result
 */
export interface DimensionComparison {
  dimensionId: string;
  dimensionLabel: string;
  scoreBefore: number | null;
  scoreAfter: number | null;
  change: number | null;
  changePercent: number | null;
  trend: 'up' | 'down' | 'neutral';
}

/**
 * Overall comparison summary
 */
export interface ComparisonSummary {
  totalDimensionsImproved: number;
  totalDimensionsDeclined: number;
  totalDimensionsStable: number;
  overallTrend: 'positive' | 'negative' | 'mixed' | 'stable';
}

/**
 * Full before/after comparison data
 */
export interface BeforeAfterIndexComparisonData {
  versionBefore: ComparisonVersionInfo;
  versionAfter: ComparisonVersionInfo;
  comparison: DimensionComparison[];
  summary: ComparisonSummary;
}

export type BeforeAfterIndexComparisonResponse = AnalyticsResponse<BeforeAfterIndexComparisonData>;

// ============================================================================
// PARTICIPATION METRICS (Added for ANAL-010)
// ============================================================================

export interface ParticipationMetricsData {
  totalResponses: number;
  responseRate: number | null; // percentage, null if invites not tracked
  completionRate: number; // percentage
  avgCompletionTime: number | null; // seconds, null if not available
}

export type ParticipationMetricsResponse = AnalyticsResponse<ParticipationMetricsData>;

// ============================================================================
// QUESTION SUMMARY (Added for ANAL-006)
// ============================================================================

/**
 * Option distribution for scaled/choice questions
 */
export interface OptionDistribution {
  value: string;
  label: string;
  count: number;
  percentage: number;
}

/**
 * Question-level summary statistics
 */
export interface QuestionSummaryItem {
  questionId: string;
  questionNumber: number;
  questionText: string;
  questionType: string;
  completionRate: number; // percentage of responses that answered this question
  totalAnswers: number;
  // For numeric questions (rating, nps, likert, slider, etc.)
  avgValue: number | null;
  minValue: number | null;
  maxValue: number | null;
  // For scaled/choice questions
  distribution: OptionDistribution[] | null;
}

/**
 * Question summary response data
 */
export interface QuestionSummaryData {
  questions: QuestionSummaryItem[];
  totalResponses: number;
}

export type QuestionSummaryResponse = AnalyticsResponse<QuestionSummaryData>;

// ============================================================================
// MANAGER INDEX SUMMARY (Added for ANAL-007)
// ============================================================================

/**
 * Band distribution item for manager summary
 */
export interface ManagerBandDistribution {
  bandId: string;
  bandLabel: string;
  count: number;
  percentage: number;
  color: string;
}

/**
 * Summary item for a single manager
 */
export interface ManagerSummaryItem {
  managerId: string;
  managerName?: string; // from metadata if available
  respondentCount: number;
  completionRate: number;
  avgIndexScore: number;
  bandDistribution: ManagerBandDistribution[];
}

/**
 * Manager index summary response data
 */
export interface ManagerIndexSummaryData {
  managers: ManagerSummaryItem[];
  totalManagers: number;
  totalResponses: number;
}

export type ManagerIndexSummaryResponse = AnalyticsResponse<ManagerIndexSummaryData>;

// ============================================================================
// INDEX TRENDS SUMMARY (Added for ANAL-008)
// ============================================================================

/**
 * Individual trend point representing index scores at a specific version
 */
export interface IndexTrendPoint {
  versionId: string;
  versionLabel: string;
  versionNumber: number;
  versionDate: string;
  scores: {
    leadershipEffectiveness: number | null;
    teamWellbeing: number | null;
    burnoutRisk: number | null;
    psychologicalSafety: number | null;
    engagement: number | null;
  };
  responseCount: number;
}

/**
 * Index trends summary data - shows how index scores change over versions
 */
export interface IndexTrendsSummaryData {
  trends: IndexTrendPoint[];
  totalVersions: number;
  hasMultipleVersions: boolean;
}

export type IndexTrendsSummaryResponse = AnalyticsResponse<IndexTrendsSummaryData>;

// ============================================================================
// METRIC ID REGISTRY
// ============================================================================

/**
 * All supported metric IDs.
 * Each metric ID maps to a specific metric type and handler.
 */
export const METRIC_IDS = {
  // Index Distribution (5)
  LEADERSHIP_INDEX_DISTRIBUTION: 'leadership_index_distribution',
  WELLBEING_INDEX_DISTRIBUTION: 'wellbeing_index_distribution',
  BURNOUT_RISK_DISTRIBUTION: 'burnout_risk_distribution',
  PSYCHOLOGICAL_SAFETY_DISTRIBUTION: 'psychological_safety_distribution',
  ENGAGEMENT_INDEX_DISTRIBUTION: 'engagement_index_distribution',
  
  // Index Band Distribution (5)
  LEADERSHIP_INDEX_BAND_DISTRIBUTION: 'leadership_index_band_distribution',
  WELLBEING_INDEX_BAND_DISTRIBUTION: 'wellbeing_index_band_distribution',
  BURNOUT_RISK_BAND_DISTRIBUTION: 'burnout_risk_band_distribution',
  PSYCHOLOGICAL_SAFETY_BAND_DISTRIBUTION: 'psychological_safety_band_distribution',
  ENGAGEMENT_INDEX_BAND_DISTRIBUTION: 'engagement_index_band_distribution',
  
  // Domain Overview (3)
  LEADERSHIP_DOMAIN_OVERVIEW: 'leadership_domain_overview',
  WELLBEING_DOMAIN_OVERVIEW: 'wellbeing_domain_overview',
  ENGAGEMENT_DOMAIN_OVERVIEW: 'engagement_domain_overview',
  
  // Domain Overview by Segment (3)
  LEADERSHIP_DOMAIN_OVERVIEW_BY_MANAGER: 'leadership_domain_overview_by_manager',
  WELLBEING_DOMAIN_OVERVIEW_BY_MANAGER: 'wellbeing_domain_overview_by_manager',
  LEADERSHIP_DOMAIN_OVERVIEW_BY_TEAM: 'leadership_domain_overview_by_team',
  
  // Index Trend (3)
  LEADERSHIP_INDEX_TREND: 'leadership_index_trend',
  WELLBEING_INDEX_TREND: 'wellbeing_index_trend',
  BURNOUT_RISK_TREND: 'burnout_risk_trend',
  
  // Hotspot Summary (1)
  HOTSPOT_SUMMARY: 'hotspot_summary',
  
  // Self vs Team Comparison (1)
  SELF_VS_TEAM_COMPARISON: 'self_vs_team_comparison',
  
  // Index Summary by Segment (2)
  INDEX_SUMMARY_BY_MANAGER: 'index_summary_by_manager',
  INDEX_SUMMARY_BY_TEAM: 'index_summary_by_team',
  
  // Domain Heatmap by Segment (1)
  DOMAIN_HEATMAP_BY_MANAGER: 'domain_heatmap_by_manager',
  
  // Before/After Index Comparison (1) - ANAL-009
  BEFORE_AFTER_INDEX_COMPARISON: 'before_after_index_comparison',
  
  // Participation Metrics (1)
  PARTICIPATION_METRICS: 'participation_metrics',
  
  // Question Summary (1) - ANAL-006
  QUESTION_SUMMARY: 'question_summary',
  
  // Manager Index Summary (1) - ANAL-007
  MANAGER_INDEX_SUMMARY: 'manager_index_summary',
  
  // Index Trends Summary (1) - ANAL-008
  INDEX_TRENDS_SUMMARY: 'index_trends_summary',
} as const;

export type MetricId = typeof METRIC_IDS[keyof typeof METRIC_IDS];

/**
 * Metric type mapping for runtime validation.
 */
export const METRIC_TYPE_MAP: Record<MetricId, string> = {
  [METRIC_IDS.LEADERSHIP_INDEX_DISTRIBUTION]: 'index_distribution',
  [METRIC_IDS.WELLBEING_INDEX_DISTRIBUTION]: 'index_distribution',
  [METRIC_IDS.BURNOUT_RISK_DISTRIBUTION]: 'index_distribution',
  [METRIC_IDS.PSYCHOLOGICAL_SAFETY_DISTRIBUTION]: 'index_distribution',
  [METRIC_IDS.ENGAGEMENT_INDEX_DISTRIBUTION]: 'index_distribution',
  
  [METRIC_IDS.LEADERSHIP_INDEX_BAND_DISTRIBUTION]: 'index_band_distribution',
  [METRIC_IDS.WELLBEING_INDEX_BAND_DISTRIBUTION]: 'index_band_distribution',
  [METRIC_IDS.BURNOUT_RISK_BAND_DISTRIBUTION]: 'index_band_distribution',
  [METRIC_IDS.PSYCHOLOGICAL_SAFETY_BAND_DISTRIBUTION]: 'index_band_distribution',
  [METRIC_IDS.ENGAGEMENT_INDEX_BAND_DISTRIBUTION]: 'index_band_distribution',
  
  [METRIC_IDS.LEADERSHIP_DOMAIN_OVERVIEW]: 'domain_overview',
  [METRIC_IDS.WELLBEING_DOMAIN_OVERVIEW]: 'domain_overview',
  [METRIC_IDS.ENGAGEMENT_DOMAIN_OVERVIEW]: 'domain_overview',
  
  [METRIC_IDS.LEADERSHIP_DOMAIN_OVERVIEW_BY_MANAGER]: 'domain_overview_by_segment',
  [METRIC_IDS.WELLBEING_DOMAIN_OVERVIEW_BY_MANAGER]: 'domain_overview_by_segment',
  [METRIC_IDS.LEADERSHIP_DOMAIN_OVERVIEW_BY_TEAM]: 'domain_overview_by_segment',
  
  [METRIC_IDS.LEADERSHIP_INDEX_TREND]: 'index_trend',
  [METRIC_IDS.WELLBEING_INDEX_TREND]: 'index_trend',
  [METRIC_IDS.BURNOUT_RISK_TREND]: 'index_trend',
  
  [METRIC_IDS.HOTSPOT_SUMMARY]: 'hotspot_summary',
  
  [METRIC_IDS.SELF_VS_TEAM_COMPARISON]: 'self_vs_team_comparison',
  
  [METRIC_IDS.INDEX_SUMMARY_BY_MANAGER]: 'index_summary_by_segment',
  [METRIC_IDS.INDEX_SUMMARY_BY_TEAM]: 'index_summary_by_segment',
  
  [METRIC_IDS.DOMAIN_HEATMAP_BY_MANAGER]: 'domain_heatmap_by_segment',
  
  [METRIC_IDS.BEFORE_AFTER_INDEX_COMPARISON]: 'before_after_index_comparison',
  
  [METRIC_IDS.PARTICIPATION_METRICS]: 'participation_metrics',
  
  [METRIC_IDS.QUESTION_SUMMARY]: 'question_summary',
  
  [METRIC_IDS.MANAGER_INDEX_SUMMARY]: 'manager_index_summary',
  
  [METRIC_IDS.INDEX_TRENDS_SUMMARY]: 'index_trends_summary',
};

// ============================================================================
// EVALIA INSIGHT DIMENSIONS (EID FRAMEWORK)
// ============================================================================

/**
 * Evalia Insight Dimensions – Brand-safe naming mapping.
 * 
 * Maps internal technical IDs to user-facing dimension labels.
 * See docs/INSIGHT_DIMENSIONS_NAMING.md for naming conventions.
 * 
 * Usage:
 *   import { INSIGHT_DIMENSIONS, getInsightDimensionLabel } from '@shared/analytics';
 *   const label = getInsightDimensionLabel('leadership-effectiveness');
 *   // → "Leadership Effectiveness Dimension"
 */
export const INSIGHT_DIMENSIONS = {
  leadershipEffectiveness: {
    id: 'leadership_effectiveness',
    indexType: 'leadership-effectiveness',
    label: 'Leadership Effectiveness Dimension',
    shortLabel: 'Leadership Effectiveness',
  },
  teamWellbeing: {
    id: 'team_wellbeing',
    indexType: 'team-wellbeing',
    label: 'Team Wellbeing Dimension',
    shortLabel: 'Team Wellbeing',
  },
  burnoutRisk: {
    id: 'burnout_risk',
    indexType: 'burnout-risk',
    label: 'Burnout Risk Dimension',
    shortLabel: 'Burnout Risk',
  },
  psychologicalSafety: {
    id: 'psychological_safety',
    indexType: 'psychological-safety',
    label: 'Psychological Safety Dimension',
    shortLabel: 'Psychological Safety',
  },
  engagementEnergy: {
    id: 'engagement_energy',
    indexType: 'engagement',
    label: 'Engagement Energy Dimension',
    shortLabel: 'Engagement',
  },
} as const;

/**
 * Type for Insight Dimension internal IDs (snake_case).
 */
export type InsightDimensionId = 
  (typeof INSIGHT_DIMENSIONS)[keyof typeof INSIGHT_DIMENSIONS]['id'];

/**
 * Type for Insight Dimension indexType values (kebab-case).
 */
export type InsightDimensionIndexType = 
  (typeof INSIGHT_DIMENSIONS)[keyof typeof INSIGHT_DIMENSIONS]['indexType'];

/**
 * Get the brand-safe label for an indexType value.
 * 
 * @param indexType - The indexType value (e.g., 'leadership-effectiveness')
 * @param useShortLabel - If true, returns short label (e.g., 'Leadership Effectiveness')
 * @returns The dimension label, or the input if no mapping found
 * 
 * @example
 * getInsightDimensionLabel('leadership-effectiveness')
 * // → "Leadership Effectiveness Dimension"
 * 
 * getInsightDimensionLabel('engagement', true)
 * // → "Engagement"
 */
export function getInsightDimensionLabel(
  indexType: string,
  useShortLabel: boolean = false
): string {
  const dimension = Object.values(INSIGHT_DIMENSIONS).find(
    (d) => d.indexType === indexType
  );
  
  if (dimension) {
    return useShortLabel ? dimension.shortLabel : dimension.label;
  }
  
  // Fallback: capitalize and format the indexType
  return indexType
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get dimension metadata from an indexType value.
 * 
 * @param indexType - The indexType value (e.g., 'leadership-effectiveness')
 * @returns The dimension object or undefined if not found
 */
export function getInsightDimension(indexType: string) {
  return Object.values(INSIGHT_DIMENSIONS).find(
    (d) => d.indexType === indexType
  );
}

