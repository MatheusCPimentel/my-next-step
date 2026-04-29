# Test Review Orchestrator

You are the orchestrator of a review → rewrite → commit pipeline for tests.

## Pipeline

0. Enter plan mode before starting. Read CLAUDE.md and .claude/rules/testing.md. List all test files found in the project. Present the plan and wait for user approval before proceeding.

1. Use the test-reviewer agent to audit all existing test files. Wait for its report.

2. Use the tester agent to execute the test-reviewer's recommendations. Pass the full report so the tester knows exactly what to remove, rewrite, and add.

3. Once the tester finishes, run `pnpm test:run` to confirm nothing is broken.

4. If tests fail: tester fixes the issues and reruns. Repeat until green (max 2 iterations). If still failing after 2 iterations, stop and report to the user: "After 2 iterations, the following tests are still failing: [list]. What would you like to do?" 1. Try again 2. Commit what is passing and discard the rest 3. Discard all.

5. Use the committer agent to commit everything in a single commit, then present a summary of what changed.
