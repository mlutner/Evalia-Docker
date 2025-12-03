import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, boolean, timestamp, integer, index, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (compatible with Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  resendApiKey: varchar("resend_api_key"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Survey type
export type SurveyType = "survey" | "assessment";

// Question types - comprehensive list based on survey platform research
export type QuestionType = 
  // Text inputs
  | "text" | "textarea" | "email" | "phone" | "url" | "number"
  // Selection
  | "multiple_choice" | "checkbox" | "dropdown" | "image_choice" | "yes_no"
  // Rating & scales
  | "rating" | "nps" | "likert" | "opinion_scale" | "slider" | "emoji_rating"
  // Advanced
  | "matrix" | "ranking" | "constant_sum" | "calculation"
  // Date & time
  | "date" | "time" | "datetime"
  // Media
  | "file_upload" | "signature" | "video" | "audio_capture"
  // Structural
  | "section" | "statement" | "legal"
  // Special
  | "hidden";

// All question types as array for validation
const QUESTION_TYPES = [
  "text", "textarea", "email", "phone", "url", "number",
  "multiple_choice", "checkbox", "dropdown", "image_choice", "yes_no",
  "rating", "nps", "likert", "opinion_scale", "slider", "emoji_rating",
  "matrix", "ranking", "constant_sum", "calculation",
  "date", "time", "datetime",
  "file_upload", "signature", "video", "audio_capture",
  "section", "statement", "legal",
  "hidden"
] as const;

export const skipConditionSchema = z.object({
  questionId: z.string(),
  answer: z.string(),
}).optional();

// Image option for image_choice questions
export const imageOptionSchema = z.object({
  imageUrl: z.string(),
  label: z.string().optional(),
  value: z.string().optional(),
});

export const questionSchema = z.object({
  id: z.string(),
  type: z.enum(QUESTION_TYPES),
  question: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  
  // === TEXT INPUT OPTIONS ===
  placeholder: z.string().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  validationPattern: z.string().optional(), // regex pattern
  rows: z.number().optional(), // for textarea
  
  // === SELECTION OPTIONS ===
  options: z.array(z.string()).optional(), // for multiple_choice, checkbox, dropdown, ranking
  displayStyle: z.enum([
    "radio", "cards", "dropdown",  // multiple_choice
    "checkbox",                     // checkbox
    "toggle", "buttons", "icons",   // yes_no
    "drag", "number",               // ranking
    "horizontal", "vertical"        // likert
  ]).optional(),
  allowOther: z.boolean().optional(), // adds "Other" option with text input
  randomizeOptions: z.boolean().optional(),
  optionImages: z.array(z.string()).optional(), // image URLs for options
  minSelections: z.number().optional(), // for checkbox
  maxSelections: z.number().optional(), // for checkbox
  
  // === IMAGE CHOICE OPTIONS ===
  imageOptions: z.array(imageOptionSchema).optional(),
  selectionType: z.enum(["single", "multiple"]).optional(),
  imageSize: z.enum(["small", "medium", "large"]).optional(),
  showLabels: z.boolean().optional(),
  columns: z.number().optional(), // 2, 3, or 4
  
  // === RATING OPTIONS ===
  ratingScale: z.number().optional(), // 3, 5, 7, or 10 (default: 5)
  ratingStyle: z.enum(["star", "number", "emoji", "heart", "thumb", "slider"]).optional(),
  ratingLabels: z.object({
    low: z.string().optional(),
    mid: z.string().optional(),
    high: z.string().optional(),
  }).optional(),
  showLabelsOnly: z.boolean().optional(), // hide numbers, show only labels
  
  // === NPS OPTIONS ===
  npsLabels: z.object({
    detractor: z.string().optional(), // Label for 0 end (default: "Not likely")
    promoter: z.string().optional(),  // Label for 10 end (default: "Extremely likely")
  }).optional(),
  
  // === LIKERT OPTIONS ===
  likertType: z.enum(["agreement", "frequency", "importance", "satisfaction", "quality"]).optional(),
  likertPoints: z.number().optional(), // 5 or 7
  showNeutral: z.boolean().optional(),
  customLabels: z.array(z.string()).optional(), // override default labels
  
  // === SLIDER OPTIONS ===
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  defaultValue: z.number().optional(),
  showValue: z.boolean().optional(),
  unit: z.string().optional(), // e.g., "%", "$", "years"
  
  // === OPINION SCALE (Semantic Differential) ===
  leftLabel: z.string().optional(), // e.g., "Cold"
  rightLabel: z.string().optional(), // e.g., "Hot"
  showNumbers: z.boolean().optional(),
  
  // === MATRIX OPTIONS ===
  rowLabels: z.array(z.string()).optional(),
  colLabels: z.array(z.string()).optional(),
  matrixType: z.enum(["radio", "checkbox", "text"]).optional(),
  randomizeRows: z.boolean().optional(),
  
  // === RANKING OPTIONS ===
  maxRankItems: z.number().optional(), // only rank top N
  
  // === CONSTANT SUM OPTIONS ===
  totalPoints: z.number().optional(), // e.g., 100
  showPercentage: z.boolean().optional(),
  
  // === DATE/TIME OPTIONS ===
  dateFormat: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]).optional(),
  minDate: z.string().optional(),
  maxDate: z.string().optional(),
  disablePastDates: z.boolean().optional(),
  disableFutureDates: z.boolean().optional(),
  timeFormat: z.enum(["12h", "24h"]).optional(),
  minuteStep: z.number().optional(), // 1, 5, 10, 15, 30
  
  // === FILE UPLOAD OPTIONS ===
  allowedTypes: z.array(z.string()).optional(), // e.g., ["pdf", "doc", "jpg"]
  maxFileSize: z.number().optional(), // in MB
  maxFiles: z.number().optional(),
  
  // === YES/NO OPTIONS ===
  yesLabel: z.string().optional(), // custom "Yes" label
  noLabel: z.string().optional(), // custom "No" label
  
  // === LEGAL OPTIONS ===
  linkUrl: z.string().optional(),
  linkText: z.string().optional(),
  
  // === SKIP LOGIC & SCORING ===
  skipCondition: skipConditionSchema,
  scoringCategory: z.string().optional(),
  sectionId: z.string().optional(),
  
  // === SCORING WEIGHTS (for advanced scoring) ===
  scoreWeight: z.number().optional(), // multiplier for this question's score
  optionScores: z.record(z.number()).optional(), // custom score per option value
});

export type Question = z.infer<typeof questionSchema>;

// Scoring configuration schema
export const scoringRuleSchema = z.object({
  category: z.string(),
  label: z.string(),
  minScore: z.number(),
  maxScore: z.number(),
  interpretation: z.string(),
});

export const feedbackTemplateSchema = z.object({
  level: z.enum(["low", "mid", "high"]),
  template: z.string(),
});

export const surveyScoreConfigSchema = z.object({
  enabled: z.boolean(),
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })),
  scoreRanges: z.array(scoringRuleSchema),
  resultsSummary: z.string().optional(),
  feedbackTemplates: z.array(feedbackTemplateSchema).optional(), // Customizable feedback for low/mid/high performance
}).optional();

export type ScoringRule = z.infer<typeof scoringRuleSchema>;
export type SurveyScoreConfig = z.infer<typeof surveyScoreConfigSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN SETTINGS SCHEMA - Stores all visual customization for surveys
// ═══════════════════════════════════════════════════════════════════════════════

export const backgroundSettingsSchema = z.object({
  url: z.string().optional(),
  overlayColor: z.string().optional(),
  overlayOpacity: z.number().optional(),
});

export const themeColorsSchema = z.object({
  primary: z.string(),
  accent: z.string().optional(),
  background: z.string(),
  text: z.string(),
  buttonText: z.string(),
});

export const welcomeScreenSettingsSchema = z.object({
  enabled: z.boolean(),
  title: z.string(),
  description: z.string().optional(),
  buttonText: z.string(),
  logoUrl: z.string().optional(),
  logoPosition: z.enum(['left', 'center', 'right']).optional(),
  logoSize: z.enum(['small', 'medium', 'large']).optional(),
  headerImage: z.string().optional(),
  backgroundImage: backgroundSettingsSchema.optional(),
  showTimeEstimate: z.boolean().optional(),
  showQuestionCount: z.boolean().optional(),
  privacyText: z.string().optional(),
  privacyLinkUrl: z.string().optional(),
  layout: z.enum(['centered', 'left-aligned', 'split-view']).optional(),
});

export const thankYouScreenSettingsSchema = z.object({
  enabled: z.boolean(),
  title: z.string(),
  message: z.string().optional(),
  buttonText: z.string().optional(),
  redirectUrl: z.string().optional(),
  showSocialShare: z.boolean().optional(),
  headerImage: z.string().optional(),
  backgroundImage: backgroundSettingsSchema.optional(),
});

export const surveyBodySettingsSchema = z.object({
  headerImage: z.string().optional(),
  backgroundImage: backgroundSettingsSchema.optional(),
  showProgressBar: z.boolean().optional(),
  showQuestionNumbers: z.boolean().optional(),
  questionLayout: z.enum(['single', 'scroll']).optional(),
});

export const designSettingsSchema = z.object({
  themeColors: themeColorsSchema.optional(),
  welcomeScreen: welcomeScreenSettingsSchema.optional(),
  thankYouScreen: thankYouScreenSettingsSchema.optional(),
  surveyBody: surveyBodySettingsSchema.optional(),
  syncAllScreens: z.boolean().optional(),
}).optional();

export type BackgroundSettings = z.infer<typeof backgroundSettingsSchema>;
export type ThemeColors = z.infer<typeof themeColorsSchema>;
export type WelcomeScreenSettings = z.infer<typeof welcomeScreenSettingsSchema>;
export type ThankYouScreenSettings = z.infer<typeof thankYouScreenSettingsSchema>;
export type SurveyBodySettings = z.infer<typeof surveyBodySettingsSchema>;
export type DesignSettings = z.infer<typeof designSettingsSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// SURVEYS TABLE
// ═══════════════════════════════════════════════════════════════════════════════

// Surveys table
export const surveys = pgTable("surveys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  questions: jsonb("questions").notNull().$type<Question[]>(),
  welcomeMessage: text("welcome_message"),
  thankYouMessage: text("thank_you_message"),
  illustrationUrl: text("illustration_url"),
  trainerName: text("trainer_name"),
  trainingDate: date("training_date"),
  tags: jsonb("tags").default(sql`'[]'::jsonb`).$type<string[]>(),
  isAnonymous: boolean("is_anonymous").default(false),
  webhookUrl: text("webhook_url"),
  status: varchar("status").default("Active"),
  publishedAt: timestamp("published_at"),
  scoreConfig: jsonb("score_config").$type<SurveyScoreConfig>(), // Scoring configuration for assessment surveys
  designSettings: jsonb("design_settings").$type<DesignSettings>(), // Visual customization settings
  estimatedMinutes: integer("estimated_minutes"), // Estimated time to complete survey in minutes
  privacyStatement: text("privacy_statement"), // Privacy/confidentiality statement for survey
  dataUsageStatement: text("data_usage_statement"), // Statement about how data will be used
  tone: varchar("tone").default("casual"), // Survey tone: formal, casual, encouraging, technical
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Survey respondents table (Phase 4)
export const surveyRespondents = pgTable("survey_respondents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  surveyId: varchar("survey_id").notNull().references(() => surveys.id),
  email: varchar("email"),
  name: varchar("name"),
  respondentToken: varchar("respondent_token").unique(),
  invitedAt: timestamp("invited_at").defaultNow(),
  submittedAt: timestamp("submitted_at"),
});

export const insertSurveySchema = createInsertSchema(surveys, {
  questions: z.array(questionSchema).min(1, "At least one question is required"),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSurvey = z.infer<typeof insertSurveySchema>;
export type Survey = typeof surveys.$inferSelect;

// Survey type with computed fields (responseCount, questionCount, respondentCount) added by API
export type SurveyWithCounts = Survey & {
  responseCount: number;
  questionCount: number;
  respondentCount?: number;
};

export type SurveyRespondent = typeof surveyRespondents.$inferSelect;

export const insertSurveyRespondentSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
});

export type InsertSurveyRespondent = z.infer<typeof insertSurveyRespondentSchema>;

// Enhanced response metadata for analytics
export const responseMetadataSchema = z.object({
  device: z.enum(["desktop", "mobile", "tablet"]).optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  referralSource: z.string().optional(), // utm_source, direct, email, social
  userAgent: z.string().optional(),
  screenWidth: z.number().optional(),
  screenHeight: z.number().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
});

export type ResponseMetadata = z.infer<typeof responseMetadataSchema>;

// Time spent per question for engagement analytics
export const questionTimingSchema = z.record(z.number()); // questionId -> milliseconds
export type QuestionTiming = z.infer<typeof questionTimingSchema>;

// Survey responses table
export const surveyResponses = pgTable("survey_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  surveyId: varchar("survey_id").notNull().references(() => surveys.id),
  answers: jsonb("answers").notNull().$type<Record<string, string | string[]>>(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  // Enhanced analytics fields
  metadata: jsonb("metadata").$type<ResponseMetadata>(),
  questionTimings: jsonb("question_timings").$type<QuestionTiming>(), // time spent per question in ms
  completionPercentage: integer("completion_percentage").default(100), // for partial responses
  totalDurationMs: integer("total_duration_ms"), // total time to complete
  ipHash: varchar("ip_hash"), // hashed IP for unique visitor tracking (privacy-friendly)
  sessionId: varchar("session_id"), // for tracking return visitors
}, (table) => [
  index("idx_survey_responses_survey_id").on(table.surveyId),
  index("idx_survey_responses_completed_at").on(table.completedAt),
]);

export type SurveyResponse = typeof surveyResponses.$inferSelect;

// Helper to calculate scores from responses
/**
 * Calculates survey scores based on respondent answers and scoring configuration.
 * 
 * SCORING SYSTEM:
 * - Scorable question types: rating (1-ratingScale), nps (0-10), multiple_choice (1-5), checkbox (1-5 per selection), number (raw value)
 * - Non-scorable types: text, textarea, email, date, section (excluded to maintain consistency)
 * 
 * NORMALIZATION ALGORITHM:
 * 1. Raw scoring: Each question type contributes points (varies by type)
 * 2. Theoretical max: Assumes 5 max points per question (adjusted for question type)
 * 3. Normalize: (rawScore / theoreticalMaxRaw) * configuredMaxScore
 * 4. Clamp: Final score never exceeds the configured maximum
 * 
 * NOTE: This assumes all questions in a category contribute meaningfully. 
 * Mixing heterogeneous question types may produce unexpected normalized scores.
 */
export function calculateSurveyScores(
  questions: Question[],
  answers: Record<string, string | string[]>,
  scoreConfig: SurveyScoreConfig | undefined,
  preCalculatedScores?: Record<string, number>
) {
  if (!scoreConfig?.enabled) return null;

  let scores: Record<string, number> = {};
  
  // Initialize scores for each category
  scoreConfig.categories.forEach(cat => {
    scores[cat.id] = 0;
  });

  // Helper to get max points for a question type
  const getMaxPointsForQuestion = (q: Question): number => {
    switch (q.type) {
      // Rating types
      case "rating": return q.ratingScale || 5;
      case "nps": return 10;
      case "likert": return q.likertPoints || 5;
      case "opinion_scale": return q.ratingScale || 5;
      case "slider": return q.max !== undefined ? (q.max - (q.min || 0)) : 10;
      
      // Selection types
      case "multiple_choice": return q.options?.length || 5;
      case "dropdown": return q.options?.length || 5;
      case "checkbox": return q.maxSelections || 5;
      case "image_choice": return q.imageOptions?.length || q.options?.length || 5;
      case "yes_no": return 1;
      
      // Advanced types
      case "matrix": return (q.rowLabels?.length || 1) * (q.colLabels?.length || 5);
      case "ranking": return q.options?.length || 5;
      case "constant_sum": return q.totalPoints || 100;
      
      // Numeric
      case "number": return 10;
      
      // Non-scorable types
      case "text":
      case "textarea":
      case "email":
      case "phone":
      case "url":
      case "date":
      case "time":
      case "datetime":
      case "file_upload":
      case "signature":
      case "section":
      case "statement":
      case "legal":
      default:
        return 0;
    }
  };

  // Use pre-calculated scores if provided (from AI scoring), otherwise calculate locally
  if (preCalculatedScores) {
    scores = { ...scores, ...preCalculatedScores };
  } else {
    // First pass: calculate raw scores and theoretical max per category
    const rawScores: Record<string, number> = {};
    const theoreticalMax: Record<string, number> = {};

    scoreConfig.categories.forEach(cat => {
      rawScores[cat.id] = 0;
      theoreticalMax[cat.id] = 0;
    });

    // Calculate raw point values - only for scorable question types
    questions.forEach(q => {
      if (q.scoringCategory && answers[q.id]) {
        const answer = answers[q.id];
        let pointValue = 0;
        const maxPoints = getMaxPointsForQuestion(q);

        const answerText = Array.isArray(answer) ? answer[0] : answer;
        const answerNum = parseInt(answerText, 10);

        switch (q.type) {
          // === RATING TYPES ===
          case "rating":
          case "likert":
          case "opinion_scale":
            // Use the selected value directly
            if (!isNaN(answerNum)) {
              pointValue = answerNum;
            }
            break;
            
          case "nps":
            // NPS: 0-10 scale
            if (!isNaN(answerNum)) {
              pointValue = answerNum;
            }
            break;
            
          case "slider":
            // Slider: normalize to 0-max range
            if (!isNaN(answerNum)) {
              const minVal = q.min || 0;
              pointValue = answerNum - minVal;
            }
            break;
            
          // === SELECTION TYPES ===
          case "multiple_choice":
          case "dropdown":
            // Try to extract numeric value first (for Likert scales like "5 - Strongly Agree")
            const numMatch = answerText.match(/^(\d+)/);
            if (numMatch) {
              pointValue = parseInt(numMatch[1], 10);
            } else if (q.optionScores && q.optionScores[answerText] !== undefined) {
              // Use custom option scores if defined
              pointValue = q.optionScores[answerText];
            } else if (q.options) {
              // Map option position to points: first option = 1, last option = numOptions
              const optionIndex = q.options.indexOf(answerText);
              if (optionIndex >= 0) {
                pointValue = optionIndex + 1;
              }
            }
            break;
            
          case "checkbox":
            // Checkboxes: 1 point per selection, capped at maxSelections or 5
            const maxSel = q.maxSelections || 5;
            pointValue = Math.min(Array.isArray(answer) ? answer.length : 1, maxSel);
            break;
            
          case "image_choice":
            // Image choice: position-based or custom scores
            if (q.selectionType === "multiple") {
              pointValue = Math.min(Array.isArray(answer) ? answer.length : 1, 5);
            } else if (q.imageOptions) {
              const imgIndex = q.imageOptions.findIndex(opt => opt.value === answerText || opt.label === answerText);
              if (imgIndex >= 0) {
                pointValue = imgIndex + 1;
              }
            }
            break;
            
          case "yes_no":
            // Yes = 1, No = 0
            const yesLabel = q.yesLabel || "Yes";
            pointValue = answerText.toLowerCase() === yesLabel.toLowerCase() ? 1 : 0;
            break;
            
          // === ADVANCED TYPES ===
          case "ranking":
            // Ranking: higher rank = more points (1st place = max points)
            if (Array.isArray(answer) && q.options) {
              // Sum inverse positions
              answer.forEach((item, idx) => {
                pointValue += (q.options!.length - idx);
              });
            }
            break;
            
          case "matrix":
            // Matrix: sum of column positions (assuming columns are scale)
            // Answer format: "row|col" or array of "row|col"
            if (q.colLabels) {
              const matrixAnswers = Array.isArray(answer) ? answer : [answer];
              matrixAnswers.forEach(ans => {
                const [, col] = ans.split("|");
                const colIdx = q.colLabels!.indexOf(col);
                if (colIdx >= 0) {
                  pointValue += colIdx + 1;
                }
              });
            }
            break;
            
          case "constant_sum":
            // Constant sum: use the total (should equal totalPoints)
            if (Array.isArray(answer)) {
              pointValue = answer.reduce((sum, val) => sum + (parseInt(val, 10) || 0), 0);
            }
            break;
            
          case "number":
            // Number: use value directly, capped at 10
            if (!isNaN(answerNum)) {
              pointValue = Math.min(answerNum, 10);
            }
            break;
            
          // Non-scorable types - no points
          default:
            pointValue = 0;
        }
        
        // Apply score weight if defined
        if (q.scoreWeight && pointValue > 0) {
          pointValue *= q.scoreWeight;
        }

        // Only add to totals if this question type is scorable
        if (maxPoints > 0) {
          rawScores[q.scoringCategory] = (rawScores[q.scoringCategory] || 0) + pointValue;
          theoreticalMax[q.scoringCategory] = (theoreticalMax[q.scoringCategory] || 0) + maxPoints;
        }
      }
    });

    // Second pass: normalize scores to fit within configured max scores
    scoreConfig.categories.forEach(cat => {
      const catId = cat.id;
      const rawScore = rawScores[catId] || 0;
      const theoreticalMaxRaw = theoreticalMax[catId] || 1;
      
      // Get the configured max score for this category
      const maxConfiguredScore = scoreConfig.scoreRanges
        .filter(rule => rule.category === catId)
        .reduce((max, rule) => Math.max(max, rule.maxScore), 20);

      // Normalize: (rawScore / theoreticalMaxRaw) * maxConfiguredScore
      // This scales the raw score proportionally to the configured max
      if (theoreticalMaxRaw > 0) {
        scores[catId] = Math.round((rawScore / theoreticalMaxRaw) * maxConfiguredScore);
      } else {
        scores[catId] = 0;
      }

      // Ensure score never exceeds max (safety clamp)
      scores[catId] = Math.min(scores[catId], maxConfiguredScore);
    });
  }

  // Map scores to interpretations
  const results: Array<{
    categoryId: string;
    categoryName: string;
    score: number;
    maxScore: number;
    interpretation: string;
  }> = [];

  scoreConfig.categories.forEach(cat => {
    const categoryScore = scores[cat.id] || 0;
    const maxScore = scoreConfig.scoreRanges
      .filter(rule => rule.category === cat.id)
      .reduce((max, rule) => Math.max(max, rule.maxScore), 0);
    
    // Normalize score and maxScore to 0-100 scale for consistent display
    const normalizedMaxScore = 100;
    const normalizedScore = maxScore > 0 ? Math.round((categoryScore / maxScore) * normalizedMaxScore) : 0;
    
    // Find matching rule using the original (non-normalized) score for interpretation
    const matchingRule = scoreConfig.scoreRanges.find(
      rule => rule.category === cat.id && 
      categoryScore >= rule.minScore && 
      categoryScore <= rule.maxScore
    );

    results.push({
      categoryId: cat.id,
      categoryName: cat.name,
      score: normalizedScore,
      maxScore: normalizedMaxScore,
      interpretation: matchingRule?.interpretation || "No interpretation available",
    });
  });

  return results;
}

// Templates table
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // e.g., "Training Feedback", "Assessment", "Satisfaction", "Pulse"
  questions: jsonb("questions").notNull().$type<Question[]>(),
  scoreConfig: jsonb("score_config").$type<SurveyScoreConfig>(),
  is_featured: boolean("is_featured").default(false), // For featured templates section
  tags: jsonb("tags").$type<string[]>(), // Searchable tags like ["pulse", "hr", "quick-5min"]
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Template = typeof templates.$inferSelect;

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
});

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

// Short URLs table (maps short codes to survey IDs)
export const shortUrls = pgTable("short_urls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(),
  surveyId: varchar("survey_id").notNull().references(() => surveys.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ShortUrl = typeof shortUrls.$inferSelect;

// Survey analytics events (for tracking views, starts, drop-offs)
export const surveyAnalyticsEvents = pgTable("survey_analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  surveyId: varchar("survey_id").notNull().references(() => surveys.id),
  eventType: varchar("event_type").notNull(), // 'view', 'start', 'complete', 'drop_off', 'question_view'
  sessionId: varchar("session_id"),
  questionId: varchar("question_id"), // for question-level events
  metadata: jsonb("metadata").$type<ResponseMetadata>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_analytics_events_survey_id").on(table.surveyId),
  index("idx_analytics_events_type").on(table.eventType),
  index("idx_analytics_events_created_at").on(table.createdAt),
]);

export type SurveyAnalyticsEvent = typeof surveyAnalyticsEvents.$inferSelect;

// Aggregated analytics summary (computed periodically for performance)
export interface SurveyAnalyticsSummary {
  surveyId: string;
  totalViews: number;
  totalStarts: number;
  totalCompletions: number;
  completionRate: number; // starts -> completions
  averageDurationMs: number;
  medianDurationMs: number;
  responsesByDay: Record<string, number>; // date -> count
  responsesByHour: Record<number, number>; // hour (0-23) -> count
  deviceBreakdown: Record<string, number>; // device type -> count
  browserBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
  dropOffByQuestion: Record<string, number>; // questionId -> drop-off count
  averageTimeByQuestion: Record<string, number>; // questionId -> avg ms
}
