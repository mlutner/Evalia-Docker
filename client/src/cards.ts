/**
 * EVALIA CARD SYSTEM - 3 Card Types Only
 * Central definition for all card styles across the application
 * Ensures consistency and makes global changes simple
 * 
 * Type A: Standard Card (80% of UI)
 * Type B: Highlight Card (call attention, use sparingly)
 * Type C: Dark Card (premium/differentiated, 1-2 places only)
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

  // Type B: Highlight Card - For AI Insights, Alerts, Important data points, Empty states, CTAs
  // Use SPARINGLY - this is your "call attention" tool
  highlightLime: {
    backgroundColor: '#F3FDE3',
    border: '#D9F55E',
    textPrimary: '#1C3B5A',
    textSecondary: '#6A7789',
    iconColor: '#C3F33C',
    borderRadius: '12px',
    padding: '24px',
    shadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
    className: 'bg-[#F3FDE3] border border-[#D9F55E] rounded-[12px] p-[24px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
  },

  highlightTeal: {
    backgroundColor: '#E1F6F3',
    border: '#A8E8E1',
    textPrimary: '#1C3B5A',
    textSecondary: '#6A7789',
    iconColor: '#37C0A3',
    borderRadius: '12px',
    padding: '24px',
    shadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
    className: 'bg-[#E1F6F3] border border-[#A8E8E1] rounded-[12px] p-[24px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
  },

  // Type C: Dark Card (Optional) - Use VERY RARELY
  // For: premium, differentiated, onboarding-specific, or illustration-driven
  // Should appear in no more than 1-2 places at a time
  dark: {
    backgroundColor: '#0A1A2F',
    textPrimary: '#FFFFFF',
    textSecondary: '#E1F6F3',
    accentLime: '#C3F33C',
    accentTeal: '#37C0A3',
    borderRadius: '12px',
    padding: '24px',
    shadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    className: 'bg-[#0A1A2F] rounded-[12px] p-[24px] shadow-[0_4px_12px_rgba(0,0,0,0.15)]',
  },
} as const;

// CSS class helper - use in Tailwind when inline styles aren't needed
export const getCardClass = (type: 'standard' | 'highlightLime' | 'highlightTeal' | 'dark' = 'standard') => {
  return CardSystem[type].className;
};

// Style helper - use for dynamic styling
export const getCardStyle = (type: 'standard' | 'highlightLime' | 'highlightTeal' | 'dark' = 'standard') => {
  const card = CardSystem[type];
  
  if (type === 'dark') {
    return {
      backgroundColor: card.backgroundColor,
      borderRadius: card.borderRadius,
      padding: card.padding,
      boxShadow: card.shadow,
    };
  }
  
  return {
    backgroundColor: card.backgroundColor,
    borderColor: (card as any).border,
    borderRadius: card.borderRadius,
    padding: card.padding,
    boxShadow: card.shadow,
    border: `1px solid ${(card as any).border}`,
  };
};
