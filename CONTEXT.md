# MyNextStep — Context for Claude Code

## What is this project?

An AI-powered career hub that helps users track job applications, analyze resumes and job descriptions, and improve based on interview feedback.

## Tech stack

- React + Vite + TypeScript
- React Router for navigation
- Tailwind CSS v4
- Shadcn/ui for components (Radix + Nova preset)
- React Hook Form + Zod for forms and validation
- TanStack Query for data fetching and cache
- Framer Motion for animations
- Lucide for icons

## Design system

- Dark mode only
- Primary color: Purple (#534AB7)
- Action/progress color: Teal (#1D9E75)
- Neutral: (#2C2C2A)
- Font: system sans-serif, clean and minimal
- Style reference: Linear, Perplexity — lightweight + tech feeling
- Mobile first, sidebar navigation that becomes a hamburger drawer on mobile
- CSS variables defined in src/index.css — always use them, never hardcode colors

## Pages and routes

- `/` — Dashboard: overview of open processes, improvement points, quick actions
- `/board` — Kanban board of job applications with stages: Applied, HR Interview, Technical Interview, Offer
- `/resume` — Resume Analyzer: user uploads resume, AI analyzes and gives structured feedback
- `/job` — Job Analyzer: user pastes a job description, AI returns fit score, missing skills, salary estimate
- `/levelup` — LevelUp: tracks weak points from failed interviews, allows study and progress tracking

## Folder structure

src/
assets/
components/
Layout/ # Layout wrapper only
Sidebar/ # Sidebar component (separate from Layout)
ui/ # Shadcn components
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
- Global styles and CSS variables defined in src/index.css
- Shadcn installed with Radix + Nova preset
- Path alias configured (@/ maps to src/)
- Layout component exists but needs to be rebuilt (see instructions below)
- All pages returning placeholder content
- No backend integration yet (all data will be mocked)

## Layout instructions

The current Layout component needs to be rebuilt with the following improvements:

- Split into Layout (src/components/Layout/index.tsx) and Sidebar (src/components/Sidebar/index.tsx)
- Sidebar items should be in a separate SidebarItem component (src/components/Sidebar/SidebarItem.tsx)
- Use Home icon (not LayoutDashboard) for Dashboard
- Product name (MyNextStep) should be larger and have more visual presence
- Add a collapse button that hides the sidebar to icon-only mode, expanding content area
- Use Framer Motion for sidebar collapse animation and mobile drawer animation
- Mobile drawer slides in from left over content (not pushing it)
- All text hardcoded in English, no i18n

## Backend (not built yet)

- NestJS + TypeScript + PostgreSQL
- JWT authentication with refresh tokens
- Each user owns their own data
- AI integration via Anthropic API

## Code conventions

- Named exports only (no default exports)
- Each page in its own folder with index.tsx
- Each component in its own folder with index.tsx
- Services layer handles all API calls, never call fetch directly from a component
- Keep components small and focused
- Forms always use React Hook Form + Zod
- Server state always managed by TanStack Query
- All text hardcoded in English for now (i18n will be added later via Claude Code)
- Always use CSS variables from index.css for colors, never hardcode hex values in components
- Use Tailwind classes for all styling, never inline styles
- CSS variables are registered in @theme block in index.css
- Available classes: bg-purple, bg-bg-primary, bg-bg-secondary, bg-bg-tertiary, text-text-primary, text-text-secondary, text-text-muted, border-border, etc.
- Do not add comments to the code unless the logic is genuinely complex and non-obvious. Never add comments that just describe what the code is doing.
