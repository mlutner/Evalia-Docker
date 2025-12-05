# Evalia Survey Builder - Changelog

## December 3, 2025 - Major Updates

### Repository Configuration
- **Primary Repository:** https://github.com/mlutner/Evalia-Docker.git
- **Local Path:** `/Users/mikelutner/EvaliaSurvey`
- **Database:** Docker PostgreSQL (localhost:5432)

---

## Features & Fixes Implemented

### 1. Survey Title Flow to Welcome Screen
**Commit:** `066c0af`

- When loading templates or AI-generated surveys, the survey title now automatically populates the welcome screen title
- Survey description also flows to welcome screen description
- Added survey title to footer across all preview screens: `{survey.title} • Powered by Evalia`

**Files Modified:**
- `client/src/contexts/SurveyBuilderContext.tsx`

### 2. Header Image Rendering
**Commit:** `066c0af`

- Fixed missing header image rendering in `WelcomePagePreviewEnhanced` component
- Fixed missing header image rendering in `ThankYouPreview` component  
- Added header image support in `PreviewV2.tsx` for both welcome and thank you screens
- Header images now display as a 96px tall banner below the header bar

**Files Modified:**
- `client/src/pages/DesignV2.tsx`
- `client/src/pages/PreviewV2.tsx`

### 3. Configurable Header Bar Color
**Commit:** `066c0af`

- Added `headerBar` color field to the `WelcomePageSettings` interface
- Added "Header Bar" color picker in design settings (Colors section)
- Updated all 6 color presets to include `headerBar` color
- Header bar strip at top of all screens is now fully customizable
- Falls back to primary color if headerBar not set

**Files Modified:**
- `client/src/components/builder-v2/WelcomePageEditor.tsx` - Added interface field & color presets
- `client/src/pages/DesignV2.tsx` - Updated COLOR_PRESETS and preview components
- `client/src/pages/PreviewV2.tsx` - Updated themeColors defaults and header bar rendering
- `client/src/contexts/SurveyBuilderContext.tsx` - Added secondary color field

### 4. Question Bank (161 Questions)
**Previous commits**

- 161 pre-built questions across 24 categories
- Categories: Engagement, Management, Training, Workload, Culture, Onboarding, Pulse, Belonging, Wellbeing, Compensation, Career, Feedback, Mission, Innovation, Agility, Communication, Leadership, Challenges, Satisfaction, Advocacy, Improvement, Relationships, Diversity
- Search functionality
- Category filtering
- Drag-and-drop to add questions

**Files:**
- `client/src/data/questionBank.ts`
- `client/src/components/builder-v2/QuestionLibrary.tsx`

### 5. Consistent Preview Sizing
**Commit:** `e7abf9a`

- All preview screens (Welcome, Survey, Thank You) maintain consistent `h-[500px]` height
- Default header bar with theme primary color on all screens
- Auto-save when navigating away from design page

### 6. Question Type Rendering
**Commit:** `e7abf9a`

- Comprehensive `QuestionInput` component in PreviewV2 for all question types
- `DesignQuestionPreview` component for design page previews
- Proper rendering for: text, textarea, number, email, phone, url, multiple_choice, checkbox, dropdown, yes_no, rating, nps, likert, opinion_scale, slider, date, time, matrix, ranking

### 7. NPS Labels Configuration
**Previous commits**

- Added `npsLabels` field to question schema (detractor/promoter labels)
- Added NPS configuration UI in QuestionEditor
- Updated QuestionCard to use npsLabels

### 8. Slider Endpoint Labels
**Previous commits**

- Added Low/High label configuration UI for slider questions
- Maps to `question.ratingLabels.low` and `question.ratingLabels.high`

### 9. Rating Style Defaults
**Previous commits**

- Changed default `ratingStyle` from 'star' to 'number' for rating questions
- Updated template seeding to explicitly set `ratingStyle: "number"`
- Templates with Likert patterns now correctly set `type: "likert"`

---

## Color Presets Available

| Preset | Primary | Header Bar | Background | Text |
|--------|---------|------------|------------|------|
| Evalia | #2F8FA5 | #2F8FA5 | #FFFFFF | #1e293b |
| Professional | #1e3a5f | #1e3a5f | #f8fafc | #1e293b |
| Modern Purple | #8b5cf6 | #8b5cf6 | #faf5ff | #1f2937 |
| Warm | #f59e0b | #f59e0b | #fffbeb | #451a03 |
| Nature | #22c55e | #22c55e | #f0fdf4 | #14532d |
| Dark Elegant | #6366f1 | #6366f1 | #0f172a | #f1f5f9 |

---

## Database Configuration

### Local Development (Docker)
```
DATABASE_URL=postgresql://evalia:password@localhost:5432/evalia
```

### To Start Local Database:
```bash
docker run -d --name evalia-db \
  -e POSTGRES_USER=evalia \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=evalia \
  -p 5432:5432 \
  postgres:16-alpine
```

### To Run Dev Server:
```bash
export DATABASE_URL="postgresql://evalia:password@localhost:5432/evalia"
export SESSION_SECRET="local-development-session-secret-min-32-characters"
npm run dev
```

Server runs at: http://127.0.0.1:4000

---

## File Structure Overview

```
/Users/mikelutner/EvaliaSurvey/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── builder-v2/
│   │   │   │   ├── QuestionLibrary.tsx    # Question Bank UI
│   │   │   │   ├── WelcomePageEditor.tsx  # Welcome screen config
│   │   │   │   └── BuilderCanvas.tsx      # Builder preview
│   │   │   ├── QuestionCard.tsx           # Question rendering
│   │   │   └── QuestionEditor.tsx         # Question configuration
│   │   ├── contexts/
│   │   │   └── SurveyBuilderContext.tsx   # Global state management
│   │   ├── data/
│   │   │   ├── questionBank.ts            # 161 questions
│   │   │   └── questionTypeConfig.ts      # Question type definitions
│   │   └── pages/
│   │       ├── DesignV2.tsx               # Design customization page
│   │       └── PreviewV2.tsx              # Live preview page
├── server/
│   ├── seedTemplates.ts                   # Template seeding
│   └── db.ts                              # Database connection
├── shared/
│   └── schema.ts                          # Database schema
├── docker-compose.yml
├── CHANGELOG.md                           # This file
└── env.example.txt                        # Environment template
```

---

## Git History (Recent)

```
066c0af Fix: Survey title flows to welcome screen, header images render, header bar color configurable
e7abf9a fix: Comprehensive question type rendering in Preview and Design
6add0b6 fix: Consistent preview sizing, default styling, and auto-save
```

---

*Last Updated: December 3, 2025*
