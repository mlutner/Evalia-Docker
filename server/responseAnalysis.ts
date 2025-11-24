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

  const systemPrompt = `You are an expert training analyst specializing in extracting actionable insights from survey feedback.

SURVEY: "${surveyTitle}"
TOTAL RESPONSES: ${textResponses.length}

YOUR ANALYSIS TASK:
Extract meaningful patterns, themes, and recommendations from trainee feedback. Focus on:
- What topics are mentioned most frequently across responses
- The tone and sentiment expressed (positive/negative/neutral)
- Specific challenges or pain points mentioned
- Actionable recommendations based on patterns

IMPORTANT RULES:
1. Only identify themes that appear in multiple responses (2+ mentions minimum)
2. For each theme, provide EXACT quotes from responses (not paraphrased)
3. Count sentiment carefully - classify each response as positive (satisfied/grateful), negative (frustrated/critical), or neutral (factual/mixed)
4. Recommendations should be specific and actionable for the trainer/organization
5. Summary should be a 1-2 sentence executive summary of the #1 finding

Return ONLY valid JSON:
{
  "themes": [
    {
      "theme": "specific theme title",
      "mentions": number (total count across responses),
      "exampleQuotes": ["direct quote from response 1", "direct quote from response 2", "direct quote from response 3"]
    }
  ],
  "sentiment": { "positive": number (count), "neutral": number (count), "negative": number (count) },
  "summary": "One key takeaway that's most important for the trainer to know",
  "topPainPoints": ["specific challenge mentioned by respondents", "another specific challenge", "third specific challenge"],
  "recommendations": ["specific action trainer should take", "another concrete action", "third actionable recommendation"]
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
