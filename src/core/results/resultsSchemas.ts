/**
 * EVALIA CORE MODULE
 *
 * DO NOT CHANGE existing function signatures, return types, or field names.
 * You may ONLY:
 * - Add new functions
 * - Add new types that do not break existing ones
 *
 * These modules are shared between frontend and backend and must remain deterministic.
 * To change behavior in a breaking way, create a new versioned module instead.
 */

import { z } from 'zod';

export const scoreBandSchema = z.object({
  id: z.string(),
  min: z.number(),
  max: z.number(),
  label: z.string(),
  color: z.string().optional(),
  tone: z.enum(['risk', 'neutral', 'strength']).optional(),
  headline: z.string().optional(),
  summary: z.string().optional(),
  managerTips: z.array(z.string()).optional(),
  orgActions: z.array(z.string()).optional(),
  // Legacy fields kept for backward compatibility with existing templates/UI
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  // [SCORE-002] Category-specific scoring fields for per-category band matching
  category: z.string().optional(),
  interpretation: z.string().optional(),
});

export const categoryResultConfigSchema = z.object({
  categoryId: z.string(),
  show: z.boolean(),
  emphasize: z.boolean().optional(),
  bandsMode: z.enum(['inherit', 'custom']).optional(),
  bands: z.array(scoreBandSchema).optional(),
  bandNarratives: z
    .array(
      z.object({
        bandId: z.string(),
        headline: z.string().optional(),
        summary: z.string().optional(),
      })
    )
    .optional(),
});

export const resultsScreenSchema = z.object({
  enabled: z.boolean(),
  layout: z.enum(['simple', 'bands', 'dashboard']),
  showTotalScore: z.boolean(),
  showPercentage: z.boolean(),
  showOverallBand: z.boolean(),
  showCategoryBreakdown: z.boolean(),
  showCategoryBands: z.boolean(),
  showStrengthsAndRisks: z.boolean(),
  showCallToAction: z.boolean(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  footerNote: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().optional(),
  themeVariant: z.enum(['neutral', 'success', 'warning', 'danger', 'teal']).optional(),
  scoreRanges: z.array(scoreBandSchema).optional(),
  categories: z.array(categoryResultConfigSchema).optional(),
});

export type ScoreBandConfig = z.infer<typeof scoreBandSchema>;
export type CategoryResultConfig = z.infer<typeof categoryResultConfigSchema>;
export type ResultsScreenConfig = z.infer<typeof resultsScreenSchema>;
