/**
 * EVALIA COLOR PALETTE - Single Source of Truth
 * All colors are defined here and referenced via CSS variables
 * Use these exports to reference colors in TypeScript/React code
 */

export const COLORS = {
  // Primary Accent - Evalia Blue-Teal
  primary: '#2F8FA5',
  
  // Primary Lime
  lime: '#A3D65C',
  
  // Navy - Sidebar background only
  navy: '#0D1B2A',
  
  // Background
  bg: '#F7F9FC',
  
  // Card Surface
  surface: '#FFFFFF',
  
  // Border/Dividers
  border: '#E2E7EF',
  
  // Text Primary
  textPrimary: '#1C2635',
  
  // Text Secondary
  textSecondary: '#6A7789',
} as const;

// CSS variable references - use in inline styles
export const CSS_VARS = {
  primary: 'var(--color-primary)',
  lime: 'var(--color-accent-lime)',
  navy: 'var(--color-dark-navy)',
  bg: 'var(--color-bg-light)',
  surface: 'var(--color-surface)',
  border: 'var(--color-border)',
  textPrimary: 'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)',
} as const;
