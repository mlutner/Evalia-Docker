import type { Express } from "express";
import { createServer, type Server } from "http";
import { createRequire } from "module";
import { storage } from "./storage";
import { parseDocument, generateSurveyFromText, refineSurvey } from "./openrouter";
import { insertSurveySchema, questionSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import mammoth from "mammoth";
import { setupAuth, isAuthenticated } from "./replitAuth";

// pdf-parse needs CommonJS require for proper default export
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Setup Replit Auth (provides Google, GitHub, Apple, X login)
  await setupAuth(app);

  // Get authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
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
        return res.status(400).json({ error: "No file uploaded" });
      }

      let extractedText = "";
      const fileName = req.file.originalname;
      const fileType = req.file.mimetype;

      // Extract text based on file type
      if (fileType === "application/pdf") {
        const pdfData = await pdfParse(req.file.buffer);
        extractedText = pdfData.text;
      } else if (
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileType === "application/msword"
      ) {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        extractedText = result.value;
      } else if (fileType === "text/plain") {
        extractedText = req.file.buffer.toString("utf-8");
      } else {
        return res.status(400).json({ error: "Unsupported file type. Please upload PDF, Word, or text files." });
      }

      if (!extractedText.trim()) {
        return res.status(400).json({ error: "No text could be extracted from the document" });
      }

      // Generate survey from extracted text
      const survey = await generateSurveyFromText(extractedText, `Document: ${fileName}`);

      res.json({
        parsedText: extractedText,
        title: survey.title,
        questions: survey.questions,
      });
    } catch (error: any) {
      console.error("Document parsing error:", error);
      res.status(500).json({ error: error.message || "Failed to parse document" });
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
      const { message, questions, history } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      if (!Array.isArray(questions)) {
        return res.status(400).json({ error: "Current questions are required" });
      }

      const result = await refineSurvey(questions, message, history || []);

      res.json(result);
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message || "Failed to process chat message" });
    }
  });

  // Get all surveys (protected)
  app.get("/api/surveys", isAuthenticated, async (req, res) => {
    try {
      const surveys = await storage.getAllSurveys();
      res.json(surveys);
    } catch (error: any) {
      console.error("Get surveys error:", error);
      res.status(500).json({ error: "Failed to fetch surveys" });
    }
  });

  // Create new survey (protected)
  app.post("/api/surveys", isAuthenticated, async (req, res) => {
    try {
      const validationResult = insertSurveySchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: fromZodError(validationResult.error).message 
        });
      }

      const survey = await storage.createSurvey(validationResult.data);
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

      const survey = await storage.updateSurvey(id, updates);
      
      if (!survey) {
        return res.status(404).json({ error: "Survey not found" });
      }

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

  const httpServer = createServer(app);

  return httpServer;
}
