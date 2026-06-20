# ERD

```mermaid
erDiagram
    PROFILES {
        uuid id PK "FK -> auth.users"
        text full_name
        text avatar_url
        text phone
        timestamptz created_at
        timestamptz updated_at
    }
```

> **Note:** `courses` and `groups` tables are not referenced anywhere in `untitled/src/` and are intentionally omitted from this diagram. If they are introduced later, they can be added as placeholder entities.
