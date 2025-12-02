/**
 * AI Client - Enhanced Mistral API client with intelligent model routing,
 * robust error handling, monitoring, A/B testing, and full parameter control.
 * 
 * @version 2.0.0
 */

import { aiLogger, estimateTokens, calculateCost } from "./aiMonitoring";
import { abTestingManager } from "./abTesting";

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_BASE_URL = "https://api.mistral.ai/v1";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MISTRAL MODEL DEFINITIONS - Complete catalog as of Dec 2024
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MISTRAL_MODELS = {
  // Premier Models (Best quality)
  "mistral-large-latest": {
    name: "Mistral Large",
    description: "Flagship model for complex reasoning, multilingual tasks, code generation",
    contextWindow: 128000,
    maxOutput: 8192,
    pricing: { input: 2.00, output: 6.00 }, // per 1M tokens
  },
  "mistral-large-2411": {
    name: "Mistral Large (November 2024)",
    description: "Latest large model with improved reasoning",
    contextWindow: 128000,
    maxOutput: 8192,
    pricing: { input: 2.00, output: 6.00 },
  },
  
  // Medium Models (Balanced)
  "mistral-medium-latest": {
    name: "Mistral Medium",
    description: "Balanced quality and cost for general tasks",
    contextWindow: 32000,
    maxOutput: 8192,
    pricing: { input: 0.70, output: 2.10 },
  },
  
  // Small/Fast Models (Cost-effective)
  "mistral-small-latest": {
    name: "Mistral Small",
    description: "Fast, cost-effective for simple tasks",
    contextWindow: 32000,
    maxOutput: 8192,
    pricing: { input: 0.14, output: 0.42 },
  },
  "mistral-small-2409": {
    name: "Mistral Small (September 2024)",
    description: "Optimized small model",
    contextWindow: 32000,
    maxOutput: 8192,
    pricing: { input: 0.14, output: 0.42 },
  },
  
  // Specialized Models
  "codestral-latest": {
    name: "Codestral",
    description: "Specialized for code generation and understanding",
    contextWindow: 32000,
    maxOutput: 8192,
    pricing: { input: 0.30, output: 0.90 },
  },
  "codestral-2405": {
    name: "Codestral (May 2024)",
    description: "Code-specialized model",
    contextWindow: 32000,
    maxOutput: 8192,
    pricing: { input: 0.30, output: 0.90 },
  },
  
  // Ministral Models (Lightweight)
  "ministral-8b-latest": {
    name: "Ministral 8B",
    description: "Lightweight 8B parameter model for edge/mobile",
    contextWindow: 128000,
    maxOutput: 8192,
    pricing: { input: 0.10, output: 0.10 },
  },
  "ministral-3b-latest": {
    name: "Ministral 3B",
    description: "Ultra-lightweight 3B parameter model",
    contextWindow: 128000,
    maxOutput: 8192,
    pricing: { input: 0.04, output: 0.04 },
  },
  
  // Pixtral (Multimodal)
  "pixtral-large-latest": {
    name: "Pixtral Large",
    description: "Multimodal model for image + text understanding",
    contextWindow: 128000,
    maxOutput: 8192,
    pricing: { input: 2.00, output: 6.00 },
  },
  "pixtral-12b-2409": {
    name: "Pixtral 12B",
    description: "Smaller multimodal model",
    contextWindow: 128000,
    maxOutput: 8192,
    pricing: { input: 0.15, output: 0.15 },
  },
  
  // Embedding Models
  "mistral-embed": {
    name: "Mistral Embed",
    description: "Text embeddings for semantic search",
    contextWindow: 8192,
    maxOutput: 0,
    pricing: { input: 0.10, output: 0 },
  },
  
  // Moderation
  "mistral-moderation-latest": {
    name: "Mistral Moderation",
    description: "Content moderation and safety classification",
    contextWindow: 8192,
    maxOutput: 1024,
    pricing: { input: 0.10, output: 0.10 },
  },
  
  // Open Source Models (via API)
  "open-mistral-nemo": {
    name: "Mistral Nemo",
    description: "12B open-source model, Apache 2.0 license",
    contextWindow: 128000,
    maxOutput: 8192,
    pricing: { input: 0.15, output: 0.15 },
  },
  "open-mixtral-8x22b": {
    name: "Mixtral 8x22B",
    description: "Large MoE model, 176B parameters",
    contextWindow: 65536,
    maxOutput: 8192,
    pricing: { input: 0.90, output: 0.90 },
  },
  "open-mixtral-8x7b": {
    name: "Mixtral 8x7B",
    description: "MoE model, 46.7B parameters",
    contextWindow: 32000,
    maxOutput: 8192,
    pricing: { input: 0.45, output: 0.45 },
  },
  "open-mistral-7b": {
    name: "Mistral 7B",
    description: "Efficient 7B parameter model",
    contextWindow: 32000,
    maxOutput: 8192,
    pricing: { input: 0.20, output: 0.20 },
  },
} as const;

export type MistralModel = keyof typeof MISTRAL_MODELS;

// Quality level to model mapping
export const QUALITY_LEVELS = {
  fast: "mistral-small-latest" as MistralModel,
  balanced: "mistral-medium-latest" as MistralModel,
  best: "mistral-large-latest" as MistralModel,
  code: "codestral-latest" as MistralModel,
  edge: "ministral-8b-latest" as MistralModel,
} as const;

export type QualityLevel = keyof typeof QUALITY_LEVELS;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPE DEFINITIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CallMistralOptions {
  // Model selection
  quality?: QualityLevel;
  model?: MistralModel; // Override quality with specific model
  
  // Generation parameters
  temperature?: number; // 0.0 - 1.0, default 0.7
  maxTokens?: number; // Max output tokens
  topP?: number; // Nucleus sampling, 0.0 - 1.0
  
  // Response format
  responseFormat?: { type: "json_object" | "text" };
  
  // Reliability
  maxRetries?: number;
  timeout?: number;
  
  // Monitoring & Testing
  taskType: string; // REQUIRED for monitoring (e.g., "surveyGeneration")
  promptVersion?: string; // For tracking prompt changes
  enableABTesting?: boolean;
}

export interface AICallResult {
  content: string;
  model: MistralModel;
  tokensUsed: { input: number; output: number };
  latencyMs: number;
  cost: number; // In cents
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getModelFromOptions(options: CallMistralOptions): MistralModel {
  if (options.model && options.model in MISTRAL_MODELS) {
    return options.model;
  }
  const quality = options.quality || "balanced";
  return QUALITY_LEVELS[quality];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN API FUNCTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Call Mistral API with intelligent routing, retry logic, and monitoring
 * 
 * @param messages - Chat messages to send
 * @param options - Configuration options
 * @returns API response content as string
 * 
 * Features:
 * - Automatic model selection based on quality or explicit model
 * - Temperature and token control
 * - Exponential backoff retry with rate limit handling
 * - Comprehensive monitoring and logging
 * - A/B testing support
 */
export async function callMistral(
  messages: ChatMessage[],
  options: CallMistralOptions
): Promise<string> {
  const {
    temperature = 0.7,
    maxTokens,
    topP,
    responseFormat,
    maxRetries = 3,
    timeout = 60000,
    taskType,
    promptVersion,
    enableABTesting = false
  } = options;

  if (!MISTRAL_API_KEY) {
    throw new Error("MISTRAL_API_KEY environment variable not configured");
  }

  // A/B Testing: Select variant if active experiment exists
  let selectedVariant = null;
  let model = getModelFromOptions(options);
  
  if (enableABTesting) {
    selectedVariant = abTestingManager.selectVariant(taskType);
    if (selectedVariant?.quality) {
      model = QUALITY_LEVELS[selectedVariant.quality as QualityLevel] || model;
    }
  }

  // Validate model
  if (!(model in MISTRAL_MODELS)) {
    throw new Error(`Invalid model: ${model}. Available models: ${Object.keys(MISTRAL_MODELS).join(", ")}`);
  }

  const modelConfig = MISTRAL_MODELS[model];
  let lastError: Error | null = null;
  const startTime = Date.now();
  const promptLength = messages.reduce((sum, m) => sum + m.content.length, 0);
  let responseLength = 0;
  let retryCount = 0;

  // Retry loop with exponential backoff
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) retryCount++;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Build request body
      const requestBody: Record<string, any> = {
        model,
        messages,
        temperature,
      };
      
      if (maxTokens) {
        requestBody.max_tokens = Math.min(maxTokens, modelConfig.maxOutput);
      }
      if (topP !== undefined) {
        requestBody.top_p = topP;
      }
      if (responseFormat) {
        requestBody.response_format = responseFormat;
      }

      const response = await fetch(`${MISTRAL_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle rate limiting with retry
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get("retry-after") || "2", 10);
        const backoffMs = Math.min(retryAfter * 1000, 30000);
        console.warn(`[AI Client] Rate limited, waiting ${backoffMs}ms before retry`);
        
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

      // Calculate metrics
      responseLength = content.length;
      const latencyMs = Date.now() - startTime;
      const inputTokens = data.usage?.prompt_tokens || estimateTokens(messages.reduce((sum, m) => sum + m.content, ""));
      const outputTokens = data.usage?.completion_tokens || estimateTokens(content);
      const cost = calculateCost(model, inputTokens, outputTokens);

      // Log success
      aiLogger.logCall({
        taskType,
        model,
        quality: options.quality || "balanced",
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

      // Record A/B test result
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

      // Don't retry on validation/auth errors
      if (error instanceof Error && 
          (error.message.includes("Invalid") || 
           error.message.includes("401") || 
           error.message.includes("403"))) {
        break;
      }

      // Calculate exponential backoff with jitter
      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.warn(`[AI Client] Attempt ${attempt + 1} failed, retrying in ${Math.round(backoffMs)}ms`);
        await sleep(backoffMs);
      }
    }
  }

  // All retries exhausted - log failure
  const latencyMs = Date.now() - startTime;
  const inputTokens = estimateTokens(messages.reduce((sum, m) => sum + m.content, ""));
  const errorCost = calculateCost(model, inputTokens, 0);

  aiLogger.logCall({
    taskType,
    model,
    quality: options.quality || "balanced",
    promptLength,
    responseLength: 0,
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
    `[AI Client] Failed after ${maxRetries + 1} attempts for task "${taskType}". ` +
    `Last error: ${lastError?.message}`
  );
}

/**
 * Call Mistral API and return detailed result with metrics
 */
export async function callMistralWithMetrics(
  messages: ChatMessage[],
  options: CallMistralOptions
): Promise<AICallResult> {
  const startTime = Date.now();
  const model = getModelFromOptions(options);
  
  const content = await callMistral(messages, options);
  
  const latencyMs = Date.now() - startTime;
  const inputTokens = estimateTokens(messages.reduce((sum, m) => sum + m.content, ""));
  const outputTokens = estimateTokens(content);
  const cost = calculateCost(model, inputTokens, outputTokens);
  
  return {
    content,
    model,
    tokensUsed: { input: inputTokens, output: outputTokens },
    latencyMs,
    cost,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// JSON PARSING UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Safe JSON parsing with error recovery
 * Attempts to extract valid JSON from potentially malformed responses
 */
export function safeParseJSON<T>(content: string, fallback?: T): T | null {
  // First, try direct parsing
  try {
    return JSON.parse(content) as T;
  } catch {
    // Try to find and extract JSON object
    const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      try {
        return JSON.parse(jsonObjectMatch[0]) as T;
      } catch {
        // Object extraction failed
      }
    }
    
    // Try to find and extract JSON array
    const jsonArrayMatch = content.match(/\[[\s\S]*\]/);
    if (jsonArrayMatch) {
      try {
        return JSON.parse(jsonArrayMatch[0]) as T;
      } catch {
        // Array extraction failed
      }
    }
    
    // Try removing markdown code fences
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim()) as T;
      } catch {
        // Code block extraction failed
      }
    }
    
    console.warn("[AI Client] JSON parsing failed, returning fallback");
    return fallback ?? null;
  }
}

/**
 * Validate that parsed JSON matches expected schema
 */
export function validateJSONSchema<T>(
  data: unknown,
  requiredKeys: (keyof T)[]
): data is T {
  if (!data || typeof data !== "object") return false;
  return requiredKeys.every(key => key in data);
}

// All exports are already inline above
