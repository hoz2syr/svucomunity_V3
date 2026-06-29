---
description: Supabase client usage and data access patterns for this Vite + React + TypeScript project
globs: ["src/**/*.ts", "src/**/*.tsx", "src/**/*.ts"]
---

# Supabase Rules

## Code Style and Structure
- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g. isLoading, hasError).
- Favor named exports for components and functions.

## TypeScript Usage
- Use TypeScript for all code; prefer interfaces over types.
- Avoid enums; use const objects or as const assertions instead.
- Use functional components with TypeScript interfaces.

## Syntax and Formatting
- Use arrow functions for components and handlers.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.

## Database Querying & Data Access
- Use the Supabase SDK for data fetching and querying.
- Centralize Supabase client creation in a shared module (e.g. `src/lib/supabase.ts`).
- Do not create Supabase clients at module import time; create them lazily inside functions or hooks.
- Do not throw errors at import time; handle missing environment variables only when an operation is executed.

## Data Layer Separation
- UI components must not call Supabase directly.
- Pages must use services or feature hooks.
- Feature hooks must call services.
- Services must call the Supabase client.

## Services Layer
- Services contain all Supabase operations.
- Services normalize errors into typed results.
- Services return typed data or typed error results.

## Environment Safety
- Do not read session at import time.
- Do not create fake profiles or fake success states when the environment is missing.
- Do not silently succeed operations when Supabase is not configured.
- Do not execute Edge Functions without explicit environment checks.

## Key Conventions
- Minimize direct Supabase usage in UI components.
- Keep business logic in services or feature hooks, not in components.
- Rely on Supabase RLS policies for security; the client layer is not a security boundary.
