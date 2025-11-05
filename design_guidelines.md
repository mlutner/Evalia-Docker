# Evalia Design Guidelines

## Design Approach
**Reference-Based: Typeform-Inspired Survey Experience**

Evalia follows Typeform's pioneering one-question-at-a-time philosophy while adapting it for trainer-focused survey creation. The design emphasizes conversational flow, generous whitespace, and seamless transitions that make both creating and taking surveys feel effortless.

## Core Design Principles

1. **Conversational Minimalism**: Each screen presents focused content without visual clutter
2. **Progressive Disclosure**: Information reveals gracefully as users advance through workflows
3. **Responsive Elegance**: Seamless experience from mobile to desktop
4. **Purposeful Motion**: Transitions guide attention without distraction

## Typography

**Font Family**: Inter (Google Fonts)
- Headings: Inter SemiBold (600)
- Body: Inter Regular (400)
- UI Elements: Inter Medium (500)

**Scale**:
- Hero/Page Title: text-4xl (36px) → text-5xl (48px) on desktop
- Question Text: text-2xl (24px) → text-3xl (30px) on desktop
- Section Headers: text-xl (20px)
- Body/Descriptions: text-base (16px)
- Labels/Helpers: text-sm (14px)
- Captions: text-xs (12px)

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, and 16
- Tight spacing: p-2, gap-2 (8px)
- Standard spacing: p-4, gap-4 (16px), m-6 (24px)
- Generous spacing: p-8, py-12 (32px, 48px)
- Section spacing: py-16, py-20 (64px, 80px)

**Container Strategy**:
- Full-width sections: w-full with max-w-7xl mx-auto px-4
- Centered content cards: max-w-2xl mx-auto
- Question views: max-w-3xl mx-auto for optimal readability
- Form inputs: max-w-md for focused interaction

**Grid Patterns**:
- Dashboard survey cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Feature highlights: grid-cols-1 md:grid-cols-2 gap-8
- Mobile: Always single column with adequate padding

## Component Library

### Navigation
- Clean header with logo left, user menu right
- Minimal border-bottom (border-gray-200) for subtle separation
- Sticky positioning (sticky top-0) with backdrop-blur effect
- Height: h-16 with flex items-center

### Survey Question Cards
- Full-screen presentation: min-h-screen flex items-center justify-center
- No visible borders or boxes - questions float on background
- Fade + slide transitions: opacity and translateY(20px → 0)
- Progress indicator: thin bar at top (h-1) with smooth width transition

### Input Fields
- Large, friendly touch targets: h-12 to h-14
- Rounded corners: rounded-lg (8px)
- Subtle borders: border border-gray-300
- Focus states: ring-2 ring-blue-500 ring-offset-2
- Placeholder text: text-gray-400

### Buttons
- Primary: bg-blue-600 text-white rounded-lg px-6 py-3
- Secondary: bg-white border border-gray-300 text-gray-700
- Minimum width: min-w-[120px] for consistency
- Hover: subtle scale transform-scale-105 and brightness increase
- Disabled: opacity-50 cursor-not-allowed

### File Upload Zone
- Dashed border dropzone: border-2 border-dashed border-gray-300 rounded-xl
- Hover state: border-blue-500 bg-blue-50
- Large hit area: min-h-[200px] flex items-center justify-center
- Upload icon and clear instruction text centered

### Dashboard Cards
- White surface: bg-white with subtle shadow
- Card shadow: shadow-sm (0 1px 2px rgba(0,0,0,0.05))
- Hover elevation: shadow-md transition
- Padding: p-6 with clear title and metadata hierarchy

### Chat Panel (AI Refinement)
- Side panel or modal overlay: max-w-md
- Message bubbles: User (bg-blue-100, ml-auto), AI (bg-gray-100)
- Rounded bubbles: rounded-2xl with p-4
- Input at bottom with send button

### Progress Indicators
- Linear progress bar at screen top: h-1 bg-blue-600
- Smooth width transitions: transition-all duration-500 ease-out
- Percentage text: Small, unobtrusive (text-sm text-gray-500)

## Animations

**Timing**: Use sparingly with 300ms duration and ease-in-out easing
- Question transitions: Fade in (opacity 0→1) + slide up (translateY 20px→0)
- Page transitions: Cross-fade between views (200ms)
- Button interactions: Subtle scale on hover (scale-105)
- Card reveals: Staggered fade-in on dashboard load (delay increments of 50ms)

**No Animations For**:
- Loading states (use simple spinners)
- Background elements
- Decorative elements

## Screen-Specific Layouts

### Login/Signup Screen
- Centered card approach: max-w-md mx-auto with vertical centering
- Logo at top center
- Form fields stacked with gap-4
- Social proof or tagline below form
- Clean background: gradient or subtle pattern

### Dashboard
- Header with "Create New Survey" primary CTA
- Grid of survey cards showing: title, creation date, response count, quick actions
- Empty state: Centered illustration with "Create your first survey" CTA
- Filter/search bar if user has multiple surveys

### Upload/Chat Screen
- Split view on desktop: Upload zone (left 60%), Chat panel (right 40%)
- Mobile: Stacked vertical with upload first
- Progress feedback: Linear progress bar + status text during OCR
- Parsed text preview: Collapsible section showing extracted content

### Survey Builder Preview
- Full-screen immersive view mimicking respondent experience
- Single question centered with generous whitespace
- Navigation: "Next" button bottom-right, "Back" text link bottom-left
- Edit mode toggle: Floating button to switch between preview/edit

### Survey View (Respondent)
- Clean, distraction-free full-screen experience
- One question at a time with smooth transitions
- Keyboard navigation support (Enter to advance)
- Thank you screen with custom message option

## Images

**Hero Section (Marketing/Landing Page)**:
- Large hero image showing trainers/educators using the tool in collaborative settings
- Image treatment: Subtle overlay (bg-black/20) for text legibility
- Placement: Full-width background with centered content overlay
- Height: min-h-[500px] md:min-h-[600px]

**Dashboard Empty State**:
- Illustrative image showing survey creation concept
- Style: Modern, friendly illustration (not photography)
- Size: max-w-md centered above CTA

**Feature Showcases**:
- Screenshots of actual interface showing AI chat, question preview, response analytics
- Border: Subtle border or shadow for definition
- Responsive sizing: Scale down proportionally on mobile

## Accessibility

- Focus indicators: Always visible with ring-2 ring-blue-500 ring-offset-2
- Color contrast: Meet WCAG AA standards (4.5:1 for text)
- Keyboard navigation: Full support for Tab, Enter, Escape
- ARIA labels: Descriptive labels for all interactive elements
- Form validation: Clear error states with red-500 text and icons

## Responsive Breakpoints

- Mobile: base (default) - Stack everything, full-width components
- Tablet: md: (768px+) - Two-column grids, side-by-side layouts
- Desktop: lg: (1024px+) - Multi-column dashboards, split views
- Wide: xl: (1280px+) - Maximum container widths, spacious layouts