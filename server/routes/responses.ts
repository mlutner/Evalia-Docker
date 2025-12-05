/**
 * Response Routes - Survey response handling and analytics
 * 
 * @module routes/responses
 */

import { Router } from "express";
import { storage } from "../storage";
import type { ScoringEngineId } from "@core/scoring/strategies";
import { isAuthenticated } from "../replitAuth";
import { analyzeResponses } from "../responseAnalysis";
import { computeSurveyScore } from "../utils/scoring";
import { resolveBand as resolveBandCore } from "@core/scoring/resolveBand";

const router = Router();

/**
 * @swagger
 * /api/surveys/{id}/responses:
 *   post:
 *     summary: Submit survey response (public)
 *     tags: [Responses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: object
 *     responses:
 *       201:
 *         description: Response submitted
 */
router.post("/:id/responses", async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    // Verify survey exists
    const survey = await storage.getSurvey(id);
    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    // Check survey status
    if (survey.status !== "Active") {
      return res.status(403).json({
        error: `Survey is ${survey.status}. No new responses are being accepted.`,
      });
    }

    // Validate answers exist
    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ error: "Answers are required" });
    }

    const engineId: ScoringEngineId = (survey as any).scoringEngineId ?? "engagement_v1";

    const scoring =
      survey.scoreConfig?.enabled
        ? computeSurveyScore({ survey, responses: answers })
        : null;
    const scoreRanges = survey.scoreConfig?.resultsScreen?.scoreRanges ?? [];
    const band = scoring ? resolveBandCore(scoring.percentage, scoreRanges) : null;

    const response = await storage.createResponse(id, answers, engineId);
    console.log(`[Response Routes] Response created for survey ${id}:`, response.id);
    const responseBody: any = { ...response };
    if (scoring) {
      responseBody.scoring = scoring;
      responseBody.band = band ?? null;
    }
    res.status(201).json(responseBody);
  } catch (error: any) {
    console.error("[Response Routes] Create response error:", error);
    res.status(500).json({ error: "Failed to submit response" });
  }
});

/**
 * @swagger
 * /api/surveys/{id}/responses:
 *   get:
 *     summary: Get survey responses (protected - only for survey creator)
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id/responses", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { search } = req.query;
    const userId = req.user.claims.sub;

    // Verify survey exists
    const survey = await storage.getSurvey(id);
    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    // Verify ownership - only survey creator can view analytics
    const isOwner = await storage.checkSurveyOwnership(id, userId);
    if (!isOwner) {
      return res.status(403).json({
        error: "Access denied. You can only view analytics for your own surveys.",
      });
    }

    const [responses, count] = await Promise.all([
      search ? storage.searchResponses(id, search as string) : storage.getResponses(id),
      storage.getResponseCount(id),
    ]);

    res.json({
      responses,
      count,
      survey,
    });
  } catch (error: any) {
    console.error("[Response Routes] Get responses error:", error);
    res.status(500).json({ error: "Failed to fetch responses" });
  }
});

/**
 * @swagger
 * /api/surveys/{id}/responses/export:
 *   get:
 *     summary: Export responses as CSV or JSON
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id/responses/export", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { format = "csv" } = req.query;
    const userId = req.user.claims.sub;

    // Verify ownership
    const isOwner = await storage.checkSurveyOwnership(id, userId);
    if (!isOwner) {
      return res.status(403).json({ error: "Access denied" });
    }

    const survey = await storage.getSurvey(id);
    if (!survey) return res.status(404).json({ error: "Survey not found" });

    const responses = await storage.getResponses(id);

    if (format === "json") {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="responses_${id}.json"`);
      res.send(
        JSON.stringify(
          { survey: { title: survey.title, questions: survey.questions }, responses },
          null,
          2
        )
      );
    } else {
      // CSV format
      const headers = [
        "Response ID",
        "Submitted At",
        ...survey.questions.map((q, i) => `Q${i + 1}: ${q.question}`),
      ];
      const rows = responses.map((r) => [
        r.id,
        new Date(r.completedAt).toISOString(),
        ...survey.questions.map((q) => {
          const answer = r.answers[q.id];
          return Array.isArray(answer) ? answer.join("; ") : answer || "";
        }),
      ]);

      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="responses_${id}.csv"`);
      res.send(csv);
    }
  } catch (error: any) {
    console.error("[Response Routes] Export error:", error);
    res.status(500).json({ error: "Failed to export responses" });
  }
});

/**
 * @swagger
 * /api/surveys/{id}/responses/{responseId}:
 *   delete:
 *     summary: Delete a response
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id/responses/:responseId", isAuthenticated, async (req: any, res) => {
  try {
    const { id, responseId } = req.params;
    const userId = req.user.claims.sub;

    const isOwner = await storage.checkSurveyOwnership(id, userId);
    if (!isOwner) return res.status(403).json({ error: "Access denied" });

    const deleted = await storage.deleteResponse(responseId);
    if (!deleted) return res.status(404).json({ error: "Response not found" });

    res.json({ success: true });
  } catch (error: any) {
    console.error("[Response Routes] Delete response error:", error);
    res.status(500).json({ error: "Failed to delete response" });
  }
});

/**
 * @swagger
 * /api/surveys/{id}/responses/bulk-delete:
 *   post:
 *     summary: Bulk delete responses
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/responses/bulk-delete", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { ids } = req.body;
    const userId = req.user.claims.sub;

    if (!Array.isArray(ids)) return res.status(400).json({ error: "IDs array required" });

    const isOwner = await storage.checkSurveyOwnership(id, userId);
    if (!isOwner) return res.status(403).json({ error: "Access denied" });

    const deleted = await storage.deleteResponsesBulk(ids);
    res.json({ deleted });
  } catch (error: any) {
    console.error("[Response Routes] Bulk delete error:", error);
    res.status(500).json({ error: "Failed to delete responses" });
  }
});

/**
 * @swagger
 * /api/surveys/{id}/responses/duplicates:
 *   get:
 *     summary: Detect duplicate responses
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id/responses/duplicates", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.claims.sub;

    const isOwner = await storage.checkSurveyOwnership(id, userId);
    if (!isOwner) return res.status(403).json({ error: "Access denied" });

    const duplicates = await storage.detectDuplicates(id);
    res.json({ duplicates: duplicates.map((group) => ({ count: group.length, responses: group })) });
  } catch (error: any) {
    console.error("[Response Routes] Duplicate detection error:", error);
    res.status(500).json({ error: "Failed to detect duplicates" });
  }
});

/**
 * @swagger
 * /api/surveys/{id}/responses/analyze:
 *   post:
 *     summary: Analyze responses with AI
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/responses/analyze", isAuthenticated, async (req: any, res) => {
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

    const responses = await storage.getResponses(id);
    if (responses.length === 0) {
      return res.status(400).json({ error: "No responses to analyze" });
    }

    const insights = await analyzeResponses(survey.questions, responses, survey.title);
    res.json(insights);
  } catch (error: any) {
    console.error("[Response Routes] Error analyzing responses:", error);
    res.status(500).json({ error: error.message || "Failed to analyze responses" });
  }
});

export default router;
