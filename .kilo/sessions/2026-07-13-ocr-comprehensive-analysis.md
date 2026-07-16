# OCR System — Comprehensive Analysis Report

**Date:** 2026-07-13  
**Project:** SVU Community v3.0.0_cleantree — OCR Module  
**Scope:** Complete analysis of `ocr/` folder (backend + frontend + tests)  
**Analyst Teams:** Backend Architecture, Frontend & UX, Security & Configuration, Testing & QA, Integration & Data Flow  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Backend Architecture & Services](#2-backend-architecture--services)
3. [Frontend Architecture & UX](#3-frontend-architecture--ux)
4. [Security & Configuration](#4-security--configuration)
5. [Testing & Quality](#5-testing--quality)
6. [Integration & Data Flow](#6-integration--data-flow)
7. [Consolidated Findings by Severity](#7-consolidated-findings-by-severity)
8. [Prioritized Action Plan](#8-prioritized-action-plan)

---

## 1. Executive Summary

The OCR system is a **full-stack application** for converting handwritten notebook images into PDF, Word, and Markdown formats. It uses **FastAPI** on the backend with **Mistral OCR API** for text extraction, and a **React + Vite + TypeScript** frontend with Arabic RTL support.

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend Framework | FastAPI 0.109.0 |
| OCR Engine | Mistral OCR API (`mistral-ocr-latest`) |
| Image Processing | OpenCV, numpy, Pillow |
| LLM Post-processing | Mistral (`mistral-small-latest`) — *dead code* |
| Export | fpdf2, python-docx, markdown |
| Frontend Framework | React 18.3 + TypeScript 5.5 |
| Frontend Build | Vite 5.4 |
| Styling | Tailwind CSS 3.4 + shadcn/ui v4 (Base UI) |
| Math Rendering | KaTeX (rehype-katex, remark-math) |
| State Management | React hooks (useState, useCallback, useEffect) |
| HTTP Client | Axios |
| Testing | pytest + pytest-asyncio + httpx |

### Project Structure

```
ocr/
├── .env                    # Live API key on disk (CRITICAL)
├── .env.example
├── .gitignore
├── requirements.txt
├── requirements-dev.txt
├── README.md
├── uploads/                # 34 job directories with processed files
├── venv/
├── app/
│   ├── __init__.py
│   ├── main.py             # FastAPI app entry, CORS, static mount
│   ├── config.py           # Pydantic Settings
│   ├── api/
│   │   ├── __init__.py     # Router aggregation
│   │   ├── upload.py       # POST /api/upload
│   │   ├── jobs.py         # GET /api/jobs/{job_id}
│   │   └── download.py     # GET /api/download/{job_id}/{format}
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py      # Pydantic models (loose typing)
│   └── services/
│       ├── __init__.py
│       ├── ocr_service.py  # Mistral OCR client, retry logic
│       ├── pipeline.py     # Main processing orchestration
│       ├── preprocess.py   # Image enhancement (unused in pipeline)
│       ├── postprocess.py  # LLM markdown enhancement (dead code)
│       └── export.py       # Markdown → PDF/DOCX conversion
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── index.html          # RTL Arabic setup
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.css       # RTL prose, custom table styles
│       ├── components/
│       │   ├── FileUpload.tsx   # Monolithic 576-line component
│       │   └── ui/              # shadcn/ui primitives
│       ├── services/
│       │   └── api.ts           # Axios client
│       ├── types/
│       │   └── index.ts         # TypeScript interfaces
│       ├── hooks/
│       │   └── useOCR.ts        # Job status polling hook
│       └── lib/
│           └── utils.ts         # cn() utility
└── tests/
    ├── conftest.py
    ├── test_api.py
    ├── test_export.py
    └── test_preprocess.py
```

### Overall Health Score

| Category | Score | Status |
|----------|-------|--------|
| Architecture | 6/10 | Functional but monolithic |
| Security | 3/10 | Multiple critical vulnerabilities |
| Testing | 5/10 | 71% coverage, core logic untested |
| Code Quality | 6/10 | Clean but with anti-patterns |
| Frontend UX | 7/10 | Good RTL support, some gaps |
| Integration | 4/10 | Port mismatch, broken image paths, dead config |
| **Overall** | **5/10** | **Needs immediate security fixes** |

---

## 2. Backend Architecture & Services

### 2.1 Architecture Assessment

**FastAPI App Structure** (`app/main.py:1-37`)

The application follows a standard FastAPI pattern:
- **Entry point:** `main.py` creates the `FastAPI` app instance
- **Configuration:** `config.py` uses `pydantic-settings` for environment-based config
- **Routing:** Three routers mounted under `/api` prefix (upload, jobs, download)
- **Static files:** Entire `uploads/` directory mounted at `/uploads`
- **CORS:** Configured with dynamic origins from settings

**Strengths:**
- Clean separation of concerns (API → Services → Models)
- Pydantic v2 for validation and settings
- BackgroundTasks for async processing
- Structured logging setup

**Weaknesses:**
- `RuntimeError` raised at import time if `MISTRAL_API_KEY` is missing (`main.py:18-19`) — prevents testing without env var
- No authentication, rate limiting, or request size limits
- Static file mount exposes all uploaded data publicly

### 2.2 Service Layer Design

**OCRService** (`app/services/ocr_service.py:30-215`)

The core OCR service wraps the Mistral API client with:
- **Retry logic:** Exponential backoff with configurable max retries (`_retry_call`, lines 62-74)
- **Working directory patch:** Creates a dummy JPEG in CWD before OCR calls (`_run_with_image_patch`, lines 76-90) — workaround for a Mistral SDK issue
- **Image extraction:** Parses base64 images from OCR response pages
- **Dual modes:** `process_image()` for single images, `process_document()` for PDFs

**Issues:**
- Dummy JPEG pollutes the current working directory (lines 78-89)
- Retry catches `(ConnectionError, OSError, Exception)` — too broad (line 67)
- No timeout on individual OCR calls beyond the HTTP client timeout

**Pipeline** (`app/services/pipeline.py:84-169`)

The orchestration layer:
1. Validates and saves uploaded file
2. Calls OCR service (image or PDF)
3. Extracts and saves images from OCR pages
4. Injects image references into markdown
5. Generates PDF and DOCX exports
6. Writes status.json with results

**Issues:**
- Catch-all `except Exception` masks specific errors (line 161)
- No atomic writes for `status.json` — concurrent writes could corrupt
- No job timeout or cleanup mechanism
- Progress values (10, 20, 50, 70, 85, 100) are hardcoded estimates, not measured

**Preprocessing** (`app/services/preprocess.py:8-61`)

Defines `pdf_to_images`, `enhance_image`, `deskew_image` using OpenCV. **These functions are never called in the pipeline** — the README promises preprocessing but the code sends raw files directly to Mistral.

**PostProcessor** (`app/services/postprocess.py:5-37`)

Uses `mistral-small-latest` (not OpenAI GPT-4o-mini as README claims) to enhance markdown. **Never instantiated or called** in the pipeline. Dead code.

**Export** (`app/services/export.py:1-124`)

- `save_markdown`: Simple file write
- `markdown_to_pdf`: Uses `fpdf2` with `write_html()` — **this method was removed in fpdf2 v2.5+** and will raise `AttributeError` at runtime
- `markdown_to_docx`: Manual line-by-line markdown parsing — fragile and incomplete

**Issues:**
- `pdf.write_html()` is deprecated/removed in fpdf2 (line 88)
- Hardcoded Windows font paths (lines 76-79)
- Manual markdown parsing for DOCX misses many edge cases
- `_wrap_math_for_html` uses `re.DOTALL` with non-greedy match that could match across multiple math blocks

### 2.3 API Design Quality

**Endpoints:**

| Method | Path | Function | Purpose |
|--------|------|----------|---------|
| POST | `/api/upload` | `upload_image` | Upload file, enqueue processing |
| GET | `/api/jobs/{job_id}` | `get_job_status` | Poll job status |
| GET | `/api/download/{job_id}/{format}` | `download_file` | Download result file |
| GET | `/health` | `health_check` | Health check |

**Strengths:**
- RESTful design with clear resource URLs
- `UploadResponse` and `JobStatus` Pydantic models
- BackgroundTasks for async processing

**Weaknesses:**
- No authentication on any endpoint
- No rate limiting
- `JobStatus.result` is `Optional[Dict[str, Any]]` — loose typing (line 9)
- No pagination, filtering, or listing endpoints
- Health check returns `{"status": "ok"}` without checking dependencies (Mistral API, disk space)

### 2.4 Configuration Management

**`app/config.py:1-21`**

Uses `pydantic_settings.BaseSettings` with `SettingsConfigDict(env_file=".env")`. Settings include:
- `mistral_api_key`
- `upload_dir`, `max_file_size`, `allowed_extensions`
- `api_host`, `api_port`, `api_env`
- `cors_origins`

**Issues:**
- `upload_dir` defaults to relative path `./uploads` — should be absolute
- No validation that `upload_dir` is writable
- `cors_origins` is a comma-separated string — error-prone
- `.env` file with live API key exists on disk (security issue)

### 2.5 Error Handling & Resilience

**Strengths:**
- Retry with exponential backoff in OCR service
- Status file written at each pipeline stage for observability
- Graceful degradation in export (fallback markdown parsing)

**Weaknesses:**
- Raw exception messages stored in `status.json` and returned to client (line 166)
- No circuit breaker for Mistral API failures
- No dead-letter queue for failed jobs
- BackgroundTasks have no retry on server restart

---

## 3. Frontend Architecture & UX

### 3.1 Architecture & Project Structure

**Vite + React + TypeScript Setup** (`package.json`, `vite.config.ts`, `tsconfig.json`)

- **Build tool:** Vite 5.4 with React plugin
- **TypeScript:** Strict mode enabled (`strict: true`)
- **Path aliases:** `@` maps to `./src` in both Vite and TS config
- **Dev server:** Port 5173 with API proxy to `localhost:9001` (**mismatch**: backend runs on 9000)

**Component Library:** shadcn/ui v4 using `@base-ui/react` primitives.

### 3.2 Component Design

**FileUpload Component** (`src/components/FileUpload.tsx:25-576`)

A **monolithic 576-line component** that handles:
- File upload zone with drag-and-drop
- Settings form (model, pages, header/footer, images, table format, confidence)
- Job status polling and progress display
- Result rendering in 4 tabs (preview, markdown, tables, images)
- Image zoom and navigation
- Download and copy actions

**Issues:**
- Violates Single Responsibility Principle
- 9 separate `useState` calls for local state
- Complex `renderPreviewContent` function recreated on every render
- `dangerouslySetInnerHTML` in table cells (XSS risk)
- `rehype-raw` allows HTML injection in markdown (XSS risk)

**Recommendations:**
- Extract into sub-components: `UploadZone`, `SettingsPanel`, `ResultViewer`, `MarkdownPreview`, `TableView`, `ImageGallery`, `Toolbar`
- Use `useMemo` for `renderPreviewContent` and derived state
- Replace `dangerouslySetInnerHTML` with sanitized rendering
- Remove `rehype-raw` or sanitize markdown before rendering

### 3.3 State Management

**Polling Hook** (`src/hooks/useOCR.ts:5-57`)

- Polls `/api/jobs/{jobId}` every 2 seconds
- Uses `window.setTimeout` for recursive polling
- No exponential backoff or max retry limit
- No `AbortController` for in-flight requests

**Issues:**
- Stale closure risk: `pollStatusRef` updated in no-deps `useEffect` (lines 40-42)
- No abort on unmount — potential state update on unmounted component
- Polling continues indefinitely for hung jobs

### 3.4 API Integration

**Axios Client** (`src/services/api.ts:1-50`)

- Base URL from `VITE_API_URL` env var or `/api`
- Three endpoints: `uploadImage`, `getJobStatus`, `downloadFile`

**Issues:**
- No request timeout configured — large uploads could hang
- No error interceptor for global error handling
- Download filename hardcoded to `result.{format}`

### 3.5 UX/UI Quality

**Strengths:**
- Full RTL support (`dir="rtl"`, `lang="ar"`, RTL prose styles)
- Arabic font family (Cairo, Tajawal)
- Responsive layout with sidebar and main content area
- Tab-based result viewing (preview, markdown, tables, images)
- Zoom controls for image preview
- Loading, error, and empty states

**Weaknesses:**
- No responsive breakpoints — fixed `w-80` sidebar breaks on mobile
- Icon-only buttons lack `aria-label` for accessibility
- No keyboard shortcuts for zoom
- `processMarkdown` uses fragile string replacement for image paths (lines 138-148)
- `pages` input has no client-side validation

### 3.6 Build Configuration

**Vite Config** (`vite.config.ts:1-24`)
- Proxy points to `localhost:9001` but backend runs on `9000` — **development is broken**
- Custom `outDir: 'dist-build'` — non-standard
- No HTTPS or WebSocket proxy support

**Tailwind Config** (`tailwind.config.js:1-34`)
- Custom primary color palette
- Arabic font family
- Safelist for dynamically constructed classes

---

## 4. Security & Configuration

### 4.1 Authentication & Authorization

**[CRITICAL] No Authentication on Any Endpoint**

All API routes (`/api/upload`, `/api/jobs/{job_id}`, `/api/download/{job_id}/{format}`) and `/health` are completely unauthenticated. Any user can:
- Upload arbitrary files
- Enumerate and read OCR results
- Download processed files
- Trigger expensive Mistral API calls (cost risk / DoS)

**Evidence:** `upload.py:33`, `jobs.py:10`, `download.py:9`, `main.py:35` — no `Depends(auth)` or similar.

### 4.2 Input Validation

**[HIGH] Extension Check Bypass**

`upload.py:23-25` uses `filename.split(".")[-1].lower()` — bypassable with double extensions like `malware.jpg.php`.

**[HIGH] Client-Provided File Size Not Verified**

`upload.py:44` uses `file.size` from client headers. An attacker can omit `Content-Length` and upload arbitrarily large files. The file is read into memory without re-checking size (line 51).

**[MEDIUM] No Magic Bytes Verification**

File type validated only by extension. No content-type or magic bytes check.

**[MEDIUM] Unvalidated `pages` Parameter**

Raw string passed to backend and Mistral API without regex validation.

### 4.3 Secrets Management

**[CRITICAL] Live API Key on Disk**

`.env` file exists with `MISTRAL_API_KEY` in plaintext. Although `.gitignore` excludes it, anyone with filesystem access can read it. **The key must be rotated.**

### 4.4 CORS Configuration

**[MEDIUM] Overly Permissive CORS**

`main.py:21-28`: `allow_credentials=True` with `allow_methods=["*"]` and `allow_headers=["*"]`. Origins hardcoded to dev URLs (`localhost:5173`, `127.0.0.1:5173`).

### 4.5 File Upload Security

**[HIGH] Uploads Directory Mounted as Public Static Files**

`main.py:14-16`: Entire `uploads/` directory exposed at `/uploads`. Anyone with a `job_id` can access:
- Original uploaded files
- OCR results (markdown, PDF, DOCX)
- Extracted images
- Settings JSON
- Raw OCR output
- Status JSON with error messages

**[MEDIUM] No Filename Sanitization**

Original filename used without stripping path separators.

### 4.6 Information Disclosure

**[HIGH] Raw Exception Messages Exposed**

`pipeline.py:161-168`: `str(e)` written to `status.json` and returned to client. Can leak internal paths, API details, stack traces.

**[MEDIUM] RuntimeError Leaks Config**

`main.py:18-19`: Startup error reveals configuration requirements.

**[MEDIUM] Sensitive Data in Plaintext**

Full OCR results including base64 images stored in `status.json` — accessible via unauthenticated endpoint.

### 4.7 Dependency Security

**[HIGH] Multiple Outdated Dependencies**

Pinned versions in `requirements.txt`:
- `fastapi==0.109.0` — multiple CVEs patched in later versions
- `uvicorn==0.27.0` — HTTP request smuggling vulnerabilities
- `python-multipart==0.0.9` — known parsing issues (current: 0.0.26)
- `Pillow==10.2.0` — multiple CVEs (buffer overflows, DoS)
- `numpy==1.26.3` — known vulnerabilities
- `opencv-python-headless==4.9.0.80` — CVEs in older builds

**[MEDIUM] Unpinned Dependencies**

`markdown>=3.5` and `fpdf2>=2.5.0` use open-ended version specifiers — non-reproducible builds.

### 4.8 Infrastructure Security

- No security headers (`X-Content-Type-Options`, `X-Frame-Options`, `HSTS`)
- No HTTPS enforcement
- No ASGI-level request size limits
- Hardcoded Windows font paths in PDF export

---

## 5. Testing & Quality

### 5.1 Test Coverage

| Module | Statements | Missing | Coverage |
|--------|-----------|---------|----------|
| `app/api/download.py` | 15 | 2 | 87% |
| `app/api/upload.py` | 38 | 3 | 92% |
| `app/main.py` | 21 | 1 | 95% |
| `app/services/export.py` | 72 | 12 | 83% |
| `app/services/preprocess.py` | 44 | 16 | 64% |
| `app/services/postprocess.py` | 9 | 4 | 56% |
| `app/services/ocr_service.py` | 98 | 44 | 55% |
| `app/services/pipeline.py` | 104 | 47 | 55% |
| `app/api/jobs.py` | 19 | 8 | 58% |
| **Overall** | **469** | **137** | **71%** |

**Critical Gaps:**
- `ocr_service.py` (55%) — core OCR logic untested
- `pipeline.py` (55%) — main orchestration untested
- `postprocess.py` (56%) — LLM enhancement untested

### 5.2 Test Quality

**Strengths:**
- Tests pass (12/12)
- Basic status code and JSON key assertions
- File existence and size checks for exports

**Weaknesses:**
- No mocking of external services (Mistral API, cv2, pdf2image, fpdf2)
- `test_upload_valid_image` may trigger real OCR calls in CI
- No edge case tests (empty filename, oversized files, invalid formats)
- Test names misleading (`test_get_job_status_not_found` asserts `"queued"` status)
- Global `client` variable in `conftest.py` — not a fixture
- `sys.path.insert` hack instead of proper package structure

### 5.3 Code Quality Gaps

- Unused imports: `re` in `pipeline.py`, `pytest` in test files, `pathlib.Path` in `preprocess.py`
- Missing docstrings on all public functions and classes
- Missing type hints on several function signatures
- `except (ConnectionError, OSError, Exception)` too broad in `ocr_service.py:67`
- `RuntimeError` at import time prevents testing without env var

---

## 6. Integration & Data Flow

### 6.1 Complete Data Flow

```
Frontend (React)                Backend (FastAPI)                External APIs
     |                                 |                              |
     |-- POST /api/upload ------------>|                              |
     |   (file + settings)             |                              |
     |                                 |-- save file to uploads/ ----->|
     |                                 |-- save settings.json         |
     |                                 |-- enqueue BackgroundTask     |
     |<-- UploadResponse (job_id) -----|                              |
     |                                 |                              |
     |-- GET /api/jobs/{job_id} ------>| (poll every 2s)             |
     |                                 |-- read status.json           |
     |<-- JobStatus -------------------|                              |
     |   (queued/processing/           |                              |
     |    completed/failed)            |                              |
     |                                 |                              |
     |   (if processing)               |-- upload to Mistral -------->|
     |                                 |-- OCR.process()              |
     |                                 |<-- pages + markdown          |
     |                                 |-- save images/               |
     |                                 |-- save result.md             |
     |                                 |-- markdown_to_pdf()          |
     |                                 |-- markdown_to_docx()         |
     |                                 |-- update status.json         |
     |                                 |                              |
     |<-- JobStatus (completed) --------|                              |
     |                                 |                              |
     |-- GET /api/download/{id}/{fmt}->|                              |
     |<-- FileResponse -----------------|                              |
     |                                 |                              |
```

### 6.2 API Contract Alignment

**JobStatus Model Mismatch:**

- **Backend:** `result: Optional[Dict[str, Any]]` — loose, untyped
- **Frontend:** deeply nested `JobStatus` interface with specific fields
- **Risk:** Backend changes to response shape won't be caught by type checking

**Image Path Mismatch:**

- **Backend** saves: `page{index+1}_{img_id}.{ext}` (e.g., `page1_img-0.png`)
- **Frontend** constructs: `{index}_{img_id}.png` (e.g., `0_img-0.png`) — **broken URLs**

### 6.3 Integration Gaps

**[CRITICAL] Vite Proxy Port Mismatch**

- Frontend proxy: `localhost:9001`
- Backend default: `localhost:9000`
- **Result:** Frontend cannot reach backend in development

**[HIGH] Frontend `model` Setting Ignored**

- Frontend has a model selector (`mistral-ocr-latest`)
- Value never sent to backend
- Backend hardcodes `mistral-ocr-latest`
- **Result:** UI control is a no-op

**[HIGH] Dead Configuration Options**

- `include_header_footer` — stored but never used
- `table_format` — stored but never used in export
- `confidence_scores` — stored but never used

**[HIGH] `pages` Parameter Only Works for PDFs**

- For image files, `pages` is silently ignored
- Frontend allows entering page ranges for any file type

**[MEDIUM] Preprocessing Not Integrated**

- `preprocess.py` functions exist but never called
- README promises preprocessing but pipeline sends raw files

**[MEDIUM] PostProcessor Not Integrated**

- `postprocess.py` class exists but never instantiated
- README claims OpenAI GPT-4o-mini but code uses Mistral

### 6.4 Scalability Concerns

- `BackgroundTasks` runs in-process — jobs lost on restart
- No concurrency limits — flood of uploads can exhaust memory/disk
- No job timeout — OCR calls can hang for 5+ minutes
- No file cleanup — uploads directory grows indefinitely
- File-based status updates not atomic — concurrent writes could corrupt

---

## 7. Consolidated Findings by Severity

### Critical (Immediate Action Required)

| # | Finding | File | Lines | Recommendation |
|---|---------|------|-------|----------------|
| 1 | No authentication on any API endpoint | `upload.py`, `jobs.py`, `download.py`, `main.py` | all | Implement API key or JWT auth |
| 2 | Uploads directory mounted as public static files | `main.py` | 14-16 | Serve through authenticated endpoints only |
| 3 | Live `.env` with API key on disk | `.env` | 1-2 | Remove file, rotate key, use secrets manager |
| 4 | Path traversal in download route | `download.py` | 9-24 | Validate `job_id` against UUID pattern |
| 5 | Vite proxy port mismatch (9001 vs 9000) | `vite.config.ts`, `config.py` | 16, 13 | Align ports to 9000 or 9001 |

### High (Urgent Fix Needed)

| # | Finding | File | Lines | Recommendation |
|---|---------|------|-------|----------------|
| 6 | Extension-only file validation | `upload.py` | 23-25 | Add magic bytes verification |
| 7 | Client-provided file size not verified | `upload.py` | 44, 51-53 | Verify `len(content)` after read |
| 8 | Raw exception messages exposed to client | `pipeline.py` | 161-168 | Return generic errors, log details server-side |
| 9 | Image path mismatch (backend vs frontend) | `pipeline.py`, `FileUpload.tsx` | 31, 171-173 | Align naming convention |
| 10 | BackgroundTasks unsuitable for production | `upload.py` | 67 | Use Celery/Redis or process pool |
| 11 | No concurrency limits on OCR jobs | `pipeline.py` | 84-169 | Implement semaphore/job queue |
| 12 | `pages` parameter ignored for images | `pipeline.py` | 98-116 | Pass to `process_image` or disable in UI |
| 13 | Outdated dependencies with known CVEs | `requirements.txt` | all | Update to latest stable versions |
| 14 | PDF export uses removed `write_html()` | `export.py` | 88 | Switch to `fpdf.HTMLMixin` or alternative |
| 15 | Frontend model selector is a no-op | `FileUpload.tsx`, `ocr_service.py` | 37, 118 | Implement or remove |
| 16 | Preprocessing functions unused | `preprocess.py`, `pipeline.py` | all | Integrate or update README |
| 17 | PostProcessor unused (wrong model claimed) | `postprocess.py`, `pipeline.py` | all | Integrate or remove |

### Medium (Important Fixes)

| # | Finding | File | Lines | Recommendation |
|---|---------|------|-------|----------------|
| 18 | CORS overly permissive with credentials | `main.py` | 21-28 | Restrict methods/headers, use env-specific origins |
| 19 | No Content-Type enforcement | `upload.py` | 33-42 | Cross-check `file.content_type` |
| 20 | No security headers | `main.py` | all | Add `X-Content-Type-Options`, `X-Frame-Options`, `HSTS` |
| 21 | No HTTPS enforcement | `main.py`, `config.py` | all | Deploy behind reverse proxy with TLS |
| 22 | No file cleanup mechanism | `pipeline.py` | all | Implement periodic cleanup (e.g., 24h TTL) |
| 23 | Hardcoded Windows font paths | `export.py` | 76-79 | Use cross-platform font discovery |
| 24 | No job timeout or heartbeat | `ocr_service.py`, `useOCR.ts` | 42-51, 5-57 | Add max job duration |
| 25 | Stale closure risk in polling hook | `useOCR.ts` | 10, 40-55 | Add `getJobStatus` to deps |
| 26 | No AbortController for requests | `useOCR.ts` | 20-37 | Cancel on unmount |
| 27 | Dead configuration options in UI | `FileUpload.tsx`, `pipeline.py` | 55-61, 46-123 | Implement or remove |
| 28 | README claims wrong tech (OpenAI, WeasyPrint) | `README.md` | 45-46 | Update to reflect actual tech |

### Low / Info

| # | Finding | File | Lines | Recommendation |
|---|---------|------|-------|----------------|
| 29 | No axios request timeout | `api.ts` | 6-8 | Add `timeout: 120000` |
| 30 | No error interceptor | `api.ts` | 6-8 | Add global error handling |
| 31 | Download filename hardcoded | `FileUpload.tsx` | 116 | Use original filename |
| 32 | Icon buttons lack `aria-label` | `FileUpload.tsx` | 206-249 | Add accessible names |
| 33 | No keyboard shortcuts for zoom | `FileUpload.tsx` | 150-160 | Add `+`/`-`/`0` key handlers |
| 34 | Unused imports | `pipeline.py`, `preprocess.py` | 6-7, 4 | Remove |
| 35 | Missing docstrings | all | all | Add to public functions/classes |
| 36 | Type hint gaps | `pipeline.py`, `postprocess.py`, `export.py` | various | Add explicit types |
| 37 | README references removed directories | `README.md` | 30-38 | Update architecture section |
| 38 | Test data management | `tests/` | all | Add fixtures for images, PDFs |

---

## 8. Prioritized Action Plan

### Phase 1: Critical Security (Week 1)

1. **Rotate `MISTRAL_API_KEY` and remove `.env` from disk** — Use environment variables or secrets manager
2. **Add authentication** — API key or JWT for all endpoints
3. **Stop public static file serving** — Serve uploads through authenticated endpoints only
4. **Fix path traversal** — Validate `job_id` against UUID pattern in `download.py`
5. **Fix Vite proxy port** — Change to `9000` to match backend

### Phase 2: Input Validation & Hardening (Week 2)

6. **Add magic bytes verification** — Use `python-magic` to validate file content
7. **Verify file size after read** — Check `len(content)` in `upload.py`
8. **Sanitize error messages** — Return generic errors to client, log details server-side
9. **Add rate limiting** — Per-IP quotas for uploads and OCR calls
10. **Add security headers** — `X-Content-Type-Options`, `X-Frame-Options`, `HSTS`

### Phase 3: Architecture & Reliability (Week 3-4)

11. **Replace BackgroundTasks** — Use Celery + Redis for production
12. **Add concurrency limits** — Semaphore or job queue (max 5 concurrent)
13. **Implement atomic writes** — Use temp file + `os.replace` for `status.json`
14. **Add job timeout** — Max 10 minutes per job
15. **Implement file cleanup** — Delete jobs older than 24h
16. **Fix image path mismatch** — Align backend save and frontend load conventions

### Phase 4: Code Quality (Week 5)

17. **Extract FileUpload sub-components** — Break 576-line component into focused pieces
18. **Add type safety** — Replace `Dict[str, Any]` with proper Pydantic models
19. **Remove dead code** — Delete or integrate `preprocess.py` and `postprocess.py`
20. **Update README** — Correct tech stack (remove OpenAI/WeasyPrint claims)
21. **Fix export.py** — Replace deprecated `write_html()` with working alternative
22. **Add docstrings and type hints** — Complete coverage of public API

### Phase 5: Testing (Ongoing)

23. **Add tests for core services** — `ocr_service.py`, `pipeline.py`, `postprocess.py`
24. **Add edge case tests** — Invalid files, oversized uploads, API failures
25. **Add pytest configuration** — `pyproject.toml` with coverage thresholds
26. **Fix test isolation** — Convert global `client` to fixture, add cleanup
27. **Add CI/CD pipeline** — GitHub Actions for tests and coverage

### Phase 6: Frontend Polish (Week 6)

28. **Add responsive breakpoints** — Mobile-friendly sidebar
29. **Add accessibility labels** — `aria-label` on icon buttons
30. **Add keyboard shortcuts** — Zoom controls
31. **Add request timeout** — Axios config
32. **Fix XSS vectors** — Remove `rehype-raw`, sanitize table cells
33. **Add error interceptors** — Global axios error handling

---

## Appendix: File Inventory

### Backend Files (15 Python files)

| File | Lines | Purpose |
|------|-------|---------|
| `app/main.py` | 37 | FastAPI app entry, CORS, static mount |
| `app/config.py` | 21 | Pydantic settings |
| `app/api/__init__.py` | 11 | Router aggregation |
| `app/api/upload.py` | 73 | File upload endpoint |
| `app/api/jobs.py` | 50 | Job status endpoint |
| `app/api/download.py` | 35 | File download endpoint |
| `app/models/__init__.py` | 0 | Empty |
| `app/models/schemas.py` | 25 | Pydantic models |
| `app/services/__init__.py` | 3 | Module exports |
| `app/services/ocr_service.py` | 215 | Mistral OCR client |
| `app/services/pipeline.py` | 169 | Processing orchestration |
| `app/services/preprocess.py` | 61 | Image preprocessing (unused) |
| `app/services/postprocess.py` | 37 | LLM enhancement (dead code) |
| `app/services/export.py` | 124 | PDF/DOCX export |
| `app/__init__.py` | 0 | Empty |

### Frontend Files (14 TypeScript/TSX files)

| File | Lines | Purpose |
|------|-------|---------|
| `frontend/package.json` | 45 | Dependencies and scripts |
| `frontend/vite.config.ts` | 24 | Build and dev server config |
| `frontend/tsconfig.json` | 24 | TypeScript configuration |
| `frontend/tailwind.config.js` | 34 | Tailwind theme |
| `frontend/index.html` | 16 | HTML entry with RTL |
| `frontend/src/main.tsx` | 10 | React entry point |
| `frontend/src/App.tsx` | 32 | Root component |
| `frontend/src/index.css` | 139 | Global styles, RTL, prose |
| `frontend/src/components/FileUpload.tsx` | 576 | Main upload/result component |
| `frontend/src/services/api.ts` | 50 | Axios client |
| `frontend/src/types/index.ts` | 43 | TypeScript interfaces |
| `frontend/src/hooks/useOCR.ts` | 58 | Job polling hook |
| `frontend/src/lib/utils.ts` | 6 | cn() utility |

### Test Files (4 Python files)

| File | Lines | Purpose |
|------|-------|---------|
| `tests/conftest.py` | 10 | Test client setup |
| `tests/test_api.py` | 54 | API endpoint tests |
| `tests/test_export.py` | 54 | Export function tests |
| `tests/test_preprocess.py` | 81 | Preprocessing tests |

### Configuration Files

| File | Purpose |
|------|---------|
| `.env.example` | Environment variable template |
| `.gitignore` | Git ignore rules |
| `requirements.txt` | Production dependencies |
| `requirements-dev.txt` | Development dependencies |
| `components.json` | shadcn/ui config |

---

*Report generated by multi-agent analysis team on 2026-07-13*
