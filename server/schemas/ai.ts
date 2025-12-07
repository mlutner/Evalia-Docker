import { z } from "zod";
import { surveyScoreConfigSchema, resultsScreenSchema } from "@shared/schema";

export const AiScoringConfigSuggestionSchema = z
  .object({
    categories: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
        })
      )
      .default([]),
    scoreRanges: z
      .array(
        z.object({
          category: z.string(),
          label: z.string(),
          minScore: z.number().int(),
          maxScore: z.number().int(),
          interpretation: z.string(),
        })
      )
      .default([]),
    suggestedQuestionCategoryMap: z.record(z.string()).optional(),
  })
  .strict();

export type AiScoringConfigSuggestion = z.infer<typeof AiScoringConfigSuggestionSchema>;

export const AiSurveyTextSchema = z.object({
  text: z.string(),
});

export const AiSurveyGenerationSchema = z.object({
  title: z.string(),
  questions: z.array(z.any()),
  scoreConfig: surveyScoreConfigSchema.optional(),
  resultsScreen: resultsScreenSchema.optional(),
});

export const AiChatMessageSchema = z.object({
  message: z.string(),
});
