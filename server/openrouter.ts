import type { Question } from "@shared/schema";

// User added OpenRouter key as OPENAI_API_KEY in secrets
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// Free models from OpenRouter (November 2025)
const MODELS = {
  // For survey generation and chat
  GENERATION: "moonshotai/kimi-k2:free", // Kimi K2 model for improved survey generation
  // For OCR/document parsing (vision model)
  OCR: "moonshotai/kimi-k2:free", // Kimi K2 model for document parsing
};

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callOpenRouter(
  messages: ChatMessage[],
  model: string = MODELS.GENERATION,
  responseFormat?: { type: "json_object" }
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key not configured");
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.REPLIT_DOMAINS || "http://localhost:5000",
      "X-Title": "Evalia Survey Builder",
    },
    body: JSON.stringify({
      model,
      messages,
      ...(responseFormat && { response_format: responseFormat }),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
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

  return callOpenRouter(messages, MODELS.OCR);
}

/**
 * Generate survey questions from text content
 */
export async function generateSurveyFromText(
  content: string,
  context?: string
): Promise<{ title: string; questions: Question[] }> {
  const systemPrompt = `You are an expert at extracting survey questions from documents. Your job is to CAREFULLY read the document and extract ALL questions with COMPLETE answer choices.

CRITICAL RULES FOR DOCUMENT EXTRACTION:
- When you see a multiple choice or checkbox question, extract EVERY SINGLE answer option listed
- Do NOT skip any answer choices - if the document shows A, B, C, D, E - include all 5 options
- Preserve the exact wording of questions and answer choices from the document
- If a question has numbered or lettered options (1,2,3 or A,B,C), capture ALL of them
- Pay special attention to questions that continue across multiple lines or pages

QUESTION GENERATION RULES:
- Generate 8-12 questions total (if document has fewer, extract what's there)
- Use varied question types: text, textarea, multiple_choice, checkbox, email, number
- For multiple_choice: extract ALL options from document (minimum 2, typically 4-5)
- For checkbox: extract ALL options that allow multiple selections
- Make questions clear and preserve original intent

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
✓ Every multiple_choice has at least 2 options (preferably 4-5)
✓ Every checkbox has at least 2 options
✓ All answer choices from the document are included
✓ Question text matches the document wording`;

  const userPrompt = context
    ? `Context: ${context}\n\nDocument content to extract questions from:\n${content}\n\nExtract ALL questions with COMPLETE answer choices. Do not skip any options.`
    : `Extract survey questions from this content. Include ALL answer choices for every multiple choice question:\n${content}`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const response = await callOpenRouter(messages, MODELS.GENERATION, { type: "json_object" });
  
  try {
    const parsed = JSON.parse(response);
    
    // Validate that multiple choice questions have adequate options
    const questions = (parsed.questions || []).map((q: any) => {
      if ((q.type === 'multiple_choice' || q.type === 'checkbox') && (!q.options || q.options.length < 2)) {
        console.warn(`Question "${q.question}" has insufficient options, adding defaults`);
        q.options = q.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
      }
      return q;
    });
    
    return {
      title: parsed.title || "Generated Survey",
      questions,
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
  conversationHistory: ChatMessage[] = []
): Promise<{ questions?: Question[]; message: string }> {
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
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  const response = await callOpenRouter(messages, MODELS.GENERATION, { type: "json_object" });
  
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
 * Generate survey text fields (description, welcome message, thank you message)
 */
export async function generateSurveyText(
  fieldType: "description" | "welcomeMessage" | "thankYouMessage",
  surveyTitle: string,
  questions: Question[]
): Promise<string> {
  let systemPrompt = "";
  let userPrompt = "";

  switch (fieldType) {
    case "description":
      systemPrompt = `You are a professional survey copywriter. Create a compelling, concise survey description (1-2 sentences) that explains what the survey is about and encourages participation.`;
      userPrompt = `Create a brief description for this survey:\n\nTitle: ${surveyTitle}\n\nQuestions:\n${questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')}\n\nWrite only the description text, no extra commentary.`;
      break;
    
    case "welcomeMessage":
      systemPrompt = `You are a professional survey copywriter. Create a warm, friendly welcome message (2-3 sentences) that makes respondents feel valued and explains the survey's purpose.`;
      userPrompt = `Create a welcoming message for this survey:\n\nTitle: ${surveyTitle}\n\nQuestions:\n${questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')}\n\nWrite only the welcome message, no extra commentary.`;
      break;
    
    case "thankYouMessage":
      systemPrompt = `You are a professional survey copywriter. Create a genuine, appreciative thank you message (1-2 sentences) that shows gratitude for completing the survey.`;
      userPrompt = `Create a thank you message for this survey:\n\nTitle: ${surveyTitle}\n\nQuestions:\n${questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')}\n\nWrite only the thank you message, no extra commentary.`;
      break;
  }

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  return callOpenRouter(messages, MODELS.GENERATION);
}
