# Theme & Design Flow

This flow covers how theme/design settings are authored, normalized, previewed, saved, and used at runtime.

## Key invariants / decisions
- DesignV2 and PreviewV2 normalize header/background images via `normalizeThemeImages` / `useNormalizedTheme` (collapsing `headerImage`/`headerImageUrl`/`{url}` into safe URL fields).
- Runtime SurveyView also uses the same normalization, so header/background images are safe before rendering.
- Background images apply only when a URL exists; solid colors are preserved.
- Design settings persist to `surveys.design_settings` JSONB and are read at runtime.

```mermaid
flowchart LR
  A[Edit design in DesignV2] --> B[State in useSurveyBuilder (design_settings)]
  B --> C[normalizeThemeImages/useNormalizedTheme\n(flat headerImageUrl/backgroundImageUrl)]
  C --> D[Render previews (Welcome/Survey/ThankYou) safely]
  B --> E[Save -> surveys.design_settings JSONB]
  E --> F[Runtime /survey/:id uses stored design\n(with the same normalization)]
```
