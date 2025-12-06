# Ticket SCORE-001: ScoreConfig Versioning

## Goal

Implement score configuration versioning so historical response scores remain stable when admins edit scoring config.

## Why (Context)

Without versioning, if an admin changes band thresholds or category weights, all historical scores would retroactively change. This makes analytics meaningless and breaks audit trails. Enterprise customers require immutable historical data.

## In Scope (Allowed)

- `shared/schema.ts` (add `scoreConfigVersions` table + type)
- `migrations/` (new migration file)
- `server/storage.ts` (add version CRUD functions)
- `server/routes/surveys.ts` (snapshot config on status change to Active)
- `server/routes/responses.ts` (link response to version ID)

## Out of Scope (Forbidden)

- Core scoring engine logic (`src/core/scoring/scoringEngineV1.ts`)
- Logic runtime (`src/core/logic/*`)
- Builder UI components
- SurveyView runtime flow

## Acceptance Criteria

- [ ] `score_config_versions` table created with: id, survey_id, version_number, config_snapshot, created_at
- [ ] When survey status changes to "Active", snapshot current scoreConfig
- [ ] Each response stores `score_config_version_id`
- [ ] Scoring uses the version's config, not live survey config
- [ ] Version number auto-increments per survey
- [ ] Migration runs without data loss

## Required Files to Modify

1. `shared/schema.ts` (table + types)
2. `migrations/0002_add_score_config_versions.sql` (new)
3. `server/storage.ts` (createScoreConfigVersion, getScoreConfigVersion)
4. `server/routes/surveys.ts` (snapshot on publish)
5. `server/routes/responses.ts` (use version for scoring)

## Suggested Implementation Steps

1. Add `scoreConfigVersions` table to schema.ts
2. Create migration SQL file
3. Add storage functions for version CRUD
4. Modify survey update route to snapshot on Active status
5. Modify response creation to use versioned config
6. Add `score_config_version_id` column to responses table
7. Test with existing survey data
8. Stop and await review

## Test Plan

1. Create survey with scoring enabled, publish it
2. Verify `score_config_versions` row created
3. Submit response, verify `score_config_version_id` set
4. Edit survey scoring config, re-publish
5. Verify new version created (version_number = 2)
6. Submit another response, verify it uses version 2
7. Check old response still references version 1

## Completion Checklist

- [x] Code compiles (`npm run check`) - pre-existing errors only
- [x] Migration runs successfully
- [x] No forbidden files changed
- [x] Versions created on publish
- [x] Responses link to versions
- [x] Historical scores unchanged (by design - versions are immutable)
- [x] BUILD_LOG.md updated
- [x] Committed with `[SCORE-001]` prefix

## Implementation Notes (2025-12-06)

**Files Changed:**
- `shared/schema.ts` - Added `scoreConfigVersions` table and `scoreConfigVersionId` to responses
- `migrations/0002_add_score_config_versions.sql` - Full migration script
- `server/storage.ts` - Added version CRUD methods to both `MemStorage` and `DbStorage`
- `server/routes/surveys.ts` - Auto-creates version on publish (status -> "Active")
- `server/routes/responses.ts` - Links responses to latest version ID

**Status: ✅ COMPLETE & TESTED**

**Test Results (2025-12-05):**
- Migration ran successfully on local Postgres
- Version 1 created when survey published (status → "Active")
- Version 2 created on re-publish
- Response 1 correctly linked to version 1
- Response 2 correctly linked to version 2
- All categories/bands preserved in JSONB snapshot

