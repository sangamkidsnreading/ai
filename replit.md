# Replit.md

## Overview

This is a full-stack English vocabulary learning application called "키리보카" (Kiriboka). It features a React frontend with TypeScript, an Express.js backend, and PostgreSQL database integration using Drizzle ORM. The application provides an interactive learning experience for English words and sentences with user authentication, progress tracking, and administrative features.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: Zustand for client-side state
- **UI Framework**: Radix UI components with Tailwind CSS
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth interactions
- **Data Fetching**: TanStack Query (React Query) for server state management

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: bcryptjs for password hashing
- **Session Management**: Express sessions with PostgreSQL store

### Build System
- **Bundler**: Vite for frontend development and building
- **Compilation**: esbuild for backend bundling
- **Development**: Hot reload with Vite dev server

## Key Components

### Authentication System
- User registration and login with email/password
- Role-based access control (student/admin)
- Secure password hashing with bcryptjs
- Session-based authentication

### Learning Module
- Interactive word and sentence learning
- Text-to-speech functionality using Web Speech API
- Progress tracking by day and level
- Favorite word management
- Recording capability for pronunciation practice

### User Interface
- Responsive sidebar navigation
- Dynamic content sections (Learning, Dashboard, Profile, Admin)
- Modern UI with shadcn/ui components
- Dark/light theme support preparation
- Mobile-friendly design considerations

### Administrative Features
- User management interface
- Content management (words/sentences)
- Progress monitoring
- CRUD operations for learning materials

## Data Flow

### Authentication Flow
1. User submits login credentials
2. Backend validates against database
3. Session created and stored in PostgreSQL
4. Frontend receives user data and updates auth state
5. Protected routes check authentication status

### Learning Flow
1. User selects level and day
2. Frontend fetches words/sentences from backend API
3. User interacts with content (learn, favorite, record)
4. Progress updates sent to backend
5. Database updated with new progress data
6. UI reflects updated statistics and achievements

### Data Persistence
- User progress stored in PostgreSQL tables
- Real-time synchronization between frontend and backend
- Optimistic updates with error handling and rollback

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: Zustand for lightweight state management
- **HTTP Client**: TanStack Query for server state and caching
- **Animation**: Framer Motion for smooth UI transitions
- **Charts**: Recharts for data visualization in dashboard
- **Form Handling**: React Hook Form with Zod validation

### Backend Dependencies
- **Database**: Neon PostgreSQL serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: bcryptjs for password security
- **Session Store**: connect-pg-simple for PostgreSQL session storage
- **WebSocket**: ws for real-time features (prepared)

### Development Dependencies
- **TypeScript**: Type safety across the stack
- **Vite**: Fast development server and build tool
- **ESLint/Prettier**: Code quality and formatting
- **Replit Integration**: Development environment optimizations

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with hot reload
- tsx for running TypeScript backend in development
- Automatic database migrations with Drizzle
- Environment variable management for database connection

### Production Build
- Frontend: Vite builds optimized static assets
- Backend: esbuild bundles server code for Node.js
- Database: Production PostgreSQL instance via Neon
- Static file serving through Express for SPA routing

### Database Management
- Schema definitions in shared/schema.ts
- Migration files generated in migrations/
- Database provisioning through environment variables
- Connection pooling with Neon serverless adapter

### Environment Configuration
- Development: Local environment with remote database
- Production: Node.js server with built assets
- Database URL configured via environment variables
- Session secrets and other sensitive data via environment

## Changelog
- July 02, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.