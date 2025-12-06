/**
 * Route Index - Central route registration
 * 
 * @module routes
 */

import { Express, Router } from "express";
import { createServer, type Server } from "http";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";
import swaggerUi from "swagger-ui-express";

import { setupAuth, isAuthenticated } from "../replitAuth";
import { storage } from "../storage";
import { getDashboardMetrics } from "../dashboard";
import { emailService } from "../email";
import { swaggerSpec } from "../swagger";
import { getVersionInfo, APP_VERSION, BUILD_DATE, CHANGELOG } from "@shared/version";
import { requestLogger, errorHandler, notFoundHandler } from "../middleware/errorHandler";

// Route modules
import surveyRoutes from "./surveys";
import aiRoutes from "./ai";
import responseRoutes from "./responses";
import aiTestRouter from "./aiTest";
import analyticsRoutes from "./analytics";

// Pool of survey illustrations
const SURVEY_ILLUSTRATIONS = [
  "/attached_assets/1_1763757398561.png",
  "/attached_assets/2_1763757398561.png",
  "/attached_assets/3_1763757398561.png",
  "/attached_assets/image_1763763890940.png",
  "/attached_assets/image_1763763953056.png",
  "/attached_assets/Heading_1763764033818.png",
];

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS configuration
  const corsOrigins = [
    "http://localhost:5000",
    "http://localhost:3000",
    "http://localhost:4000",
    "https://evaliasurvey.ca",
    "https://www.evaliasurvey.ca",
    "https://evalia-survey-mike913.replit.app",
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (corsOrigins.includes(origin)) return callback(null, true);
        if (process.env.NODE_ENV !== "production") return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Request logging (development only)
  if (process.env.NODE_ENV === "development") {
    app.use(requestLogger);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HEALTH CHECK ENDPOINTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  app.get("/healthz", (_req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  app.get("/readyz", async (_req, res) => {
    try {
      const dbHealthy = await storage.healthCheck();
      if (!dbHealthy) {
        return res.status(503).json({
          status: "not ready",
          timestamp: new Date().toISOString(),
          checks: { database: "unhealthy" },
        });
      }
      res.status(200).json({
        status: "ready",
        timestamp: new Date().toISOString(),
        checks: { database: "healthy" },
      });
    } catch (error) {
      res.status(503).json({
        status: "not ready",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      });
    }
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATIC ASSETS & SWAGGER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const assetsPath = path.resolve(import.meta.dirname, "..", "..", "attached_assets");
  app.use("/attached_assets", express.static(assetsPath));

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: "list",
        filter: true,
        showRequestHeaders: true,
        supportedSubmitMethods: ["get", "post", "put", "delete", "patch"],
      },
    })
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // AUTH SETUP
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  await setupAuth(app);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PUBLIC ENDPOINTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // App version
  app.get("/api/version", (_req, res) => {
    res.json({
      version: APP_VERSION,
      buildDate: BUILD_DATE,
      changelog: CHANGELOG,
    });
  });

  // Illustrations
  app.get("/api/illustrations", (_req, res) => {
    res.json({ illustrations: SURVEY_ILLUSTRATIONS });
  });

  // Short URL redirect
  app.get("/s/:code", async (req, res) => {
    try {
      const code = req.params.code;
      const surveyId = await storage.getShortUrlSurveyId(code);
      if (!surveyId) {
        return res.status(404).json({ error: "Survey not found" });
      }
      res.redirect(`/survey/${surveyId}`);
    } catch (error) {
      res.status(500).json({ error: "Failed to redirect" });
    }
  });

  // Templates (public)
  app.get("/api/templates", async (_req, res) => {
    try {
      const templates = await storage.getAllTemplates();
      res.json(templates);
    } catch (error) {
      console.error("[Routes] Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) return res.status(404).json({ error: "Template not found" });
      res.json(template);
    } catch (error) {
      console.error("[Routes] Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // AUTHENTICATED ENDPOINTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // User routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("[Routes] Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error: any) {
      console.error("[Routes] Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/user/email-settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ hasResendApiKey: !!user.resendApiKey });
    } catch (error) {
      console.error("[Routes] Error fetching email settings:", error);
      res.status(500).json({ error: "Failed to fetch email settings" });
    }
  });

  app.patch("/api/user/email-settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { resendApiKey } = req.body;

      if (!resendApiKey || typeof resendApiKey !== "string") {
        return res.status(400).json({ error: "Invalid API key" });
      }
      if (!resendApiKey.startsWith("re_")) {
        return res.status(400).json({ error: "API key must start with 're_'" });
      }

      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const updated = await storage.updateUser(userId, { resendApiKey });
      if (!updated) return res.status(500).json({ error: "Failed to update settings" });

      res.json({ success: true, hasResendApiKey: true });
    } catch (error) {
      console.error("[Routes] Error updating email settings:", error);
      res.status(500).json({ error: "Failed to update email settings" });
    }
  });

  // Dashboard
  app.get("/api/dashboard/metrics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const metrics = await getDashboardMetrics(userId);
      res.json(metrics);
    } catch (error: any) {
      console.error("[Routes] Error fetching dashboard metrics:", error);
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  });

  // Respondent routes
  app.post("/api/surveys/:id/invite", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { respondents } = req.body;
      const userId = req.user.claims.sub;

      const isOwner = await storage.checkSurveyOwnership(id, userId);
      if (!isOwner) return res.status(403).json({ error: "Access denied" });

      const survey = await storage.getSurvey(id);
      if (!survey) return res.status(404).json({ error: "Survey not found" });

      const created = [];
      let emailsSent = 0;

      for (const respondent of respondents) {
        const r = await storage.createRespondent(id, respondent);
        const surveyUrl = `${process.env.APP_URL || "http://localhost:5000"}/survey/${id}?respondent=${r.respondentToken}`;

        const emailSent = await emailService.sendSurveyInvitation(
          respondent.email!,
          respondent.name,
          survey.title,
          surveyUrl,
          survey.trainerName || undefined
        );

        if (emailSent) emailsSent++;
        created.push(r);
      }

      const message =
        emailsSent > 0
          ? `Invited ${created.length} respondent${created.length !== 1 ? "s" : ""} (${emailsSent} emails sent)`
          : `Invited ${created.length} respondent${created.length !== 1 ? "s" : ""} (emails not configured)`;

      res.json({ invited: created.length, emailsSent, respondents: created, message });
    } catch (error: any) {
      console.error("[Routes] Invite respondents error:", error);
      res.status(500).json({ error: "Failed to invite respondents" });
    }
  });

  app.get("/api/surveys/:id/respondents", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;

      const isOwner = await storage.checkSurveyOwnership(id, userId);
      if (!isOwner) return res.status(403).json({ error: "Access denied" });

      const respondents = await storage.getAllRespondents(id);
      res.json(respondents);
    } catch (error: any) {
      console.error("[Routes] Get respondents error:", error);
      res.status(500).json({ error: "Failed to fetch respondents" });
    }
  });

  app.delete("/api/surveys/:surveyId/respondents/:respondentId", isAuthenticated, async (req: any, res) => {
    try {
      const { surveyId, respondentId } = req.params;
      const userId = req.user.claims.sub;

      const isOwner = await storage.checkSurveyOwnership(surveyId, userId);
      if (!isOwner) return res.status(403).json({ error: "Access denied" });

      const deleted = await storage.deleteRespondent(respondentId);
      if (!deleted) return res.status(404).json({ error: "Respondent not found" });

      res.json({ success: true });
    } catch (error: any) {
      console.error("[Routes] Delete respondent error:", error);
      res.status(500).json({ error: "Failed to delete respondent" });
    }
  });

  // Illustration upload
  const uploadIllustration = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  app.post("/api/upload-illustration", isAuthenticated, uploadIllustration.single("file"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const timestamp = Date.now();
      const filename = `illustration_${timestamp}_${req.file.originalname}`;
      const filepath = `/attached_assets/${filename}`;
      const fullPath = path.resolve(import.meta.dirname, "..", "..", "attached_assets", filename);
      fs.writeFileSync(fullPath, req.file.buffer);

      res.json({ url: filepath });
    } catch (error: any) {
      console.error("[Routes] Upload illustration error:", error);
      res.status(500).json({ error: "Failed to upload illustration" });
    }
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MODULAR ROUTES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Survey routes
  app.use("/api/surveys", surveyRoutes);

  // Response routes (nested under surveys)
  app.use("/api/surveys", responseRoutes);

  // AI routes
  app.use("/api", aiRoutes);

  // AI Test/Monitoring routes
  app.use("/api/ai/test", aiTestRouter);

  // Analytics routes (5D dashboard)
  app.use("/api/analytics", analyticsRoutes);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ERROR HANDLING (must be last)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Note: Error handler is applied after Vite middleware in index.ts

  const httpServer = createServer(app);
  return httpServer;
}

