/**
 * EVALIA CENTRALIZED THEME SYSTEM
 * Single source of truth for all design tokens and component styles
 * Makes changes globally across the entire platform
 */

export const theme = {
  colors: {
    primary: 'var(--color-primary)',        // #2F8FA5 - Primary Blue-Teal
    primaryHex: '#2F8FA5',                  // Hex version for direct use
    lime: 'var(--color-accent-lime)',       // #A3D65C - Primary Lime
    limeHex: '#A3D65C',                     // Hex version for direct use
    navy: 'var(--color-dark-navy)',         // #0D1B2A - Navy (Sidebar)
    navyHex: '#0D1B2A',                     // Hex version for direct use
    bg: 'var(--color-bg-light)',            // #F7F9FC - Page Background
    surface: 'var(--color-surface)',        // #FFFFFF - Card Surface
    border: 'var(--color-border)',          // #E2E7EF - Borders
    textPrimary: 'var(--color-text-primary)',     // #1C2635 - Primary Text
    textSecondary: 'var(--color-text-secondary)', // #6A7789 - Secondary Text
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
