/**
 * Default Survey Theme
 *
 * Provides default values for all theme properties.
 * Used when no displayConfig is provided or for missing values.
 *
 * @see docs/tickets/SRT-001-theme-types-css-variables.md
 */

import type { ResolvedSurveyTheme } from '../types';

/**
 * Default survey theme - complete with all required values.
 * This is the "Evalia default" look and feel.
 */
export const DEFAULT_SURVEY_THEME: ResolvedSurveyTheme = {
  // ═══════════════════════════════════════════════════════════════════════════
  // LAYOUT
  // ═══════════════════════════════════════════════════════════════════════════

  /** Default layout is the classic centered card */
  template: 'classic',

  /** Card maximum width in pixels - 600px optimal for survey readability */
  cardMaxWidth: 600,

  /** Card border radius in pixels */
  cardBorderRadius: 16,

  /** Card shadow intensity */
  cardShadow: 'medium',

  /** Progress bar style */
  progressStyle: 'bar',

  /** Progress bar position */
  progressPosition: 'top',

  /** Show back/previous button */
  showBackButton: true,

  /** Show question numbers (Q1, Q2, etc.) */
  showQuestionNumbers: true,

  /** Auto-advance on single-choice selection */
  autoAdvance: true,

  // ═══════════════════════════════════════════════════════════════════════════
  // COLORS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Primary brand color - teal */
  primaryColor: '#2F8FA5',

  /** Page background color */
  backgroundColor: '#f6f7f9',

  /** Card/container background */
  cardBackground: '#ffffff',

  /** Primary text color - dark navy */
  textColor: '#071a32',

  /** Secondary/muted text */
  mutedTextColor: '#6b7280',

  /** Accent color for selected states */
  accentColor: '#2bb4a0',

  /** Font family stack */
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",

  // ═══════════════════════════════════════════════════════════════════════════
  // BRANDING
  // ═══════════════════════════════════════════════════════════════════════════

  /** Logo URL - null means no logo */
  logoUrl: null,

  /** Logo position */
  logoPosition: 'top-center',

  /** Maximum logo height in pixels */
  logoMaxHeight: 60,

  /** Whether to hide "Powered by Evalia" footer */
  hidePoweredBy: false,

  /** Custom footer text - null means use default */
  customFooterText: null,
};

/**
 * Card shadow presets - maps CardShadow type to CSS value.
 */
export const CARD_SHADOW_VALUES: Record<ResolvedSurveyTheme['cardShadow'], string> = {
  none: 'none',
  subtle: '0 4px 12px rgba(0, 0, 0, 0.05)',
  medium: '0 20px 50px rgba(7, 26, 50, 0.15)',
  dramatic: '0 25px 80px rgba(7, 26, 50, 0.25)',
};

/**
 * Get the CSS shadow value for a cardShadow setting.
 */
export function getCardShadowValue(shadow: ResolvedSurveyTheme['cardShadow']): string {
  return CARD_SHADOW_VALUES[shadow] ?? CARD_SHADOW_VALUES.medium;
}

/**
 * Card max width presets for common sizes.
 * Optimized for survey readability (50-75 chars per line).
 */
export const CARD_WIDTH_PRESETS = {
  narrow: 520,
  default: 600,
  wide: 680,
  extraWide: 760,
} as const;

/**
 * Card border radius presets.
 */
export const CARD_RADIUS_PRESETS = {
  none: 0,
  small: 8,
  medium: 12,
  large: 16,
  extraLarge: 24,
} as const;
