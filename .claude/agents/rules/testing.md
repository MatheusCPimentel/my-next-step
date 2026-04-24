# Testing Conventions

## Framework

Vitest + React Testing Library. Config in vite.config.ts, setup in src/test/setup.ts.

## Commands

- `npm run test` — watch mode
- `npm run test:run` — one-shot (CI)

## What to test

- Business logic and validation rules (limits, required fields, error states)
- State reset: local state resets correctly on close and on confirm
- Edge cases: empty state, maximum limits, invalid input
- Second-use scenarios: component behaves correctly on second open with no leftover state

## What NOT to test

- Visual styling or Tailwind classes
- Drag and drop behavior
- Animations

## File location

Test files live alongside the component they test:
src/pages/Board/DiscardDialog.test.tsx
src/components/Sidebar/SidebarItem.test.tsx

## Naming

- File: ComponentName.test.tsx
- Describe block: component or function name
- Test: plain english describing the behavior, not the implementation

Example:

```typescript
describe("DiscardDialog", () => {
  it("resets state when closed before confirming", () => {});
  it("requires all question fields when at least one pair exists", () => {});
  it("hides the add question button at 8 pairs", () => {});
});
```

## Arrange, Act, Assert

Always follow AAA pattern. One assertion per concept, not per line.

## Mocking

- Mock fetch calls and external services, never internal modules
- Use factory functions for repeated test data

Example:

```typescript
const makeQuestion = (overrides = {}) => ({
  question: "What is React?",
  answer: "A UI library",
  ...overrides,
});
```
