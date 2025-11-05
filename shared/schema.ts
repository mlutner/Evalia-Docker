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

// User storage table (updated for Replit Auth)
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
export type QuestionType = "text" | "textarea" | "multiple_choice" | "checkbox" | "email" | "number";

export const questionSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "textarea", "multiple_choice", "checkbox", "email", "number"]),
  question: z.string(),
  description: z.string().optional(),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
});

export type Question = z.infer<typeof questionSchema>;

// Surveys table
export const surveys = pgTable("surveys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  questions: jsonb("questions").notNull().$type<Question[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSurveySchema = createInsertSchema(surveys, {
  questions: z.array(questionSchema).min(1, "At least one question is required"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSurvey = z.infer<typeof insertSurveySchema>;
export type Survey = typeof surveys.$inferSelect;

// Survey responses table
export const surveyResponses = pgTable("survey_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  surveyId: varchar("survey_id").notNull().references(() => surveys.id),
  answers: jsonb("answers").notNull().$type<Record<string, string | string[]>>(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});
