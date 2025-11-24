/**
 * EVALIA INTERACTION STATES SYSTEM
 * Handles hover, active, and disabled states consistently across the app
 */

export const InteractionStates = {
  // HOVER STATES
  hover: {
    teal: {
      bg: '#E1F6F3',
      className: 'hover:bg-[#E1F6F3] transition-colors duration-150',
    },
    lime: {
      bg: '#F3FDE3',
      className: 'hover:bg-[#F3FDE3] transition-colors duration-150',
    },
    subtle: {
      bg: '#F7F9FC',
      className: 'hover:bg-[#F7F9FC] transition-colors duration-150',
    },
  },

  // ACTIVE/CLICK STATE - slight darkening or inset shadow
  active: {
    teal: {
      className: 'active:bg-[#D4E4E8] transition-colors duration-75',
    },
    lime: {
      className: 'active:bg-[#E8F9CC] transition-colors duration-75',
    },
  },

  // DISABLED STATE
  disabled: {
    bg: '#F0F2F5',
    text: '#B0B8C2',
    className: 'disabled:bg-[#F0F2F5] disabled:text-[#B0B8C2] disabled:cursor-not-allowed disabled:opacity-60',
  },

  // SIDEBAR ITEM STATES
  sidebarItem: {
    active: {
      textColor: '#FFFFFF',
      indicator: '#A3D65C', // lime bar left
      indicatorWidth: '4px',
      className: 'text-white before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[#A3D65C] before:rounded-r-sm',
    },
    inactive: {
      textColor: 'rgba(255, 255, 255, 0.7)',
      className: 'text-white/70',
    },
    hover: {
      bg: '#112238',
      textColor: '#FFFFFF',
      className: 'hover:bg-[#112238] hover:text-white transition-all duration-150',
    },
  },
} as const;

/**
 * Get hover effect class for element
 * @param type - 'teal' | 'lime' | 'subtle'
 */
export const getHoverClass = (type: 'teal' | 'lime' | 'subtle' = 'subtle') => {
  return InteractionStates.hover[type].className;
};

/**
 * Get disabled state class
 */
export const getDisabledClass = () => {
  return InteractionStates.disabled.className;
};

/**
 * Get sidebar item classes
 */
export const getSidebarItemClass = (isActive: boolean) => {
  if (isActive) {
    return `${InteractionStates.sidebarItem.active.className} ${InteractionStates.sidebarItem.hover.className}`;
  }
  return `${InteractionStates.sidebarItem.inactive.className} ${InteractionStates.sidebarItem.hover.className}`;
};
