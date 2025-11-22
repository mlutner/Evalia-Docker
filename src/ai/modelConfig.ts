// Simple standalone OpenRouter configuration
// Using a single reliable model for all AI tasks

export const AI_MODEL = "google/gemini-2.0-flash-lite-001";
export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export const OPENROUTER_HEADERS = {
  "HTTP-Referer": "https://evalia.app",
  "X-Title": "Evalia",
};
