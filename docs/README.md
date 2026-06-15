# Technical Documentation

## SVU Community — Technical Documentation

# SVU Community v3.0.0

## Project Summary
SVU Community is a comprehensive student platform developed for the Syrian Virtual University. The platform provides a set of integrated tools and services to enhance the student experience, including study group management, course catalog, and smart schedule.

## Architecture Overview
Build- **Frontend**: React 19 + TypeScript + Tailwind CSS v4
- **Testing**: Vitest 4 + Playwright 1.60
- **Build**: Vite 6 + Turborepo
- **Backend**: Supabase PostgreSQL + Edge Functions
- **Libraries**: shadcn/ui for component design

## Application Structure
```text
apps/
  web/      — Main portal (multi-page application)
  courses/  — Course catalog with advanced search and filtering
  schedule/ — AI-powered schedule builder
  admin/    — Administrative dashboard
```

## Data Flow
1. **User Authentication**: Via Supabase Auth
2. **Data Storage**: PostgreSQL via Supabase
3. **Cache**: Client-side localStorage for temporary data
4. **API**: REST via Supabase Edge Functions

## Key Technologies
- React 19 with functional components and hooks
- TypeScript with strict mode
- Tailwind CSS v4 for styling
- Vite 6 as a build tool
- Vitest 4 for unit testing
- Playwright for E2E testing
- Supabase for backend services

## Security Standards
- XSS protection via HTML escaping
- CSRF protection via double cookie pattern
- HTTPS enforced for all production connections
- All user input is validated before processing
- Session management via Supabase Auth

## Performance Optimization
- Code splitting and lazy loading in use
- Assets optimized with Vite
- Caching strategy using localStorage
- Responsive images and lazy loading
