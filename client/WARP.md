# Warp Code Assistant Rules – Evalia

Warp must follow these rules for ANY code operations (search, replace, refactor, generation).

---

## 1. Core Principles

Warp exists to **maintain consistency, prevent drift**, and **validate correctness**.
Warp should flag inconsistencies when code diverges from the architecture.

---

## 2. What Warp Should Always Check

### Code Organization
- Files follow the project folder conventions
- No new question UI code outside `QuestionRenderer`
- No hard-coded colors

### Schema Consistency
- BuilderQuestion fields match RuntimeQuestion fields via `toRuntimeQuestion()`
- Questions respect the canonical Zod schema
- Survey objects are normalized

### Architecture Enforcement
- Only `QuestionRenderer` is used for question UI
- No duplicate question rendering functions anywhere
- Preview and Runtime use the same rendering pipeline

### Visual Consistency
- Tailwind tokens match the design system
- No unapproved color values
- No duplicated UI components

---

## 3. Safe Warp Actions

Warp is allowed to:

- Search for hard-coded values, especially colors
- Identify duplicated functions or components
- Flag broken imports or unused files
- Suggest refactors that reduce file size or improve clarity
- Suggest better file placement according to the architecture
- Map untyped objects to TypeScript types

---

## 4. Unsafe Warp Actions (Require Permission)

Warp must NOT automatically:

- Delete or rename files
- Restructure directories
- Replace question rendering logic
- Modify the SurveyBuilderContext
- Change backend API behavior
- Add new DB fields
- Update Prisma schema

Warp may suggest these only with explicit user approval.

---

## 5. Warp Usage Templates

### 🔍 Search for UI drift:
```shell
warp search "className=" --exclude node_modules
```

### 🎨 Search for hard-coded colors:
```shell
warp search "#[0-9A-Fa-f]{6}" --files src/**/*.{tsx,ts}
```

### 🧪 Validate question rendering paths:
```shell
warp search "QuestionInput"
warp search "renderQuestion"
warp search "switch (question.type"
```

### 📦 Identify dead or legacy code:
```shell
warp search "QuestionPreview"
warp search "SurveyView"
warp search "Wizard"
```

---

## 6. Warp Must Validate After Any Edit

Warp should automatically check:
- `tsc --noEmit`
- `pnpm lint`
- `pnpm format`
- UI components for broken imports

---

## 7. Warp Best Practices

When Warp modifies or inspects code, it must:

- Prefer incremental edits over rewrites
- Respect existing patterns
- Annotate unclear areas with TODO comments
- Avoid changes in files not related to the edit request

---

**End of Warp Rules.**
