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

- Show match score on each card (see Job Match section for scoring rules)
- Match score display format: TBD (%, stars, or color indicator)
- Rejected flow: currently removes the card after capturing the stage. Wrong-stage re-routing and the LevelUp interview debrief flow are deferred until LevelUp ships.

#### Mobile

- Kanban on mobile is a challenge. Display one column at a time with horizontal swipe navigation between columns. TBD on final approach.

---

## Page: Resume Analyzer (/resume)

### Pending

#### Upload

- Accept PDF only, max 10MB
- Show clear error for wrong file type or oversized file
- Prevent misuse: validate that the file looks like a resume before processing (basic check)

#### AI Analysis output

- Strengths: things done well, with impact, specific achievements
- Weaknesses: generic statements, missing impact, vague descriptions
- Attention points: experiences with very little to say, being too generalist, having too many unrelated skills
- ATS score: explain what ATS is, give a score and specific tips to improve it

#### Post-analysis flow

- Option 1: Upload a new resume (user improved based on feedback)
- Option 2: Save profile for Job Match use

#### Save profile flow

- AI summarizes user profile in natural language (e.g. "You are a senior software engineer with experience in React and Node.js, worked in EdTech serving 1M+ users...")
- Ask user to confirm or adjust the summary
- If adjust: open a text input, user types changes, AI merges old + new info and regenerates summary
- Repeat until user confirms
- Also ask:
  - Remote only or open to hybrid/on-site?
  - Location (country/city) — used for location-based early exit in Job Match

---

## Page: Job Match (/job) — formerly Job Analyzer

### Gate

- If user has not completed Resume Analyzer and saved their profile: show a blurred background with a centered message explaining that the Resume Analyzer must be completed first. Show a CTA button "Analyze my resume".

### Input

- Job Title field (free text)
- Job Description textarea — large, but capped at 8000 characters
- Analyze button

### Early exits (before full analysis)

- If job is on-site or hybrid AND user only accepts remote: show early exit message, do not process further
- If job is US-based only AND user is not in the US: show early exit message, do not process further

### AI Output structure (in order)

1. Fit score (0–100)
   - Below 50: not a fit
   - 50–60: borderline
   - 60–70: partial fit
   - 70–80: good fit
   - 80–90: great fit
   - 90–100: excellent fit
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
- 70–80: teal — bg-teal / text-teal
- 80–90: teal with higher opacity
- 90–100: green — text-green-400 / bg-green-400

### Post-analysis actions

- If fit score >= 60: show "Generate why I'm a great fit" button — generates a short, natural-sounding message for LinkedIn Top Choice or recruiter outreach
- "Add to Board" button — opens a pre-filled job creation form (see below)

### Add to Board form (modal/drawer)

Fields (pre-filled from analysis where available):

- Job title
- Job description (from textarea)
- Match verdict (from AI output)
- Required skills (editable tags)
- Nice to have skills (editable tags)
- Contract type
- Salary
- Benefits
- Job URL (optional, free text)
- Notes (free text, user's own observations)

On confirm: job is added to Board as "Applied", show success toast with options to "Add another job" or "Go to Board".

---

## Page: LevelUp (/levelup)

### Purpose

Track interview failures and turn them into a structured study plan.

### Data source

- Populated when user discards a job as "Rejected" from the Board
- During the rejection flow, user is asked: what questions did you struggle with? What was the correct answer?
- Each question has a type: Behavioral, Conceptual (e.g. "how does virtual DOM work"), or Algorithm (user can paste code)

### Display

- Group weak points by category, not by job
  - e.g. "Algorithms (3)", "System Design (1)", "Behavioral (2)"
- Clicking a category expands to show each weak point with:
  - The question asked
  - The correct answer / what should have been said
  - The job it came from (for context)
  - A checkbox to mark as "mastered"
- Mastered items are never deleted, just visually checked off and moved to a "Mastered" section
- User can always uncheck if they want to revisit

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

---

## V2 Ideas (not planned yet)

- Resume Builder: using saved profile as base, AI asks questions to flesh out a full resume and generates a PDF
- Interview Prep: per-job preparation guide based on job description
- Jobs Closed page: archive of all discarded/rejected jobs with full history
