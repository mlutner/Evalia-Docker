# Evalia - Survey Builder Project

## Project Overview
Evalia is an AI-powered survey builder for trainers to create, manage, and analyze surveys with a Typeform-inspired conversational interface. Features AI-assisted generation from documents, one-question-at-a-time UI, comprehensive analytics, and respondent tracking.

## Current Version: v1.0.0 (Nov 27, 2025)

### Version Tracking Protocol
The app uses semantic versioning stored in `shared/version.ts`:
- **Major (X.0.0)**: Breaking changes, major redesigns
- **Minor (1.X.0)**: New features, improvements
- **Patch (1.0.X)**: Bug fixes, small tweaks

**To release a new version:**
1. Update `APP_VERSION` in `shared/version.ts`
2. Update `BUILD_DATE` to current date
3. Add entry to `CHANGELOG` array with version, date, and changes
4. Commit with message: `[RELEASE] v1.x.x - Brief description`
5. Deploy

**Version is displayed:**
- In app footer (bottom-right, subtle)
- Via API: `GET /api/version`

## Current Status
- ✅ Core survey builder with AI assistance
- ✅ Response analytics with visual breakdown
- ✅ Respondent tracking system
- ✅ Response detail modal (click responses to view all answers)
- ✅ Email invitation infrastructure in place
- ✅ Comprehensive testing suite (Vitest + Playwright)
- ✅ API documentation (Swagger/OpenAPI)
- ✅ Version tracking system with changelog
- ⏳ Email sending: Configured to use Resend (awaiting API key setup)

## Recent Accomplishments
1. **Comprehensive Testing Suite** - Implemented Vitest for unit tests and Playwright for E2E tests
2. **Swagger API Documentation** - Added OpenAPI/Swagger documentation for all API endpoints
3. **Testing Guide** - Created detailed testing guide with examples and best practices
4. **Floating AI Chat Widget** - Enhanced with larger icon, green background (#A3D65C), white icon
5. **Dashboard Button** - Updated "Start Survey" to "New Questionnaire" for clarity
6. **Response Detail Modal** - Users can click any response to view all answers in a modal
7. **Email Service Infrastructure** - Added Resend email integration to invitation flow

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

## Testing Infrastructure

### Testing Framework
- **Unit Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright
- **Coverage**: V8 coverage reporting

### Running Tests

```bash
# Unit tests
npm run test                 # Run all tests once
npm run test:watch         # Run in watch mode
npm run test:ui            # Visual UI dashboard
npm run test:coverage      # Generate coverage report

# End-to-End tests
npm run test:e2e           # Run E2E tests
npm run test:e2e:headed    # See browser while running
npm run test:e2e:debug     # Debug mode
npm run test:e2e:report    # View report
```

### Test Files
- Unit tests: `client/src/test/components/*.test.tsx`
- E2E tests: `client/src/test/e2e/*.spec.ts`
- Setup: `client/src/test/setup.ts`

For detailed testing guidance, see `TESTING_GUIDE.md`

## API Documentation

### Swagger UI
Access full API documentation and test endpoints:
```
http://localhost:5000/api-docs
```

The API documentation includes:
- All endpoints (surveys, responses, dashboard, etc.)
- Request/response schemas
- Authentication requirements
- Error responses
- Example payloads

### Key API Endpoints
- `GET /api/surveys` - List all surveys
- `POST /api/surveys` - Create survey
- `GET /api/surveys/:id` - Get survey details
- `POST /api/surveys/:id/responses` - Submit response
- `GET /api/surveys/:id/responses` - Get analytics
- `GET /api/dashboard/metrics` - Get dashboard metrics

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

## Recently Completed (Nov 24, 2025)
1. **✅ Live Preview** - Real-time device preview (Desktop/Mobile/Tablet) in builder sidebar
2. **✅ AI Tone Adjuster** - One-click tone adjustment (Formal/Casual/Encouraging/Technical) for all questions
3. **✅ Command Center Widgets** - Dashboard with "At a Glance" insights, Goal Tracking, and AI Recommendations

## Phase 2: Future Enhancements
### Visual Conditional Logic Flowchart (Planned)
- **Goal**: Replace dropdown-based skip logic with visual flowchart interface
- **Implementation**:
  - Install `reactflow` library for node-edge visualization
  - Create `VisualLogicBuilder.tsx` component with draggable nodes (questions) and connectors
  - Build logic validator to detect circular dependencies
  - Add condition editor for each edge (question → condition → target question)
  - Mobile-responsive flowchart with zoom/pan controls
- **Files to Create**:
  - `client/src/components/VisualLogicBuilder.tsx` - Main flowchart component
  - `client/src/hooks/useFlowLogic.ts` - State management for flow logic
  - `client/src/utils/flowValidator.ts` - Circular dependency detection
- **Timeline**: 3-4 days (requires new library integration)
- **Team Notes**: Low priority but high perceived value for advanced users

## Next Priority Features (Current)
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
├── templates.ts               # Survey templates
└── version.ts                 # App version + changelog
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
**Last Updated**: Nov 27, 2025
**Current Version**: v1.0.0
**Current Phase**: Respondent email integration
**Blocking**: Waiting for user Resend API key
