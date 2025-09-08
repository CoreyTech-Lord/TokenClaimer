# Overview

MyToken is a cryptocurrency mining web application where users can earn MTK tokens through daily mining, task completion, and referral activities. The application features a gamified experience with streaks, leaderboards, and wallet integration for Base Network compatibility. Built as a full-stack TypeScript application with a React frontend and Express backend, it provides a modern crypto earning platform with social features.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side is built with React and TypeScript, using a component-based architecture with functional components and hooks. The UI framework leverages shadcn/ui components with Radix UI primitives for accessibility and consistent design. Styling is handled through Tailwind CSS with a custom dark theme featuring crypto-inspired colors (gold primary, purple gradients).

**Key Frontend Decisions:**
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state, React hooks for local state
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Modular shadcn/ui system for consistent design
- **Mobile-First**: Responsive design with fixed bottom navigation

## Backend Architecture

The server follows an Express.js REST API pattern with TypeScript, implementing a clean separation between routing, business logic, and data access. Authentication is handled through Replit's OIDC system with session management, providing secure user identification without custom auth implementation.

**Key Backend Decisions:**
- **API Design**: RESTful endpoints with consistent JSON responses
- **Authentication**: Replit OIDC integration with session-based auth
- **Error Handling**: Centralized error middleware with structured responses
- **Logging**: Request/response logging for API endpoints
- **Security**: Session-based auth with PostgreSQL session storage

## Data Storage Architecture

PostgreSQL database managed through Drizzle ORM provides type-safe database operations with automated migrations. The schema supports user management, mining sessions, task systems, referral tracking, and leaderboard functionality.

**Key Database Decisions:**
- **ORM Choice**: Drizzle for type safety and performance
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple
- **Precision Handling**: Decimal types for crypto token amounts
- **Relationships**: Foreign key constraints for data integrity
- **Indexing**: Strategic indexes for leaderboard and session queries

## Authentication & Authorization

Replit's OpenID Connect (OIDC) system handles user authentication, eliminating the need for custom user registration and password management. Session-based authorization protects API endpoints with middleware that validates user sessions.

**Key Auth Decisions:**
- **Provider**: Replit OIDC for seamless integration
- **Session Management**: Server-side sessions with PostgreSQL storage
- **Middleware**: Route-level authentication checks
- **Token Handling**: Automatic token refresh and validation

# External Dependencies

## Database Services
- **Neon Database**: PostgreSQL hosting with serverless architecture
- **Connection**: @neondatabase/serverless for WebSocket-based connections

## Authentication Services
- **Replit Auth**: OIDC authentication provider
- **Session Storage**: PostgreSQL-backed session management

## UI/UX Libraries
- **Radix UI**: Accessible component primitives (@radix-ui/react-*)
- **shadcn/ui**: Pre-built component system
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon system for consistent iconography

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **Drizzle Kit**: Database migration and schema management
- **ESBuild**: Production bundling for server code

## Runtime Dependencies
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight React routing
- **Express**: Node.js web framework
- **Zod**: Schema validation for forms and API inputs