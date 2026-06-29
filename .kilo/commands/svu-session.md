---
description: Start, update, or close a session log for a SVU task
triggers:
  - "svu session"
  - "start session"
  - "close session"
  - "task session"
---

# SVU Session

## Purpose
Every executable task must have a session log in `.kilo/sessions/`.

## Session File Location
```
.kilo/sessions/<YYYY-MM-DD>-<task-slug>.md
```

## Required Sections
```md
# Session: <task name>

## Goal
...

## Scope
- In scope:
- Out of scope:

## Files Affected
...

## Steps
1. ...

## Verification
- [ ] npm run lint passed
- [ ] npm run build passed
- [ ] npm run test passed

## Result
...

## Risks
...
```

## Rules
- Do not start execution without creating the session file.
- Update the session file at meaningful milestones.
- Never hide failures — document them in Risks or Result.
- Link the task in `docs/tasks/master-task-list.md`.
