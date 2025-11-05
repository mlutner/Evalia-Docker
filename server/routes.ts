import type { Express } from "express";
import { createServer, type Server } from "http";
import { createRequire } from "module";
import { storage } from "./storage";
import { parseDocument, generateSurveyFromText, refineSurvey } from "./openrouter";
import { insertSurveySchema, questionSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import mammoth from "mammoth";

// pdf-parse needs CommonJS require for proper default export
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // TODO: Hash password before storing (use bcrypt in production)
      // For demo purposes, storing plaintext - MUST be fixed for production
      const user = await storage.createUser({ username, password });

      // Set session
      if (req.session) {
        req.session.userId = user.id;
      }

      res.json({ id: user.id, username: user.username });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      
      // TODO: Use bcrypt.compare() for password verification in production
      // For demo purposes, using plaintext comparison - MUST be fixed for production
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Set session
      if (req.session) {
        req.session.userId = user.id;
      }

      res.json({ id: user.id, username: user.username });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/logout", async (req, res) => {
    req.session?.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.status(204).send();
    });
  });

  app.get("/api/user", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ id: user.id, username: user.username });
  });
  
  // Parse uploaded document
  app.post("/api/parse-document", upload.single("file"), async (req, res) => {
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

  // Generate survey from text prompt
  app.post("/api/generate-survey", async (req, res) => {
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

  // AI chat for survey refinements
  app.post("/api/chat", async (req, res) => {
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

  // Get all surveys
  app.get("/api/surveys", async (req, res) => {
    try {
      const surveys = await storage.getAllSurveys();
      res.json(surveys);
    } catch (error: any) {
      console.error("Get surveys error:", error);
      res.status(500).json({ error: "Failed to fetch surveys" });
    }
  });

  // Create new survey
  app.post("/api/surveys", async (req, res) => {
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

  // Update survey
  app.put("/api/surveys/:id", async (req, res) => {
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

  // Delete survey
  app.delete("/api/surveys/:id", async (req, res) => {
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
