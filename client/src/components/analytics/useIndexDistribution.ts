/**
 * useIndexDistribution - Hook for fetching index distribution data
 * 
 * [ANAL-004] Index Distribution Visualization
 * 
 * Fetches index distribution data from the analytics API.
 */

import { useQuery } from "@tanstack/react-query";
import type { IndexDistributionData } from "@shared/analytics";

interface IndexDistributionResponse {
  meta: {
    surveyId: string;
    generatedAt: string;
    version?: string;
    indexType?: string;
  };
  data: IndexDistributionData;
}

interface UseIndexDistributionOptions {
  surveyId?: string;
  metricId: string; // e.g., 'engagement_index_distribution'
  versionId?: string;
  enabled?: boolean;
}

interface UseIndexDistributionResult {
  data: IndexDistributionData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useIndexDistribution({
  surveyId,
  metricId,
  versionId,
  enabled = true,
}: UseIndexDistributionOptions): UseIndexDistributionResult {
  const query = useQuery<IndexDistributionResponse>({
    queryKey: ["/api/analytics", surveyId, metricId, versionId],
    queryFn: async () => {
      const url = versionId
        ? `/api/analytics/${surveyId}/${metricId}?version=${versionId}`
        : `/api/analytics/${surveyId}/${metricId}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch index distribution");
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

export default useIndexDistribution;

