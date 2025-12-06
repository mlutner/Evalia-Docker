/**
 * useQuestionSummary - Hook for fetching question-level summary data
 * 
 * [ANAL-006] Question Summary Table
 * 
 * Fetches per-question statistics including completion rate, average values,
 * and response distributions.
 */

import { useQuery } from "@tanstack/react-query";
import { METRIC_IDS, type QuestionSummaryData } from "@shared/analytics";

interface UseQuestionSummaryOptions {
  surveyId: string | undefined;
  versionId?: string;
  enabled?: boolean;
}

interface UseQuestionSummaryResult {
  data: QuestionSummaryData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch question summary data from the analytics API
 */
export function useQuestionSummary({
  surveyId,
  versionId,
  enabled = true,
}: UseQuestionSummaryOptions): UseQuestionSummaryResult {
  const metricId = METRIC_IDS.QUESTION_SUMMARY;
  
  const queryResult = useQuery({
    queryKey: ["analytics", surveyId, metricId, versionId],
    queryFn: async () => {
      if (!surveyId) {
        throw new Error("surveyId is required");
      }

      const params = new URLSearchParams();
      if (versionId) {
        params.set("version", versionId);
      }

      const url = `/api/analytics/${surveyId}/${metricId}${params.toString() ? `?${params}` : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch question summary: ${response.statusText}`);
      }

      const json = await response.json();
      return json.data as QuestionSummaryData;
    },
    enabled: enabled && !!surveyId,
    staleTime: 30000, // 30 seconds
    retry: 2,
  });

  return {
    data: queryResult.data ?? null,
    isLoading: queryResult.isLoading,
    error: queryResult.error as Error | null,
    refetch: queryResult.refetch,
  };
}

export default useQuestionSummary;

