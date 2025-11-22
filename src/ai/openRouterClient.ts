import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat";
import { AI_MODEL, OPENROUTER_BASE_URL, OPENROUTER_HEADERS } from "./modelConfig";

export const openRouterClient = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: OPENROUTER_BASE_URL,
});

/**
 * Simple call to OpenRouter with a single model
 */
export async function callOpenRouterModel(
  messages: ChatCompletionMessageParam[],
  options?: {
    temperature?: number;
    max_tokens?: number;
  }
) {
  try {
    const completion = await openRouterClient.chat.completions.create(
      {
        model: AI_MODEL,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 2048,
      },
      { headers: OPENROUTER_HEADERS }
    );

    const text = completion.choices[0]?.message?.content ?? "";
    if (!text) {
      throw new Error("No response from AI model");
    }

    return {
      text,
      model: AI_MODEL,
    };
  } catch (error: any) {
    console.error(`OpenRouter API error:`, error.message);
    throw error;
  }
}
