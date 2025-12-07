/**
 * Dev-Only Scoring Debug API
 * 
 * [SCORING-DEBUG] Provides detailed score calculation traces for debugging.
 * This endpoint is ONLY available in non-production environments.
 * 
 * Route: POST /api/dev/scoring-trace
 * 
 * Features:
 * - Per-question score contributions
 * - Per-category score breakdowns
 * - Final band selection with matched rule
 * - Uses the SAME scoring logic as production (calculateSurveyScores)
 * 
 * IMPORTANT: This is READ-ONLY and does NOT modify any data.
 */

import { Router, Request, Response } from "express";
import { db } from "../db";
import { surveys, surveyResponses } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import type { Survey } from "@shared/schema";
import { buildScoringTrace, type ScoringTraceRequest } from "../utils/scoringDebug";

const router = Router();

// ============================================================================
// ROUTE HANDLER
// ============================================================================

/**
 * POST /api/dev/scoring-trace
 * 
 * Get detailed scoring calculation trace for debugging.
 * 
 * Body:
 * - surveyId: string (required if not passing survey directly)
 * - responseId?: string (optional, uses most recent if not provided)
 * - survey?: Survey (optional, pass directly from builder)
 * - answers?: Record<string, any> (optional, use with survey)
 */
router.post("/scoring-trace", async (req: Request, res: Response) => {
  // Only allow in non-production OR when ENABLE_DEV_TOOLS is set
  const devToolsEnabled = process.env.NODE_ENV !== "production" || process.env.ENABLE_DEV_TOOLS === "true";
  if (!devToolsEnabled) {
    return res.status(403).json({
      error: "This endpoint is not available in production",
      hint: "Set ENABLE_DEV_TOOLS=true to enable scoring debug"
    });
  }

  try {
    const { surveyId, responseId, survey: passedSurvey, answers: passedAnswers } = req.body as ScoringTraceRequest;

    let survey: Survey;
    let answers: Record<string, string | string[]>;
    let finalResponseId: string | null = null;

    // Option 1: Survey and answers passed directly (from builder)
    if (passedSurvey && passedAnswers) {
      survey = passedSurvey;
      answers = passedAnswers;
    }
    // Option 2: Load from database
    else if (surveyId) {
      // Load survey
      const [surveyRow] = await db.select().from(surveys).where(eq(surveys.id, surveyId));
      if (!surveyRow) {
        return res.status(404).json({ error: "Survey not found" });
      }
      survey = surveyRow as unknown as Survey;

      // Load response (specific or most recent)
      let responseRow;
      if (responseId) {
        [responseRow] = await db.select().from(surveyResponses).where(eq(surveyResponses.id, responseId));
        if (!responseRow) {
          return res.status(404).json({ error: "Response not found" });
        }
      } else {
        // Get most recent response for this survey
        const recentResponses = await db
          .select()
          .from(surveyResponses)
          .where(eq(surveyResponses.surveyId, surveyId))
          .orderBy(sql`${surveyResponses.completedAt} DESC`)
          .limit(1);

        if (recentResponses.length === 0) {
          return res.status(200).json({
            meta: {
              surveyId,
              surveyTitle: survey.title || 'Untitled Survey',
              responseId: null,
              scoringEngineId: (survey as any).scoringEngineId || null,
              scoringEnabled: survey.scoreConfig?.enabled ?? false,
              timestamp: new Date().toISOString(),
            },
            config: survey.scoreConfig ? {
              enabled: survey.scoreConfig.enabled,
              categories: survey.scoreConfig.categories || [],
              scoreRanges: survey.scoreConfig.scoreRanges || [],
            } : null,
            questions: [],
            categories: [],
            overall: null,
            errors: ["No responses exist for this survey. Submit a response first."],
          });
        }

        responseRow = recentResponses[0];
      }

      finalResponseId = responseRow.id;
      answers = (responseRow.answers || {}) as Record<string, string | string[]>;
    } else {
      return res.status(400).json({
        error: "Must provide surveyId or (survey + answers)"
      });
    }

    // Build and return the trace
    const trace = buildScoringTrace(survey, answers, finalResponseId);
    return res.json(trace);

  } catch (error) {
    console.error("[DEV-SCORING] Error building scoring trace:", error);
    return res.status(500).json({
      error: "Failed to build scoring trace",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/dev/scoring-trace/:surveyId
 * 
 * Convenience endpoint to get scoring trace for most recent response.
 */
router.get("/scoring-trace/:surveyId", async (req: Request, res: Response) => {
  // Only allow in non-production
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({
      error: "This endpoint is not available in production"
    });
  }

  // Redirect to POST handler
  req.body = { surveyId: req.params.surveyId };
  return (router as any)(req, res, () => { });
});

export default router;
