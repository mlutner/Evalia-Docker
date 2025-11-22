import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Question, SurveyScoreConfig } from "@shared/schema";

export function useScoring(initialConfig?: SurveyScoreConfig) {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(initialConfig?.enabled || false);
  const [categories, setCategories] = useState(initialConfig?.categories || []);
  const [scoreRanges, setScoreRanges] = useState(initialConfig?.scoreRanges || []);
  const [resultsSummary, setResultsSummary] = useState(initialConfig?.resultsSummary || "");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        id: `cat-${Date.now()}`,
        name: newCategoryName.trim(),
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
    }
  };

  const handleRemoveCategory = (catId: string) => {
    setCategories(categories.filter((c) => c.id !== catId));
    setScoreRanges(scoreRanges.filter((r) => r.category !== catId));
  };

  const handleAutoGenerateScoring = async (questions: Question[]) => {
    if (questions.length === 0) {
      toast({
        title: "No questions",
        description: "Add questions first before generating scoring configuration",
        variant: "destructive",
      });
      return;
    }

    setIsAutoGenerating(true);
    try {
      const response = await fetch("/api/generate-scoring-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate scoring config");
      }

      const { config } = await response.json();
      setIsEnabled(true);
      setCategories(config.categories || []);
      setScoreRanges(config.scoreRanges || []);

      toast({
        title: "Scoring configured",
        description: "AI has automatically set up scoring categories and ranges based on your questions.",
      });
    } catch (error) {
      toast({
        title: "Auto-generation failed",
        description: "Could not automatically generate scoring. You can configure it manually.",
        variant: "destructive",
      });
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const handleSaveScoring = (onScoreConfigChange?: (config: SurveyScoreConfig) => void) => {
    const config: SurveyScoreConfig = {
      enabled: isEnabled,
      categories,
      scoreRanges,
      resultsSummary: resultsSummary || undefined,
    };
    onScoreConfigChange?.(config);
  };

  return {
    isEnabled,
    setIsEnabled,
    categories,
    scoreRanges,
    resultsSummary,
    setResultsSummary,
    newCategoryName,
    setNewCategoryName,
    isAutoGenerating,
    handleAddCategory,
    handleRemoveCategory,
    handleAutoGenerateScoring,
    handleSaveScoring,
  };
}
