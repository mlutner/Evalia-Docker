export type EvaliaUseCase = "surveyGeneration" | "quickRewrite" | "deepInsights";

export const MODEL_POOLS: Record<EvaliaUseCase, string[]> = {
  surveyGeneration: [
    "x-ai/grok-4.1-fast",
  ],

  quickRewrite: [
    "x-ai/grok-4.1-fast",
  ],

  deepInsights: [
    "x-ai/grok-4.1-fast",
  ],
};
