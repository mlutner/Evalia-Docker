/**
 * Hook for fetching manager index summary data
 * 
 * [ANAL-007] Manager Comparison (Index + Band Segmentation)
 * 
 * Fetches per-manager aggregated index scores and band distributions.
 */

import { useQuery } from "@tanstack/react-query";
import type { ManagerIndexSummaryResponse } from "@shared/analytics";
import { METRIC_IDS } from "@shared/analytics";

interface UseManagerIndexSummaryOptions {
  surveyId: string | undefined;
  versionId?: string;
  enabled?: boolean;
}

export function useManagerIndexSummary({
  surveyId,
  versionId,
  enabled = true,
}: UseManagerIndexSummaryOptions) {
  return useQuery<ManagerIndexSummaryResponse, Error>({
    queryKey: ["analytics", surveyId, METRIC_IDS.MANAGER_INDEX_SUMMARY, versionId],
    queryFn: async () => {
      if (!surveyId) {
        throw new Error("Survey ID is required");
      }

      const url = new URL(
        `/api/analytics/${surveyId}/${METRIC_IDS.MANAGER_INDEX_SUMMARY}`,
        window.location.origin
      );
      
      if (versionId) {
        url.searchParams.set("version", versionId);
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch manager index summary (${response.status})`
        );
      }

      return response.json();
    },
    enabled: enabled && !!surveyId,
  });
}

