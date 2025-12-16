/**
 * Theme Presets
 *
 * Pre-built color schemes that can be applied to surveys.
 * Each preset defines the core colors - other values use defaults.
 *
 * @see docs/tickets/SRT-001-theme-types-css-variables.md
 */

import type { ThemePresetColors, ThemePreset } from '../../types';

/**
 * Default theme - Evalia teal with light gray background.
 * Clean, professional, accessible.
 */
const defaultPreset: ThemePresetColors = {
  primaryColor: '#2F8FA5',
  backgroundColor: '#f6f7f9',
  cardBackground: '#ffffff',
  textColor: '#071a32',
  mutedTextColor: '#6b7280',
  accentColor: '#2bb4a0',
};

/**
 * Dark theme - Dark backgrounds with blue accents.
 * Good for modern, tech-forward brands.
 * Card is lighter than background for proper contrast.
 */
const darkPreset: ThemePresetColors = {
  primaryColor: '#60a5fa',
  backgroundColor: '#0f172a',
  cardBackground: '#1e293b',
  textColor: '#f1f5f9',
  mutedTextColor: '#94a3b8',
  accentColor: '#34d399',
};

/**
 * Minimal theme - Monochrome with subtle styling.
 * Maximum focus on content, minimal visual noise.
 * Subtle gray background to differentiate from card.
 */
const minimalPreset: ThemePresetColors = {
  primaryColor: '#18181b',
  backgroundColor: '#fafafa',
  cardBackground: '#ffffff',
  textColor: '#18181b',
  mutedTextColor: '#71717a',
  accentColor: '#3f3f46',
};

/**
 * Corporate theme - Professional blue tones.
 * Traditional, trustworthy, enterprise-ready.
 */
const corporatePreset: ThemePresetColors = {
  primaryColor: '#1e40af',
  backgroundColor: '#f8fafc',
  cardBackground: '#ffffff',
  textColor: '#1e293b',
  mutedTextColor: '#64748b',
  accentColor: '#3b82f6',
};

/**
 * Friendly theme - Warm purple tones.
 * Approachable, creative, engaging.
 * Improved contrast with darker text colors.
 */
const friendlyPreset: ThemePresetColors = {
  primaryColor: '#7c3aed',
  backgroundColor: '#faf5ff',
  cardBackground: '#ffffff',
  textColor: '#1e1b4b',
  mutedTextColor: '#6b7280',
  accentColor: '#a855f7',
};

/**
 * All available theme presets.
 */
export const THEME_PRESETS: Record<ThemePreset, ThemePresetColors> = {
  default: defaultPreset,
  dark: darkPreset,
  minimal: minimalPreset,
  corporate: corporatePreset,
  friendly: friendlyPreset,
};

/**
 * Get a theme preset by name.
 * Returns default preset if not found.
 */
export function getThemePreset(preset?: ThemePreset | null): ThemePresetColors {
  if (!preset) return THEME_PRESETS.default;
  return THEME_PRESETS[preset] ?? THEME_PRESETS.default;
}

/**
 * Theme preset metadata for UI display.
 */
export const THEME_PRESET_META: Record<ThemePreset, { label: string; description: string }> = {
  default: {
    label: 'Default',
    description: 'Clean teal theme with professional feel',
  },
  dark: {
    label: 'Dark',
    description: 'Modern dark theme with blue accents',
  },
  minimal: {
    label: 'Minimal',
    description: 'Monochrome theme focused on content',
  },
  corporate: {
    label: 'Corporate',
    description: 'Traditional blue enterprise theme',
  },
  friendly: {
    label: 'Friendly',
    description: 'Warm purple theme for engagement',
  },
};

/**
 * List of all preset names for iteration.
 */
export const THEME_PRESET_NAMES: ThemePreset[] = [
  'default',
  'dark',
  'minimal',
  'corporate',
  'friendly',
];
