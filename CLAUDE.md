# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

When a feature ships, remove its entry from PRODUCT.md — git history is the record. PRODUCT.md only tracks what is still pending, technical debt, and V2 ideas.
Agents must update this file whenever project structure, stack, or conventions change.

## What this is

MyNextStep — an AI-powered career hub for tracking job applications, analyzing resumes/job descriptions, and improving from interview feedback.

## Commands

pnpm dev # start dev server (Vite, http://localhost:5173)
pnpm build # tsc + vite build
pnpm lint # eslint
pnpm test # vitest watch mode
pnpm test:run # vitest one-shot (CI)

For testing conventions, read .claude/rules/testing.md before writing any test.

To add a shadcn component: pnpm dlx shadcn add <component> (uses radix-nova style, see components.json).

## Tech stack

React 19 + Vite + TypeScript · React Router v7 · Tailwind CSS v4 · Shadcn/ui (radix-nova preset) · React Hook Form + Zod · TanStack Query · Framer Motion · Lucide icons · dnd-kit · Vitest + React Testing Library

## Architecture

### Routing

All routes are nested under <Layout> in src/App.tsx using React Router's layout route pattern. Layout renders <Outlet /> — adding a new page means adding a <Route> inside the existing layout route, never wrapping pages individually.

### Layout + Sidebar

Layout (src/components/Layout/) owns the mobile drawer state (drawerOpen). It renders the desktop <Sidebar> and, via AnimatePresence, the mobile drawer (a second <Sidebar isMobileDrawer>).

Sidebar (src/components/Sidebar/) owns its own collapsed state. It animates its width between 64px (collapsed) and 220px (expanded) using Framer Motion animate={{ width }} on motion.aside.

SidebarItem uses a fixed w-10 h-10 icon wrapper with mx-auto for centering. Labels are always in the DOM — collapse is achieved by animating maxWidth (0 → 200) and opacity on a motion.span with flex-1. This prevents the label from pushing the icon during animation. AnimatePresence is not used for nav labels.

### Page structure

Pages live in src/pages/<PageName>/index.tsx. Sub-components used only by that page nest under src/pages/<PageName>/components/<ComponentName>/index.tsx, with a co-located index.test.tsx when it exists. Shared page data/types stay at the page root (e.g. types.ts, mockData.ts).

Current Board layout:
src/pages/Board/
components/
AddColumnButton/{index.tsx, index.test.tsx}
BoardColumn/{index.tsx, index.test.tsx}
DiscardDialog/{index.tsx, index.test.tsx}
DiscardZone/index.tsx
JobCard/index.tsx
index.tsx
mockData.ts
types.ts

Shared components live in src/components/<ComponentName>/index.tsx:
src/components/
JobDialog/{index.tsx, index.test.tsx}
TagInput/{index.tsx, index.test.tsx}
Layout/
Sidebar/
ui/ (shadcn primitives)

### CSS / Design tokens

src/index.css uses a single @theme block (Tailwind v4) that registers all design tokens as Tailwind utilities:

bg-background / text-background — #0f0f0d (darkest, body bg)
bg-page — #111110 (main content area)
bg-surface — #141412 (sidebar)
bg-overlay — #1a1a18 (cards, pills, inputs)
text-primary — #F1EFE8
text-secondary — #B4B2A9
text-muted — #888780
bg-purple / text-purple — #534AB7 (primary action)
text-purple-mid — #7B6FD4 (accent icon)
text-purple-soft — #A89FE8 (active nav text)
bg-teal / text-teal — #1D9E75 (progress/success)
border-border — rgba(255,255,255,0.08)
border-border-hover — rgba(255,255,255,0.15)

Use opacity modifiers for tints: bg-purple/15 = 15% purple.
Never use inline style for colors — always use Tailwind classes from the tokens above.

### Path alias

@/ maps to src/. Use it for all internal imports.

## Conventions

- Named exports only — no default exports (except App.tsx which Vite requires)
- Each page and component lives in its own folder with index.tsx
- Server state → TanStack Query. Forms → React Hook Form + Zod. Never call fetch directly from a component — go through src/services/
- All text hardcoded in English (i18n deferred)
- No comments unless logic is genuinely non-obvious
- Dark mode only; design reference: Linear, Perplexity
- When changes affect project structure, stack, or conventions, update this file
- Before building any feature, read PRODUCT.md to understand the full product context, feature rules, and what is already done

## Pages

Route Page Status
/ Dashboard in progress
/board Board in progress
/resume Resume Analyzer in progress (full stepper flow built)
/job-match Job Match in progress
/levelup LevelUp in progress

## Backend (not built)

NestJS + TypeScript + PostgreSQL · JWT auth with refresh tokens · Anthropic API for AI features. All data is mocked client-side for now.

## Technical Decisions

### Drag and Drop

- Library: dnd-kit (@dnd-kit/core + @dnd-kit/sortable)
- Used for: card movement between columns AND column reordering

### File Upload

- No external library needed for Resume Analyzer upload
- Use native HTML input[type=file] with drag and drop events
- PDF validation: check file.type === 'application/pdf' and file.size <= 10MB

### AI Integration

- All AI features use Anthropic API via the backend (NestJS)
- Frontend never calls Anthropic directly
- For now all AI responses are mocked on the frontend

### Board Column Limits

- Maximum columns: 20
- Minimum columns: 2 (Applied + Offer, both fixed)

### Resume Upload Limits

- File type: PDF only
- Max size: 10MB
