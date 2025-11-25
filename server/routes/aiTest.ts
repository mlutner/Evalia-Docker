/**
 * AI Features Test Endpoint
 * Exercises monitoring and A/B testing framework
 */

import { Router } from "express";
import { callMistral } from "../utils/aiClient";
import { aiLogger } from "../utils/aiMonitoring";
import { abTestingManager } from "../utils/abTesting";

const router = Router();

/**
 * GET /api/ai/test/health
 * Simple health check for AI features
 */
router.get("/health", async (req, res) => {
  try {
    const testMessages = [
      { role: "system" as const, content: "You are helpful." },
      { role: "user" as const, content: "Reply with 'OK'." },
    ];

    const result = await callMistral(testMessages, {
      quality: "fast",
      taskType: "health-check",
    });

    const stats = aiLogger.getStats();

    res.json({
      status: "ok",
      aiResponse: result.substring(0, 100),
      monitoringStats: {
        totalCalls: stats.totalCalls,
        successRate: `${stats.successRate.toFixed(2)}%`,
        avgLatency: `${stats.avgLatency.toFixed(0)}ms`,
        totalCost: `$${(stats.totalCost / 100).toFixed(4)}`,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: (error as Error).message,
    });
  }
});

/**
 * GET /api/ai/test/monitoring
 * Get detailed monitoring statistics
 */
router.get("/monitoring", (req, res) => {
  const stats = aiLogger.getStats();
  const recentCalls = aiLogger.getRecentCalls(5);

  res.json({
    summary: {
      totalCalls: stats.totalCalls,
      successRate: `${stats.successRate.toFixed(2)}%`,
      avgLatency: `${stats.avgLatency.toFixed(0)}ms`,
      totalCost: `$${(stats.totalCost / 100).toFixed(4)}`,
    },
    byModel: stats.byModel,
    byTask: stats.byTask,
    recentCalls: recentCalls.map((call) => ({
      taskType: call.taskType,
      model: call.model,
      latency: `${call.latencyMs}ms`,
      cost: `$${(call.costEstimated / 100).toFixed(4)}`,
      success: call.success,
      timestamp: call.timestamp.toISOString(),
    })),
  });
});

/**
 * GET /api/ai/test/ab-testing
 * Get A/B testing configuration and results
 */
router.get("/ab-testing", (req, res) => {
  const activeExperiments = abTestingManager.getActiveExperiments();
  const analysis = abTestingManager.analyzeResults("ab-test-task");

  res.json({
    activeExperiments: Object.keys(activeExperiments).length > 0 ? activeExperiments : "No active experiments",
    analysisResults: {
      byVariant: analysis.byVariant,
      winner: analysis.winner,
      significance: `${(analysis.significance * 100).toFixed(1)}%`,
    },
  });
});

export default router;
