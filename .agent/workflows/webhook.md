---
description: Implement webhook firing on response submission
---

Ticket ID: WEBHOOK-001
Title: Implement webhook firing on response submission

Context:
- We want Evalia to notify external systems when a survey response is submitted.
- This should be done via an HTTP webhook:
  - Triggered after a response is successfully stored (and scored, if applicable).
  - Non-blocking: failures must not prevent the respondent from completing the survey.
- No webhook implementation exists yet, or it is only partially stubbed.

Goal (definition of done):
- On successful response submission:
  - A webhook is fired for surveys that have webhook configuration enabled.
- Webhook behaviour:
  - Fire-and-forget (or queued) so the user is not blocked.
  - Includes a minimal, privacy-aware payload.
  - Respects retries / error handling in a simple but robust way.
- Configuration is explicit and safe:
  - Webhook URLs are not hard-coded.
  - Per-survey or per-tenant configuration is used, depending on existing data model.

Flows affected:
- Response submission endpoint (server/routes/responses.ts or equivalent).
- Possibly survey configuration schema/storage (to add webhook settings).
- Error logging / observability (basic logging for failed webhook calls).

------------------------------------------------
STEP 1 – Architect Analysis (read-only)
------------------------------------------------
1. Locate:
   - Response submission route(s) (e.g., POST /api/surveys/:id/responses).
   - The code that:
     - Validates the response.
     - Computes scoring.
     - Stores the response and scoring results.
   - Any existing webhook-related config or TODOs in the code.

2. Identify where in the flow a webhook SHOULD be triggered:
   - After:
     - Survey existence and permission checks.
     - Response persisted successfully.
     - Scoring computed and linked to score_config_version_id (if scoring enabled).

3. Identify configuration options:
   - Does survey schema already have any integration/webhook fields?
   - If not, note that a minimal new field (e.g. survey.webhookConfig or survey.webhookUrl) might be needed.
   - Respect existing schema invariants; if a migration is required, design it minimally.

------------------------------------------------
STEP 2 – Constraints & Invariants
------------------------------------------------
You MUST:
- Keep response submission success independent from webhook success.
- Ensure no PII or sensitive free-text is sent unless explicitly required; prefer IDs and aggregate info.
- Use existing logging / audit patterns if available.

You MUST NOT:
- Block or roll back the respondent’s submission if the webhook fails.
- Introduce heavy frameworks or queues without explicit need; prefer a small, composable abstraction first.

If a DB migration or schema change is required:
- Design it clearly in-code comments (e.g., migrations/xxxx_add_webhook_config.sql).
- Keep it minimal and backward compatible.

------------------------------------------------
STEP 3 – Implementation Plan (minimal diff)
------------------------------------------------
Plan:
- Define where webhook configuration lives:
  - Option A: in the survey record (e.g., survey.settings.webhookConfig).
  - Option B: in a separate table if the data model already has integration configs.
- Define a small TypeScript type for webhook settings, e.g.:
  - enabled: boolean
  - url: string
  - secret?: string (for signing)
- Add a small utility to build and send webhook payloads.

List target files (e.g.):
- shared/schema.ts (ONLY if absolutely required to add webhookConfig, and in a minimal way).
- server/routes/responses.ts (add webhook trigger).
- server/utils/webhooks.ts (new file for sending logic).
- migrations/xxxx_add_webhook_config.sql (if schema change required).

------------------------------------------------
STEP 4 – Code Changes
------------------------------------------------
- Implement a small `sendResponseWebhook` helper that:
  - Accepts survey and response metadata (IDs, timestamps, maybe aggregate score, NOT full PII).
  - Sends an HTTP POST to the configured webhook URL with a JSON payload.
  - Handles network errors gracefully (logs, no throw that breaks the request).

- In the response submission route:
  - After successful DB write (and scoring), call `sendResponseWebhook` in a fire-and-forget manner:
    - Synchronous but non-blocking error handling, OR
    - Offload to a simple queue if one already exists.

- Ensure the webhook only fires when:
  - Webhook config exists and is enabled for that survey.
  - URL is valid (basic sanity check).

------------------------------------------------
STEP 5 – Tests
------------------------------------------------
Add/update tests to cover:

1) Survey with no webhook config:
   - Submission works as today.
   - No webhook attempts.

2) Survey with webhook enabled and valid URL:
   - Submission works.
   - Webhook helper is called with expected payload shape.
   - If you can, mock network call and assert the POST is made once.

3) Webhook failure (network error or non-2xx):
   - Submission still succeeds.
   - Error is logged (or recorded) but not thrown to the client.

Where possible, use existing test patterns from server-side tests.

------------------------------------------------
STEP 6 – Bug Hunter / Robustness
------------------------------------------------
While in this area:
- Confirm that response submission already logs scoring completion or key events; align webhook logging with this if relevant.
- Ensure that score_config_version_id and other critical IDs are preserved and not altered by the new code.
- Identify any security concerns (e.g. sending secrets or PII) and keep payload minimal and safe.

------------------------------------------------
STEP 7 – Build Log Entry
------------------------------------------------
Produce a ready-to-paste docs/BUILD_LOG.md entry:

- Date
- Ticket ID: WEBHOOK-001
- Short title
- 3–7 bullets:
  - Where webhook config lives.
  - When the webhook is fired in the submission flow.
  - Payload summary (no PII policy).
  - Tests added/updated.
  - Any follow-up ideas (e.g., retry queues, per-tenant settings).
