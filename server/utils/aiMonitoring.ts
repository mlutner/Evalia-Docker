/**
 * AI Performance Monitoring and Logging System
 * Tracks all AI requests with metrics for performance optimization
 * 
 * @version 2.0.0
 */

export interface AICallMetrics {
  taskType: string; // e.g., "surveyGeneration", "questionQuality", "aiChat"
  model: string;
  quality: "fast" | "balanced" | "best" | string;
  promptLength: number;
  responseLength: number;
  latencyMs: number;
  success: boolean;
  errorMessage?: string;
  tokensEstimated: number;
  costEstimated: number; // Cost in cents
  timestamp: Date;
  retries: number;
  variant?: string; // For A/B testing
  promptVersion?: string; // For prompt versioning
}

// Mistral API pricing (per 1M tokens, in USD cents)
// Updated: December 2024
const PRICING: Record<string, { input: number; output: number }> = {
  // Premier Models
  "mistral-large-latest": { input: 200, output: 600 },
  "mistral-large-2411": { input: 200, output: 600 },
  
  // Medium Models
  "mistral-medium-latest": { input: 70, output: 210 },
  
  // Small/Fast Models
  "mistral-small-latest": { input: 14, output: 42 },
  "mistral-small-2409": { input: 14, output: 42 },
  
  // Specialized Models
  "codestral-latest": { input: 30, output: 90 },
  "codestral-2405": { input: 30, output: 90 },
  
  // Ministral Models (Lightweight)
  "ministral-8b-latest": { input: 10, output: 10 },
  "ministral-3b-latest": { input: 4, output: 4 },
  
  // Pixtral (Multimodal)
  "pixtral-large-latest": { input: 200, output: 600 },
  "pixtral-12b-2409": { input: 15, output: 15 },
  
  // Embedding
  "mistral-embed": { input: 10, output: 0 },
  
  // Moderation
  "mistral-moderation-latest": { input: 10, output: 10 },
  
  // Open Source Models
  "open-mistral-nemo": { input: 15, output: 15 },
  "open-mixtral-8x22b": { input: 90, output: 90 },
  "open-mixtral-8x7b": { input: 45, output: 45 },
  "open-mistral-7b": { input: 20, output: 20 },
  
  // OCR Model (estimate)
  "mistral-ocr-latest": { input: 100, output: 100 },
};

/**
 * Estimate token count (rough approximation: ~4 chars per token)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Calculate estimated cost in cents
 */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = PRICING[model] || PRICING["mistral-medium-latest"];
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

/**
 * AI Call Logger - Stores metrics in memory with periodic export
 */
export class AICallLogger {
  private metrics: AICallMetrics[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 calls
  private exportCallback?: (metrics: AICallMetrics[]) => Promise<void>;
  private exportIntervalId?: NodeJS.Timeout;

  constructor(exportCallback?: (metrics: AICallMetrics[]) => Promise<void>) {
    this.exportCallback = exportCallback;
    
    // Auto-export metrics every 5 minutes
    this.exportIntervalId = setInterval(() => this.exportMetrics(), 5 * 60 * 1000);
  }

  /**
   * Clean up resources (for testing/shutdown)
   */
  destroy(): void {
    if (this.exportIntervalId) {
      clearInterval(this.exportIntervalId);
    }
  }

  /**
   * Log a completed AI call with metrics
   */
  logCall(metrics: AICallMetrics): void {
    this.metrics.push(metrics);
    
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[AI Monitor] ${metrics.taskType} | ${metrics.model} | ${metrics.latencyMs}ms | ${metrics.success ? "✓" : "✗"} | ~$${(metrics.costEstimated / 100).toFixed(4)}`);
    }
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Auto-export when reaching threshold
    if (this.metrics.length >= 100) {
      this.exportMetrics();
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    totalCalls: number;
    successRate: number;
    avgLatency: number;
    totalCost: number;
    byModel: Record<string, { calls: number; avgLatency: number; cost: number; successRate: number }>;
    byTask: Record<string, { calls: number; avgLatency: number; cost: number; successRate: number }>;
    last24Hours: {
      calls: number;
      cost: number;
      avgLatency: number;
    };
  } {
    if (this.metrics.length === 0) {
      return {
        totalCalls: 0,
        successRate: 0,
        avgLatency: 0,
        totalCost: 0,
        byModel: {},
        byTask: {},
        last24Hours: { calls: 0, cost: 0, avgLatency: 0 },
      };
    }

    const successCount = this.metrics.filter(m => m.success).length;
    const avgLatency = this.metrics.reduce((sum, m) => sum + m.latencyMs, 0) / this.metrics.length;
    const totalCost = this.metrics.reduce((sum, m) => sum + m.costEstimated, 0);

    const byModel: Record<string, { calls: number; avgLatency: number; cost: number; successRate: number }> = {};
    const byTask: Record<string, { calls: number; avgLatency: number; cost: number; successRate: number }> = {};

    this.metrics.forEach(m => {
      // By model
      if (!byModel[m.model]) {
        byModel[m.model] = { calls: 0, avgLatency: 0, cost: 0, successRate: 0 };
      }
      byModel[m.model].calls++;
      byModel[m.model].avgLatency += m.latencyMs;
      byModel[m.model].cost += m.costEstimated;
      if (m.success) byModel[m.model].successRate++;

      // By task
      if (!byTask[m.taskType]) {
        byTask[m.taskType] = { calls: 0, avgLatency: 0, cost: 0, successRate: 0 };
      }
      byTask[m.taskType].calls++;
      byTask[m.taskType].avgLatency += m.latencyMs;
      byTask[m.taskType].cost += m.costEstimated;
      if (m.success) byTask[m.taskType].successRate++;
    });

    // Calculate averages and percentages
    Object.keys(byModel).forEach(model => {
      byModel[model].avgLatency = byModel[model].avgLatency / byModel[model].calls;
      byModel[model].successRate = (byModel[model].successRate / byModel[model].calls) * 100;
    });
    Object.keys(byTask).forEach(task => {
      byTask[task].avgLatency = byTask[task].avgLatency / byTask[task].calls;
      byTask[task].successRate = (byTask[task].successRate / byTask[task].calls) * 100;
    });

    // Last 24 hours stats
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp >= oneDayAgo);
    const last24Hours = {
      calls: recentMetrics.length,
      cost: recentMetrics.reduce((sum, m) => sum + m.costEstimated, 0),
      avgLatency: recentMetrics.length > 0 
        ? recentMetrics.reduce((sum, m) => sum + m.latencyMs, 0) / recentMetrics.length 
        : 0,
    };

    return {
      totalCalls: this.metrics.length,
      successRate: (successCount / this.metrics.length) * 100,
      avgLatency,
      totalCost,
      byModel,
      byTask,
      last24Hours,
    };
  }

  /**
   * Get stats by task type for a specific time range
   */
  getTaskStats(taskType: string, hours: number = 24): {
    calls: number;
    successRate: number;
    avgLatency: number;
    cost: number;
    errorMessages: string[];
  } {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const filtered = this.metrics.filter(m => 
      m.taskType === taskType && m.timestamp >= cutoff
    );

    if (filtered.length === 0) {
      return { calls: 0, successRate: 0, avgLatency: 0, cost: 0, errorMessages: [] };
    }

    const successCount = filtered.filter(m => m.success).length;
    const errorMessages = filtered
      .filter(m => !m.success && m.errorMessage)
      .map(m => m.errorMessage!)
      .slice(-5); // Last 5 errors

    return {
      calls: filtered.length,
      successRate: (successCount / filtered.length) * 100,
      avgLatency: filtered.reduce((sum, m) => sum + m.latencyMs, 0) / filtered.length,
      cost: filtered.reduce((sum, m) => sum + m.costEstimated, 0),
      errorMessages,
    };
  }

  /**
   * Export metrics (e.g., to database or analytics service)
   */
  async exportMetrics(): Promise<void> {
    if (this.metrics.length === 0 || !this.exportCallback) {
      return;
    }

    try {
      const metricsToExport = [...this.metrics];
      this.metrics = []; // Clear after export
      await this.exportCallback(metricsToExport);
    } catch (error) {
      // Re-add metrics if export failed
      console.warn("[AI Monitor] Export failed, metrics retained:", error);
    }
  }

  /**
   * Get recent calls for debugging/monitoring
   */
  getRecentCalls(limit: number = 10): AICallMetrics[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Get calls for a specific task type
   */
  getCallsByTask(taskType: string, limit: number = 20): AICallMetrics[] {
    return this.metrics
      .filter(m => m.taskType === taskType)
      .slice(-limit);
  }

  /**
   * Get failed calls for debugging
   */
  getFailedCalls(limit: number = 10): AICallMetrics[] {
    return this.metrics
      .filter(m => !m.success)
      .slice(-limit);
  }

  /**
   * Clear all metrics (for testing)
   */
  clear(): void {
    this.metrics = [];
  }
}

// Global logger instance
export const aiLogger = new AICallLogger();

// Export pricing for reference
export { PRICING };
