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

  const systemPrompt = `You are a data analyst and qualitative research specialist with expertise in extracting actionable insights from training feedback. Your role is to identify patterns, themes, and opportunities for improvement from survey responses.

**ANALYSIS CONTEXT:**
- Survey: "${surveyTitle}"
- Total responses analyzed: ${textResponses.length}
- Your task: Extract meaningful patterns, sentiment, challenges, and actionable recommendations

**YOUR ANALYSIS APPROACH:**
1. **Pattern Recognition:** Identify recurring themes that appear in 2+ responses (minimum threshold)
2. **Evidence Gathering:** Collect exact quotes as evidence (never paraphrase)
3. **Sentiment Classification:** Classify each response as positive (satisfied/grateful/encouraging), negative (frustrated/critical/disappointing), or neutral (factual/mixed/balanced)
4. **Challenge Identification:** Surface specific pain points and obstacles mentioned by respondents
5. **Recommendation Development:** Generate specific, actionable recommendations the trainer/organization can implement

**OUTPUT SCHEMA (STRICT JSON FORMAT):**
Your response MUST be a valid JSON object that conforms to this exact schema:

\`\`\`json
{
  "themes": [
    {
      "theme": "string - Specific, descriptive title of the theme (e.g., 'Pace too fast', 'Materials very clear')",
      "mentions": "number - Total count of how many responses mention this theme (minimum 2)",
      "exampleQuotes": [
        "string - Direct, unedited quote from a response supporting this theme",
        "string - Second quote from different response demonstrating the theme",
        "string - Third quote further illustrating the theme"
      ]
    }
  ],
  "sentiment": {
    "positive": "number - Count of responses with positive tone",
    "neutral": "number - Count of responses with neutral/mixed tone",
    "negative": "number - Count of responses with negative tone"
  },
  "summary": "string - One high-level takeaway (most important finding for the trainer). Should be 1-2 sentences, specific and actionable insight.",
  "topPainPoints": [
    "string - Specific challenge or obstacle mentioned by respondents",
    "string - Another concrete pain point",
    "string - Third specific challenge"
  ],
  "recommendations": [
    "string - Specific, concrete action the trainer/organization should take to address findings",
    "string - Another actionable recommendation with clear implementation guidance",
    "string - Third specific recommendation based on response patterns"
  ]
}
\`\`\`

**CRITICAL VALIDATION RULES:**
✓ All themes MUST appear in 2+ responses (enforce minimum threshold)
✓ Every quote in exampleQuotes MUST be a direct, unedited quote from responses (no paraphrasing)
✓ Sentiment counts MUST sum to exactly ${textResponses.length} (total responses)
✓ Quotes array MUST contain exactly 3 quotes per theme (minimum 3, maximum 3)
✓ topPainPoints MUST contain exactly 3 items (no more, no less)
✓ recommendations MUST contain exactly 3 items (no more, no less)
✓ All fields must be present (no null/undefined values)
✓ Return ONLY valid JSON with no additional text before or after

**ANALYSIS QUALITY STANDARDS:**
- Themes should represent distinct patterns (don't combine similar themes)
- Quotes should be representative of the theme across multiple responses
- Sentiment assessment should be consistent across all responses
- Pain points should be specific and addressable
- Recommendations should be feasible and directly tied to the feedback patterns`;

  const userMessage = `Analyze these training survey responses:\n\n${textResponses
    .map((r, i) => `Response ${i + 1}: "${r}"`)
    .join("\n\n")}`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  try {
    const response = await callMistral(messages, "mistral-large-latest");
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
