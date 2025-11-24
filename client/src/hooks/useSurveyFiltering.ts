import { useMemo } from "react";
import type { Survey } from "@shared/schema";

type SortOption = "newest" | "oldest" | "most-responses" | "alphabetical";

export type SurveyWithCounts = Survey & {
  responseCount: number;
};

export function useSurveyFiltering(
  surveys: SurveyWithCounts[],
  searchTerm: string,
  selectedTags: string[],
  sortBy: SortOption
) {
  return useMemo(() => {
    let filtered = surveys.filter(survey => {
      const matchesSearch = searchTerm === "" || 
        survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.trainerName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => survey.tags?.includes(tag));
      
      return matchesSearch && matchesTags;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "most-responses":
          return b.responseCount - a.responseCount;
        case "alphabetical":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [surveys, searchTerm, selectedTags, sortBy]);
}
