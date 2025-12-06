---
description: Normalize theme usage across runtime and builder preview
---

Ticket ID: THEME-001
Title: Normalize theme usage across runtime and builder preview

Context:
Evalia has a theme normalization layer (normalizeThemeImages, useNormalizedTheme) that should be the single source of truth. Builder Preview and runtime SurveyView sometimes diverge, causing visual mismatches and brittle theme bugs.

Goal (definition of done):
- One canonical theme normalization pipeline.
- Builder Preview and runtime SurveyView both use the same normalized theme shape.
- No component uses raw design_settings directly.
- Theme bugs are easier to debug because normalization is centralized.

Flows affected:
- Builder Design/Theme editor.
- Builder Preview.
- Runtime SurveyView.
- Shared theme utilities/hooks.

------------------------------------------------
STEP 1 – Architect Analysis (read-only)
------------------------------------------------
1. Locate theme utilities and hooks:
   - shared/theme.ts (normalizeThemeImages, theme types).
   - useNormalizedTheme (or equivalent hook).
   - Any ThemeProvider / design_settings usage.

2. Locate theme consumers:
   - Runtime: SurveyView and layout shell.
   - Builder: DesignV2 / theme editor and Preview components.

3. Map current data flow in 5–10 lines:
   - Where design_settings enters from the API.
   - Where normalization happens (or doesn’t).
   - How theme props propagate through Preview and SurveyView.

4. Identify drift:
   - Any direct design_settings usage.
   - Any duplicated normalization logic.
   - Any TODOs mentioning theme inconsistencies.

Do not change code until this analysis is written.

------------------------------------------------
STEP 2 – Constraints & Invariants
------------------------------------------------
You MUST:
- Use shared/theme.ts as the single normalization source.
- Ensure both preview and runtime call the same normalization logic.
- Prefer useNormalizedTheme over ad-hoc processing.

You MUST NOT:
- Change the external theme API shape in a breaking way unless strictly needed.
- Modify unrelated layout or UX styling beyond wiring the normalized theme.
- Add per-component normalization hacks.

------------------------------------------------
STEP 3 – Implementation Plan (minimal diff)
------------------------------------------------
Plan a minimal change set:
- Confirm the canonical function signature in shared/theme.ts.
- Ensure:
  - SurveyView obtains normalizedTheme via a single hook/path.
  - Builder Preview uses the same normalizedTheme shape.

List exact files to touch before editing:
- shared/theme.ts (only if necessary to expose helpers).
- client/src/hooks/useNormalizedTheme.ts (if present).
- SurveyView file.
- Preview page/component.
- Any ThemeProvider or layout shell.

------------------------------------------------
STEP 4 – Code Changes
------------------------------------------------
Implement with minimal diffs:
- Ensure there is exactly one normalization step when loading design_settings.
- Introduce or standardize a hook call such as:
  - const theme = useNormalizedTheme(survey.design_settings);
- Wire that into both:
  - Runtime SurveyView.
  - Preview screen.

- Replace direct design_settings usage in components with normalized theme.
- Remove duplicate or ad-hoc normalization logic.

Keep structural changes tiny and focused on wiring.

------------------------------------------------
STEP 5 – Tests / Manual Checks
------------------------------------------------
If tests exist:
- Add/extend tests to assert:
  - normalizeThemeImages is invoked.
  - Components receive normalizedTheme, not raw design_settings.

If not:
- Add small tests in shared/theme.ts:
  - Broken image URLs handled safely.
  - Missing fields produce safe defaults.

Manual test checklist:
- Modify theme in builder and compare Preview vs Runtime.
- Test with broken image URLs.
- Test dark/light variations if applicable.

------------------------------------------------
STEP 6 – Bug Hunter / Robustness
------------------------------------------------
While in this code:
- Identify any places where theme is obviously misused (hard-coded colors that should be themed).
- If safe and minimal, fix them; otherwise leave TODOs referencing THEME-001.
- Confirm there is no runtime crash if design_settings is null/undefined.

------------------------------------------------
STEP 7 – Build Log Entry
------------------------------------------------
Produce a BUILD_LOG entry:

- Date
- Ticket ID: THEME-001
- Short title
- 3–7 bullets:
  - Where normalization now happens.
  - Confirmation preview/runtime share the same pipeline.
  - Tests added/updated.
  - Any remaining limitations or TODOs.
