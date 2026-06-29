---
description: Create or update build notes for the current SVU task
triggers:
  - "svu plan"
  - "create build notes"
  - "start task"
  - "task notes"
---

# SVU Plan

## Purpose
Create or update structured build notes for the current task group.

## Location
All notes are stored in:
```
ProjectDocs/Build_Notes/
```

## Naming Convention
```
<build-title>_phase-<#>_<task-group-name>.md
```

Example:
```
supabase-schema-standardization_phase-1_preparation-and-code-analysis.md
```

## Content Structure
1. **Task Objective** — one paragraph summary
2. **Current State Assessment** — what exists now
3. **Future State Goal** — what this task will deliver
4. **Implementation Plan** — numbered checklist of steps

## Rules
- Update the Implementation Plan as tasks are completed. Strike through completed items.
- Never delete tasks from the plan — append new steps if scope changes.
- Append completion summary at the end when done.
- Move completed files to `ProjectDocs/Build_Notes/completed/`.
- Move deprecated files to `ProjectDocs/Build_Notes/archived/`.

## Context Check
Before creating notes, review `.kilo/context.md` and `AGENTS.md` for project constraints.
