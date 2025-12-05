# Evalia Project Plan

> Last Updated: 2025-12-05  
> Status: Active Development

---

## 🔄 Currently In Progress

### Logic & Scoring Validation System
**Status:** Phase 4-5 Complete, Phase 6 Pending

| Task | Status | Notes |
|------|--------|-------|
| Architecture audit (`LOGIC_SCORING_ARCHITECTURE.md`) | ✅ Done | Full type/flow mapping |
| Logic validator (`logicValidator.ts`) | ✅ Done | Graph-based, detects cycles, missing targets |
| Scoring validator (`scoringValidator.ts`) | ✅ Done | Band gaps, overlaps, category usage |
| Combined validator (`surveyValidator.ts`) | ✅ Done | Pre-publish validation |
| Test suite for validators | ✅ Done | Logic + scoring test coverage |
| Validation UX badges | ✅ Done | Issue counts in mode toggle |
| Validation issues modal | ✅ Done | Publish failure with jump-to links |
| Audit logging | ✅ Done | Scoring events, feature-flagged |
| **Wire validation into save/publish** | 🔲 TODO | Call validators before persisting |
| **Surface issues in Logic tab left panel** | 🔲 TODO | Dots on rules with issues |
| **Surface issues in Scoring tab** | 🔲 TODO | Icons on categories/bands |

---

## ✅ Recently Completed

### Builder V2 – UI Polish (2025-12-05)
- [x] Consistent section headers (Build/Logic/Scoring)
- [x] Understated typography (15px titles, 13px context)
- [x] Standardized panel widths (280px/320px)
- [x] Refined button styling (less "AI-generated" look)
- [x] Card styling updates (rounded-xl, subtle shadows)

### Logic Question Timeline
- [x] Visual timeline of questions with logic badges
- [x] SVG connector lines (trigger → target)
- [x] Dual highlighting (purple trigger, blue target)
- [x] Hover tooltips on logic badges

### Scoring UI Restructure
- [x] 3-panel layout matching Logic mode
- [x] ScoringNavigator (left panel)
- [x] Category/band selection → filtered center panel
- [x] Question cards matching builder style

### Template Logic Rules Fix
- [x] Corrected condition format for `validateLogicRules`
- [x] Fixed template import to preserve `logicRules`
- [x] Redesigned adaptive engagement template logic
- [x] Clarified turnover risk two-path structure

---

## 📋 Product Roadmap

### Phase 0: Analytics Ecosystem (Priority Focus)

> **"The builder is no longer the bottleneck. The bottleneck is analytics, distribution, reporting, admin control."**

#### 1. Survey Analytics Dashboard (Per Survey)
| Section | Priority | Status | Notes |
|---------|----------|--------|-------|
| **Participation Metrics** | High | 🔲 TODO | Response rate, drop-off, completion time |
| **Category Score Visualization** | High | 🔲 TODO | Bar charts, heatmap by category |
| **Band Distribution Chart** | High | 🔲 TODO | Pie/donut showing % in each band |
| **Question-Level Summary Table** | High | 🔲 TODO | Score per question, response distribution |
| **Open-Text Preview** | Medium | 🔲 TODO | Keywords, sentiment (optional AI) |
| **Filter Sidebar** | High | 🔲 TODO | Department, date range, role, custom fields |
| **Tab Navigation** | High | 🔲 TODO | Overview, Participation, Categories, Questions, Comments, Export |

**UI Requirements:**
- Match builder layout spacing + typography
- Card-based metrics with trend arrows and deltas
- Responsive tables with sorting/filtering

#### 2. Global Analytics Overview Page
| Feature | Priority | Status |
|---------|----------|--------|
| Total surveys count | High | 🔲 TODO |
| Active surveys count | High | 🔲 TODO |
| Total responses (last 30 days) | High | 🔲 TODO |
| Avg responses per survey | Medium | 🔲 TODO |
| Trend indicators (↑↓) | Medium | 🔲 TODO |
| Recent surveys list | High | 🔲 TODO |
| Mini sparkline charts | Medium | 🔲 TODO |
| Organization health score | Low | 🔲 Backlog |

#### 3. Response Browser
| Feature | Priority | Status |
|---------|----------|--------|
| Paginated response table | High | 🔲 TODO |
| Per-response detail panel | High | 🔲 TODO |
| Link to scoring results | High | 🔲 TODO |
| CSV export | High | 🔲 TODO |
| Filters (date, status, band) | High | 🔲 TODO |
| Bulk actions (delete, export) | Medium | 🔲 TODO |
| Search by respondent | Medium | 🔲 TODO |

#### 4. Admin Panel
| Section | Priority | Status |
|---------|----------|--------|
| **Organization Settings** | High | 🔲 TODO |
| - Branding (logo, colors) | Medium | 🔲 TODO |
| - Default survey settings | Medium | 🔲 TODO |
| **Survey Settings** | High | 🔲 TODO |
| - Status management | High | 🔲 TODO |
| - Response limits | Medium | 🔲 TODO |
| **Distribution Options** | High | 🔲 TODO |
| - Email templates | Medium | 🔲 TODO |
| - Reminder schedules | Medium | 🔲 TODO |
| **User Management** | High | 🔲 TODO |
| - Invite users | High | 🔲 TODO |
| - Role assignment | High | 🔲 TODO |
| **Data Export Policies** | Medium | 🔲 TODO |
| - Retention settings | Low | 🔲 Backlog |
| - GDPR compliance | Medium | 🔲 TODO |

#### 5. Data Layer Requirements
| Task | Priority | Status | Notes |
|------|----------|--------|-------|
| `response_metadata` table | High | 🔲 TODO | Device, location, completion time |
| `survey_versions` table | High | 🔲 TODO | Track published versions |
| ScoreConfig versioning | High | 🔲 TODO | Immutable historical scores |
| Analytics indexes | High | 🔲 TODO | For large-scale queries |
| Aggregation views/functions | Medium | 🔲 TODO | Pre-computed summaries |
| Data archival strategy | Low | 🔲 Backlog | |

---

### Phase 1: Core Stability

#### Publishing Workflow
| Task | Priority | Complexity | Status |
|------|----------|------------|--------|
| Pre-publish validation gate | High | Low | 🔲 TODO |
| Survey status management (Draft → Active → Closed) | High | Medium | 🔲 TODO |
| Publish confirmation dialog | Medium | Low | 🔲 TODO |
| Schedule publish (future date) | Low | Medium | 🔲 Backlog |
| Version history on publish | Medium | Medium | 🔲 Backlog |

#### Distribution & Access
| Task | Priority | Complexity | Status |
|------|----------|------------|--------|
| Shareable survey URLs | High | Low | ⚡ Exists |
| URL shortening / custom slugs | Medium | Medium | 🔲 TODO |
| Access codes (private surveys) | Medium | Medium | 🔲 TODO |
| QR code generation | Low | Low | 🔲 Backlog |
| Response tracking (UTM params) | Medium | Medium | 🔲 TODO |
| Link expiration | Low | Medium | 🔲 Backlog |

#### Respondent Identity Modes
| Task | Priority | Complexity | Status |
|------|----------|------------|--------|
| Anonymous mode | High | Low | ⚡ Exists |
| Email-identified mode | High | Medium | 🔲 TODO |
| Login-required mode | Medium | High | 🔲 Backlog |
| GDPR consent flow | Medium | Medium | 🔲 TODO |
| Prevent duplicate responses | Medium | Medium | 🔲 TODO |

### Phase 2: Collaboration & Sharing

#### Collaboration & Permissions
| Task | Priority | Complexity | Status |
|------|----------|------------|--------|
| Multi-user workspaces | High | High | 🔲 TODO |
| Role-based permissions (Admin/Editor/Viewer) | High | High | 🔲 TODO |
| Survey sharing within org | Medium | Medium | 🔲 TODO |
| Activity audit log | Low | Medium | 🔲 Backlog |
| Comments/annotations on questions | Low | Medium | 🔲 Backlog |

#### Results Sharing & Export
| Task | Priority | Complexity | Status |
|------|----------|------------|--------|
| Public results link | Medium | Low | 🔲 TODO |
| PDF export | High | Medium | 🔲 TODO |
| CSV/Excel export | High | Low | 🔲 TODO |
| PowerPoint export | Medium | High | 🔲 Backlog |
| Scheduled report emails | Low | Medium | 🔲 Backlog |
| Embed results widget | Low | High | 🔲 Backlog |

### Phase 3: Polish & Accessibility

#### Accessibility & Mobile
| Task | Priority | Complexity | Status |
|------|----------|------------|--------|
| WCAG 2.1 AA compliance audit | High | Medium | 🔲 TODO |
| Screen reader testing | High | Medium | 🔲 TODO |
| Keyboard navigation | High | Medium | 🔲 TODO |
| Mobile-first survey taking | High | Medium | ⚡ Partial |
| Mobile builder (tablet) | Low | High | 🔲 Backlog |
| High contrast mode | Medium | Low | 🔲 Backlog |

---

## 🔧 Technical Roadmap

### Immediate (Next Sprint)

#### Wire Validation Into Builder
```
Files: SurveyBuilderContext.tsx, BuilderActionBar.tsx
- Call validateSurveyBeforePublish() before save mutation
- Show ValidationIssuesModal on errors
- Block publish if validation.canPublish === false
```

#### ScoreConfig Versioning
```
- Add score_config_versions table
- Snapshot config on publish
- Link responses to version_id
- Historical scores become immutable
```

### Short-term (This Month)

#### Backend Hardening
| Task | Status | Notes |
|------|--------|-------|
| Rate limiting on public endpoints | 🔲 TODO | |
| Request validation (Zod on routes) | 🔲 TODO | |
| Error standardization | 🔲 TODO | |
| Database connection pooling | 🔲 TODO | |
| Graceful shutdown handling | 🔲 TODO | |

#### Logging & Monitoring
| Task | Status | Notes |
|------|--------|-------|
| Structured logging (pino/winston) | 🔲 TODO | |
| Request tracing | 🔲 TODO | |
| Error reporting (Sentry?) | 🔲 TODO | |
| Health check endpoints | ⚡ Exists | `/healthz` |
| Metrics collection | 🔲 Backlog | |

#### Performance
| Task | Status | Notes |
|------|--------|-------|
| Load testing (100+ concurrent) | 🔲 TODO | |
| Query optimization | 🔲 TODO | |
| Response caching | 🔲 Backlog | |
| Asset CDN | 🔲 Backlog | |

### Medium-term (This Quarter)

#### Hosting Architecture
| Task | Status | Notes |
|------|--------|-------|
| Production deployment strategy | 🔲 TODO | Beyond Replit |
| Database hosting (managed Postgres) | 🔲 TODO | |
| File storage (S3/R2) | 🔲 TODO | |
| CI/CD pipeline | 🔲 TODO | |
| Staging environment | 🔲 TODO | |
| Backup & recovery | 🔲 TODO | |

---

## 🚀 Differentiators

### AI Insights (Beyond Generation)
| Feature | Priority | Status |
|---------|----------|--------|
| Response sentiment analysis | High | 🔲 TODO |
| Automatic insight extraction | High | 🔲 TODO |
| Anomaly detection (outliers) | Medium | 🔲 Backlog |
| Trend identification | Medium | 🔲 Backlog |
| AI-generated executive summary | High | 🔲 TODO |
| Question performance scoring | Medium | 🔲 TODO |

### Benchmarking
| Feature | Priority | Status |
|---------|----------|--------|
| Industry benchmark database | High | 🔲 TODO |
| Compare to past surveys | Medium | 🔲 TODO |
| Percentile ranking | Medium | 🔲 TODO |
| Benchmark visualization | Medium | 🔲 TODO |

### Multi-Language
| Feature | Priority | Status |
|---------|----------|--------|
| Survey translation workflow | Medium | 🔲 TODO |
| AI-assisted translation | Medium | 🔲 TODO |
| Language detection | Low | 🔲 Backlog |
| RTL support | Low | 🔲 Backlog |

### Integrations
| Integration | Priority | Status |
|-------------|----------|--------|
| Slack notifications | Medium | 🔲 TODO |
| Microsoft Teams | Medium | 🔲 TODO |
| Zapier | High | 🔲 TODO |
| Webhooks | High | 🔲 TODO |
| SSO (SAML/OIDC) | Medium | 🔲 TODO |
| HRIS integrations | Low | 🔲 Backlog |

---

## 📊 Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Complete |
| ⚡ | Exists/Partial |
| 🔲 | TODO |
| 🚧 | In Progress |
| ❌ | Blocked |

---

## 🎯 Sprint Goals

### Current Sprint (Week of 2025-12-05)
1. ~~Logic & Scoring validation layer~~ ✅
2. ~~Validation UX (badges, modal)~~ ✅
3. ~~Audit logging~~ ✅
4. Wire validation into save/publish flow
5. Surface issues in Logic/Scoring tabs

### Next Sprint: Analytics Foundation
1. **Survey Analytics Dashboard** (core layout + participation metrics)
2. **Response Browser** (table + detail panel)
3. ScoreConfig versioning (DB schema + migration)
4. Data layer: `response_metadata` table

### Sprint +2: Analytics Complete
1. Category score visualization
2. Band distribution charts
3. Question-level summary
4. Global Analytics Overview page
5. CSV export

### Sprint +3: Admin & Distribution
1. Admin Panel (org settings, user management)
2. Distribution options (email templates, reminders)
3. Publishing workflow refinement

---

## Notes

- Keep diffs small and focused
- Do not modify scoring engines without versioning
- All new features behind feature flags where appropriate
- Document architectural decisions in `docs/architecture/`

