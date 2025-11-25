/**
 * AI Performance Monitoring and Logging System
 * Tracks all AI requests with metrics for performance optimization
 */

export interface AICallMetrics {
  taskType: string; // e.g., "questionQuality", "surveyGeneration", "responseAnalysis"
  model: string;
  quality: "fast" | "balanced" | "best";
  promptLength: number;
  responseLength: number;
  latencyMs: number;
  success: boolean;
  errorMessage?: string;
  tokensEstimated: number;
  costEstimated: number; // Rough cost estimate in cents
  timestamp: Date;
  retries: number;
  variant?: string; // For A/B testing
}

// Mistral API pricing (approximate, per 1M tokens)
const PRICING = {
  "mistral-small-latest": { input: 0.14, output: 0.42 },      // cents per 1M tokens
  "mistral-medium-latest": { input: 0.70, output: 2.10 },
  "mistral-large-latest": { input: 2.00, output: 6.00 },
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
  const pricing = PRICING[model as keyof typeof PRICING] || PRICING["mistral-medium-latest"];
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return (inputCost + outputCost) * 100; // Convert to cents
}

/**
 * AI Call Logger - Stores metrics in memory with periodic export
 */
export class AICallLogger {
  private metrics: AICallMetrics[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 calls
  private exportCallback?: (metrics: AICallMetrics[]) => Promise<void>;

  constructor(exportCallback?: (metrics: AICallMetrics[]) => Promise<void>) {
    this.exportCallback = exportCallback;
    
    // Auto-export metrics every 5 minutes or when reaching 100 calls
    setInterval(() => this.exportMetrics(), 5 * 60 * 1000);
  }

  /**
   * Log a completed AI call with metrics
   */
  logCall(metrics: AICallMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Auto-export when reaching threshold
    if (this.metrics.length >= 100) {
      this.exportMetrics();
    }

    // Log to console in development
    if (process.env.NODE_ENV !== "production") {
      console.log(`[AI] ${metrics.taskType} | Model: ${metrics.model} | Latency: ${metrics.latencyMs}ms | Cost: $${(metrics.costEstimated / 100).toFixed(4)}`);
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
    byModel: Record<string, { calls: number; avgLatency: number; cost: number }>;
    byTask: Record<string, { calls: number; avgLatency: number; cost: number }>;
  } {
    if (this.metrics.length === 0) {
      return {
        totalCalls: 0,
        successRate: 0,
        avgLatency: 0,
        totalCost: 0,
        byModel: {},
        byTask: {},
      };
    }

    const successCount = this.metrics.filter(m => m.success).length;
    const avgLatency = this.metrics.reduce((sum, m) => sum + m.latencyMs, 0) / this.metrics.length;
    const totalCost = this.metrics.reduce((sum, m) => sum + m.costEstimated, 0);

    const byModel: Record<string, { calls: number; avgLatency: number; cost: number }> = {};
    const byTask: Record<string, { calls: number; avgLatency: number; cost: number }> = {};

    this.metrics.forEach(m => {
      // By model
      if (!byModel[m.model]) {
        byModel[m.model] = { calls: 0, avgLatency: 0, cost: 0 };
      }
      byModel[m.model].calls++;
      byModel[m.model].avgLatency += m.latencyMs;
      byModel[m.model].cost += m.costEstimated;

      // By task
      if (!byTask[m.taskType]) {
        byTask[m.taskType] = { calls: 0, avgLatency: 0, cost: 0 };
      }
      byTask[m.taskType].calls++;
      byTask[m.taskType].avgLatency += m.latencyMs;
      byTask[m.taskType].cost += m.costEstimated;
    });

    // Calculate averages
    Object.keys(byModel).forEach(model => {
      byModel[model].avgLatency = byModel[model].avgLatency / byModel[model].calls;
    });
    Object.keys(byTask).forEach(task => {
      byTask[task].avgLatency = byTask[task].avgLatency / byTask[task].calls;
    });

    return {
      totalCalls: this.metrics.length,
      successRate: (successCount / this.metrics.length) * 100,
      avgLatency,
      totalCost,
      byModel,
      byTask,
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
      console.error("Failed to export AI metrics:", error);
    }
  }

  /**
   * Get recent calls for debugging/monitoring
   */
  getRecentCalls(limit: number = 10): AICallMetrics[] {
    return this.metrics.slice(-limit);
  }
}

// Global logger instance
export const aiLogger = new AICallLogger();
