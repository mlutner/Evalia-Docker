/**
 * AI Service - Handles all AI-powered functionality for survey generation,
 * scoring, analysis, and document processing.
 * 
 * Uses Mistral as the primary AI provider with comprehensive monitoring.
 * 
 * @version 2.0.0
 */

import type { Question } from "@shared/schema";
import mammoth from "mammoth";
import { callMistral, safeParseJSON, type ChatMessage } from "./utils/aiClient";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_OCR_URL = "https://api.mistral.ai/v1/ocr";
const MAX_PDF_BYTES = 50 * 1024 * 1024; // 50MB safety limit

// OCR model (separate from chat completions)
const MODELS = {
  OCR: "mistral-ocr-latest",
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROMPT VERSIONING - For tracking and A/B testing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PROMPT_VERSIONS = {
  surveyGeneration: "v2.1.0",
  surveyRefinement: "v2.0.0",
  questionQuality: "v1.5.0",
  scoring: "v1.2.0",
  scoringConfig: "v1.1.0",
  surveySummary: "v1.0.0",
  surveyText: "v1.0.0",
  documentOCR: "v1.0.0",
  aiChat: "v2.0.0",
  promptEnhancement: "v1.0.0",
  toneAdjustment: "v1.0.0",
} as const;

// Task types for monitoring
export const TASK_TYPES = {
  SURVEY_GENERATION: "surveyGeneration",
  SURVEY_REFINEMENT: "surveyRefinement",
  QUESTION_QUALITY: "questionQuality",
  SCORING: "scoring",
  SCORING_CONFIG: "scoringConfig",
  SURVEY_SUMMARY: "surveySummary",
  SURVEY_TEXT: "surveyText",
  DOCUMENT_OCR: "documentOCR",
  AI_CHAT: "aiChat",
  PROMPT_ENHANCEMENT: "promptEnhancement",
  TONE_ADJUSTMENT: "toneAdjustment",
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR HANDLING - Consistent error class
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly taskType: string,
    public readonly recoverable: boolean = true,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = "AIServiceError";
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PDF / DOCUMENT PARSING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Parse PDF using Mistral OCR native API
 */
export async function parsePDFWithVision(pdfBuffer: Buffer, fileName: string): Promise<string> {
  if (!MISTRAL_API_KEY) {
    throw new AIServiceError(
      "Mistral API key not configured",
      TASK_TYPES.DOCUMENT_OCR,
      false
    );
  }

  // Validate PDF size before processing
  if (pdfBuffer.byteLength > MAX_PDF_BYTES) {
    throw new AIServiceError(
      `PDF too large for OCR processing (>${MAX_PDF_BYTES / 1024 / 1024}MB)`,
      TASK_TYPES.DOCUMENT_OCR,
      false
    );
  }

  try {
    // Encode PDF as base64
    const base64PDF = pdfBuffer.toString("base64");

    const response = await fetch(MISTRAL_OCR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODELS.OCR,
        document: {
          type: "document_base64",
          document_base64: base64PDF,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[AI Service] Mistral OCR API error:", error);
      throw new AIServiceError(
        `Mistral OCR API error: ${error}`,
        TASK_TYPES.DOCUMENT_OCR,
        true
      );
    }

    const data = await response.json();
    console.log("[AI Service] OCR response preview:", JSON.stringify(data).substring(0, 500));
    
    // OCR returns pages array with markdown content
    if (data.pages && Array.isArray(data.pages)) {
      return data.pages.map((page: any) => page.markdown || "").join("\n");
    }
    
    // Try alternative response formats
    return data.result?.markdown || data.markdown || data.content || data.text || "";
  } catch (error: any) {
    if (error instanceof AIServiceError) throw error;
    console.error("[AI Service] PDF OCR failed:", error.message);
    throw new AIServiceError(
      `PDF OCR failed: ${error.message}`,
      TASK_TYPES.DOCUMENT_OCR,
      true,
      error
    );
  }
}

/**
 * Parse text from an uploaded document using AI
 */
export async function parseDocument(fileContent: string, fileName: string): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: "You are an OCR assistant. Extract all text from the provided document clearly and accurately. Return only the extracted text, no additional commentary.",
    },
    {
      role: "user",
      content: `Extract all text from this document (${fileName}):\n\n${fileContent}`,
    },
  ];

  try {
    return await callMistral(messages, {
      quality: "best",
      taskType: TASK_TYPES.DOCUMENT_OCR,
      promptVersion: PROMPT_VERSIONS.documentOCR,
    });
  } catch (error: any) {
    throw new AIServiceError(
      `Document parsing failed: ${error.message}`,
      TASK_TYPES.DOCUMENT_OCR,
      true,
      error
    );
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUESTION QUALITY ANALYSIS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Analyze question quality for clarity, neutrality, and bias
 * Returns fallback values on error (recoverable)
 */
export async function analyzeQuestionQuality(
  question: string,
  questionType: string,
  options?: string[]
): Promise<{
  score: number;
  issues: string[];
  suggestions: string;
}> {
  const optionsText = options && options.length > 0 
    ? `\nOptions:\n${options.map((o, i) => `${i + 1}. ${o}`).join("\n")}` 
    : "";
  
  const systemPrompt = `You are a world-class survey design expert and measurement specialist with 20+ years of experience. Your role is to provide rigorous, nuanced feedback that helps trainers write better survey questions.

**SCORING FRAMEWORK (0-100):**
- 85-100: **Exemplary** - Crystal clear, completely neutral, highly specific, perfectly matched to type.
- 70-84: **Strong** - Minor improvements possible in clarity/neutrality/specificity, but fundamentally sound.
- 55-69: **Fair** - Issues that could reduce response quality. Slight leading language, ambiguity, or type misalignment.
- 40-54: **Weak** - Significant issues impacting data quality. Leading language, unclear intent, or problematic phrasing.
- 0-39: **Poor** - Critical flaws making the question unsuitable or yielding unreliable responses.

**EVALUATION CRITERIA (APPLY IN ORDER):**
1. **CLARITY:** Immediately understandable? Any ambiguous words or phrases?
2. **NEUTRALITY:** Free from leading language, emotional words, assumptions? Avoids suggesting preferred answer?
3. **SPECIFICITY:** Precise and answerable? Asks ONE thing (not multiple)?
4. **TYPE APPROPRIATENESS:** Question type matches content? Better type available?
5. **RESPONSE VARIABILITY:** Produces diverse, meaningful responses or does everyone answer the same?

**FEEDBACK RULES:**
- Be honest and critical - great questions are rare
- Average questions score 50-65; only excellent questions score 85+
- Provide 2-3 specific, actionable issues (or none if excellent)
- Only suggest improvements if they meaningfully strengthen the question
- Use accessible, plain-language explanations
- Reference specific evaluation criteria in your feedback

**FEW-SHOT EXAMPLES:**

Example 1 - Strong Question:
Question: "How satisfied are you with the pace of today's training session?"
Type: rating
Analysis: {"score": 82, "issues": ["Could specify what aspect of pacing (too fast vs too slow)"], "suggestions": "Consider splitting into two questions: one about speed, one about depth."}

Example 2 - Weak Question:
Question: "Don't you agree that the training materials were helpful?"
Type: multiple_choice
Analysis: {"score": 35, "issues": ["Leading language ('Don't you agree')", "Assumes materials were helpful", "Forces agreement frame"], "suggestions": "Rephrase neutrally: 'How would you rate the usefulness of the training materials?'"}

Example 3 - Fair Question:
Question: "What did you think about the training?"
Type: textarea
Analysis: {"score": 58, "issues": ["Too vague - 'think about' is imprecise", "No focus area specified"], "suggestions": "Add specificity: 'What aspects of the training were most valuable to your work?'"}

**OUTPUT FORMAT:**
Return ONLY a single JSON object: {"score": number, "issues": ["issue1", "issue2"], "suggestions": "improvement text"}`;

  const userPrompt = `Evaluate this ${questionType} survey question using rigorous criteria. Provide nuanced feedback.

QUESTION:
"${question}"${optionsText}

Be critical. Average questions should score 50-65. Only award 85+ for truly excellent questions.`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  try {
    const response = await callMistral(messages, {
      quality: "best",
      taskType: TASK_TYPES.QUESTION_QUALITY,
      promptVersion: PROMPT_VERSIONS.questionQuality,
      responseFormat: { type: "json_object" },
      temperature: 0.3, // Lower temperature for consistent scoring
    });
    
    const parsed = safeParseJSON(response, null);
    if (!parsed || typeof parsed !== "object") {
      console.error("[AI Service] Question quality JSON parse failed", { response });
      return { score: 50, issues: [], suggestions: "" };
    }
    
    return {
      score: Math.min(100, Math.max(0, parsed.score || 50)),
      issues: Array.isArray(parsed.issues) ? parsed.issues.slice(0, 3) : [],
      suggestions: typeof parsed.suggestions === "string" ? parsed.suggestions.trim() : "",
    };
  } catch (error) {
    console.error("[AI Service] Question quality analysis error:", error);
    // Return neutral fallback - recoverable error
    return { score: 50, issues: [], suggestions: "" };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCORING FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculate question counts per category from question-category mapping
 */
function getCategoryQuestionCounts(
  questions: Question[],
  categoryMap: Record<string, string>
): Record<string, number> {
  const counts: Record<string, number> = {};
  questions.forEach((question) => {
    const categoryId = categoryMap[question.id];
    if (!categoryId) return;
    counts[categoryId] = (counts[categoryId] || 0) + 1;
  });
  return counts;
}

/**
 * Calculate max possible scores per category (questions × 5 points each)
 */
function getCategoryMaxScores(
  questions: Question[],
  categoryMap: Record<string, string>
): Record<string, number> {
  const counts = getCategoryQuestionCounts(questions, categoryMap);
  return Object.fromEntries(
    Object.entries(counts).map(([categoryId, count]) => [categoryId, count * 5])
  );
}

/**
 * Calculate scores using AI for intelligent answer analysis
 * Returns empty object on error (recoverable)
 */
export async function calculateScoresWithAI(
  questions: Question[],
  answers: Record<string, string | string[]>,
  scoreConfig: any
): Promise<Record<string, number>> {
  if (!scoreConfig?.enabled || !scoreConfig.categories) {
    return {};
  }

  // Initialize scores for each category
  const scores: Record<string, number> = {};
  scoreConfig.categories.forEach((cat: any) => {
    scores[cat.id] = 0;
  });

  // Score rating/nps questions by numeric value
  questions.forEach(q => {
    if (q.scoringCategory && answers[q.id]) {
      const answer = answers[q.id];
      if (q.type === "rating" || q.type === "nps" || q.type === "number") {
        const value = parseInt(Array.isArray(answer) ? answer[0] : answer, 10);
        if (!isNaN(value)) {
          scores[q.scoringCategory] = (scores[q.scoringCategory] || 0) + value;
        }
      }
    }
  });

  // For text/textarea answers, use AI to intelligently score
  const textQuestionsToScore = questions.filter(q => 
    (q.type === "text" || q.type === "textarea") && 
    q.scoringCategory && 
    answers[q.id]
  );

  if (textQuestionsToScore.length > 0) {
    try {
      const categoryListText = scoreConfig.categories
        .map((c: any) => `- ID: "${c.id}" (Name: "${c.name}")`)
        .join("\n");

      const systemPrompt = `You are an expert assessment scorer. Score the following responses based on the assessment criteria.

Use ONLY the provided category IDs as JSON keys. Each score must be an integer between 0 and 5:
- 0: No evidence or completely off-topic
- 1: Minimal evidence, vague response
- 2: Some evidence, basic understanding
- 3: Good evidence, clear understanding
- 4: Strong evidence, detailed response
- 5: Excellent evidence, exceptional insight

**FEW-SHOT EXAMPLES:**

Example 1:
Question: "Describe a time you demonstrated leadership"
Category: leadership-skills
Response: "I led our team through a difficult project deadline by delegating tasks and maintaining morale."
Score: 4 (Strong evidence of leadership with specific actions)

Example 2:
Question: "What did you learn about communication?"
Category: communication
Response: "It was good."
Score: 1 (Minimal evidence, too vague)

Return ONLY a JSON object with category IDs as keys and numeric scores as values. No other text.`;

      const responseTexts = textQuestionsToScore.map((q: Question) => {
        const answerValue = answers[q.id];
        const answerText = Array.isArray(answerValue) ? answerValue.join(', ') : String(answerValue);
        const categoryName = scoreConfig.categories.find((c: any) => c.id === q.scoringCategory)?.name || q.scoringCategory;
        return `Question: "${q.question}"\nCategory: ${categoryName} (ID: ${q.scoringCategory})\nResponse: "${answerText}"`;
      }).join('\n\n');

      const userPrompt = `Categories (use ONLY these IDs as keys):
${categoryListText}

Score these responses (0-5 integer for each category):

${responseTexts}

Return ONLY valid JSON like: {"cat-1": 4, "cat-2": 3}`;

      const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ];

      const response = await callMistral(messages, {
        quality: "balanced",
        taskType: TASK_TYPES.SCORING,
        promptVersion: PROMPT_VERSIONS.scoring,
        responseFormat: { type: "json_object" },
        temperature: 0.2, // Low temperature for consistent scoring
      });
      
      const aiScores = safeParseJSON(response, {});
      if (!aiScores || Object.keys(aiScores).length === 0) {
        console.warn("[AI Service] Failed to parse AI scores, skipping");
      } else {
        const validCategoryIds = new Set(scoreConfig.categories.map((c: any) => c.id));
        
        // Add AI scores to category scores with validation
        Object.entries(aiScores).forEach(([catId, score]: [string, any]) => {
          if (!validCategoryIds.has(catId)) {
            console.warn(`[AI Service] Ignoring AI score for unknown category: ${catId}`);
            return;
          }
          
          let numericScore = Number(score);
          if (!Number.isFinite(numericScore)) return;
          
          // Clamp to valid range (0-5)
          numericScore = Math.max(0, Math.min(5, Math.round(numericScore)));
          scores[catId] = (scores[catId] || 0) + numericScore;
        });
      }
    } catch (error) {
      console.warn("[AI Service] AI scoring failed, continuing with numeric scores:", error);
      // Don't throw - return partial scores
    }
  }

  return scores;
}

/**
 * Calculate theoretical max score based on question count
 */
function calculateTheoreticalMaxScore(questions: Question[]): number {
  return questions.length * 5;
}

/**
 * Generate appropriate score ranges based on theoretical max
 */
function generateScoreRanges(categoryId: string, theoreticalMax: number, questionCount: number) {
  const lowEnd = Math.ceil(theoreticalMax / 3);
  const midEnd = Math.ceil((theoreticalMax * 2) / 3);
  const highEnd = theoreticalMax;
  
  return [
    {
      category: categoryId,
      minScore: 0,
      maxScore: lowEnd,
      label: questionCount < 5 ? "Developing" : "Needs Development",
      interpretation: `Score range: 0-${lowEnd}. Your performance indicates room for growth in this area.`
    },
    {
      category: categoryId,
      minScore: lowEnd + 1,
      maxScore: midEnd,
      label: questionCount < 5 ? "Good" : "Developing",
      interpretation: `Score range: ${lowEnd + 1}-${midEnd}. You demonstrate satisfactory performance with opportunities for improvement.`
    },
    {
      category: categoryId,
      minScore: midEnd + 1,
      maxScore: highEnd,
      label: "Excellent",
      interpretation: `Score range: ${midEnd + 1}-${highEnd}. You demonstrate strong competency and mastery in this area.`
    }
  ];
}

/**
 * Suggest scoring configuration based on survey questions
 * Returns null on error (recoverable)
 */
export async function suggestScoringConfig(
  title: string,
  questions: Question[]
): Promise<any | null> {
  // Only suggest scoring for assessment/evaluation surveys
  const assessmentKeywords = [
    'assess', 'evaluate', 'score', 'skill', 'competency', 'leadership', 
    'performance', 'capability', 'proficiency', 'mental health', 'mental', 
    'health', 'wellbeing', 'wellness', 'engagement', 'satisfaction', 
    'understanding', 'knowledge', 'learning', 'training', 'effectiveness', 
    'awareness', 'readiness'
  ];
  
  const isAssessmentSurvey = assessmentKeywords.some(keyword => 
    title.toLowerCase().includes(keyword) || 
    questions.some(q => q.question.toLowerCase().includes(keyword))
  );

  if (!isAssessmentSurvey) {
    console.log("[AI Service] Survey not detected as assessment survey. Title:", title);
    return null;
  }

  const totalTheoreticalMax = calculateTheoreticalMaxScore(questions);
  console.log(`[AI Service] Scoring config: ${questions.length} questions, total theoretical max: ${totalTheoreticalMax}`);

  const systemPrompt = `You are an expert in educational assessment and survey design. Based on survey questions, suggest a scoring configuration that would work well for this assessment.

SCORING MODEL:
- Each question can contribute up to 5 points to its assigned category.
- Theoretical maximum PER CATEGORY = (number of questions mapped to that category) × 5.
- Do NOT assume all categories share the same max—calculate the max per category based on how you map questions.

INSTRUCTIONS:
1. Analyze the survey questions to identify 2-3 key competency/skill categories
2. For each category, suggest 3 score ranges that scale with THAT CATEGORY'S question count
3. Score ranges for a category should divide that category's max into thirds (rounded)
4. Suggest which questions contribute to which categories

CRITICAL REQUIREMENTS:
- Each range must have a UNIQUE label - never repeat the same label within a category
- Score ranges must respect each category's theoretical maximum (questions mapped × 5)
- Ranges must be contiguous (no gaps) and non-overlapping
- Interpretations must reference the actual score range
- All minScore and maxScore values must be within that category's theoretical maximum

Return ONLY valid JSON with this exact structure:
{
  "categories": [
    { "id": "cat1", "name": "Category Name" },
    { "id": "cat2", "name": "Another Category" }
  ],
  "scoreRanges": [
    { "category": "cat1", "label": "Needs Development", "minScore": 0, "maxScore": 5, "interpretation": "..." },
    { "category": "cat1", "label": "Developing", "minScore": 6, "maxScore": 10, "interpretation": "..." },
    { "category": "cat1", "label": "Excellent", "minScore": 11, "maxScore": 15, "interpretation": "..." }
  ],
  "suggestedQuestionCategoryMap": {
    "q1": "cat1",
    "q2": "cat2"
  }
}`;

  const userPrompt = `Survey Title: ${title}
Question Count: ${questions.length}

Questions:
${questions.map((q, i) => `Q${i + 1} (ID: ${q.id}): ${q.question}`).join('\n')}

Analyze these questions and suggest:
1. 2-3 key skill/competency categories to score on
2. Score ranges with labels and interpretations that fit within EACH CATEGORY'S maximum
3. Which questions contribute to which categories`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  try {
    const response = await callMistral(messages, {
      quality: "best",
      taskType: TASK_TYPES.SCORING_CONFIG,
      promptVersion: PROMPT_VERSIONS.scoringConfig,
      responseFormat: { type: "json_object" },
      temperature: 0.5,
    });
    
    const parsed = safeParseJSON(response, {});
    if (!parsed || Object.keys(parsed).length === 0) {
      throw new AIServiceError(
        "Failed to parse scoring configuration",
        TASK_TYPES.SCORING_CONFIG,
        true
      );
    }
    
    const questionCategoryMap = parsed.suggestedQuestionCategoryMap || {};
    const theoreticalMaxPerCategory = getCategoryMaxScores(questions, questionCategoryMap);
    const categoryQuestionCounts = getCategoryQuestionCounts(questions, questionCategoryMap);
    
    // Post-process to ensure score ranges are valid and distinct
    const processedRanges = (parsed.scoreRanges || []).map((range: any) => {
      const maxForCategory = theoreticalMaxPerCategory[range.category] || totalTheoreticalMax;
      
      // Validate and clamp score ranges
      range.minScore = Math.max(0, Math.min(range.minScore, maxForCategory));
      range.maxScore = Math.max(0, Math.min(range.maxScore, maxForCategory));
      
      // Ensure minScore <= maxScore
      if (range.minScore > range.maxScore) {
        [range.minScore, range.maxScore] = [range.maxScore, range.minScore];
      }
      
      // Count ranges for this category
      const rangesForCategory = (parsed.scoreRanges || []).filter((r: any) => r.category === range.category);
      const positionInCategory = rangesForCategory.findIndex((r: any) => r === range);
      
      // If labels are duplicated, apply default progression
      const existingLabelsForCategory = rangesForCategory.slice(0, positionInCategory).map((r: any) => r.label);
      if (existingLabelsForCategory.includes(range.label)) {
        const defaultLabels = ["Needs Development", "Developing", "Excellent", "Outstanding"];
        range.label = defaultLabels[positionInCategory] || `Level ${positionInCategory + 1}`;
      }
      
      // Ensure interpretation mentions the score range
      if (!range.interpretation || !range.interpretation.includes(range.minScore.toString())) {
        range.interpretation = `Score range: ${range.minScore}-${range.maxScore}. ${range.interpretation || `Performance in the ${range.label} category.`}`;
      }
      
      return range;
    }).filter((r: any) => r.minScore !== r.maxScore || r.minScore === 0);
    
    // If no valid ranges, generate fallback ranges
    if (processedRanges.length === 0 && parsed.categories && parsed.categories.length > 0) {
      console.warn("[AI Service] No valid ranges generated, using fallback ranges");
      parsed.categories.forEach((cat: any) => {
        const categoryMax = theoreticalMaxPerCategory[cat.id] || totalTheoreticalMax;
        const questionCount = categoryQuestionCounts[cat.id] || questions.length;
        const fallbackRanges = generateScoreRanges(cat.id, categoryMax, questionCount);
        processedRanges.push(...fallbackRanges);
      });
    }
    
    return {
      enabled: true,
      categories: parsed.categories || [],
      scoreRanges: processedRanges,
      suggestedQuestionCategoryMap: parsed.suggestedQuestionCategoryMap,
    };
  } catch (error) {
    console.warn("[AI Service] Scoring suggestion failed, will skip:", error);
    return null;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SURVEY GENERATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Generate a concise AI summary of the survey for dashboard display
 * Returns fallback on error (recoverable)
 */
export async function generateSurveySummary(
  title: string,
  questions: Question[]
): Promise<string> {
  if (!questions || questions.length === 0) {
    return "Survey with no questions";
  }

  const systemPrompt = `You are an expert at creating concise survey summaries. Create a brief, punchy 1-2 sentence summary that captures the essence of what the survey measures. Keep it under 100 characters. Be conversational and friendly.

Examples:
- "Measures employee satisfaction and engagement across departments"
- "Assesses learning outcomes and training effectiveness"
- "Gathers feedback on product features and improvements"
- "Evaluates team collaboration and communication skills"`;

  const userPrompt = `Survey Title: ${title}

Questions (first 5):
${questions.slice(0, 5).map((q, i) => `${i + 1}. ${q.question}`).join('\n')}

Create a brief, friendly summary (under 100 characters) that describes what this survey is about.`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  try {
    const response = await callMistral(messages, {
      quality: "fast",
      taskType: TASK_TYPES.SURVEY_SUMMARY,
      promptVersion: PROMPT_VERSIONS.surveySummary,
      temperature: 0.7,
      maxTokens: 150,
    });
    return response.trim().substring(0, 150);
  } catch (error) {
    console.warn("[AI Service] Summary generation failed, using title:", error);
    return `${questions.length}-question survey`;
  }
}

/**
 * Generate survey questions from text content
 * Throws AIServiceError on failure (non-recoverable for this operation)
 */
export async function generateSurveyFromText(
  content: string,
  context?: string
): Promise<{ title: string; questions: Question[]; scoreConfig?: any }> {
  const systemPrompt = `You are an expert instructional designer and survey methodologist with 15+ years of experience. Your role is to transform documents into high-quality surveys that are clear, unbiased, and effective at measuring intended outcomes.

**YOUR PROCESS:**
1. **Identify Core Concepts:** Scan the document to identify key themes, learning objectives, and measurement areas.
2. **Extract Completely:** Extract EVERY SINGLE question with COMPLETE answer choices. Do NOT skip, condense, or summarize.
3. **Ensure Variety:** Use mixed question types based on the document's structure and intent.
4. **Preserve Integrity:** Maintain exact wording and complete answer sets from the source document.

**CRITICAL EXTRACTION RULES:**
- Extract EVERY question (no limit on quantity)
- Each statement with a rating scale = separate question
- For multiple_choice/checkbox: include ALL options from document (minimum 2)
- For rating scales: preserve full scale (e.g., "1 (Strongly Disagree) to 5 (Strongly Agree)")
- Pay attention to multi-line questions and questions spanning pages

**QUESTION TYPES (Choose the most appropriate for each question):**

TEXT INPUTS:
- "text": Short text input (1-2 sentences)
- "textarea": Long text input (paragraphs, open feedback)
- "email": Email address with validation
- "phone": Phone number input
- "url": Website URL input
- "number": Numeric input (quantities, counts)

SELECTION (Single/Multiple):
- "multiple_choice": Single selection from options (3-6 options ideal)
- "checkbox": Multiple selections from options
- "dropdown": Single selection from longer list (7+ options)
- "yes_no": Binary choice (Yes/No, True/False, Agree/Disagree)

RATING & SCALES (Best for measuring attitudes/opinions):
- "rating": Numeric scale with customizable style
  - ratingScale: 3, 5, 7, or 10
  - ratingStyle: "number" | "star" | "emoji" | "heart" | "thumb"
  - ratingLabels: { low: "Disagree", high: "Agree" }
- "nps": Net Promoter Score (0-10, standard recommendation question)
- "likert": Pre-configured agreement/frequency/satisfaction scales
  - likertType: "agreement" | "frequency" | "importance" | "satisfaction" | "quality"
  - likertPoints: 5 or 7
- "opinion_scale": Semantic differential (bipolar scale)
  - leftLabel: "Cold" rightLabel: "Hot"
- "slider": Continuous numeric slider
  - min, max, step, unit (e.g., "%", "years")

ADVANCED:
- "matrix": Grid/table for rating multiple items on same scale
  - rowLabels: ["Item 1", "Item 2"], colLabels: ["Poor", "Good", "Excellent"]
- "ranking": Order items by preference (drag-and-drop)
- "constant_sum": Distribute points across options (total = 100)

STRUCTURAL:
- "section": Section divider with title
- "statement": Information display (not a question)
- "legal": Consent checkbox

**OUTPUT FORMAT (JSON only):**
{
  "title": "Survey Title",
  "questions": [
    {
      "id": "q1",
      "type": "rating",
      "question": "How satisfied are you with the training?",
      "description": "Optional helper text",
      "ratingScale": 5,
      "ratingStyle": "number",
      "ratingLabels": { "low": "Very Dissatisfied", "high": "Very Satisfied" },
      "required": true
    },
    {
      "id": "q2",
      "type": "likert",
      "question": "The content was relevant to my role.",
      "likertType": "agreement",
      "likertPoints": 5,
      "required": true
    },
    {
      "id": "q3",
      "type": "multiple_choice",
      "question": "What format works best for you?",
      "options": ["In-person", "Virtual", "Hybrid", "Self-paced"],
      "displayStyle": "cards",
      "required": true
    },
    {
      "id": "q4",
      "type": "slider",
      "question": "How confident are you in applying this knowledge?",
      "min": 0,
      "max": 100,
      "step": 10,
      "unit": "%",
      "showValue": true,
      "required": false
    }
  ]
}

**BEST PRACTICES:**
- Use "rating" or "likert" for measuring satisfaction/agreement
- Use "nps" specifically for recommendation questions
- Use "slider" for continuous measurements (confidence %, time estimates)
- Use "matrix" when rating multiple items on the same criteria
- Use "yes_no" for simple binary choices
- Include "ratingLabels" to clarify what endpoints mean
- Mix question types for engagement (avoid all same type)

**VALIDATION CHECKLIST:**
✓ All questions from document included
✓ Every statement extracted as separate question
✓ All multiple_choice/checkbox have minimum 2 options
✓ Complete answer sets preserved
✓ Question text matches document exactly`;

  const userPrompt = context
    ? `Context: ${context}\n\nDocument content:\n${content}\n\nExtract ALL questions with COMPLETE answer choices.`
    : `Extract survey questions from this content. Include ALL answer choices:\n${content}`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  try {
    const response = await callMistral(messages, {
      quality: "best",
      taskType: TASK_TYPES.SURVEY_GENERATION,
      promptVersion: PROMPT_VERSIONS.surveyGeneration,
      responseFormat: { type: "json_object" },
      temperature: 0.4,
      maxTokens: 4000,
    });
    
    const parsed = safeParseJSON(response, {});
    if (!parsed || !parsed.questions) {
      throw new AIServiceError(
        "Invalid survey generation response - no questions found",
        TASK_TYPES.SURVEY_GENERATION,
        false
      );
    }
    
    // Validate and fix questions
    let questions = (parsed.questions || []).map((q: any, index: number) => {
      // Ensure ID exists
      if (!q.id) {
        q.id = `q${index + 1}`;
      }
      
      // Validate options for choice questions
      if ((q.type === 'multiple_choice' || q.type === 'checkbox') && (!q.options || q.options.length < 2)) {
        console.warn(`[AI Service] Question "${q.question}" has insufficient options, adding defaults`);
        q.options = q.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
      }
      
      // Ensure required field exists
      if (q.required === undefined) {
        q.required = true;
      }
      
      return q;
    });
    
    // Try to suggest scoring configuration
    let scoreConfig;
    try {
      scoreConfig = await suggestScoringConfig(parsed.title || "Generated Survey", questions);
      // Apply suggested category mappings to questions if available
      if (scoreConfig?.suggestedQuestionCategoryMap) {
        const categoryMap = scoreConfig.suggestedQuestionCategoryMap;
        questions = questions.map((q: any) => ({
          ...q,
          scoringCategory: categoryMap[q.id],
        }));
      }
    } catch (scoringError) {
      console.warn("[AI Service] Could not suggest scoring config:", scoringError);
    }
    
    return {
      title: parsed.title || "Generated Survey",
      questions,
      ...(scoreConfig && { scoreConfig }),
    };
  } catch (error: any) {
    if (error instanceof AIServiceError) throw error;
    console.error("[AI Service] Failed to generate survey:", error);
    throw new AIServiceError(
      `Failed to generate survey: ${error.message}`,
      TASK_TYPES.SURVEY_GENERATION,
      false,
      error
    );
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SURVEY REFINEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Handle conversational refinements to survey questions
 * Returns original survey on error (recoverable)
 */
export async function refineSurvey(
  survey: { 
    title: string; 
    description?: string | null; 
    questions: Question[];
    welcomeMessage?: string | null;
    thankYouMessage?: string | null;
  },
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
  fileData?: { name: string; type: string; base64: string }
): Promise<{ questions?: Question[]; message: string }> {
  // Process file data if provided
  let enhancedMessage = userMessage;
  if (fileData && fileData.base64) {
    try {
      const buffer = Buffer.from(fileData.base64, "base64");
      const fileType = fileData.type;
      let fileContent = "";

      if (fileType === "application/pdf") {
        fileContent = await parsePDFWithVision(buffer, fileData.name);
      } else if (
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileType === "application/msword"
      ) {
        const result = await mammoth.extractRawText({ buffer });
        fileContent = result.value;
      } else if (fileType === "text/plain") {
        fileContent = buffer.toString("utf-8");
      } else if (fileType.startsWith("image/")) {
        fileContent = `[Image uploaded: ${fileData.name}]`;
      }

      if (fileContent) {
        enhancedMessage = `${userMessage}\n\n---\nFile content (${fileData.name}):\n${fileContent}`;
      }
    } catch (fileError: any) {
      console.error("[AI Service] File processing in chat failed:", fileError);
      enhancedMessage = `${userMessage}\n\n[Note: Could not process attached file]`;
    }
  }

  const systemPrompt = `You are an expert survey design consultant specializing in training assessments. Your role is to understand user intent, evaluate the impact of proposed changes, and provide expert guidance.

━━━ SURVEY CONTEXT ━━━
Title: ${survey.title}
Description: ${survey.description || 'None'}
Questions: ${survey.questions.length}

━━━ YOUR CHAIN-OF-THOUGHT PROCESS ━━━
**ALWAYS follow this reasoning path before responding:**

1. **ANALYZE THE REQUEST**
   - What is the user trying to achieve?
   - Is this a request for modifications, feedback, or clarification?
   - What is the underlying intent?

2. **EVALUATE THE IMPACT**
   - How will this change affect survey quality?
   - Does it maintain question integrity?
   - Will it improve respondent experience?

3. **FORMULATE RESPONSE**
   - Can I fulfill this request exactly as stated?
   - Or should I suggest an alternative approach?

━━━ MODIFICATION RULES ━━━
- PRESERVE question IDs and order (unless explicitly asked to change)
- PRESERVE all existing options (unless explicitly asked to change)
- ADD options without replacing existing ones
- VALIDATE that all fields match the Question schema

━━━ JSON RESPONSE FORMAT ━━━
**ALWAYS return valid JSON. Choose ONE format:**

**FORMAT A - User requested modifications:**
{
  "questions": [...complete updated questions array...],
  "message": "What changed: 1) [change], 2) [change]. Why: [reasoning]"
}

**FORMAT B - Feedback/recommendations WITHOUT modifications:**
{
  "message": "Concise strength observation + specific recommendations"
}

**CRITICAL:** Return ONLY a single JSON object. No code fences, no additional text.

Current Questions:
${JSON.stringify(survey.questions, null, 2)}`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: enhancedMessage },
  ];

  try {
    const response = await callMistral(messages, {
      quality: "best",
      taskType: TASK_TYPES.SURVEY_REFINEMENT,
      promptVersion: PROMPT_VERSIONS.surveyRefinement,
      responseFormat: { type: "json_object" },
      temperature: 0.5,
      maxTokens: 4000,
    });
    
    const parsed = safeParseJSON(response, null);
    if (!parsed || typeof parsed !== "object") {
      console.error("[AI Service] Failed to parse refinement response:", response);
      return {
        questions: survey.questions,
        message: "I couldn't safely process your request, so I left the survey unchanged. Please try again with clearer instructions.",
      };
    }
    return {
      questions: parsed.questions,
      message: parsed.message || "I've updated the survey based on your request.",
    };
  } catch (error) {
    console.error("[AI Service] Refinement error:", error);
    return {
      questions: survey.questions,
      message: "I couldn't safely process your request, so I left the survey unchanged. Please try again with clearer instructions.",
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SURVEY TEXT GENERATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Generate survey text fields (description, welcome message, thank you message, results summary)
 * Returns fallback on error (recoverable)
 */
export async function generateSurveyText(
  fieldType: "description" | "welcomeMessage" | "thankYouMessage" | "resultsSummary",
  surveyTitle: string,
  questions: Question[],
  scoreConfig?: any
): Promise<string> {
  let systemPrompt = "";
  let userPrompt = "";

  // Calculate survey metrics for tailored messaging
  const questionCount = questions.length;
  const estimatedMinutes = Math.max(2, Math.ceil(questionCount / 3));
  const surveySize = questionCount <= 5 ? "quick" : questionCount <= 10 ? "brief" : questionCount <= 20 ? "comprehensive" : "detailed";

  switch (fieldType) {
    case "description":
      systemPrompt = `You are an expert survey copywriter. Write a brief, benefit-focused introduction (25-35 words max). Conversational, warm, direct. NO quotation marks, NO line breaks. Plain text only.`;
      userPrompt = `Survey Title: ${surveyTitle}\n\nQuestions:\n${questions.slice(0, 5).map((q, i) => `${i + 1}. ${q.question}`).join('\n')}\n\nWrite 25-35 words maximum. Make it benefit-focused.`;
      break;
    
    case "welcomeMessage":
      systemPrompt = `Generate EXACTLY 3 concise bullet points for a survey welcome message. Each point MUST be 6-10 words maximum. Keep them short and punchy. NO bullet symbols, NO numbers, NO dashes, NO colons. Just plain text, one point per line. The points should convey:
1. The purpose/goal of the survey
2. How their input will be used
3. Time estimate or ease of completion

CRITICAL: Keep each point under 10 words. Shorter is better.`;
      userPrompt = `Survey: "${surveyTitle}"
Questions: ${questionCount} (${surveySize} survey, ~${estimatedMinutes} min)
Topic themes: ${questions.slice(0, 3).map(q => q.question.substring(0, 40)).join("; ")}

Generate 3 SHORT bullet points (6-10 words each). Each on its own line.`;
      break;
    
    case "thankYouMessage":
      // Shorter thank you for quick surveys, slightly longer for comprehensive ones
      const thankYouLength = questionCount <= 5 ? "25-35" : questionCount <= 10 ? "35-50" : "50-70";
      systemPrompt = `Write a warm, genuine thank you message (${thankYouLength} words). Sincere, forward-focused. Reference the survey topic. Plain text only, no formatting. Match the brevity to the survey length.`;
      userPrompt = `Survey: "${surveyTitle}" (${questionCount} questions, ${surveySize} survey)

Write a ${thankYouLength} word thank you message. Be warm and specific to the topic.`;
      break;

    case "resultsSummary":
      systemPrompt = `Write a brief summary message (40-60 words) that appears above assessment results. Warm, insightful, forward-focused. Plain text only.`;
      const categories = scoreConfig?.categories?.map((c: any) => c.name).join(", ") || "this assessment";
      userPrompt = `Survey Title: ${surveyTitle}\nAssessment Categories: ${categories}\n\nWrite a 40-60 word results summary message.`;
      break;
  }

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  try {
    return await callMistral(messages, {
      quality: "fast",
      taskType: TASK_TYPES.SURVEY_TEXT,
      promptVersion: PROMPT_VERSIONS.surveyText,
      temperature: 0.7,
      maxTokens: 200,
    });
  } catch (error) {
    console.warn("[AI Service] Text generation failed:", error);
    // Return sensible fallbacks
    switch (fieldType) {
      case "description":
        return "Share your valuable feedback to help us improve.";
      case "welcomeMessage":
        return "Help us understand your experience\nYour feedback drives meaningful improvements\nTakes just a few minutes to complete";
      case "thankYouMessage":
        return "Thank you for taking the time to share your feedback. Your responses are valuable and will help us make meaningful improvements.";
      case "resultsSummary":
        return "Here are your assessment results. Review your scores across each category to identify strengths and areas for growth.";
      default:
        return "";
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AI CHAT (For routes.ts to use)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Process AI chat message with user context
 * Uses the shared callMistral for retry/monitoring/logging
 */
export async function processAIChatMessage(
  message: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  systemContext: string
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: systemContext },
    ...conversationHistory.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  try {
    return await callMistral(messages, {
      quality: "balanced",
      taskType: TASK_TYPES.AI_CHAT,
      promptVersion: PROMPT_VERSIONS.aiChat,
      temperature: 0.7,
      maxTokens: 1024,
    });
  } catch (error: any) {
    console.error("[AI Service] Chat error:", error);
    throw new AIServiceError(
      `Chat processing failed: ${error.message}`,
      TASK_TYPES.AI_CHAT,
      true,
      error
    );
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROMPT ENHANCEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Enhance a user's survey prompt using AI to make it more detailed and effective.
 * Takes a rough idea and transforms it into a comprehensive, well-structured prompt
 * that will generate better survey questions.
 */
export async function enhancePrompt(
  originalPrompt: string,
  surveyType?: string,
  additionalContext?: string
): Promise<{
  enhancedPrompt: string;
  suggestions: string[];
  explanation: string;
}> {
  if (!originalPrompt || originalPrompt.trim().length < 5) {
    throw new AIServiceError(
      "Please provide at least a brief description of what you want to measure",
      TASK_TYPES.PROMPT_ENHANCEMENT,
      false
    );
  }

  const systemPrompt = `You are an expert survey design consultant. Your job is to take a user's rough idea for a survey and transform it into a comprehensive, detailed prompt that will generate excellent survey questions.

CONTEXT:
- This is for the Evalia survey platform, which specializes in training feedback and assessment surveys
- The enhanced prompt will be used by AI to generate survey questions
${surveyType ? `- Survey type: ${surveyType}` : ""}
${additionalContext ? `- Additional context: ${additionalContext}` : ""}

YOUR TASK:
1. Analyze the user's rough prompt
2. Identify what they want to measure/assess
3. Expand it with:
   - Specific aspects to evaluate
   - Target audience considerations
   - Desired outcomes or insights
   - Question types that would work well
   - Any domain-specific considerations

OUTPUT FORMAT (JSON):
{
  "enhancedPrompt": "A detailed, well-structured prompt (2-4 paragraphs) that will generate excellent survey questions. Include specific topics, question types, and audience considerations.",
  "suggestions": ["3-5 specific topic areas or dimensions to cover"],
  "explanation": "A brief (1-2 sentences) explanation of what you improved and why"
}

IMPORTANT:
- Keep the user's original intent but make it much more comprehensive
- Add specific, actionable details
- Consider best practices in survey design
- Make the enhanced prompt clear and actionable for AI survey generation`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Please enhance this survey prompt:\n\n"${originalPrompt}"` },
  ];

  try {
    const response = await callMistral(messages, {
      quality: "balanced",
      responseFormat: { type: "json_object" },
      taskType: TASK_TYPES.PROMPT_ENHANCEMENT,
      promptVersion: PROMPT_VERSIONS.promptEnhancement,
      temperature: 0.7,
      maxTokens: 1024,
    });

    const result = safeParseJSON(response);

    if (!result || !result.enhancedPrompt) {
      // Fallback: use the response as the enhanced prompt
      return {
        enhancedPrompt: response || originalPrompt,
        suggestions: [],
        explanation: "AI enhanced your prompt with additional detail.",
      };
    }

    return {
      enhancedPrompt: result.enhancedPrompt,
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
      explanation: result.explanation || "Your prompt has been enhanced with more specific details.",
    };
  } catch (error: any) {
    console.error("[AI Service] Prompt enhancement error:", error);
    throw new AIServiceError(
      `Failed to enhance prompt: ${error.message}`,
      TASK_TYPES.PROMPT_ENHANCEMENT,
      true,
      error
    );
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TONE ADJUSTMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Adjust the tone of survey questions while preserving their meaning.
 * Returns the adjusted questions or the original if adjustment fails.
 */
export async function adjustQuestionsTone(
  questions: Question[],
  targetTone: "formal" | "casual" | "encouraging" | "technical"
): Promise<Question[]> {
  const toneDescriptions: Record<string, string> = {
    formal: "professional, structured, and polished language suitable for corporate or business contexts. Use clear, precise wording.",
    casual: "friendly, conversational, and approachable language that feels natural and relaxed. Use everyday words.",
    encouraging: "warm, supportive, and motivational language that builds confidence and makes respondents feel valued.",
    technical: "precise, industry-specific, and expert-level language appropriate for knowledgeable professionals.",
  };

  const systemPrompt = `You are an expert survey editor. Your task is to rewrite survey questions to match a specific tone while preserving their exact meaning and intent.

TARGET TONE: ${targetTone}
TONE DESCRIPTION: ${toneDescriptions[targetTone]}

RULES:
1. Preserve the EXACT meaning and intent of each question
2. Keep all answer options unchanged (only modify the question text and optional description)
3. Do NOT add any notes, annotations, brackets, or explanations
4. Do NOT change question IDs, types, or structure
5. Do NOT add "(adjusted to X tone)" or similar notes
6. Return ONLY valid JSON - no explanations or commentary

OUTPUT FORMAT:
Return a JSON array of questions with the same structure as input. Only the "question" and "description" fields should be modified.`;

  const userPrompt = `Rewrite these questions in a ${targetTone} tone. Return ONLY valid JSON, no explanations:

${JSON.stringify(questions, null, 2)}`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  try {
    const response = await callMistral(messages, {
      quality: "balanced",
      responseFormat: { type: "json_object" },
      taskType: TASK_TYPES.TONE_ADJUSTMENT,
      promptVersion: PROMPT_VERSIONS.toneAdjustment,
      temperature: 0.5, // Lower temperature for more consistent rewrites
      maxTokens: 4096,
    });

    // Try to parse as JSON
    const parsed = safeParseJSON(response);
    
    if (Array.isArray(parsed)) {
      // Validate each question has required fields
      return parsed.map((q: any, i: number) => ({
        ...questions[i], // Keep original structure
        question: q.question || questions[i].question,
        description: q.description !== undefined ? q.description : questions[i].description,
      }));
    }
    
    // If response has a questions array
    if (parsed && Array.isArray(parsed.questions)) {
      return parsed.questions.map((q: any, i: number) => ({
        ...questions[i],
        question: q.question || questions[i].question,
        description: q.description !== undefined ? q.description : questions[i].description,
      }));
    }

    // Fallback: return original questions unchanged
    console.warn("[AI Service] Tone adjustment returned unexpected format, returning original");
    return questions;
  } catch (error: any) {
    console.error("[AI Service] Tone adjustment error:", error);
    // Return original questions on error - don't add bracket notes
    return questions;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POWERPOINT PARSING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Extract text content from PowerPoint (.pptx) files
 * Uses the Office Open XML format structure
 */
export async function parsePowerPoint(buffer: Buffer): Promise<string> {
  try {
    // PowerPoint files are ZIP archives containing XML
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(buffer);
    
    let extractedText = "";
    const slideFiles: string[] = [];
    
    // Find all slide XML files
    zip.forEach((relativePath) => {
      if (relativePath.match(/ppt\/slides\/slide\d+\.xml$/)) {
        slideFiles.push(relativePath);
      }
    });
    
    // Sort slides numerically
    slideFiles.sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml$/)?.[1] || "0");
      const numB = parseInt(b.match(/slide(\d+)\.xml$/)?.[1] || "0");
      return numA - numB;
    });
    
    // Extract text from each slide
    for (let i = 0; i < slideFiles.length; i++) {
      const slideFile = slideFiles[i];
      const content = await zip.file(slideFile)?.async("text");
      
      if (content) {
        // Extract text from XML (look for <a:t> text elements)
        const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g);
        if (textMatches) {
          const slideText = textMatches
            .map((match) => match.replace(/<\/?a:t>/g, "").trim())
            .filter((text) => text.length > 0)
            .join(" ");
          
          if (slideText.trim()) {
            extractedText += `\n\n--- Slide ${i + 1} ---\n${slideText}`;
          }
        }
      }
    }
    
    // Also try to get speaker notes
    const notesFiles: string[] = [];
    zip.forEach((relativePath) => {
      if (relativePath.match(/ppt\/notesSlides\/notesSlide\d+\.xml$/)) {
        notesFiles.push(relativePath);
      }
    });
    
    if (notesFiles.length > 0) {
      extractedText += "\n\n--- Speaker Notes ---";
      for (const noteFile of notesFiles) {
        const content = await zip.file(noteFile)?.async("text");
        if (content) {
          const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g);
          if (textMatches) {
            const noteText = textMatches
              .map((match) => match.replace(/<\/?a:t>/g, "").trim())
              .filter((text) => text.length > 0)
              .join(" ");
            if (noteText.trim()) {
              extractedText += `\n${noteText}`;
            }
          }
        }
      }
    }
    
    return extractedText.trim();
  } catch (error: any) {
    console.error("[AI Service] PowerPoint parsing error:", error);
    throw new AIServiceError(
      `Failed to parse PowerPoint file: ${error.message}`,
      TASK_TYPES.DOCUMENT_OCR,
      true,
      error
    );
  }
}
