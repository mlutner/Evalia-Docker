import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { createRequire } from "module";
import { storage } from "./storage";
import { parseDocument, generateSurveyFromText, refineSurvey, generateSurveyText } from "./openrouter";
import { insertSurveySchema, questionSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import mammoth from "mammoth";
import "./types";

// pdf-parse needs CommonJS require for proper default export
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Register new user
  app.post("/api/register", async (req, res) => {
    try {
      const { username, password, email } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const user = await storage.createUser({
        username,
        password,
        email: email || null,
      });

      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ error: "Failed to create session" });
        }
        req.session.userId = user.id;
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ error: "Failed to save session" });
          }
          const { password: _, ...userWithoutPassword } = user;
          res.status(201).json(userWithoutPassword);
        });
      });
    } catch (error: any) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  // Login user
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const isValid = await storage.verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ error: "Failed to create session" });
        }
        req.session.userId = user.id;
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ error: "Failed to save session" });
          }
          const { password: _, ...userWithoutPassword } = user;
          res.json(userWithoutPassword);
        });
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // Logout user
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get authenticated user
  app.get("/api/user", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
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

  // Get all surveys (protected)
  app.get("/api/surveys", isAuthenticated, async (req: any, res) => {
    try {
      const surveys = await storage.getAllSurveys(req.session.userId);
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

      const survey = await storage.createSurvey(validationResult.data, req.session.userId);
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
      const userId = req.session.userId;

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

      const [responses, count] = await Promise.all([
        storage.getResponses(id),
        storage.getResponseCount(id),
      ]);

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

  const httpServer = createServer(app);

  return httpServer;
}
