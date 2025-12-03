# Evalia Survey Builder - Changelog

## [Unreleased] - 2025-12-03

### 🗃️ Database & Infrastructure

#### Template Question Field Names (FIXED)
- **Problem**: Templates stored questions with `matrixRows` and `matrixColumns` but the schema expects `rowLabels` and `colLabels`. This caused matrix questions to not render properly.
- **Solution**: 
  - Ran SQL migration to update all 26 templates in the database
  - Fixed `server/seedTemplates.ts` (lines 48-51) to use correct field names
- **Files Changed**: `server/seedTemplates.ts`, `shared/templates.ts`

#### Database Connection Safeguards (NEW)
- Added warning banner in `server/db.ts` showing which database is connected
- Created `DATABASE_SETUP.md` documentation
- Created `env.example.txt` template file
- **Purpose**: Prevent confusion between local Docker database and production Neon database

### 📋 Question Bank (MAJOR UPDATE)

#### Expanded Question Library
- **Before**: 30 questions
- **After**: 161 questions (5x increase!)

#### New Categories (23 total):
| Category | Description |
|----------|-------------|
| engagement | Employee engagement and satisfaction |
| management | Manager effectiveness and support |
| training | Training and development feedback |
| workload | Workload and stress management |
| culture | Organizational culture and values |
| onboarding | New employee experience |
| pulse | Quick check-in surveys |
| belonging | Inclusion and belonging |
| wellbeing | Employee wellbeing and mental health |
| compensation | Pay and benefits |
| career | Career development |
| feedback | General feedback collection |
| mission | Mission alignment |
| innovation | Innovation culture |
| agility | Organizational agility |
| communication | Communication effectiveness |
| leadership | Leadership effectiveness |
| challenges | Work challenges |
| satisfaction | Customer satisfaction |
| advocacy | Employee advocacy |
| improvement | Improvement suggestions |
| relationships | Workplace relationships |
| diversity | Diversity and inclusion |

#### Question Type Mappings:
| Input Type | Scale Type | Output Type | Display Name |
|------------|------------|-------------|--------------|
| rating | likert_5 | likert | Likert Scale |
| rating | nps | nps | NPS |
| rating | emoji | emoji_rating | Emoji Rating |
| rating | thumbs | rating | Thumbs Rating |
| open_ended | - | textarea | Long Text |
| multiple_choice | - | multiple_choice | Multiple Choice |

#### Files Changed:
- `client/src/data/questionBank.ts` - Regenerated with 161 questions
- `scripts/convertQuestionBank.ts` - Fixed ESM `__dirname` bug
- `scripts/questionBankInput.json` - Source data (161 questions)

### 🐳 Docker Configuration

#### Current Setup:
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    container_name: evalia-postgres
    environment:
      POSTGRES_USER: evalia
      POSTGRES_PASSWORD: password  # For local dev only
      POSTGRES_DB: evalia
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

#### Running Locally:
```bash
# Start Docker database
docker-compose up -d postgres

# Run the app
PORT=4000 DATABASE_URL="postgresql://evalia:password@localhost:5432/evalia" SESSION_SECRET="dev-secret-key-12345" npm run dev
```

### 📁 New Files Created This Session

| File | Purpose |
|------|---------|
| `DATABASE_SETUP.md` | Database configuration guide |
| `env.example.txt` | Environment variable template |
| `scripts/questionBankInput.json` | 161 question source data |
| `scripts/convertQuestionBank.ts` | Question conversion script |
| `scripts/generateQuestionBank.cjs` | Question bank generator |
| `QUESTION_TYPES_SPECIFICATION.md` | Question type documentation |
| `UI_ENHANCEMENT_ROADMAP.md` | UI improvement plans |
| `CHANGELOG.md` | This file |

### 📁 Modified Files

| File | Changes |
|------|---------|
| `server/seedTemplates.ts` | Fixed field names (matrixRows → rowLabels) |
| `server/db.ts` | Added database connection warnings |
| `shared/templates.ts` | Template structure updates |
| `shared/schema.ts` | Schema improvements |
| `client/src/data/questionBank.ts` | Regenerated with 161 questions |

### 🔧 Scripts

#### Question Bank Conversion
```bash
# Convert questions from JSON to TypeScript
npx tsx scripts/convertQuestionBank.ts
```

#### Template Seeding
```bash
# Seed templates to database
DATABASE_URL="your-url" npm run seed:templates
```

---

## Database State

### Local Docker (localhost:5432)
- **Templates**: 26 (Canadian HR templates)
- **Surveys**: 0
- **Users**: 0 (use Replit OAuth for production)

### Production (Neon)
- Check Replit for current state
- Contains actual survey data

---

## Quick Reference

### Start Development
```bash
# 1. Ensure Docker is running
docker-compose up -d postgres

# 2. Start the app
PORT=4000 DATABASE_URL="postgresql://evalia:password@localhost:5432/evalia" SESSION_SECRET="dev-secret-key-12345" npm run dev

# 3. Open browser
open http://localhost:4000
```

### Verify Database
```bash
docker exec evalia-survey-builder-magic-patterns-postgres-1 psql -U evalia -d evalia -c "SELECT COUNT(*) FROM templates;"
```

