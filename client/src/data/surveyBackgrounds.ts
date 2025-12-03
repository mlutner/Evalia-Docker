// ═══════════════════════════════════════════════════════════════════════════════
// SURVEY BACKGROUND IMAGE LIBRARY
// Curated Unsplash images for professional survey designs
// ═══════════════════════════════════════════════════════════════════════════════

export interface BackgroundImage {
  id: string;
  name: string;
  category: 'nature' | 'abstract' | 'minimal' | 'gradient' | 'professional' | 'creative';
  url: string;
  thumbnailUrl: string;
  photographer: string;
  color: string; // Dominant color for overlay matching
}

// Using Unsplash Source API for reliable, free images
// Format: https://images.unsplash.com/photo-{id}?w={width}&q={quality}

export const BACKGROUND_IMAGES: BackgroundImage[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // NATURE - Calming landscapes
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'nature-1',
    name: 'Mountain Lake',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=60',
    photographer: 'Samuel Ferrara',
    color: '#2B4162',
  },
  {
    id: 'nature-2',
    name: 'Misty Forest',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&q=60',
    photographer: 'Sebastian Unrau',
    color: '#2D5016',
  },
  {
    id: 'nature-3',
    name: 'Ocean Waves',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=200&q=60',
    photographer: 'Matt Hardy',
    color: '#1A5276',
  },
  {
    id: 'nature-4',
    name: 'Green Hills',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=200&q=60',
    photographer: 'Dave Hoefler',
    color: '#1E8449',
  },
  {
    id: 'nature-5',
    name: 'Sunset Sky',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=200&q=60',
    photographer: 'Luca Bravo',
    color: '#C0392B',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ABSTRACT - Modern patterns
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'abstract-1',
    name: 'Blue Waves',
    category: 'abstract',
    url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=200&q=60',
    photographer: 'Gradienta',
    color: '#2E86AB',
  },
  {
    id: 'abstract-2',
    name: 'Purple Flow',
    category: 'abstract',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&q=60',
    photographer: 'Gradienta',
    color: '#8E44AD',
  },
  {
    id: 'abstract-3',
    name: 'Geometric Light',
    category: 'abstract',
    url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=200&q=60',
    photographer: 'Jr Korpa',
    color: '#E74C3C',
  },
  {
    id: 'abstract-4',
    name: 'Ink Swirl',
    category: 'abstract',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=60',
    photographer: 'Milad Fakurian',
    color: '#5B2C6F',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // MINIMAL - Clean and simple
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'minimal-1',
    name: 'White Paper',
    category: 'minimal',
    url: 'https://images.unsplash.com/photo-1533035353720-f1c6a75cd8ab?w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1533035353720-f1c6a75cd8ab?w=200&q=60',
    photographer: 'Joanna Kosinska',
    color: '#F5F5F5',
  },
  {
    id: 'minimal-2',
    name: 'Soft Marble',
    category: 'minimal',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=60',
    photographer: 'Henry & Co.',
    color: '#D5D8DC',
  },
  {
    id: 'minimal-3',
    name: 'Light Gray',
    category: 'minimal',
    url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=200&q=60',
    photographer: 'Gradienta',
    color: '#ABB2B9',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // GRADIENT - Smooth color transitions
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'gradient-1',
    name: 'Blue Purple',
    category: 'gradient',
    url: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=200&q=60',
    photographer: 'Gradienta',
    color: '#5B2C6F',
  },
  {
    id: 'gradient-2',
    name: 'Warm Sunset',
    category: 'gradient',
    url: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=200&q=60',
    photographer: 'Gradienta',
    color: '#E67E22',
  },
  {
    id: 'gradient-3',
    name: 'Cool Mint',
    category: 'gradient',
    url: 'https://images.unsplash.com/photo-1557682260-96773eb01377?w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557682260-96773eb01377?w=200&q=60',
    photographer: 'Gradienta',
    color: '#1ABC9C',
  },
  {
    id: 'gradient-4',
    name: 'Pink Dream',
    category: 'gradient',
    url: 'https://images.unsplash.com/photo-1557682268-e3955ed5d83f?w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557682268-e3955ed5d83f?w=200&q=60',
    photographer: 'Gradienta',
    color: '#EC407A',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PROFESSIONAL - Office/Business themes
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'professional-1',
    name: 'City Skyline',
    category: 'professional',
    url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=200&q=60',
    photographer: 'Pedro Lastra',
    color: '#2C3E50',
  },
  {
    id: 'professional-2',
    name: 'Modern Office',
    category: 'professional',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&q=60',
    photographer: 'Israel Andrade',
    color: '#34495E',
  },
  {
    id: 'professional-3',
    name: 'Dark Texture',
    category: 'professional',
    url: 'https://images.unsplash.com/photo-1557682250-f9eb3f2a31eb?w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557682250-f9eb3f2a31eb?w=200&q=60',
    photographer: 'Gradienta',
    color: '#1C2833',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CREATIVE - Artistic and unique
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'creative-1',
    name: 'Paint Splash',
    category: 'creative',
    url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=200&q=60',
    photographer: 'Lucas Benjamin',
    color: '#9B59B6',
  },
  {
    id: 'creative-2',
    name: 'Neon Lights',
    category: 'creative',
    url: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=200&q=60',
    photographer: 'Efe Kurnaz',
    color: '#E91E63',
  },
  {
    id: 'creative-3',
    name: 'Color Blocks',
    category: 'creative',
    url: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=1920&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=200&q=60',
    photographer: 'Robert Katzki',
    color: '#3498DB',
  },
];

// Category labels for UI
export const BACKGROUND_CATEGORIES = [
  { id: 'all', name: 'All', icon: '🎨' },
  { id: 'nature', name: 'Nature', icon: '🌿' },
  { id: 'abstract', name: 'Abstract', icon: '✨' },
  { id: 'minimal', name: 'Minimal', icon: '◻️' },
  { id: 'gradient', name: 'Gradient', icon: '🌈' },
  { id: 'professional', name: 'Professional', icon: '💼' },
  { id: 'creative', name: 'Creative', icon: '🎭' },
];

// Solid color backgrounds as fallback
export const SOLID_BACKGROUNDS = [
  { id: 'solid-white', name: 'White', color: '#FFFFFF' },
  { id: 'solid-light', name: 'Light Gray', color: '#F8FAFC' },
  { id: 'solid-slate', name: 'Slate', color: '#1E293B' },
  { id: 'solid-blue', name: 'Blue', color: '#2563EB' },
  { id: 'solid-purple', name: 'Purple', color: '#7C3AED' },
  { id: 'solid-teal', name: 'Teal', color: '#0D9488' },
  { id: 'solid-emerald', name: 'Emerald', color: '#059669' },
  { id: 'solid-rose', name: 'Rose', color: '#E11D48' },
];

// Helper to get images by category
export function getBackgroundsByCategory(category: string): BackgroundImage[] {
  if (category === 'all') return BACKGROUND_IMAGES;
  return BACKGROUND_IMAGES.filter(img => img.category === category);
}

