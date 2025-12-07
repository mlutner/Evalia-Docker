# Ticket AIQ-001: Question Quality Check Button (Builder V2)

> **Status:** Roadmap  
> **Phase:** Builder UX  
> **Priority:** Medium  
> **Created:** 2025-12-06

---

## Intent

Add one-click "Quality Check" for question wording in the builder to flag issues: leading, double-barrelled, unclear jargon.

---

## In Scope (Allowed)

### UI
- Add a small "Quality Check" icon/button inside `QuestionInspector` or `QuestionHeader`
- Lightweight popover/modal listing 1–3 issues
- Visual indicators for severity levels

### Backend
- New endpoint: `POST /api/ai/question_quality_check`
- Input: question text + type
- Output:
  ```typescript
  {
    issues: string[];
    severity: "info" | "warning" | "critical";
  }
  ```

### Integration
- Use existing AI service wrapper
- Follow design patterns from `ParticipationMetricsCard`

---

## Out of Scope (Forbidden)

- Automated rewriting suggestions (future AIQ-002)
- Bulk question review
- Deep psychometric analysis
- Changes to core scoring engine
- Database schema changes

---

## Acceptance Criteria

- [ ] Button displays for text/choice/rating questions
- [ ] Clicking triggers AI and shows issues within 2 seconds
- [ ] No changes made to question automatically
- [ ] Errors handled gracefully (timeout, API failure)
- [ ] Loading state shown during AI processing
- [ ] Severity color coding (info=blue, warning=amber, critical=red)

---

## Technical Notes

### Endpoint Design
```typescript
// Request
POST /api/ai/question_quality_check
{
  questionText: string;
  questionType: QuestionType;
  context?: {
    surveyTitle?: string;
    categoryName?: string;
  };
}

// Response
{
  issues: [
    "This appears to be a double-barrelled question",
    "Consider simplifying technical jargon"
  ],
  severity: "warning"
}
```

### Quality Checks to Implement
- Leading questions (biased wording)
- Double-barrelled questions (two questions in one)
- Jargon/unclear terminology
- Overly long questions
- Ambiguous response options

---

## Required Files to Modify

1. `server/routes/ai.ts` (add endpoint)
2. `server/services/aiService.ts` (add quality check function)
3. `client/src/components/builder-v2/QuestionInspector.tsx` (add button)
4. `client/src/components/builder-v2/QualityCheckPopover.tsx` (new)
5. `docs/BUILD_LOG.md`

---

## Dependencies

- Existing AI service infrastructure
- Builder V2 component patterns

---

**End of Ticket**

