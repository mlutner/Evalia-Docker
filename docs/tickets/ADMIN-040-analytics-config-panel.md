# Ticket ADMIN-040: Analytics Configuration Panel

> **Status:** Roadmap  
> **Epic:** ADMIN-000 (Admin Configuration Panel)  
> **Priority:** Medium  
> **Created:** 2025-12-06

---

## Goal

Enable admins to control which analytics modules are active and what terminology is used. This supports white-label deployments and per-organization customization.

---

## Why (Context)

Different clients have different needs:

- Some may not want to show "Burnout Risk" dimension
- White-label clients need custom terminology
- Some organizations want only specific analytics tabs
- Enterprise clients may want custom dimension names

This ticket provides the configuration layer for analytics customization.

**Dependencies:** ADMIN-010 (dimension names to customize)  
**Blocks:** None

---

## In Scope (Allowed)

### Database
- New table: `analytics_settings` (id, survey_id?, org_id?, settings_json, created_at, updated_at)

### Backend
- `server/routes/admin/analyticsSettings.ts` (create new)
- `server/services/analyticsSettings/*` (create new)
- CRUD settings per survey or per organization
- Settings merge logic: org defaults → survey overrides

### Shared Types
- `shared/analyticsSettings.ts` (create new - settings DTOs)

### Frontend
- `client/src/admin/analytics-settings/*` (create new)
- Toggle visibility of:
  - Insight Dimensions (per dimension)
  - Domain-level views
  - Manager segmentation
  - Trends tab
  - Export tab
- Customize terminology:
  - Dimension labels
  - Tab names
  - Card titles
- Brand/white-label configuration

---

## Out of Scope (Forbidden)

- Interpretation engine rules (ADMIN-050)
- Export features (ANAL-009)
- Core scoring engine (`src/core/scoring/*`)
- Logic runtime (`src/core/logic/*`)
- SurveyView runtime
- Analytics API contracts (metric IDs, response shapes)

---

## Acceptance Criteria

- [ ] Admin can modify analytics visibility settings
- [ ] Admin can customize terminology/labels
- [ ] Settings can be set at organization level (default for all surveys)
- [ ] Settings can be overridden per survey
- [ ] Settings merge correctly: org defaults + survey overrides
- [ ] All settings persist and load into AnalyticsPage
- [ ] Analytics UI adapts dynamically based on settings
- [ ] Hidden dimensions don't appear in any analytics view
- [ ] Custom labels replace default labels throughout UI
- [ ] API returns merged settings for any survey

---

## Required Files to Modify/Create

1. `server/db/migrations/XXXX_add_analytics_settings.sql` (new)
2. `server/routes/admin/analyticsSettings.ts` (new)
3. `server/services/analyticsSettings/settingsService.ts` (new)
4. `shared/analyticsSettings.ts` (new)
5. `client/src/admin/analytics-settings/SettingsPanel.tsx` (new)
6. `client/src/admin/analytics-settings/VisibilityToggles.tsx` (new)
7. `client/src/admin/analytics-settings/TerminologyEditor.tsx` (new)
8. `client/src/admin/analytics-settings/index.ts` (new)
9. `client/src/pages/AnalyticsPage.tsx` (add settings integration)
10. `docs/BUILD_LOG.md`

---

## Suggested Implementation Steps

1. Design settings schema and merge logic
2. Create database migration
3. Implement backend service with merge logic
4. Create API routes
5. Create shared DTOs
6. Build admin UI: visibility toggles
7. Build admin UI: terminology editor
8. Integrate settings into AnalyticsPage
9. Test settings inheritance (org → survey)
10. Write integration tests
11. Update BUILD_LOG.md

---

## Settings Schema (Example)

```typescript
interface AnalyticsSettings {
  visibility: {
    dimensions: {
      leadership: boolean;
      wellbeing: boolean;
      burnout: boolean;
      psychSafety: boolean;
      engagement: boolean;
    };
    tabs: {
      overview: boolean;
      domains: boolean;
      managers: boolean;
      trends: boolean;
      export: boolean;
    };
    features: {
      bandDistribution: boolean;
      scoreDistribution: boolean;
      managerComparison: boolean;
    };
  };
  terminology: {
    dimensions: {
      leadership?: string; // Override label
      wellbeing?: string;
      // ...
    };
    tabs: {
      overview?: string;
      domains?: string;
      // ...
    };
  };
  branding: {
    primaryColor?: string;
    logoUrl?: string;
  };
}
```

---

## Test Plan

1. **Unit tests:**
   - Settings merge logic
   - Default values applied correctly
   - Override precedence

2. **Integration tests:**
   - API returns merged settings
   - Hidden dimensions not exposed
   - Custom labels propagate

3. **Manual testing:**
   - Set org-level defaults
   - Override for specific survey
   - Verify AnalyticsPage respects settings
   - Test all visibility toggles

---

## Completion Checklist

- [ ] Code compiles (`npm run check`)
- [ ] No forbidden files changed
- [ ] Behavior matches Acceptance Criteria
- [ ] Settings merge correctly
- [ ] AnalyticsPage respects all settings
- [ ] Admin UI accessible and functional
- [ ] Builder + runtime tested manually
- [ ] BUILD_LOG.md updated
- [ ] Committed with descriptive message

---

**End of Ticket**

