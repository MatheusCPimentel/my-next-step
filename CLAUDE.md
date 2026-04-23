# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

MyNextStep — an AI-powered career hub for tracking job applications, analyzing resumes/job descriptions, and improving from interview feedback.

## Commands

```bash
npm run dev      # start dev server (Vite, http://localhost:5173)
npm run build    # tsc + vite build
npm run lint     # eslint
```

No test framework is set up yet.

To add a shadcn component: `npx shadcn add <component>` (uses `radix-nova` style, see `components.json`).

## Tech stack

React 19 + Vite + TypeScript · React Router v7 · Tailwind CSS v4 · Shadcn/ui (radix-nova preset) · React Hook Form + Zod · TanStack Query · Framer Motion · Lucide icons

## Architecture

### Routing

All routes are nested under `<Layout>` in `src/App.tsx` using React Router's layout route pattern. `Layout` renders `<Outlet />` — adding a new page means adding a `<Route>` inside the existing layout route, never wrapping pages individually.

### Layout + Sidebar

`Layout` (`src/components/Layout/`) owns the mobile drawer state (`drawerOpen`). It renders the desktop `<Sidebar>` and, via `AnimatePresence`, the mobile drawer (a second `<Sidebar isMobileDrawer>`).

`Sidebar` (`src/components/Sidebar/`) owns its own `collapsed` state. It animates its width between 64 px (collapsed) and 220 px (expanded) using Framer Motion `animate={{ width }}` on `motion.aside`.

`SidebarItem` uses a fixed `w-10 h-10` icon wrapper with `mx-auto` for centering. Labels are **always in the DOM** — collapse is achieved by animating `maxWidth` (0 → 200) and `opacity` on a `motion.span` with `flex-1`. This prevents the label from pushing the icon during animation. `AnimatePresence` is not used for nav labels.

### CSS / Design tokens

`src/index.css` uses a single `@theme` block (Tailwind v4) that registers all design tokens as Tailwind utilities:

| Tailwind class                      | Value                               |
| ----------------------------------- | ----------------------------------- |
| `bg-background` / `text-background` | `#1a1a18` (page bg)                 |
| `bg-surface`                        | `#222220` (sidebar, cards)          |
| `bg-overlay`                        | `#2C2C2A` (hover states, avatar bg) |
| `text-primary`                      | `#F1EFE8`                           |
| `text-secondary`                    | `#B4B2A9`                           |
| `text-muted`                        | `#888780`                           |
| `bg-purple` / `text-purple`         | `#534AB7` (primary action)          |
| `bg-teal` / `text-teal`             | `#1D9E75` (progress/success)        |
| `border-border`                     | `rgba(255,255,255,0.08)`            |

Use opacity modifiers for tints: `bg-purple/15` = 15% purple.

**Never use inline `style` for colors** — always use Tailwind classes from the tokens above.

### Path alias

`@/` maps to `src/`. Use it for all internal imports.

## Conventions

- Named exports only — no default exports (except `App.tsx` which Vite requires)
- Each page and component lives in its own folder with `index.tsx`
- Server state → TanStack Query. Forms → React Hook Form + Zod. Never call `fetch` directly from a component — go through `src/services/`
- All text hardcoded in English (i18n deferred)
- No comments unless logic is genuinely non-obvious
- Dark mode only; design reference: Linear, Perplexity
- When changes affect project structure, stack, or conventions, update this file
- Before building any feature, read PRODUCT.md to understand the full product context, feature rules, and what is already done

## Pages

| Route      | Page            | Status      |
| ---------- | --------------- | ----------- |
| `/`        | Dashboard       | in progress |
| `/board`   | Board           | in progress |
| `/resume`  | Resume Analyzer | in progress |
| `/job`     | Job Match       | not started |
| `/levelup` | LevelUp         | not started |

## Backend (not built)

NestJS + TypeScript + PostgreSQL · JWT auth with refresh tokens · Anthropic API for AI features. All data is mocked client-side for now.
