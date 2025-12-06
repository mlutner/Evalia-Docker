import React, { useState, useEffect, createContext, useContext, useCallback, ReactNode, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Question as EvaliaQuestion, SurveyScoreConfig, LogicRule } from '@shared/schema';
import type {
  QuestionScoringConfig,
  ScoringCategory,
  CoreScoreBand,
} from '@/components/builder-extensions/INTEGRATION_GUIDE';
import { normalizeQuestion } from '@shared/questionNormalization';
import { QUESTION_TYPES, getDisplayNameForType, getLikertLabels } from '@/data/questionTypeConfig';
import { validateBuilderQuestion } from '@/utils/validateBuilderQuestion';
import { validateLogicRules } from '@/utils/validateLogicRules';
import { clampScoreWeight, normalizeScoringConfig, sanitizeOptionScores } from '@/utils/normalizeScoringConfig';
import { logBuilderMutation } from '@/utils/builderAuditLog';
import { checkSurveyIntegrity } from '@/utils/checkSurveyIntegrity';
import { validateSurveyBeforePublish, type SurveyValidationResult } from '@/utils/surveyValidator';

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
  // === VIDEO / AUDIO OPTIONS ===
  videoUrl?: string;
  posterImageUrl?: string;
  autoplay?: boolean;
  maxDuration?: number;
  
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

// LogicRule now lives in @shared/schema

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
  layout?: 'centered' | 'left-aligned' | 'split-view';
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

type QuestionLayout = 'single' | 'scroll';

interface SurveyBodySettings {
  headerImage?: string;
  backgroundImage?: BackgroundSettings;
  showProgressBar?: boolean;
  showQuestionNumbers?: boolean;
  questionLayout?: QuestionLayout;
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
  scoreConfig: SurveyScoreConfig | null;
  surveyBody?: SurveyBodySettings;
  createdAt: string;
  updatedAt: string;
}

interface SurveyBuilderContextType {
  // Survey data
  survey: BuilderSurvey;
  questions: BuilderQuestion[];
  scoreConfig: SurveyScoreConfig | null;
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  loadError?: string | null;
  
  // Scoring state (derived from questions and scoreConfig)
  scoringByQuestionId: Record<string, QuestionScoringConfig>;
  scoringCategories: ScoringCategory[];
  scoringBands: CoreScoreBand[];
  
  // Question operations
  addQuestion: (type: string, overrides?: { text?: string; options?: string[]; description?: string }) => void;
  removeQuestion: (id: string) => void;
  reorderQuestions: (fromIndex: number, toIndex: number) => void;
  updateQuestion: (id: string, updates: Partial<BuilderQuestion>) => void;
  addLogicRule: (rule: Partial<LogicRule> & { questionId?: string }) => LogicRule | null;
  updateLogicRule: (id: string, patch: Partial<LogicRule>) => void;
  deleteLogicRule: (id: string) => void;
  
  // Scoring operations
  setQuestionScoring: (questionId: string, scoring: QuestionScoringConfig) => void;
  updateScoringCategory: (category: ScoringCategory) => void;
  updateScoringBand: (band: CoreScoreBand) => void;
  deleteScoringBand: (bandId: string) => void;
  
  // Selection state
  selectedQuestionId: string | null;
  setSelectedQuestionId: (id: string | null) => void;
  selectedSection: 'welcome' | 'questions' | 'thankYou' | 'scoring' | 'results' | null;
  setSelectedSection: (section: 'welcome' | 'questions' | 'thankYou' | 'scoring' | 'results' | null) => void;
  
  // Screen updates
  updateWelcomeScreen: (updates: Partial<WelcomeScreen>) => void;
  updateThankYouScreen: (updates: Partial<ThankYouScreen>) => void;
  updateScoringSettings: (updates: Partial<ScoringSettings>) => void;
  updateScoreConfig: (updates: Partial<SurveyScoreConfig>) => void;
  updateSurveyMetadata: (updates: { title?: string; description?: string }) => void;
  updateSurveyBody: (updates: Partial<SurveyBodySettings>) => void;
  undo: () => void;
  redo: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  
  // Panel state
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  
  // API operations
  saveSurvey: (options?: { skipValidation?: boolean }) => Promise<{ id: string | null; validation: SurveyValidationResult | null }>;
  validateSurvey: () => SurveyValidationResult;
  loadSurvey: (id: string) => void;
  exportToEvalia: () => any; // Returns Evalia-compatible survey data
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateId(): string {
  return `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Simple undo/redo stacks
type HistoryState = {
  undo: BuilderSurvey[];
  redo: BuilderSurvey[];
};
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
export function evaliaToBuilder(q: EvaliaQuestion, index: number): BuilderQuestion {
  const normalized = normalizeQuestion(q);
  const type = normalizeQuestionType(normalized.type);
  const displayType = getDisplayNameForType(type);
  
  // Get defaults for this question type
  const typeConfig = QUESTION_TYPES[type];
  const typeDefaults = typeConfig?.defaultParams || {};
  
  // Apply type-specific defaults for rating questions
  const ratingDefaults = type === 'rating' ? {
    ratingScale: 5,
    ratingStyle: 'number' as const,
  } : {};
  
  const questionIds: Set<string> | undefined = undefined; // placeholder; callers can revalidate with full set

  return validateBuilderQuestion({
    // Type defaults first (lowest priority)
    ...typeDefaults,
    ...ratingDefaults,
    // Then question-specific values (override defaults)
    id: normalized.id,
    type,
    displayType,
    text: normalized.question,
    description: normalized.description,
    required: normalized.required || false,
    hasLogic: !!(normalized.skipCondition || (normalized as any).logicRules?.length),
    order: index,
    // Copy all schema parameters (explicit values override defaults)
    placeholder: normalized.placeholder,
    minLength: normalized.minLength,
    maxLength: normalized.maxLength,
    validationPattern: normalized.validationPattern,
    rows: normalized.rows,
    options: normalized.options,
    displayStyle: normalized.displayStyle,
    allowOther: normalized.allowOther,
    randomizeOptions: normalized.randomizeOptions,
    optionImages: normalized.optionImages,
    minSelections: normalized.minSelections,
    maxSelections: normalized.maxSelections,
    imageOptions: normalized.imageOptions,
    selectionType: normalized.selectionType,
    imageSize: normalized.imageSize,
    showLabels: normalized.showLabels,
    columns: normalized.columns,
    ratingScale: normalized.ratingScale ?? ratingDefaults.ratingScale,
    ratingStyle: normalized.ratingStyle ?? ratingDefaults.ratingStyle,
    ratingLabels: normalized.ratingLabels,
    showLabelsOnly: normalized.showLabelsOnly,
    npsLabels: normalized.npsLabels,
    likertType: normalized.likertType,
    likertPoints: normalized.likertPoints,
    showNeutral: normalized.showNeutral,
    customLabels: normalized.customLabels,
    min: normalized.min,
    max: normalized.max,
    step: normalized.step,
    defaultValue: normalized.defaultValue,
    showValue: normalized.showValue,
    unit: normalized.unit,
    leftLabel: normalized.leftLabel,
    rightLabel: normalized.rightLabel,
    showNumbers: normalized.showNumbers,
    rowLabels: normalized.rowLabels,
    colLabels: normalized.colLabels,
    matrixType: normalized.matrixType,
    randomizeRows: normalized.randomizeRows,
    maxRankItems: normalized.maxRankItems,
    totalPoints: normalized.totalPoints,
    showPercentage: normalized.showPercentage,
    dateFormat: normalized.dateFormat,
    minDate: normalized.minDate,
    maxDate: normalized.maxDate,
    disablePastDates: normalized.disablePastDates,
    disableFutureDates: normalized.disableFutureDates,
    timeFormat: normalized.timeFormat,
    minuteStep: normalized.minuteStep,
    allowedTypes: normalized.allowedTypes,
    maxFileSize: normalized.maxFileSize,
    maxFiles: normalized.maxFiles,
    videoUrl: (normalized as any).videoUrl,
    posterImageUrl: (normalized as any).posterImageUrl,
    autoplay: (normalized as any).autoplay,
    maxDuration: (normalized as any).maxDuration,
    yesLabel: normalized.yesLabel,
    noLabel: normalized.noLabel,
    linkUrl: normalized.linkUrl,
    linkText: normalized.linkText,
    skipCondition: normalized.skipCondition,
    logicRules: validateLogicRules((normalized as any).logicRules, normalized.id, questionIds),
    scoringCategory: normalized.scoringCategory,
    sectionId: normalized.sectionId,
    scoreWeight: normalized.scoreWeight,
    optionScores: normalized.optionScores,
    scorable: (normalized as any).scorable,
  } as BuilderQuestion);
}

// Convert Builder question to Evalia question
export function builderToEvalia(q: BuilderQuestion): EvaliaQuestion {
  const rawQuestion = {
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
    npsLabels: q.npsLabels,
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
    videoUrl: q.videoUrl,
    posterImageUrl: q.posterImageUrl,
    autoplay: q.autoplay,
    maxDuration: q.maxDuration,
    yesLabel: q.yesLabel,
    noLabel: q.noLabel,
    linkUrl: q.linkUrl,
    linkText: q.linkText,
    skipCondition: q.skipCondition,
    logicRules: q.logicRules,
    scoringCategory: q.scoringCategory,
    sectionId: q.sectionId,
    scoreWeight: q.scoreWeight,
    optionScores: q.optionScores,
    scorable: q.scorable,
  };

  return normalizeQuestion(rawQuestion) as EvaliaQuestion;
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

// Question types that can be scored (rating-type and choice-type questions)
const SCORABLE_QUESTION_TYPES = new Set([
  'rating', 'nps', 'likert', 'opinion_scale', 'slider', 'emoji_rating',
  'multiple_choice', 'checkbox', 'dropdown', 'yes_no', 'ranking',
]);

// Build scoring map from scoreConfig and questions
// This provides the UI with per-question scoring configuration
function buildScoringMapFromScoreConfig(
  questions: BuilderQuestion[],
): Record<string, QuestionScoringConfig> {
  const map: Record<string, QuestionScoringConfig> = {};

  for (const q of questions) {
    // Mark certain question types as potentially scorable
    const scorable = SCORABLE_QUESTION_TYPES.has(q.type) && (q.scorable ?? false);

    map[q.id] = {
      scorable,
      scoreWeight: q.scoreWeight ?? 1,
      scoringCategory: q.scoringCategory,
      scoreValues: q.scoreValues,
      reverse: false,
    };
  }

  return map;
}

// Build API payload from builder survey state (pure for reuse/testing)
export function exportSurveyToEvalia(survey: BuilderSurvey) {
  // [BUG-ANAL-XXX] Log before conversion
  console.log('[BUG-ANAL-XXX] exportSurveyToEvalia() - Input:', {
    surveyId: survey.id,
    builderQuestionsCount: survey.questions.length,
    builderQuestions: survey.questions.map(q => ({ id: q.id, type: q.type })),
  });
  
  const evaliaQuestions = survey.questions.map(builderToEvalia);
  
  // [BUG-ANAL-XXX] Log after conversion
  console.log('[BUG-ANAL-XXX] exportSurveyToEvalia() - Output:', {
    surveyId: survey.id,
    evaliaQuestionsCount: evaliaQuestions.length,
    evaliaQuestions: evaliaQuestions.map(q => ({ id: q.id, type: q.type })),
  });

  const designSettings = {
    themeColors: survey.welcomeScreen.themeColors,
    welcomeScreen: {
      enabled: survey.welcomeScreen.enabled,
      title: survey.welcomeScreen.title,
      description: survey.welcomeScreen.description,
      buttonText: survey.welcomeScreen.buttonText,
      layout: survey.welcomeScreen.layout,
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
    surveyBody: survey.surveyBody,
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
    designSettings,
  };
}

// ============================================
// CONTEXT
// ============================================

const SurveyBuilderContext = createContext<SurveyBuilderContextType | undefined>(undefined);

type HistoryState = {
  undo: BuilderSurvey[];
  redo: BuilderSurvey[];
};

// [SCORING-PIPELINE] Default empty scoring configuration
// Used as fallback when no scoreConfig is present. NEVER modify this structure.
const EMPTY_SCORE_CONFIG: SurveyScoreConfig = {
  enabled: false,
  categories: [],
  scoreRanges: [],
  resultsScreen: undefined,
};

let inRenderPhase = false;

function markRenderStart() {
  if (!import.meta.env.DEV) return;
  inRenderPhase = true;
}

function markRenderEnd() {
  if (!import.meta.env.DEV) return;
  inRenderPhase = false;
}

function assertNotInRender(methodName: string) {
  if (!import.meta.env.DEV) return;
  if (inRenderPhase) {
    console.warn(`[SurveyBuilder] ${methodName} called during render. Move side-effects to event handlers/effects.`);
  }
}

function assertSurveyInvariants(survey: BuilderSurvey) {
  if (!import.meta.env.DEV) return;

  const ids = survey.questions.map((q) => q.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    console.warn('[SurveyBuilder] Duplicate question IDs detected', ids);
  }

  const orders = survey.questions.map((q) => q.order);
  const sortedOrders = [...orders].sort((a, b) => a - b);
  const expected = Array.from({ length: survey.questions.length }, (_, i) => i);
  if (JSON.stringify(sortedOrders) !== JSON.stringify(expected)) {
    console.warn('[SurveyBuilder] Question order is not contiguous 0..n-1', orders);
  }

  for (const q of survey.questions) {
    if (!VALID_QUESTION_TYPES.includes(q.type)) {
      console.warn('[SurveyBuilder] Invalid question type', q.id, q.type);
    }
  }
}

function pushHistory(
  prev: BuilderSurvey,
  setHistoryState: React.Dispatch<React.SetStateAction<HistoryState>>
) {
  setHistoryState((state) => {
    const nextUndo = [...state.undo, prev].slice(-50); // cap size
    return { undo: nextUndo, redo: [] };
  });
}

export const createInitialSurvey = (): BuilderSurvey => ({
  id: `survey-${Date.now()}`,
  title: 'Untitled Survey',
  description: '',
  welcomeScreen: {
    enabled: true,
    title: 'Welcome to our survey',
    description: 'Your feedback helps us improve',
    buttonText: 'Start Survey',
    layout: 'centered',
    showTimeEstimate: true,
    showQuestionCount: true,
    backgroundImage: {
      overlayColor: '#000000',
      overlayOpacity: 40, // 40% overlay by default
    },
    themeColors: {
      primary: '#2F8FA5',
      secondary: '#2F8FA5', // Header bar color - defaults to primary
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
  surveyBody: {
    showProgressBar: true,
    showQuestionNumbers: true,
    questionLayout: 'scroll',
  },
  scoreConfig: EMPTY_SCORE_CONFIG,
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
  const [history, setHistory] = useState<HistoryState>({ undo: [], redo: [] });
  const [isDirty, setIsDirty] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<'welcome' | 'questions' | 'thankYou' | 'scoring' | 'results' | null>(null);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  // [SCORING-PIPELINE] Central state update function
  const applySurveyUpdate = useCallback(
    (updater: (prev: BuilderSurvey) => BuilderSurvey, recordHistory = true) => {
      setSurvey((prev) => {
        const next = updater(prev);
        
        // [SCORING-PIPELINE] Dev-only: Log state transition for scoreConfig
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('[SCORING-PIPELINE] applySurveyUpdate state transition', {
            prevSurveyId: prev.id,
            nextSurveyId: next.id,
            prevScoreConfigCats: prev.scoreConfig?.categories?.length ?? 0,
            prevScoreConfigBands: prev.scoreConfig?.scoreRanges?.length ?? 0,
            nextScoreConfigCats: next.scoreConfig?.categories?.length ?? 0,
            nextScoreConfigBands: next.scoreConfig?.scoreRanges?.length ?? 0,
            recordHistory,
          });
        }
        
        if (recordHistory) {
          pushHistory(prev, setHistory);
        }
        assertSurveyInvariants(next);
        return next;
      });
    },
    []
  );

  // Check for AI-generated or template survey data on mount
  useEffect(() => {
    if (surveyId === 'new' || !surveyId) {
      const aiSurveyData = sessionStorage.getItem('aiGeneratedSurvey');
      if (aiSurveyData) {
        try {
          const parsed = JSON.parse(aiSurveyData);
          const builderQuestions = (parsed.questions || []).map((q: any, idx: number) =>
            validateBuilderQuestion(
              evaliaToBuilder(
                {
                  ...q,
                  question: q.question || q.text,
                  logicRules: q.logicRules,
                } as any,
                idx
              )
            )
          );

          const surveyTitle = parsed.title || 'AI Generated Survey';
          const nextSurvey = {
            ...createInitialSurvey(),
            title: surveyTitle,
            description: parsed.description || '',
            questions: builderQuestions,
            scoreConfig: parsed.scoreConfig ?? EMPTY_SCORE_CONFIG,
            welcomeScreen: {
              ...createInitialSurvey().welcomeScreen,
              title: surveyTitle, // Use survey title as welcome screen title
              description: parsed.description || 'Your feedback helps us improve',
            },
          };
          applySurveyUpdate(() => nextSurvey, false);
          const report = checkSurveyIntegrity(nextSurvey);
          if (!report.isHealthy) {
            console.warn('[SurveyBuilder] Integrity warnings after AI import', report.issues);
          }
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

      const templateData = sessionStorage.getItem('templateSurvey');
      if (templateData) {
        try {
          const parsed = JSON.parse(templateData);
          const builderQuestions = (parsed.questions || []).map((q: any, idx: number) =>
            validateBuilderQuestion(
              evaliaToBuilder(
                {
                  ...q,
                  question: q.question || q.text, // Ensure question text is properly mapped
                  logicRules: q.logicRules, // Preserve logic rules from template
                } as any,
                idx
              )
            )
          );
          
          const surveyTitle = parsed.title || 'Template Survey';
          const nextSurvey = {
            ...createInitialSurvey(),
            title: surveyTitle,
            description: parsed.description || '',
            questions: builderQuestions,
            scoreConfig: parsed.scoreConfig ?? EMPTY_SCORE_CONFIG,
            welcomeScreen: {
              ...createInitialSurvey().welcomeScreen,
              title: surveyTitle, // Use survey title as welcome screen title
              description: parsed.description || 'Your feedback helps us improve',
            },
          };
          applySurveyUpdate(() => nextSurvey, false);
          const report = checkSurveyIntegrity(nextSurvey);
          if (!report.isHealthy) {
            console.warn('[SurveyBuilder] Integrity warnings after template import', report.issues);
          }
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
  }, [surveyId, toast, applySurveyUpdate]);

  // Load existing survey
  const { data: existingSurveyData, isLoading } = useQuery({
    queryKey: ['/api/surveys', surveyId],
    queryFn: async () => {
      if (!surveyId || surveyId === 'new') return null;
      const res = await apiRequest('GET', `/api/surveys/${surveyId}`);
      const data = await res.json();
      
      // [SCORING-PIPELINE] Log raw API payload IMMEDIATELY after fetch, before any processing
      console.log('[SCORING-PIPELINE] Raw API survey payload', {
        surveyId: data.id,
        hasScoreConfig: !!data.scoreConfig,
        enabled: data.scoreConfig?.enabled,
        categoriesCount: data.scoreConfig?.categories?.length ?? 0,
        bandsCount: data.scoreConfig?.scoreRanges?.length ?? 0,
      });
      
      return data;
    },
    enabled: !!surveyId && surveyId !== 'new',
  });

  // [SCORING-PIPELINE] Handle loading existing survey data
  // This effect transforms API response into BuilderSurvey state
  React.useEffect(() => {
    if (!existingSurveyData) return;

    // [SCORING-PIPELINE] Log incoming scoreConfig from API
    const apiScoreConfig = (existingSurveyData as any).scoreConfig;
    const apiCategoriesCount = apiScoreConfig?.categories?.length ?? 0;
    const apiBandsCount = apiScoreConfig?.scoreRanges?.length ?? 0;
    
    // eslint-disable-next-line no-console
    console.log('[SCORING-PIPELINE] API response scoreConfig', {
      surveyId: existingSurveyData.id,
      hasScoreConfig: !!apiScoreConfig,
      enabled: apiScoreConfig?.enabled,
      categoriesCount: apiCategoriesCount,
      bandsCount: apiBandsCount,
      categoryIds: apiScoreConfig?.categories?.map((c: any) => c.id) ?? [],
    });

    // [SCORING-PIPELINE] GUARD: Warn if scoring is enabled but data is empty
    if (apiScoreConfig?.enabled && (apiCategoriesCount === 0 || apiBandsCount === 0)) {
      console.error('[SCORING-PIPELINE] API returned enabled scoring with empty categories or ranges!', {
        surveyId: existingSurveyData.id,
        enabled: apiScoreConfig.enabled,
        categoriesCount: apiCategoriesCount,
        bandsCount: apiBandsCount,
      });
    }

    // Store the persisted ID for subsequent saves
    setPersistedId(existingSurveyData.id);
    
    try {
      // [BUG-ANAL-XXX] Log questions from API before conversion
      console.log('[BUG-ANAL-XXX] Loading survey - API response questions:', {
        surveyId: existingSurveyData.id,
        apiQuestionsCount: existingSurveyData.questions?.length ?? 0,
        apiQuestions: existingSurveyData.questions?.map((q: any) => ({ id: q.id, type: q.type, question: q.question?.substring(0, 50) })) ?? [],
      });
      
      // Convert Evalia survey to Builder survey
      const builderQuestions = (existingSurveyData.questions || []).map(evaliaToBuilder).map((q, idx) =>
        validateBuilderQuestion({
          ...q,
          logicRules: validateLogicRules((q as any).logicRules, q.id, new Set((existingSurveyData.questions || []).map((qq: any) => qq.id))),
          order: idx,
        } as BuilderQuestion)
      );
      
      // [BUG-ANAL-XXX] Log questions after conversion to Builder format
      console.log('[BUG-ANAL-XXX] Loading survey - After evaliaToBuilder conversion:', {
        surveyId: existingSurveyData.id,
        builderQuestionsCount: builderQuestions.length,
        builderQuestions: builderQuestions.map(q => ({ id: q.id, type: q.type, text: q.text?.substring(0, 50) })),
      });
    
      // Extract design settings if available
      const ds = existingSurveyData.designSettings;
      const welcomeDs = ds?.welcomeScreen;
      const thankYouDs = ds?.thankYouScreen;
    
      applySurveyUpdate(
        () => ({
          id: existingSurveyData.id,
          title: existingSurveyData.title || 'Untitled Survey',
          description: existingSurveyData.description || '',
          welcomeScreen: {
            enabled: welcomeDs?.enabled ?? !!existingSurveyData.welcomeMessage,
            title: welcomeDs?.title || 'Welcome to our survey',
            description: welcomeDs?.description || existingSurveyData.welcomeMessage || 'Your feedback helps us improve',
            buttonText: welcomeDs?.buttonText || 'Start Survey',
            layout: welcomeDs?.layout || 'centered',
            imageUrl: welcomeDs?.logoUrl || existingSurveyData.illustrationUrl,
            headerImage: welcomeDs?.headerImage,
            backgroundImage: welcomeDs?.backgroundImage,
            showTimeEstimate: welcomeDs?.showTimeEstimate ?? true,
            showQuestionCount: welcomeDs?.showQuestionCount ?? true,
            privacyText: welcomeDs?.privacyText || existingSurveyData.privacyStatement,
            privacyLinkUrl: welcomeDs?.privacyLinkUrl,
            themeColors: ds?.themeColors || {
              primary: '#2F8FA5',
              secondary: '#2F8FA5', // Header bar color
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
          surveyBody: ds?.surveyBody || {
            showProgressBar: true,
            showQuestionNumbers: true,
            questionLayout: 'scroll',
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
          // [SCORING-PIPELINE] Merge scoreConfig from API, fallback to EMPTY_SCORE_CONFIG
          scoreConfig: (existingSurveyData as any).scoreConfig ?? EMPTY_SCORE_CONFIG,
          createdAt: existingSurveyData.createdAt,
          updatedAt: existingSurveyData.updatedAt,
        }),
        false
      );
      
      // [SCORING-PIPELINE] Dev-only: Log what we're applying to state
      if (import.meta.env.DEV) {
        const appliedScoreConfig = (existingSurveyData as any).scoreConfig ?? EMPTY_SCORE_CONFIG;
        // eslint-disable-next-line no-console
        console.log('[SCORING-PIPELINE] Applying scoreConfig to state', {
          surveyId: existingSurveyData.id,
          categoriesCount: appliedScoreConfig.categories?.length ?? 0,
          bandsCount: appliedScoreConfig.scoreRanges?.length ?? 0,
          usedFallback: !(existingSurveyData as any).scoreConfig,
        });
      }
      
      setLoadError(null);
      setIsDirty(false);
    } catch (err) {
      console.error(`[SurveyBuilder] Failed to normalize questions for survey ${existingSurveyData.id}:`, err);
      setLoadError('This survey has invalid questions and could not be loaded. See logs.');
      toast({
        title: 'Invalid survey data',
        description: 'This survey has invalid questions and could not be loaded. See logs for details.',
        variant: 'destructive',
      });
    }
  }, [existingSurveyData, applySurveyUpdate]);

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
        // Also update the survey state with the real ID without pushing history
        applySurveyUpdate(() => ({ ...survey, id: data.id }), false);
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

  const addQuestion = useCallback((typeInput: string, overrides?: { text?: string; options?: string[]; description?: string }) => {
    assertNotInRender('addQuestion');
    const type = normalizeQuestionType(typeInput);
    const typeConfig = QUESTION_TYPES[type];
    const displayType = typeConfig?.displayName || type;
    const defaultParams = getDefaultParamsForType(type);
    const defaultOptions = getDefaultOptionsForType(type);
    
    let addedQuestion: BuilderQuestion | null = null;

    applySurveyUpdate(prev => {
      if (prev.questions.length >= 200) {
        toast({
          title: 'Maximum questions reached',
          description: 'Maximum 200 questions allowed per survey',
          variant: 'destructive',
        });
        return prev;
      }

      addedQuestion = validateBuilderQuestion({
        id: generateId(),
        type,
        displayType,
        text: overrides?.text || typeConfig?.defaultQuestion || `New ${displayType} question`,
        description: overrides?.description,
        options: overrides?.options || defaultOptions,
        required: false,
        hasLogic: false,
        order: prev.questions.length,
        ...defaultParams,
      } as BuilderQuestion);

      const next = {
        ...prev,
        questions: [...prev.questions, addedQuestion],
        updatedAt: new Date().toISOString(),
      };
      setSelectedQuestionId(addedQuestion.id);
      setSelectedSection('questions');
      setIsDirty(true);
      logBuilderMutation('addQuestion', addedQuestion);
      return next;
    });
  }, [applySurveyUpdate, toast]);

  const removeQuestion = useCallback((id: string) => {
    assertNotInRender('removeQuestion');
    applySurveyUpdate(prev => ({
      ...prev,
      questions: prev.questions
        .filter(q => q.id !== id)
        .map((q, idx) => validateBuilderQuestion({ ...q, order: idx } as BuilderQuestion)),
      updatedAt: new Date().toISOString(),
    }));
    setSelectedQuestionId((prev) => (prev === id ? null : prev));
    setIsDirty(true);
    logBuilderMutation('removeQuestion', { id });
  }, [applySurveyUpdate]);

  const reorderQuestions = useCallback((fromIndex: number, toIndex: number) => {
    assertNotInRender('reorderQuestions');
    applySurveyUpdate(prev => {
      const newQuestions = [...prev.questions];
      const [movedQuestion] = newQuestions.splice(fromIndex, 1);
      newQuestions.splice(toIndex, 0, movedQuestion);
      return {
        ...prev,
        questions: newQuestions.map((q, idx) => validateBuilderQuestion({ ...q, order: idx } as BuilderQuestion)),
        updatedAt: new Date().toISOString(),
      };
    });
    setIsDirty(true);
    logBuilderMutation('reorderQuestions', { fromIndex, toIndex });
  }, [applySurveyUpdate]);

  const updateQuestion = useCallback((id: string, updates: Partial<BuilderQuestion>) => {
    assertNotInRender('updateQuestion');
    applySurveyUpdate(prev => {
      const questionIds = new Set(prev.questions.map((q) => q.id));
      const nextQuestions = prev.questions.map(q => {
        if (q.id !== id) return q;
        const merged = { ...q, ...updates } as BuilderQuestion;
        if (updates.logicRules) {
          merged.logicRules = validateLogicRules(updates.logicRules, id, questionIds);
          merged.hasLogic = !!merged.logicRules?.length;
        }
        if (updates.scoreWeight !== undefined) {
          merged.scoreWeight = clampScoreWeight(updates.scoreWeight);
        }
        if (updates.optionScores) {
          merged.optionScores = sanitizeOptionScores(updates.optionScores);
        }
        return validateBuilderQuestion(merged);
      });

      logBuilderMutation('updateQuestion', { id, updates });
      return {
        ...prev,
        questions: nextQuestions,
        updatedAt: new Date().toISOString(),
      };
    });
    setIsDirty(true);
  }, [applySurveyUpdate]);

  const addLogicRule = useCallback((rule: Partial<LogicRule> & { questionId?: string }) => {
    assertNotInRender('addLogicRule');
    let createdRule: LogicRule | null = null;
    applySurveyUpdate(prev => {
      const targetId = rule.questionId || selectedQuestionId || prev.questions[0]?.id;
      if (!targetId) return prev;
      const questionIds = new Set(prev.questions.map((q) => q.id));
      const idx = prev.questions.findIndex((q) => q.id === targetId);
      if (idx === -1) return prev;
      const newRule: LogicRule = {
        id: rule.id || `logic-${Date.now()}`,
        condition: rule.condition || '',
        action: (rule.action as LogicRule['action']) || 'skip',
        targetQuestionId: rule.targetQuestionId ?? null,
      };
      const nextRules = validateLogicRules([...(prev.questions[idx].logicRules || []), newRule], targetId, questionIds);
      const updatedQuestion = validateBuilderQuestion({
        ...prev.questions[idx],
        logicRules: nextRules,
        hasLogic: !!nextRules.length,
      } as BuilderQuestion);
      const nextQuestions = [...prev.questions];
      nextQuestions[idx] = updatedQuestion;
      createdRule = newRule;
      return {
        ...prev,
        questions: nextQuestions,
        updatedAt: new Date().toISOString(),
      };
    });
    setIsDirty(true);
    return createdRule;
  }, [applySurveyUpdate, selectedQuestionId]);

  const updateLogicRule = useCallback((id: string, patch: Partial<LogicRule>) => {
    assertNotInRender('updateLogicRule');
    applySurveyUpdate(prev => {
      const questionIds = new Set(prev.questions.map((q) => q.id));
      const idx = prev.questions.findIndex((q) => q.logicRules?.some((r) => r.id === id));
      if (idx === -1) return prev;
      const target = prev.questions[idx];
      const nextRules = validateLogicRules(
        (target.logicRules || []).map((r) => (r.id === id ? { ...r, ...patch } : r)),
        target.id,
        questionIds
      );
      const updatedQuestion = validateBuilderQuestion({
        ...target,
        logicRules: nextRules,
        hasLogic: !!nextRules.length,
      } as BuilderQuestion);
      const nextQuestions = [...prev.questions];
      nextQuestions[idx] = updatedQuestion;
      return {
        ...prev,
        questions: nextQuestions,
        updatedAt: new Date().toISOString(),
      };
    });
    setIsDirty(true);
  }, [applySurveyUpdate]);

  const deleteLogicRule = useCallback((id: string) => {
    assertNotInRender('deleteLogicRule');
    applySurveyUpdate(prev => {
      const questionIds = new Set(prev.questions.map((q) => q.id));
      const idx = prev.questions.findIndex((q) => q.logicRules?.some((r) => r.id === id));
      if (idx === -1) return prev;
      const target = prev.questions[idx];
      const nextRules = validateLogicRules(
        (target.logicRules || []).filter((r) => r.id !== id),
        target.id,
        questionIds
      );
      const updatedQuestion = validateBuilderQuestion({
        ...target,
        logicRules: nextRules,
        hasLogic: !!nextRules.length,
      } as BuilderQuestion);
      const nextQuestions = [...prev.questions];
      nextQuestions[idx] = updatedQuestion;
      return {
        ...prev,
        questions: nextQuestions,
        updatedAt: new Date().toISOString(),
      };
    });
    setIsDirty(true);
  }, [applySurveyUpdate]);

  // ============================================
  // SCREEN UPDATES
  // ============================================

  const updateWelcomeScreen = useCallback((updates: Partial<WelcomeScreen>) => {
    assertNotInRender('updateWelcomeScreen');
    applySurveyUpdate(prev => ({
      ...prev,
      welcomeScreen: { ...prev.welcomeScreen, ...updates },
      updatedAt: new Date().toISOString(),
    }));
    setIsDirty(true);
    logBuilderMutation('updateWelcomeScreen', updates);
  }, [applySurveyUpdate]);

  const updateThankYouScreen = useCallback((updates: Partial<ThankYouScreen>) => {
    assertNotInRender('updateThankYouScreen');
    applySurveyUpdate(prev => ({
      ...prev,
      thankYouScreen: { ...prev.thankYouScreen, ...updates },
      updatedAt: new Date().toISOString(),
    }));
    setIsDirty(true);
    logBuilderMutation('updateThankYouScreen', updates);
  }, [applySurveyUpdate]);

  const updateScoringSettings = useCallback((updates: Partial<ScoringSettings>) => {
    assertNotInRender('updateScoringSettings');
    applySurveyUpdate(prev => ({
      ...prev,
      scoringSettings: { ...prev.scoringSettings, ...updates },
      updatedAt: new Date().toISOString(),
    }));
    setIsDirty(true);
    logBuilderMutation('updateScoringSettings', updates);
  }, [applySurveyUpdate]);

  const updateScoreConfig = useCallback((updates: Partial<SurveyScoreConfig>) => {
    assertNotInRender('updateScoreConfig');
    applySurveyUpdate(prev => ({
      ...prev,
      scoreConfig: normalizeScoringConfig({ ...(prev.scoreConfig ?? EMPTY_SCORE_CONFIG), ...updates }),
      updatedAt: new Date().toISOString(),
    }));
    setIsDirty(true);
    logBuilderMutation('updateScoreConfig', updates);
  }, [applySurveyUpdate]);

  const updateSurveyMetadata = useCallback((updates: { title?: string; description?: string }) => {
    assertNotInRender('updateSurveyMetadata');
    applySurveyUpdate(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
    setIsDirty(true);
    logBuilderMutation('updateSurveyMetadata', updates);
  }, [applySurveyUpdate]);

  const updateSurveyBody = useCallback((updates: Partial<SurveyBodySettings>) => {
    assertNotInRender('updateSurveyBody');
    applySurveyUpdate(prev => ({
      ...prev,
      surveyBody: { ...prev.surveyBody, ...updates },
      updatedAt: new Date().toISOString(),
    }));
    setIsDirty(true);
    logBuilderMutation('updateSurveyBody', updates);
  }, [applySurveyUpdate]);

  // ============================================
  // SCORING OPERATIONS
  // ============================================

  // Derived scoring state from questions
  const scoringByQuestionId = useMemo(
    () => buildScoringMapFromScoreConfig(survey.questions),
    [survey.questions]
  );

  // Derived categories from scoreConfig
  const scoringCategories = useMemo<ScoringCategory[]>(
    () => (survey.scoreConfig?.categories ?? []) as ScoringCategory[],
    [survey.scoreConfig?.categories]
  );

  // Derived bands from scoreConfig
  const scoringBands = useMemo<CoreScoreBand[]>(
    () => survey.scoreConfig?.scoreRanges ?? [],
    [survey.scoreConfig?.scoreRanges]
  );

  // Update scoring config for a specific question
  const setQuestionScoring = useCallback((questionId: string, scoring: QuestionScoringConfig) => {
    assertNotInRender('setQuestionScoring');
    applySurveyUpdate(prev => {
      const nextQuestions = prev.questions.map(q => {
        if (q.id !== questionId) return q;
        return validateBuilderQuestion({
          ...q,
          scorable: scoring.scorable,
          scoreWeight: clampScoreWeight(scoring.scoreWeight),
          scoringCategory: scoring.scoringCategory,
          scoreValues: scoring.scoreValues,
        } as BuilderQuestion);
      });
      return {
        ...prev,
        questions: nextQuestions,
        updatedAt: new Date().toISOString(),
      };
    });
    setIsDirty(true);
    logBuilderMutation('setQuestionScoring', { questionId, scoring });
  }, [applySurveyUpdate]);

  // Update a scoring category in scoreConfig
  const updateScoringCategory = useCallback((category: ScoringCategory) => {
    assertNotInRender('updateScoringCategory');
    applySurveyUpdate(prev => {
      const existingCategories = prev.scoreConfig?.categories || [];
      const idx = existingCategories.findIndex((c: any) => c.id === category.id);
      const nextCategories = idx >= 0
        ? existingCategories.map((c: any, i: number) => i === idx ? category : c)
        : [...existingCategories, category];
      return {
        ...prev,
        scoreConfig: normalizeScoringConfig({
          enabled: prev.scoreConfig?.enabled ?? false,
          categories: nextCategories,
          scoreRanges: prev.scoreConfig?.scoreRanges || [],
          resultsScreen: prev.scoreConfig?.resultsScreen,
        }),
        updatedAt: new Date().toISOString(),
      };
    });
    setIsDirty(true);
    logBuilderMutation('updateScoringCategory', category);
  }, [applySurveyUpdate]);

  // Update a scoring band in scoreConfig
  const updateScoringBand = useCallback((band: CoreScoreBand) => {
    assertNotInRender('updateScoringBand');
    applySurveyUpdate(prev => {
      const existingBands = prev.scoreConfig?.scoreRanges || [];
      const idx = existingBands.findIndex((b) => b.id === band.id);
      const nextBands = idx >= 0
        ? existingBands.map((b, i) => i === idx ? band : b)
        : [...existingBands, band];
      return {
        ...prev,
        scoreConfig: normalizeScoringConfig({
          enabled: prev.scoreConfig?.enabled ?? false,
          categories: prev.scoreConfig?.categories || [],
          scoreRanges: nextBands,
          resultsScreen: prev.scoreConfig?.resultsScreen,
        }),
        updatedAt: new Date().toISOString(),
      };
    });
    setIsDirty(true);
    logBuilderMutation('updateScoringBand', band);
  }, [applySurveyUpdate]);

  // Delete a scoring band from scoreConfig
  const deleteScoringBand = useCallback((bandId: string) => {
    assertNotInRender('deleteScoringBand');
    applySurveyUpdate(prev => {
      const existingBands = prev.scoreConfig?.scoreRanges || [];
      return {
        ...prev,
        scoreConfig: normalizeScoringConfig({
          enabled: prev.scoreConfig?.enabled ?? false,
          categories: prev.scoreConfig?.categories || [],
          scoreRanges: existingBands.filter((b) => b.id !== bandId),
          resultsScreen: prev.scoreConfig?.resultsScreen,
        }),
        updatedAt: new Date().toISOString(),
      };
    });
    setIsDirty(true);
    logBuilderMutation('deleteScoringBand', { bandId });
  }, [applySurveyUpdate]);

  // ============================================
  // PANEL TOGGLES
  // ============================================

  const toggleLeftPanel = useCallback(() => setLeftPanelOpen(prev => !prev), []);
  const toggleRightPanel = useCallback(() => setRightPanelOpen(prev => !prev), []);

  // ============================================
  // API OPERATIONS
  // ============================================

  const exportToEvalia = useCallback(() => exportSurveyToEvalia(survey), [survey]);

  // [LOGIC-001] Validate survey before save/publish
  const validateSurvey = useCallback((): SurveyValidationResult => {
    const questions = survey.questions.map(q => ({
      ...q,
      logicRules: q.logicRules || [],
    }));
    return validateSurveyBeforePublish(questions as any, survey.scoreConfig ?? undefined);
  }, [survey]);

  const saveSurvey = useCallback(async (options?: { skipValidation?: boolean }): Promise<{ id: string | null; validation: SurveyValidationResult | null }> => {
    assertNotInRender('saveSurvey');
    
    // [QUESTION-PIPELINE] Check builder state question counts BEFORE calling builderToEvalia
    console.log("[QUESTION-PIPELINE] Builder state question counts", {
      surveyId: survey.id,
      builderQuestions: survey.questions?.length ?? 0,
      legacyQuestions: (survey as any).questions?.length ?? 0, // Check if there's a legacy field
      questionsField: survey.questions?.length ?? 0,
      questionsArray: survey.questions?.map(q => ({ id: q.id, type: q.type })) ?? [],
    });
    
    // [LOGIC-001] Run validation before save
    const validation = validateSurvey();
    
    if (import.meta.env.DEV) {
      console.log('[SurveyBuilder] Validation result:', {
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length,
        logicIssues: validation.logic.length,
        scoringIssues: validation.scoring.length,
      });
    }
    
    // Block save if there are errors (unless explicitly skipped)
    if (!options?.skipValidation && validation.errors.length > 0) {
      console.warn('[SurveyBuilder] Save blocked due to validation errors', validation.errors);
      console.log("[QUESTION-PIPELINE] Save BLOCKED by validation - questions were NOT sent to API");
      return { id: null, validation };
    }
    
    // Legacy integrity check (in addition to new validators)
    const report = checkSurveyIntegrity(survey);
    if (!report.isHealthy) {
      console.warn('[SurveyBuilder] Integrity warnings before save', report.issues);
    }
    
    // [QUESTION-PIPELINE] Just before calling builderToEvalia
    const evaliaData = exportToEvalia();
    
    // [QUESTION-PIPELINE] Check payload questions length AFTER builderToEvalia
    console.log("[QUESTION-PIPELINE] Payload questions length", {
      surveyId: survey.id,
      payloadQuestionsLength: evaliaData.questions?.length ?? 0,
      payloadQuestions: evaliaData.questions?.map((q: any) => ({ id: q.id, type: q.type, question: q.question?.substring(0, 50) })) ?? [],
      hasQuestions: !!evaliaData.questions,
      questionsIsArray: Array.isArray(evaliaData.questions),
    });
    
    try {
      const result = await saveMutation.mutateAsync(evaliaData);
      return { id: result.id, validation };
    } catch {
      return { id: null, validation };
    }
  }, [exportToEvalia, saveMutation, survey, validateSurvey]);

  const loadSurvey = useCallback((id: string) => {
    // Trigger refetch by invalidating query
    queryClient.invalidateQueries({ queryKey: ['/api/surveys', id] });
  }, [queryClient]);

  const undo = useCallback(() => {
    setHistory((state) => {
      const prev = state.undo[state.undo.length - 1];
      if (!prev) return state;
      applySurveyUpdate(() => prev, false);
      return { undo: state.undo.slice(0, -1), redo: [survey, ...state.redo] };
    });
  }, [applySurveyUpdate, survey]);

  const redo = useCallback(() => {
    setHistory((state) => {
      const next = state.redo[0];
      if (!next) return state;
      applySurveyUpdate(() => next, false);
      return { undo: [...state.undo, survey], redo: state.redo.slice(1) };
    });
  }, [applySurveyUpdate, survey]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  // [SCORING-PIPELINE] Context value memoization - exposes scoreConfig to consumers
  const value = useMemo<SurveyBuilderContextType>(() => {
    markRenderStart();
    try {
      // [SCORING-PIPELINE] Derive scoreConfig for context consumers
      // Note: Using non-null assertion because EMPTY_SCORE_CONFIG is always defined
      const scoreConfig = (survey.scoreConfig || EMPTY_SCORE_CONFIG)!;
      const exposedCats = (scoreConfig.categories || []).length;
      const exposedBands = (scoreConfig.scoreRanges || []).length;
      
      // [SCORING-PIPELINE] Debug logging for context value
      // eslint-disable-next-line no-console
      console.log('[SCORING-PIPELINE] Context exposing scoreConfig', {
        surveyId: survey.id,
        enabled: scoreConfig.enabled,
        categoriesCount: exposedCats,
        bandsCount: exposedBands,
      });
      
      // [SCORING-PIPELINE] GUARD: Detect if enabled scoring has empty data
      if (scoreConfig.enabled && (exposedCats === 0 || exposedBands === 0)) {
        console.warn('[SCORING-PIPELINE] Context exposing enabled scoring with empty data!', {
          surveyId: survey.id,
          categoriesCount: exposedCats,
          bandsCount: exposedBands,
        });
      }
      return {
        survey,
        questions: survey.questions,
        scoreConfig,
        isDirty,
        isLoading,
        isSaving: saveMutation.isPending,
        loadError,
        
        // Scoring state (derived)
        scoringByQuestionId,
        scoringCategories,
        scoringBands,
        
        addQuestion,
        removeQuestion,
        reorderQuestions,
        updateQuestion,
        
        // Scoring operations
        setQuestionScoring,
        updateScoringCategory,
        updateScoringBand,
        deleteScoringBand,
        
        selectedQuestionId,
        setSelectedQuestionId,
        selectedSection,
        setSelectedSection,
        
        updateWelcomeScreen,
        updateThankYouScreen,
        updateScoringSettings,
        updateScoreConfig,
        updateSurveyMetadata,
        updateSurveyBody,
        undo,
        redo,
        canUndo: history.undo.length > 0,
        canRedo: history.redo.length > 0,
        
        leftPanelOpen,
        rightPanelOpen,
        toggleLeftPanel,
        toggleRightPanel,
        
        saveSurvey,
        validateSurvey,
        loadSurvey,
        exportToEvalia,
        addLogicRule,
        updateLogicRule,
        deleteLogicRule,
      };
    } finally {
      markRenderEnd();
    }
  }, [
    survey,
    isDirty,
    isLoading,
    saveMutation.isPending,
    scoringByQuestionId,
    scoringCategories,
    scoringBands,
    addQuestion,
    removeQuestion,
    reorderQuestions,
    updateQuestion,
    setQuestionScoring,
    updateScoringCategory,
    updateScoringBand,
    deleteScoringBand,
    selectedQuestionId,
    selectedSection,
    leftPanelOpen,
    rightPanelOpen,
    updateWelcomeScreen,
    updateThankYouScreen,
    updateScoringSettings,
    updateScoreConfig,
    updateSurveyMetadata,
    updateSurveyBody,
    undo,
    redo,
    history.undo.length,
    history.redo.length,
    toggleLeftPanel,
    toggleRightPanel,
    saveSurvey,
    validateSurvey,
    loadSurvey,
    exportToEvalia,
    addLogicRule,
    updateLogicRule,
    deleteLogicRule,
    loadError,
  ]);

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
