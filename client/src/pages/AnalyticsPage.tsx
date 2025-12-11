/**
 * AnalyticsPage V2 - Unified Analytics Information Architecture
 * 
 * [ANAL-002/ANAL-020/BUILD-020] Analytics Routing + Version Selector + Layout Scaffolding
 * [ANAL-004/ANAL-005] Index Distribution + Band Distribution Charts
 * [ANAL-006] Question Summary Table
 * [ANAL-007] Manager Comparison Table
 * [ANAL-008] Dimension Trends Chart
 * [ANAL-009] Before/After Index Comparison
 * [ANAL-IA-001] 7-Section Information Architecture
 * [NAMING-001] Uses "Evalia Insight Dimensions (EID)" terminology
 * 
 * Tabs: Insights Home | Dimensions | Managers | Trends | Questions | Responses | Benchmarks
 * 
 * This is the canonical /analytics/:id page for Evalia Insight Dimensions (EID).
 * All participation metrics are fetched from the analytics API (no client-side calculation).
 * 
 * Legacy functionality preserved in client/src/legacy/LegacyAnalyticsPage.tsx
 * 
 * See docs/EVALIA_INSIGHT_DIMENSIONS.md for canonical dimension definitions.
 */

import { useParams, useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Loader2, AlertTriangle, BarChart3, 
  Users, TrendingUp, Layers, Home, MessageSquare,
  FileText, Target, Info, XCircle
} from "lucide-react";
import { useState, useCallback, useMemo, useEffect } from "react";
import type { Survey, SurveyResponse } from "@shared/schema";
import { 
  deriveAnalyticsScoringState, 
  checkAnalyticsInvariants,
  type AnalyticsStateResult 
} from "@/utils/analyticsState";
import { useDashboardMode, type DashboardMode } from "@/hooks/useDashboardMode";

// [BUILD-020/ANAL-004-009/ANAL-DIM-001/ANAL-DASH-010/ANAL-DASH-020] Analytics Component Library
import { 
  VersionSelector, 
  ParticipationMetricsCard, 
  useParticipationMetrics,
  AnalyticsPlaceholderCard,
  IndexDistributionChart,
  useIndexDistribution,
  BandDistributionChart,
  useIndexBandDistribution,
  QuestionSummaryTable,
  useQuestionSummary,
  ManagerComparisonTable,
  useManagerIndexSummary,
  DimensionTrendsChart,
  useIndexTrendsSummary,
  BeforeAfterComparisonChart,
  useBeforeAfterComparison,
  DimensionLeaderboardTable,
  CategoryLeaderboardTable,
  CategoryScoreCard,
  NoScoringBanner,
  TopBottomItemsCard,
  type Version,
} from "@/components/analytics";

// ============================================================================
// TYPES
// ============================================================================

interface AnalyticsData {
  survey: Survey;
  responses: SurveyResponse[];
  count: number;
}

// ============================================================================
// [ANAL-QA-050] STATE BANNER COMPONENT
// ============================================================================

const SEVERITY_STYLES = {
  info: {
    bg: 'bg-[var(--teal-50)] border-[var(--teal-200)]',
    icon: Info,
    iconColor: 'text-[var(--teal-600)]',
    textColor: 'text-[var(--teal-700)]',
  },
  warning: {
    bg: 'bg-[var(--warning-bg)] border-[var(--yuzu)]',
    icon: AlertTriangle,
    iconColor: 'text-[var(--warning-fg)]',
    textColor: 'text-[var(--warning-fg)]',
  },
  error: {
    bg: 'bg-[var(--coral-50)] border-[var(--coral-200)]',
    icon: XCircle,
    iconColor: 'text-[var(--coral-600)]',
    textColor: 'text-[var(--coral-700)]',
  },
};

function AnalyticsStateBanner({ state }: { state: AnalyticsStateResult }) {
  // Don't show banner for healthy state
  if (state.state === 'healthy') return null;
  
  const style = SEVERITY_STYLES[state.severity];
  const Icon = style.icon;
  
  return (
    <div className={`p-4 rounded-lg border ${style.bg} flex items-start gap-3 mb-6`}>
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${style.iconColor}`} />
      <div className="flex-1 min-w-0">
        <h4 className={`font-medium ${style.textColor}`}>
          {state.title}
        </h4>
        <p className={`text-sm mt-0.5 ${style.textColor} opacity-90`}>
          {state.message}
        </p>
      </div>
    </div>
  );
}

/**
 * Single-version mode indicator for trends tab
 */
function SingleVersionIndicator() {
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--teal-700)] bg-[var(--teal-50)] px-4 py-3 rounded-lg border border-[var(--teal-200)] mb-6">
      <Info className="w-4 h-4 flex-shrink-0" />
      <span>
        <strong>Single Snapshot Mode</strong> – Trend analysis and before/after comparisons require multiple scoring versions over time.
      </span>
    </div>
  );
}

/**
 * Scoring disabled message for charts that require scoring
 */
function ScoringDisabledCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="evalia-card">
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-[var(--paper-100)] flex items-center justify-center mb-4">
          <BarChart3 className="w-6 h-6 text-[var(--ink-200)]" />
        </div>
        <h3 className="text-lg font-medium text-[var(--ink-500)] mb-1">{title}</h3>
        <p className="text-sm text-[var(--ink-200)] max-w-md">{description}</p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AnalyticsPage() {
  const { id: surveyId } = useParams();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  
  // Parse version from URL query params (guard against null/undefined)
  const searchParams = new URLSearchParams(searchString || "");
  const versionFromUrl = searchParams.get("version") || undefined;
  
  const [activeTab, setActiveTab] = useState("insights-home");
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(versionFromUrl);
  
  // [ANAL-009] Before/After comparison version selection
  const [versionBefore, setVersionBefore] = useState<string | undefined>();
  const [versionAfter, setVersionAfter] = useState<string | undefined>();

  // Handle version change - update URL and trigger refetch
  const handleVersionChange = useCallback((versionId: string) => {
    setSelectedVersion(versionId);
    // Update URL query param
    const newUrl = `/analytics/${surveyId}?version=${versionId}`;
    window.history.replaceState(null, "", newUrl);
  }, [surveyId]);

  // Fetch survey data (basic info)
  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["/api/surveys", surveyId, "responses"],
    enabled: !!surveyId,
    queryFn: async () => {
      const url = `/api/surveys/${surveyId}/responses?limit=100`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch survey data");
      }
      return response.json();
    }
  });

  // [ANAL-011] Fetch participation metrics from analytics API
  const {
    metrics: participationMetrics,
    isLoading: participationLoading,
    error: participationError,
    refetch: refetchParticipation,
  } = useParticipationMetrics({
    surveyId,
    versionId: selectedVersion,
    enabled: !!surveyId,
  });

  // [ANAL-004] Fetch index distribution data
  const {
    data: indexDistributionData,
    isLoading: indexDistributionLoading,
    error: indexDistributionError,
    refetch: refetchIndexDistribution,
  } = useIndexDistribution({
    surveyId,
    metricId: "engagement_index_distribution", // Default to engagement index
    versionId: selectedVersion,
    enabled: !!surveyId,
  });

  // [ANAL-005] Fetch band distribution data
  const {
    data: bandDistributionData,
    isLoading: bandDistributionLoading,
    error: bandDistributionError,
    refetch: refetchBandDistribution,
  } = useIndexBandDistribution({
    surveyId,
    metricId: "engagement_index_band_distribution", // Default to engagement bands
    versionId: selectedVersion,
    enabled: !!surveyId,
  });

  // [ANAL-006] Fetch question summary data
  const {
    data: questionSummaryData,
    isLoading: questionSummaryLoading,
    error: questionSummaryError,
    refetch: refetchQuestionSummary,
  } = useQuestionSummary({
    surveyId,
    versionId: selectedVersion,
    enabled: !!surveyId,
  });

  // [ANAL-007] Fetch manager index summary data
  const {
    data: managerSummaryData,
    isLoading: managerSummaryLoading,
    error: managerSummaryError,
    refetch: refetchManagerSummary,
  } = useManagerIndexSummary({
    surveyId,
    versionId: selectedVersion,
    enabled: !!surveyId,
  });

  // [ANAL-008] Fetch index trends summary data
  const {
    data: trendsSummaryData,
    isLoading: trendsSummaryLoading,
    error: trendsSummaryError,
    refetch: refetchTrendsSummary,
  } = useIndexTrendsSummary({
    surveyId,
    enabled: !!surveyId,
  });

  // [ANAL-009] Fetch versions for before/after comparison
  const { data: versionsData } = useQuery<{
    meta: { surveyId: string };
    data: { versions: Version[]; latestVersionId: string };
  }>({
    queryKey: ["/api/analytics", surveyId, "versions"],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/${surveyId}/versions`);
      if (!response.ok) {
        throw new Error("Failed to fetch versions");
      }
      return response.json();
    },
    enabled: !!surveyId,
  });

  // [ANAL-009] Fetch before/after comparison data
  const {
    data: comparisonData,
    isLoading: comparisonLoading,
    error: comparisonError,
    refetch: refetchComparison,
  } = useBeforeAfterComparison({
    surveyId,
    versionBefore,
    versionAfter,
    enabled: !!surveyId && !!versionBefore && !!versionAfter,
  });

  // Extract versions list for comparison selector
  const availableVersions = versionsData?.data?.versions || [];

  // ============================================================================
  // [ANAL-QA-050] ANALYTICS STATE DERIVATION
  // ============================================================================

  // Derive analytics state to drive empty-state behavior
  const analyticsState: AnalyticsStateResult = useMemo(() => {
    const scoreConfig = data?.survey?.scoreConfig;
    
    // Extract dimension scores from trends summary (latest snapshot from trends array)
    const latestTrend = trendsSummaryData?.data?.trends?.[trendsSummaryData.data.trends.length - 1];
    const dimensionScores = latestTrend?.scores 
      ? {
          leadershipEffectiveness: latestTrend.scores.leadershipEffectiveness ?? null,
          teamWellbeing: latestTrend.scores.teamWellbeing ?? null,
          burnoutRisk: latestTrend.scores.burnoutRisk ?? null,
          psychologicalSafety: latestTrend.scores.psychologicalSafety ?? null,
          engagement: latestTrend.scores.engagement ?? null,
        }
      : undefined;

    return deriveAnalyticsScoringState({
      scoringEnabled: scoreConfig?.enabled ?? false,
      categories: scoreConfig?.categories,
      scoreRanges: scoreConfig?.scoreRanges,
      responseCount: data?.count ?? 0,
      versionCount: availableVersions.length,
      dimensionScores,
    });
  }, [data, trendsSummaryData, availableVersions.length]);

  // [ANAL-QA-050] Check invariants in dev mode
  useEffect(() => {
    if (data?.survey?.scoreConfig?.enabled && data?.count > 0) {
      const latestTrend = trendsSummaryData?.data?.trends?.[trendsSummaryData.data.trends.length - 1];
      const dimensionScores = latestTrend?.scores 
        ? {
            leadershipEffectiveness: latestTrend.scores.leadershipEffectiveness ?? null,
            teamWellbeing: latestTrend.scores.teamWellbeing ?? null,
            burnoutRisk: latestTrend.scores.burnoutRisk ?? null,
            psychologicalSafety: latestTrend.scores.psychologicalSafety ?? null,
            engagement: latestTrend.scores.engagement ?? null,
          }
        : undefined;

      checkAnalyticsInvariants({
        scoringEnabled: true,
        responseCount: data.count,
        dimensionScores,
        bandDistribution: bandDistributionData?.bands,
        indexDistribution: indexDistributionData?.overall?.buckets,
      });
    }
  }, [data, trendsSummaryData, bandDistributionData, indexDistributionData]);

  // ============================================================================
  // [ANAL-DASH-010] DASHBOARD MODE DETECTION
  // ============================================================================
  
  const dashboardMode = useDashboardMode(data?.survey);

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper-50)]">
        <div className="text-center animate-page-enter">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--coral-500)] mx-auto mb-4" />
          <p className="text-[var(--ink-200)]">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper-50)]">
        <div className="text-center animate-page-enter">
          <div className="w-16 h-16 rounded-full bg-[var(--warning-bg)] flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-[var(--warning-fg)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--ink-500)] mb-2">Analytics Unavailable</h1>
          <p className="text-[var(--ink-200)] mb-6">Unable to load analytics for this survey.</p>
          <Button className="evalia-btn evalia-btn-primary" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const { survey, count } = data;

  // ============================================================================
  // NO RESPONSES STATE
  // ============================================================================
  
  if (count === 0) {
    return (
      <div className="min-h-screen bg-[var(--paper-50)]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="mb-8 text-[var(--coral-600)] hover:bg-[var(--coral-50)]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-center py-20 animate-page-enter">
            <div className="w-20 h-20 bg-[var(--teal-100)] rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-[var(--teal-600)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--ink-500)] mb-2">No Responses Yet</h1>
            <p className="text-[var(--ink-200)] mb-8 max-w-md mx-auto">
              Share your survey "{survey.title}" to start collecting responses.
            </p>
            <Button className="evalia-btn evalia-btn-secondary" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
      <main className="min-h-screen bg-[var(--paper-50)]">
        <div className="max-w-7xl mx-auto px-4 py-6 animate-page-enter">

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="mb-4 -ml-2 text-[var(--coral-600)] hover:bg-[var(--coral-50)]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-[var(--ink-500)] mb-1">{survey.title}</h1>
              <p className="text-[var(--ink-200)]">{survey.description || "Survey Analytics"}</p>
          </div>

          {/* Version Selector */}
          <div className="flex items-center gap-4">
            {surveyId && (
              <VersionSelector
                surveyId={surveyId}
                selectedVersionId={selectedVersion}
                onVersionChange={handleVersionChange}
              />
            )}
          </div>
                </div>

          {/* [ANAL-QA-050] State Banner - shows warnings for non-healthy states */}
          <AnalyticsStateBanner state={analyticsState} />

          {/* [ANAL-DASH-020] Basic Analytics Mode - No Tabs, Simplified View */}
          {dashboardMode.mode === 'basic' ? (
            <div className="space-y-6">
              {/* No Scoring Banner */}
              <NoScoringBanner />

              {/* Participation Metrics */}
              <ParticipationMetricsCard
                metrics={participationMetrics}
                isLoading={participationLoading}
                error={participationError}
                onRetry={refetchParticipation}
              />

              {/* Top & Bottom Items */}
              <TopBottomItemsCard
                questionSummary={questionSummaryData?.questions}
                isLoading={questionSummaryLoading}
                error={questionSummaryError}
                onRetry={refetchQuestionSummary}
                topN={5}
              />

              {/* Question Summary Table */}
              <QuestionSummaryTable
                data={questionSummaryData}
                isLoading={questionSummaryLoading}
                error={questionSummaryError}
                onRetry={refetchQuestionSummary}
              />
            </div>
          ) : (
            <>
              {/* [ANAL-DASH-010] Dashboard Mode Indicator */}
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--ink-200)] uppercase tracking-wider">
                  Dashboard Mode:
                </span>
                <span className={`evalia-badge ${
                  dashboardMode.is5DDashboard
                    ? 'evalia-badge-teal'
                    : 'evalia-badge-coral'
                }`}>
                  {dashboardMode.is5DDashboard ? 'Insight Dimensions' : 'Category Analytics'}
                </span>
              </div>

              {/* Tabs - [ANAL-IA-001] Information Architecture (adapted by dashboard mode) */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-[var(--paper-white)] border border-[var(--paper-200)] flex-wrap h-auto p-1 rounded-[var(--radius-lg)]">
              <TabsTrigger value="insights-home" className="gap-2">
                <Home className="w-4 h-4" />
                {dashboardMode.is5DDashboard ? 'Insights Home' : 'Overview'}
              </TabsTrigger>
              <TabsTrigger value="dimensions" className="gap-2">
                <Layers className="w-4 h-4" />
                {dashboardMode.is5DDashboard ? 'Dimensions' : 'Categories'}
              </TabsTrigger>
              {dashboardMode.is5DDashboard && (
                <TabsTrigger value="managers" className="gap-2">
                  <Users className="w-4 h-4" />
                  Managers
                </TabsTrigger>
              )}
              {dashboardMode.hasScoringEnabled && (
                <TabsTrigger value="trends" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trends
                </TabsTrigger>
              )}
              <TabsTrigger value="questions" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Questions
              </TabsTrigger>
              <TabsTrigger value="responses" className="gap-2">
                <FileText className="w-4 h-4" />
                Responses
              </TabsTrigger>
              {dashboardMode.is5DDashboard && (
                <TabsTrigger value="benchmarks" className="gap-2">
                  <Target className="w-4 h-4" />
                  Benchmarks
                </TabsTrigger>
              )}
            </TabsList>

            {/* INSIGHTS HOME / OVERVIEW TAB - [ANAL-IA-001/ANAL-DASH-010] */}
            <TabsContent value="insights-home" className="space-y-6">
              {/* [ANAL-011] Participation Metrics Card - always shown */}
              <ParticipationMetricsCard
                metrics={participationMetrics}
                isLoading={participationLoading}
                error={participationError}
                onRetry={refetchParticipation}
              />

              {/* [ANAL-DASH-010] Show CategoryScoreCard for generic-scoring mode */}
              {analyticsState.showScoring && !dashboardMode.is5DDashboard && (
                <CategoryScoreCard
                  overallScore={
                    // Calculate overall from band distribution or use null
                    bandDistributionData?.bands?.reduce((sum, band) => 
                      sum + (band.count * ((band.minScore + band.maxScore) / 2)), 0
                    ) ?? null
                  }
                  categoryCount={dashboardMode.categoryCount}
                  responseCount={participationMetrics?.totalResponses ?? 0}
                  scoreRanges={survey.scoreConfig?.scoreRanges?.map(r => ({
                    id: r.id,
                    min: r.min,
                    max: r.max,
                    label: r.label,
                    color: r.color,
                    interpretation: r.interpretation,
                  }))}
                  isLoading={bandDistributionLoading}
                  title="Overall Score"
                />
              )}

              {/* [ANAL-004/ANAL-005] Score + Band Distribution */}
              {/* [ANAL-QA-050] Only show if scoring is properly configured */}
              {analyticsState.showScoring ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <IndexDistributionChart
                    data={indexDistributionData}
                    isLoading={indexDistributionLoading}
                    error={indexDistributionError}
                    onRetry={refetchIndexDistribution}
                    title={dashboardMode.is5DDashboard ? "Engagement Score Distribution" : "Score Distribution"}
                    description="How scores are distributed across all respondents"
                  />
                  <BandDistributionChart
                    data={bandDistributionData}
                    isLoading={bandDistributionLoading}
                    error={bandDistributionError}
                    onRetry={refetchBandDistribution}
                    title={dashboardMode.is5DDashboard ? "Engagement Performance Bands" : "Performance Bands"}
                    description="Respondents grouped by performance level"
                  />
                </div>
              ) : (
                <ScoringDisabledCard
                  title="Score Distribution Not Available"
                  description={analyticsState.state === 'no-scoring' 
                    ? "Scoring is not enabled for this survey." 
                    : "Scoring configuration needs to be completed to view score distributions."}
                />
              )}
            </TabsContent>

            {/* DIMENSIONS/CATEGORIES TAB - [ANAL-IA-001/ANAL-DIM-001/ANAL-DASH-010] */}
            <TabsContent value="dimensions" className="space-y-6">
              {/* [ANAL-QA-050] Only show charts if scoring is configured */}
              {analyticsState.showScoring ? (
                <>
                  {/* [ANAL-DASH-010] Show different leaderboard based on dashboard mode */}
                  {dashboardMode.is5DDashboard ? (
                    /* 5D Insight Dimensions Dashboard */
                    <DimensionLeaderboardTable
                      data={trendsSummaryData?.data}
                      selectedVersionId={selectedVersion}
                      isLoading={trendsSummaryLoading}
                      error={trendsSummaryError}
                      onRetry={refetchTrendsSummary}
                    />
                  ) : (
                    /* Generic Category-based Dashboard */
                    <CategoryLeaderboardTable
                      categories={
                        // Transform scoreConfig categories into leaderboard format
                        // Note: This is a placeholder - real implementation would compute scores per category
                        survey.scoreConfig?.categories?.map(cat => ({
                          categoryId: cat.id,
                          categoryName: cat.name,
                          score: 0, // Would be computed from responses
                          normalizedScore: 0, // Would be normalized
                        })) ?? []
                      }
                      scoreRanges={survey.scoreConfig?.scoreRanges?.map(r => ({
                        id: r.id,
                        min: r.min,
                        max: r.max,
                        label: r.label,
                        color: r.color,
                        interpretation: r.interpretation,
                      }))}
                      isLoading={false}
                      error={null}
                      title="Category Leaderboard"
                      description="Categories ranked by performance score"
                    />
                  )}

                  {/* Distribution charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <IndexDistributionChart
                      data={indexDistributionData}
                      isLoading={indexDistributionLoading}
                      error={indexDistributionError}
                      onRetry={refetchIndexDistribution}
                      title={dashboardMode.is5DDashboard ? "Insight Dimension Score Distribution" : "Score Distribution"}
                      description="How scores are distributed across all respondents"
                    />
                    <BandDistributionChart
                      data={bandDistributionData}
                      isLoading={bandDistributionLoading}
                      error={bandDistributionError}
                      onRetry={refetchBandDistribution}
                      title={dashboardMode.is5DDashboard ? "Dimension Performance Bands" : "Performance Bands"}
                      description="Respondents grouped by performance level"
                    />
                  </div>
                </>
              ) : (
                <ScoringDisabledCard
                  title={dashboardMode.is5DDashboard ? "Dimension Analytics Not Available" : "Category Analytics Not Available"}
                  description={analyticsState.state === 'no-scoring' 
                    ? "Scoring is not enabled for this survey. Enable scoring to view analytics." 
                    : "Scoring configuration needs to be completed to view analytics."}
                />
              )}
              
              {dashboardMode.is5DDashboard && (
                <AnalyticsPlaceholderCard
                  title="Domain Overview"
                  description="Category-level scores showing performance across all measurement domains."
                  icon={Layers}
                  footnote="Coming soon"
                />
              )}
            </TabsContent>

            {/* MANAGERS TAB - [ANAL-IA-001] */}
            <TabsContent value="managers" className="space-y-6">
              {/* [ANAL-007] Manager Comparison Table */}
              <ManagerComparisonTable
                data={managerSummaryData?.data}
                isLoading={managerSummaryLoading}
                error={managerSummaryError}
                onRetry={refetchManagerSummary}
              />
              
              <AnalyticsPlaceholderCard
                title="Self vs Team Comparison"
                description="Compare manager self-assessment scores with their team's assessment."
                icon={Users}
                footnote="Coming soon"
              />
            </TabsContent>

            {/* TRENDS TAB - [ANAL-IA-001] */}
            <TabsContent value="trends" className="space-y-6">
              {/* [ANAL-QA-050] Handle different analytics states */}
              {!analyticsState.showScoring ? (
                <ScoringDisabledCard
                  title="Trend Analytics Not Available"
                  description={analyticsState.state === 'no-scoring' 
                    ? "Scoring is not enabled for this survey. Enable scoring to view trend analytics." 
                    : "Scoring configuration needs to be completed to view trend analytics."}
                />
              ) : !analyticsState.showTrends ? (
                <>
                  <SingleVersionIndicator />
                  {/* [ANAL-008] Still show current snapshot */}
                  <DimensionTrendsChart
                    data={trendsSummaryData?.data}
                    isLoading={trendsSummaryLoading}
                    error={trendsSummaryError}
                    onRetry={refetchTrendsSummary}
                  />
                  {/* Before/After disabled in single-version mode */}
                  <ScoringDisabledCard
                    title="Before/After Comparison"
                    description="Create additional scoring versions to compare dimension scores over time."
                  />
                </>
              ) : (
                <>
                  {/* [ANAL-008] Dimension Trends Chart */}
                  <DimensionTrendsChart
                    data={trendsSummaryData?.data}
                    isLoading={trendsSummaryLoading}
                    error={trendsSummaryError}
                    onRetry={refetchTrendsSummary}
                  />
                  
                  {/* [ANAL-009] Before/After Index Comparison */}
                  <BeforeAfterComparisonChart
                    data={comparisonData?.data}
                    isLoading={comparisonLoading}
                    error={comparisonError}
                    onRetry={refetchComparison}
                    availableVersions={availableVersions}
                    selectedVersionBefore={versionBefore}
                    selectedVersionAfter={versionAfter}
                    onVersionBeforeChange={setVersionBefore}
                    onVersionAfterChange={setVersionAfter}
                    title="Before/After Comparison"
                    description="Compare Insight Dimension scores between two scoring versions"
                  />
                </>
              )}
            </TabsContent>

            {/* QUESTIONS TAB - [ANAL-IA-001] */}
            <TabsContent value="questions" className="space-y-6">
              {/* [ANAL-006] Question Summary Table - relocated from Domains tab */}
              <QuestionSummaryTable
                data={questionSummaryData}
                isLoading={questionSummaryLoading}
                error={questionSummaryError}
                onRetry={refetchQuestionSummary}
                title="Question Summary"
                description="Per-question completion rates, average values, and response distributions"
              />
            </TabsContent>

            {/* RESPONSES TAB - [ANAL-IA-001] */}
            <TabsContent value="responses" className="space-y-6">
              <AnalyticsPlaceholderCard
                title="Response Browser"
                description="Browse individual survey responses with filtering and search capabilities."
                icon={FileText}
                footnote="Coming soon - see Legacy Analytics for current implementation"
              />
            </TabsContent>

            {/* BENCHMARKS TAB - [ANAL-IA-001] */}
            <TabsContent value="benchmarks" className="space-y-6">
              <AnalyticsPlaceholderCard
                title="Industry Benchmarks"
                description="Compare your survey results against industry and organizational benchmarks."
                icon={Target}
                footnote="Coming soon"
              />
            </TabsContent>

          </Tabs>
            </>
          )}
        </div>
      </main>
  );
}
