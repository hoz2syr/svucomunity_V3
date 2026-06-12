# SVU Community — Project Overview

Level 1: `apps/` (frontend applications)
- apps/admin
- apps/courses
- apps/schedule
- apps/web

Level 2: each app’s `src/main.tsx` (entry point)
- apps/schedule/src/main.tsx
- apps/courses/src/main.tsx
- apps/admin/src/main.tsx
- apps/web/src/app.js

Supporting:
- packages/ (shared libraries: config, supabase-client, types, ui, utils)
- supabase/ (migrations + edge functions)
- docs/ (architecture, API, guides)

```mermaid
graph TD
    A["apps/"] --> B["schedule"]
    A --> C["courses"]
    A --> D["admin"]
    A --> E["web"]
    B --> B1["src/main.tsx"]
    C --> C1["src/main.tsx"]
    D --> D1["src/main.tsx"]
    E --> E1["src/app.js"]

    A --> P["packages/"]
    P --> P1["config"]
    P --> P2["supabase-client"]
    P --> P3["types"]
    P --> P4["ui"]
    P --> P5["utils"]

    A --> S["supabase/"]
    S --> S1["migrations"]
    S --> S2["functions"]
```
