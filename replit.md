# Downtime Analysis Dashboard

## Overview

This is a comprehensive web application designed to track, analyze, and visualize system downtime incidents across multiple service channels. The application processes downtime data in CSV/TSV format and generates detailed reports with interactive charts and categorized incident tables. Built specifically for analyzing planned vs unplanned outages, partial vs full service impacts, and providing insights into system reliability patterns.

**Recent Enhancement (August 2025)**: 
- Added weekly reporting functionality to enable week-over-week trend analysis
- **Migration Complete (August 10, 2025)**: Successfully migrated from Replit Agent to Replit environment with enhanced features:
  - Home dashboard with navigation to downtime reports
  - Expandable incident table with "+more" functionality for channel lists  
  - Loading spinners with custom logo animation
  - Enhanced PowerPoint generation with actual chart visualizations and reliability metrics
  - Modern UI components with shadcn/ui and improved user experience

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built using **React with TypeScript** and follows a modern component-based architecture:

- **Vite** as the build tool and development server for fast development experience
- **Tailwind CSS** for styling with a comprehensive design system using CSS variables
- **shadcn/ui** component library providing a consistent design language with Radix UI primitives
- **Wouter** for lightweight client-side routing
- **React Query (TanStack Query)** for server state management and API communication
- **Chart.js** for rendering interactive data visualizations (pie charts and bar charts)

The application uses a **single-page application (SPA)** pattern with:
- Component-based UI structure under `client/src/components/`
- Custom hooks for reusable logic (mobile detection, toast notifications)
- Centralized styling with CSS custom properties for theming
- Path aliases configured for clean imports (`@/`, `@shared/`)

### Backend Architecture

The backend follows a **lightweight Express.js** architecture:

- **Express.js** server with TypeScript for type safety
- **RESTful API** design with a single endpoint for processing downtime data
- **In-memory data processing** without persistent storage requirements
- **Zod** for runtime data validation and type inference
- **Shared schema definitions** between frontend and backend for type consistency

The server architecture includes:
- Route registration pattern for modular endpoint management
- Request/response logging middleware for debugging
- Error handling middleware for consistent error responses
- Development-specific Vite integration for hot reloading

### Data Storage Solutions

The application uses a **stateless, in-memory processing** approach:

- **No persistent database** - all data processing happens in memory
- **CSV/TSV parsing** and categorization logic in the storage layer
- **Memory storage implementation** that processes and transforms data on-demand
- Data categorization by impact type (FULL/PARTIAL) and modality (PLANNED/UNPLANNED)

**Database Configuration Present**: The application includes Drizzle ORM configuration for PostgreSQL, indicating readiness for future database integration if persistent storage becomes necessary.

### Authentication and Authorization

Currently **no authentication system** is implemented - the application operates as an open dashboard for downtime analysis.

## External Dependencies

### Core Framework Dependencies
- **React 18** with TypeScript for the frontend framework
- **Express.js** for the backend server
- **Vite** for build tooling and development server

### UI and Styling
- **Tailwind CSS** for utility-first styling
- **Radix UI** component primitives for accessible UI components
- **shadcn/ui** for pre-built component library
- **Lucide React** for consistent iconography

### Data Visualization
- **Chart.js** for rendering interactive charts and graphs
- Custom data processing utilities for chart data transformation

### Development and Build Tools
- **TypeScript** for type safety across the entire application
- **ESBuild** for backend bundling in production
- **PostCSS** with Autoprefixer for CSS processing

### Validation and Schema
- **Zod** for runtime type validation and schema definition
- **React Hook Form** with resolvers for form validation

### State Management
- **TanStack React Query** for server state management and caching
- **React Context** for component-level state sharing

### Potential Database Integration
- **Drizzle ORM** configured for PostgreSQL (currently unused)
- **@neondatabase/serverless** for cloud PostgreSQL connectivity
- Connection configuration present for future database implementation

### Utility Libraries
- **date-fns** for date manipulation and formatting
- **clsx** and **class-variance-authority** for conditional styling
- **nanoid** for unique ID generation