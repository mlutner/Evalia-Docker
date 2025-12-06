/**
 * useIndexBandDistribution - Hook for fetching index band distribution data
 * 
 * [ANAL-005] Index Band Distribution Visualization
 * 
 * Fetches index band distribution data from the analytics API.
 */

import { useQuery } from "@tanstack/react-query";
import type { IndexBandDistributionData } from "@shared/analytics";

interface IndexBandDistributionResponse {
  meta: {
    surveyId: string;
    generatedAt: string;
    version?: string;
    indexType?: string;
  };
  data: IndexBandDistributionData;
}

interface UseIndexBandDistributionOptions {
  surveyId?: string;
  metricId: string; // e.g., 'engagement_index_band_distribution'
  versionId?: string;
  enabled?: boolean;
}

interface UseIndexBandDistributionResult {
  data: IndexBandDistributionData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useIndexBandDistribution({
  surveyId,
  metricId,
  versionId,
  enabled = true,
}: UseIndexBandDistributionOptions): UseIndexBandDistributionResult {
  const query = useQuery<IndexBandDistributionResponse>({
    queryKey: ["/api/analytics", surveyId, metricId, versionId],
    queryFn: async () => {
      const url = versionId
        ? `/api/analytics/${surveyId}/${metricId}?version=${versionId}`
        : `/api/analytics/${surveyId}/${metricId}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch index band distribution");
      }
      return response.json();
    },
    enabled: enabled && !!surveyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data: query.data?.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

export default useIndexBandDistribution;

