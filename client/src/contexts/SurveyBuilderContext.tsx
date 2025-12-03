import React, { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Question as EvaliaQuestion, SurveyScoreConfig } from '@shared/schema';
import { QUESTION_TYPES, getDisplayNameForType, getLikertLabels } from '@/data/questionTypeConfig';

// ============================================
// TYPE DEFINITIONS
// ============================================

// All valid question types from the database schema
export const VALID_QUESTION_TYPES = [
  'text', 'textarea', 'email', 'phone', 'url', 'number',
  'multiple_choice', 'checkbox', 'dropdown', 'image_choice', 'yes_no',
  'rating', 'nps', 'likert', 'opinion_scale', 'slider', 'emoji_rating',
  'matrix', 'ranking', 'constant_sum', 'calculation',
  'date', 'time', 'datetime',
  'file_upload', 'signature', 'video', 'audio_capture',
  'section', 'statement', 'legal', 'hidden'
] as const;

export type ValidQuestionType = typeof VALID_QUESTION_TYPES[number];

// Map from Evalia schema types to display types
export const EVALIA_TO_DISPLAY_TYPE: Record<string, string> = {
  text: 'Short Text',
  textarea: 'Long Text',
  email: 'Email',
  phone: 'Phone Number',
  url: 'Website URL',
  number: 'Number',
  multiple_choice: 'Multiple Choice',
  checkbox: 'Checkboxes',
  dropdown: 'Dropdown',
  image_choice: 'Image Choice',
  yes_no: 'Yes/No',
  rating: 'Star Rating',
  nps: 'NPS',
  likert: 'Likert Scale',
  opinion_scale: 'Opinion Scale',
  slider: 'Slider',
  emoji_rating: 'Emoji Rating',
  matrix: 'Matrix / Grid',
  ranking: 'Ranking',
  constant_sum: 'Constant Sum',
  calculation: 'Calculation',
  date: 'Date',
  time: 'Time',
  datetime: 'Date & Time',
  file_upload: 'File Upload',
  signature: 'Signature',
  video: 'Video',
  audio_capture: 'Audio Recording',
  section: 'Section Break',
  statement: 'Statement',
  legal: 'Consent/Legal',
  hidden: 'Hidden Field',
};

// Map from display types back to Evalia schema types
export const QUESTION_TYPE_MAP: Record<string, string> = Object.entries(EVALIA_TO_DISPLAY_TYPE).reduce(
  (acc, [schema, display]) => ({ ...acc, [display]: schema }),
  {}
);

// Builder question interface - comprehensive with all schema parameters
export interface BuilderQuestion {
  id: string;
  type: ValidQuestionType; // Database schema type (e.g., "text", "multiple_choice")
  displayType: string; // Display name (e.g., "Short Text", "Multiple Choice")
  text: string;
  description?: string;
  required: boolean;
  order: number;
  
  // === TEXT INPUT OPTIONS ===
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  validationPattern?: string;
  rows?: number; // for textarea
  
  // === SELECTION OPTIONS ===
  options?: string[];
  displayStyle?: 'radio' | 'cards' | 'dropdown' | 'checkbox' | 'toggle' | 'buttons' | 'icons' | 'drag' | 'number' | 'horizontal' | 'vertical';
  allowOther?: boolean;
  randomizeOptions?: boolean;
  optionImages?: string[];
  minSelections?: number;
  maxSelections?: number;
  
  // === IMAGE CHOICE OPTIONS ===
  imageOptions?: { imageUrl: string; label?: string; value?: string }[];
  selectionType?: 'single' | 'multiple';
  imageSize?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
  columns?: number;
  
  // === RATING OPTIONS ===
  ratingScale?: number;
  ratingStyle?: 'star' | 'number' | 'emoji' | 'heart' | 'thumb' | 'slider';
  ratingLabels?: { low?: string; mid?: string; high?: string };
  showLabelsOnly?: boolean;
  
  // === NPS OPTIONS ===
  npsLabels?: { detractor?: string; promoter?: string };
  
  // === LIKERT OPTIONS ===
  likertType?: 'agreement' | 'frequency' | 'importance' | 'satisfaction' | 'quality';
  likertPoints?: number;
  showNeutral?: boolean;
  customLabels?: string[];
  
  // === SLIDER OPTIONS ===
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  showValue?: boolean;
  unit?: string;
  
  // === OPINION SCALE ===
  leftLabel?: string;
  rightLabel?: string;
  showNumbers?: boolean;
  
  // === MATRIX OPTIONS ===
  rowLabels?: string[];
  colLabels?: string[];
  matrixType?: 'radio' | 'checkbox' | 'text';
  randomizeRows?: boolean;
  
  // === RANKING OPTIONS ===
  maxRankItems?: number;
  
  // === CONSTANT SUM OPTIONS ===
  totalPoints?: number;
  showPercentage?: boolean;
  
  // === DATE/TIME OPTIONS ===
  dateFormat?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  minDate?: string;
  maxDate?: string;
  disablePastDates?: boolean;
  disableFutureDates?: boolean;
  timeFormat?: '12h' | '24h';
  minuteStep?: number;
  
  // === FILE UPLOAD OPTIONS ===
  allowedTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  
  // === YES/NO OPTIONS ===
  yesLabel?: string;
  noLabel?: string;
  
  // === LEGAL OPTIONS ===
  linkUrl?: string;
  linkText?: string;
  
  // === SKIP LOGIC & SCORING ===
  skipCondition?: { questionId: string; answer: string };
  scoringCategory?: string;
  sectionId?: string;
  scoreWeight?: number;
  optionScores?: Record<string, number>;
  
  // === BUILDER-SPECIFIC FIELDS ===
  hasLogic: boolean;
  logicRules?: LogicRule[];
  designSettings?: DesignSettings;
  scorable?: boolean;
  scoreValues?: number[];
}

export interface LogicRule {
  id: string;
  condition: string;
  action: 'skip' | 'show' | 'end';
  targetQuestionId?: string; // Fixed: was 'target', now matches usage in QuestionConfigPanel
}

interface DesignSettings {
  layout: 'vertical' | 'horizontal' | 'grid';
  buttonStyle?: 'radio' | 'cards' | 'buttons';
  spacing: 'compact' | 'normal' | 'spacious';
  showQuestionNumber: boolean;
  showProgressBar: boolean;
}

export interface BackgroundSettings {
  url?: string;
  overlayColor?: string; // hex color for overlay
  overlayOpacity?: number; // 0-100 percentage
}

export interface WelcomeScreen {
  enabled: boolean;
  title: string;
  description: string;
  buttonText: string;
  imageUrl?: string; // logo/primary image
  headerImage?: string; // header banner image
  backgroundImage?: BackgroundSettings; // full background with overlay
  showTimeEstimate?: boolean;
  estimatedMinutes?: number;
  showQuestionCount?: boolean;
  privacyText?: string;
  privacyLinkUrl?: string;
  themeColors?: {
    primary: string;
    background: string;
    text: string;
    buttonText: string;
  };
}

export interface ThankYouScreen {
  enabled: boolean;
  title: string;
  message: string;
  redirectUrl?: string;
  showSocialShare: boolean;
  headerImage?: string; // header banner image
  backgroundImage?: BackgroundSettings; // full background with overlay
}

interface ScoringSettings {
  enabled: boolean;
  type: 'points' | 'percentage' | 'custom';
  passingScore?: number;
  showScore: boolean;
  showCorrectAnswers: boolean;
}

export interface BuilderSurvey {
  id: string;
  title: string;
  description?: string;
  welcomeScreen: WelcomeScreen;
  thankYouScreen: ThankYouScreen;
  scoringSettings: ScoringSettings;
  questions: BuilderQuestion[];
  illustrationUrl?: string;
  estimatedMinutes?: number;
  privacyStatement?: string;
  dataUsageStatement?: string;
  scoreConfig?: SurveyScoreConfig;
  createdAt: string;
  updatedAt: string;
}

interface SurveyBuilderContextType {
  // Survey data
  survey: BuilderSurvey;
  questions: BuilderQuestion[];
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  
  // Question operations
  addQuestion: (type: string) => void;
  removeQuestion: (id: string) => void;
  reorderQuestions: (fromIndex: number, toIndex: number) => void;
  updateQuestion: (id: string, updates: Partial<BuilderQuestion>) => void;
  
  // Selection state
  selectedQuestionId: string | null;
  setSelectedQuestionId: (id: string | null) => void;
  selectedSection: 'welcome' | 'questions' | 'thankYou' | 'scoring' | null;
  setSelectedSection: (section: 'welcome' | 'questions' | 'thankYou' | 'scoring' | null) => void;
  
  // Screen updates
  updateWelcomeScreen: (updates: Partial<WelcomeScreen>) => void;
  updateThankYouScreen: (updates: Partial<ThankYouScreen>) => void;
  updateScoringSettings: (updates: Partial<ScoringSettings>) => void;
  updateSurveyMetadata: (updates: { title?: string; description?: string }) => void;
  
  // Panel state
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  
  // API operations
  saveSurvey: () => Promise<string | null>;
  loadSurvey: (id: string) => void;
  exportToEvalia: () => any; // Returns Evalia-compatible survey data
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateId(): string {
  return `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Validate and normalize question type
function normalizeQuestionType(typeInput: string): ValidQuestionType {
  // Check if it's already a valid schema type
  if (VALID_QUESTION_TYPES.includes(typeInput as ValidQuestionType)) {
    return typeInput as ValidQuestionType;
  }
  
  // Fall back to text if invalid type
  console.warn(`Unknown question type: ${typeInput}, defaulting to 'text'`);
  return 'text';
}

// Convert Evalia question to Builder question
function evaliaToBuilder(q: EvaliaQuestion, index: number): BuilderQuestion {
  const type = normalizeQuestionType(q.type);
  const displayType = getDisplayNameForType(type);
  
  // Get defaults for this question type
  const typeConfig = QUESTION_TYPES[type];
  const typeDefaults = typeConfig?.defaultParams || {};
  
  // Apply type-specific defaults for rating questions
  const ratingDefaults = type === 'rating' ? {
    ratingScale: 5,
    ratingStyle: 'number' as const,
  } : {};
  
  return {
    // Type defaults first (lowest priority)
    ...typeDefaults,
    ...ratingDefaults,
    // Then question-specific values (override defaults)
    id: q.id,
    type,
    displayType,
    text: q.question,
    description: q.description,
    required: q.required || false,
    hasLogic: !!q.skipCondition,
    order: index,
    // Copy all schema parameters (explicit values override defaults)
    placeholder: q.placeholder,
    minLength: q.minLength,
    maxLength: q.maxLength,
    validationPattern: q.validationPattern,
    rows: q.rows,
    options: q.options,
    displayStyle: q.displayStyle,
    allowOther: q.allowOther,
    randomizeOptions: q.randomizeOptions,
    optionImages: q.optionImages,
    minSelections: q.minSelections,
    maxSelections: q.maxSelections,
    imageOptions: q.imageOptions,
    selectionType: q.selectionType,
    imageSize: q.imageSize,
    showLabels: q.showLabels,
    columns: q.columns,
    ratingScale: q.ratingScale ?? ratingDefaults.ratingScale,
    ratingStyle: q.ratingStyle ?? ratingDefaults.ratingStyle,
    ratingLabels: q.ratingLabels,
    showLabelsOnly: q.showLabelsOnly,
    likertType: q.likertType,
    likertPoints: q.likertPoints,
    showNeutral: q.showNeutral,
    customLabels: q.customLabels,
    min: q.min,
    max: q.max,
    step: q.step,
    defaultValue: q.defaultValue,
    showValue: q.showValue,
    unit: q.unit,
    leftLabel: q.leftLabel,
    rightLabel: q.rightLabel,
    showNumbers: q.showNumbers,
    rowLabels: q.rowLabels,
    colLabels: q.colLabels,
    matrixType: q.matrixType,
    randomizeRows: q.randomizeRows,
    maxRankItems: q.maxRankItems,
    totalPoints: q.totalPoints,
    showPercentage: q.showPercentage,
    dateFormat: q.dateFormat,
    minDate: q.minDate,
    maxDate: q.maxDate,
    disablePastDates: q.disablePastDates,
    disableFutureDates: q.disableFutureDates,
    timeFormat: q.timeFormat,
    minuteStep: q.minuteStep,
    allowedTypes: q.allowedTypes,
    maxFileSize: q.maxFileSize,
    maxFiles: q.maxFiles,
    yesLabel: q.yesLabel,
    noLabel: q.noLabel,
    linkUrl: q.linkUrl,
    linkText: q.linkText,
    skipCondition: q.skipCondition,
    scoringCategory: q.scoringCategory,
    sectionId: q.sectionId,
    scoreWeight: q.scoreWeight,
    optionScores: q.optionScores,
  };
}

// Convert Builder question to Evalia question
function builderToEvalia(q: BuilderQuestion): EvaliaQuestion {
  return {
    id: q.id,
    type: q.type as any,
    question: q.text,
    description: q.description,
    required: q.required,
    // Copy all parameters
    placeholder: q.placeholder,
    minLength: q.minLength,
    maxLength: q.maxLength,
    validationPattern: q.validationPattern,
    rows: q.rows,
    options: q.options,
    displayStyle: q.displayStyle,
    allowOther: q.allowOther,
    randomizeOptions: q.randomizeOptions,
    optionImages: q.optionImages,
    minSelections: q.minSelections,
    maxSelections: q.maxSelections,
    imageOptions: q.imageOptions,
    selectionType: q.selectionType,
    imageSize: q.imageSize,
    showLabels: q.showLabels,
    columns: q.columns,
    ratingScale: q.ratingScale,
    ratingStyle: q.ratingStyle,
    ratingLabels: q.ratingLabels,
    showLabelsOnly: q.showLabelsOnly,
    likertType: q.likertType,
    likertPoints: q.likertPoints,
    showNeutral: q.showNeutral,
    customLabels: q.customLabels,
    min: q.min,
    max: q.max,
    step: q.step,
    defaultValue: q.defaultValue,
    showValue: q.showValue,
    unit: q.unit,
    leftLabel: q.leftLabel,
    rightLabel: q.rightLabel,
    showNumbers: q.showNumbers,
    rowLabels: q.rowLabels,
    colLabels: q.colLabels,
    matrixType: q.matrixType,
    randomizeRows: q.randomizeRows,
    maxRankItems: q.maxRankItems,
    totalPoints: q.totalPoints,
    showPercentage: q.showPercentage,
    dateFormat: q.dateFormat,
    minDate: q.minDate,
    maxDate: q.maxDate,
    disablePastDates: q.disablePastDates,
    disableFutureDates: q.disableFutureDates,
    timeFormat: q.timeFormat,
    minuteStep: q.minuteStep,
    allowedTypes: q.allowedTypes,
    maxFileSize: q.maxFileSize,
    maxFiles: q.maxFiles,
    yesLabel: q.yesLabel,
    noLabel: q.noLabel,
    linkUrl: q.linkUrl,
    linkText: q.linkText,
    skipCondition: q.skipCondition,
    scoringCategory: q.scoringCategory,
    sectionId: q.sectionId,
    scoreWeight: q.scoreWeight,
    optionScores: q.optionScores,
  };
}

// Get default options for a question type
function getDefaultOptionsForType(type: ValidQuestionType): string[] | undefined {
  const typeConfig = QUESTION_TYPES[type];
  if (typeConfig?.defaultOptions) {
    return [...typeConfig.defaultOptions];
  }
  return undefined;
}

// Get default parameters for a question type
function getDefaultParamsForType(type: ValidQuestionType): Partial<BuilderQuestion> {
  const typeConfig = QUESTION_TYPES[type];
  if (!typeConfig) return {};
  
  const params: Partial<BuilderQuestion> = {};
  
  // Apply defaults from type config
  if (typeConfig.defaultParams) {
    Object.assign(params, typeConfig.defaultParams);
  }
  
  // Apply parameter defaults
  typeConfig.parameters.forEach(param => {
    if (param.defaultValue !== undefined && !(param.key in params)) {
      (params as any)[param.key] = param.defaultValue;
    }
  });
  
  return params;
}

// ============================================
// CONTEXT
// ============================================

const SurveyBuilderContext = createContext<SurveyBuilderContextType | undefined>(undefined);

const createInitialSurvey = (): BuilderSurvey => ({
  id: `survey-${Date.now()}`,
  title: 'Untitled Survey',
  description: '',
  welcomeScreen: {
    enabled: true,
    title: 'Welcome to our survey',
    description: 'Your feedback helps us improve',
    buttonText: 'Start Survey',
    showTimeEstimate: true,
    showQuestionCount: true,
    backgroundImage: {
      overlayColor: '#000000',
      overlayOpacity: 40, // 40% overlay by default
    },
    themeColors: {
      primary: '#2F8FA5',
      background: '#FFFFFF',
      text: '#1e293b',
      buttonText: '#FFFFFF',
    },
  },
  thankYouScreen: {
    enabled: true,
    title: 'Thank you!',
    message: 'Your response has been recorded.',
    showSocialShare: false,
    backgroundImage: {
      overlayColor: '#000000',
      overlayOpacity: 40,
    },
  },
  scoringSettings: {
    enabled: false,
    type: 'points',
    showScore: false,
    showCorrectAnswers: false,
  },
  questions: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export function SurveyBuilderProvider({ 
  children,
  surveyId,
}: { 
  children: ReactNode;
  surveyId?: string;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [survey, setSurvey] = useState<BuilderSurvey>(createInitialSurvey());
  const [isDirty, setIsDirty] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<'welcome' | 'questions' | 'thankYou' | 'scoring' | null>(null);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  // Check for AI-generated or template survey data on mount
  useEffect(() => {
    if (surveyId === 'new' || !surveyId) {
      // Check for AI-generated survey
      const aiSurveyData = sessionStorage.getItem('aiGeneratedSurvey');
      if (aiSurveyData) {
        try {
          const parsed = JSON.parse(aiSurveyData);
          const builderQuestions = (parsed.questions || []).map((q: any, idx: number) => ({
            id: q.id || `q-${Date.now()}-${idx}`,
            type: EVALIA_TO_DISPLAY_TYPE[q.type] || q.type,
            evaliaType: q.type,
            text: q.question || q.text,
            description: q.description,
            options: q.options,
            required: q.required || false,
            hasLogic: false,
            order: idx,
          }));
          
          setSurvey({
            ...createInitialSurvey(),
            title: parsed.title || 'AI Generated Survey',
            description: parsed.description || '',
            questions: builderQuestions,
            scoreConfig: parsed.scoreConfig,
          });
          setIsDirty(true);
          sessionStorage.removeItem('aiGeneratedSurvey');
          toast({
            title: 'Survey loaded',
            description: `Loaded AI-generated survey with ${builderQuestions.length} questions.`,
          });
        } catch (e) {
          console.error('Failed to parse AI survey data:', e);
        }
        return;
      }

      // Check for template survey
      const templateData = sessionStorage.getItem('templateSurvey');
      if (templateData) {
        try {
          const parsed = JSON.parse(templateData);
          // Use evaliaToBuilder to properly convert all question parameters
          const builderQuestions = (parsed.questions || []).map((q: any, idx: number) => 
            evaliaToBuilder({
              ...q,
              question: q.question || q.text, // Ensure question text is properly mapped
            }, idx)
          );
          
          setSurvey({
            ...createInitialSurvey(),
            title: parsed.title || 'Template Survey',
            description: parsed.description || '',
            questions: builderQuestions,
            scoreConfig: parsed.scoreConfig,
          });
          setIsDirty(true);
          sessionStorage.removeItem('templateSurvey');
          toast({
            title: 'Template loaded',
            description: `Loaded template with ${builderQuestions.length} questions.`,
          });
        } catch (e) {
          console.error('Failed to parse template data:', e);
        }
      }
    }
  }, [surveyId, toast]);

  // Load existing survey
  const { data: existingSurveyData, isLoading } = useQuery({
    queryKey: ['/api/surveys', surveyId],
    queryFn: async () => {
      if (!surveyId || surveyId === 'new') return null;
      const res = await apiRequest('GET', `/api/surveys/${surveyId}`);
      return res.json();
    },
    enabled: !!surveyId && surveyId !== 'new',
  });

  // Handle loading existing survey data
  React.useEffect(() => {
    if (existingSurveyData) {
      // Store the persisted ID for subsequent saves
      setPersistedId(existingSurveyData.id);
      
      // Convert Evalia survey to Builder survey
      const builderQuestions = (existingSurveyData.questions || []).map(evaliaToBuilder);
      
      // Extract design settings if available
      const ds = existingSurveyData.designSettings;
      const welcomeDs = ds?.welcomeScreen;
      const thankYouDs = ds?.thankYouScreen;
      
      setSurvey({
        id: existingSurveyData.id,
        title: existingSurveyData.title || 'Untitled Survey',
        description: existingSurveyData.description || '',
        welcomeScreen: {
          enabled: welcomeDs?.enabled ?? !!existingSurveyData.welcomeMessage,
          title: welcomeDs?.title || 'Welcome to our survey',
          description: welcomeDs?.description || existingSurveyData.welcomeMessage || 'Your feedback helps us improve',
          buttonText: welcomeDs?.buttonText || 'Start Survey',
          imageUrl: welcomeDs?.logoUrl || existingSurveyData.illustrationUrl,
          headerImage: welcomeDs?.headerImage,
          backgroundImage: welcomeDs?.backgroundImage,
          showTimeEstimate: welcomeDs?.showTimeEstimate ?? true,
          showQuestionCount: welcomeDs?.showQuestionCount ?? true,
          privacyText: welcomeDs?.privacyText || existingSurveyData.privacyStatement,
          privacyLinkUrl: welcomeDs?.privacyLinkUrl,
          themeColors: ds?.themeColors || {
            primary: '#2F8FA5',
            background: '#FFFFFF',
            text: '#1e293b',
            buttonText: '#FFFFFF',
          },
        },
        thankYouScreen: {
          enabled: thankYouDs?.enabled ?? true,
          title: thankYouDs?.title || 'Thank you!',
          message: thankYouDs?.message || existingSurveyData.thankYouMessage || 'Your response has been recorded.',
          redirectUrl: thankYouDs?.redirectUrl,
          showSocialShare: thankYouDs?.showSocialShare ?? false,
          headerImage: thankYouDs?.headerImage,
          backgroundImage: thankYouDs?.backgroundImage,
        },
        scoringSettings: {
          enabled: !!existingSurveyData.scoreConfig?.enabled,
          type: 'points',
          showScore: existingSurveyData.scoreConfig?.enabled || false,
          showCorrectAnswers: false,
        },
        questions: builderQuestions,
        illustrationUrl: existingSurveyData.illustrationUrl,
        estimatedMinutes: existingSurveyData.estimatedMinutes,
        privacyStatement: existingSurveyData.privacyStatement,
        dataUsageStatement: existingSurveyData.dataUsageStatement,
        scoreConfig: existingSurveyData.scoreConfig,
        createdAt: existingSurveyData.createdAt,
        updatedAt: existingSurveyData.updatedAt,
      });
      setIsDirty(false);
    }
  }, [existingSurveyData]);

  // Track the persisted survey ID (once saved, this holds the real DB ID)
  const [persistedId, setPersistedId] = useState<string | null>(
    surveyId && surveyId !== 'new' ? surveyId : null
  );

  // Save mutation - uses persistedId to determine POST vs PUT
  const saveMutation = useMutation({
    mutationFn: async (surveyData: any) => {
      // Use persistedId if we have one, otherwise it's a new survey
      const isNew = !persistedId;
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? '/api/surveys' : `/api/surveys/${persistedId}`;
      const res = await apiRequest(method, url, surveyData);
      return res.json();
    },
    onSuccess: (data) => {
      // Store the returned ID so subsequent saves use PUT
      if (data.id && data.id !== persistedId) {
        setPersistedId(data.id);
        // Also update the survey state with the real ID
        setSurvey(prev => ({ ...prev, id: data.id }));
      }
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ['/api/surveys'] });
      toast({
        title: 'Survey saved',
        description: 'Your survey has been saved successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error saving survey',
        description: error.message || 'Failed to save survey',
        variant: 'destructive',
      });
    },
  });

  // ============================================
  // QUESTION OPERATIONS
  // ============================================

  const addQuestion = useCallback((typeInput: string) => {
    if (survey.questions.length >= 200) {
      toast({
        title: 'Maximum questions reached',
        description: 'Maximum 200 questions allowed per survey',
        variant: 'destructive',
      });
      return;
    }

    const type = normalizeQuestionType(typeInput);
    const typeConfig = QUESTION_TYPES[type];
    const displayType = typeConfig?.displayName || type;
    const defaultParams = getDefaultParamsForType(type);
    const defaultOptions = getDefaultOptionsForType(type);
    
    const newQuestion: BuilderQuestion = {
      id: generateId(),
      type,
      displayType,
      text: typeConfig?.defaultQuestion || `New ${displayType} question`,
      options: defaultOptions,
      required: false,
      hasLogic: false,
      order: survey.questions.length,
      ...defaultParams,
    };

    setSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      updatedAt: new Date().toISOString(),
    }));
    setSelectedQuestionId(newQuestion.id);
    setSelectedSection('questions');
    setIsDirty(true);
  }, [survey.questions.length, toast]);

  const removeQuestion = useCallback((id: string) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions
        .filter(q => q.id !== id)
        .map((q, idx) => ({ ...q, order: idx })),
      updatedAt: new Date().toISOString(),
    }));
    if (selectedQuestionId === id) {
      setSelectedQuestionId(null);
    }
    setIsDirty(true);
  }, [selectedQuestionId]);

  const reorderQuestions = useCallback((fromIndex: number, toIndex: number) => {
    setSurvey(prev => {
      const newQuestions = [...prev.questions];
      const [movedQuestion] = newQuestions.splice(fromIndex, 1);
      newQuestions.splice(toIndex, 0, movedQuestion);
      return {
        ...prev,
        questions: newQuestions.map((q, idx) => ({ ...q, order: idx })),
        updatedAt: new Date().toISOString(),
      };
    });
    setIsDirty(true);
  }, []);

  const updateQuestion = useCallback((id: string, updates: Partial<BuilderQuestion>) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === id ? { ...q, ...updates } : q
      ),
      updatedAt: new Date().toISOString(),
    }));
    setIsDirty(true);
  }, []);

  // ============================================
  // SCREEN UPDATES
  // ============================================

  const updateWelcomeScreen = useCallback((updates: Partial<WelcomeScreen>) => {
    setSurvey(prev => ({
      ...prev,
      welcomeScreen: { ...prev.welcomeScreen, ...updates },
      updatedAt: new Date().toISOString(),
    }));
    setIsDirty(true);
  }, []);

  const updateThankYouScreen = useCallback((updates: Partial<ThankYouScreen>) => {
    setSurvey(prev => ({
      ...prev,
      thankYouScreen: { ...prev.thankYouScreen, ...updates },
      updatedAt: new Date().toISOString(),
    }));
    setIsDirty(true);
  }, []);

  const updateScoringSettings = useCallback((updates: Partial<ScoringSettings>) => {
    setSurvey(prev => ({
      ...prev,
      scoringSettings: { ...prev.scoringSettings, ...updates },
      updatedAt: new Date().toISOString(),
    }));
    setIsDirty(true);
  }, []);

  const updateSurveyMetadata = useCallback((updates: { title?: string; description?: string }) => {
    setSurvey(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
    setIsDirty(true);
  }, []);

  // ============================================
  // PANEL TOGGLES
  // ============================================

  const toggleLeftPanel = useCallback(() => setLeftPanelOpen(prev => !prev), []);
  const toggleRightPanel = useCallback(() => setRightPanelOpen(prev => !prev), []);

  // ============================================
  // API OPERATIONS
  // ============================================

  const exportToEvalia = useCallback(() => {
    const evaliaQuestions = survey.questions.map(builderToEvalia);
    
    // Build design settings object for database storage
    const designSettings = {
      themeColors: survey.welcomeScreen.themeColors,
      welcomeScreen: {
        enabled: survey.welcomeScreen.enabled,
        title: survey.welcomeScreen.title,
        description: survey.welcomeScreen.description,
        buttonText: survey.welcomeScreen.buttonText,
        logoUrl: survey.welcomeScreen.imageUrl,
        headerImage: survey.welcomeScreen.headerImage,
        backgroundImage: survey.welcomeScreen.backgroundImage,
        showTimeEstimate: survey.welcomeScreen.showTimeEstimate,
        showQuestionCount: survey.welcomeScreen.showQuestionCount,
        privacyText: survey.welcomeScreen.privacyText,
        privacyLinkUrl: survey.welcomeScreen.privacyLinkUrl,
      },
      thankYouScreen: {
        enabled: survey.thankYouScreen.enabled,
        title: survey.thankYouScreen.title,
        message: survey.thankYouScreen.message,
        redirectUrl: survey.thankYouScreen.redirectUrl,
        showSocialShare: survey.thankYouScreen.showSocialShare,
        headerImage: survey.thankYouScreen.headerImage,
        backgroundImage: survey.thankYouScreen.backgroundImage,
      },
    };

    return {
      title: survey.title,
      description: survey.description,
      questions: evaliaQuestions,
      welcomeMessage: survey.welcomeScreen.enabled ? survey.welcomeScreen.description : undefined,
      thankYouMessage: survey.thankYouScreen.message,
      illustrationUrl: survey.illustrationUrl || survey.welcomeScreen.imageUrl,
      estimatedMinutes: survey.estimatedMinutes || Math.ceil(survey.questions.length * 0.5),
      privacyStatement: survey.privacyStatement || survey.welcomeScreen.privacyText,
      dataUsageStatement: survey.dataUsageStatement,
      scoreConfig: survey.scoreConfig,
      designSettings, // Include full design settings
    };
  }, [survey]);

  const saveSurvey = useCallback(async (): Promise<string | null> => {
    const evaliaData = exportToEvalia();
    try {
      const result = await saveMutation.mutateAsync(evaliaData);
      return result.id;
    } catch {
      return null;
    }
  }, [exportToEvalia, saveMutation]);

  const loadSurvey = useCallback((id: string) => {
    // Trigger refetch by invalidating query
    queryClient.invalidateQueries({ queryKey: ['/api/surveys', id] });
  }, [queryClient]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: SurveyBuilderContextType = {
    survey,
    questions: survey.questions,
    isDirty,
    isLoading,
    isSaving: saveMutation.isPending,
    
    addQuestion,
    removeQuestion,
    reorderQuestions,
    updateQuestion,
    
    selectedQuestionId,
    setSelectedQuestionId,
    selectedSection,
    setSelectedSection,
    
    updateWelcomeScreen,
    updateThankYouScreen,
    updateScoringSettings,
    updateSurveyMetadata,
    
    leftPanelOpen,
    rightPanelOpen,
    toggleLeftPanel,
    toggleRightPanel,
    
    saveSurvey,
    loadSurvey,
    exportToEvalia,
  };

  return (
    <SurveyBuilderContext.Provider value={value}>
      {children}
    </SurveyBuilderContext.Provider>
  );
}

export function useSurveyBuilder() {
  const context = useContext(SurveyBuilderContext);
  if (!context) {
    throw new Error('useSurveyBuilder must be used within SurveyBuilderProvider');
  }
  return context;
}

