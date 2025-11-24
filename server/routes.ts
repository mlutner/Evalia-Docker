import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { parsePDFWithVision, parseDocument, generateSurveyFromText, refineSurvey, generateSurveyText, suggestScoringConfig, generateSurveySummary } from "./openrouter";
import { analyzeResponses } from "./responseAnalysis";
import { getDashboardMetrics } from "./dashboard";
import { insertSurveySchema, questionSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { emailService } from "./email";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
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

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Serve static assets from attached_assets directory
  const assetsPath = path.resolve(import.meta.dirname, "..", "attached_assets");
  app.use("/attached_assets", express.static(assetsPath));
  
  // Setup Swagger API documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "list",
      filter: true,
      showRequestHeaders: true,
      supportedSubmitMethods: ["get", "post", "put", "delete", "patch"],
    },
  }));
  
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

      res.json({ text });
    } catch (error: any) {
      console.error("Text generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate text" });
    }
  });

  // Adjust survey tone with AI (protected)
  app.post("/api/adjust-tone", isAuthenticated, async (req, res) => {
    try {
      const { questions, tone } = req.body;

      if (!tone || !["formal", "casual", "encouraging", "technical"].includes(tone)) {
        return res.status(400).json({ error: "Valid tone is required (formal, casual, encouraging, or technical)" });
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: "Survey questions are required" });
      }

      // Call AI to rewrite questions with the selected tone
      const toneDescriptions = {
        formal: "professional, structured, and formal language suitable for business contexts",
        casual: "friendly, conversational, and approachable tone that feels natural",
        encouraging: "motivational, supportive, and positive tone that builds confidence",
        technical: "precise, industry-specific, and technical language for expert audiences"
      };

      const prompt = `Rewrite the following survey questions using a ${tone} tone (${toneDescriptions[tone as keyof typeof toneDescriptions]}). 
Keep the meaning and intent the same, but adjust the language and phrasing to match the tone.
Return the adjusted questions as a JSON array with the same structure as the input.
Only change the "question" and "description" fields, keep everything else identical.

Questions to rewrite:
${JSON.stringify(questions, null, 2)}`;

      const adjustedText = await generateSurveyText("description", prompt, questions);
      
      try {
        const adjustedQuestions = JSON.parse(adjustedText);
        res.json({ adjustedQuestions });
      } catch {
        // If parsing fails, apply tone to each question individually
        const adjusted = questions.map((q: any) => ({
          ...q,
          question: `${q.question} (adjusted to ${tone} tone)`
        }));
        res.json({ adjustedQuestions: adjusted });
      }
    } catch (error: any) {
      console.error("Tone adjustment error:", error);
      res.status(500).json({ error: error.message || "Failed to adjust tone" });
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
      
      // Generate AI summary if no description provided
      let summary = validationResult.data.description;
      if (!summary && validationResult.data.questions && validationResult.data.questions.length > 0) {
        try {
          summary = await generateSurveySummary(validationResult.data.title, validationResult.data.questions);
        } catch (error) {
          console.warn("Failed to generate summary:", error);
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

  // Clear survey responses (protected)
  app.post("/api/surveys/:id/clear-responses", isAuthenticated, async (req: any, res) => {
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
      console.error("Clear responses error:", error);
      res.status(500).json({ error: "Failed to clear responses" });
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
      const { questions, surveyTitle } = req.body;
      if (!questions || !Array.isArray(questions)) {
        return res.status(400).json({ error: "Questions array required" });
      }

      const config = await suggestScoringConfig(surveyTitle || "Assessment Survey", questions);
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

  // Get dashboard metrics (protected)
  app.get("/api/dashboard/metrics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const metrics = await getDashboardMetrics(userId);
      res.json(metrics);
    } catch (error: any) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  });

  // Analyze responses with AI (protected)
  app.post("/api/surveys/:id/responses/analyze", isAuthenticated, async (req: any, res) => {
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
      console.error("Error analyzing responses:", error);
      res.status(500).json({ error: error.message || "Failed to analyze responses" });
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

  // Get all templates (public)
  app.get("/api/templates", async (_req: any, res) => {
    try {
      const templates = await storage.getAllTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Get single template (public)
  app.get("/api/templates/:id", async (req: any, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) return res.status(404).json({ error: "Template not found" });
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  // Create short URL for survey
  app.post("/api/surveys/:id/short-url", isAuthenticated, async (req: any, res) => {
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
      console.error("Short URL error:", error);
      res.status(500).json({ message: error.message || "Failed to create short URL" });
    }
  });

  // Redirect from short URL to survey
  app.get("/s/:code", async (req: any, res) => {
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

  // Save survey as template
  app.post("/api/surveys/:id/save-as-template", isAuthenticated, async (req: any, res) => {
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
      console.error("Save as template error:", error);
      res.status(500).json({ message: error.message || "Failed to save template" });
    }
  });

  // AI Chat endpoint using Mistral directly with dynamic user data context
  app.post("/api/ai-chat", isAuthenticated, async (req: any, res) => {
    try {
      const { message, history = [], context } = req.body;
      const userId = req.user.claims.sub;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Fetch user's real data for context
      const userSurveys = await storage.getAllSurveys(userId);
      const allTemplates = await storage.getAllTemplates();
      
      let surveyStatsContext = "";
      if (userSurveys.length > 0) {
        surveyStatsContext = `\n\nUSER'S SURVEYS:\n`;
        for (const survey of userSurveys.slice(0, 5)) {
          const responseCount = await storage.getResponseCount(survey.id);
          surveyStatsContext += `- "${survey.title}" (${survey.status}): ${responseCount} responses, ${survey.questions.length} questions\n`;
        }
        if (userSurveys.length > 5) {
          surveyStatsContext += `... and ${userSurveys.length - 5} more surveys`;
        }
      }

      let templatesContext = "";
      if (allTemplates.length > 0) {
        templatesContext = `\n\nAVAILABLE TEMPLATES:\n`;
        for (const template of allTemplates.slice(0, 5)) {
          templatesContext += `- "${template.title}" (${template.category}): ${template.questions.length} questions\n`;
        }
      }

      const enrichedContext = context || `You are a helpful AI assistant for Evalia, a survey and training feedback platform.

CRITICAL FORMATTING RULES:
- DO NOT use Markdown formatting of any kind
- NO hash marks (#), asterisks (*), underscores (_), or code backticks
- NO bold, italics, code blocks, or headers
- Use ONLY plain text with normal punctuation
- For lists, simply start each item on a new line without special characters
- Use numbers only if needed: 1. 2. 3. (nothing fancy)
- Keep responses conversational and natural

EVALIA FEATURES:
1. Survey Creation: Create surveys from scratch, use templates, or generate with AI
2. Dashboard: View key metrics like total surveys, average scores, response rates, and trends
3. Surveys: Manage surveys (Draft/Live/Paused/Closed status), see response counts
4. Respondent Groups: Manage and segment respondents
5. Analytics: Analyze responses with charts, breakdowns, and AI-generated insights
6. Templates: Pre-built survey templates for training scenarios
7. AI Assist: Generate surveys, analyze responses, extract insights
8. Scoring Models: Set up custom scoring rules

KEY CAPABILITIES:
- Create surveys in minutes using AI or templates
- Share surveys via link or QR code
- Collect responses and analyze in real-time
- Export data to CSV or JSON
- AI-powered insights about survey responses
- Respondent management and segmentation
- Custom scoring for training evaluations${surveyStatsContext}${templatesContext}

HELP USERS WITH:
- Creating and managing their surveys
- Sharing and collecting responses
- Analyzing and interpreting results
- Using scoring models
- Leveraging AI features
- Navigation and app usage

Be concise, helpful, and guide users toward their goals. When possible, reference their actual surveys and data. Always respond in plain text without any formatting syntax.`;

      const conversationHistory = history.map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistral-medium-latest",
          messages: [
            { role: "system", content: enrichedContext },
            ...conversationHistory,
            { role: "user", content: message },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Mistral API error:", error);
        return res.status(500).json({ message: "Failed to get AI response" });
      }

      const data = await response.json();
      const assistantMessage = data.choices?.[0]?.message?.content;

      if (!assistantMessage) {
        return res.status(500).json({ error: "No response from AI model" });
      }

      return res.json({ message: assistantMessage });
    } catch (error: any) {
      console.error("AI Chat error:", error);
      return res.status(500).json({ message: error.message || "Failed to process chat request" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
