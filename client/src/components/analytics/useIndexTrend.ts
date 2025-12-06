/**
 * Hook for fetching index trend data
 * 
 * [ANAL-008] Dimension Trends (Historical Time Series)
 * 
 * Fetches historical index scores grouped by time period.
 */

import { useQuery } from "@tanstack/react-query";
import type { IndexTrendResponse } from "@shared/analytics";
import { METRIC_IDS } from "@shared/analytics";

type TrendGranularity = 'daily' | 'weekly' | 'monthly';

interface UseIndexTrendOptions {
  surveyId: string | undefined;
  versionId?: string;
  granularity?: TrendGranularity;
  enabled?: boolean;
}

export function useIndexTrend({
  surveyId,
  versionId,
  granularity = 'weekly',
  enabled = true,
}: UseIndexTrendOptions) {
  return useQuery<IndexTrendResponse, Error>({
    queryKey: ["analytics", surveyId, "index_trend", versionId, granularity],
    queryFn: async () => {
      if (!surveyId) {
        throw new Error("Survey ID is required");
      }

      // Use LEADERSHIP_INDEX_TREND as default (all return same combined data for now)
      const metricId = METRIC_IDS.LEADERSHIP_INDEX_TREND;
      
      const url = new URL(
        `/api/analytics/${surveyId}/${metricId}`,
        window.location.origin
      );
      
      if (versionId) {
        url.searchParams.set("version", versionId);
      }
      
      url.searchParams.set("granularity", granularity);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch index trend (${response.status})`
        );
      }

      return response.json();
    },
    enabled: enabled && !!surveyId,
  });
}

