/**
 * Hook for fetching index trends summary data
 * 
 * [ANAL-008] Dimension Trends (Index Trend Over Time)
 * 
 * Fetches trend data showing how index scores change across scoring versions.
 */

import { useQuery } from "@tanstack/react-query";
import type { IndexTrendsSummaryResponse } from "@shared/analytics";
import { METRIC_IDS } from "@shared/analytics";

interface UseIndexTrendsSummaryOptions {
  surveyId: string | undefined;
  enabled?: boolean;
}

export function useIndexTrendsSummary({
  surveyId,
  enabled = true,
}: UseIndexTrendsSummaryOptions) {
  return useQuery<IndexTrendsSummaryResponse, Error>({
    queryKey: ["analytics", surveyId, METRIC_IDS.INDEX_TRENDS_SUMMARY],
    queryFn: async () => {
      if (!surveyId) {
        throw new Error("Survey ID is required");
      }

      const url = `/api/analytics/${surveyId}/${METRIC_IDS.INDEX_TRENDS_SUMMARY}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch index trends summary (${response.status})`
        );
      }

      return response.json();
    },
    enabled: enabled && !!surveyId,
  });
}

