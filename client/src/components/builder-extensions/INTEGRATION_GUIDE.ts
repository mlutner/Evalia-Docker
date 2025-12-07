/**
 * @design-locked Builder-extensions types bridge
 * 
 * This file is the SINGLE SOURCE OF TRUTH for types used across builder-extensions.
 * 
 * DESIGN LOCK POLICY:
 * - Builder-extensions components (logic & scoring) are design-locked.
 * - We can change props, types, and wiring, but NOT the structure/CSS without
 *   explicitly comparing to the MP (Magic Patterns) golden TSX.
 * - All scoring/logic components should import types from this file, not define local duplicates.
 */
import type { BuilderQuestion } from "@/contexts/SurveyBuilderContext";
import type {
  LogicRule as CoreLogicRule,
  SurveyScoreConfig,
  ScoreBandConfig,
} from "@shared/schema";

export type { BuilderQuestion };

// Re-export core LogicRule but components may use BuilderLogicRule for extended fields
export type { CoreLogicRule as LogicRule };

// Builder-layer logic rule with MP design fields
// These are UI-only extensions for the builder; core schema remains unchanged
export interface BuilderLogicRule extends CoreLogicRule {
  questionId: string;              // Which question this rule belongs to
  conditionLabel?: string;         // Human-readable condition label
  actionLabel?: string;            // Human-readable action label
  validity?: 'valid' | 'warning' | 'invalid';
  validityMessage?: string;
}

// Scoring category derived from SurveyScoreConfig
// NonNullable first to handle the .optional() on the schema, then access categories
export type ScoringCategory = NonNullable<
  NonNullable<SurveyScoreConfig>["categories"]
>[number];

export type CoreScoreBand = ScoreBandConfig;

// Builder-only scoring config (UI layer)
export interface QuestionScoringConfig {
  scorable: boolean;
  scoreWeight: number;
  scoringCategory?: string;   // category id or key
  scoreValues?: number[];     // per-option weights for multi-choice
  reverse?: boolean;          // reverse-scored
}

// Builder-layer band; this may include extra UI metadata, not all of which persists
export interface BuilderScoreBand extends CoreScoreBand {
  // Optional UI-only fields – must NOT be required in runtime schema
  description?: string;        // legacy UI field (CoreScoreBand has shortDescription/longDescription)
  recommendations?: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
  guidance?: string;
  displayOnResults?: boolean;
  severity?: "low" | "medium" | "high" | "critical";
  actionRequired?: boolean;
  confidenceThreshold?: number;
}
