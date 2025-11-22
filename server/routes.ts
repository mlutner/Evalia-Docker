import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { parsePDFWithVision, parseDocument, generateSurveyFromText, refineSurvey, generateSurveyText, suggestScoringConfig, lastTokenUsage, calculateTokenCost } from "./openrouter";
import { insertSurveySchema, questionSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { emailService } from "./email";
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

// App version - increment this when deploying updates
const APP_VERSION = process.env.APP_VERSION || Date.now().toString();

// Master admin middleware
const isMasterAdmin = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    
    if (!user?.isMasterAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    next();
  } catch (error: any) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ error: "Authorization check failed" });
  }
};

// Helper to log AI usage
const logAIUsage = async (userId: string | undefined, operationType: string, surveyId?: string) => {
  try {
    if (!lastTokenUsage) return;
    
    const cost = calculateTokenCost(lastTokenUsage);
    await storage.logAIUsage({
      userId: userId || null,
      surveyId: surveyId || null,
      operationType,
      model: lastTokenUsage.model,
      inputTokens: lastTokenUsage.inputTokens,
      outputTokens: lastTokenUsage.outputTokens,
      totalTokens: lastTokenUsage.totalTokens,
      estimatedCost: cost,
    });
    
    console.log(`✓ Logged ${operationType}: ${lastTokenUsage.totalTokens} tokens ($${cost})`);
  } catch (err: any) {
    console.warn("Failed to log AI usage:", err.message);
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Serve static assets from attached_assets directory
  const assetsPath = path.resolve(import.meta.dirname, "..", "attached_assets");
  app.use("/attached_assets", express.static(assetsPath));
  
  // Setup Replit Auth (supports Google + Email/Password)
  await setupAuth(app);

  // Get app version (public endpoint - no auth required)
  app.get("/api/version", (req: any, res) => {
    res.json({ version: APP_VERSION });
  });

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

  // Get user email settings (protected)
  app.get("/api/user/email-settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      
      res.json({
        hasResendApiKey: !!user.resendApiKey,
      });
    } catch (error) {
      console.error("Error fetching email settings:", error);
      res.status(500).json({ error: "Failed to fetch email settings" });
    }
  });

  // Update user email settings (protected)
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

      res.json({
        success: true,
        hasResendApiKey: true,
      });
    } catch (error) {
      console.error("Error updating email settings:", error);
      res.status(500).json({ error: "Failed to update email settings" });
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
        await logAIUsage(req.user.claims.sub, "document_parsing");
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

  // Generate survey from text prompt or file (protected)
  app.post("/api/generate-survey", isAuthenticated, async (req, res) => {
    try {
      const { prompt, fileData } = req.body;

      if (!prompt && !fileData) {
        return res.status(400).json({ error: "Prompt or file is required" });
      }

      let contentToProcess = prompt || "";

      // Process file if provided
      if (fileData && fileData.base64) {
        try {
          const buffer = Buffer.from(fileData.base64, "base64");
          const fileType = fileData.type;

          if (fileType === "application/pdf") {
            contentToProcess = await parsePDFWithVision(buffer, fileData.name);
          } else if (
            fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            fileType === "application/msword"
          ) {
            const result = await mammoth.extractRawText({ buffer });
            contentToProcess = result.value;
          } else if (fileType === "text/plain") {
            contentToProcess = buffer.toString("utf-8");
          } else if (fileType.startsWith("image/")) {
            // For images, add context about the image to the prompt
            contentToProcess = prompt
              ? `${prompt}\n\n[Image file: ${fileData.name}]`
              : `Analyze the content in the image "${fileData.name}" and generate survey questions based on what it contains.`;
          } else {
            return res.status(400).json({ error: "Unsupported file type for survey generation" });
          }

          // If user also provided a prompt, combine them
          if (prompt && prompt.trim()) {
            contentToProcess = `${prompt}\n\nFile content:\n${contentToProcess}`;
          }
        } catch (fileError: any) {
          console.error("File processing error:", fileError);
          return res.status(400).json({ error: "Failed to process file" });
        }
      }

      const survey = await generateSurveyFromText(contentToProcess);
      await logAIUsage(req.user.claims.sub, "survey_generation");

      res.json({
        title: survey.title,
        questions: survey.questions,
        ...(survey.scoreConfig && { scoreConfig: survey.scoreConfig }),
      });
    } catch (error: any) {
      console.error("Survey generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate survey" });
    }
  });

  // AI chat for survey refinements (protected)
  app.post("/api/chat", isAuthenticated, async (req, res) => {
    try {
      const { message, survey, history, fileData } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      if (!survey || typeof survey !== "object") {
        return res.status(400).json({ error: "Survey data is required" });
      }

      if (!Array.isArray(survey.questions)) {
        return res.status(400).json({ error: "Survey questions are required" });
      }

      const result = await refineSurvey(survey, message, history || [], fileData);
      await logAIUsage(req.user.claims.sub, "survey_refinement");

      res.json(result);
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message || "Failed to process chat message" });
    }
  });

  // Generate survey text fields with AI (protected)
  app.post("/api/generate-text", isAuthenticated, async (req, res) => {
    try {
      const { fieldType, surveyTitle, questions, scoreConfig } = req.body;

      if (!fieldType || !["description", "welcomeMessage", "thankYouMessage", "resultsSummary"].includes(fieldType)) {
        return res.status(400).json({ error: "Valid fieldType is required (description, welcomeMessage, thankYouMessage, or resultsSummary)" });
      }

      if (!surveyTitle || typeof surveyTitle !== "string") {
        return res.status(400).json({ error: "Survey title is required" });
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: "Survey questions are required" });
      }

      const text = await generateSurveyText(fieldType, surveyTitle, questions, scoreConfig);
      await logAIUsage(req.user.claims.sub, "text_generation");

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
      
      // Calculate response count, question count, and respondent metrics for each survey
      const surveysWithCounts = await Promise.all(
        surveys.map(async (survey) => {
          const responseCount = await storage.getResponseCount(survey.id);
          const questionCount = survey.questions?.length || 0;
          const metrics = await storage.getRespondentMetrics(survey.id);
          console.log(`Survey ${survey.id} has ${responseCount} responses, ${questionCount} questions, ${metrics.totalInvited} invited`);
          return {
            ...survey,
            responseCount,
            questionCount,
            respondentCount: metrics.totalInvited,
          };
        })
      );
      
      console.log('Returning surveys with counts:', surveysWithCounts.map(s => ({ id: s.id, responseCount: s.responseCount, respondentCount: s.respondentCount })));
      res.json(surveysWithCounts);
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
      const responseCount = await storage.getResponseCount(survey.id);
      const questionCount = survey.questions?.length || 0;
      const metrics = await storage.getRespondentMetrics(survey.id);
      res.status(201).json({
        ...survey,
        responseCount,
        questionCount,
        respondentCount: metrics.totalInvited,
      });
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
      const responseCount = await storage.getResponseCount(survey?.id || id);
      const questionCount = survey?.questions?.length || 0;
      res.json({
        ...survey,
        responseCount,
        questionCount,
      });
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

  // Duplicate survey (protected)
  app.post("/api/surveys/:id/duplicate", isAuthenticated, async (req: any, res) => {
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
      console.error("Duplicate survey error:", error);
      res.status(500).json({ error: "Failed to duplicate survey" });
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

      // Calculate response and question counts
      const responseCount = await storage.getResponseCount(id);
      const questionCount = survey.questions?.length || 0;

      res.json({
        ...survey,
        responseCount,
        questionCount,
      });
    } catch (error: any) {
      console.error("Get survey error:", error);
      res.status(500).json({ error: "Failed to fetch survey" });
    }
  });

  // Auto-generate scoring configuration (protected)
  app.post("/api/generate-scoring-config", isAuthenticated, async (req: any, res) => {
    try {
      const { questions } = req.body;
      if (!questions || !Array.isArray(questions)) {
        return res.status(400).json({ error: "Questions array required" });
      }

      const config = await suggestScoringConfig("Generated Survey", questions);
      res.json({ config });
    } catch (error: any) {
      console.error("Generate scoring config error:", error);
      res.status(500).json({ error: "Failed to generate scoring configuration" });
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


      // Validate answers exist
      if (!answers || typeof answers !== "object") {
        return res.status(400).json({ error: "Answers are required" });
      }

      const response = await storage.createResponse(id, answers);
      console.log(`Response created for survey ${id}:`, response);
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

  // Invite respondents to survey (protected) - Phase 4
  app.post("/api/surveys/:id/invite", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { respondents } = req.body; // Array of {email, name}
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
        
        // Try to send email
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

      const message = emailsSent > 0 
        ? `Invited ${created.length} respondent${created.length !== 1 ? 's' : ''} (${emailsSent} emails sent)`
        : `Invited ${created.length} respondent${created.length !== 1 ? 's' : ''} (emails not configured)`;

      res.json({ invited: created.length, emailsSent, respondents: created, message });
    } catch (error: any) {
      console.error("Invite respondents error:", error);
      res.status(500).json({ error: "Failed to invite respondents" });
    }
  });

  // Get respondents for survey (protected)
  app.get("/api/surveys/:id/respondents", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;

      const isOwner = await storage.checkSurveyOwnership(id, userId);
      if (!isOwner) return res.status(403).json({ error: "Access denied" });

      const respondents = await storage.getAllRespondents(id);
      res.json(respondents);
    } catch (error: any) {
      console.error("Get respondents error:", error);
      res.status(500).json({ error: "Failed to fetch respondents" });
    }
  });

  // Delete respondent (protected)
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
      console.error("Delete respondent error:", error);
      res.status(500).json({ error: "Failed to delete respondent" });
    }
  });

  // ==== ADMIN ENDPOINTS ====

  // Get AI usage stats (admin only)
  app.get("/api/admin/ai-usage-stats", isAuthenticated, isMasterAdmin, async (req: any, res) => {
    try {
      const { total, last24h } = await storage.getAIUsageStats();

      // Aggregate stats
      const byOperation: Record<string, { tokens: number; cost: string; count: number }> = {};
      const byModel: Record<string, { tokens: number; cost: string }> = {};
      let totalTokens = 0;
      let totalCost = 0;

      total.forEach(log => {
        totalTokens += log.totalTokens;
        totalCost += parseFloat(log.estimatedCost);

        if (!byOperation[log.operationType]) {
          byOperation[log.operationType] = { tokens: 0, cost: "0", count: 0 };
        }
        byOperation[log.operationType].tokens += log.totalTokens;
        byOperation[log.operationType].count += 1;

        if (!byModel[log.model]) {
          byModel[log.model] = { tokens: 0, cost: "0" };
        }
        byModel[log.model].tokens += log.totalTokens;
      });

      // Recalculate costs from totals
      Object.keys(byOperation).forEach(op => {
        const cost = byOperation[op].tokens / 1_000_000 * 4; // Approximate average
        byOperation[op].cost = cost.toFixed(6);
      });

      Object.keys(byModel).forEach(model => {
        const cost = byModel[model].tokens / 1_000_000 * 4;
        byModel[model].cost = cost.toFixed(6);
      });

      // Last 24h stats
      let last24hTokens = 0;
      let last24hCost = 0;
      last24h.forEach(log => {
        last24hTokens += log.totalTokens;
        last24hCost += parseFloat(log.estimatedCost);
      });

      res.json({
        totalTokens,
        totalCost: totalCost.toFixed(6),
        operationCount: total.length,
        byOperation,
        byModel,
        last24h: { tokens: last24hTokens, cost: last24hCost.toFixed(6) },
      });
    } catch (error: any) {
      console.error("Get AI usage stats error:", error);
      res.status(500).json({ error: "Failed to fetch AI usage stats" });
    }
  });

  // Get admin settings (admin only)
  app.get("/api/admin/settings", isAuthenticated, isMasterAdmin, async (req: any, res) => {
    try {
      const settings = await storage.getAdminAISettings();
      res.json(settings);
    } catch (error: any) {
      console.error("Get admin settings error:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // Update API key (admin only)
  app.post("/api/admin/api-key", isAuthenticated, isMasterAdmin, async (req: any, res) => {
    try {
      const { provider, apiKey } = req.body;

      const validFunctions = [
        "survey_generation",
        "survey_refinement",
        "document_parsing",
        "response_scoring",
        "quick_suggestions",
        "response_analysis",
      ];

      if (!provider || !validFunctions.includes(provider)) {
        return res.status(400).json({ error: `Invalid function. Must be one of: ${validFunctions.join(", ")}` });
      }

      if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length < 10) {
        return res.status(400).json({ error: "Invalid API key. Must be a non-empty string (at least 10 characters)" });
      }

      await storage.updateAdminAISettings({
        apiKeys: { [provider]: { key: apiKey, rotated: new Date().toISOString() } }
      });

      console.log(`✓ API key updated for ${provider}`);
      res.json({
        success: true,
        message: `${provider} API key updated successfully. Settings have been saved and are now active.`,
      });
    } catch (error: any) {
      console.error("❌ Update API key error:", error.message);
      res.status(500).json({ error: error.message || "Failed to update API key. Please try again." });
    }
  });

  // Update model (admin only)
  app.post("/api/admin/model", isAuthenticated, isMasterAdmin, async (req: any, res) => {
    try {
      const { provider, model } = req.body;

      const validFunctions = [
        "survey_generation",
        "survey_refinement",
        "document_parsing",
        "response_scoring",
        "quick_suggestions",
        "response_analysis",
      ];

      if (!provider || !validFunctions.includes(provider)) {
        return res.status(400).json({ error: `Invalid function. Must be one of: ${validFunctions.join(", ")}` });
      }

      if (!model || typeof model !== "string" || model.trim().length === 0) {
        return res.status(400).json({ error: "Model name cannot be empty" });
      }

      await storage.updateAdminAISettings({
        models: { [provider]: model }
      });

      res.json({
        success: true,
        message: `${provider} model updated to "${model}". New settings are now active.`,
      });
    } catch (error: any) {
      console.error("Update model error:", error);
      res.status(500).json({ error: "Failed to update model" });
    }
  });

  // Enhance prompt with AI
  app.post("/api/enhance-prompt", isAuthenticated, async (req: any, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
        return res.status(400).json({ error: "Prompt cannot be empty" });
      }

      const settings = await storage.getAdminAISettings();
      const apiKey = settings.apiKeys.survey_generation?.key;
      const baseUrl = settings.baseUrls.survey_generation || "https://openrouter.ai/api/v1";
      const parameters = settings.parameters.survey_generation;

      if (!apiKey) {
        return res.status(500).json({ error: "AI enhancement not configured by admin" });
      }

      const enhancedUserPrompt = `Improve this survey prompt to make it more comprehensive and specific:

${prompt}

Return ONLY the improved prompt text, nothing else.`;

      // Use OpenRouter's Auto Model Selection for intelligent, cost-optimized model routing
      // This automatically selects the best model for the prompt while optimizing costs
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://evalia.replit.dev",
          "X-Title": "Evalia Survey Builder",
        },
        body: JSON.stringify({
          model: "openrouter/auto",
          messages: [
            { role: "user", content: enhancedUserPrompt },
          ],
          temperature: parameters?.temperature || 0.7,
          max_tokens: parameters?.max_tokens || 1024,
          provider: {
            sort: "price",
            allow_fallbacks: true,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI API error:", errorText);
        return res.status(500).json({ error: "Failed to enhance prompt with AI" });
      }

      const data = await response.json();
      console.log("OpenRouter response status: success, choices count:", data.choices?.length);
      
      const enhancedPrompt = data.choices?.[0]?.message?.content;

      if (!enhancedPrompt) {
        console.error("No enhanced prompt. Response:", JSON.stringify(data).substring(0, 300));
        return res.status(500).json({ error: "No response from AI" });
      }

      res.json({
        success: true,
        enhancedPrompt: enhancedPrompt.trim(),
      });
    } catch (error: any) {
      console.error("Enhance prompt error:", error.message);
      res.status(500).json({ error: "Failed to enhance prompt: " + error.message });
    }
  });

  // Test all AI APIs (admin only)
  app.post("/api/admin/test-ai", isAuthenticated, isMasterAdmin, async (req: any, res) => {
    try {
      const settings = await storage.getAdminAISettings();
      const testResults: Record<string, any> = {};
      
      const functions = [
        "survey_generation",
        "survey_refinement",
        "document_parsing",
        "response_scoring",
        "quick_suggestions",
        "response_analysis",
      ];

      for (const func of functions) {
        const apiKey = settings.apiKeys[func]?.key;
        const model = settings.models[func];
        const baseUrl = settings.baseUrls[func];
        
        if (!apiKey) {
          testResults[func] = { status: "MISSING_KEY", error: "API key not configured" };
          continue;
        }

        try {
          // Make a simple test call to each API
          const response = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [{ role: "user", content: "Say 'ok'" }],
              max_tokens: 10,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            testResults[func] = {
              status: "SUCCESS",
              model,
              baseUrl,
              response: data.choices?.[0]?.message?.content,
            };
          } else {
            const errorText = await response.text();
            testResults[func] = {
              status: "FAILED",
              statusCode: response.status,
              model,
              baseUrl,
              error: errorText.substring(0, 200),
            };
          }
        } catch (error: any) {
          testResults[func] = {
            status: "ERROR",
            model,
            baseUrl,
            error: error.message,
          };
        }
      }

      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        results: testResults,
      });
    } catch (error: any) {
      console.error("Test AI error:", error);
      res.status(500).json({ error: "Failed to test AI APIs" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
