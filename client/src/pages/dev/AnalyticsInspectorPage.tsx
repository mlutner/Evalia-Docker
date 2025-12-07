/**
 * Analytics Inspector - Dev-Only Debugging Page
 * 
 * [ANAL-QA-040] "Pop the hood" view for analytics debugging.
 * Shows raw JSON payloads for all analytics metrics in one place.
 * 
 * Route: /dev/analytics-inspector (dev-only)
 * 
 * Features:
 * - Survey selector dropdown
 * - Raw JSON for all analytics metrics
 * - Derived analyticsState and mode
 * - Active scoring version info
 * - Collapsible sections
 * - Copy JSON button
 */

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Copy, Check, ChevronDown, ChevronRight, AlertTriangle, Info, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useParticipationMetrics,
  useIndexDistribution,
  useIndexBandDistribution,
  useQuestionSummary,
  useManagerIndexSummary,
  useIndexTrendsSummary,
  useBeforeAfterComparison,
} from "@/components/analytics";
import { deriveAnalyticsScoringState, type AnalyticsStateResult } from "@/utils/analyticsState";
import type { Survey } from "@shared/schema";

// ============================================================================
// TYPES
// ============================================================================

interface MetricPanelProps {
  title: string;
  data: unknown;
  isLoading: boolean;
  error: Error | null;
  defaultOpen?: boolean;
}

// ============================================================================
// METRIC PANEL COMPONENT
// ============================================================================

function MetricPanel({ title, data, isLoading, error, defaultOpen = false }: MetricPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const jsonString = useMemo(() => {
    if (isLoading) return "Loading...";
    if (error) return `Error: ${error.message}`;
    if (data === null || data === undefined) return "null";
    return JSON.stringify(data, null, 2);
  }, [data, isLoading, error]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColor = error 
    ? "border-l-red-500" 
    : isLoading 
      ? "border-l-yellow-500" 
      : data 
        ? "border-l-green-500" 
        : "border-l-gray-300";

  return (
    <div className={`border rounded-lg overflow-hidden border-l-4 ${statusColor}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-50 px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <span className="font-semibold text-gray-800">{title}</span>
          {isLoading && (
            <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">Loading</span>
          )}
          {error && (
            <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded">Error</span>
          )}
          {!isLoading && !error && data && (
            <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">OK</span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          className="p-1 hover:bg-gray-200 rounded"
          title="Copy JSON"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </button>
      {isOpen && (
        <pre className="p-4 overflow-auto text-xs bg-gray-900 text-gray-100 max-h-96 font-mono">
          {jsonString}
        </pre>
      )}
    </div>
  );
}

// ============================================================================
// STATE PANEL COMPONENT
// ============================================================================

function AnalyticsStatePanel({ state }: { state: AnalyticsStateResult }) {
  const severityColors = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    error: "bg-red-50 border-red-200 text-red-800",
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="w-5 h-5" />
          Derived Analytics State
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500 uppercase">Mode</div>
            <div className={`mt-1 px-2 py-1 rounded text-sm font-medium ${severityColors[state.severity]}`}>
              {state.state}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Show Scoring</div>
            <div className={`mt-1 text-sm font-medium ${state.showScoring ? "text-green-600" : "text-red-600"}`}>
              {state.showScoring ? "✓ Yes" : "✗ No"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Show Trends</div>
            <div className={`mt-1 text-sm font-medium ${state.showTrends ? "text-green-600" : "text-red-600"}`}>
              {state.showTrends ? "✓ Yes" : "✗ No"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Show Participation</div>
            <div className={`mt-1 text-sm font-medium ${state.showParticipation ? "text-green-600" : "text-red-600"}`}>
              {state.showParticipation ? "✓ Yes" : "✗ No"}
            </div>
          </div>
        </div>
        <div className="border-t pt-4">
          <div className="text-xs text-gray-500 uppercase mb-1">Message</div>
          <div className={`p-3 rounded border ${severityColors[state.severity]}`}>
            <div className="font-medium">{state.title}</div>
            <div className="text-sm opacity-90">{state.message}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SURVEY INFO PANEL
// ============================================================================

function SurveyInfoPanel({ survey }: { survey: Survey }) {
  const scoreConfig = survey.scoreConfig;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Survey Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-500 uppercase">Survey ID</div>
            <div className="mt-1 text-sm font-mono bg-gray-100 px-2 py-1 rounded truncate">
              {survey.id}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Scoring Enabled</div>
            <div className={`mt-1 text-sm font-medium ${scoreConfig?.enabled ? "text-green-600" : "text-gray-500"}`}>
              {scoreConfig?.enabled ? "✓ Yes" : "✗ No"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Categories</div>
            <div className="mt-1 text-sm font-medium">
              {scoreConfig?.categories?.length ?? 0}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Score Ranges</div>
            <div className="mt-1 text-sm font-medium">
              {scoreConfig?.scoreRanges?.length ?? 0}
            </div>
          </div>
        </div>
        {scoreConfig?.categories && scoreConfig.categories.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <div className="text-xs text-gray-500 uppercase mb-2">Categories</div>
            <div className="flex flex-wrap gap-2">
              {scoreConfig.categories.map((cat) => (
                <span key={cat.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {cat.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AnalyticsInspectorPage() {
  const [, setLocation] = useLocation();
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>("");

  // Fetch all surveys
  const { data: surveysData, isLoading: surveysLoading } = useQuery<Survey[]>({
    queryKey: ["/api/surveys"],
    queryFn: async () => {
      const response = await fetch("/api/surveys");
      if (!response.ok) throw new Error("Failed to fetch surveys");
      return response.json();
    },
  });

  // Fetch selected survey details
  const { data: surveyData } = useQuery<{ survey: Survey; responses: unknown[]; count: number }>({
    queryKey: ["/api/surveys", selectedSurveyId, "responses"],
    queryFn: async () => {
      const response = await fetch(`/api/surveys/${selectedSurveyId}/responses?limit=1`);
      if (!response.ok) throw new Error("Failed to fetch survey");
      return response.json();
    },
    enabled: !!selectedSurveyId,
  });

  // Fetch versions
  const { data: versionsData } = useQuery<{
    data: { versions: Array<{ id: string; label: string }>; latestVersionId: string };
  }>({
    queryKey: ["/api/analytics", selectedSurveyId, "versions"],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/${selectedSurveyId}/versions`);
      if (!response.ok) throw new Error("Failed to fetch versions");
      return response.json();
    },
    enabled: !!selectedSurveyId,
  });

  // Analytics hooks
  const participation = useParticipationMetrics({
    surveyId: selectedSurveyId,
    enabled: !!selectedSurveyId,
  });

  const indexDist = useIndexDistribution({
    surveyId: selectedSurveyId,
    metricId: "engagement_index_distribution",
    enabled: !!selectedSurveyId,
  });

  const bandDist = useIndexBandDistribution({
    surveyId: selectedSurveyId,
    metricId: "engagement_index_band_distribution",
    enabled: !!selectedSurveyId,
  });

  const questionSummary = useQuestionSummary({
    surveyId: selectedSurveyId,
    enabled: !!selectedSurveyId,
  });

  const managerSummary = useManagerIndexSummary({
    surveyId: selectedSurveyId,
    enabled: !!selectedSurveyId,
  });

  const trendsSummary = useIndexTrendsSummary({
    surveyId: selectedSurveyId,
    enabled: !!selectedSurveyId,
  });

  // Derive analytics state
  const analyticsState: AnalyticsStateResult = useMemo(() => {
    if (!surveyData?.survey) {
      return deriveAnalyticsScoringState({
        scoringEnabled: false,
        categories: undefined,
        scoreRanges: undefined,
        responseCount: 0,
        versionCount: 0,
        dimensionScores: undefined,
      });
    }

    const scoreConfig = surveyData.survey.scoreConfig;
    const latestTrend = trendsSummary.data?.data?.trends?.[trendsSummary.data.data.trends.length - 1];
    const dimensionScores = latestTrend?.scores;

    return deriveAnalyticsScoringState({
      scoringEnabled: scoreConfig?.enabled ?? false,
      categories: scoreConfig?.categories,
      scoreRanges: scoreConfig?.scoreRanges,
      responseCount: surveyData.count ?? 0,
      versionCount: versionsData?.data?.versions?.length ?? 0,
      dimensionScores,
    });
  }, [surveyData, trendsSummary.data, versionsData]);

  const surveys = surveysData ?? [];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Inspector</h1>
              <p className="text-sm text-gray-500">Dev-only debugging view for analytics payloads</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            DEV ONLY
          </div>
        </div>

        {/* Survey Selector */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Select Survey
                </label>
                <Select value={selectedSurveyId} onValueChange={setSelectedSurveyId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={surveysLoading ? "Loading surveys..." : "Select a survey..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {surveys.map((survey) => (
                      <SelectItem key={survey.id} value={survey.id}>
                        {survey.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedSurveyId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    participation.refetch?.();
                    indexDist.refetch?.();
                    bandDist.refetch?.();
                    questionSummary.refetch?.();
                    managerSummary.refetch?.();
                    trendsSummary.refetch?.();
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh All
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Survey Info & State */}
        {surveyData?.survey && (
          <>
            <SurveyInfoPanel survey={surveyData.survey} />
            <AnalyticsStatePanel state={analyticsState} />
          </>
        )}

        {/* Metric Panels */}
        {selectedSurveyId && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-4">Raw Analytics Payloads</h2>

            <MetricPanel
              title="Participation Metrics"
              data={participation.metrics}
              isLoading={participation.isLoading}
              error={participation.error}
              defaultOpen={true}
            />

            <MetricPanel
              title="Index Distribution (Engagement)"
              data={indexDist.data}
              isLoading={indexDist.isLoading}
              error={indexDist.error}
            />

            <MetricPanel
              title="Band Distribution (Engagement)"
              data={bandDist.data}
              isLoading={bandDist.isLoading}
              error={bandDist.error}
            />

            <MetricPanel
              title="Question Summary"
              data={questionSummary.data}
              isLoading={questionSummary.isLoading}
              error={questionSummary.error}
            />

            <MetricPanel
              title="Manager Index Summary"
              data={managerSummary.data?.data}
              isLoading={managerSummary.isLoading}
              error={managerSummary.error}
            />

            <MetricPanel
              title="Index Trends Summary"
              data={trendsSummary.data?.data}
              isLoading={trendsSummary.isLoading}
              error={trendsSummary.error}
            />

            <MetricPanel
              title="Versions"
              data={versionsData?.data}
              isLoading={false}
              error={null}
            />

            <MetricPanel
              title="Survey scoreConfig (Raw)"
              data={surveyData?.survey?.scoreConfig}
              isLoading={false}
              error={null}
            />
          </div>
        )}

        {/* Empty State */}
        {!selectedSurveyId && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Survey</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Choose a survey from the dropdown above to inspect its analytics payloads and configuration.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

