# MyNextStep

An AI-powered career hub that helps users track job applications, analyze resumes and job descriptions, and improve based on interview feedback.

## Tech stack

- React + Vite + TypeScript
- React Router for navigation
- Tailwind CSS v4 with CSS variables in @theme block in src/index.css
- Shadcn/ui for components (Radix + Nova preset)
- React Hook Form + Zod for forms and validation
- TanStack Query for data fetching and cache
- Framer Motion for animations
- Lucide for icons

## Design system

- Dark mode only
- Style reference: Linear, Perplexity — lightweight + tech feeling
- Mobile first, sidebar navigation that becomes a hamburger drawer on mobile

## Pages and routes

- / — Dashboard: overview of open processes, improvement points, quick actions
- /board — Kanban board with stages: Applied, HR Interview, Technical Interview, Offer
- /resume — Resume Analyzer: user uploads resume, AI analyzes and returns structured feedback
- /job — Job Analyzer: user pastes a job description, AI returns fit score, missing skills, salary estimate
- /levelup — LevelUp: tracks weak points from failed interviews, allows study and progress tracking

## Folder structure

src/
  assets/
  components/
    Layout/         # Layout wrapper only
    Sidebar/        # Sidebar, SidebarItem
    ui/             # Shadcn components
  hooks/
  lib/
  pages/
    Dashboard/
    Board/
    ResumeAnalyzer/
    JobAnalyzer/
    LevelUp/
  services/
  types/

## Current state

- Routing configured and working
- Global styles and CSS variables defined in src/index.css
- Shadcn installed with Radix + Nova preset
- Path alias configured (@/ maps to src/)
- Layout and Sidebar fully built with collapse and mobile drawer
- All pages returning placeholder content
- No backend integration yet, all data is mocked

## Backend (not built yet)

- NestJS + TypeScript + PostgreSQL
- JWT authentication with refresh tokens
- Each user owns their own data
- AI integration via Anthropic API

## Commands

- npm run dev — start dev server
- npm run build — production build
- npm run lint — run eslint

## Rules

- Named exports only, no default exports
- Each page and component in its own folder with index.tsx
- Services layer handles all API calls, never call fetch directly from a component
- Keep components small and focused
- Forms always use React Hook Form + Zod
- Server state always managed by TanStack Query
- All text hardcoded in English for now, i18n will be added later
- Do not add comments unless the logic is genuinely complex and non-obvious
- When you make changes that affect project structure, stack, or conventions, update this file if relevant