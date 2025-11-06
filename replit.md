# Evalia - AI-Powered Survey Builder

## Overview
Evalia is a web application for trainers to create and manage AI-assisted surveys with a Typeform-inspired conversational interface. It allows users to generate survey questions by uploading documents (PDF, DOCX, TXT) or providing text prompts. The platform prioritizes a minimal user experience, featuring one-question-at-a-time presentation, smooth transitions, and mobile-responsive design. The project aims to streamline survey creation and enhance user engagement.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
**Technology Stack:**
- **Framework**: React 18 with Vite
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **UI Components**: Shadcn/ui (built on Radix UI)
- **Styling**: TailwindCSS with custom design tokens

**Design Philosophy:**
The frontend employs a "conversational minimalism" approach, characterized by:
- One-question-at-a-time presentation for respondents.
- Progressive disclosure of information.
- Generous whitespace, focused content cards, and smooth fade/slide transitions.
- Inter font family for typography.
- Mobile-first responsive design.

**Key Frontend Features:**
- **Login Page**: Split-screen design with professional imagery and branding.
- **Dashboard**: Organized survey management with Drafts and Published sections, share, preview, and analytics options.
- **Builder**: 3-step wizard flow for intuitive survey creation:
  - Step 1 (START): Choose creation method via large action cards (Template, AI, or Document Upload)
  - Step 2 (QUESTIONS): Build and refine questions with AI chat assistant and manual editor
  - Step 3 (PUBLISH): Set survey metadata (title, description, welcome, thank you) with AI suggestions
- **Survey View**: Sequential question flow with progress tracking for public access.
- **Analytics Dashboard**: Comprehensive data visualization for survey responses (creator-only).
- **Chat Panel**: AI assistant for refining surveys via natural language.
- **Template System**: Pre-built survey templates.
- **Protected Routes**: Authentication-gated access for Dashboard, Builder, and Analytics.

### Backend Architecture
**Technology Stack:**
- **Runtime**: Node.js with Express.js
- **Database ORM**: Drizzle ORM for PostgreSQL
- **Session Management**: Express session with connect-pg-simple
- **Build System**: ESBuild for production, TSX for development

**Implemented Features:**
- Express server with JSON parsing and session management.
- **Username/Password Authentication**: Secure session-based authentication with bcrypt hashing.
- **Protected API Routes**: CRUD operations for surveys, document parsing, and AI integrations (all require authentication).
- **Public API Routes**: For fetching survey data and submitting responses.
- **Analytics API Routes**: With ownership verification to ensure only creators can view their survey analytics.
- File upload handling with Multer.
- PostgreSQL for user and survey management.
- OpenRouter AI service integration for survey generation and chat.
- Request logging middleware for diagnostics.

**Security Notes:**
- Secure password storage using bcrypt.
- Session regeneration on authentication to prevent fixation attacks.
- httpOnly and secure (in production) session cookies.
- 7-day session TTL with PostgreSQL persistence.
- Minimum 8-character password policy.
- All sensitive routes protected by `isAuthenticated` middleware.
- Survey ownership verification for analytics access.

### Database Design
**ORM Configuration:**
- Drizzle ORM with PostgreSQL dialect.
- Schema defined in `/shared/schema.ts` with Zod validation.

**Implemented Schema:**
- **Sessions Table**: PostgreSQL-backed session storage.
- **Users Table**: User accounts with UUID primary keys, username, hashed password, and timestamps.
- **Surveys Table**: Survey storage with UUID primary key, `userId` (foreign key to users), title, description, JSONB for questions, and timestamps.
- **Survey Responses Table**: Response collection with UUID primary key, `surveyId` (foreign key to surveys), JSONB for answer data, and a `completedAt` timestamp.

## External Dependencies

**AI Services:**
- **OpenRouter API**: Integrated for survey generation, document text extraction (using Mistral Small 3.1), and chat-based refinements. Configured via `OPENROUTER_API_KEY` or `OPENAI_API_KEY`.

**Document Processing:**
- **pdf-parse**: Server-side PDF text extraction.
- **Mammoth**: DOCX document parsing.
- **Multer**: File upload handling.

**Database:**
- **PostgreSQL**: Primary data store, accessed via Neon serverless driver. Requires `DATABASE_URL`.

**UI Component Libraries:**
- **Radix UI**: Headless accessible components for core UI.
- **Lucide React**: Icon library.
- **Embla Carousel**: Touch-friendly carousel functionality.
- **date-fns**: Date manipulation utility.

**Third-Party Services:**
- Google Fonts API for Inter font family.