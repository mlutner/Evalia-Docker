export type EvaliaUseCase = "surveyGeneration" | "quickRewrite" | "deepInsights";

export const MODEL_POOLS: Record<EvaliaUseCase, string[]> = {
  surveyGeneration: [
    "moonshotai/kimi-k2:free",
    "deepseek/deepseek-chat-v3-0324:free",
    "qwen/qwen3-30b-a3b:free",
    "z-ai/glm-4.5-air:free",
  ],

  quickRewrite: [
    "qwen/qwen3-8b:free",
    "qwen/qwen3-14b:free",
    "deepseek/deepseek-r1-0528-qwen3-8b:free",
    "z-ai/glm-4.5-air:free",
  ],

  deepInsights: [
    "deepseek/deepseek-r1:free",
    "moonshotai/kimi-k2:free",
    "qwen/qwen3-30b-a3b:free",
  ],
};
