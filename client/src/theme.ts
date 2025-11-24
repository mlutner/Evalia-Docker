/**
 * EVALIA CENTRALIZED THEME SYSTEM
 * Single source of truth for all design tokens and component styles
 * Makes changes globally across the entire platform
 */

export const theme = {
  colors: {
    // Primary Colors
    primary: 'var(--color-primary)',        // #2F8FA5 - Primary Blue-Teal
    primaryHex: '#2F8FA5',                  // Hex version for direct use
    lime: 'var(--color-accent-lime)',       // #A3D65C - Primary Lime
    limeHex: '#A3D65C',                     // Hex version for direct use
    navy: 'var(--color-dark-navy)',         // #0D1B2A - Navy (Sidebar)
    navyHex: '#0D1B2A',                     // Hex version for direct use
    
    // Backgrounds
    bg: 'var(--color-bg-light)',            // #F7F9FC - Page Background
    surface: 'var(--color-surface)',        // #FFFFFF - Standard Card Surface
    surfaceHighlightLime: 'var(--color-surface-highlight-lime)',  // #F3FDE3
    surfaceHighlightTeal: 'var(--color-surface-highlight-teal)',  // #E1F6F3
    surfaceDark: 'var(--color-surface-dark)',                      // #0A1A2F
    
    // Borders
    border: 'var(--color-border)',          // #E2E7EF - Standard Border
    borderHighlightLime: 'var(--color-border-highlight-lime)',    // #D9F55E
    borderHighlightTeal: 'var(--color-border-highlight-teal)',    // #A8E8E1
    
    // Text Colors
    textPrimary: 'var(--color-text-primary)',     // #1C2635 - Primary Text
    textSecondary: 'var(--color-text-secondary)', // #6A7789 - Secondary Text
    
    // Icon Colors (for highlight cards)
    iconLime: 'var(--color-icon-lime)',     // #C3F33C
    iconTeal: 'var(--color-icon-teal)',     // #37C0A3
  },
  
  buttons: {
    primary: {
      bg: 'var(--color-primary)',
      text: '#FFFFFF',
      hover: 'rgba(47, 143, 165, 0.9)',
    },
    lime: {
      bg: 'var(--color-accent-lime)',
      text: 'var(--color-dark-navy)',
      hover: 'rgba(163, 214, 92, 0.9)',
    },
    outline: {
      bg: 'transparent',
      border: 'var(--color-border)',
      text: 'var(--color-text-primary)',
    },
    ghost: {
      bg: 'transparent',
      text: 'var(--color-text-secondary)',
    },
  },

  backgrounds: {
    page: 'var(--color-bg-light)',
    card: 'var(--color-surface)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  text: {
    primary: 'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    subtle: 'rgba(106, 119, 137, 0.6)',
  },

  opacity: {
    hover: 0.08,
    active: 0.12,
    disabled: 0.5,
  },
} as const;

/**
 * Get CSS for inline styles - use in React components
 */
export const getThemeStyle = (property: keyof typeof theme.colors) => ({
  color: theme.colors[property as keyof typeof theme.colors],
});

export const getButtonStyle = (variant: keyof typeof theme.buttons) => {
  const btn = theme.buttons[variant];
  return {
    backgroundColor: btn.bg,
    color: (btn as any).text,
    borderColor: (btn as any).border,
  };
};
