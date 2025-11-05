# Evalia - AI-Powered Survey Builder

## Overview

Evalia is a modern web application designed for trainers to create and manage AI-assisted surveys with a Typeform-inspired conversational interface. The platform allows users to upload documents (PDF, DOCX, TXT) or use text prompts to generate survey questions, leveraging AI to streamline the survey creation process. The application emphasizes a clean, minimal user experience with one-question-at-a-time presentation, smooth transitions, and mobile-responsive design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with Vite as the build tool and development server
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: TailwindCSS with custom design tokens following Typeform-inspired minimalism

**Design Philosophy:**
The frontend implements a "conversational minimalism" approach with:
- One-question-at-a-time presentation for survey respondents
- Progressive disclosure of information
- Generous whitespace and focused content cards
- Smooth fade/slide transitions between states
- Inter font family for all typography
- Mobile-first responsive design with breakpoint-specific layouts

**Key Frontend Features:**
- **Login Page**: Split-screen design with professional trainer imagery and Evalia branding
- **Dashboard**: Grid-based survey management with cards showing survey metadata
- **Builder**: Multi-tab interface supporting file upload, text prompts, and template selection
- **Survey View**: Sequential question flow with progress tracking
- **Chat Panel**: AI assistant interface for refining surveys through natural language
- **Template System**: Pre-built survey templates for common training scenarios
- **Protected Routes**: Authentication-gated access to Dashboard and Builder pages

**Component Structure:**
- Reusable UI components in `/client/src/components/ui`
- Feature components in `/client/src/components`
- Page-level components in `/client/src/pages`
- Shared type definitions in `/shared`

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Session Management**: Express session with connect-pg-simple for PostgreSQL-backed sessions
- **Build System**: ESBuild for production bundling, TSX for development

**Implemented Features:**
- Express server with JSON body parsing and session management
- Session-based authentication using express-session
- Authentication routes: `/api/login`, `/api/register`, `/api/logout`, `/api/user`
- Survey CRUD routes: GET/POST/PATCH/DELETE `/api/surveys`
- Document parsing route: POST `/api/parse-document` (PDF, DOCX, TXT)
- AI integration routes: POST `/api/generate-survey`, POST `/api/chat`
- File upload handling with multer (10MB limit)
- In-memory storage implementation with user and survey management
- OpenRouter AI service integration with free Mistral Small 3.1 model
- Request logging middleware for API diagnostics

**Security Notes:**
- Session cookies with 7-day expiration
- Secure cookie configuration for production (httpOnly, secure in prod)
- **TODO**: Password hashing (currently plaintext for demo - MUST implement bcrypt for production)

**Storage Layer:**
- Interface-based storage design (`IStorage`) for flexibility
- Current implementation uses in-memory storage (`MemStorage`)
- Designed to be replaced with PostgreSQL-backed storage using Drizzle ORM
- Schema defined in `/shared/schema.ts` with Drizzle tables

### Database Design

**ORM Configuration:**
- Drizzle ORM with PostgreSQL dialect
- Schema location: `/shared/schema.ts`
- Migrations output: `/migrations`
- Type-safe schema definitions with Zod validation

**Implemented Schema:**
- **Users Table**: User authentication with username/password
  - Auto-generated UUID primary keys
  - Unique username constraint
  - Password storage (plaintext - needs bcrypt for production)
  
- **Surveys Table**: Survey storage with questions
  - UUID primary key
  - Title and optional description
  - JSONB column for question array (type-safe with Zod)
  - createdAt and updatedAt timestamps

- **Survey Responses Table**: Response collection
  - UUID primary key
  - Foreign key to surveys table
  - JSONB column for answer data
  - completedAt timestamp

### External Dependencies

**AI Services:**
- **OpenRouter API**: Fully integrated AI service for survey generation and refinement
  - Model: Mistral Small 3.1 (24B parameters) - Free tier
  - OCR Model: Mistral Small 3.1 for text extraction from images in PDFs
  - Usage: Converting documents/prompts into structured survey JSON, chat-based refinements
  - Configuration: Uses `OPENROUTER_API_KEY` or `OPENAI_API_KEY` environment variable
  - Service layer: `/server/openrouter.ts` with typed functions

**Document Processing:**
- **pdf-parse**: Server-side PDF text extraction
- **Mammoth**: DOCX document parsing (extracts raw text)
- **Multer**: File upload handling with memory storage
- Server-side processing with AI integration for question generation

**Database:**
- **PostgreSQL**: Primary data store via Neon serverless driver
  - Configuration: Requires `DATABASE_URL` environment variable
  - Connection pooling through @neondatabase/serverless

**UI Component Libraries:**
- **Radix UI**: Headless accessible component primitives
  - All major components (Dialog, Dropdown, Tabs, etc.)
  - Ensures ARIA compliance and keyboard navigation
- **Lucide React**: Icon library for consistent iconography
- **Embla Carousel**: Touch-friendly carousel functionality
- **date-fns**: Date formatting and manipulation

**Development Tools:**
- **Replit Plugins**: Runtime error overlay, cartographer, dev banner
- **TypeScript**: Full type safety across frontend and backend
- **TailwindCSS**: Utility-first styling with custom configuration

**Third-Party Services:**
- Survey templates stored in `/shared/templates.ts`
- Design guidelines in `/design_guidelines.md` for UI consistency
- Google Fonts API for Inter font family

**Build and Deployment:**
- Development: Vite dev server with HMR on port 5000
- Production: Vite build for frontend + ESBuild bundle for backend
- Environment variables required:
  - `SESSION_SECRET`: Session encryption key (auto-generated in dev)
  - `OPENROUTER_API_KEY` or `OPENAI_API_KEY`: OpenRouter API access
  - `NODE_ENV`: Environment flag (development/production)
  - Optional: `DATABASE_URL` for PostgreSQL (currently using in-memory storage)

## Recent Changes (November 2025)

### Authentication System (Completed)
- Implemented session-based authentication with express-session
- Created split-screen login page matching design reference with trainer imagery
- Added user registration and login flows with proper cache management
- Protected Dashboard and Builder routes with authentication guards
- Added logout functionality with session cleanup
- All tests passing for auth flow, protected routes, and cache coherence

### AI Integration (Completed)
- Integrated OpenRouter API with free Mistral Small 3.1 model
- Implemented document parsing (PDF, DOCX, TXT) with AI question generation
- Added text prompt-based survey generation
- Created chat-based survey refinement system
- Fixed pdf-parse CommonJS import using createRequire
- All AI features tested and working with real API calls