import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
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
