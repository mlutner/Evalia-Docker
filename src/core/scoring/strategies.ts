/**
 * Scoring engine registry.
 * This allows us to support multiple scoring strategies (e.g. engagement_v1, nps_v1).
 * For now, only 'engagement_v1' is implemented.
 * Do NOT change existing IDs or behavior without versioning.
 */

import { engagementScoringV1, type ScoreInput, type ScoringResult } from './scoringEngineV1';

export type ScoringEngineId = 'engagement_v1';

export type ScoringEngine = (input: ScoreInput) => ScoringResult;

export const scoringEngines: Record<ScoringEngineId, ScoringEngine> = {
  engagement_v1: engagementScoringV1,
};

export type { ScoreInput, ScoringResult };
