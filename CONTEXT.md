# MyNextStep — Context for Claude Code

## What is this project?

An AI-powered career hub that helps users track job applications, analyze resumes and job descriptions, and improve based on interview feedback.

## Tech stack

- React + Vite + TypeScript
- React Router for navigation
- Tailwind CSS v4
- Shadcn/ui for components
- React Hook Form + Zod for forms and validation
- TanStack Query for data fetching and cache

## Design system

- Dark mode only
- Primary color: Purple (#534AB7)
- Action/progress color: Teal (#1D9E75)
- Neutral: (#2C2C2A)
- Font: system sans-serif, clean and minimal
- Style reference: Linear, Perplexity — lightweight + tech feeling
- Mobile first, sidebar navigation that becomes a hamburger drawer on mobile

## Pages and routes

- `/` — Dashboard: overview of open processes, improvement points, quick actions
- `/board` — Kanban board of job applications with stages: Applied, HR Interview, Technical Interview, Offer
- `/resume` — Resume Analyzer: user uploads resume, AI analyzes and gives structured feedback
- `/job` — Job Analyzer: user pastes a job description, AI returns fit score, missing skills, salary estimate
- `/levelup` — LevelUp: tracks weak points from failed interviews, allows study and progress tracking

## Folder structure

src/
assets/
components/ # shared components
hooks/ # custom hooks
lib/ # utilities
pages/
Dashboard/
Board/
ResumeAnalyzer/
JobAnalyzer/
LevelUp/
services/ # API calls
types/ # TypeScript interfaces

## Current state

- Routing configured and working
- All pages returning placeholder content
- No components built yet
- No backend integration yet (all data will be mocked)

## Backend (not built yet)

- NestJS + TypeScript + PostgreSQL
- JWT authentication with refresh tokens
- Each user owns their own data
- AI integration via Anthropic API

## Code conventions

- Named exports only (no default exports)
- Each page in its own folder with index.tsx
- Services layer handles all API calls, never call fetch directly from a component
- Keep components small and focused
- Forms always use React Hook Form + Zod
- Server state always managed by TanStack Query
