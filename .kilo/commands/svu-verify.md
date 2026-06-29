---
description: Run full verification chain for the SVU Community project
triggers:
  - "svu verify"
  - "verify project"
  - "run all checks"
  - "full verification"
---

# SVU Verify

## Purpose
Run the full verification chain before marking any task complete.

## Steps

1. **Lint**
   ```bash
   npm run lint
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Test**
   ```bash
   npm run test
   ```

4. **Storybook** (if UI or components changed)
   ```bash
   npm run build-storybook
   ```

## Rules
- If any step fails, document the failure in the session log.
- Do not hide or suppress failures.
- Do not expand scope to fix unrelated failures.
- Report exact command output and exit codes.

## Output
Return:
- Which commands passed
- Which commands failed with error excerpts
- Recommendation for next step
