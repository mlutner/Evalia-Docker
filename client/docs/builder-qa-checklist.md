# Builder & Preview QA Checklist (Hardened Version)

Run this after any change to builder, preview, question rendering, or the question schema.

---

## 1. Survey Creation Flow

### Creation & setup
- [ ] `/builder-v2/new` loads without console errors or missing assets
- [ ] Creating a blank survey produces a valid initial survey object
- [ ] Creating from template correctly:
  - [ ] Loads template metadata
  - [ ] Loads template questions
  - [ ] Loads template scoring rules (if any)
  - [ ] No missing fields in questions

### Basic survey details
- [ ] Title updates in state, header, and saves to DB
- [ ] Description updates in state and displays in preview
- [ ] Auto-save behavior works (no state loss after refresh)

### Welcome & Thank-you screens
- [ ] Toggle on/off works without residual elements
- [ ] Editing title/description persists
- [ ] Header image loads with valid fallback
- [ ] Theme colors override correctly
- [ ] No layout jumping or broken spacing

---

## 2. Question Operations

### CRUD
- [ ] Add question (every type)
- [ ] Delete question (index updates, drag order stable)
- [ ] Duplicate question (deep copy: options, labels, min/max, etc.)
- [ ] Reorder via DnD (no ghost states or flickering)

### Editing
- [ ] Question text changes update everywhere
- [ ] Description shows in preview
- [ ] Options: add/remove/edit reliably
- [ ] Required toggles update preview badge
- [ ] Changing question type clears incompatible fields
- [ ] Changing type does not corrupt existing fields
- [ ] No stale MUI/Tailwind classes left behind after transitions

---

## 3. Question Type Rendering (Builder + Preview)

Verify both in-builder mode and preview mode:

- [ ] Text
- [ ] Email
- [ ] Phone
- [ ] URL
- [ ] Number
- [ ] Textarea
- [ ] Multiple choice
- [ ] Checkbox
- [ ] Dropdown
- [ ] Yes/No
- [ ] Rating – number
- [ ] Rating – star
- [ ] Rating – heart
- [ ] NPS
- [ ] Likert
- [ ] Slider
- [ ] Opinion scale
- [ ] Date
- [ ] Time
- [ ] Matrix
- [ ] Ranking
- [ ] New & experimental types render without breaking layout

### Also check:
- [ ] Fonts, padding, and spacing match design system
- [ ] No "input flicker" when typing (state bounce)
- [ ] QuestionRenderer handles all missing/null fields safely
- [ ] Adapter `toRuntimeQuestion` returns valid runtime type for ALL question types

---

## 4. Preview Screen (PreviewV2)

### Navigation flow
- [ ] Welcome → Q1 → … → Submit → Thank-you
- [ ] Back from Q1 returns to welcome
- [ ] After deleting a question, preview index clamps to valid range

### Device views
- [ ] Desktop layout correct
- [ ] Tablet layout correct
- [ ] Mobile layout correct
- [ ] No overflow or clipped components

### Answer behavior
- [ ] Answer persists when navigating next/prev
- [ ] Changing question type resets previous answer safely
- [ ] Preview answers clear when survey is restarted

### Visual correctness
- [ ] Progress bar correct at every question count
- [ ] Required badge accurate
- [ ] Header color uses theme override
- [ ] Button colors match theme
- [ ] Shadow/rounding consistent with design tokens

---

## 5. Publish Flow

- [ ] Publish disabled when:
  - [ ] No questions
  - [ ] No meaningful title
- [ ] Publish succeeds and returns new ID
- [ ] Survey URL copies correctly
- [ ] Survey loads at `/survey/:id` without missing fields
- [ ] Runtime survey uses same QuestionRenderer
- [ ] Runtime survey handles logic/skips gracefully (if enabled)
- [ ] Toasts fire correctly on success/failure

---

## 6. Edge Cases & Stress Tests

- [ ] Empty survey → preview shows "No questions"
- [ ] Single question → progress bar 100% on Q1
- [ ] Very long question text → doesn't overflow mobile
- [ ] 20+ options in MCQ → scrolls properly
- [ ] 2+ matrix rows, 5+ columns → table scrolls, no clipping
- [ ] SSR → no `window` or `navigator` reference errors
- [ ] Invalid theme colors → fails safely with fallback
- [ ] Missing or corrupted question fields do NOT crash preview
- [ ] Unicode content (emoji, accents) renders correctly

---

## 7. Regression Watchlist (Critical)

These are the things that break most frequently:

- [ ] Progress bar math
- [ ] Question index out of range
- [ ] Welcome/thank-you screens showing when disabled
- [ ] Deleting a question causing builder/preview mismatch
- [ ] Adapter drift (`toRuntimeQuestion` becomes out of sync)
- [ ] Theme colors overwriting Tailwind defaults incorrectly
- [ ] Duplicate IDs introduced by duplicate or AI edit
- [ ] Missing `key` props causing React list warnings
- [ ] QuestionRenderer missing props after refactoring
- [ ] Shared types updated in one file but not others

---

## 8. Meta Checks

- [ ] No unused imports
- [ ] No console errors during full flow
- [ ] No console warnings (duplicate keys, controlled/uncontrolled inputs, etc.)
- [ ] No commented-out legacy code left in non-legacy directories
- [ ] Builder and Preview use same design tokens
- [ ] All question types documented in `/docs/survey-pipeline.md`

---

**Last Verified:** _______________
**Verified By:** _______________
