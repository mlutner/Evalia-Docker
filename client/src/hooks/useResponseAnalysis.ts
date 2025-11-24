import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface AIInsight {
  themes: Array<{ theme: string; mentions: number; percentage: number; exampleQuotes: string[] }>;
  sentiment: { positive: number; neutral: number; negative: number };
  summary: string;
  topPainPoints: string[];
  recommendations: string[];
}

export function useResponseAnalysis(surveyId: string | undefined, enabled: boolean = true) {
  return useQuery<AIInsight>({
    queryKey: ["/api/surveys", surveyId, "responses", "analyze"],
    enabled: !!surveyId && enabled,
    queryFn: async () => {
      const response = await apiRequest("POST", `/api/surveys/${surveyId}/responses/analyze`);
      return response.json();
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
