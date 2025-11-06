import type { Question } from "@shared/schema";

// User added OpenRouter key as OPENAI_API_KEY in secrets
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// Free models from OpenRouter (November 2025)
const MODELS = {
  // For survey generation and chat
  GENERATION: "mistral/mistral-small-3.1:free", // 24B, great for structured outputs
  // For OCR/document parsing (vision model)
  OCR: "mistral/mistral-small-3.1:free", // Also supports vision
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
  const systemPrompt = `You are an expert training survey designer. Create effective, professional survey questions based on the provided content.

IMPORTANT RULES:
- Generate 8-12 thoughtful questions
- Focus on training effectiveness, knowledge retention, and practical application
- Use varied question types: text, textarea, multiple_choice, checkbox, email, number
- Make questions clear and actionable
- For multiple choice: provide 4-5 balanced options
- For checkboxes: allow selecting multiple relevant options

Return ONLY valid JSON with this exact structure:
{
  "title": "Survey Title",
  "questions": [
    {
      "id": "q1",
      "type": "text" | "textarea" | "multiple_choice" | "checkbox" | "email" | "number",
      "question": "Question text?",
      "description": "Optional context",
      "options": ["Option 1", "Option 2"],
      "required": true
    }
  ]
}`;

  const userPrompt = context
    ? `Context: ${context}\n\nContent to analyze:\n${content}`
    : `Create survey questions based on this content:\n${content}`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const response = await callOpenRouter(messages, MODELS.GENERATION, { type: "json_object" });
  
  try {
    const parsed = JSON.parse(response);
    return {
      title: parsed.title || "Generated Survey",
      questions: parsed.questions || [],
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
  currentQuestions: Question[],
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<{ questions?: Question[]; message: string }> {
  const systemPrompt = `You are an AI assistant helping refine training surveys. 

Current survey has ${currentQuestions.length} questions. The user wants to make changes.

If the user asks to modify questions, return ONLY valid JSON with this structure:
{
  "questions": [...array of updated questions...],
  "message": "Brief explanation of what you changed"
}

If the user is just asking questions or chatting, return:
{
  "message": "Your conversational response"
}

Current questions:
${JSON.stringify(currentQuestions, null, 2)}`;

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
