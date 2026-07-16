# OCR UX Enhancement Plan — Interactive Export + Inline Editing

## Goal
Improve user interaction with OCR outputs: enable inline editing of extracted text directly in the SplitView, with debounced auto-save to backend, and preserve original OCR output separately from user edits.

## Decisions Made
- **Correction approach**: Local only (no re-OCR). User edits markdown, backend re-exports PDF/DOCX from edited text.
- **Edit placement**: Replace right-panel markdown display in SplitView with an editable textarea + preview toggle.
- **Original preservation**: `raw_ocr.md` keeps original OCR output; `edited.md` stores user edits.
- **Auto-save**: Debounced (~1.5s) `PUT /api/jobs/{job_id}/edit` to persist edits to backend.

## Files to Modify

### Backend
1. `app/api/jobs.py` — Add `edited_markdown` field to response schema.
2. `app/api/edit.py` (new) — `PUT /api/jobs/{job_id}/edit` endpoint: accepts `{markdown: str}`, saves to `edited.md`, triggers re-export of PDF/DOCX, updates `status.json`.
3. `app/services/pipeline.py` — Extract re-export logic into `re_export_job(job_id, markdown)` function so it can be called independently.
4. `app/models/schemas.py` — Add `edited_markdown` to `JobStatus` model.

### Frontend
1. `frontend/src/services/api.ts` — Add `editJobMarkdown(jobId, markdown)` function.
2. `frontend/src/components/ocr/EditableMarkdown.tsx` (new) — Component with:
   - `mode: 'edit' | 'preview'` toggle
   - Edit mode: `<textarea>` with RTL support, monospace font
   - Preview mode: `ReactMarkdown` render
   - Debounced auto-save indicator (saving... / saved / error)
   - Props: `markdown`, `onMarkdownChange`, `jobId`, `isSaving`, `saveError`
3. `frontend/src/components/ocr/ResultView.tsx` — Replace `ReactMarkdown` in split view and markdown tab with `EditableMarkdown`.
4. `frontend/src/components/FileUpload.tsx` — Add:
   - `editedMarkdown` state (init from `status.result.raw_markdown`)
   - Debounced save effect (1.5s) calling `editJobMarkdown`
   - `isSaving` / `saveError` state
   - Pass props to `ResultView`

## Data Flow
```
User edits textarea
  → local state updates (instant)
  → debounce 1.5s
  → PUT /api/jobs/{job_id}/edit {markdown}
  → backend saves edited.md
  → backend re-exports PDF/DOCX
  → backend updates status.json
  → next poll returns updated paths
```

## Edge Cases
- Edit while processing: disable editor until status is `completed`.
- Empty markdown: allow but show warning.
- Concurrent edits: last-write-wins (acceptable for single-user).
- Re-export failure: keep edited.md, mark PDF/DOCX as unavailable in status.

## Validation
1. Edit markdown → verify `edited.md` created on backend.
2. Re-export → verify new PDF/DOCX generated.
3. Refresh page → verify edited text loads (not original).
4. Auto-save indicator shows correct state.
