import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Question, Survey } from "@shared/schema";

interface UseSurveyStateProps {
  surveyId?: string;
  isEditMode: boolean;
}

export function useSurveyState({ surveyId, isEditMode }: UseSurveyStateProps) {
  const { toast } = useToast();
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Survey data state
  const [currentSurveyTitle, setCurrentSurveyTitle] = useState("");
  const [currentSurveyDescription, setCurrentSurveyDescription] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [illustrationUrl, setIllustrationUrl] = useState("");
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [scoreConfig, setScoreConfig] = useState<any>(undefined);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>(undefined);
  const [privacyStatement, setPrivacyStatement] = useState("");
  const [dataUsageStatement, setDataUsageStatement] = useState("");

  // Wizard state
  const [currentWizardStep, setCurrentWizardStep] = useState(1);
  const [hasLoadedSurvey, setHasLoadedSurvey] = useState(false);

  // Auto-save state
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Create survey mutation
  const createSurveyMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      welcomeMessage?: string;
      thankYouMessage?: string;
      illustrationUrl?: string;
      questions: Question[];
      scoreConfig?: any;
      estimatedMinutes?: number;
      privacyStatement?: string;
      dataUsageStatement?: string;
    }) => {
      return apiRequest("POST", "/api/surveys", data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/surveys"] });
      toast({
        title: "Survey published!",
        description: "Your survey has been saved and is ready to share.",
      });

      response.json().then((data: any) => {
        if (data.id) {
          window.history.replaceState({}, "", `/builder/${data.id}`);
        }
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create survey",
        variant: "destructive",
      });
    },
  });

  // Update survey mutation
  const updateSurveyMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      welcomeMessage?: string;
      thankYouMessage?: string;
      illustrationUrl?: string;
      questions: Question[];
      scoreConfig?: any;
      estimatedMinutes?: number;
      privacyStatement?: string;
      dataUsageStatement?: string;
    }) => {
      return apiRequest("PUT", `/api/surveys/${surveyId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/surveys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/surveys", surveyId] });
      toast({
        title: "Survey updated!",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update survey",
        variant: "destructive",
      });
    },
  });

  // Auto-save mutation
  const autoSaveMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      welcomeMessage?: string;
      thankYouMessage?: string;
      illustrationUrl?: string;
      questions: Question[];
      scoreConfig?: any;
      estimatedMinutes?: number;
      privacyStatement?: string;
      dataUsageStatement?: string;
    }) => {
      if (isEditMode) {
        return apiRequest("PUT", `/api/surveys/${surveyId}`, data);
      } else {
        return apiRequest("POST", "/api/surveys", data);
      }
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/surveys"] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ["/api/surveys", surveyId] });
      }
      setLastAutoSave(new Date());
      setIsAutoSaving(false);

      if (!isEditMode && response) {
        response.json().then((data: any) => {
          if (data.id) {
            window.history.replaceState({}, "", `/builder/${data.id}`);
          }
        });
      }
    },
    onError: (error: any) => {
      console.error("Auto-save failed:", error);
      setIsAutoSaving(false);
    },
  });

  // Auto-save effect
  useEffect(() => {
    if (currentQuestions.length === 0 || currentWizardStep === 1) {
      return;
    }

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(() => {
      const surveyData = {
        title: currentSurveyTitle || "Untitled Survey",
        description: currentSurveyDescription || undefined,
        welcomeMessage: welcomeMessage || undefined,
        thankYouMessage: thankYouMessage || undefined,
        illustrationUrl: illustrationUrl || undefined,
        questions: currentQuestions,
        scoreConfig: scoreConfig || undefined,
        estimatedMinutes: estimatedMinutes || undefined,
        privacyStatement: privacyStatement || undefined,
        dataUsageStatement: dataUsageStatement || undefined,
      };

      setIsAutoSaving(true);
      autoSaveMutation.mutate(surveyData);
    }, 3000);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [
    currentQuestions,
    currentSurveyTitle,
    currentSurveyDescription,
    welcomeMessage,
    thankYouMessage,
    illustrationUrl,
    currentWizardStep,
    scoreConfig,
    estimatedMinutes,
    privacyStatement,
    dataUsageStatement,
  ]);

  // Question handlers
  const handleUpdateQuestion = (index: number, updated: Question) => {
    const newQuestions = [...currentQuestions];
    newQuestions[index] = updated;
    setCurrentQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    setCurrentQuestions(currentQuestions.filter((_, i) => i !== index));
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      type: "text",
      question: "",
      required: false,
    };
    setCurrentQuestions([...currentQuestions, newQuestion]);
  };

  // Step handlers
  const handleNextStep = () => {
    if (currentWizardStep === 1) {
      if (!currentSurveyTitle.trim()) {
        toast({
          title: "Title required",
          description: "Please enter a title for your survey to continue",
          variant: "destructive",
        });
        return;
      }
      if (currentQuestions.length === 0) {
        toast({
          title: "Questions needed",
          description: "Please select a template, use AI, or upload a document to create questions",
          variant: "destructive",
        });
        return;
      }
      setCurrentWizardStep(2);
    } else if (currentWizardStep === 2) {
      if (currentQuestions.length === 0) {
        toast({
          title: "Add questions",
          description: "Please add at least one question before continuing",
          variant: "destructive",
        });
        return;
      }
      setCurrentWizardStep(3);
    } else if (currentWizardStep === 3) {
      setCurrentWizardStep(4);
    }
  };

  const handlePrevStep = () => {
    if (currentWizardStep > 1) {
      setCurrentWizardStep(currentWizardStep - 1);
    }
  };

  const handleSaveSurvey = () => {
    if (!currentSurveyTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your survey",
        variant: "destructive",
      });
      return;
    }

    if (currentQuestions.length === 0) {
      toast({
        title: "Questions required",
        description: "Please add at least one question to your survey",
        variant: "destructive",
      });
      return;
    }

    const surveyData = {
      title: currentSurveyTitle,
      description: currentSurveyDescription || undefined,
      welcomeMessage: welcomeMessage || undefined,
      thankYouMessage: thankYouMessage || undefined,
      illustrationUrl: illustrationUrl || undefined,
      questions: currentQuestions,
      scoreConfig: scoreConfig || undefined,
      estimatedMinutes: estimatedMinutes || undefined,
      privacyStatement: privacyStatement || undefined,
      dataUsageStatement: dataUsageStatement || undefined,
    };

    if (isEditMode) {
      updateSurveyMutation.mutate(surveyData);
    } else {
      createSurveyMutation.mutate(surveyData);
    }
  };

  return {
    // State
    currentSurveyTitle,
    setCurrentSurveyTitle,
    currentSurveyDescription,
    setCurrentSurveyDescription,
    welcomeMessage,
    setWelcomeMessage,
    thankYouMessage,
    setThankYouMessage,
    illustrationUrl,
    setIllustrationUrl,
    currentQuestions,
    setCurrentQuestions,
    scoreConfig,
    setScoreConfig,
    estimatedMinutes,
    setEstimatedMinutes,
    privacyStatement,
    setPrivacyStatement,
    dataUsageStatement,
    setDataUsageStatement,
    currentWizardStep,
    setCurrentWizardStep,
    hasLoadedSurvey,
    setHasLoadedSurvey,
    lastAutoSave,
    isAutoSaving,

    // Mutations
    createSurveyMutation,
    updateSurveyMutation,
    autoSaveMutation,

    // Handlers
    handleUpdateQuestion,
    handleDeleteQuestion,
    handleAddQuestion,
    handleNextStep,
    handlePrevStep,
    handleSaveSurvey,
  };
}
