export type EvaliaUseCase = "surveyGeneration" | "quickRewrite" | "deepInsights";

export const MODEL_POOLS: Record<EvaliaUseCase, string[]> = {
  surveyGeneration: [
    "google/gemini-2.0-flash-001",
    "openai/gpt-4o-mini",
    "mistralai/mistral-7b-instruct:free",
  ],

  quickRewrite: [
    "google/gemini-2.0-flash-001",
    "openai/gpt-4o-mini",
    "mistralai/mistral-7b-instruct:free",
  ],

  deepInsights: [
    "openai/gpt-4o",
    "google/gemini-2.0-flash-001",
    "mistralai/mistral-large",
  ],
};
