import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, boolean, timestamp, integer, index } from "drizzle-orm/pg-core";
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Question types
export type QuestionType = "text" | "textarea" | "multiple_choice" | "checkbox" | "email" | "number" | "rating" | "nps" | "matrix" | "ranking" | "date";

export const skipConditionSchema = z.object({
  questionId: z.string(),
  answer: z.string(),
}).optional();

export const questionSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "textarea", "multiple_choice", "checkbox", "email", "number", "rating", "nps", "matrix", "ranking", "date"]),
  question: z.string(),
  description: z.string().optional(),
  options: z.array(z.string()).optional(),
  rowLabels: z.array(z.string()).optional(), // for matrix questions
  colLabels: z.array(z.string()).optional(), // for matrix questions
  required: z.boolean().optional(),
  ratingScale: z.number().optional(), // 5 or 10 for rating questions
  skipCondition: skipConditionSchema, // show this question only if condition is met
});

export type Question = z.infer<typeof questionSchema>;

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
  status: varchar("status").notNull().default("Active"), // Active, Paused, Closed
  expiresAt: timestamp("expires_at"),
  maxResponses: integer("max_responses"),
  isAnonymous: boolean("is_anonymous").default(false), // anonymous vs identified mode
  webhookUrl: text("webhook_url"), // for integrations (Slack, Zapier, etc)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
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

export const insertSurveyRespondentSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
});

export type InsertSurveyRespondent = z.infer<typeof insertSurveyRespondentSchema>;

// Survey respondents table (for tracking who's been invited/submitted)
export const surveyRespondents = pgTable("survey_respondents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  surveyId: varchar("survey_id").notNull().references(() => surveys.id),
  email: varchar("email"),
  name: varchar("name"),
  invitedAt: timestamp("invited_at").defaultNow(),
  submittedAt: timestamp("submitted_at"),
  respondentToken: varchar("respondent_token").unique(), // unique link for respondent
});

export type SurveyRespondent = typeof surveyRespondents.$inferSelect;

// Survey responses table
export const surveyResponses = pgTable("survey_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  surveyId: varchar("survey_id").notNull().references(() => surveys.id),
  respondentId: varchar("respondent_id").references(() => surveyRespondents.id),
  respondentEmail: varchar("respondent_email"), // for identified responses
  answers: jsonb("answers").notNull().$type<Record<string, string | string[]>>(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export type SurveyResponse = typeof surveyResponses.$inferSelect;
