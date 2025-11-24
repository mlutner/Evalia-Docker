/**
 * EVALIA BUTTON SYSTEM - 3 Button Types Only
 * Central definition for all button styles across the application
 * Ensures consistent interactions and visual hierarchy
 */

export const ButtonSystem = {
  // PRIMARY BUTTON - Option B (Teal-first, Enterprise SaaS feel)
  // Used for: "New Survey", "Analyze Survey", "Start", "Publish"
  primaryTeal: {
    background: '#1F6F78',
    text: '#FFFFFF',
    hover: '#155A62',
    active: '#0F4A51',
    className: 'bg-[#1F6F78] hover:bg-[#155A62] active:bg-[#0F4A51] text-white font-semibold',
  },

  // PRIMARY BUTTON - Option A (Lime-first, Modern/Energetic)
  // Alternative for more vibrant brand personality
  // Used for: "New Survey", "Analyze Survey", "Start", "Publish"
  primaryLime: {
    background: '#C3F33C',
    text: '#0A1A2F',
    hover: '#A8D92F',
    active: '#8FBF2A',
    className: 'bg-[#C3F33C] hover:bg-[#A8D92F] active:bg-[#8FBF2A] text-[#0A1A2F] font-semibold',
  },

  // SECONDARY BUTTON
  // Used for: "Edit Survey", "Preview", "Manage Responses"
  // Gives visual hierarchy - not everything screaming
  secondary: {
    background: '#FFFFFF',
    border: '#E2E7EF',
    text: '#1C3B5A',
    hover: '#F7F9FC',
    className: 'bg-white border border-[#E2E7EF] text-[#1C3B5A] hover:bg-[#F7F9FC] font-semibold',
  },

  // GHOST BUTTON
  // Used for: inline actions, "Learn more", toggles
  // Minimal, text-only appearance with subtle hover state
  ghost: {
    background: 'transparent',
    text: '#2F8FA5',
    hover: 'underline',
    className: 'bg-transparent text-[#2F8FA5] font-medium hover:underline',
  },
} as const;

/**
 * Get button class - use in Tailwind when inline styles aren't needed
 * @param type - Button type: 'primaryTeal' | 'primaryLime' | 'secondary' | 'ghost'
 * @returns Tailwind class string
 */
export const getButtonClass = (
  type: 'primaryTeal' | 'primaryLime' | 'secondary' | 'ghost' = 'primaryTeal'
) => {
  return ButtonSystem[type].className;
};

/**
 * Get button style - use for dynamic styling
 * @param type - Button type: 'primaryTeal' | 'primaryLime' | 'secondary' | 'ghost'
 * @returns Style object
 */
export const getButtonStyle = (
  type: 'primaryTeal' | 'primaryLime' | 'secondary' | 'ghost' = 'primaryTeal'
) => {
  const button = ButtonSystem[type];

  if (type === 'ghost') {
    return {
      background: button.background,
      color: button.text,
      cursor: 'pointer',
    };
  }

  if (type === 'secondary') {
    return {
      background: button.background,
      color: button.text,
      border: `1px solid ${button.border}`,
      cursor: 'pointer',
    };
  }

  // Primary buttons
  return {
    background: button.background,
    color: button.text,
    cursor: 'pointer',
  };
};

/**
 * DEFAULT PRIMARY BUTTON TYPE
 * Set to 'primaryTeal' for enterprise SaaS feel (calm, professional)
 * Set to 'primaryLime' for modern/energetic feel (fresh, unique)
 */
export const DEFAULT_PRIMARY_BUTTON: 'primaryTeal' | 'primaryLime' = 'primaryTeal';
