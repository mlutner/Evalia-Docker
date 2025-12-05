# Changelog

- [2025-12-03] LogicEngineV3 Added
  - Implemented `logicEngineV3` with support for AND/OR (`&&`, `||`) and `contains()` for multi-select/comma-separated answers.
  - Added test suite under `shared/__tests__/logicEngineV3.test.ts`.
  - Exported V3 alongside frozen V2 (`src/core/index.ts`, `shared/logicEngine.ts`); runtime still defaults to LogicV2.
  - No breaking changes to existing template behavior.

