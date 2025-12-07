# Ticket ADMIN-060: Model Validation Console (Internal Dev Tools)

> **Status:** Roadmap  
> **Epic:** ADMIN-000 (Admin Configuration Panel)  
> **Priority:** Low  
> **Created:** 2025-12-06

---

## Goal

Provide internal-only tools for validating, debugging, and maintaining the Scoring Model Registry and scoring pipeline integrity. These tools are for Evalia developers, not end users.

---

## Why (Context)

As the scoring and analytics systems grow in complexity, developers need tools to:

- Validate scoring configuration integrity
- Debug scoring calculation issues
- View detailed scoring logs
- Migrate legacy surveys to new systems
- Rebuild analytics caches after fixes

These tools must be hidden from end users and require internal authentication.

**Dependencies:** None  
**Blocks:** None

---

## In Scope (Allowed)

### Backend
- `server/routes/admin/devTools.ts` (create new)
- `server/services/devTools/*` (create new)
- Internal auth flag check (must be internal user)
- Tools:
  - Validate scoring version integrity
  - Preview scoring calculation pipeline for a response
  - View scoring logs (filtered by survey/response)
  - Migrate legacy surveys (batch update tool)
  - Flush/rebuild analytics caches
  - Test dimension mappings
  - Verify band coverage

### Frontend
- `client/src/admin/dev-tools/*` (create new)
- Tools panel with:
  - Validation runner
  - Scoring pipeline inspector
  - Log viewer
  - Migration tool
  - Cache management

### Access Control
- Internal auth flag required
- Not shown in production to regular admins
- Audit logging for all operations

---

## Out of Scope (Forbidden)

- Any customer-facing UI
- Modifying scoring engine behavior
- Changing analytics calculations
- Core scoring engine (`src/core/scoring/*`) - read only
- Logic runtime (`src/core/logic/*`)
- SurveyView runtime

---

## Acceptance Criteria

- [ ] Dev tools panel is only accessible to internal users
- [ ] Not visible in production navigation for regular admins
- [ ] Internal admin can run validation tests on scoring config
- [ ] Internal admin can see scoring pipeline for a given response
- [ ] Internal admin can view scoring logs with filters
- [ ] Internal admin can trigger migrations safely
- [ ] Internal admin can flush/rebuild analytics caches
- [ ] All operations logged with timestamps and user
- [ ] Tools provide clear success/error feedback
- [ ] No data is modified without explicit confirmation

---

## Required Files to Modify/Create

1. `server/routes/admin/devTools.ts` (new)
2. `server/services/devTools/validationService.ts` (new)
3. `server/services/devTools/scoringInspector.ts` (new)
4. `server/services/devTools/migrationService.ts` (new)
5. `server/services/devTools/cacheService.ts` (new)
6. `client/src/admin/dev-tools/DevToolsPanel.tsx` (new)
7. `client/src/admin/dev-tools/ValidationRunner.tsx` (new)
8. `client/src/admin/dev-tools/ScoringInspector.tsx` (new)
9. `client/src/admin/dev-tools/LogViewer.tsx` (new)
10. `client/src/admin/dev-tools/MigrationTool.tsx` (new)
11. `client/src/admin/dev-tools/CacheManager.tsx` (new)
12. `client/src/admin/dev-tools/index.ts` (new)
13. `docs/BUILD_LOG.md`

---

## Suggested Implementation Steps

1. Implement internal auth flag check
2. Create dev tools API routes with auth
3. Implement validation service
4. Implement scoring pipeline inspector
5. Implement log viewer backend
6. Implement migration service (dry-run first)
7. Implement cache management
8. Build dev tools panel UI
9. Build individual tool components
10. Add confirmation dialogs for destructive operations
11. Add audit logging
12. Write integration tests
13. Update BUILD_LOG.md

---

## Tools Detail

### 1. Validation Runner
- Check all scoring versions for a survey
- Verify band coverage (no gaps)
- Verify category mappings exist
- Verify dimension mappings valid
- Report issues as warnings/errors

### 2. Scoring Pipeline Inspector
- Input: response ID
- Show: 
  - Raw answers
  - Category scores
  - Dimension scores
  - Band assignments
  - Version used
- Useful for debugging "why did this score happen?"

### 3. Log Viewer
- Filter by: survey ID, response ID, date range, severity
- Show: scoring events, errors, warnings
- Export as CSV

### 4. Migration Tool
- List legacy surveys needing migration
- Dry-run mode (show what would change)
- Execute migration with confirmation
- Rollback capability

### 5. Cache Manager
- Show cache status (analytics, scores)
- Invalidate specific caches
- Rebuild analytics for survey
- Monitor cache hit rates

---

## Test Plan

1. **Unit tests:**
   - Validation logic
   - Inspector data extraction
   - Migration transformations

2. **Integration tests:**
   - Auth flag correctly restricts access
   - Validation reports real issues
   - Cache operations work correctly

3. **Manual testing:**
   - Access dev tools as internal user
   - Run validation on test survey
   - Inspect scoring for a response
   - Verify logs display correctly

---

## Completion Checklist

- [ ] Code compiles (`npm run check`)
- [ ] No forbidden files changed
- [ ] Behavior matches Acceptance Criteria
- [ ] Internal auth enforced
- [ ] All tools functional
- [ ] Audit logging in place
- [ ] Confirmation dialogs for destructive ops
- [ ] Builder + runtime tested manually
- [ ] BUILD_LOG.md updated
- [ ] Committed with descriptive message

---

**End of Ticket**

