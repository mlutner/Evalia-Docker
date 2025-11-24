import type { Question, SurveyResponse } from "@shared/schema";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_BASE_URL = "https://api.mistral.ai/v1";

async function callMistral(
  messages: ChatMessage[],
  model: string = "mistral-medium-latest"
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
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mistral API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

export async function analyzeResponses(
  questions: Question[],
  responses: SurveyResponse[],
  surveyTitle: string
): Promise<{
  themes: Array<{ theme: string; mentions: number; percentage: number; exampleQuotes: string[] }>;
  sentiment: { positive: number; neutral: number; negative: number };
  summary: string;
  topPainPoints: string[];
  recommendations: string[];
}> {
  // Extract all text/textarea responses
  const textResponses: string[] = [];
  const textQuestions = questions.filter(
    (q) => q.type === "text" || q.type === "textarea"
  );

  responses.forEach((response) => {
    textQuestions.forEach((q) => {
      const answer = response.answers[q.id];
      if (answer && typeof answer === "string" && answer.trim()) {
        textResponses.push(answer);
      }
    });
  });

  if (textResponses.length === 0) {
    return {
      themes: [],
      sentiment: { positive: 0, neutral: 0, negative: 0 },
      summary: "No text responses to analyze.",
      topPainPoints: [],
      recommendations: [],
    };
  }

  const systemPrompt = `You are an expert training data analyst. Analyze the following survey responses and provide insights in JSON format.

SURVEY: "${surveyTitle}"
TOTAL TEXT RESPONSES: ${textResponses.length}

Your analysis must identify:
1. THEMES: Recurring topics/ideas mentioned (extract 5-7 top themes)
2. SENTIMENT: Classify each response as positive, neutral, or negative
3. PAIN POINTS: Top 3-5 challenges/concerns mentioned
4. KEY QUOTES: The most representative/impactful quotes (2-3 per theme)
5. RECOMMENDATIONS: 2-3 specific actions based on the feedback

Return ONLY valid JSON with this structure:
{
  "themes": [
    {
      "theme": "theme name",
      "mentions": number,
      "exampleQuotes": ["quote 1", "quote 2", "quote 3"]
    }
  ],
  "sentiment": { "positive": number, "neutral": number, "negative": number },
  "summary": "1-2 sentence summary of main findings",
  "topPainPoints": ["pain point 1", "pain point 2", "pain point 3"],
  "recommendations": ["action 1", "action 2", "action 3"]
}`;

  const userMessage = `Analyze these training survey responses:\n\n${textResponses
    .map((r, i) => `Response ${i + 1}: "${r}"`)
    .join("\n\n")}`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  try {
    const response = await callMistral(messages);
    const parsed = JSON.parse(response);

    // Calculate percentages
    const totalResponses = textResponses.length;
    const themes = parsed.themes.map(
      (t: any) => ({
        ...t,
        percentage: Math.round((t.mentions / totalResponses) * 100),
      })
    );

    // Normalize sentiment to percentages
    const sentimentTotal =
      parsed.sentiment.positive +
      parsed.sentiment.neutral +
      parsed.sentiment.negative;
    const sentiment = sentimentTotal > 0 ? {
      positive: Math.round(
        (parsed.sentiment.positive / sentimentTotal) * 100
      ),
      neutral: Math.round(
        (parsed.sentiment.neutral / sentimentTotal) * 100
      ),
      negative: Math.round(
        (parsed.sentiment.negative / sentimentTotal) * 100
      ),
    } : { positive: 0, neutral: 0, negative: 0 };

    return {
      themes,
      sentiment,
      summary: parsed.summary,
      topPainPoints: parsed.topPainPoints,
      recommendations: parsed.recommendations,
    };
  } catch (error) {
    console.error("Failed to analyze responses:", error);
    throw new Error("Failed to analyze survey responses with AI");
  }
}
