/**
 * Enhanced AI client with intelligent model routing, robust error handling, monitoring, and A/B testing
 */

import { aiLogger, estimateTokens, calculateCost } from "./aiMonitoring";
import { abTestingManager } from "./abTesting";

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_BASE_URL = "https://api.mistral.ai/v1";

// Model routing configuration
const QUALITY_LEVELS = {
  fast: "mistral-small-latest",      // Fast, cost-effective for simple tasks
  balanced: "mistral-medium-latest", // Balanced quality and speed for moderate tasks
  best: "mistral-large-latest",      // Best quality for complex, high-stakes tasks
};

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface CallMistralOptions {
  quality?: "fast" | "balanced" | "best";
  responseFormat?: { type: "json_object" };
  maxRetries?: number;
  timeout?: number;
  taskType?: string; // For monitoring and A/B testing
  enableABTesting?: boolean;
}

/**
 * Sleep helper for exponential backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Enhanced Mistral API call with intelligent model routing, retry logic, and error handling
 * 
 * @param messages - Chat messages to send
 * @param options - Configuration options including quality level, retry strategy, timeout
 * @returns API response content
 * 
 * Features:
 * - Automatic model selection based on quality parameter
 * - Exponential backoff retry with configurable attempts
 * - Malformed JSON response recovery
 * - Comprehensive error logging
 */
export async function callMistral(
  messages: ChatMessage[],
  options: CallMistralOptions = {}
): Promise<string> {
  const {
    quality = "balanced",
    responseFormat,
    maxRetries = 3,
    timeout = 30000,
    taskType = "unknown",
    enableABTesting = false
  } = options;

  if (!MISTRAL_API_KEY) {
    throw new Error("Mistral API key not configured");
  }

  // A/B Testing: Select variant if active experiment exists
  let selectedVariant = null;
  let selectedQuality = quality;
  if (enableABTesting) {
    selectedVariant = abTestingManager.selectVariant(taskType);
    if (selectedVariant) {
      selectedQuality = selectedVariant.quality || quality;
    }
  }

  const model = QUALITY_LEVELS[selectedQuality];
  if (!model) {
    throw new Error(`Invalid quality level: ${selectedQuality}. Must be 'fast', 'balanced', or 'best'`);
  }

  let lastError: Error | null = null;
  const startTime = Date.now();
  const promptLength = messages.reduce((sum, m) => sum + m.content.length, 0);
  let responseLength = 0;
  let retryCount = 0;
  let success = false;

  // Retry loop with exponential backoff
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) retryCount++;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle rate limiting with retry
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get("retry-after") || "1", 10);
        const backoffMs = Math.min(retryAfter * 1000, 10000);
        
        if (attempt < maxRetries) {
          await sleep(backoffMs);
          continue;
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mistral API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("No content in API response");
      }

      // Log success metrics
      responseLength = content.length;
      success = true;
      const latencyMs = Date.now() - startTime;
      const inputTokens = estimateTokens(messages.reduce((sum, m) => sum + m.content, ""));
      const outputTokens = estimateTokens(content);
      const cost = calculateCost(model, inputTokens, outputTokens);

      aiLogger.logCall({
        taskType,
        model,
        quality: selectedQuality,
        promptLength,
        responseLength,
        latencyMs,
        success: true,
        tokensEstimated: inputTokens + outputTokens,
        costEstimated: cost,
        timestamp: new Date(),
        retries: retryCount,
        variant: selectedVariant?.id,
      });

      // Record A/B test result if applicable
      if (enableABTesting && selectedVariant) {
        abTestingManager.recordResult({
          variantId: selectedVariant.id,
          taskType,
          success: true,
          latencyMs,
          cost,
          timestamp: new Date(),
        });
      }

      return content;

    } catch (error) {
      lastError = error as Error;

      // Don't retry on validation errors
      if (error instanceof Error && error.message.includes("Invalid")) {
        throw error;
      }

      // Calculate exponential backoff
      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        await sleep(backoffMs);
      }
    }
  }

  // All retries exhausted - log failure
  const latencyMs = Date.now() - startTime;
  const inputTokens = estimateTokens(messages.reduce((sum, m) => sum + m.content, ""));
  const errorCost = calculateCost(model, inputTokens, 0); // No output tokens on failure

  aiLogger.logCall({
    taskType,
    model,
    quality: selectedQuality,
    promptLength,
    responseLength,
    latencyMs,
    success: false,
    errorMessage: lastError?.message,
    tokensEstimated: inputTokens,
    costEstimated: errorCost,
    timestamp: new Date(),
    retries: retryCount,
    variant: selectedVariant?.id,
  });

  // Record failed A/B test result
  if (enableABTesting && selectedVariant) {
    abTestingManager.recordResult({
      variantId: selectedVariant.id,
      taskType,
      success: false,
      latencyMs,
      cost: errorCost,
      timestamp: new Date(),
    });
  }

  throw new Error(
    `Failed to call Mistral API after ${maxRetries + 1} attempts. ` +
    `Last error: ${lastError?.message}`
  );
}

/**
 * Safe JSON parsing with error recovery
 */
export function safeParseJSON<T>(content: string, fallback?: T): T | null {
  try {
    return JSON.parse(content) as T;
  } catch {
    // Try to recover by finding JSON object in content
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as T;
      } catch {
        // Recovery failed
      }
    }
    
    return fallback ?? null;
  }
}

// Export quality levels for use in other modules
export { QUALITY_LEVELS };
