# Authentication subsystem review update

This update adds an external review, defect register, remediation map, additional Mermaid diagrams, and a reusable inspection workspace for the auth flows.

## Included artifacts

```text
auth-login-subsystem/
├── docs/
│   └── review-summary.md
├── review-register/
│   ├── defects-register.md
│   └── remediation-map.md
├── diags/
│   ├── architecture.mmd
│   ├── login-flow.mmd
│   ├── auth-states.mmd
│   ├── error-flows.mmd
│   ├── db-schema.mmd
│   ├── csrf-session.mmd
│   ├── admin-security.mmd
│   ├── test-coverage.mmd
│   └── defects-map.mmd
└── README.md
```

## Usage

- Use `review-register/` as the canonical list of issues and fixes.
- Render `.mmd` files with Mermaid Markdown or an online diagram viewer.
- Use Markdown View or Kilo document viewer to open the `.md` files in place.

## Note

The diagrams use standard Mermaid syntax; no extra renderer is bundled in this repo. Opening them through a Markdown viewer is the recommended workflow here.
