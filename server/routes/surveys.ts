/**
 * Survey Routes - CRUD operations for surveys
 * 
 * @module routes/surveys
 */

import { Router } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";
import { insertSurveySchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { generateSurveySummary, suggestScoringConfig } from "../aiService";

// Pool of survey illustrations - rotated across surveys
const SURVEY_ILLUSTRATIONS = [
  "/attached_assets/1_1763757398561.png",
  "/attached_assets/2_1763757398561.png",
  "/attached_assets/3_1763757398561.png",
  "/attached_assets/image_1763763890940.png",
  "/attached_assets/image_1763763953056.png",
  "/attached_assets/Heading_1763764033818.png",
];

function getRandomIllustration(): string {
  return SURVEY_ILLUSTRATIONS[Math.floor(Math.random() * SURVEY_ILLUSTRATIONS.length)];
}

const router = Router();

/**
 * @swagger
 * /api/surveys:
 *   get:
 *     summary: Get all surveys for authenticated user
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of surveys with metadata
 */
router.get("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const surveys = await storage.getAllSurveys(userId);
    
    // Batch-load all counts in parallel - OPTIMIZED for speed
    const surveysWithCounts = await Promise.all(
      surveys.map(async (survey) => {
        const [responseCount, metrics] = await Promise.all([
          storage.getResponseCount(survey.id),
          storage.getRespondentMetrics(survey.id),
        ]);
        const questionCount = survey.questions?.length || 0;
        
        // Return only metadata for list view - exclude full questions array to reduce payload
        return {
          id: survey.id,
          title: survey.title,
          description: survey.description,
          status: survey.status,
          createdAt: survey.createdAt,
          updatedAt: survey.updatedAt,
          tags: survey.tags,
          illustrationUrl: survey.illustrationUrl,
          scoreConfig: survey.scoreConfig,
          responseCount,
          questionCount,
          respondentCount: metrics.totalInvited,
        };
      })
    );
    
    res.json(surveysWithCounts);
  } catch (error: any) {
    console.error("[Survey Routes] Get surveys error:", error);
    res.status(500).json({ error: "Failed to fetch surveys" });
  }
});

/**
 * @swagger
 * /api/surveys/{id}:
 *   get:
 *     summary: Get a single survey by ID (public)
 *     tags: [Surveys]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Survey data
 *       404:
 *         description: Survey not found
 */
// [SCORING-PIPELINE] GET /api/surveys/:id - Returns survey with scoreConfig
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const survey = await storage.getSurvey(id);
    
    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    // [SCORING-PIPELINE] Log scoreConfig being returned to client
    const scoreConfig = survey.scoreConfig;
    const categoriesCount = scoreConfig?.categories?.length ?? 0;
    const bandsCount = scoreConfig?.scoreRanges?.length ?? 0;
    
    console.log("[SCORING-PIPELINE] GET /api/surveys/:id returning scoreConfig", {
      surveyId: id,
      hasScoreConfig: !!scoreConfig,
      enabled: scoreConfig?.enabled,
      categoriesCount,
      bandsCount,
    });
    
    // [SCORING-PIPELINE] GUARD: Warn if enabled scoring has empty data
    if (scoreConfig?.enabled && (categoriesCount === 0 || bandsCount === 0)) {
      console.warn("[SCORING-PIPELINE] Returning enabled scoring with empty categories/bands!", {
        surveyId: id,
        categoriesCount,
        bandsCount,
      });
    }

    // Calculate response and question counts
    const responseCount = await storage.getResponseCount(id);
    const questionCount = survey.questions?.length || 0;

    res.json({
      ...survey,
      responseCount,
      questionCount,
    });
  } catch (error: any) {
    console.error("[Survey Routes] Get survey error:", error);
    res.status(500).json({ error: "Failed to fetch survey" });
  }
});

/**
 * @swagger
 * /api/surveys:
 *   post:
 *     summary: Create a new survey
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InsertSurvey'
 *     responses:
 *       201:
 *         description: Survey created
 */
router.post("/", isAuthenticated, async (req: any, res) => {
  try {
    const validationResult = insertSurveySchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: fromZodError(validationResult.error).message 
      });
    }

    const userId = req.user.claims.sub;
    
    // Generate AI summary if no description provided
    let summary = validationResult.data.description;
    if (!summary && validationResult.data.questions && validationResult.data.questions.length > 0) {
      try {
        summary = await generateSurveySummary(validationResult.data.title, validationResult.data.questions);
      } catch (error) {
        console.warn("[Survey Routes] Failed to generate summary:", error);
        // Fallback: use generic summary
        summary = `${validationResult.data.questions.length}-question survey`;
      }
    }
    
    // Auto-assign a random illustration to the survey
    const surveyData = {
      ...validationResult.data,
      description: summary,
      illustrationUrl: getRandomIllustration(),
    };
    
    const survey = await storage.createSurvey(surveyData, userId);
    const [responseCount, metrics] = await Promise.all([
      storage.getResponseCount(survey.id),
      storage.getRespondentMetrics(survey.id),
    ]);
    const questionCount = survey.questions?.length || 0;
    
    res.status(201).json({
      ...survey,
      responseCount,
      questionCount,
      respondentCount: metrics.totalInvited,
    });
  } catch (error: any) {
    console.error("[Survey Routes] Create survey error:", error);
    res.status(500).json({ error: "Failed to create survey" });
  }
});

/**
 * @swagger
 * /api/surveys/{id}:
 *   put:
 *     summary: Update a survey
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get current survey to preserve illustrationUrl if not provided
    const currentSurvey = await storage.getSurvey(id);
    if (!currentSurvey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    // Preserve illustrationUrl if not in updates
    const surveyUpdates = {
      ...updates,
      illustrationUrl: updates.illustrationUrl || currentSurvey.illustrationUrl || getRandomIllustration(),
    };

    const survey = await storage.updateSurvey(id, surveyUpdates);
    const responseCount = await storage.getResponseCount(survey?.id || id);
    const questionCount = survey?.questions?.length || 0;
    
    res.json({
      ...survey,
      responseCount,
      questionCount,
    });
  } catch (error: any) {
    console.error("[Survey Routes] Update survey error:", error);
    res.status(500).json({ error: "Failed to update survey" });
  }
});

/**
 * @swagger
 * /api/surveys/{id}:
 *   delete:
 *     summary: Delete a survey
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteSurvey(id);
    
    if (!deleted) {
      return res.status(404).json({ error: "Survey not found" });
    }

    res.status(204).send();
  } catch (error: any) {
    console.error("[Survey Routes] Delete survey error:", error);
    res.status(500).json({ error: "Failed to delete survey" });
  }
});

/**
 * @swagger
 * /api/surveys/{id}/duplicate:
 *   post:
 *     summary: Duplicate a survey
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/duplicate", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.claims.sub;

    // Verify ownership
    const isOwner = await storage.checkSurveyOwnership(id, userId);
    if (!isOwner) {
      return res.status(403).json({ error: "Access denied" });
    }

    const duplicated = await storage.duplicateSurvey(id, userId);
    if (!duplicated) {
      return res.status(404).json({ error: "Survey not found" });
    }

    const responseCount = await storage.getResponseCount(duplicated.id);
    const questionCount = duplicated.questions?.length || 0;
    
    res.status(201).json({
      ...duplicated,
      responseCount,
      questionCount,
    });
  } catch (error: any) {
    console.error("[Survey Routes] Duplicate survey error:", error);
    res.status(500).json({ error: "Failed to duplicate survey" });
  }
});

/**
 * @swagger
 * /api/surveys/{id}/clear-responses:
 *   post:
 *     summary: Clear all responses for a survey
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/clear-responses", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.claims.sub;

    // Verify ownership
    const isOwner = await storage.checkSurveyOwnership(id, userId);
    if (!isOwner) {
      return res.status(403).json({ error: "Access denied" });
    }

    const survey = await storage.getSurvey(id);
    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    const cleared = await storage.clearSurveyResponses(id);
    res.json({ success: true, cleared });
  } catch (error: any) {
    console.error("[Survey Routes] Clear responses error:", error);
    res.status(500).json({ error: "Failed to clear responses" });
  }
});

/**
 * @swagger
 * /api/surveys/{id}/short-url:
 *   post:
 *     summary: Create a short URL for a survey
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/short-url", isAuthenticated, async (req: any, res) => {
  try {
    const surveyId = req.params.id;
    const userId = req.user.claims.sub;

    const survey = await storage.getSurvey(surveyId);
    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    const isOwner = await storage.checkSurveyOwnership(surveyId, userId);
    if (!isOwner) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const shortCode = await storage.createShortUrl(surveyId);
    const shortUrl = `/s/${shortCode}`;
    res.json({ shortUrl, shortCode });
  } catch (error: any) {
    console.error("[Survey Routes] Short URL error:", error);
    res.status(500).json({ message: error.message || "Failed to create short URL" });
  }
});

/**
 * @swagger
 * /api/surveys/{id}/save-as-template:
 *   post:
 *     summary: Save survey as a template
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/save-as-template", isAuthenticated, async (req: any, res) => {
  try {
    const { title, description, category } = req.body;
    const surveyId = req.params.id;
    const userId = req.user.claims.sub;

    const survey = await storage.getSurvey(surveyId);
    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    const isOwner = await storage.checkSurveyOwnership(surveyId, userId);
    if (!isOwner) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const template = await storage.saveAsTemplate(survey, title, description, category);
    res.json(template);
  } catch (error: any) {
    console.error("[Survey Routes] Save as template error:", error);
    res.status(500).json({ message: error.message || "Failed to save template" });
  }
});

export default router;

