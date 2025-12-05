import { scoreSurvey } from '@shared/scoringEngine';
import type { Question, SurveyScoreConfig } from '@shared/schema';
import type { ScoringEngineId } from '@core/scoring/strategies';

/**
 * Derives engineId for a survey and delegates to scoreSurvey with that engine.
 * Default engine is engagement_v1.
 */
export function computeSurveyScore(params: {
  survey: { questions: Question[]; scoreConfig?: SurveyScoreConfig | null; scoringEngineId?: string | null };
  responses: Record<string, unknown>;
}) {
  const { survey, responses } = params;
  // TODO: account-level scoringEngineId once accounts/workspaces exist
  const engineId: ScoringEngineId = (survey as any).scoringEngineId ?? 'engagement_v1';

  return scoreSurvey(
    {
      questions: survey.questions,
      responses,
      scoreConfig: survey.scoreConfig,
    },
    engineId
  );
}
