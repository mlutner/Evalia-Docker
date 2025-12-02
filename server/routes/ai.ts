/**
 * AI Routes - AI-powered survey generation, refinement, and analysis
 * 
 * @module routes/ai
 */

import { Router } from "express";
import multer from "multer";
import mammoth from "mammoth";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";
import {
  parsePDFWithVision,
  generateSurveyFromText,
  refineSurvey,
  generateSurveyText,
  suggestScoringConfig,
  analyzeQuestionQuality,
  processAIChatMessage,
} from "../aiService";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DOCUMENT PARSING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @swagger
 * /api/parse-document:
 *   post:
 *     summary: Parse and extract text from uploaded document
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Parsed document with generated questions
 */
router.post("/parse-document", isAuthenticated, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file was uploaded",
        tip: "Please select a PDF, DOCX, or TXT file to continue",
      });
    }

    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const fileSizeKB = Math.round(req.file.size / 1024);

    // Check file size (max 10MB)
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        error: `File is too large (${fileSizeKB} KB)`,
        tip: "Please upload a file smaller than 10MB",
      });
    }

    let extractedText = "";

    // Extract text based on file type
    if (fileType === "application/pdf") {
      try {
        extractedText = await parsePDFWithVision(req.file.buffer, fileName);
        console.log(`[AI Routes] PDF extracted ${extractedText.length} characters via Mistral Vision`);
      } catch (pdfError: any) {
        console.error("[AI Routes] PDF parsing error:", pdfError);
        return res.status(400).json({
          error: "Unable to read this PDF file",
          tip: "The PDF might be password-protected, corrupted, or contain only images. Try saving it as a new PDF or using a different file.",
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
        console.error("[AI Routes] DOCX parsing error:", docxError);
        return res.status(400).json({
          error: "Unable to read this Word document",
          tip: "The document might be corrupted or in an unsupported format. Try saving it as a new .docx file.",
        });
      }
    } else if (fileType === "text/plain") {
      extractedText = req.file.buffer.toString("utf-8");
    } else {
      return res.status(400).json({
        error: `Unsupported file type: ${fileType}`,
        tip: "Please upload a PDF (.pdf), Word (.docx), or text (.txt) file.",
      });
    }

    if (!extractedText.trim()) {
      return res.status(400).json({
        error: "No text content found in the document",
        tip: "The document appears to be empty or contains only images. Please upload a document with text content.",
      });
    }

    // Check minimum text length
    if (extractedText.trim().length < 50) {
      return res.status(400).json({
        error: "Document contains very little text",
        tip: "The document needs more content to generate meaningful survey questions. Please upload a document with at least a few sentences.",
      });
    }

    // Generate survey from extracted text
    let survey;
    try {
      survey = await generateSurveyFromText(extractedText, `Document: ${fileName}`);
    } catch (aiError: any) {
      console.error("[AI Routes] AI generation error:", aiError);
      return res.status(500).json({
        error: "AI failed to generate questions from the document",
        tip: "The document content might be too complex or unclear. Try uploading a different document or use the AI prompt feature instead.",
      });
    }

    if (!survey.questions || survey.questions.length === 0) {
      return res.status(400).json({
        error: "Could not generate questions from this document",
        tip: "The document content might not be suitable for survey generation. Try uploading a training manual, course outline, or educational document.",
      });
    }

    res.json({
      parsedText: extractedText,
      title: survey.title,
      questions: survey.questions,
      ...(survey.scoreConfig && { scoreConfig: survey.scoreConfig }),
    });
  } catch (error: any) {
    console.error("[AI Routes] Document parsing error:", error);
    res.status(500).json({
      error: "An unexpected error occurred while processing your document",
      tip: "Please try again or contact support if the problem persists.",
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SURVEY GENERATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @swagger
 * /api/generate-survey:
 *   post:
 *     summary: Generate survey from text prompt or file
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 */
router.post("/generate-survey", isAuthenticated, async (req, res) => {
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
        console.error("[AI Routes] File processing error:", fileError);
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
    console.error("[AI Routes] Survey generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate survey" });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SURVEY REFINEMENT (Chat)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: AI chat for survey refinements
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 */
router.post("/chat", isAuthenticated, async (req, res) => {
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
    console.error("[AI Routes] Chat error:", error);
    res.status(500).json({ error: error.message || "Failed to process chat message" });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEXT GENERATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @swagger
 * /api/generate-text:
 *   post:
 *     summary: Generate survey text fields with AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 */
router.post("/generate-text", isAuthenticated, async (req, res) => {
  try {
    const { fieldType, surveyTitle, questions, scoreConfig } = req.body;

    if (!fieldType || !["description", "welcomeMessage", "thankYouMessage", "resultsSummary"].includes(fieldType)) {
      return res.status(400).json({
        error: "Valid fieldType is required (description, welcomeMessage, thankYouMessage, or resultsSummary)",
      });
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
    console.error("[AI Routes] Text generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate text" });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TONE ADJUSTMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @swagger
 * /api/adjust-tone:
 *   post:
 *     summary: Adjust survey question tone with AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 */
router.post("/adjust-tone", isAuthenticated, async (req, res) => {
  try {
    const { questions, tone } = req.body;

    if (!tone || !["formal", "casual", "encouraging", "technical"].includes(tone)) {
      return res.status(400).json({
        error: "Valid tone is required (formal, casual, encouraging, or technical)",
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "Survey questions are required" });
    }

    // Call AI to rewrite questions with the selected tone
    const toneDescriptions: Record<string, string> = {
      formal: "professional, structured, and formal language suitable for business contexts",
      casual: "friendly, conversational, and approachable tone that feels natural",
      encouraging: "motivational, supportive, and positive tone that builds confidence",
      technical: "precise, industry-specific, and technical language for expert audiences",
    };

    const prompt = `Rewrite the following survey questions using a ${tone} tone (${toneDescriptions[tone]}). 
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
        question: `${q.question} (adjusted to ${tone} tone)`,
      }));
      res.json({ adjustedQuestions: adjusted });
    }
  } catch (error: any) {
    console.error("[AI Routes] Tone adjustment error:", error);
    res.status(500).json({ error: error.message || "Failed to adjust tone" });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUESTION QUALITY ANALYSIS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @swagger
 * /api/questions/analyze:
 *   post:
 *     summary: Analyze question quality with AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 */
router.post("/questions/analyze", isAuthenticated, async (req, res) => {
  try {
    const { question, questionType, options } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Question text is required" });
    }

    if (!questionType || typeof questionType !== "string") {
      return res.status(400).json({ error: "Question type is required" });
    }

    const analysis = await analyzeQuestionQuality(question, questionType, options);
    res.json(analysis);
  } catch (error: any) {
    console.error("[AI Routes] Question analysis error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze question" });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCORING CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @swagger
 * /api/generate-scoring-config:
 *   post:
 *     summary: Auto-generate scoring configuration
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 */
router.post("/generate-scoring-config", isAuthenticated, async (req: any, res) => {
  try {
    const { questions, surveyTitle } = req.body;
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: "Questions array required" });
    }

    const config = await suggestScoringConfig(surveyTitle || "Assessment Survey", questions);
    res.json({ config });
  } catch (error: any) {
    console.error("[AI Routes] Generate scoring config error:", error);
    res.status(500).json({ error: "Failed to generate scoring configuration" });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AI CHAT (General Assistant)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @swagger
 * /api/ai-chat:
 *   post:
 *     summary: AI assistant chat
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 */
router.post("/ai-chat", isAuthenticated, async (req: any, res) => {
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

    const enrichedContext =
      context ||
      `You are a helpful AI assistant for Evalia, a survey and training feedback platform.

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

    // Use the centralized AI service for retry/monitoring/logging
    const assistantMessage = await processAIChatMessage(message, conversationHistory, enrichedContext);

    return res.json({ message: assistantMessage });
  } catch (error: any) {
    console.error("[AI Routes] AI Chat error:", error);
    return res.status(500).json({ message: error.message || "Failed to process chat request" });
  }
});

export default router;

