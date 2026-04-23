# PRODUCT.md — MyNextStep Product Specification

This file describes the full product vision, feature details, and current build status.
Agents must read this file before building any feature.
When a feature is completed, move it from "Pending" to "Done" in the relevant section.

---

## Page: Dashboard

### Status: Partially done

### Done

- Welcome message with time-aware greeting and user name
- Stats section with Open Processes and Improvement Points cards
- Quick Actions section with navigation to all pages

### Pending

- Open Processes count must reflect the actual number of jobs currently on the Board
- Improvement Points count must reflect unchecked items in LevelUp
- Add a Recent Activity section below Quick Actions showing the last user actions on the board (e.g. "You moved Stripe to Technical Interview 2 days ago")
- Quick Action cards should be larger with a better description of what each feature does

---

## Page: Board (/board)

### Status: Partially done

### Done

- Kanban layout with 4 mocked columns
- Job cards with company name, role and tech stack tags

### Pending

#### Column behavior

- Applied (first) and Offer (last) columns are fixed and cannot be moved or deleted
- Middle columns are fully customizable: user can add, rename, reorder and delete them
- Maximum of 20 columns total
- To delete a column: show a trash icon on hover (top right of column). If the column has jobs, show a modal saying the column cannot be deleted while it has jobs. If empty, ask for confirmation before deleting.
- To reorder columns: show a drag handle icon (top left) on hoverable columns. Use dnd-kit for drag and drop of both columns and cards.
- To add a column: show an Add button between columns on hover. Clicking opens a small inline input to name the new column.
- A /board/settings route (or modal) will allow full board configuration

#### Card behavior

- Cards can be moved between any columns freely, no step-by-step restriction
- Show match score on each card (see Job Match section for scoring rules)
- Match score display format: TBD (%, stars, or color indicator)
- Cards can be dragged to a "Discard" drop zone at the bottom of the board (dashed border, "Drop here to discard")
- On drop to discard zone, show two options:
  1. Discard (no longer interested / found something better)
  2. Rejected (failed at this stage)
- If Rejected: confirm the stage where rejection happened. If wrong stage, ask user to move card to correct stage first, then try discarding again. If correct, proceed to LevelUp interview debrief flow (see LevelUp section).

#### Add new job button

- Top right of the board header
- Opens the same Job creation form as adding from Job Match (see Job Match section)

#### Mobile

- Kanban on mobile is a challenge. Display one column at a time with horizontal swipe navigation between columns. TBD on final approach.

---

## Page: Resume Analyzer (/resume)

### Status: Partially done (UI only, no real AI)

### Done

- File upload area with drag and drop
- Mocked analysis result with sections

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

### Status: Placeholder (header only)

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

### Status: Not started

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

---

## V2 Ideas (not planned yet)

- Resume Builder: using saved profile as base, AI asks questions to flesh out a full resume and generates a PDF
- Interview Prep: per-job preparation guide based on job description
- Jobs Closed page: archive of all discarded/rejected jobs with full history
