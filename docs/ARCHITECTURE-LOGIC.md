# Logic Engines Architecture (Evalia)

## Versions

### logicEngineV2 (Default)
- Very simple condition evaluator
- No AND/OR grouping
- No `contains`
- Frozen for backward compatibility

### logicEngineV3 (Optional Upgrade)
- Supports:
  - AND (`&&`)
  - OR (`||`)
  - `contains("qId","Value")` for multi-select or comma-separated answers
- Deterministic evaluation
- No parentheses; precedence is OR groups first, then AND within each group
- Versioned and stable (additive only)

## Why two versions?
- Freeze logic behavior for already-running surveys.
- Avoid breaking old templates.
- Allow future improvements without instability.

## Selection model
- Currently: runtime uses V2.
- Future: builder may allow selecting V3 for new templates.
- Versioning principle: never change existing engines; only add new ones.

## Single source of truth
This document is the canonical reference for logic engine behavior and versioning, mirroring the scoring engine documentation pattern.
