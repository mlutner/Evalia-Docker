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
    // Smart default: Calculate max score based on existing ranges for this category
    const existingRangesForCategory = scoreRanges.filter(r => r.category === categoryId);
    const suggestedMaxScore = existingRangesForCategory.length === 0 ? 100 : 100; // Default to 100 (0-100 scale is standard)
    
    const newRange: ScoringRule = {
      category: categoryId,
      label: "",
      minScore: 0,
      maxScore: suggestedMaxScore,
      interpretation: "",
    };
    setScoreRanges([...scoreRanges, newRange]);
  };

  // Validate score ranges for a category
  const validateScoreRanges = (categoryId?: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const rangesToCheck = categoryId 
      ? scoreRanges.filter(r => r.category === categoryId)
      : scoreRanges;

    rangesToCheck.forEach((range, idx) => {
      // Check minScore < maxScore
      if (range.minScore >= range.maxScore) {
        errors.push(`Range ${idx + 1}: Min score must be less than max score`);
      }

      // Check for missing label
      if (!range.label.trim()) {
        errors.push(`Range ${idx + 1}: Label is required`);
      }

      // Check for missing interpretation
      if (!range.interpretation.trim()) {
        errors.push(`Range ${idx + 1}: Interpretation is required`);
      }
    });

    // Check for overlapping ranges within category
    if (categoryId) {
      const catRanges = scoreRanges.filter(r => r.category === categoryId);
      for (let i = 0; i < catRanges.length; i++) {
        for (let j = i + 1; j < catRanges.length; j++) {
          const r1 = catRanges[i];
          const r2 = catRanges[j];
          // Check if ranges overlap
          if ((r1.minScore <= r2.maxScore && r1.maxScore >= r2.minScore)) {
            errors.push(`Ranges overlap: "${r1.label}" and "${r2.label}"`);
          }
        }
      }
    }

    // Warn about gaps (non-critical, so not added to errors array)
    // This would be nice-to-have feedback but not a blocker

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const handleUpdateScoreRange = (index: number, field: string, value: any) => {
    const updated = [...scoreRanges];
    updated[index] = { ...updated[index], [field]: value };
    setScoreRanges(updated);
  };

  const handleRemoveScoreRange = (index: number) => {
    setScoreRanges(scoreRanges.filter((_, i) => i !== index));
  };

  const handleAutoGenerateScoring = async (
    questions: Question[], 
    onScoreConfigChange?: (config: SurveyScoreConfig) => void,
    onQuestionsChange?: (questions: Question[]) => void
  ) => {
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
      
      // Apply category assignments from AI if available
      let updatedQuestions = questions;
      if (config.suggestedQuestionCategoryMap) {
        const categoryMap = config.suggestedQuestionCategoryMap;
        updatedQuestions = questions.map(q => {
          const assignedCategoryId = categoryMap[q.id];
          if (assignedCategoryId) {
            return { ...q, scoringCategory: assignedCategoryId };
          }
          return q;
        });
        // Notify parent of question changes
        onQuestionsChange?.(updatedQuestions);
      }
      
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
    // Validate all score ranges before saving
    if (isEnabled && scoreRanges.length > 0) {
      const validation = validateScoreRanges();
      if (!validation.isValid) {
        toast({
          title: "Validation errors",
          description: validation.errors.slice(0, 2).join(", ") + (validation.errors.length > 2 ? "..." : ""),
          variant: "destructive",
        });
        return;
      }
    }

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
    validateScoreRanges,
  };
}
