import type { Question } from "@shared/schema";
import mammoth from "mammoth";

// Use Mistral API key
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_BASE_URL = "https://api.mistral.ai/v1";
const MISTRAL_OCR_URL = "https://api.mistral.ai/v1/ocr";

// Mistral models
const MODELS = {
  // For survey generation and chat
  GENERATION: "mistral-medium-latest", // Mistral Medium for survey generation and refinement
  // For OCR/document parsing (native OCR model)
  OCR: "mistral-ocr-2505", // Mistral OCR native model - specialized for document OCR
};

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callMistral(
  messages: ChatMessage[],
  model: string = MODELS.GENERATION,
  responseFormat?: { type: "json_object" }
): Promise<string> {
  if (!MISTRAL_API_KEY) {
    throw new Error("Mistral API key not configured");
  }

  const response = await fetch(`${MISTRAL_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      ...(responseFormat && { response_format: responseFormat }),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mistral API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

/**
 * Parse PDF using Mistral OCR native API
 */
export async function parsePDFWithVision(pdfBuffer: Buffer, fileName: string): Promise<string> {
  if (!MISTRAL_API_KEY) {
    throw new Error("Mistral API key not configured");
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
          type: "document_url",
          document_url: `data:application/pdf;base64,${base64PDF}`,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mistral OCR API error: ${error}`);
    }

    const data = await response.json();
    console.log("Mistral OCR response:", JSON.stringify(data).substring(0, 500));
    
    // OCR returns pages array with markdown content
    if (data.pages && Array.isArray(data.pages)) {
      return data.pages.map((page: any) => page.markdown || "").join("\n");
    }
    
    // Try alternative response formats
    return data.result?.markdown || data.markdown || data.content || data.text || "";
  } catch (error: any) {
    throw new Error(`PDF OCR failed: ${error.message}`);
  }
}

/**
 * Parse text from an uploaded document using OCR
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

  return callMistral(messages, MODELS.OCR);
}

/**
 * Calculate scores using AI for intelligent answer analysis
 */
export async function calculateScoresWithAI(
  questions: Question[],
  answers: Record<string, string | string[]>,
  scoreConfig: any
): Promise<Record<string, number>> {
  if (!scoreConfig?.enabled || !scoreConfig.categories) {
    return {};
  }

  // First try simple numeric scoring for rating questions
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
      const systemPrompt = `You are an expert assessment scorer. Score the following responses based on the assessment criteria. Return ONLY a JSON object with category IDs as keys and numeric scores as values.`;

      const responseTexts = textQuestionsToScore.map((q: Question) => {
        const answerValue = answers[q.id];
        const answerText = Array.isArray(answerValue) ? answerValue.join(', ') : String(answerValue);
        return `Question: "${q.question}"\nCategory: ${scoreConfig.categories.find((c: any) => c.id === q.scoringCategory)?.name || q.scoringCategory}\nResponse: "${answerText}"`;
      }).join('\n\n');

      const userPrompt = `Score these responses on a scale of 0-5 for each category:\n\n${responseTexts}\n\nReturn only valid JSON like: {"cat1": 4, "cat2": 3}`;

      const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ];

      const response = await callMistral(messages, MODELS.GENERATION, { type: "json_object" });
      const aiScores = JSON.parse(response);
      
      // Add AI scores to category scores
      Object.entries(aiScores).forEach(([catId, score]: [string, any]) => {
        if (typeof score === "number") {
          scores[catId] = (scores[catId] || 0) + score;
        }
      });
    } catch (error) {
      console.warn("AI scoring failed, continuing with numeric scores:", error);
    }
  }

  return scores;
}

/**
 * Calculate theoretical max score based on question count and types
 */
function calculateTheoreticalMaxScore(questions: Question[]): number {
  // Each question contributes up to 5 points
  // This is based on the scoring algorithm in schema.ts
  return questions.length * 5;
}

/**
 * Generate appropriate score ranges based on theoretical max
 */
function generateScoreRanges(categoryId: string, theoreticalMax: number, questionCount: number) {
  // Divide the max score into 3 ranges: low, mid, high
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
 */
/**
 * Generate a concise AI summary of the survey for dashboard display
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
    const response = await callMistral(messages, MODELS.GENERATION);
    return response.trim().substring(0, 150); // Trim to reasonable length
  } catch (error) {
    console.warn("Summary generation failed, using title:", error);
    return `${questions.length}-question survey`;
  }
}

export async function suggestScoringConfig(
  title: string,
  questions: Question[]
): Promise<any | null> {
  // Only suggest scoring for assessment/evaluation surveys
  const assessmentKeywords = ['assess', 'evaluate', 'score', 'skill', 'competency', 'leadership', 'performance', 'capability', 'proficiency', 'mental health', 'mental', 'health', 'wellbeing', 'wellness', 'engagement', 'satisfaction', 'understanding', 'knowledge', 'learning', 'training', 'effectiveness', 'awareness', 'readiness'];
  const isAssessmentSurvey = assessmentKeywords.some(keyword => 
    title.toLowerCase().includes(keyword) || 
    questions.some(q => q.question.toLowerCase().includes(keyword))
  );

  if (!isAssessmentSurvey) {
    console.log("Survey not detected as assessment survey. Title:", title, "Keywords:", assessmentKeywords);
    return null; // Don't suggest scoring for non-assessment surveys
  }

  // Calculate theoretical max score
  const theoreticalMax = calculateTheoreticalMaxScore(questions);
  console.log(`Scoring config: ${questions.length} questions, theoretical max: ${theoreticalMax}`);

  const systemPrompt = `You are an expert in educational assessment and survey design. Based on survey questions, suggest a scoring configuration that would work well for this assessment.

SURVEY ANALYSIS:
- Total Questions: ${questions.length}
- Theoretical Maximum Score Per Category: ${theoreticalMax} (${questions.length} questions × 5 points each)
- Scoring Scale: Score ranges MUST fit within the theoretical maximum of ${theoreticalMax}

INSTRUCTIONS:
1. Analyze the survey questions to identify 2-3 key competency/skill categories
2. For each category, suggest 3 score ranges that scale with the question count
3. Score ranges should divide the ${theoreticalMax}-point scale into thirds:
   - LOW (0-${Math.ceil(theoreticalMax / 3)}): "Needs Development" or "Developing"
   - MID (${Math.ceil(theoreticalMax / 3) + 1}-${Math.ceil((theoreticalMax * 2) / 3)}): "Developing" or "Satisfactory" or "Moderate"
   - HIGH (${Math.ceil((theoreticalMax * 2) / 3) + 1}-${theoreticalMax}): "Strong", "Excellent", or "Advanced"
4. Suggest which questions contribute to which categories

CRITICAL REQUIREMENTS:
- Each range must have a UNIQUE label - never repeat the same label
- Score ranges must respect the theoretical maximum of ${theoreticalMax}
- Ranges must be contiguous (no gaps) and non-overlapping
- Interpretations must reference the actual score range
- All minScore and maxScore values must be <= ${theoreticalMax}

Return ONLY valid JSON with this exact structure:
{
  "categories": [
    { "id": "cat1", "name": "Category Name" },
    { "id": "cat2", "name": "Another Category" }
  ],
  "scoreRanges": [
    { "category": "cat1", "label": "Needs Development", "minScore": 0, "maxScore": ${Math.ceil(theoreticalMax / 3)}, "interpretation": "..." },
    { "category": "cat1", "label": "Developing", "minScore": ${Math.ceil(theoreticalMax / 3) + 1}, "maxScore": ${Math.ceil((theoreticalMax * 2) / 3)}, "interpretation": "..." },
    { "category": "cat1", "label": "Excellent", "minScore": ${Math.ceil((theoreticalMax * 2) / 3) + 1}, "maxScore": ${theoreticalMax}, "interpretation": "..." }
  ],
  "suggestedQuestionCategoryMap": {
    "q1": "cat1",
    "q2": "cat2",
    "q3": "cat1"
  }
}`;

  const userPrompt = `Survey Title: ${title}
Question Count: ${questions.length}

Questions:
${questions.map((q, i) => `Q${i + 1} (ID: ${q.id}): ${q.question}`).join('\n')}

Analyze these questions and suggest:
1. 2-3 key skill/competency categories to score on
2. Score ranges with labels and interpretations that fit within the ${theoreticalMax}-point scale
3. Which questions contribute to which categories

Remember: Score ranges must divide the ${theoreticalMax}-point max into three tiers with different labels.
Make interpretations clear and practical - they'll be shown to respondents after survey completion.`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  try {
    const response = await callMistral(messages, MODELS.GENERATION, { type: "json_object" });
    const parsed = JSON.parse(response);
    
    const theoreticalMax = calculateTheoreticalMaxScore(questions);
    
    // Post-process to ensure score ranges are valid and distinct
    const processedRanges = (parsed.scoreRanges || []).map((range: any, index: number) => {
      // Validate and clamp score ranges
      range.minScore = Math.max(0, Math.min(range.minScore, theoreticalMax));
      range.maxScore = Math.max(0, Math.min(range.maxScore, theoreticalMax));
      
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
    }).filter(r => r.minScore !== r.maxScore || r.minScore === 0); // Remove invalid ranges
    
    // If no valid ranges, generate fallback ranges
    if (processedRanges.length === 0 && parsed.categories && parsed.categories.length > 0) {
      console.warn("No valid ranges generated, using fallback ranges");
      parsed.categories.forEach((cat: any) => {
        const fallbackRanges = generateScoreRanges(cat.id, theoreticalMax, questions.length);
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
    console.warn("Scoring suggestion failed, will skip:", error);
    return null;
  }
}

/**
 * Generate survey questions from text content
 */
export async function generateSurveyFromText(
  content: string,
  context?: string
): Promise<{ title: string; questions: Question[]; scoreConfig?: any }> {
  const systemPrompt = `You are an expert at extracting survey questions from documents. Your job is to CAREFULLY read the document and extract ALL questions with COMPLETE answer choices. Do NOT skip or condense any questions.

CRITICAL RULES FOR DOCUMENT EXTRACTION:
- Extract EVERY SINGLE question from the document - no skipping or summarizing
- When you see statements with rating scales (like 1-5 Likert scales), EACH statement is a separate question
- For multiple choice or checkbox questions, extract EVERY SINGLE answer option listed
- Do NOT skip any answer choices - if the document shows A, B, C, D, E - include all 5 options
- Preserve the exact wording of questions and answer choices from the document
- If a question has numbered or lettered options (1,2,3 or A,B,C), capture ALL of them
- Pay special attention to questions that continue across multiple lines or pages
- For Likert/rating questions, preserve the rating scale (e.g., "1 (Strongly Disagree) to 5 (Strongly Agree)") in the options

QUESTION GENERATION RULES:
- Extract ALL questions from the document - there is no limit on quantity
- Use varied question types based on the document: text, textarea, multiple_choice, checkbox, email, number
- For rating scales (Likert), use type "multiple_choice" with the rating options as choices
- For multiple_choice: extract ALL options from document (minimum 2)
- For checkbox: extract ALL options that allow multiple selections
- Make questions clear and preserve original intent and wording

Return ONLY valid JSON with this exact structure:
{
  "title": "Survey Title (extract from document or generate)",
  "questions": [
    {
      "id": "q1",
      "type": "text" | "textarea" | "multiple_choice" | "checkbox" | "email" | "number",
      "question": "Question text exactly as in document?",
      "description": "Optional context",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "required": true
    }
  ]
}

VALIDATION CHECKLIST:
✓ ALL questions from the document are included (do not skip any)
✓ Every statement/question in the document has been extracted as a separate question
✓ Every multiple_choice has at least 2 options (all options from document)
✓ Every checkbox has at least 2 options (all options from document)
✓ All answer choices from the document are included
✓ Question text matches the document wording exactly
✓ For rating scales: options include the full scale (e.g., 1-5) with labels (e.g., "Strongly Disagree" to "Strongly Agree")`;

  const userPrompt = context
    ? `Context: ${context}\n\nDocument content to extract questions from:\n${content}\n\nExtract ALL questions with COMPLETE answer choices. Do not skip any options.`
    : `Extract survey questions from this content. Include ALL answer choices for every multiple choice question:\n${content}`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const response = await callMistral(messages, MODELS.GENERATION, { type: "json_object" });
  
  try {
    const parsed = JSON.parse(response);
    
    // Validate that multiple choice questions have adequate options
    let questions = (parsed.questions || []).map((q: any) => {
      if ((q.type === 'multiple_choice' || q.type === 'checkbox') && (!q.options || q.options.length < 2)) {
        console.warn(`Question "${q.question}" has insufficient options, adding defaults`);
        q.options = q.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
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
      console.warn("Could not suggest scoring config:", scoringError);
    }
    
    return {
      title: parsed.title || "Generated Survey",
      questions,
      ...(scoreConfig && { scoreConfig }),
    };
  } catch (error) {
    console.error("Failed to parse survey generation response:", error);
    throw new Error("Failed to generate survey questions");
  }
}

/**
 * Handle conversational refinements to survey questions
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
      console.error("File processing in chat failed:", fileError);
      enhancedMessage = `${userMessage}\n\n[Note: Could not process attached file]`;
    }
  }

  // Build messages WITHOUT fileData field - only include role and content
  const systemPrompt = `You are an expert survey design consultant specializing in training assessments. Your role is to provide expert guidance, actionable recommendations, and direct edits to improve survey quality.

━━━ SURVEY CONTEXT ━━━
Title: ${survey.title}
Description: ${survey.description || 'None'}
Questions: ${survey.questions.length}

━━━ YOUR EXPERTISE AREAS ━━━
1. CLARITY & PRECISION: Eliminate ambiguity, bias, and jargon
2. QUESTION QUALITY: Ensure questions measure what they intend to measure
3. OPTIONS COMPLETENESS: Verify answer choices are exhaustive and mutually exclusive
4. RESPONDENT EXPERIENCE: Optimize flow, cognitive load, and engagement
5. SCORING ALIGNMENT: Ensure scorable questions support assessment categories

━━━ RESPONSE STYLE ━━━
- CONCISE: 1-2 sentences for observations, 2-3 bullets for recommendations
- SPECIFIC: Reference exact questions by number and provide concrete improvements
- ACTIONABLE: Every recommendation includes HOW to implement it
- DIRECT: Provide quick wins first, then strategic improvements
- CONVERSATIONAL: Use "you/your" language, maintain encouraging tone

━━━ OBSERVATION PATTERNS - Use for unsolicited feedback ━━━
When analyzing survey WITHOUT being asked to improve it, provide:
1. ONE STRENGTH: "Strong point: [specific observation]"
2. ONE IMPROVEMENT: "Consider: [specific recommendation] → [benefit]"
3. ONE QUESTION: "Quick clarity check: [question about intent]"

Example: "Strong point: Q3 uses clear Likert scale. Consider: Add a neutral middle option to Q5 for respondents who have no experience. Quick check: Does Q7 need a follow-up skip logic?"

━━━ MODIFICATION INSTRUCTIONS ━━━
CRITICAL RULES for all edits:
- PRESERVE question IDs and order (unless explicitly asked to reorder/delete)
- PRESERVE all existing options (unless asked to replace/remove)
- ADD options without replacing existing ones
- VALIDATE that all fields match the Question schema

SUPPORTED MODIFICATIONS:
• Add/modify/remove questions
• Revise question wording for clarity
• Add/update answer options (preserve existing)
• Adjust required/optional status
• Modify skip conditions or rating scales
• Assign/update scoring categories

CHANGE REQUEST EXAMPLES & RESPONSES:
- "Add options D and E to Q3" → Add those exact options to Q3's options array
- "Improve Q5 wording" → Refactor for clarity while preserving question intent
- "Remove the text field" → Delete that question from the array
- "Make Q2 optional" → Set required: false for Q2
- "Change Q4 to a 10-point scale" → Update ratingScale to 10

━━━ JSON RESPONSE FORMAT ━━━
ALWAYS return valid JSON. Choose ONE format:

FORMAT A - User requested modifications:
{
  "questions": [...complete updated questions array...],
  "message": "What changed: 1) [specific change], 2) [specific change]. Why: [brief reasoning]"
}

FORMAT B - Feedback/recommendations WITHOUT modifications:
{
  "message": "Concise observation + specific recommendations as bullets + optional question"
}

FORMAT C - Answer question (no modifications):
{
  "message": "Direct answer + supporting details if relevant"
}

━━━ SURVEY IMPROVEMENT CHECKLIST ━━━
When reviewing, look for:
✓ Question clarity (no jargon, avoid double-negatives)
✓ Options completeness (can respondents pick an honest answer?)
✓ Sequence flow (logical progression, related topics grouped)
✓ Required fields (only essential questions marked required)
✓ Rating scales (appropriate to question type)
✓ Scoring alignment (questions properly assigned to categories)

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

  const response = await callMistral(messages, MODELS.GENERATION, { type: "json_object" });
  
  try {
    const parsed = JSON.parse(response);
    return {
      questions: parsed.questions,
      message: parsed.message || "I've updated the survey based on your request.",
    };
  } catch (error) {
    console.error("Failed to parse refinement response:", error);
    throw new Error("Failed to process your request");
  }
}

/**
 * Generate survey text fields (description, welcome message, thank you message, results summary)
 */
export async function generateSurveyText(
  fieldType: "description" | "welcomeMessage" | "thankYouMessage" | "resultsSummary",
  surveyTitle: string,
  questions: Question[],
  scoreConfig?: any
): Promise<string> {
  let systemPrompt = "";
  let userPrompt = "";

  switch (fieldType) {
    case "description":
      systemPrompt = `You are an expert survey copywriter specializing in professional training and feedback systems.

YOUR TASK: Write a brief introduction for the survey welcome screen (appears as subtitle below the title).

CRITICAL CONSTRAINTS:
- Length: 25-35 words maximum (approximately 2 sentences, no more)
- Concise and benefit-focused
- NO quotation marks around your answer

TONE: Conversational, warm, direct. Make respondents feel their feedback is valued.

REQUIREMENTS:
- Start with the benefit to them
- Use "you" language
- Be authentic, no corporate jargon
- KEEP IT SHORT - this is a subtitle, not a paragraph

EXAMPLE FORMAT (reference only - no quotes):
✓ Your voice matters. Let's make this training work for you.
✓ Your feedback shapes better learning experiences. We want to hear from you.

OUTPUT FORMAT: Plain text only, no quotation marks, no line breaks.`;
      userPrompt = `Survey Title: ${surveyTitle}\n\nQuestions covered:\n${questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')}\n\nWrite 25-35 words maximum (about 2 sentences). This is a subtitle under the survey title. NO quotation marks. Make it brief and benefit-focused.`;
      break;
    
    case "welcomeMessage":
      systemPrompt = `You are an expert survey copywriter specializing in professional training and feedback systems.

YOUR TASK: Generate EXACTLY 3 bullet points explaining the PURPOSE and VALUE of this survey. These appear under "The purpose of the survey:" on the welcome screen (3 lines max).

TONE: Clear, direct, and action-focused. Explain WHY respondents should take the survey.

REQUIREMENTS FOR EACH POINT:
- Length: 8-12 words per point MAXIMUM (must fit on one line, concise and scannable)
- Focus on PURPOSE: Why this survey matters, what it achieves
- Be specific to the survey questions—derive from topics
- Use benefit-focused language: "identify," "improve," "discover," "evaluate"
- Start with a concrete outcome
- Avoid generic statements

EXAMPLES (format only, NOT content):
✓ "Identify training methods that work best for you"
✓ "Discover how to apply new skills to your role"
✓ "Understand what drives your professional growth"
✗ "Learn more about yourself" (too generic)
✗ "Learn about self-improvement" (too generic)

CRITICAL FORMAT:
- Output EXACTLY 3 bullet points (no more, no less)
- Separate each point with a newline character (\n)
- NO bullet symbols, NO numbers, NO dashes—just the text
- NO header text or introduction
- 8-12 words per point MAXIMUM
- Plain text only`;
      userPrompt = `Survey Title: ${surveyTitle}\n\nQuestions covered:\n${questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')}\n\nGenerate EXACTLY 3 bullet points (8-12 words max each). Each on its own line. NO bullets, NO numbers, NO dashes. Just text, one purpose per line. Must fit on 3 lines total.`;
      break;
    
    case "thankYouMessage":
      systemPrompt = `You are an expert survey copywriter specializing in professional training and feedback systems.

YOUR TASK: Write a warm, genuine thank you message for the survey completion screen.

TONE: Sincere, appreciative, and forward-focused. Make respondents feel their effort mattered and created real impact.

REQUIREMENTS:
- Length: 50-70 words (approximately 2-3 sentences, fits on completion screen)
- Open with specific, authentic gratitude (reference what they just provided if possible)
- Acknowledge the value of their insights—be concrete about impact
- Close with an empowering or positive sentiment
- Avoid generic "thank yous" or corporate language
- Use warm, human-centered language
- Leave them feeling they contributed to something meaningful

BEST PRACTICES:
- Use their language: reference the survey topic
- Show impact: "Your feedback will help us..." or "Your insights shape..."
- End on an inspiring note—not a goodbye, but a connection

OUTPUT FORMAT: Plain text only, no special formatting.`;
      userPrompt = `Survey Title: ${surveyTitle}\n\nQuestions covered:\n${questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')}\n\nWrite a 50-70 word thank you message for the completion screen. Specific, warm, and impact-focused. Reference the survey topic to make it authentic.`;
      break;

    case "resultsSummary":
      systemPrompt = `You are an expert assessment copywriter specializing in professional development feedback.

YOUR TASK: Write a brief, welcoming summary message that appears above assessment results. This sets expectations and explains what respondents are about to see.

TONE: Warm, insightful, and forward-focused. Help respondents understand the value of their personalized results.

REQUIREMENTS:
- Length: 40-60 words (approximately 2-3 sentences)
- Start with what they're about to discover
- Reference the key assessment categories/dimensions
- Create anticipation for insights without spoiling specifics
- Encourage reflection and growth mindset
- Avoid jargon or overly technical language

BEST PRACTICES:
- Use "you/your" language—make it personal
- Focus on self-discovery and growth
- Acknowledge assessment rigor while remaining accessible
- End with an empowering sentiment

OUTPUT FORMAT: Plain text only, no special formatting.`;
      const categories = scoreConfig?.categories?.map((c: any) => c.name).join(", ") || "this assessment";
      userPrompt = `Survey Title: ${surveyTitle}\n\nAssessment Categories: ${categories}\n\nWrite a 40-60 word results summary message. This appears before respondents see their personalized results. Make them feel excited to discover their insights.`;
      break;
  }

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  return callMistral(messages, MODELS.GENERATION);
}
