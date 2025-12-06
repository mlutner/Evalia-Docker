/**
 * Analytics Routes - Stub Handlers
 * 
 * This file defines all analytics endpoints with stub responses.
 * All shapes must match docs/ANALYTICS_METRIC_SPEC_PEOPLE_DEV.md
 * 
 * IMPORTANT: This is contract-only implementation.
 * - No database queries
 * - No actual computation
 * - Stub responses are hard-coded examples from the spec
 * 
 * Real implementations will be added in ANAL-010+
 * 
 * @module server/routes/analytics
 */

import { Router, Request, Response } from 'express';
import {
  METRIC_IDS,
  METRIC_TYPE_MAP,
  MetricId,
  AnalyticsResponse,
  AnalyticsMeta,
  IndexDistributionResponse,
  IndexBandDistributionResponse,
  DomainOverviewResponse,
  DomainOverviewBySegmentResponse,
  IndexTrendResponse,
  HotspotSummaryResponse,
  SelfVsTeamComparisonResponse,
  IndexSummaryBySegmentResponse,
  DomainHeatmapBySegmentResponse,
  BeforeAfterIndexComparisonResponse,
  ParticipationMetricsResponse,
} from '@shared/analytics';
import { 
  computeParticipationMetrics, 
  getLatestVersionId, 
  computeIndexDistribution, 
  computeIndexBandDistribution, 
  computeQuestionSummary,
  computeIndexSummaryByManager,
  computeIndexTrendsSummary,
  computeBeforeAfterIndexComparison,
  computeIndexTrend,
  type IndexType,
  type TrendGranularity,
} from '../utils/analytics';
import type { QuestionSummaryResponse, ManagerIndexSummaryResponse, IndexTrendsSummaryResponse } from '@shared/analytics';

const router = Router();

// ============================================================================
// HELPER: Generate meta object
// ============================================================================

function generateMeta(
  surveyId: string,
  options?: {
    version?: string;
    indexType?: string;
    segmentBy?: string;
    managerId?: string;
    versionBefore?: string;
    versionAfter?: string;
  }
): AnalyticsMeta {
  return {
    surveyId,
    generatedAt: new Date().toISOString(),
    ...options,
  };
}

// ============================================================================
// STUB RESPONSES (from docs/ANALYTICS_METRIC_SPEC_PEOPLE_DEV.md)
// ============================================================================

function getStubIndexDistribution(surveyId: string, indexType: string, version?: string): IndexDistributionResponse {
  return {
    meta: generateMeta(surveyId, { version: version || 'stub-version', indexType }),
    data: {
      overall: {
        buckets: [
          { range: '0-20', min: 0, max: 20, count: 5, percentage: 3.5 },
          { range: '21-40', min: 21, max: 40, count: 18, percentage: 12.7 },
          { range: '41-60', min: 41, max: 60, count: 45, percentage: 31.7 },
          { range: '61-80', min: 61, max: 80, count: 52, percentage: 36.6 },
          { range: '81-100', min: 81, max: 100, count: 22, percentage: 15.5 },
        ],
        statistics: {
          min: 12,
          max: 98,
          mean: 58.3,
          median: 62,
          stdDev: 18.7,
        },
      },
    },
  };
}

function getStubIndexBandDistribution(surveyId: string, indexType: string, version?: string): IndexBandDistributionResponse {
  return {
    meta: generateMeta(surveyId, { version: version || 'stub-version', indexType }),
    data: {
      bands: [
        { bandId: 'highly-effective', bandLabel: 'Highly Effective', color: '#22c55e', count: 22, percentage: 15.5, minScore: 85, maxScore: 100 },
        { bandId: 'effective', bandLabel: 'Effective', color: '#84cc16', count: 52, percentage: 36.6, minScore: 70, maxScore: 84 },
        { bandId: 'developing', bandLabel: 'Developing', color: '#f59e0b', count: 45, percentage: 31.7, minScore: 55, maxScore: 69 },
        { bandId: 'needs-improvement', bandLabel: 'Needs Improvement', color: '#fb923c', count: 18, percentage: 12.7, minScore: 40, maxScore: 54 },
        { bandId: 'critical', bandLabel: 'Critical', color: '#ef4444', count: 5, percentage: 3.5, minScore: 0, maxScore: 39 },
      ],
      totalResponses: 142,
    },
  };
}

function getStubDomainOverview(surveyId: string, indexType: string, version?: string): DomainOverviewResponse {
  return {
    meta: generateMeta(surveyId, { version: version || 'stub-version', indexType }),
    data: {
      categories: [
        { categoryId: 'leadership-clarity', categoryName: 'Leadership Clarity', averageScore: 65.2, minScore: 20, maxScore: 95, responseCount: 142, weight: 1.0, contributionToTotal: 28.5 },
        { categoryId: 'coaching-development', categoryName: 'Coaching & Development', averageScore: 58.7, minScore: 15, maxScore: 90, responseCount: 142, weight: 1.5, contributionToTotal: 31.2 },
        { categoryId: 'fairness-equity', categoryName: 'Fairness & Equity', averageScore: 72.1, minScore: 30, maxScore: 100, responseCount: 142, weight: 1.0, contributionToTotal: 25.8 },
        { categoryId: 'empowerment', categoryName: 'Empowerment', averageScore: 61.5, minScore: 25, maxScore: 88, responseCount: 142, weight: 1.0, contributionToTotal: 22.0 },
        { categoryId: 'communication', categoryName: 'Communication', averageScore: 68.9, minScore: 35, maxScore: 95, responseCount: 142, weight: 1.0, contributionToTotal: 24.6 },
      ],
    },
  };
}

function getStubDomainOverviewBySegment(surveyId: string, indexType: string, segmentBy: string, version?: string): DomainOverviewBySegmentResponse {
  return {
    meta: generateMeta(surveyId, { version: version || 'stub-version', indexType, segmentBy }),
    data: {
      segments: [
        {
          segmentId: 'm123',
          segmentLabel: 'John Smith',
          categories: [
            { categoryId: 'leadership-clarity', categoryName: 'Leadership Clarity', averageScore: 72.5, responseCount: 8 },
            { categoryId: 'coaching-development', categoryName: 'Coaching & Development', averageScore: 68.2, responseCount: 8 },
            { categoryId: 'fairness-equity', categoryName: 'Fairness & Equity', averageScore: 75.0, responseCount: 8 },
            { categoryId: 'empowerment', categoryName: 'Empowerment', averageScore: 70.8, responseCount: 8 },
            { categoryId: 'communication', categoryName: 'Communication', averageScore: 73.1, responseCount: 8 },
          ],
        },
        {
          segmentId: 'm456',
          segmentLabel: 'Jane Doe',
          categories: [
            { categoryId: 'leadership-clarity', categoryName: 'Leadership Clarity', averageScore: 58.3, responseCount: 12 },
          ],
        },
      ],
    },
  };
}

function getStubIndexTrend(surveyId: string, version?: string): IndexTrendResponse {
  return {
    meta: generateMeta(surveyId, { version: version || 'stub-version' }),
    data: {
      series: [
        { date: '2025-11-01', leadershipIndex: 68.5, wellbeingIndex: 72.3, burnoutRiskIndex: 42.1, psychologicalSafetyIndex: 65.8, engagementIndex: 70.2 },
        { date: '2025-12-01', leadershipIndex: 71.2, wellbeingIndex: 74.1, burnoutRiskIndex: 38.5, psychologicalSafetyIndex: 68.3, engagementIndex: 72.8 },
      ],
    },
  };
}

function getStubHotspotSummary(surveyId: string, version?: string): HotspotSummaryResponse {
  return {
    meta: generateMeta(surveyId, { version: version || 'stub-version' }),
    data: {
      hotspots: [
        {
          segmentId: 'm456',
          segmentLabel: 'Jane Doe',
          segmentType: 'manager',
          issues: [
            { indexType: 'psychological-safety', indexValue: 38, severity: 'critical', message: 'Psychological Safety Index: 38 (Very Low Safety)' },
            { domainId: 'safe-to-speak-up', domainValue: 30, severity: 'critical', message: 'Safe to Speak Up: 30 (Critical)' },
          ],
          priority: 'high',
        },
        {
          segmentId: 'eng-001',
          segmentLabel: 'Engineering',
          segmentType: 'team',
          issues: [
            { indexType: 'burnout-risk', indexValue: 75, severity: 'critical', message: 'Burnout Risk Index: 75 (Very High Risk)' },
            { domainId: 'workload-management', domainValue: 35, severity: 'critical', message: 'Workload Management: 35 (At Risk)' },
          ],
          priority: 'high',
        },
      ],
    },
  };
}

function getStubSelfVsTeamComparison(surveyId: string, managerId: string, version?: string): SelfVsTeamComparisonResponse {
  return {
    meta: generateMeta(surveyId, { version: version || 'stub-version', managerId }),
    data: {
      manager: {
        selfAssessment: {
          leadershipIndex: 85,
          wellbeingIndex: 78,
          burnoutRiskIndex: 35,
          psychologicalSafetyIndex: 82,
          engagementIndex: 80,
          domains: {
            'leadership-clarity': 88,
            'coaching-development': 82,
            'workload-management': 75,
          },
        },
        teamAssessment: {
          leadershipIndex: 72,
          wellbeingIndex: 68,
          burnoutRiskIndex: 45,
          psychologicalSafetyIndex: 65,
          engagementIndex: 70,
          domains: {
            'leadership-clarity': 75,
            'coaching-development': 68,
            'workload-management': 62,
          },
        },
        gaps: {
          leadershipIndex: -13,
          wellbeingIndex: -10,
          burnoutRiskIndex: 10,
          psychologicalSafetyIndex: -17,
          engagementIndex: -10,
          domains: {
            'leadership-clarity': -13,
            'coaching-development': -14,
            'workload-management': -13,
          },
        },
      },
    },
  };
}

function getStubIndexSummaryBySegment(surveyId: string, segmentBy: string, version?: string): IndexSummaryBySegmentResponse {
  return {
    meta: generateMeta(surveyId, { version: version || 'stub-version', segmentBy }),
    data: {
      segments: [
        {
          segmentId: 'm123',
          segmentLabel: 'John Smith',
          indices: {
            leadershipEffectiveness: 72,
            teamWellbeing: 68,
            burnoutRisk: 45,
            psychologicalSafety: 65,
            engagement: 70,
          },
          responseCount: 8,
        },
        {
          segmentId: 'm456',
          segmentLabel: 'Jane Doe',
          indices: {
            leadershipEffectiveness: 58,
            teamWellbeing: 52,
            burnoutRisk: 68,
            psychologicalSafety: 38,
            engagement: 55,
          },
          responseCount: 12,
        },
      ],
    },
  };
}

function getStubDomainHeatmapBySegment(surveyId: string, indexType: string, version?: string): DomainHeatmapBySegmentResponse {
  return {
    meta: generateMeta(surveyId, { version: version || 'stub-version', indexType }),
    data: {
      matrix: [
        {
          segmentId: 'm123',
          segmentLabel: 'John Smith',
          domains: [
            { domainId: 'leadership-clarity', score: 75, band: 'effective' },
            { domainId: 'coaching-development', score: 68, band: 'developing' },
            { domainId: 'fairness-equity', score: 72, band: 'effective' },
            { domainId: 'empowerment', score: 70, band: 'effective' },
            { domainId: 'communication', score: 73, band: 'effective' },
          ],
        },
        {
          segmentId: 'm456',
          segmentLabel: 'Jane Doe',
          domains: [
            { domainId: 'leadership-clarity', score: 58, band: 'developing' },
            { domainId: 'coaching-development', score: 52, band: 'needs-improvement' },
          ],
        },
      ],
    },
  };
}

function getStubBeforeAfterIndexComparison(surveyId: string, versionBefore: string, versionAfter: string): BeforeAfterIndexComparisonResponse {
  return {
    meta: generateMeta(surveyId, { versionBefore, versionAfter }),
    data: {
      comparison: {
        leadershipEffectiveness: { before: 68.5, after: 71.2, change: 2.7, changePercent: 3.9 },
        teamWellbeing: { before: 72.3, after: 74.1, change: 1.8, changePercent: 2.5 },
        burnoutRisk: { before: 42.1, after: 38.5, change: -3.6, changePercent: -8.6 },
        psychologicalSafety: { before: 65.8, after: 68.3, change: 2.5, changePercent: 3.8 },
        engagement: { before: 70.2, after: 72.8, change: 2.6, changePercent: 3.7 },
      },
    },
  };
}

function getStubParticipationMetrics(surveyId: string, version?: string): ParticipationMetricsResponse {
  return {
    meta: generateMeta(surveyId, { version: version || 'stub-version' }),
    data: {
      totalResponses: 142,
      responseRate: 71.0, // percentage
      completionRate: 92.3, // percentage
      avgCompletionTime: 420, // seconds (7 minutes)
    },
  };
}

// ============================================================================
// MAIN ROUTE: GET /api/analytics/:surveyId/:metricId
// ============================================================================

// ============================================================================
// VERSIONS: GET /api/analytics/:surveyId/versions
// Returns list of score_config_versions for the survey (stub)
// Must be defined BEFORE /:surveyId/:metricId to avoid route shadowing
// ============================================================================

router.get('/:surveyId/versions', (req: Request, res: Response) => {
  const { surveyId } = req.params;
  
  // Stub response - returns mock version data
  // Real implementation will query score_config_versions table
  res.json({
    meta: generateMeta(surveyId),
    data: {
      versions: [
        {
          id: 'v1-stub-id',
          versionNumber: 1,
          label: 'v1',
          createdAt: '2025-11-01T00:00:00.000Z',
          isLatest: false,
        },
        {
          id: 'v2-stub-id',
          versionNumber: 2,
          label: 'v2',
          createdAt: '2025-12-01T00:00:00.000Z',
          isLatest: true,
        },
      ],
      latestVersionId: 'v2-stub-id',
    },
  });
});

// ============================================================================
// HEALTH CHECK: GET /api/analytics/:surveyId/health
// Must be defined BEFORE /:surveyId/:metricId to avoid route shadowing
// ============================================================================

router.get('/:surveyId/health', (req: Request, res: Response) => {
  const { surveyId } = req.params;
  
  res.json({
    meta: generateMeta(surveyId),
    data: {
      status: 'ok',
      message: 'Analytics API is operational (stub mode)',
      supportedMetrics: Object.values(METRIC_IDS),
      metricCount: Object.values(METRIC_IDS).length,
    },
  });
});

// ============================================================================
// MAIN ROUTE: GET /api/analytics/:surveyId/:metricId
// ============================================================================

router.get('/:surveyId/:metricId', async (req: Request, res: Response) => {
  const { surveyId, metricId } = req.params;
  const { version, segmentBy, filter, managerId, versionBefore, versionAfter } = req.query;

  // Extract query params as typed values (echo into meta for contract consistency)
  const versionParam = typeof version === 'string' ? version : undefined;
  const managerIdParam = typeof managerId === 'string' ? managerId : undefined;
  const versionBeforeParam = typeof versionBefore === 'string' ? versionBefore : undefined;
  const versionAfterParam = typeof versionAfter === 'string' ? versionAfter : undefined;

  // Validate metricId
  const validMetricIds = Object.values(METRIC_IDS);
  if (!validMetricIds.includes(metricId as MetricId)) {
    return res.status(400).json({
      error: 'Invalid metricId',
      message: `Unknown metric: ${metricId}`,
      validMetricIds,
    });
  }

  const metricType = METRIC_TYPE_MAP[metricId as MetricId];

  // Route to appropriate stub handler based on metricId
  switch (metricId) {
    // Index Distribution (5) - [ANAL-004] Real implementation for all indices
    case METRIC_IDS.LEADERSHIP_INDEX_DISTRIBUTION:
    case METRIC_IDS.WELLBEING_INDEX_DISTRIBUTION:
    case METRIC_IDS.BURNOUT_RISK_DISTRIBUTION:
    case METRIC_IDS.PSYCHOLOGICAL_SAFETY_DISTRIBUTION:
    case METRIC_IDS.ENGAGEMENT_INDEX_DISTRIBUTION: {
      try {
        // Map metric ID to index type
        const indexTypeMap: Record<string, string> = {
          [METRIC_IDS.LEADERSHIP_INDEX_DISTRIBUTION]: 'leadership-effectiveness',
          [METRIC_IDS.WELLBEING_INDEX_DISTRIBUTION]: 'team-wellbeing',
          [METRIC_IDS.BURNOUT_RISK_DISTRIBUTION]: 'burnout-risk',
          [METRIC_IDS.PSYCHOLOGICAL_SAFETY_DISTRIBUTION]: 'psychological-safety',
          [METRIC_IDS.ENGAGEMENT_INDEX_DISTRIBUTION]: 'engagement',
        };
        const indexType = indexTypeMap[metricId] || 'engagement';

        // Resolve effective version
        let effectiveVersionId = versionParam;
        if (!effectiveVersionId) {
          effectiveVersionId = await getLatestVersionId(surveyId) || undefined;
        }

        const distributionData = await computeIndexDistribution(surveyId, indexType, effectiveVersionId);
        
        const response: IndexDistributionResponse = {
          meta: generateMeta(surveyId, { version: effectiveVersionId, indexType }),
          data: distributionData,
        };
        return res.json(response);
      } catch (error) {
        console.error('[ANAL-004] Error computing index distribution:', error);
        return res.status(500).json({
          error: 'Internal server error',
          message: 'Failed to compute index distribution',
        });
      }
    }

    // Index Band Distribution (5) - [ANAL-005] Real implementation for all indices
    case METRIC_IDS.LEADERSHIP_INDEX_BAND_DISTRIBUTION:
    case METRIC_IDS.WELLBEING_INDEX_BAND_DISTRIBUTION:
    case METRIC_IDS.BURNOUT_RISK_BAND_DISTRIBUTION:
    case METRIC_IDS.PSYCHOLOGICAL_SAFETY_BAND_DISTRIBUTION:
    case METRIC_IDS.ENGAGEMENT_INDEX_BAND_DISTRIBUTION: {
      try {
        // Map metric ID to index type
        const bandIndexTypeMap: Record<string, IndexType> = {
          [METRIC_IDS.LEADERSHIP_INDEX_BAND_DISTRIBUTION]: 'leadership-effectiveness',
          [METRIC_IDS.WELLBEING_INDEX_BAND_DISTRIBUTION]: 'team-wellbeing',
          [METRIC_IDS.BURNOUT_RISK_BAND_DISTRIBUTION]: 'burnout-risk',
          [METRIC_IDS.PSYCHOLOGICAL_SAFETY_BAND_DISTRIBUTION]: 'psychological-safety',
          [METRIC_IDS.ENGAGEMENT_INDEX_BAND_DISTRIBUTION]: 'engagement',
        };
        const indexType = bandIndexTypeMap[metricId];

        // Resolve effective version
        let effectiveVersionId = versionParam;
        if (!effectiveVersionId) {
          effectiveVersionId = await getLatestVersionId(surveyId) || undefined;
        }

        const bandData = await computeIndexBandDistribution(surveyId, indexType, effectiveVersionId);
        
        const response: IndexBandDistributionResponse = {
          meta: generateMeta(surveyId, { version: effectiveVersionId, indexType }),
          data: bandData,
        };
        return res.json(response);
      } catch (error) {
        console.error('[ANAL-005] Error computing index band distribution:', error);
        return res.status(500).json({
          error: 'Internal server error',
          message: 'Failed to compute index band distribution',
        });
      }
    }

    // Domain Overview (3)
    case METRIC_IDS.LEADERSHIP_DOMAIN_OVERVIEW:
      return res.json(getStubDomainOverview(surveyId, 'leadership-effectiveness', versionParam));
    case METRIC_IDS.WELLBEING_DOMAIN_OVERVIEW:
      return res.json(getStubDomainOverview(surveyId, 'team-wellbeing', versionParam));
    case METRIC_IDS.ENGAGEMENT_DOMAIN_OVERVIEW:
      return res.json(getStubDomainOverview(surveyId, 'engagement', versionParam));

    // Domain Overview by Segment (3)
    case METRIC_IDS.LEADERSHIP_DOMAIN_OVERVIEW_BY_MANAGER:
      return res.json(getStubDomainOverviewBySegment(surveyId, 'leadership-effectiveness', 'manager', versionParam));
    case METRIC_IDS.WELLBEING_DOMAIN_OVERVIEW_BY_MANAGER:
      return res.json(getStubDomainOverviewBySegment(surveyId, 'team-wellbeing', 'manager', versionParam));
    case METRIC_IDS.LEADERSHIP_DOMAIN_OVERVIEW_BY_TEAM:
      return res.json(getStubDomainOverviewBySegment(surveyId, 'leadership-effectiveness', 'team', versionParam));

    // Index Trend (3) - [ANAL-008] Real implementation
    case METRIC_IDS.LEADERSHIP_INDEX_TREND:
    case METRIC_IDS.WELLBEING_INDEX_TREND:
    case METRIC_IDS.BURNOUT_RISK_TREND: {
      try {
        // Resolve effective version
        let effectiveVersionId = versionParam;
        if (!effectiveVersionId) {
          effectiveVersionId = await getLatestVersionId(surveyId) || undefined;
        }

        // Get granularity from query param (default: weekly)
        const granularityParam = req.query.granularity;
        const granularity = (['daily', 'weekly', 'monthly'].includes(granularityParam as string))
          ? granularityParam as 'daily' | 'weekly' | 'monthly'
          : 'weekly';

        const trendData = await computeIndexTrend(surveyId, effectiveVersionId, granularity);
        
        const response: IndexTrendResponse = {
          meta: generateMeta(surveyId, { version: effectiveVersionId }),
          data: trendData,
        };
        return res.json(response);
      } catch (error) {
        console.error('[ANAL-008] Error computing index trend:', error);
        return res.status(500).json({
          error: 'Internal server error',
          message: 'Failed to compute index trend',
        });
      }
    }

    // Hotspot Summary (1)
    case METRIC_IDS.HOTSPOT_SUMMARY:
      return res.json(getStubHotspotSummary(surveyId, versionParam));

    // Self vs Team Comparison (1)
    case METRIC_IDS.SELF_VS_TEAM_COMPARISON:
      return res.json(getStubSelfVsTeamComparison(surveyId, managerIdParam || 'm123', versionParam));

    // Index Summary by Segment (2)
    case METRIC_IDS.INDEX_SUMMARY_BY_MANAGER:
      return res.json(getStubIndexSummaryBySegment(surveyId, 'manager', versionParam));
    case METRIC_IDS.INDEX_SUMMARY_BY_TEAM:
      return res.json(getStubIndexSummaryBySegment(surveyId, 'team', versionParam));

    // Domain Heatmap by Segment (1)
    case METRIC_IDS.DOMAIN_HEATMAP_BY_MANAGER:
      return res.json(getStubDomainHeatmapBySegment(surveyId, 'leadership-effectiveness', versionParam));

    // Before/After Index Comparison (1) - [ANAL-009] Real implementation
    case METRIC_IDS.BEFORE_AFTER_INDEX_COMPARISON: {
      try {
        // Require both versionBefore and versionAfter
        if (!versionBeforeParam || !versionAfterParam) {
          return res.status(400).json({
            error: 'Missing required parameters',
            message: 'Both versionBefore and versionAfter query parameters are required',
          });
        }

        const comparisonData = await computeBeforeAfterIndexComparison(
          surveyId,
          versionBeforeParam,
          versionAfterParam
        );
        
        const response: BeforeAfterIndexComparisonResponse = {
          meta: generateMeta(surveyId, { versionBefore: versionBeforeParam, versionAfter: versionAfterParam }),
          data: comparisonData,
        };
        return res.json(response);
      } catch (error) {
        console.error('[ANAL-009] Error computing before/after comparison:', error);
        return res.status(500).json({
          error: 'Internal server error',
          message: 'Failed to compute before/after comparison',
        });
      }
    }

    // Participation Metrics (1) - [ANAL-010/ANAL-020] Real implementation
    // Version semantics:
    // - If version query param provided: use that version
    // - If no version: use latest score_config_version for survey
    // - If no versions exist: compute over all responses (effectiveVersionId = undefined)
    case METRIC_IDS.PARTICIPATION_METRICS: {
      try {
        let effectiveVersionId = versionParam;
        if (!effectiveVersionId) {
          effectiveVersionId = await getLatestVersionId(surveyId) || undefined;
        }

        const metrics = await computeParticipationMetrics(surveyId, effectiveVersionId);
        const response: ParticipationMetricsResponse = {
          meta: generateMeta(surveyId, { version: effectiveVersionId }),
          data: metrics,
        };
        return res.json(response);
      } catch (error) {
        console.error('[ANAL-010] Error computing participation metrics:', error);
        return res.status(500).json({
          error: 'Internal server error',
          message: 'Failed to compute participation metrics',
        });
      }
    }

    // Question Summary (ANAL-006) - Real implementation
    case METRIC_IDS.QUESTION_SUMMARY: {
      try {
        let effectiveVersionId = versionParam;
        if (!effectiveVersionId) {
          effectiveVersionId = await getLatestVersionId(surveyId) || undefined;
        }

        const summaryData = await computeQuestionSummary(surveyId, effectiveVersionId);
        const response: QuestionSummaryResponse = {
          meta: generateMeta(surveyId, { version: effectiveVersionId }),
          data: summaryData,
        };
        return res.json(response);
      } catch (error) {
        console.error('[ANAL-006] Error computing question summary:', error);
        return res.status(500).json({
          error: 'Internal server error',
          message: 'Failed to compute question summary',
        });
      }
    }

    // Manager Index Summary (ANAL-007) - Real implementation
    case METRIC_IDS.MANAGER_INDEX_SUMMARY: {
      try {
        let effectiveVersionId = versionParam;
        if (!effectiveVersionId) {
          effectiveVersionId = await getLatestVersionId(surveyId) || undefined;
        }

        const managerData = await computeIndexSummaryByManager(surveyId, effectiveVersionId);
        const response: ManagerIndexSummaryResponse = {
          meta: generateMeta(surveyId, { version: effectiveVersionId }),
          data: managerData,
        };
        return res.json(response);
      } catch (error) {
        console.error('[ANAL-007] Error computing manager index summary:', error);
        return res.status(500).json({
          error: 'Internal server error',
          message: 'Failed to compute manager index summary',
        });
      }
    }

    // Index Trends Summary (ANAL-008) - Real implementation
    // Returns trend data across all scoring versions for this survey
    case METRIC_IDS.INDEX_TRENDS_SUMMARY: {
      try {
        const trendsData = await computeIndexTrendsSummary(surveyId);
        const response: IndexTrendsSummaryResponse = {
          meta: generateMeta(surveyId),
          data: trendsData,
        };
        return res.json(response);
      } catch (error) {
        console.error('[ANAL-008] Error computing index trends summary:', error);
        return res.status(500).json({
          error: 'Internal server error',
          message: 'Failed to compute index trends summary',
        });
      }
    }

    default:
      // This should never happen if METRIC_IDS is complete
      return res.status(501).json({
        error: 'Not implemented',
        message: `Handler for metric ${metricId} not yet implemented`,
        metricType,
      });
  }
});

export default router;

