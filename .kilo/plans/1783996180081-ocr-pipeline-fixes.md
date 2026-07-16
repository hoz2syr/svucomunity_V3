# OCR Pipeline Fix Plan

## Problem
OCR extraction consistently fails. The user wants the full extraction pipeline reviewed and fixed.

## Confirmed Root Cause
`app/services/ocr_service.py:58-74` — `_run_with_image_patch` writes `img-0.jpeg` to the current working directory. When CWD is non-writable (service runtime, container, system folder), the write fails and the OCR callback crashes.

## Already Changed
None — the current plan only identified issues but did not apply fixes yet.

## Proposed Changes

### 1. Fix `_run_with_image_patch` in `app/services/ocr_service.py`
- Replace CWD write with `tempfile.mkdtemp()` and place dummy JPEG inside it.
- Clean up the temp directory in `finally`.
- Add `import tempfile` at the top.
- Rationale: Makes the workaround independent of CWD permissions and safe for concurrent runs.

### 2. Fix File Size Validation in `app/api/upload.py`
- Extract `file_size = file.size or 0` before `validate_file(...)`.
- Add an explicit `if file_size > MAX_FILE_SIZE: raise HTTPException(...)` before creating job dir.
- Rationale: `file.size` can be `None` for chunked uploads; current code silently bypasses the limit.

### 3. Improve Pipeline Error Handling in `app/services/pipeline.py`
- Replace broad `except Exception as e:` with narrower expected exceptions.
- Log full traceback.
- Write sanitized error message to `status.json` without internal details.

### 4. Fix Export Module in `app/services/export.py`
- Remove or replace the invalid `pdf.write_html(...)` call in `_render_markdown_to_pdf`.
- Use `FPDF`’s built-in rendering path only; no non-existent methods.
- Add cross-platform font fallback so PDF generation works on Linux/macOS too.

### 5. Add Pipeline Tests
- Add `tests/test_pipeline.py` covering:
  - Successful end-to-end pipeline execution with mocked Mistral client.
  - Failure path when OCR service raises an exception.
  - Validation that `status.json` is written correctly on success and failure.
- Rationale: The pipeline is untested end-to-end; current tests only cover API routing and export utilities.

## Verification
1. Run `python -m pytest tests/` to confirm existing tests still pass.
2. Run the new pipeline tests.
3. If UI changed: `npm run build` (frontend).
4. If logic/tests changed: `npm run test` (only for frontend logic; backend uses pytest).

## Out of Scope
- Frontend changes.
- Authentication, auth/session/RBAC changes.
- Database migrations.
- Removing or refactoring the Mistral SDK workaround entirely beyond the tempdir fix.
