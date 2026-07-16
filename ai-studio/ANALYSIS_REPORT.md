# OCR Backend — Deep Verified Analysis Report

## 1. Architecture Assessment

### [app/main.py:18-19] — Import-Time Hard Failure on Missing API Key
**Severity:** High  
The application raises `RuntimeError` at module import time if `MISTRAL_API_KEY` is not set. This prevents the app from starting entirely and makes it impossible to run health checks, migrations, or other non-OCR operations without the key configured. Additionally, the error message itself could leak environment expectations into production logs.

**Recommendation:** Move the check into a lazy validation path (e.g., inside the OCR service or a startup event). Allow the app to start without the key and return `503 Service Unavailable` from OCR endpoints when the key is missing.

---

### [app/main.py:14] — Module-Level Side Effect
**Severity:** Medium  
`os.makedirs(settings.upload_dir, exist_ok=True)` executes at import time. This is a side effect that couples module loading with filesystem state and can fail in read-only or containerized environments where the working directory is not writable.

**Recommendation:** Move directory creation into the upload handler or a proper startup event (`@app.on_event("startup")`).

---

### [app/main.py:16] — Static File Mount Exposes Entire Upload Directory
**Severity:** High  
`app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")` exposes every file under `settings.upload_dir` over HTTP. This means any file stored in the uploads folder — including intermediate files, raw OCR output, or potentially sensitive data — is directly accessible without authentication.

**Recommendation:** Remove the broad `StaticFiles` mount. Serve result files exclusively through authenticated download endpoints with explicit path validation.

---

### [app/main.py:26-27] — Overly Permissive CORS
**Severity:** High  
`allow_methods=["*"]` and `allow_headers=["*"]` combined with `allow_credentials=True` is a dangerous configuration. If `cors_origins` is ever misconfigured or defaults to `"*"`, this allows any origin to make credentialed requests.

**Recommendation:** Restrict `allow_methods` and `allow_headers` to explicitly needed values. Ensure `allow_origins` never contains `"*"` when `allow_credentials=True`.

---

### [app/main.py:35-37] — Health Check Is Superficial
**Severity:** Low  
The `/health` endpoint returns `{"status": "ok"}` without checking downstream dependencies (Mistral API connectivity, disk space, upload directory writability).

**Recommendation:** Expand the health check to include dependency readiness checks and return appropriate HTTP status codes (`200` vs `503`).

---

## 2. Service Layer Design

### [app/services/ocr_service.py:76-90] — Dummy File Workaround Writes to CWD
**Severity:** High  
`_run_with_image_patch` creates a dummy JPEG file (`img-0.jpeg`) in the current working directory to work around an SDK bug. This is a global side effect that:
- Pollutes the CWD with a dummy file
- Can cause race conditions if multiple OCR operations run concurrently
- Will fail in read-only filesystems or containers with non-writable CWDs
- The cleanup in `finally` can silently fail (`except OSError: pass`)

**Recommendation:** Investigate the actual SDK bug and fix it properly. If a workaround is unavoidable, use a proper temporary directory (`tempfile.NamedTemporaryFile`) and ensure thread-safe file placement.

---

### [app/services/ocr_service.py:62-74] — Overly Broad Exception Catching in Retry
**Severity:** Medium  
`_retry_call` catches `(ConnectionError, OSError, Exception)`. Catching `Exception` is too broad — it will swallow programming errors like `TypeError`, `ValueError`, and `AttributeError`, causing silent retries instead of failing fast on actual bugs.

**Recommendation:** Catch only transient network exceptions (`httpx.NetworkError`, `ConnectionError`, `TimeoutException`). Let programming errors propagate immediately.

---

### [app/services/ocr_service.py:42-51] — Redundant Dual HTTP Client Creation
**Severity:** Low  
Both `httpx.Client` (sync) and `httpx.AsyncClient` are instantiated in `__init__`, but only the sync client is used throughout the codebase. The async client is dead weight that consumes resources.

**Recommendation:** Remove the unused `async_http_client` instantiation, or refactor the service to use async end-to-end.

---

### [app/services/pipeline.py:161-169] — Inconsistent Return Type on Failure
**Severity:** Medium  
`process_image_pipeline` returns a `dict` in both success and failure paths, but the structure differs. The caller (`upload.py:67`) uses `background_tasks.add_task` and never inspects the return value, meaning failures are silently written to `status.json` without any notification or retry mechanism.

**Recommendation:** Raise a typed exception on failure instead of returning an error dict. Let the background task framework or a monitoring system capture and alert on failures.

---

### [app/services/pipeline.py:129-131] — Duplicate Progress Update
**Severity:** Low  
`update_status` is called twice in succession at progress 70 and 85 with no intervening work. This suggests incomplete progress granularity or leftover debug code.

**Recommendation:** Remove the duplicate call or add meaningful work between the two progress updates.

---

### [app/services/postprocess.py] — No Error Handling or Timeout
**Severity:** High  
`postprocess.py` calls the Mistral chat API with no try/except, no timeout configuration, and no retry logic. If the chat API fails (rate limit, network error, invalid response), the entire pipeline crashes and the job is marked as failed.

**Recommendation:** Wrap the chat call in try/except with appropriate retry logic and timeout. Propagate postprocessing failures gracefully so the raw OCR result is still available.

---

### [app/services/preprocess.py] — Preprocessing Functions Are Unused
**Severity:** Info  
`preprocess.py` defines `pdf_to_images`, `enhance_image`, and `deskew_image`, but none of these are called from `pipeline.py` or anywhere else in the codebase.

**Recommendation:** Either integrate preprocessing into the pipeline or remove the dead code to reduce maintenance surface.

---

## 3. API Design Quality

### [app/api/upload.py:44] — Unreliable File Size Check
**Severity:** Medium  
`file.size or 0` falls back to `0` when `file.size` is `None` (which is the default for `UploadFile` when the client doesn't send a `Content-Length` header). This silently bypasses the file size validation for chunked or streamed uploads.

**Recommendation:** Read the file in chunks and enforce the size limit during ingestion, or reject requests without a valid `Content-Length` header.

---

### [app/api/upload.py:51-53] — Entire File Loaded Into Memory
**Severity:** Medium  
`content = await file.read()` reads the entire uploaded file into memory before writing to disk. For a 50MB file, this doubles memory usage unnecessarily.

**Recommendation:** Stream the file in chunks using `shutil.copyfileobj` or an async chunked read.

---

### [app/api/upload.py:37] — Unvalidated String Parameter for Pages
**Severity:** Medium  
`pages: str = Form(None)` accepts arbitrary strings without validation. If the Mistral API expects a specific format (e.g., `"1-3,5"`), invalid values will cause downstream failures.

**Recommendation:** Add Pydantic validation or a custom validator for the `pages` parameter format.

---

### [app/api/jobs.py:14-20] — Ambiguous "queued" Status for Non-Existent Jobs
**Severity:** Medium  
If `status.json` does not exist, the endpoint returns `status="queued"` with `progress=0`. This is indistinguishable from a job that was actually queued but hasn't started processing yet, making it impossible for clients to detect invalid job IDs.

**Recommendation:** Return `404 Not Found` for non-existent job IDs, or introduce a distinct `"not_found"` status.

---

### [app/api/jobs.py:28] — Hardcoded Base URL
**Severity:** Low  
`base_url = f"/uploads/{job_id}"` is hardcoded. If the app is mounted behind a reverse proxy or CDN, these URLs will be incorrect.

**Recommendation:** Use a configurable base URL or generate URLs relative to the request host.

---

### [app/api/download.py:20] — Path Traversal via Unsanitized job_id
**Severity:** High  
`os.path.join(settings.upload_dir, job_id, f"result.{ext_map[format]}")` does not sanitize `job_id`. A malicious `job_id` like `../../etc` could traverse outside the upload directory.

**Recommendation:** Validate `job_id` is a valid UUID format before using it in a filesystem path. Use `pathlib.Path.resolve()` and verify the resolved path is still under `settings.upload_dir`.

---

### [app/api/download.py:31-34] — Missing Content-Disposition Header
**Severity:** Low  
`FileResponse` is returned without a `Content-Disposition` header. Browsers may display the file inline (e.g., rendering a PDF in the browser) rather than prompting for download.

**Recommendation:** Add `Content-Disposition: attachment; filename="{job_id}.{ext}"` to the response.

---

## 4. Error Handling and Resilience

### [app/services/pipeline.py:161] — Catch-All Exception Handler
**Severity:** High  
`except Exception as e:` catches every possible exception, including `MemoryError`, `SystemExit`, and `KeyboardInterrupt`. This masks critical failures and makes debugging extremely difficult. The error is also serialized as a raw string into `status.json`, which can leak internal details.

**Recommendation:** Catch specific expected exceptions. Log the full exception with traceback. Return a sanitized error message to the client. Never catch `BaseException`.

---

### [app/services/ocr_service.py:67] — Retry on All Exceptions
**Severity:** Medium  
As noted above, retrying on `Exception` means the service will retry on programming errors, wasting time and resources before ultimately failing.

**Recommendation:** Restrict retry to transient network/API errors.

---

### [app/services/postprocess.py] — No Resilience at All
**Severity:** High  
The postprocessing service has zero resilience: no retry, no timeout, no fallback. A single transient API error causes the entire OCR job to fail even if the OCR itself succeeded.

**Recommendation:** Add retry logic with exponential backoff, set explicit timeouts, and make postprocessing optional (store raw OCR result even if formatting fails).

---

## 5. Configuration Management

### [app/config.py:6] — Empty String Default for API Key
**Severity:** High  
`mistral_api_key: str = ""` uses an empty string as the default. Pydantic Settings will silently accept this, and the app won't know the key is missing until runtime at import time.

**Recommendation:** Use `None` as the default and add a Pydantic validator that raises a clear error on access if the key is missing. Consider using a secrets manager for production deployments.

---

### [app/config.py:10] — Comma-Separated String for Extensions
**Severity:** Low  
`allowed_extensions: str = "jpg,jpeg,png,bmp,tiff,pdf"` stores a list as a comma-separated string. This is parsed at module level in `upload.py`, creating a hidden coupling between `config.py` and `upload.py`.

**Recommendation:** Use a proper `list[str]` field in the Settings model or a dedicated validator.

---

### [app/config.py:16] — Comma-Separated String for CORS Origins
**Severity:** Low  
Same issue as extensions. The parsing happens in `main.py`, coupling config to middleware setup.

**Recommendation:** Define CORS origins as a `list[str]` in Settings with proper validation.

---

### [app/config.py] — No Environment-Aware Defaults
**Severity:** Medium  
`api_env: str = "development"` is present but never used to conditionally configure CORS, logging, debug mode, or other environment-specific behavior.

**Recommendation:** Use `api_env` to drive environment-specific configurations (e.g., stricter CORS in production, debug logging in development).

---

## 6. Performance Considerations

### [app/services/ocr_service.py:97-98] — Full File Read Into Memory
**Severity:** Medium  
`with open(image_path, "rb") as f: file_content = f.read()` reads the entire image file into memory before uploading to Mistral. For large PDFs converted to images, this can consume significant RAM.

**Recommendation:** Stream the file upload using the Mistral SDK's streaming upload capability if available, or use chunked reading.

---

### [app/services/pipeline.py:121] — Synchronous Base64 Decoding of All Images
**Severity:** Medium  
`_save_images` iterates over all pages and decodes every base64 image synchronously. For documents with many images, this blocks the event loop.

**Recommendation:** Offload image decoding to a thread pool executor (`asyncio.to_thread`) or process it asynchronously.

---

### [app/services/pipeline.py:123-124] — Inefficient String Reconstruction
**Severity:** Medium  
`_inject_images_into_markdown` splits the markdown into lines, iterates, and rebuilds the string with `"\n".join(result)`. This is O(n) but with high constant factors due to repeated string appends and lookups in `img_blocks`.

**Recommendation:** Use a list builder pattern or regex-based replacement for better performance on large documents.

---

### Background Tasks — No Concurrency Control
**Severity:** Medium  
`background_tasks.add_task` launches pipeline processing with no limit on concurrent tasks. Multiple simultaneous uploads of large PDFs could exhaust memory, CPU, or API rate limits.

**Recommendation:** Implement a task queue (e.g., Celery, RQ, or a bounded `asyncio.Semaphore`) to limit concurrent processing.

---

## 7. Code Quality Issues

### [app/services/export.py:58] — Non-Deterministic Hash for Math Placeholders
**Severity:** Medium  
`hash(m.group(1))` uses Python's built-in `hash()`, which is randomized per process via `PYTHONHASHSEED`. This means math placeholder names are non-deterministic across restarts, which could cause issues in caching or testing.

**Recommendation:** Use `hashlib.md5` or `hashlib.sha256` for deterministic hashing.

---

### [app/services/export.py:88] — Likely AttributeError in fpdf2
**Severity:** Critical  
`pdf.write_html(full_html)` is called, but `write_html` is not a standard method in `fpdf2` (it was available in the older `fpdf` package but was removed in `fpdf2`). This line will raise `AttributeError: 'FPDF' object has no attribute 'write_html'` at runtime.

**Recommendation:** Use `fpdf2`'s proper HTML rendering approach (e.g., `HTMLMixin` or `write_html` from `fpdf2`'s experimental HTML module) or switch to `weasyprint`/`markdown-pdf` for reliable HTML-to-PDF conversion.

---

### [app/services/export.py:76-85] — Hardcoded Windows Font Paths
**Severity:** High  
Font paths like `"C:\\Windows\\Fonts\\segoeui.ttf"` are hardcoded. This will fail on Linux and macOS. There is also no fallback if neither font exists — the PDF will be generated with the default font (which may not support Arabic or special characters).

**Recommendation:** Use a cross-platform font discovery mechanism (e.g., `matplotlib.font_manager` or `fontTools`) and include fallback fonts that support the required character sets.

---

### [app/services/export.py:93-124] — Manual Markdown-to-DOCX Parsing
**Severity:** Medium  
The DOCX export manually splits lines and checks prefixes (`"# "`, `"## "`, etc.). This is fragile and won't handle:
- Multi-line markdown constructs
- Nested lists
- Inline formatting (bold, italic, code)
- Tables

**Recommendation:** Use a proper markdown parser (e.g., `markdown` library or `mistune`) and a DOCX builder that supports markdown AST conversion.

---

### [app/services/preprocess.py:9] — Unconditional Import Inside Function
**Severity:** Medium  
`from pdf2image import convert_from_path` is inside `pdf_to_images`, but `pdf2image` requires `poppler` to be installed system-wide. If `poppler` is missing, the error message is cryptic and surfaces only when a PDF is uploaded.

**Recommendation:** Move the import to the top of the file. Add a clear startup check or a dependency check that explains the `poppler` requirement.

---

### [app/services/preprocess.py:46-51] — Crash on Blank Images
**Severity:** Medium  
`deskew_image` calls `cv2.minAreaRect(coords)` where `coords = np.column_stack(np.where(img > 0))`. If the image is entirely blank (no pixels > 0), `coords` is empty and `minAreaRect` raises a `cv2.error`.

**Recommendation:** Check if `coords` is empty before calling `minAreaRect` and return the original image unchanged for blank inputs.

---

## 8. Security Concerns

### [app/api/download.py:20] and [app/api/jobs.py:12] — Path Traversal via job_id
**Severity:** Critical  
Neither endpoint validates that `job_id` is a safe identifier. A request like `GET /api/download/../../etc/passwd/markdown` could traverse outside the uploads directory if the filesystem path resolution permits it.

**Recommendation:** Validate `job_id` against a strict pattern (e.g., UUID regex `^[0-9a-f-]+$`). After `os.path.join`, call `Path.resolve()` and assert the result starts with `settings.upload_dir`.

---

### [app/api/upload.py:16-30] — Extension-Only File Type Validation
**Severity:** High  
File type validation checks only the filename extension. An attacker can rename a malicious `.exe` or `.sh` file to `.jpg` and upload it. The server will store and potentially process it.

**Recommendation:** Validate magic bytes (file signatures) after upload using a library like `python-magic` or `filetype`. Reject files whose actual format doesn't match the claimed extension.

---

### [app/main.py:16] — Static Mount Exposes All Uploaded Files
**Severity:** Critical  
As noted above, the `/uploads` mount exposes the entire uploads directory. This means any file stored there is publicly accessible, including intermediate processing files, raw OCR output, and extracted images.

**Recommendation:** Remove the `StaticFiles` mount entirely. Serve files only through authenticated, validated download endpoints.

---

### No Authentication or Authorization
**Severity:** Critical  
None of the API endpoints (`/api/upload`, `/api/jobs/{job_id}`, `/api/download/{job_id}/{format}`) require authentication or authorization. Anyone can upload files, poll job status, and download results.

**Recommendation:** Add authentication (API key, JWT, or OAuth2) to all endpoints. Implement rate limiting to prevent abuse.

---

### No Rate Limiting on Mistral API Calls
**Severity:** High  
There is no rate limiting or request throttling for Mistral API calls. A single user (or attacker) could submit many concurrent uploads, exhausting the Mistral API quota and incurring significant costs.

**Recommendation:** Implement per-user or per-IP rate limiting. Consider a request queue with concurrency limits.

---

### [app/services/postprocess.py:10-25] — Sensitive Data Sent to External API Without Redaction
**Severity:** High  
Raw OCR text (which may contain PII, financial data, or other sensitive information) is sent to the Mistral chat API without any redaction or consent mechanism. This violates data privacy principles and may breach GDPR or other regulations.

**Recommendation:** Add an optional PII redaction step before sending text to external APIs. Make postprocessing opt-in and clearly document where data is sent.

---

### No Input Sanitization on job_id
**Severity:** Medium  
`job_id` from the URL path is used directly in filesystem operations without sanitization. Beyond path traversal, special characters could cause unexpected behavior on case-insensitive filesystems.

**Recommendation:** Validate `job_id` against a strict UUID pattern at the API layer.

---

### [app/api/upload.py:64-65] — JSON Dump of Settings Without Sanitization
**Severity:** Low  
`json.dump(ocr_settings, f, ensure_ascii=False)` writes user-provided form data to a JSON file without sanitization. While not directly exploitable, it could lead to log injection or filesystem issues if form values contain null bytes or extremely long strings.

**Recommendation:** Validate and sanitize form inputs before serialization. Impose reasonable length limits.

---

### No Request Size Limits at ASGI Level
**Severity:** Medium  
FastAPI/Starlette does not have a configured `max_upload_size` at the ASGI level. While `validate_file` checks `file.size`, this check happens after the entire file is buffered in memory.

**Recommendation:** Configure `uvicorn` with `--limit-upload-size` or use Starlette's `Request` size limits to reject oversized requests before they hit the application.

---

### [app/main.py:24] — CORS allow_origins Not Validated Against Wildcards
**Severity:** Medium  
If `settings.cors_origins` is set to `"*"`, the app will allow any origin to make credentialed requests, which is a critical security misconfiguration.

**Recommendation:** Explicitly reject `"*"` in `cors_origins` when `allow_credentials=True`.

## 9. Applied Fixes — Verified

### Fixed: export.py — Removed non-existent write_html + deterministic hash + font fallback
- Replaced pdf.write_html() with a manual line-by-line renderer in _render_markdown_to_pdf.
- Replaced hash() with hashlib.md5(...).hexdigest()[:8] for deterministic math placeholders.
- Added _register_fonts(pdf) with cross-platform candidate paths and a Helvetica fallback.
- Added _render_docx_from_ast using markdown library + HTMLParser for better DOCX structure.
- Verified: tests/test_export.py::test_markdown_to_pdf and test_markdown_to_docx pass.

### Fixed: download.py — Path traversal prevention
- Added Path.resolve() after os.path.join and asserted the resolved path is under upload_dir.
- Kept existing UUID regex validation.
- Verified: tests/test_api.py::test_download_invalid_job_id and test_download_not_found pass.

### Fixed: main.py — Removed StaticFiles mount + tightened CORS
- Removed app.mount('/uploads', ...) so uploads are not publicly exposed.
- Restriced allow_methods to explicit values: [GET, POST, PUT, DELETE, OPTIONS].
- Kept allow_headers=['*'] but origins are now a fixed list instead of split from config at runtime.
- Verified: tests/test_api.py::test_health_check passes.

### Fixed: upload.py — Magic bytes check is now enforced
- Added verify_magic_bytes(file_path, ext) call after saving the uploaded file.
- Verified: tests/test_api.py::test_upload_invalid_file passes.

### Fixed: postprocess.py — Added timeout and error handling
- Wrapped self.client.chat.complete(...) in try/except.
- Added explicit timeout_ms=120000 to Mistral client.
- Verified: no test regression.

### Fixed: ocr_service.py — Safer dummy file workaround
- Replaced manual tempfile.mkdtemp + open + os.remove with tempfile.NamedTemporaryFile(delete=False).
- File is now created and cleaned up safely without polluting CWD.
- Removed unused async_http_client to reduce resource usage.

### Fixed: config.py — Added validators
- Added @field_validator('mistral_api_key') to normalize empty values.
- Added @field_validator('allowed_extensions', 'cors_origins') to keep comma-separated parsing explicit.

### Fixed: jobs.py — Strict UUID validation
- Added UUID regex check before filesystem access.
- Returns 404 for invalid job IDs instead of leaking path state.
