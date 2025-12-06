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
import type { Question, SurveyScoreConfig, Survey } from "@shared/schema";
import { INDEX_BAND_DEFINITIONS, resolveIndexBand } from "@shared/analyticsBands";

const router = Router();

// ============================================================================
// TYPES
// ============================================================================

interface ScoringTraceRequest {
  surveyId: string;
  responseId?: string;
  // Alternative: pass survey and answers directly (useful from builder)
  survey?: Survey;
  answers?: Record<string, string | string[]>;
}

interface QuestionContribution {
  questionId: string;
  questionText: string;
  questionType: string;
  category: string;
  categoryName: string;
  rawAnswer: string | string[];
  optionScoreUsed: number | null;
  maxPoints: number;
  weight: number;
  contributionToCategory: number;
  normalizedContribution: number; // 0-100 scale
}

interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  rawScore: number;
  maxPossibleScore: number;
  normalizedScore: number; // 0-100
  bandId: string;
  bandLabel: string;
  bandColor: string;
  questionCount: number;
}

interface ScoringTraceResponse {
  meta: {
    surveyId: string;
    surveyTitle: string;
    responseId: string | null;
    scoringEngineId: string | null;
    scoringEnabled: boolean;
    timestamp: string;
  };
  config: {
    enabled: boolean;
    categories: Array<{ id: string; name: string }>;
    scoreRanges: Array<{ id: string; min: number; max: number; label: string }>;
  } | null;
  questions: QuestionContribution[];
  categories: CategoryBreakdown[];
  overall: {
    score: number;
    bandId: string;
    bandLabel: string;
    bandColor: string;
    matchedRule: { id: string; min: number; max: number; label: string } | null;
  } | null;
  errors: string[];
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get max points for a question type (mirrors calculateSurveyScores logic)
 */
function getMaxPointsForQuestion(q: Question): number {
  switch (q.type) {
    case "rating": return q.ratingScale || 5;
    case "nps": return 10;
    case "likert": return q.likertPoints || 5;
    case "opinion_scale": return q.ratingScale || 5;
    case "slider": return q.max !== undefined ? (q.max - (q.min || 0)) : 10;
    case "multiple_choice": return q.options?.length || 5;
    case "dropdown": return q.options?.length || 5;
    case "checkbox": return q.maxSelections || 5;
    case "image_choice": return q.imageOptions?.length || q.options?.length || 5;
    case "yes_no": return 1;
    case "matrix": return (q.rowLabels?.length || 1) * (q.colLabels?.length || 5);
    case "ranking": return q.options?.length || 5;
    case "constant_sum": return q.totalPoints || 100;
    case "number": return 10;
    default: return 0;
  }
}

/**
 * Calculate the score value for a question answer
 */
function calculateQuestionScore(
  q: Question, 
  answer: string | string[]
): { score: number; optionScoreUsed: number | null } {
  const answerText = Array.isArray(answer) ? answer[0] : answer;
  
  // Check if optionScores is defined and has the answer
  if (q.optionScores && typeof q.optionScores === 'object') {
    const optionScore = q.optionScores[answerText];
    if (optionScore !== undefined && optionScore !== null) {
      return { score: optionScore, optionScoreUsed: optionScore };
    }
  }
  
  // Fall back to numeric parsing
  const answerNum = parseInt(answerText, 10);
  if (!isNaN(answerNum)) {
    return { score: answerNum, optionScoreUsed: null };
  }
  
  // For multiple choice without optionScores, use position
  if (q.type === "multiple_choice" || q.type === "dropdown") {
    const options = q.options || [];
    const idx = options.indexOf(answerText);
    if (idx >= 0) {
      return { score: idx + 1, optionScoreUsed: null };
    }
  }
  
  return { score: 0, optionScoreUsed: null };
}

/**
 * Build the full scoring trace for a survey + answers
 */
function buildScoringTrace(
  survey: Survey,
  answers: Record<string, string | string[]>,
  responseId: string | null
): ScoringTraceResponse {
  const errors: string[] = [];
  const scoreConfig = survey.scoreConfig;
  
  // Base meta
  const response: ScoringTraceResponse = {
    meta: {
      surveyId: survey.id,
      surveyTitle: survey.title || 'Untitled Survey',
      responseId,
      scoringEngineId: (survey as any).scoringEngineId || null,
      scoringEnabled: scoreConfig?.enabled ?? false,
      timestamp: new Date().toISOString(),
    },
    config: null,
    questions: [],
    categories: [],
    overall: null,
    errors,
  };
  
  // If scoring not enabled, return early
  if (!scoreConfig?.enabled) {
    errors.push("Scoring is not enabled for this survey");
    return response;
  }
  
  // Set config
  response.config = {
    enabled: scoreConfig.enabled,
    categories: (scoreConfig.categories || []).map(c => ({ id: c.id, name: c.name })),
    scoreRanges: (scoreConfig.scoreRanges || []).map(r => ({
      id: r.id,
      min: r.min,
      max: r.max,
      label: r.label,
    })),
  };
  
  if (!scoreConfig.categories?.length) {
    errors.push("No scoring categories defined");
  }
  
  if (!scoreConfig.scoreRanges?.length) {
    errors.push("No score ranges (bands) defined");
  }
  
  // Build category map
  const categoryMap = new Map<string, { name: string; rawTotal: number; maxTotal: number; count: number }>();
  scoreConfig.categories.forEach(cat => {
    categoryMap.set(cat.id, { name: cat.name, rawTotal: 0, maxTotal: 0, count: 0 });
  });
  
  // Process each scorable question
  const questions = survey.questions || [];
  questions.forEach(q => {
    if (!q.scorable || !q.scoringCategory) return;
    
    const categoryData = categoryMap.get(q.scoringCategory);
    if (!categoryData) {
      errors.push(`Question ${q.id} has unknown category: ${q.scoringCategory}`);
      return;
    }
    
    const answer = answers[q.id];
    if (answer === undefined || answer === null) {
      // Question not answered
      return;
    }
    
    const maxPoints = getMaxPointsForQuestion(q);
    const weight = q.scoreWeight ?? 1;
    const { score, optionScoreUsed } = calculateQuestionScore(q, answer);
    const contribution = score * weight;
    const maxContribution = maxPoints * weight;
    
    // Update category totals
    categoryData.rawTotal += contribution;
    categoryData.maxTotal += maxContribution;
    categoryData.count++;
    
    // Add to questions list
    response.questions.push({
      questionId: q.id,
      questionText: q.question || q.text || 'Untitled Question',
      questionType: q.type,
      category: q.scoringCategory,
      categoryName: categoryData.name,
      rawAnswer: answer,
      optionScoreUsed,
      maxPoints,
      weight,
      contributionToCategory: contribution,
      normalizedContribution: maxPoints > 0 ? Math.round((score / maxPoints) * 100) : 0,
    });
  });
  
  // Calculate category scores
  let totalNormalized = 0;
  let categoryCount = 0;
  
  categoryMap.forEach((data, categoryId) => {
    const normalizedScore = data.maxTotal > 0 
      ? Math.round((data.rawTotal / data.maxTotal) * 100) 
      : 0;
    
    const band = resolveIndexBand(normalizedScore);
    
    response.categories.push({
      categoryId,
      categoryName: data.name,
      rawScore: data.rawTotal,
      maxPossibleScore: data.maxTotal,
      normalizedScore,
      bandId: band.bandId,
      bandLabel: band.label,
      bandColor: band.color,
      questionCount: data.count,
    });
    
    if (data.count > 0) {
      totalNormalized += normalizedScore;
      categoryCount++;
    }
  });
  
  // Calculate overall score
  if (categoryCount > 0) {
    const overallScore = Math.round(totalNormalized / categoryCount);
    const overallBand = resolveIndexBand(overallScore);
    
    // Find the matched rule from scoreRanges
    const matchedRule = scoreConfig.scoreRanges?.find(
      r => overallScore >= r.min && overallScore <= r.max
    );
    
    response.overall = {
      score: overallScore,
      bandId: overallBand.bandId,
      bandLabel: overallBand.label,
      bandColor: overallBand.color,
      matchedRule: matchedRule ? {
        id: matchedRule.id,
        min: matchedRule.min,
        max: matchedRule.max,
        label: matchedRule.label,
      } : null,
    };
  }
  
  return response;
}

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
          .orderBy(sql`${surveyResponses.createdAt} DESC`)
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
  return router.handle(req, res, () => {});
});

export default router;

