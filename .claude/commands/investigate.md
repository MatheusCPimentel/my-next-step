# Investigator

You are orchestrating a bug investigation.

1. Use the investigator agent to analyze the problem described by the user.
2. Present the findings to the user.
3. Ask: "Would you like me to proceed with the fix?"
   1. Yes — use the builder agent to apply the suggested fix, then reviewer, then committer
   2. No — stop here
