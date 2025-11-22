import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Question, SurveyScoreConfig, ScoringRule } from "@shared/schema";

export function useScoring(initialConfig?: SurveyScoreConfig) {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(initialConfig?.enabled || false);
  const [categories, setCategories] = useState(initialConfig?.categories || []);
  const [scoreRanges, setScoreRanges] = useState(initialConfig?.scoreRanges || []);
  const [resultsSummary, setResultsSummary] = useState(initialConfig?.resultsSummary || "");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Watch for changes to initialConfig and update form state
  useEffect(() => {
    if (initialConfig) {
      setIsEnabled(initialConfig.enabled || false);
      setCategories(initialConfig.categories || []);
      setScoreRanges(initialConfig.scoreRanges || []);
      setResultsSummary(initialConfig.resultsSummary || "");
    }
  }, [initialConfig]);

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

  // Scorable question types
  const SCORABLE_TYPES = new Set(['rating', 'nps', 'multiple_choice', 'checkbox', 'number']);
  
  // Check if a question is scorable
  const isQuestionScorable = (question: Question) => {
    return SCORABLE_TYPES.has(question.type);
  };

  // Auto-populate categories from question sections
  const autoPopulateCategoriesFromSections = (questions: Question[]) => {
    if (categories.length > 0) return; // Don't override existing categories
    
    // Filter only scorable questions
    const scorableQuestions = questions.filter(isQuestionScorable);
    
    // Group scorable questions by section
    const sectionMap = new Map<string, Question[]>();
    let hasUnsectionedQuestions = false;
    
    scorableQuestions.forEach(q => {
      if (q.sectionId) {
        if (!sectionMap.has(q.sectionId)) {
          sectionMap.set(q.sectionId, []);
        }
        sectionMap.get(q.sectionId)!.push(q);
      } else {
        hasUnsectionedQuestions = true;
      }
    });

    // Create categories only for sections with questions
    const newCategories: Array<{ id: string; name: string }> = [];
    
    // Add categories for sections
    sectionMap.forEach((questions, section) => {
      if (questions.length > 0) {
        newCategories.push({
          id: `cat-${section}-${Date.now()}`,
          name: section,
        });
      }
    });

    // If there are scorable questions and either multiple sections or unsectioned questions
    if (newCategories.length > 0 || hasUnsectionedQuestions) {
      if (newCategories.length > 0) {
        setCategories(newCategories);
        return newCategories;
      }
    }
    return [];
  };

  const handleRemoveCategory = (catId: string) => {
    setCategories(categories.filter((c) => c.id !== catId));
    setScoreRanges(scoreRanges.filter((r) => r.category !== catId));
  };

  const toggleExpandCategory = (catId: string) => {
    setExpandedCategories(prev => 
      prev.includes(catId) 
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    );
  };

  const getCategoryRanges = (categoryId: string) => {
    return scoreRanges.filter(r => r.category === categoryId);
  };

  const handleAddScoreRange = (categoryId: string) => {
    const newRange: ScoringRule = {
      category: categoryId,
      label: "",
      minScore: 0,
      maxScore: 20,
      interpretation: "",
    };
    setScoreRanges([...scoreRanges, newRange]);
  };

  const handleUpdateScoreRange = (index: number, field: keyof ScoringRule, value: string | number) => {
    const updated = [...scoreRanges];
    updated[index] = { ...updated[index], [field]: value };
    setScoreRanges(updated);
  };

  const handleRemoveScoreRange = (index: number) => {
    setScoreRanges(scoreRanges.filter((_, i) => i !== index));
  };

  const handleAutoGenerateScoring = async (questions: Question[], onScoreConfigChange?: (config: SurveyScoreConfig) => void) => {
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
      
      // Auto-save immediately
      const newConfig: SurveyScoreConfig = {
        enabled: true,
        categories: config.categories || [],
        scoreRanges: config.scoreRanges || [],
        resultsSummary: resultsSummary || undefined,
      };
      onScoreConfigChange?.(newConfig);

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
    
    toast({
      title: "Configuration saved",
      description: "Your scoring configuration has been saved successfully.",
    });
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
    expandedCategories,
    handleAddCategory,
    handleRemoveCategory,
    toggleExpandCategory,
    getCategoryRanges,
    handleAddScoreRange,
    handleUpdateScoreRange,
    handleRemoveScoreRange,
    handleAutoGenerateScoring,
    handleSaveScoring,
    autoPopulateCategoriesFromSections,
    isQuestionScorable,
  };
}
