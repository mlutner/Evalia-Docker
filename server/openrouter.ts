import type { Question } from "@shared/schema";

// Use Mistral API key
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_BASE_URL = "https://api.mistral.ai/v1";
const MISTRAL_OCR_URL = "https://api.mistral.ai/v1/ocr";

// Mistral models
const MODELS = {
  // For survey generation and chat
  GENERATION: "pixtral-large-latest", // Mistral Pixtral Large for survey generation and refinement
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
 * Generate survey questions from text content
 */
export async function generateSurveyFromText(
  content: string,
  context?: string
): Promise<{ title: string; questions: Question[] }> {
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
      systemPrompt = `You are an expert survey copywriter specializing in professional training and feedback systems.

YOUR TASK: Write a compelling survey description that hooks respondents and sets expectations.

TONE: Professional, clear, and action-oriented. Make respondents feel their input matters.

REQUIREMENTS:
- Length: 50-85 words (approximately 2-3 sentences)
- Start with the VALUE they'll provide (not what YOU want)
- Mention what the survey covers in a natural way (based on the questions)
- End with a subtle call-to-action or reassurance
- Use active voice and conversational language
- Avoid jargon; be direct and sincere
- NO sales language or hype

EXAMPLE STRUCTURE:
"This [topic] survey captures [key insight]. Your feedback on [what matters] will help [positive outcome]. It takes about [time] and requires only honest responses."

Output ONLY the description text, nothing else.`;
      userPrompt = `Survey Title: ${surveyTitle}\n\nQuestions covered:\n${questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')}\n\nWrite the survey description now. Remember: 50-85 words, focus on value, professional tone, active voice only.`;
      break;
    
    case "welcomeMessage":
      systemPrompt = `You are an expert survey copywriter specializing in professional training and feedback systems.

YOUR TASK: Write a warm, welcoming message that sets the tone and builds trust.

TONE: Professional yet approachable. Make respondents feel welcomed and valued.

REQUIREMENTS:
- Length: 60-100 words (approximately 2-3 sentences)
- Open with genuine gratitude for their time
- Explain WHY their perspective matters (not generic—tie to the survey topic)
- Include a subtle note about confidentiality or brevity to reduce anxiety
- Use conversational, human language
- Create a sense of partnership—they're helping solve something real
- End on a positive, motivating note

EXAMPLE STRUCTURE:
"Thank you for taking time to share your perspective. Your honest feedback on [topic] is invaluable to [improvement goal]. This survey is [time estimate] and completely confidential. Let's get started—your insights matter."

Output ONLY the welcome message, nothing else.`;
      userPrompt = `Survey Title: ${surveyTitle}\n\nQuestions covered:\n${questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')}\n\nWrite the welcome message now. Remember: 60-100 words, warm and professional, emphasize their value, confidentiality note recommended.`;
      break;
    
    case "thankYouMessage":
      systemPrompt = `You are an expert survey copywriter specializing in professional training and feedback systems.

YOUR TASK: Write a genuine thank you message that closes the survey experience on a high note.

TONE: Sincere, appreciative, and forward-looking. Make respondents feel their time was well-spent.

REQUIREMENTS:
- Length: 40-65 words (approximately 1-2 sentences)
- Start with genuine gratitude specific to what they provided
- Briefly mention what happens next or the impact of their feedback
- Close with a positive sentiment or invitation to stay engaged
- Avoid being overly effusive or generic
- Use simple, direct language
- Leave them feeling like they made a difference

EXAMPLE STRUCTURE:
"Thank you for your thoughtful feedback—it truly helps us [specific outcome]. Your insights will directly inform [action/improvement]. We appreciate you."

Output ONLY the thank you message, nothing else.`;
      userPrompt = `Survey Title: ${surveyTitle}\n\nQuestions covered:\n${questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')}\n\nWrite the thank you message now. Remember: 40-65 words, genuine and specific, mention next steps, close positively.`;
      break;
  }

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  return callMistral(messages, MODELS.GENERATION);
}
