# Ticket MULTI-001: Data Model for Consultant → Org → Survey Hierarchy

> **Status:** Roadmap  
> **Phase:** Consultant Mode / Multi-Tenant  
> **Priority:** High  
> **Created:** 2025-12-06

---

## Intent

Prepare the architecture for consultant-led multi-client accounts. Consultants can manage multiple organizations, each with their own surveys.

---

## In Scope (Allowed)

### Database Schema
```sql
-- Consultants table
CREATE TABLE consultants (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id),
  company_name VARCHAR,
  subscription_tier VARCHAR DEFAULT 'starter',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Organizations table
CREATE TABLE organizations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id VARCHAR REFERENCES consultants(id),
  name VARCHAR NOT NULL,
  industry VARCHAR,
  employee_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Update surveys table
ALTER TABLE surveys
ADD COLUMN organization_id VARCHAR REFERENCES organizations(id);
```

### Access Control
- New middleware layer for authorization
- Consultant can only see their orgs
- Org admins can only see their surveys
- Proper scoping on all API endpoints

### Backend Updates
- Update existing survey fetch logic to respect hierarchy
- Add organization context to analytics

---

## Out of Scope (Forbidden)

- UI for consultant dashboard (future MULTI-002)
- Cross-client analytics (future MULTI-003)
- Billing/subscription management
- User invitation flows
- Changes to scoring engine

---

## Acceptance Criteria

- [ ] Create tables & migrations
- [ ] Consultant account can own many orgs
- [ ] Org can have many surveys
- [ ] Access control enforced server-side
- [ ] Existing surveys work without organization (backwards compatible)
- [ ] API endpoints scoped correctly
- [ ] Tests for access control

---

## Technical Notes

### Middleware Pattern
```typescript
// server/middleware/consultantAuth.ts
export function requireConsultantAccess(req, res, next) {
  const consultantId = req.user.consultantId;
  const requestedOrgId = req.params.organizationId;
  
  // Verify consultant owns this org
  const org = await db.query.organizations.findFirst({
    where: and(
      eq(organizations.id, requestedOrgId),
      eq(organizations.consultantId, consultantId)
    )
  });
  
  if (!org) return res.status(403).json({ error: 'Forbidden' });
  next();
}
```

### Route Updates Required
- `GET /api/surveys` → filter by org if consultant
- `GET /api/surveys/:id` → verify org access
- `GET /api/analytics/*` → verify org access

---

## Required Files to Modify

1. `server/db/migrations/XXXX_add_consultant_hierarchy.sql` (new)
2. `shared/schema.ts` (add tables)
3. `server/middleware/consultantAuth.ts` (new)
4. `server/routes/surveys.ts` (add org filtering)
5. `server/routes/organizations.ts` (new)
6. `server/routes/consultants.ts` (new)
7. `docs/BUILD_LOG.md`

---

## Migration Strategy

1. Create new tables
2. Add `organization_id` to surveys (nullable for backwards compatibility)
3. Existing surveys remain accessible without org
4. New surveys can optionally have org
5. Future: require org for consultant accounts

---

**End of Ticket**

