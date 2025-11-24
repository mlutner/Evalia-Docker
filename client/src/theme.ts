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
    // PRIMARY BUTTON - Option B: Teal-first (Enterprise SaaS) - DEFAULT
    primaryTeal: {
      bg: 'var(--button-primary-teal)',      // #1F6F78
      bgHex: '#1F6F78',
      text: '#FFFFFF',
      hover: 'var(--button-primary-teal-hover)',  // #155A62
      active: 'var(--button-primary-teal-active)', // #0F4A51
    },

    // PRIMARY BUTTON - Option A: Lime-first (Modern/Energetic)
    primaryLime: {
      bg: 'var(--button-primary-lime)',       // #C3F33C
      bgHex: '#C3F33C',
      text: 'var(--color-dark-navy)',        // #0A1A2F
      hover: 'var(--button-primary-lime-hover)',  // #A8D92F
      active: 'var(--button-primary-lime-active)', // #8FBF2A
    },

    // SECONDARY BUTTON
    secondary: {
      bg: 'var(--button-secondary-bg)',       // #FFFFFF
      border: 'var(--button-secondary-border)', // #E2E7EF
      text: 'var(--button-secondary-text)',   // #1C3B5A
      hover: 'var(--button-secondary-hover)', // #F7F9FC
    },

    // GHOST BUTTON
    ghost: {
      bg: 'transparent',
      text: 'var(--button-ghost-text)',      // #2F8FA5
      hoverEffect: 'underline',
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

  // INTERACTION STATES
  interactions: {
    hoverTintTeal: 'var(--hover-tint-teal)',      // #E1F6F3 - subtle hover for teal
    hoverTintLime: 'var(--hover-tint-lime)',      // #F3FDE3 - subtle hover for lime
    disabled: {
      bg: 'var(--disabled-bg)',                   // #F0F2F5
      text: 'var(--disabled-text)',               // #B0B8C2
    },
  },

  // SIDEBAR
  sidebar: {
    background: 'var(--sidebar-navy)',           // #0A1A2F
    hover: 'var(--sidebar-hover)',               // #112238 - subtle lighter navy
    activeIndicator: 'var(--sidebar-active-indicator)', // #A3D65C (lime bar)
    activeText: 'var(--sidebar-text-active)',     // #FFFFFF (100%)
    inactiveText: 'var(--sidebar-text-inactive)', // rgba(255,255,255,0.7) (70%)
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
    backgroundColor: (btn as any).bg,
    color: (btn as any).text,
    borderColor: (btn as any).border,
  };
};
