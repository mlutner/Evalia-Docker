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

// Question types
export type QuestionType = "text" | "textarea" | "multiple_choice" | "checkbox" | "email" | "number" | "rating" | "nps" | "matrix" | "ranking" | "date" | "section";

export const skipConditionSchema = z.object({
  questionId: z.string(),
  answer: z.string(),
}).optional();

export const questionSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "textarea", "multiple_choice", "checkbox", "email", "number", "rating", "nps", "matrix", "ranking", "date", "section"]),
  question: z.string(),
  description: z.string().optional(),
  options: z.array(z.string()).optional(),
  rowLabels: z.array(z.string()).optional(), // for matrix questions
  colLabels: z.array(z.string()).optional(), // for matrix questions
  required: z.boolean().optional(),
  ratingScale: z.number().optional(), // 5 or 10 for rating questions
  skipCondition: skipConditionSchema, // show this question only if condition is met
  scoringCategory: z.string().optional(), // for scoring surveys - the category this question belongs to
  sectionId: z.string().optional(), // section this question belongs to (for organizing questions into groups for scoring)
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
  estimatedMinutes: integer("estimated_minutes"), // Estimated time to complete survey in minutes
  privacyStatement: text("privacy_statement"), // Privacy/confidentiality statement for survey
  dataUsageStatement: text("data_usage_statement"), // Statement about how data will be used
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

// Survey responses table
export const surveyResponses = pgTable("survey_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  surveyId: varchar("survey_id").notNull().references(() => surveys.id),
  answers: jsonb("answers").notNull().$type<Record<string, string | string[]>>(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
}, (table) => [
  index("idx_survey_responses_survey_id").on(table.surveyId),
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

  // Use pre-calculated scores if provided (from AI scoring), otherwise calculate locally
  if (preCalculatedScores) {
    scores = { ...scores, ...preCalculatedScores };
  } else {
    // First pass: calculate raw scores and count questions per category
    const rawScores: Record<string, number> = {};
    const questionCounts: Record<string, number> = {};

    scoreConfig.categories.forEach(cat => {
      rawScores[cat.id] = 0;
      questionCounts[cat.id] = 0;
    });

    // Calculate raw point values - only for scorable question types
    questions.forEach(q => {
      if (q.scoringCategory && answers[q.id]) {
        const answer = answers[q.id];
        let pointValue = 0;

        if (q.type === "rating") {
          // Rating: use the selected value (1 to ratingScale, typically 1-5)
          const value = parseInt(Array.isArray(answer) ? answer[0] : answer, 10);
          if (!isNaN(value)) {
            pointValue = value;
          }
        } else if (q.type === "nps") {
          // NPS: use the value directly (0-10)
          const value = parseInt(Array.isArray(answer) ? answer[0] : answer, 10);
          if (!isNaN(value)) {
            pointValue = value;
          }
        } else if (q.type === "number") {
          // Number: use value directly
          const value = parseInt(Array.isArray(answer) ? answer[0] : answer, 10);
          if (!isNaN(value)) {
            pointValue = value;
          }
        } else if (q.type === "multiple_choice") {
          // Multiple choice: try to extract numeric value first (for Likert scales like "5 - Strongly Agree")
          const answerText = Array.isArray(answer) ? answer[0] : answer;
          
          // Try to extract leading number (e.g., "5 (Strongly Agree)" → 5)
          const numMatch = answerText.match(/^(\d+)/);
          if (numMatch) {
            pointValue = parseInt(numMatch[1], 10);
          } else if (q.options) {
            // Fallback: map option index to points (0-indexed to 1-5 scale)
            const optionIndex = q.options.indexOf(answerText);
            if (optionIndex >= 0) {
              const numOptions = q.options.length;
              const maxPoints = Math.min(numOptions, 5);
              pointValue = Math.ceil((optionIndex + 1) / numOptions * maxPoints);
            }
          }
        } else if (q.type === "checkbox") {
          // Checkboxes: 1 point per selection, capped at 5
          pointValue = Math.min(Array.isArray(answer) ? answer.length : 1, 5);
        }
        // NOTE: text, textarea, email, date, section types are intentionally NOT scored

        if (pointValue > 0) {
          rawScores[q.scoringCategory] = (rawScores[q.scoringCategory] || 0) + pointValue;
        }
        
        if (q.scoringCategory) {
          questionCounts[q.scoringCategory]++;
        }
      }
    });

    // Second pass: normalize scores to fit within configured max scores
    scoreConfig.categories.forEach(cat => {
      const catId = cat.id;
      const rawScore = rawScores[catId] || 0;
      const qCount = questionCounts[catId] || 1;
      
      // Get the configured max score for this category
      const maxConfiguredScore = scoreConfig.scoreRanges
        .filter(rule => rule.category === catId)
        .reduce((max, rule) => Math.max(max, rule.maxScore), 20);

      // Calculate the theoretical max raw score (assumes ~5 points per question on average)
      // ASSUMPTION: This works best when questions in a category are homogeneous (same type)
      const theoreticalMaxRaw = qCount * 5;

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
