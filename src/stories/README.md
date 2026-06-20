# Storybook

This folder is reserved for Storybook metadata only.

Rules:
- Stories may import production components from `src/components/**` or `src/features/**/components/**`.
- Production code must never import from `src/stories/**`.
- Do not place reusable components, services, mocks used by production, or CSS needed by production code in this folder.
