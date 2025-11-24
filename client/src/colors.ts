/**
 * Unified Color System for Evalia
 * All colors flow through this single source of truth
 */

export const COLORS = {
  // Primary - Main UI Color (Blue)
  primary: {
    DEFAULT: '#3A8DFF',
    dark: '#1B3B66',
    soft: '#E8F2FF',
    vibrant: '#1F6FFF',
  },
  
  // Accent - Warnings & Highlights (Lime)
  accent: {
    lime: '#A4E65A',
    lime_dark: '#6FA63B',
    lime_soft: '#F3FBE8',
    lime_glow: '#C8F995',
  },

  // Secondary Accents
  secondary: {
    indigo: '#5A6BFF',
    aqua: '#3FC7E4',
    lavender: '#EEF0FF',
  },

  // Neutral - Backgrounds, Borders, Text
  neutral: {
    bg: '#F7F9FC',
    surface: '#FFFFFF',
    border: '#E2E7EF',
    text_primary: '#1C2635',
    text_secondary: '#6A7789',
  },

  // Status
  status: {
    destructive: '#FF4D4D',
  },
} as const;

// Chart-specific colors
export const CHART_COLORS = {
  primary: COLORS.primary.DEFAULT,      // #3A8DFF
  secondary: COLORS.accent.lime,        // #A4E65A
  tertiary: COLORS.secondary.indigo,    // #5A6BFF
  quaternary: COLORS.secondary.aqua,    // #3FC7E4
} as const;
