/**
 * useBeforeAfterComparison Hook
 * 
 * [ANAL-009] Before/After Index Comparison Data Fetching
 * 
 * Fetches comparison data between two scoring versions for a survey.
 * Compares average Insight Dimension scores and calculates changes.
 */

import { useQuery } from "@tanstack/react-query";
import type { BeforeAfterIndexComparisonResponse } from "@shared/analytics";

interface UseBeforeAfterComparisonProps {
  surveyId: string | undefined;
  versionBefore?: string;
  versionAfter?: string;
  enabled?: boolean;
}

/**
 * Custom hook to fetch before/after index comparison data.
 * 
 * @param surveyId - The survey ID
 * @param versionBefore - The "before" version ID
 * @param versionAfter - The "after" version ID
 * @param enabled - Whether the query should be enabled
 * @returns Query result with comparison data, loading, and error states
 */
export function useBeforeAfterComparison({
  surveyId,
  versionBefore,
  versionAfter,
  enabled = true,
}: UseBeforeAfterComparisonProps) {
  return useQuery<BeforeAfterIndexComparisonResponse, Error>({
    queryKey: [
      "analytics",
      surveyId,
      "before_after_index_comparison",
      versionBefore,
      versionAfter,
    ],
    queryFn: async () => {
      if (!surveyId || !versionBefore || !versionAfter) {
        throw new Error(
          "Survey ID, versionBefore, and versionAfter are required"
        );
      }

      const url = new URL(
        `/api/analytics/${surveyId}/before_after_index_comparison`,
        window.location.origin
      );
      url.searchParams.set("versionBefore", versionBefore);
      url.searchParams.set("versionAfter", versionAfter);

      const response = await fetch(url.toString());
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch before/after comparison data"
        );
      }
      return response.json();
    },
    enabled: enabled && !!surveyId && !!versionBefore && !!versionAfter,
  });
}

