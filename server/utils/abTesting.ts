/**
 * A/B Testing Framework for AI Prompts and Models
 * Enables experimentation with different prompts and model configurations
 */

export interface ExperimentConfig {
  name: string;
  description: string;
  active: boolean;
  trafficAllocation: number; // 0-100 percentage of traffic to send to this variant
  variant: {
    id: string; // unique identifier
    prompt?: string; // override prompt for this variant
    quality?: "fast" | "balanced" | "best"; // override model quality
    metadata?: Record<string, any>;
  };
}

export interface ABTestResult {
  variantId: string;
  taskType: string;
  success: boolean;
  latencyMs: number;
  cost: number;
  quality?: number; // 0-100 quality score if applicable
  timestamp: Date;
}

/**
 * AB Testing Manager
 */
export class ABTestingManager {
  private experiments: Map<string, ExperimentConfig[]> = new Map();
  private results: ABTestResult[] = [];
  private readonly maxResults = 5000;

  /**
   * Register an experiment for a task type
   */
  registerExperiment(taskType: string, config: ExperimentConfig): void {
    if (!this.experiments.has(taskType)) {
      this.experiments.set(taskType, []);
    }
    this.experiments.get(taskType)!.push(config);
  }

  /**
   * Select a variant based on traffic allocation
   * Returns the variant config or null if no active experiments
   */
  selectVariant(taskType: string): ExperimentConfig["variant"] | null {
    const activeExperiments = (this.experiments.get(taskType) || []).filter(e => e.active);
    
    if (activeExperiments.length === 0) {
      return null; // No experiments, use control
    }

    // Calculate cumulative traffic allocation
    const rand = Math.random() * 100;
    let cumulative = 0;

    for (const experiment of activeExperiments) {
      cumulative += experiment.trafficAllocation;
      if (rand <= cumulative) {
        return experiment.variant;
      }
    }

    // Fallback to first experiment if rounding errors
    return activeExperiments[0].variant;
  }

  /**
   * Record experiment result
   */
  recordResult(result: ABTestResult): void {
    this.results.push(result);
    
    // Maintain size limit
    if (this.results.length > this.maxResults) {
      this.results = this.results.slice(-this.maxResults);
    }
  }

  /**
   * Analyze experiment results
   */
  analyzeResults(taskType: string): {
    byVariant: Record<string, {
      count: number;
      successRate: number;
      avgLatency: number;
      avgCost: number;
      avgQuality?: number;
    }>;
    winner?: string;
    significance: number; // 0-1, confidence in results
  } {
    const taskResults = this.results.filter(r => r.taskType === taskType);
    
    if (taskResults.length === 0) {
      return { byVariant: {}, significance: 0 };
    }

    const byVariant: Record<string, {
      count: number;
      successRate: number;
      avgLatency: number;
      avgCost: number;
      avgQuality?: number;
    }> = {};

    taskResults.forEach(result => {
      if (!byVariant[result.variantId]) {
        byVariant[result.variantId] = {
          count: 0,
          successRate: 0,
          avgLatency: 0,
          avgCost: 0,
          avgQuality: undefined,
        };
      }

      byVariant[result.variantId].count++;
      byVariant[result.variantId].avgLatency += result.latencyMs;
      byVariant[result.variantId].avgCost += result.cost;
      if (result.success) {
        byVariant[result.variantId].successRate++;
      }
      if (result.quality !== undefined) {
        if (!byVariant[result.variantId].avgQuality) {
          byVariant[result.variantId].avgQuality = 0;
        }
        byVariant[result.variantId].avgQuality! += result.quality;
      }
    });

    // Calculate averages and finalize stats
    let winner: string | undefined;
    let bestScore = -Infinity;

    Object.keys(byVariant).forEach(variantId => {
      const stats = byVariant[variantId];
      stats.successRate = (stats.successRate / stats.count) * 100;
      stats.avgLatency = stats.avgLatency / stats.count;
      stats.avgCost = stats.avgCost / stats.count;
      if (stats.avgQuality !== undefined) {
        stats.avgQuality = stats.avgQuality / stats.count;
      }

      // Calculate compound score (success + quality - latency penalty)
      const score = stats.successRate + (stats.avgQuality || 0) - (stats.avgLatency / 100);
      if (score > bestScore) {
        bestScore = score;
        winner = variantId;
      }
    });

    // Simple significance calculation based on sample size
    const totalSamples = taskResults.length;
    const significance = Math.min(1, totalSamples / 100); // Need 100+ samples for high confidence

    return { byVariant, winner, significance };
  }

  /**
   * Deactivate experiment after winner is clear
   */
  deactivateExperiment(taskType: string, experimentName: string): void {
    const experiments = this.experiments.get(taskType) || [];
    const experiment = experiments.find(e => e.name === experimentName);
    if (experiment) {
      experiment.active = false;
    }
  }

  /**
   * Get active experiments
   */
  getActiveExperiments(): Record<string, ExperimentConfig[]> {
    const active: Record<string, ExperimentConfig[]> = {};
    this.experiments.forEach((configs, taskType) => {
      const activeConfigs = configs.filter(c => c.active);
      if (activeConfigs.length > 0) {
        active[taskType] = activeConfigs;
      }
    });
    return active;
  }
}

// Global AB testing instance
export const abTestingManager = new ABTestingManager();
