/**
 * SURVEY PATTERN CONTRACTS
 *
 * TypeScript types + Zod schemas for:
 * - Answer shapes per question type
 * - Logic condition operators
 * - Scoring configurations
 * - QA test survey patterns
 *
 * IMPORTANT: When adding a new QuestionType, update ALL registries:
 * - ANSWER_SHAPES
 * - VALID_OPERATORS_BY_TYPE
 * - SCORING_MODE_BY_TYPE
 * - Run `assertRegistriesInSync()` in tests
 */

import { z } from 'zod';
import type { QuestionType, Question } from '@shared/schema';

// ═══════════════════════════════════════════════════════════════════════════════
// ANSWER SHAPE CONTRACTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Text input answers - simple string, nullable for unanswered
 */
export const textAnswerSchema = z.string().nullable();
export type TextAnswer = z.infer<typeof textAnswerSchema>;

/**
 * Number answers - numeric value, nullable for unanswered
 * NOTE: min/max validation is dynamic based on question config
 */
export const numberAnswerSchema = z.number().nullable();
export type NumberAnswer = z.infer<typeof numberAnswerSchema>;

/**
 * Boolean answers (yes_no, legal consent)
 * true = yes/accepted, false = no/declined, null = unanswered
 */
export const booleanAnswerSchema = z.boolean().nullable();
export type BooleanAnswer = z.infer<typeof booleanAnswerSchema>;

/**
 * Single selection answers (multiple_choice, dropdown)
 * Stores the selected option value as string
 */
export const singleSelectAnswerSchema = z.string().nullable();
export type SingleSelectAnswer = z.infer<typeof singleSelectAnswerSchema>;

/**
 * Multi-selection answers (checkbox)
 * Empty array = explicitly selected nothing, null = unanswered
 */
export const multiSelectAnswerSchema = z.array(z.string()).nullable();
export type MultiSelectAnswer = z.infer<typeof multiSelectAnswerSchema>;

/**
 * Rating answers - integer value
 * NOTE: Actual min/max depends on question config (ratingScale, likertPoints, etc.)
 * Use getRatingSchema() for per-question validation
 */
export const ratingAnswerSchema = z.number().int().nullable();
export type RatingAnswer = z.infer<typeof ratingAnswerSchema>;

/**
 * Slider answers - decimal value within range
 * NOTE: min/max/step validation is dynamic based on question config
 */
export const sliderAnswerSchema = z.number().nullable();
export type SliderAnswer = z.infer<typeof sliderAnswerSchema>;

/**
 * NPS answers - 0-10 integer scale
 */
export const npsAnswerSchema = z.number().int().min(0).max(10).nullable();
export type NpsAnswer = z.infer<typeof npsAnswerSchema>;

/**
 * Matrix answers - map of row -> column selection(s)
 * Format: { "row_id": "col_value" } for radio
 * Format: { "row_id": ["col1", "col2"] } for checkbox
 */
export const matrixRadioAnswerSchema = z.record(z.string(), z.string()).nullable();
export const matrixCheckboxAnswerSchema = z.record(z.string(), z.array(z.string())).nullable();
export type MatrixRadioAnswer = z.infer<typeof matrixRadioAnswerSchema>;
export type MatrixCheckboxAnswer = z.infer<typeof matrixCheckboxAnswerSchema>;

/**
 * Ranking answers - ordered array of option values (first = highest rank)
 */
export const rankingAnswerSchema = z.array(z.string()).nullable();
export type RankingAnswer = z.infer<typeof rankingAnswerSchema>;

/**
 * Constant sum answers - map of option -> allocated points
 * Sum should equal question.totalPoints
 */
export const constantSumAnswerSchema = z.record(z.string(), z.number()).nullable();
export type ConstantSumAnswer = z.infer<typeof constantSumAnswerSchema>;

/**
 * Date/time answers - ISO string formats
 */
export const dateAnswerSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable();
export const timeAnswerSchema = z.string().regex(/^\d{2}:\d{2}$/).nullable();
export const datetimeAnswerSchema = z.string().datetime().nullable();
export type DateAnswer = z.infer<typeof dateAnswerSchema>;
export type TimeAnswer = z.infer<typeof timeAnswerSchema>;
export type DateTimeAnswer = z.infer<typeof datetimeAnswerSchema>;

/**
 * File upload answers - array of file metadata
 */
export const fileUploadAnswerSchema = z.array(z.object({
  name: z.string(),
  url: z.string().url(),
  size: z.number().nonnegative(),
  type: z.string().optional(),
})).nullable();
export type FileUploadAnswer = z.infer<typeof fileUploadAnswerSchema>;

/**
 * Signature answer - base64 data URL
 */
export const signatureAnswerSchema = z.string().startsWith('data:image/').nullable();
export type SignatureAnswer = z.infer<typeof signatureAnswerSchema>;

/**
 * Structural types - no answer stored
 */
export const noAnswerSchema = z.null();
export type NoAnswer = z.infer<typeof noAnswerSchema>;

/**
 * Image choice - single or multi depending on selectionType
 */
export const imageChoiceAnswerSchema = z.union([
  z.string().nullable(),
  z.array(z.string()).nullable(),
]);
export type ImageChoiceAnswer = z.infer<typeof imageChoiceAnswerSchema>;

/**
 * Matrix union - radio or checkbox depending on matrixType
 */
export const matrixAnswerSchema = z.union([
  matrixRadioAnswerSchema,
  matrixCheckboxAnswerSchema,
]);
export type MatrixAnswer = z.infer<typeof matrixAnswerSchema>;

/**
 * Map question type to expected answer shape
 */
export const ANSWER_SHAPES: Record<QuestionType, z.ZodTypeAny> = {
  // Text inputs -> string | null
  text: textAnswerSchema,
  textarea: textAnswerSchema,
  email: textAnswerSchema,
  phone: textAnswerSchema,
  url: textAnswerSchema,

  // Numeric inputs -> number | null
  number: numberAnswerSchema,

  // Boolean inputs -> boolean | null
  yes_no: booleanAnswerSchema,
  legal: booleanAnswerSchema,

  // Single selection -> string | null
  multiple_choice: singleSelectAnswerSchema,
  dropdown: singleSelectAnswerSchema,
  image_choice: imageChoiceAnswerSchema, // string | string[] depending on selectionType

  // Multi-selection -> string[] | null
  checkbox: multiSelectAnswerSchema,

  // Rating/scale -> number | null (actual range is config-dependent)
  rating: ratingAnswerSchema,
  nps: npsAnswerSchema,
  likert: ratingAnswerSchema,
  opinion_scale: ratingAnswerSchema,
  slider: sliderAnswerSchema,
  emoji_rating: ratingAnswerSchema,

  // Advanced types
  matrix: matrixAnswerSchema,
  ranking: rankingAnswerSchema,
  constant_sum: constantSumAnswerSchema,
  // calculation: read-only, derived from other answers, not user-input
  calculation: numberAnswerSchema,

  // Date/time
  date: dateAnswerSchema,
  time: timeAnswerSchema,
  datetime: datetimeAnswerSchema,

  // Media
  file_upload: fileUploadAnswerSchema,
  signature: signatureAnswerSchema,
  video: textAnswerSchema, // URL or embed code
  audio_capture: textAnswerSchema, // URL to audio file

  // Structural (no answer stored)
  section: noAnswerSchema,
  statement: noAnswerSchema,

  // Hidden field - stores string value set programmatically
  hidden: textAnswerSchema,
};

/**
 * Exhaustive union of ALL answer types
 * Generated from ANSWER_SHAPES for guaranteed sync
 */
export const answerValueSchema = z.union([
  textAnswerSchema,
  numberAnswerSchema,
  booleanAnswerSchema,
  singleSelectAnswerSchema,
  multiSelectAnswerSchema,
  ratingAnswerSchema,
  npsAnswerSchema,
  sliderAnswerSchema,
  matrixRadioAnswerSchema,
  matrixCheckboxAnswerSchema,
  rankingAnswerSchema,
  constantSumAnswerSchema,
  dateAnswerSchema,
  timeAnswerSchema,
  datetimeAnswerSchema,
  fileUploadAnswerSchema,
  signatureAnswerSchema,
  noAnswerSchema,
]);
export type AnswerValue = z.infer<typeof answerValueSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// DYNAMIC VALIDATION FACTORIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build a Zod schema for rating-type questions based on config
 */
export function getRatingSchema(question: Question & { type: 'rating' | 'likert' | 'opinion_scale' | 'emoji_rating' }) {
  const min = 1;
  const max = question.ratingScale ?? question.likertPoints ?? 5;
  return z.number().int().min(min).max(max).nullable();
}

/**
 * Build a Zod schema for slider questions based on config
 */
export function getSliderSchema(question: Question & { type: 'slider' }) {
  const min = question.min ?? 0;
  const max = question.max ?? 100;
  const step = question.step ?? 1;
  // Allow values at step increments
  return z.number().min(min).max(max).nullable().refine(
    (val) => val === null || (val - min) % step === 0,
    { message: `Value must be in increments of ${step}` }
  );
}

/**
 * Build a Zod schema for constant_sum questions based on config
 */
export function getConstantSumSchema(question: Question & { type: 'constant_sum' }) {
  const total = question.totalPoints ?? 100;
  return constantSumAnswerSchema.refine(
    (val) => {
      if (val === null) return true;
      const sum = Object.values(val).reduce((a, b) => a + b, 0);
      return sum === total;
    },
    { message: `Values must sum to exactly ${total}` }
  );
}

/**
 * Build a Zod schema for checkbox questions based on config
 */
export function getCheckboxSchema(question: Question & { type: 'checkbox' }) {
  let schema = multiSelectAnswerSchema;
  if (question.minSelections) {
    schema = schema.refine(
      (val) => val === null || val.length >= question.minSelections!,
      { message: `Select at least ${question.minSelections} options` }
    ) as typeof schema;
  }
  if (question.maxSelections) {
    schema = schema.refine(
      (val) => val === null || val.length <= question.maxSelections!,
      { message: `Select at most ${question.maxSelections} options` }
    ) as typeof schema;
  }
  return schema;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIC CONDITION CONTRACTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Core logic operators - minimal set for clarity
 *
 * Scalar operators: answered, equals, gt, lt, between
 * Array operators: includes_any, includes_all
 * Boolean operators: is_true, is_false
 */
export const LogicOperator = {
  // Universal
  ANSWERED: 'answered',
  NOT_ANSWERED: 'not_answered',

  // Scalar comparison (string, number)
  EQUALS: 'equals',
  NOT_EQUALS: 'not_equals',
  GREATER_THAN: 'gt',
  LESS_THAN: 'lt',
  GREATER_THAN_OR_EQUAL: 'gte',
  LESS_THAN_OR_EQUAL: 'lte',
  BETWEEN: 'between',

  // String-specific
  CONTAINS: 'contains',

  // Array membership (for multi-select or "is one of")
  INCLUDES_ANY: 'includes_any', // answer includes at least one of values
  INCLUDES_ALL: 'includes_all', // answer includes all of values

  // Boolean-specific (for yes_no, legal)
  IS_TRUE: 'is_true',
  IS_FALSE: 'is_false',
} as const;

export type LogicOperatorType = typeof LogicOperator[keyof typeof LogicOperator];

export const logicOperatorSchema = z.enum([
  'answered', 'not_answered',
  'equals', 'not_equals',
  'gt', 'lt', 'gte', 'lte', 'between',
  'contains',
  'includes_any', 'includes_all',
  'is_true', 'is_false',
]);

/**
 * Unified logic condition schema
 * This replaces the legacy { questionId, answer } skipCondition format
 */
export const logicConditionSchema = z.object({
  questionId: z.string(),
  operator: logicOperatorSchema,
  // Value shape depends on operator:
  // - answered/not_answered/is_true/is_false: undefined
  // - equals/not_equals/gt/lt/gte/lte/contains: string | number
  // - between: { min, max }
  // - includes_any/includes_all: string[]
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.object({ min: z.number(), max: z.number() }),
  ]).optional(),
});

export type LogicCondition = z.infer<typeof logicConditionSchema>;

/**
 * Logic action types
 */
export const logicActionSchema = z.enum(['skip', 'show', 'end', 'jump']);
export type LogicAction = z.infer<typeof logicActionSchema>;

/**
 * Full logic rule with conditions and action
 */
export const logicRuleSchema = z.object({
  id: z.string(),
  conditions: z.array(logicConditionSchema).min(1),
  conditionLogic: z.enum(['and', 'or']).default('and'),
  action: logicActionSchema,
  targetQuestionId: z.string().optional(), // required for 'jump', 'show'
});

export type LogicRule = z.infer<typeof logicRuleSchema>;

/**
 * Legacy skipCondition converter
 * Converts { questionId, answer } to LogicCondition format
 */
export function convertLegacySkipCondition(
  skipCondition: { questionId: string; answer: string }
): LogicCondition {
  return {
    questionId: skipCondition.questionId,
    operator: 'equals',
    value: skipCondition.answer,
  };
}

/**
 * Operators valid for each question type
 */
export const VALID_OPERATORS_BY_TYPE: Record<QuestionType, LogicOperatorType[]> = {
  // Text inputs - string comparisons
  text: ['answered', 'not_answered', 'equals', 'not_equals', 'contains'],
  textarea: ['answered', 'not_answered', 'equals', 'not_equals', 'contains'],
  email: ['answered', 'not_answered', 'equals', 'not_equals', 'contains'],
  phone: ['answered', 'not_answered', 'equals', 'not_equals'],
  url: ['answered', 'not_answered', 'equals', 'not_equals'],

  // Numeric - full numeric comparison set
  number: ['answered', 'not_answered', 'equals', 'not_equals', 'gt', 'lt', 'gte', 'lte', 'between'],

  // Boolean types - boolean operators only
  yes_no: ['answered', 'not_answered', 'is_true', 'is_false'],
  legal: ['answered', 'not_answered', 'is_true', 'is_false'],

  // Single selection - equality + membership
  multiple_choice: ['answered', 'not_answered', 'equals', 'not_equals', 'includes_any'],
  dropdown: ['answered', 'not_answered', 'equals', 'not_equals', 'includes_any'],
  image_choice: ['answered', 'not_answered', 'equals', 'not_equals', 'includes_any'],

  // Multi-selection - array operators
  checkbox: ['answered', 'not_answered', 'includes_all', 'includes_any'],

  // Rating/scale - numeric operators
  rating: ['answered', 'not_answered', 'equals', 'not_equals', 'gt', 'lt', 'gte', 'lte', 'between'],
  nps: ['answered', 'not_answered', 'equals', 'not_equals', 'gt', 'lt', 'gte', 'lte', 'between'],
  likert: ['answered', 'not_answered', 'equals', 'not_equals', 'gt', 'lt', 'gte', 'lte'],
  opinion_scale: ['answered', 'not_answered', 'equals', 'not_equals', 'gt', 'lt', 'gte', 'lte', 'between'],
  slider: ['answered', 'not_answered', 'gt', 'lt', 'gte', 'lte', 'between'],
  emoji_rating: ['answered', 'not_answered', 'equals', 'not_equals', 'gt', 'lt'],

  // Advanced types - limited operators
  matrix: ['answered', 'not_answered'], // Row-level conditions need separate handling
  ranking: ['answered', 'not_answered'], // Position-based checks need separate handling
  constant_sum: ['answered', 'not_answered'],
  calculation: ['equals', 'not_equals', 'gt', 'lt', 'gte', 'lte', 'between'],

  // Date/time - temporal comparison
  date: ['answered', 'not_answered', 'equals', 'not_equals', 'gt', 'lt', 'between'],
  time: ['answered', 'not_answered', 'equals', 'not_equals'],
  datetime: ['answered', 'not_answered', 'equals', 'not_equals', 'gt', 'lt', 'between'],

  // Media - existence only
  file_upload: ['answered', 'not_answered'],
  signature: ['answered', 'not_answered'],
  video: ['answered', 'not_answered'],
  audio_capture: ['answered', 'not_answered'],

  // Structural - no logic
  section: [],
  statement: [],

  // Hidden - string comparison (for routing based on hidden params)
  hidden: ['equals', 'not_equals', 'contains', 'includes_any'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCORING CONTRACTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Scoring modes by question type
 *
 * none: Not scorable
 * numeric_direct: Use answer value directly (rating, slider, number)
 * position_mapped: Map option position to score (multiple_choice, dropdown)
 * count: Score by number of selections (checkbox)
 * nps: NPS-specific bands (detractor/passive/promoter)
 * custom: Requires optionScores mapping (image_choice with custom values)
 * matrix_sum: Sum of row scores
 * ranking_weighted: Weighted by rank position
 */
export const ScoringMode = {
  NONE: 'none',
  NUMERIC_DIRECT: 'numeric_direct',
  POSITION_MAPPED: 'position_mapped',
  COUNT: 'count',
  NPS: 'nps',
  CUSTOM: 'custom',
  MATRIX_SUM: 'matrix_sum',
  RANKING_WEIGHTED: 'ranking_weighted',
  CONSTANT_SUM_TOTAL: 'constant_sum_total',
} as const;

export type ScoringModeType = typeof ScoringMode[keyof typeof ScoringMode];

export const SCORING_MODE_BY_TYPE: Record<QuestionType, ScoringModeType> = {
  // Numeric direct
  rating: 'numeric_direct',
  likert: 'numeric_direct',
  opinion_scale: 'numeric_direct',
  slider: 'numeric_direct',
  emoji_rating: 'numeric_direct',
  number: 'numeric_direct',

  // NPS special handling
  nps: 'nps',

  // Position mapped (option index -> score)
  multiple_choice: 'position_mapped',
  dropdown: 'position_mapped',

  // Count selections
  checkbox: 'count',

  // Custom mapping required
  image_choice: 'custom',
  yes_no: 'custom', // true -> X points, false -> Y points

  // Complex types
  matrix: 'matrix_sum',
  ranking: 'ranking_weighted',
  constant_sum: 'constant_sum_total',

  // Not scorable
  text: 'none',
  textarea: 'none',
  email: 'none',
  phone: 'none',
  url: 'none',
  date: 'none',
  time: 'none',
  datetime: 'none',
  file_upload: 'none',
  signature: 'none',
  video: 'none',
  audio_capture: 'none',
  section: 'none',
  statement: 'none',
  legal: 'none',
  hidden: 'none',
  calculation: 'none', // Derived, not directly scored
};

/**
 * NPS band definitions
 */
export const NPS_BANDS = {
  DETRACTOR: { min: 0, max: 6, label: 'Detractor' },
  PASSIVE: { min: 7, max: 8, label: 'Passive' },
  PROMOTER: { min: 9, max: 10, label: 'Promoter' },
} as const;

export function getNpsBand(score: number): keyof typeof NPS_BANDS {
  if (score <= 6) return 'DETRACTOR';
  if (score <= 8) return 'PASSIVE';
  return 'PROMOTER';
}

/**
 * Score value schema
 */
export const scoreValueSchema = z.object({
  raw: z.number(),
  normalized: z.number().min(0).max(100),
  maxPossible: z.number(),
});

export type ScoreValue = z.infer<typeof scoreValueSchema>;

/**
 * Category score schema
 */
export const categoryScoreSchema = z.object({
  categoryId: z.string(),
  categoryName: z.string(),
  score: z.number(),
  maxScore: z.number(),
  percentage: z.number().min(0).max(100),
  interpretation: z.string().optional(),
});

export type CategoryScore = z.infer<typeof categoryScoreSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// QA TEST SURVEY PATTERN CONTRACTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * 7.1 Minimal Contract Test Survey
 * Tests: answer shapes, basic logic (answered, equals), scoring on rating + MC
 */
export const minimalTestSurveySchema = z.object({
  questions: z.tuple([
    z.object({ type: z.literal('text') }).passthrough(),
    z.object({ type: z.literal('multiple_choice') }).passthrough(),
    z.object({ type: z.literal('rating') }).passthrough(),
  ]),
});

export const minimalTestSurveyQuestions: Partial<Question>[] = [
  {
    id: 'min-1',
    type: 'text',
    question: 'What is your name?',
    required: true,
    placeholder: 'Enter your name',
  },
  {
    id: 'min-2',
    type: 'multiple_choice',
    question: 'How did you hear about us?',
    options: ['Search', 'Social Media', 'Referral', 'Other'],
    required: true,
    scoringCategory: 'engagement',
  },
  {
    id: 'min-3',
    type: 'rating',
    question: 'How would you rate your experience?',
    ratingScale: 5,
    ratingStyle: 'star',
    required: true,
    scoringCategory: 'satisfaction',
    // Using unified LogicRule format instead of legacy skipCondition
  },
];

// Logic rule for minimal test survey (skip Q3 if Q2 = "Other")
export const minimalTestSurveyLogic: LogicRule[] = [
  {
    id: 'min-rule-1',
    conditions: [{
      questionId: 'min-2',
      operator: 'equals',
      value: 'Other',
    }],
    conditionLogic: 'and',
    action: 'skip',
    targetQuestionId: 'min-3',
  },
];

/**
 * 7.2 Full Coverage Test Survey
 * One of each question type, mix of required/optional, skip logic variants
 */
export const fullCoverageTestSurveyTypes: QuestionType[] = [
  // Text inputs
  'text', 'textarea', 'email', 'phone', 'url', 'number',
  // Selection
  'multiple_choice', 'checkbox', 'dropdown', 'image_choice', 'yes_no',
  // Rating
  'rating', 'nps', 'likert', 'opinion_scale', 'slider', 'emoji_rating',
  // Advanced
  'matrix', 'ranking', 'constant_sum', 'calculation',
  // Date/time
  'date', 'time', 'datetime',
  // Media
  'file_upload', 'signature',
  // Structural
  'section', 'statement', 'legal',
  // Special
  'hidden',
];

export const fullCoverageTestSurveySchema = z.object({
  questions: z.array(z.object({ type: z.enum([
    'text', 'textarea', 'email', 'phone', 'url', 'number',
    'multiple_choice', 'checkbox', 'dropdown', 'image_choice', 'yes_no',
    'rating', 'nps', 'likert', 'opinion_scale', 'slider', 'emoji_rating',
    'matrix', 'ranking', 'constant_sum', 'calculation',
    'date', 'time', 'datetime',
    'file_upload', 'signature', 'video', 'audio_capture',
    'section', 'statement', 'legal', 'hidden',
  ]) }).passthrough()),
}).refine(
  (survey) => {
    const types = new Set(survey.questions.map(q => q.type));
    return fullCoverageTestSurveyTypes.every(t => types.has(t));
  },
  { message: 'Survey must include all question types' }
);

/**
 * 7.3 Edge Case Test Survey
 * Tests boundary conditions and stress scenarios
 */
export const edgeCaseTestSurveyQuestions: Partial<Question>[] = [
  {
    id: 'edge-1',
    type: 'multiple_choice',
    question: 'This is a very long question text that tests how the UI handles extended question content. It might wrap multiple lines and should remain readable and properly styled throughout the entire survey experience. Select your preferred option from the extensive list below.',
    options: Array.from({ length: 25 }, (_, i) => `Option ${i + 1}: This is a longer label to test text wrapping`),
    required: true,
  },
  {
    id: 'edge-2',
    type: 'matrix',
    question: 'Rate each aspect (5x5 matrix)',
    rowLabels: ['Quality', 'Value', 'Service', 'Speed', 'Reliability'],
    colLabels: ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'],
    matrixType: 'radio',
    required: true,
  },
  {
    id: 'edge-3',
    type: 'slider',
    question: 'Select a precise value (decimals allowed)',
    min: 0,
    max: 10,
    step: 0.1,
    showValue: true,
    unit: 'points',
  },
  {
    id: 'edge-4',
    type: 'constant_sum',
    question: 'Distribute exactly 100 points (no tolerance)',
    options: ['Category A', 'Category B', 'Category C', 'Category D'],
    totalPoints: 100,
    showPercentage: true,
  },
];

export const edgeCaseTestSurveySchema = z.object({
  questions: z.array(z.any()),
}).refine(
  (survey) => survey.questions.some(q => q.options?.length >= 20),
  { message: 'Must have at least one question with 20+ options' }
).refine(
  (survey) => survey.questions.some(q =>
    q.type === 'matrix' &&
    q.rowLabels?.length >= 5 &&
    q.colLabels?.length >= 5
  ),
  { message: 'Must have at least one 5x5 matrix' }
).refine(
  (survey) => survey.questions.some(q =>
    q.type === 'slider' &&
    q.step !== undefined &&
    q.step < 1
  ),
  { message: 'Must have at least one slider with decimal steps' }
);

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validate an answer against its question type (static schema)
 * For dynamic validation (with question config), use the factory functions
 */
export function validateAnswer(question: Question, answer: unknown): boolean {
  const schema = ANSWER_SHAPES[question.type];
  if (!schema) return false;

  const result = schema.safeParse(answer);
  return result.success;
}

/**
 * Get dynamic validation schema for a question based on its config
 */
export function getQuestionAnswerSchema(question: Question): z.ZodTypeAny {
  switch (question.type) {
    case 'rating':
    case 'likert':
    case 'opinion_scale':
    case 'emoji_rating':
      return getRatingSchema(question as Question & { type: 'rating' });
    case 'slider':
      return getSliderSchema(question as Question & { type: 'slider' });
    case 'constant_sum':
      return getConstantSumSchema(question as Question & { type: 'constant_sum' });
    case 'checkbox':
      return getCheckboxSchema(question as Question & { type: 'checkbox' });
    default:
      return ANSWER_SHAPES[question.type] ?? z.unknown();
  }
}

/**
 * Check if a logic operator is valid for a question type
 */
export function isValidOperator(questionType: QuestionType, operator: LogicOperatorType): boolean {
  const validOps = VALID_OPERATORS_BY_TYPE[questionType];
  return validOps?.includes(operator) ?? false;
}

/**
 * Check if a question type is scorable
 */
export function isScorableType(questionType: QuestionType): boolean {
  return SCORING_MODE_BY_TYPE[questionType] !== 'none';
}

/**
 * Get scoring mode for a question type
 */
export function getScoringMode(questionType: QuestionType): ScoringModeType {
  return SCORING_MODE_BY_TYPE[questionType];
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRY SYNC ASSERTIONS (for tests)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * All question types from schema - import and use in tests
 */
export const ALL_QUESTION_TYPES: QuestionType[] = [
  'text', 'textarea', 'email', 'phone', 'url', 'number',
  'multiple_choice', 'checkbox', 'dropdown', 'image_choice', 'yes_no',
  'rating', 'nps', 'likert', 'opinion_scale', 'slider', 'emoji_rating',
  'matrix', 'ranking', 'constant_sum', 'calculation',
  'date', 'time', 'datetime',
  'file_upload', 'signature', 'video', 'audio_capture',
  'section', 'statement', 'legal', 'hidden',
];

/**
 * Assert all registries are in sync with QuestionType
 * Run this in your test suite
 */
export function assertRegistriesInSync(): void {
  const answerShapeKeys = Object.keys(ANSWER_SHAPES).sort();
  const operatorKeys = Object.keys(VALID_OPERATORS_BY_TYPE).sort();
  const scoringKeys = Object.keys(SCORING_MODE_BY_TYPE).sort();
  const allTypes = [...ALL_QUESTION_TYPES].sort();

  const errors: string[] = [];

  if (JSON.stringify(answerShapeKeys) !== JSON.stringify(allTypes)) {
    const missing = allTypes.filter(t => !answerShapeKeys.includes(t));
    const extra = answerShapeKeys.filter(t => !allTypes.includes(t as QuestionType));
    if (missing.length) errors.push(`ANSWER_SHAPES missing: ${missing.join(', ')}`);
    if (extra.length) errors.push(`ANSWER_SHAPES extra: ${extra.join(', ')}`);
  }

  if (JSON.stringify(operatorKeys) !== JSON.stringify(allTypes)) {
    const missing = allTypes.filter(t => !operatorKeys.includes(t));
    const extra = operatorKeys.filter(t => !allTypes.includes(t as QuestionType));
    if (missing.length) errors.push(`VALID_OPERATORS_BY_TYPE missing: ${missing.join(', ')}`);
    if (extra.length) errors.push(`VALID_OPERATORS_BY_TYPE extra: ${extra.join(', ')}`);
  }

  if (JSON.stringify(scoringKeys) !== JSON.stringify(allTypes)) {
    const missing = allTypes.filter(t => !scoringKeys.includes(t));
    const extra = scoringKeys.filter(t => !allTypes.includes(t as QuestionType));
    if (missing.length) errors.push(`SCORING_MODE_BY_TYPE missing: ${missing.join(', ')}`);
    if (extra.length) errors.push(`SCORING_MODE_BY_TYPE extra: ${extra.join(', ')}`);
  }

  if (errors.length > 0) {
    throw new Error(`Registry sync errors:\n${errors.join('\n')}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRY EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const SurveyPatternRegistry = {
  // Answer shapes
  answerShapes: ANSWER_SHAPES,
  getQuestionAnswerSchema,

  // Logic
  validOperators: VALID_OPERATORS_BY_TYPE,
  logicOperators: LogicOperator,
  convertLegacySkipCondition,

  // Scoring
  scoringModes: SCORING_MODE_BY_TYPE,
  npsBands: NPS_BANDS,
  getNpsBand,
  isScorableType,
  getScoringMode,

  // QA test patterns
  testSurveys: {
    minimal: {
      questions: minimalTestSurveyQuestions,
      logic: minimalTestSurveyLogic,
      schema: minimalTestSurveySchema,
    },
    fullCoverage: {
      types: fullCoverageTestSurveyTypes,
      schema: fullCoverageTestSurveySchema,
    },
    edgeCases: {
      questions: edgeCaseTestSurveyQuestions,
      schema: edgeCaseTestSurveySchema,
    },
  },

  // Validation
  validateAnswer,
  isValidOperator,
  assertRegistriesInSync,
} as const;

export default SurveyPatternRegistry;
