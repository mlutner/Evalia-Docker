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
- **Dashboard**: Grid-based survey management with cards showing survey metadata
- **Builder**: Multi-tab interface supporting file upload, text prompts, and template selection
- **Survey View**: Sequential question flow with progress tracking
- **Chat Panel**: AI assistant interface for refining surveys through natural language
- **Template System**: Pre-built survey templates for common training scenarios

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

**Current State:**
The backend is minimally implemented with:
- Basic Express server setup with JSON body parsing
- Route registration system (empty implementation)
- In-memory storage interface with user CRUD operations
- Vite middleware integration for development mode
- Request logging middleware

**Planned Backend Features:**
- RESTful API routes prefixed with `/api`
- User authentication and authorization
- Survey CRUD operations
- File upload handling for documents
- AI integration endpoints for OpenRouter API
- Response collection and storage

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

**Current Schema:**
- **Users Table**: Basic user authentication with username/password
  - Auto-generated UUID primary keys
  - Unique username constraint
  - Password storage (intended for hashing)

**Anticipated Schema Expansion:**
- Surveys table (id, title, owner_id, questions_json, created_at)
- Uploads table (id, user_id, file_url, parsed_text, created_at)
- Responses table (id, survey_id, response_data, submitted_at)
- Templates table (pre-built survey templates)

### External Dependencies

**AI Services:**
- **OpenRouter API**: Primary AI integration for generating survey questions from text
  - Model: Anthropic Claude 3.5 Sonnet
  - Usage: Converting uploaded documents or prompts into structured survey JSON
  - Configuration: Requires `OPENROUTER_API_KEY` environment variable

**Document Processing:**
- **Tesseract.js**: OCR for extracting text from PDFs and images
- **Mammoth**: DOCX document parsing
- Client-side processing before sending to AI

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
- Development: Vite dev server with HMR
- Production: Vite build for frontend + ESBuild bundle for backend
- Environment variables required: `DATABASE_URL`, `OPENROUTER_API_KEY`, `NODE_ENV`