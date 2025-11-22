# Evalia - Survey Builder Project

## Project Overview
Evalia is an AI-powered survey builder for trainers to create, manage, and analyze surveys with a Typeform-inspired conversational interface. Features AI-assisted generation from documents, one-question-at-a-time UI, comprehensive analytics, and respondent tracking.

## Current Status (Nov 22, 2025)
- ✅ Core survey builder with AI assistance
- ✅ Response analytics with visual breakdown
- ✅ Respondent tracking system
- ✅ Response detail modal (click responses to view all answers)
- ✅ Email invitation infrastructure in place
- ⏳ Email sending: Configured to use Resend (awaiting API key setup)

## Recent Accomplishments
1. **Response Detail Modal** - Users can now click any response to view all answers in a modal
2. **Respondent Storage Fix** - Implemented full respondent persistence in MemStorage
3. **Email Service Infrastructure** - Added Resend email integration to invitation flow
4. **Code Refactoring** - Extracted ResponseDetailModal component, improved code reusability

## Architecture

### Data Layer
- **Storage**: Abstracted storage interface with MemStorage (dev) and DbStorage (production via Drizzle)
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: Located in `shared/schema.ts` with proper Zod validation

### Backend
- **Framework**: Express.js
- **Authentication**: Replit Auth (Google + Email/Password)
- **Email**: Resend service for transactional emails
- **Document Parsing**: OpenRouter Vision API (PDF), Mammoth (DOCX), native TXT
- **AI Integration**: OpenRouter for survey generation and refinement

### Frontend
- **Routing**: Wouter
- **UI Components**: shadcn components with Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Styling**: Dark mode support, consistent design system

## Key Routes

### Survey Management
- `POST /api/surveys` - Create survey
- `GET /api/surveys` - List all surveys
- `GET /api/surveys/:id` - Get single survey
- `PATCH /api/surveys/:id` - Update survey
- `DELETE /api/surveys/:id` - Delete survey

### Responses
- `POST /api/surveys/:id/responses` - Submit survey response
- `GET /api/surveys/:id/responses` - Get analytics/responses
- `DELETE /api/surveys/:id/responses/:responseId` - Delete response
- `POST /api/surveys/:id/responses/bulk-delete` - Bulk delete

### Respondents (Phase 4)
- `POST /api/surveys/:id/invite` - Invite respondents
- `GET /api/surveys/:id/respondents` - Get all respondents
- `DELETE /api/surveys/:id/respondents/:respondentId` - Remove respondent

## Email Integration (NEEDS SETUP)

### Current State
The email service is configured to use **Resend** for sending survey invitations. The infrastructure is in place:
- Email module: `server/email.ts` (ResendEmailService class)
- Route integration: `server/routes.ts` line 661-692
- Frontend UI: `client/src/pages/RespondentsPage.tsx` (invite dialog)

### What You Need To Do
1. **Get Resend API Key**:
   - Visit https://resend.com
   - Sign up for free account
   - Get your API key from dashboard

2. **Add to Environment**:
   - Set `RESEND_API_KEY` environment variable in Replit
   - Go to Secrets tab → Add secret `RESEND_API_KEY` → Paste your key

3. **Test It**:
   - Create a survey
   - Go to Respondents tab
   - Import/paste email addresses
   - Click "Invite Respondents"
   - Check that emails are sent (logs will show "✓ [RESEND] Invitation email sent to...")

### How It Works
1. User imports respondents (CSV, PDF, or paste)
2. User clicks "Invite Respondents"
3. Backend creates respondent records with unique tokens
4. Backend generates personalized survey URLs with token
5. Resend API sends branded invitation email
6. Respondent clicks email link → Opens survey with unique token
7. On completion → Marked as "Completed" in respondent tracking

## Known Issues

### LSP Type Errors (Non-Critical)
- 8 errors in `server/storage.ts` related to Drizzle type inference on survey creation/update
- These don't affect functionality - app runs fine
- Root cause: Drizzle's strict typing on optional fields with array/object types
- Will be fixed when refactoring storage layer

### 5 Errors in `client/src/pages/RespondentsPage.tsx`
- Related to type inference in useMutation hooks
- App works correctly despite these warnings

## Next Priority Features
1. **Chart Visualizations** - Use Recharts for response analytics (component already installed)
2. **Response Filtering/Sorting** - Add UI controls for date range, completion status
3. **Email Reminders** - Send follow-up emails to non-completed respondents
4. **Duplicate Detection UI** - Surface the existing `detectDuplicates()` function

## File Structure
```
client/src/
├── pages/
│   ├── Dashboard.tsx          # Survey list with filtering
│   ├── Builder.tsx            # Survey creation/editing with AI chat
│   ├── SurveyView.tsx         # Public survey response form
│   ├── AnalyticsPage.tsx      # Response analytics dashboard
│   ├── RespondentsPage.tsx    # Respondent management
│   └── ...other pages
├── components/
│   ├── ResponseDetailModal.tsx # Modal for viewing individual responses
│   ├── builder/               # Builder-specific components
│   ├── ui/                    # shadcn components
│   └── ...other components
└── hooks/
    ├── useSurveyFiltering.ts  # Filtering/sorting logic
    ├── useSurveyState.ts      # Survey state management
    └── ...other hooks

server/
├── routes.ts                  # All API endpoints
├── storage.ts                 # Data persistence (MemStorage/DbStorage)
├── email.ts                   # Email service (Resend)
├── db.ts                      # Drizzle database connection
├── replitAuth.ts              # Replit authentication
└── ...other backend files

shared/
├── schema.ts                  # Zod schemas + Drizzle tables
└── templates.ts               # Survey templates
```

## Development Notes
- Always follow the `shared/schema.ts` pattern: insert schema + insert type + select type
- Use `useMutation` with TanStack Query for all state-changing operations
- Cache invalidation: `queryClient.invalidateQueries({ queryKey: ['/api/...'] })`
- Components should be in `client/src/components` with subdirectories for logical grouping
- Keep routes thin - business logic in storage layer

## User Preferences
- Prefers working code over perfect code
- Interested in high-impact improvements (features users notice)
- Values security and proper architectural patterns
- Wants comprehensive features but pragmatic implementation

## Integrations
- **Replit Auth**: Email/Password + Google OAuth
- **Resend**: Email service (NEEDS SETUP - see Email Integration section above)
- **OpenRouter**: AI for survey generation
- **PostgreSQL/Drizzle**: Production database

---
**Last Updated**: Nov 22, 2025
**Current Phase**: Respondent email integration
**Blocking**: Waiting for user Resend API key
