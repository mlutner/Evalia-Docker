/**
 * Analytics Band Resolution
 * 
 * [ANAL-QA-030] CANONICAL SOURCE for band thresholds and resolution logic.
 * 
 * This file centralizes ALL band-related logic to prevent drift between:
 * - server/utils/analytics.ts
 * - client components
 * - shared/schema.ts scoring
 * 
 * DO NOT define band thresholds, colors, or lookup logic anywhere else.
 * Import from this file instead.
 * 
 * Used by:
 * - DimensionLeaderboardTable
 * - IndexDistributionChart
 * - BandDistributionChart
 * - server/utils/analytics.ts (computeIndexBandDistribution, etc.)
 */

// ============================================================================
// TYPES
// ============================================================================

export type BandId = 'critical' | 'needs-improvement' | 'developing' | 'effective' | 'highly-effective';
export type BandSeverity = 'critical' | 'warning' | 'neutral' | 'good' | 'excellent';
export type TrendDirection = 'up' | 'down' | 'neutral';

/**
 * Core band definition used internally.
 */
export interface IndexBandDefinition {
  bandId: BandId;
  label: string;
  color: string;
  severity: BandSeverity;
  min: number;
  max: number;
}

/**
 * Band info returned by resolution functions (no thresholds needed by consumers).
 */
export interface IndexBandInfo {
  bandId: BandId;
  label: string;
  color: string;
  severity: BandSeverity;
}

/**
 * Band with count/percentage for distribution charts.
 * Compatible with shared/analytics.ts IndexBand shape.
 */
export interface IndexBandWithStats extends IndexBandInfo {
  count: number;
  percentage: number;
  minScore: number; // For API compatibility
  maxScore: number; // For API compatibility
}

// ============================================================================
// CONSTANTS - SINGLE SOURCE OF TRUTH
// ============================================================================

/**
 * Canonical band definitions with thresholds, labels, colors, and severity.
 * 
 * IMPORTANT: This is the ONLY place band thresholds should be defined.
 * All other code should use the helper functions below.
 */
export const INDEX_BAND_DEFINITIONS: readonly IndexBandDefinition[] = [
  { bandId: 'critical', label: 'Critical', color: '#ef4444', severity: 'critical', min: 0, max: 39 },
  { bandId: 'needs-improvement', label: 'Needs Improvement', color: '#f97316', severity: 'warning', min: 40, max: 54 },
  { bandId: 'developing', label: 'Developing', color: '#f59e0b', severity: 'neutral', min: 55, max: 69 },
  { bandId: 'effective', label: 'Effective', color: '#84cc16', severity: 'good', min: 70, max: 84 },
  { bandId: 'highly-effective', label: 'Highly Effective', color: '#22c55e', severity: 'excellent', min: 85, max: 100 },
] as const;

/**
 * @deprecated Use INDEX_BAND_DEFINITIONS instead. Kept for backwards compatibility.
 */
export const INDEX_BANDS: IndexBandInfo[] = INDEX_BAND_DEFINITIONS.map(({ bandId, label, color, severity }) => ({
  bandId,
  label,
  color,
  severity,
}));

/**
 * Band colors by ID for quick lookup.
 */
export const BAND_COLORS: Record<BandId, string> = {
  'critical': '#ef4444',
  'needs-improvement': '#f97316',
  'developing': '#f59e0b',
  'effective': '#84cc16',
  'highly-effective': '#22c55e',
};

/**
 * Distribution bucket colors (0-20, 21-40, etc.) matching band progression.
 * Used by IndexDistributionChart.
 */
export const DISTRIBUTION_BUCKET_COLORS = [
  '#ef4444', // 0-20: Red (Critical)
  '#f97316', // 21-40: Orange (Needs Improvement) 
  '#f59e0b', // 41-60: Amber (Developing)
  '#84cc16', // 61-80: Lime (Effective)
  '#22c55e', // 81-100: Green (Highly Effective)
] as const;

/**
 * Trend change threshold (in points).
 * - change > TREND_THRESHOLD → "up"
 * - change < -TREND_THRESHOLD → "down"
 * - |change| <= TREND_THRESHOLD → "neutral"
 */
export const TREND_THRESHOLD = 1;

/**
 * Colors for trend direction indicators.
 */
export const TREND_COLORS: Record<TrendDirection, string> = {
  up: '#22c55e',    // Green (improvement)
  down: '#ef4444',  // Red (decline)
  neutral: '#6b7280', // Gray (no change)
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Resolve a score to its corresponding band.
 * 
 * @param score - Raw score (0-100)
 * @param options.usePerformanceScore - If true and isBurnout, inverts score before lookup
 * @param options.isBurnout - If true, indicates this is a burnout risk score (lower is better)
 * @returns The matching IndexBandInfo
 */
export function resolveIndexBand(
  score: number | null,
  options?: { usePerformanceScore?: boolean; isBurnout?: boolean }
): IndexBandInfo {
  // Handle null scores
  if (score === null) {
    return INDEX_BANDS[2]; // Default to "Developing"
  }

  let lookupScore = score;
  
  // Apply burnout inversion if needed
  // For burnout: lower raw score = better performance
  // So we invert to get performance score for band lookup
  if (options?.usePerformanceScore && options?.isBurnout) {
    lookupScore = 100 - score;
  }
  
  // Clamp to valid range
  lookupScore = Math.max(0, Math.min(100, lookupScore));
  
  const band = INDEX_BAND_DEFINITIONS.find(
    b => lookupScore >= b.min && lookupScore <= b.max
  );
  
  if (!band) return INDEX_BANDS[2]; // Default to "Developing"
  
  return {
    bandId: band.bandId,
    label: band.label,
    color: band.color,
    severity: band.severity,
  };
}

/**
 * Resolve a score to its band index (0-4).
 * Useful for bucket counting.
 * 
 * @param score - Raw score (0-100)
 * @returns Band index (0=critical, 4=highly-effective) or -1 if invalid
 */
export function resolveBandIndex(score: number): number {
  const clampedScore = Math.max(0, Math.min(100, score));
  return INDEX_BAND_DEFINITIONS.findIndex(
    b => clampedScore >= b.min && clampedScore <= b.max
  );
}

/**
 * Get band by ID.
 * 
 * @param bandId - The band identifier
 * @returns The matching IndexBandInfo or default "Developing"
 */
export function getBandById(bandId: string): IndexBandInfo {
  const band = INDEX_BAND_DEFINITIONS.find(b => b.bandId === bandId);
  if (!band) return INDEX_BANDS[2];
  return {
    bandId: band.bandId,
    label: band.label,
    color: band.color,
    severity: band.severity,
  };
}

/**
 * Get color for a score.
 * 
 * @param score - Raw score (0-100)
 * @returns Hex color string
 */
export function getColorForScore(score: number | null): string {
  if (score === null) return BAND_COLORS['developing'];
  return resolveIndexBand(score).color;
}

/**
 * Determine trend direction based on score change.
 * 
 * @param change - Score difference (current - previous)
 * @returns 'up' | 'down' | 'neutral'
 */
export function resolveTrendDirection(change: number | null): TrendDirection {
  if (change === null) return 'neutral';
  if (change > TREND_THRESHOLD) return 'up';
  if (change < -TREND_THRESHOLD) return 'down';
  return 'neutral';
}

/**
 * Calculate performance score for ranking purposes.
 * For most dimensions: performanceScore = rawScore
 * For burnout risk: performanceScore = 100 - rawScore (lower burnout = better performance)
 * 
 * @param rawScore - The raw dimension score
 * @param isBurnout - Whether this is a burnout risk score
 * @returns Performance score for ranking (higher = better)
 */
export function calculatePerformanceScore(rawScore: number | null, isBurnout: boolean): number {
  if (rawScore === null) return 0;
  return isBurnout ? 100 - rawScore : rawScore;
}

/**
 * Create empty band stats array for distribution charts.
 * Initializes counts to 0.
 * 
 * @returns Array of IndexBandWithStats with zero counts
 */
export function createEmptyBandStats(): IndexBandWithStats[] {
  return INDEX_BAND_DEFINITIONS.map(band => ({
    bandId: band.bandId,
    label: band.label,
    color: band.color,
    severity: band.severity,
    count: 0,
    percentage: 0,
    minScore: band.min,
    maxScore: band.max,
  }));
}

/**
 * Get the full band definition including thresholds.
 * Use this when you need min/max values.
 * 
 * @param bandId - The band identifier
 * @returns Full band definition or undefined
 */
export function getBandDefinition(bandId: BandId): IndexBandDefinition | undefined {
  return INDEX_BAND_DEFINITIONS.find(b => b.bandId === bandId);
}

