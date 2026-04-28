# PRODUCT.md — MyNextStep Product Specification

This file tracks what is still pending, technical debt, and V2 ideas. Agents must read it before building any feature.

When a feature ships, remove its entry — git history is the record of what was built. Update this file when product decisions change or when a pending item is delivered.

---

## Page: Dashboard

### Pending

- Open Processes count must reflect the actual number of jobs currently on the Board
- Improvement Points count must reflect unchecked items in LevelUp

---

## Page: Board (/board)

### Pending

#### Column behavior

- A /board/settings route (or modal) for full board configuration

#### Card behavior

- Rejected flow: currently removes the card after capturing the stage. Wrong-stage re-routing and the LevelUp interview debrief flow are deferred until LevelUp ships.

#### Mobile

- Kanban on mobile is a challenge. Display one column at a time with horizontal swipe navigation between columns. TBD on final approach.

---

## Page: Resume Analyzer (/resume)

### Pending

#### Upload

- Show clear error for wrong file type or oversized file (current behavior silently rejects non-PDFs)
- Prevent misuse: validate that the file looks like a resume before processing (basic check)

#### AI Analysis output (spec for backend, currently mocked)

The analysis screen renders the items below from mocked data; the eventual real-AI version (backend, not built) must produce the same shape.

- Strengths: things done well, with impact, specific achievements
- Weaknesses: generic statements, missing impact, vague descriptions
- Attention points: experiences with very little to say, being too generalist, having too many unrelated skills
- ATS score: explain what ATS is, give a score and specific tips to improve it

#### Save profile flow

- Capture the user's work-type preference: remote only, or open to hybrid/on-site
- Capture location (country/city) — used for location-based early exit in Job Match

The summary-confirm/adjust loop itself is built (mocked): the AI-generated summary is shown in a modal, the user can save or open an adjust textarea, "Re-evaluate" merges feedback into a new summary. Real-AI wiring is backend work.

---

## Page: Job Match (/job-match) — formerly Job Analyzer

### Early exits (before full analysis) — pending

Depend on the Save-profile work-type and location capture (see Resume Analyzer).

- If job is on-site or hybrid AND user only accepts remote: show early exit message, do not process further
- If job is US-based only AND user is not in the US: show early exit message, do not process further

### AI Output structure (in order)

The result UI renders all of the items below from mocked data; the eventual real-AI version (backend, not built) must produce the same shape.

1. Fit score (0–100)
   - Below 50: not a fit
   - 50–60: borderline
   - 60–70: partial fit
   - 70–80: good fit
   - 80+: excellent fit
2. Overall score (fit + environment combined) — separate from fit score
3. Job overview (what the role involves, stack summary)
4. Environment assessment (red flags, culture signals, work pace)
5. Required skills — each tagged as: Fit (green) / Partial fit (yellow) / Not a fit (red)
6. Nice to have skills — same tagging
7. Contract type
8. Salary
9. Benefits
10. Final verdict — combines fit score, environment, company size research, and generalist warning if role asks for too many unrelated skills

### Fit score color mapping

- Below 50: red — text-red-500 / bg-red-500
- 50–60: orange — text-orange-400 / bg-orange-400
- 60–70: yellow — text-yellow-400 / bg-yellow-400
- 70–80: teal — text-teal / bg-teal
- 80+: green — text-green-400 / bg-green-400

### Post-analysis actions

- "Add to Board" button is wired to open a pre-filled JobDialog, but the resulting job does not yet flow into Board state — persistence still needs to be implemented (call Board's `handleJobSubmit` from JobMatch's `onSubmit`).
- On confirm: job should be added to Board as "Applied", followed by a success toast with options to "Add another job" or "Go to Board" (success toast not yet implemented).

### Add to Board form (pending wiring)

The JobDialog already pre-fills these fields from the analysis (Job title, Job description, Match verdict, Required skills, Nice to have skills, Contract type, Salary, Benefits) and tags the resulting job with `fromJobMatch: true` and `fitScore`. Still missing:

- Job URL (optional, free text) — not in the prefilled object
- Notes (free text) — not in the prefilled object
- Persistence into Board state on confirm
- Success toast with "Add another job" / "Go to Board" actions

---

## Page: LevelUp (/levelup)

### Purpose

Track interview failures and turn them into a structured study plan.

### Pending

- **Wire to Board's Rejected flow.** The page currently renders mock weak points. The data source described below isn't yet connected — discarding a Rejected job from the Board doesn't create LevelUp entries. The rejection capture flow itself (asking which questions tripped the user up + the correct answer + question type) also needs to be built before this can connect.
- **Mastered ordering / dedicated section.** Mastered items are visually checked off (line-through, dimmed) and stay in place. Moving them to a separate "Mastered" section at the bottom is deferred until persistence lands — ordering is more of a backend concern.
- **Reach-back / un-master.** Already supported (the checkbox toggles both ways), but the UX confirmation isn't designed yet — fine for now.

### Data source (target, not yet wired)

- Populated when user discards a job as "Rejected" from the Board
- During the rejection flow, user is asked: what questions did you struggle with? What was the correct answer?
- Each question has a type: Behavioral, Conceptual (e.g. "how does virtual DOM work"), or Algorithm (user can paste code)

### Out of scope (V2)

- **Manual add.** Adding a weak point not tied to a Rejected job is V2 — the primary loop is rejection → study plan.

## Technical Debt

Items known to need improvement but deferred intentionally.

### JobDialog

- **Layout shift (view → edit):** switching from view to edit mode causes visible reflow because textarea heights differ between the two modes. Needs a fixed-height strategy or animated transition.
- **Layout shift (required skills / nice-to-have):** adding the first tag to either TagInput causes the right column to grow, shifting the layout. Needs reserved minimum height that matches the expected tag row height.
- **Layout shift (validation errors):** when required field errors appear on submit, the modal grows to accommodate them. Needs reserved space below each field.
- **Show more baque:** if a textarea value is very long, clicking "Show more" expands the content abruptly. Needs a smooth expand animation or a paginated approach.
- **Salary field:** currently a free-text string. Should be structured as currency + value in the future. Consider fetching available currencies from an API and combining with a numeric input.

### Board

- **Mobile kanban:** no solution implemented yet. Planned approach is one column at a time with horizontal swipe, but UX is TBD.
- **BoardColumn delete tests rely on `retry: 2` band-aid.** The trash button is `display: none` until the column header is hovered, and clicking it via `fireEvent.click` (the only working option — `userEvent.click` refuses hidden elements) races against Radix's portal-mount path under suite-wide CPU contention. Real fix: programmatically `mouseEnter` the header to reveal the button before clicking it (matches real user flow), or restructure the trash visibility so it's reachable in tests without the hover prerequisite. Until then, the two affected tests use Vitest's `retry: 2`.

### Design tokens

- **Coral and amber are still hardcoded hex.** WeaknessesCard / AttentionPointsCard / Explainer / FeatureSteps reference `#D85A30` and `#EF9F27` as Tailwind arbitrary values (`text-[#D85A30]`, `bg-[#EF9F27]`, etc.). Per the CSS-tokens rule in CLAUDE.md they should be added to the `@theme` block in src/index.css as `bg-coral`/`text-coral` and `bg-amber`/`text-amber` and the call sites updated.

---

## V2 Ideas (not planned yet)

- Resume Builder: using saved profile as base, AI asks questions to flesh out a full resume and generates a PDF
- Interview Prep: per-job preparation guide based on job description
- Jobs Closed page: archive of all discarded/rejected jobs with full history
