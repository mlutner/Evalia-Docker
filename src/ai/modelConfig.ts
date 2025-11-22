export type EvaliaUseCase = "surveyGeneration" | "quickRewrite" | "deepInsights";

export const MODEL_POOLS: Record<EvaliaUseCase, string[]> = {
  surveyGeneration: [
    "openrouter/auto",
    "mistralai/mistral-7b-instruct:free",
    "meta-llama/llama-2-7b-chat:free",
  ],

  quickRewrite: [
    "openrouter/auto",
    "mistralai/mistral-7b-instruct:free",
    "meta-llama/llama-2-7b-chat:free",
  ],

  deepInsights: [
    "openrouter/auto",
    "mistralai/mistral-large",
  ],
};
