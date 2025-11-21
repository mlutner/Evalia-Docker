import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { parsePDFWithVision, parseDocument, generateSurveyFromText, refineSurvey, generateSurveyText } from "./openrouter";
import { insertSurveySchema, questionSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import "./types";

// Pool of survey illustrations - rotated across surveys
const SURVEY_ILLUSTRATIONS = [
  "/attached_assets/1_1763757398561.png",
  "/attached_assets/2_1763757398561.png",
  "/attached_assets/3_1763757398561.png",
  "/attached_assets/image_1763763890940.png",
  "/attached_assets/image_1763763953056.png",
  "/attached_assets/Heading_1763764033818.png",
];

// Helper to get a random illustration from the pool
function getRandomIllustration(): string {
  return SURVEY_ILLUSTRATIONS[Math.floor(Math.random() * SURVEY_ILLUSTRATIONS.length)];
}

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Serve static assets from attached_assets directory
  const assetsPath = path.resolve(import.meta.dirname, "..", "attached_assets");
  app.use("/attached_assets", express.static(assetsPath));
  
  // Setup Replit Auth (supports Google + Email/Password)
  await setupAuth(app);

  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Legacy user endpoint (for compatibility)
  app.get("/api/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Parse uploaded document (protected)
  app.post("/api/parse-document", isAuthenticated, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          error: "No file was uploaded", 
          tip: "Please select a PDF, DOCX, or TXT file to continue" 
        });
      }

      const fileName = req.file.originalname;
      const fileType = req.file.mimetype;
      const fileSizeKB = Math.round(req.file.size / 1024);

      // Check file size (max 10MB)
      if (req.file.size > 10 * 1024 * 1024) {
        return res.status(400).json({ 
          error: `File is too large (${fileSizeKB} KB)`, 
          tip: "Please upload a file smaller than 10MB" 
        });
      }

      let extractedText = "";

      // Extract text based on file type
      if (fileType === "application/pdf") {
        try {
          // Use Mistral Vision API for PDF OCR
          extractedText = await parsePDFWithVision(req.file.buffer, fileName);
          console.log(`PDF extracted ${extractedText.length} characters via Mistral Vision`);
        } catch (pdfError: any) {
          console.error("PDF parsing error:", pdfError);
          return res.status(400).json({ 
            error: "Unable to read this PDF file", 
            tip: "The PDF might be password-protected, corrupted, or contain only images. Try saving it as a new PDF or using a different file." 
          });
        }
      } else if (
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileType === "application/msword"
      ) {
        try {
          const result = await mammoth.extractRawText({ buffer: req.file.buffer });
          extractedText = result.value;
        } catch (docxError: any) {
          console.error("DOCX parsing error:", docxError);
          return res.status(400).json({ 
            error: "Unable to read this Word document", 
            tip: "The document might be corrupted or in an unsupported format. Try saving it as a new .docx file." 
          });
        }
      } else if (fileType === "text/plain") {
        extractedText = req.file.buffer.toString("utf-8");
      } else {
        return res.status(400).json({ 
          error: `Unsupported file type: ${fileType}`, 
          tip: "Please upload a PDF (.pdf), Word (.docx), or text (.txt) file." 
        });
      }

      if (!extractedText.trim()) {
        return res.status(400).json({ 
          error: "No text content found in the document", 
          tip: "The document appears to be empty or contains only images. Please upload a document with text content." 
        });
      }

      // Check minimum text length
      if (extractedText.trim().length < 50) {
        return res.status(400).json({ 
          error: "Document contains very little text", 
          tip: "The document needs more content to generate meaningful survey questions. Please upload a document with at least a few sentences." 
        });
      }

      // Generate survey from extracted text
      let survey;
      try {
        survey = await generateSurveyFromText(extractedText, `Document: ${fileName}`);
      } catch (aiError: any) {
        console.error("AI generation error:", aiError);
        return res.status(500).json({ 
          error: "AI failed to generate questions from the document", 
          tip: "The document content might be too complex or unclear. Try uploading a different document or use the AI prompt feature instead." 
        });
      }

      if (!survey.questions || survey.questions.length === 0) {
        return res.status(400).json({ 
          error: "Could not generate questions from this document", 
          tip: "The document content might not be suitable for survey generation. Try uploading a training manual, course outline, or educational document." 
        });
      }

      res.json({
        parsedText: extractedText,
        title: survey.title,
        questions: survey.questions,
      });
    } catch (error: any) {
      console.error("Document parsing error:", error);
      res.status(500).json({ 
        error: "An unexpected error occurred while processing your document", 
        tip: "Please try again or contact support if the problem persists." 
      });
    }
  });

  // Generate survey from text prompt (protected)
  app.post("/api/generate-survey", isAuthenticated, async (req, res) => {
    try {
      const { prompt } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const survey = await generateSurveyFromText(prompt);

      res.json({
        title: survey.title,
        questions: survey.questions,
      });
    } catch (error: any) {
      console.error("Survey generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate survey" });
    }
  });

  // AI chat for survey refinements (protected)
  app.post("/api/chat", isAuthenticated, async (req, res) => {
    try {
      const { message, survey, history } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      if (!survey || typeof survey !== "object") {
        return res.status(400).json({ error: "Survey data is required" });
      }

      if (!Array.isArray(survey.questions)) {
        return res.status(400).json({ error: "Survey questions are required" });
      }

      const result = await refineSurvey(survey, message, history || []);

      res.json(result);
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message || "Failed to process chat message" });
    }
  });

  // Generate survey text fields with AI (protected)
  app.post("/api/generate-text", isAuthenticated, async (req, res) => {
    try {
      const { fieldType, surveyTitle, questions } = req.body;

      if (!fieldType || !["description", "welcomeMessage", "thankYouMessage"].includes(fieldType)) {
        return res.status(400).json({ error: "Valid fieldType is required (description, welcomeMessage, or thankYouMessage)" });
      }

      if (!surveyTitle || typeof surveyTitle !== "string") {
        return res.status(400).json({ error: "Survey title is required" });
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: "Survey questions are required" });
      }

      const text = await generateSurveyText(fieldType, surveyTitle, questions);

      res.json({ text });
    } catch (error: any) {
      console.error("Text generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate text" });
    }
  });

  // Get available illustrations (public)
  app.get("/api/illustrations", async (req, res) => {
    try {
      res.json({ illustrations: SURVEY_ILLUSTRATIONS });
    } catch (error: any) {
      console.error("Get illustrations error:", error);
      res.status(500).json({ error: "Failed to fetch illustrations" });
    }
  });

  // Upload illustration (protected)
  app.post("/api/upload-illustration", isAuthenticated, upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Save the file to attached_assets directory
      const timestamp = Date.now();
      const filename = `illustration_${timestamp}_${req.file.originalname}`;
      const filepath = `/attached_assets/${filename}`;

      // Write file to disk
      const fs = require("fs");
      const fullPath = path.resolve(import.meta.dirname, "..", "attached_assets", filename);
      fs.writeFileSync(fullPath, req.file.buffer);

      res.json({ url: filepath });
    } catch (error: any) {
      console.error("Upload illustration error:", error);
      res.status(500).json({ error: "Failed to upload illustration" });
    }
  });

  // Get all surveys (protected)
  app.get("/api/surveys", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const surveys = await storage.getAllSurveys(userId);
      res.json(surveys);
    } catch (error: any) {
      console.error("Get surveys error:", error);
      res.status(500).json({ error: "Failed to fetch surveys" });
    }
  });

  // Create new survey (protected)
  app.post("/api/surveys", isAuthenticated, async (req: any, res) => {
    try {
      const validationResult = insertSurveySchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: fromZodError(validationResult.error).message 
        });
      }

      const userId = req.user.claims.sub;
      // Auto-assign a random illustration to the survey
      const surveyData = {
        ...validationResult.data,
        illustrationUrl: getRandomIllustration(),
      };
      const survey = await storage.createSurvey(surveyData, userId);
      res.status(201).json(survey);
    } catch (error: any) {
      console.error("Create survey error:", error);
      res.status(500).json({ error: "Failed to create survey" });
    }
  });

  // Update survey (protected)
  app.put("/api/surveys/:id", isAuthenticated, async (req, res) => {
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
      res.json(survey);
    } catch (error: any) {
      console.error("Update survey error:", error);
      res.status(500).json({ error: "Failed to update survey" });
    }
  });

  // Delete survey (protected)
  app.delete("/api/surveys/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSurvey(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Survey not found" });
      }

      res.status(204).send();
    } catch (error: any) {
      console.error("Delete survey error:", error);
      res.status(500).json({ error: "Failed to delete survey" });
    }
  });

  // Get single survey (public - no authentication required)
  app.get("/api/surveys/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const survey = await storage.getSurvey(id);
      
      if (!survey) {
        return res.status(404).json({ error: "Survey not found" });
      }

      res.json(survey);
    } catch (error: any) {
      console.error("Get survey error:", error);
      res.status(500).json({ error: "Failed to fetch survey" });
    }
  });

  // Submit survey response (public - no authentication required)
  app.post("/api/surveys/:id/responses", async (req, res) => {
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
        return res.status(403).json({ error: `Survey is ${survey.status}. No new responses are being accepted.` });
      }

      // Check expiration date
      if (survey.expiresAt && new Date(survey.expiresAt) < new Date()) {
        return res.status(403).json({ error: "Survey has expired and is no longer accepting responses." });
      }

      // Check response limit
      if (survey.maxResponses) {
        const count = await storage.getResponseCount(id);
        if (count >= survey.maxResponses) {
          return res.status(403).json({ error: "Survey has reached its maximum number of responses." });
        }
      }

      // Validate answers exist
      if (!answers || typeof answers !== "object") {
        return res.status(400).json({ error: "Answers are required" });
      }

      const response = await storage.createResponse(id, answers);
      res.status(201).json(response);
    } catch (error: any) {
      console.error("Create response error:", error);
      res.status(500).json({ error: "Failed to submit response" });
    }
  });

  // Get survey responses with count (protected - only for survey creator)
  app.get("/api/surveys/:id/responses", isAuthenticated, async (req: any, res) => {
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
        return res.status(403).json({ error: "Access denied. You can only view analytics for your own surveys." });
      }

      let responses = search ? await storage.searchResponses(id, search) : await storage.getResponses(id);
      const count = await storage.getResponseCount(id);

      res.json({
        responses,
        count,
        survey,
      });
    } catch (error: any) {
      console.error("Get responses error:", error);
      res.status(500).json({ error: "Failed to fetch responses" });
    }
  });

  // Export responses as CSV or JSON (protected)
  app.get("/api/surveys/:id/responses/export", isAuthenticated, async (req: any, res) => {
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
        res.send(JSON.stringify({ survey: { title: survey.title, questions: survey.questions }, responses }, null, 2));
      } else {
        // CSV format
        const headers = ["Response ID", "Submitted At", ...survey.questions.map((q, i) => `Q${i + 1}: ${q.question}`)];
        const rows = responses.map(r => [
          r.id,
          new Date(r.completedAt).toISOString(),
          ...survey.questions.map(q => {
            const answer = r.answers[q.id];
            return Array.isArray(answer) ? answer.join("; ") : answer || "";
          }),
        ]);

        const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="responses_${id}.csv"`);
        res.send(csv);
      }
    } catch (error: any) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Failed to export responses" });
    }
  });

  // Delete response (protected)
  app.delete("/api/surveys/:id/responses/:responseId", isAuthenticated, async (req: any, res) => {
    try {
      const { id, responseId } = req.params;
      const userId = req.user.claims.sub;

      const isOwner = await storage.checkSurveyOwnership(id, userId);
      if (!isOwner) return res.status(403).json({ error: "Access denied" });

      const deleted = await storage.deleteResponse(responseId);
      if (!deleted) return res.status(404).json({ error: "Response not found" });

      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete response error:", error);
      res.status(500).json({ error: "Failed to delete response" });
    }
  });

  // Bulk delete responses (protected)
  app.post("/api/surveys/:id/responses/bulk-delete", isAuthenticated, async (req: any, res) => {
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
      console.error("Bulk delete error:", error);
      res.status(500).json({ error: "Failed to delete responses" });
    }
  });

  // Detect duplicate responses (protected)
  app.get("/api/surveys/:id/responses/duplicates", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;

      const isOwner = await storage.checkSurveyOwnership(id, userId);
      if (!isOwner) return res.status(403).json({ error: "Access denied" });

      const duplicates = await storage.detectDuplicates(id);
      res.json({ duplicates: duplicates.map(group => ({ count: group.length, responses: group })) });
    } catch (error: any) {
      console.error("Duplicate detection error:", error);
      res.status(500).json({ error: "Failed to detect duplicates" });
    }
  });

  // Update survey status (protected)
  app.patch("/api/surveys/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.claims.sub;

      if (!["Active", "Paused", "Closed"].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be Active, Paused, or Closed." });
      }

      const isOwner = await storage.checkSurveyOwnership(id, userId);
      if (!isOwner) return res.status(403).json({ error: "Access denied" });

      const updated = await storage.updateSurvey(id, { status } as any);
      if (!updated) return res.status(404).json({ error: "Survey not found" });

      res.json(updated);
    } catch (error: any) {
      console.error("Update status error:", error);
      res.status(500).json({ error: "Failed to update survey status" });
    }
  });

  // Update survey control settings (protected)
  app.patch("/api/surveys/:id/settings", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { expiresAt, maxResponses } = req.body;
      const userId = req.user.claims.sub;

      const isOwner = await storage.checkSurveyOwnership(id, userId);
      if (!isOwner) return res.status(403).json({ error: "Access denied" });

      const updates: any = {};
      if (expiresAt !== undefined) updates.expiresAt = expiresAt ? new Date(expiresAt) : null;
      if (maxResponses !== undefined) updates.maxResponses = maxResponses > 0 ? maxResponses : null;

      const updated = await storage.updateSurvey(id, updates);
      if (!updated) return res.status(404).json({ error: "Survey not found" });

      res.json(updated);
    } catch (error: any) {
      console.error("Update settings error:", error);
      res.status(500).json({ error: "Failed to update survey settings" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
