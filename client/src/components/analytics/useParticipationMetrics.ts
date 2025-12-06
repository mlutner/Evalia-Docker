/**
 * useParticipationMetrics - Hook to fetch participation metrics from API
 * 
 * [ANAL-011] Participation Metrics Card UI
 * 
 * Fetches from: GET /api/analytics/:surveyId/participation_metrics?version=...
 * Transforms API response (seconds) to card format (minutes)
 */

import { useQuery } from "@tanstack/react-query";
import { METRIC_IDS, type ParticipationMetricsResponse } from "@shared/analytics";
import type { ParticipationMetrics } from "./ParticipationMetricsCard";

interface UseParticipationMetricsOptions {
  surveyId: string | undefined;
  versionId?: string;
  enabled?: boolean;
}

interface UseParticipationMetricsResult {
  metrics: ParticipationMetrics | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch participation metrics from the analytics API.
 * Transforms API response format to match ParticipationMetricsCard interface.
 */
export function useParticipationMetrics({
  surveyId,
  versionId,
  enabled = true,
}: UseParticipationMetricsOptions): UseParticipationMetricsResult {
  const queryKey = [
    "/api/analytics",
    surveyId,
    METRIC_IDS.PARTICIPATION_METRICS,
    versionId,
  ];

  const { data, isLoading, error, refetch } = useQuery<ParticipationMetricsResponse>({
    queryKey,
    queryFn: async () => {
      if (!surveyId) {
        throw new Error("Survey ID is required");
      }

      const url = new URL(
        `/api/analytics/${surveyId}/${METRIC_IDS.PARTICIPATION_METRICS}`,
        window.location.origin
      );

      if (versionId) {
        url.searchParams.set("version", versionId);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch participation metrics: ${response.status}`);
      }

      return response.json();
    },
    enabled: enabled && !!surveyId,
    staleTime: 30000, // 30 seconds
    retry: 1,
  });

  // Transform API response to card format
  const metrics: ParticipationMetrics | null = data?.data
    ? {
        totalResponses: data.data.totalResponses,
        responseRate: data.data.responseRate,
        completionRate: data.data.completionRate,
        // Convert seconds to minutes
        avgCompletionTimeMinutes: data.data.avgCompletionTime
          ? Math.round(data.data.avgCompletionTime / 60)
          : 0,
      }
    : null;

  return {
    metrics,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

export default useParticipationMetrics;

