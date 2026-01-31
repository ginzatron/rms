---
name: fix-issue
description: Workflow to analyze and fix a GitHub issue
disable-model-invocation: true
---

# Fix GitHub Issue Workflow

Analyze and fix the GitHub issue: $ARGUMENTS

## Steps

1. **Get Issue Details**
   ```bash
   gh issue view $ARGUMENTS
   ```
   Understand the problem, acceptance criteria, and any linked PRs/issues.

2. **Search Codebase**
   Find relevant files and understand the current implementation.

3. **Plan the Fix**
   - Identify root cause
   - Determine files to modify
   - Consider edge cases
   - Check for related tests

4. **Implement Changes**
   - Make minimal, focused changes
   - Follow existing code patterns
   - Don't introduce unnecessary refactoring

5. **Write/Update Tests**
   - Add tests that would have caught the bug
   - Ensure existing tests still pass

6. **Verify**
   - Run the test suite
   - Run linting/type checking
   - Manual verification if applicable

7. **Commit**
   Create a descriptive commit message referencing the issue:
   ```
   Fix: [brief description]

   Fixes #[issue-number]

   [Detailed explanation of the change]
   ```

8. **Create PR**
   ```bash
   gh pr create --title "Fix #[issue]: [brief description]" --body "..."
   ```
   Link to the issue and describe the fix.
