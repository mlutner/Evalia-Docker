/**
 * EVALIA CARD SYSTEM - 3 Card Types Only
 * Central definition for all card styles across the application
 * Ensures consistency and makes global changes simple
 */

export const CardSystem = {
  // Type A: Standard Card (Default) - 80% of UI usage
  // Use for: dashboards, surveys grid, templates, scoring, analytics
  standard: {
    backgroundColor: '#FFFFFF',
    border: '#E2E7EF',
    textPrimary: '#1C3B5A',
    textSecondary: '#6A7789',
    borderRadius: '12px',
    padding: '24px',
    shadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
    className: 'bg-white border border-[#E2E7EF] rounded-[12px] p-[24px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
  },

  // Type B: Elevated Card (Secondary) - For highlighted/featured content
  // Use for: featured templates, key metrics, special announcements
  elevated: {
    backgroundColor: '#FFFFFF',
    border: '#E2E7EF',
    textPrimary: '#1C3B5A',
    textSecondary: '#6A7789',
    borderRadius: '12px',
    padding: '24px',
    shadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    className: 'bg-white border border-[#E2E7EF] rounded-[12px] p-[24px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
  },

  // Type C: Accent Card (Tertiary) - For calls-to-action or premium features
  // Use for: onboarding, CTAs, premium features, important sections
  accent: {
    backgroundColor: '#F0F7F8',
    border: '#D4E4E8',
    textPrimary: '#1C3B5A',
    textSecondary: '#6A7789',
    borderRadius: '12px',
    padding: '24px',
    shadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
    className: 'bg-[#F0F7F8] border border-[#D4E4E8] rounded-[12px] p-[24px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
  },
} as const;

// CSS class helper - use in Tailwind when inline styles aren't needed
export const getCardClass = (type: 'standard' | 'elevated' | 'accent' = 'standard') => {
  return CardSystem[type].className;
};

// Style helper - use for dynamic styling
export const getCardStyle = (type: 'standard' | 'elevated' | 'accent' = 'standard') => ({
  backgroundColor: CardSystem[type].backgroundColor,
  borderColor: CardSystem[type].border,
  borderRadius: CardSystem[type].borderRadius,
  padding: CardSystem[type].padding,
  boxShadow: CardSystem[type].shadow,
  border: `1px solid ${CardSystem[type].border}`,
});
