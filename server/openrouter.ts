import type { Question } from "@shared/schema";
import mammoth from "mammoth";
import { callOpenRouterModel } from "../src/ai/openRouterClient";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface TokenUsageData {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  model: string;
}

// Global token tracking for this session
export let lastTokenUsage: TokenUsageData | null = null;

// Pricing table for various models
const PRICING: Record<string, { input: number; output: number }> = {
  // OpenAI
  "gpt-4o": { input: 5.0, output: 15.0 },
  "gpt-4-turbo": { input: 10.0, output: 30.0 },
  "gpt-3.5-turbo": { input: 0.5, output: 1.5 },
  "gpt-4-vision": { input: 10.0, output: 30.0 },
  // Mistral
  "pixtral-large-latest": { input: 2.0, output: 6.0 },
  "mistral-ocr-2505": { input: 0.5, output: 1.5 },
  "mistral-large": { input: 0.27, output: 0.81 },
  // Anthropic Claude
  "claude-3-5-sonnet": { input: 3.0, output: 15.0 },
  "claude-3-opus": { input: 15.0, output: 75.0 },
  // Google Gemini
  "gemini-pro": { input: 0.5, output: 1.5 },
};

// Calculate estimated cost
export function calculateTokenCost(usage: TokenUsageData): string {
  const pricing = PRICING[usage.model] || { input: 2.0, output: 6.0 }; // Mistral as default
  
  const inputCost = (usage.inputTokens / 1_000_000) * pricing.input;
  const outputCost = (usage.outputTokens / 1_000_000) * pricing.output;
  const totalCost = inputCost + outputCost;
  
  return totalCost.toFixed(6);
}

/**
 * Parse PDF using configured OCR provider
 */
export async function parsePDFWithVision(pdfBuffer: Buffer, fileName: string): Promise<string> {
  try {
    // Encode PDF as base64
    const base64PDF = pdfBuffer.toString("base64");
    
    const messages: ChatMessage[] = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract all text from this PDF document. Return only the extracted text content."
          },
          {
            type: "image_url",
            image_url: {
              url: `data:application/pdf;base64,${base64PDF}`,
            }
          }
        ] as any,
      }
    ];

    // Call OpenRouter with single model
    const result = await callOpenRouterModel(messages);
    return result.text;
  } catch (error: any) {
    // Fallback: use text-based extraction
    console.warn("OCR API failed, falling back to text extraction:", error.message);
    return "";
  }
}

/**
 * Parse text from an uploaded document
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

  const result = await callOpenRouterModel(messages);
  return result.text;
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

      const result = await callOpenRouterModel(messages);
    const response = result.text;
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

OUTPUT INSTRUCTIONS:
- Return ONLY valid JSON, no markdown code blocks, no extra text
- Do not include markdown formatting
- Start with { and end with }

REQUIRED JSON STRUCTURE:
{
  "categories": [{"id": "cat1", "name": "Leadership"}],
  "scoreRanges": [{"category": "cat1", "label": "Needs Development", "minScore": 0, "maxScore": 10, "interpretation": "string"}],
  "suggestedQuestionCategoryMap": {"q1": "cat1", "q2": "cat1"}
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
    const result = await callOpenRouterModel(messages);
    let response = result.text;
    
    // Extract JSON from response (in case there's markdown code blocks)
    let jsonStr = response.trim();
    
    // Remove markdown code blocks if present
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    
    // Extract JSON object
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    const parsed = JSON.parse(jsonStr);
    
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

OUTPUT INSTRUCTIONS:
- Return ONLY valid JSON, no markdown code blocks, no extra text
- Do not include markdown formatting
- Start with { and end with }

REQUIRED JSON STRUCTURE (follow exactly):
{
  "title": "string",
  "questions": [
    {
      "id": "q1",
      "type": "text|textarea|multiple_choice|checkbox|email|number",
      "question": "string",
      "description": "string or null",
      "options": ["string","string"],
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

  const result = await callOpenRouterModel(messages);
  const response = result.text;
  
  try {
    // Extract JSON from response (in case there's extra text or markdown)
    let jsonStr = response.trim();
    
    // Remove markdown code blocks if present
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    
    // Extract JSON object
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    const parsed = JSON.parse(jsonStr);
    
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
    console.error("Raw response (first 500 chars):", response.substring(0, 500));
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
  const systemPrompt = `You are an AI assistant helping refine training surveys. You have full context about the survey.

SURVEY INFORMATION:
- Title: ${survey.title}
- Description: ${survey.description || 'None'}
- Welcome Message: ${survey.welcomeMessage || 'None'}
- Thank You Message: ${survey.thankYouMessage || 'None'}
- Number of questions: ${survey.questions.length}

CRITICAL: When user mentions missing answer choices or options:
- Add ALL the missing options they mention
- Preserve all existing options
- For example, if they say "add options D and E to question 3", add those exact options
- If they provide the text of missing options, use their exact wording

COMMON REQUESTS:
- "What is this survey about?" → Explain based on title, description, and questions
- "How many questions are there?" → Answer based on the current question count
- "Fix the missing options" → Review questions and add missing answer choices
- "Question X is missing option Y" → Add that specific option to that question
- "Add more options" → Add 1-2 more relevant options to multiple choice questions
- "Change question wording" → Modify the question text while preserving options
- "Remove/Delete question" → Remove that question from the array

If the user asks to modify questions, return ONLY valid JSON with this structure:
{
  "questions": [...complete array of updated questions...],
  "message": "Brief explanation of what you changed"
}

If the user is just asking questions or chatting (not requesting changes), return:
{
  "message": "Your conversational response"
}

Current questions:
${JSON.stringify(survey.questions, null, 2)}`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: enhancedMessage },
  ];

  const result = await callOpenRouterModel(messages);
  
  try {
    const parsed = JSON.parse(result.text);
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

  const result = await callOpenRouterModel(messages);
  return result.text;
}
