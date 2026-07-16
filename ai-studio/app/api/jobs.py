from fastapi import APIRouter, HTTPException
from app.models.schemas import JobStatus
from app.services.export import re_export_job
from app.services.pipeline import update_status
import json
import os
import re
from app.config import settings

router = APIRouter()

UUID_RE = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)


def _read_status(job_id: str) -> dict:
    status_file = os.path.join(settings.upload_dir, job_id, "status.json")
    if not os.path.exists(status_file):
        raise HTTPException(404, "Job not found")
    try:
        with open(status_file, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        raise HTTPException(500, "Job status file is corrupted")


@router.get("/{job_id}", response_model=JobStatus)
async def get_job_status(job_id: str):
    if not UUID_RE.match(job_id):
        raise HTTPException(404, "Job not found")

    status_data = _read_status(job_id)
    status = status_data.get("status", "unknown")

    if status == "completed":
        base_url = f"/uploads/{job_id}"
        job_dir = os.path.join(settings.upload_dir, job_id)
        edited_md_path = os.path.join(job_dir, "edited.md")
        raw_md_path = os.path.join(job_dir, "raw_ocr.md")

        edited_markdown = None
        if os.path.exists(edited_md_path):
            try:
                with open(edited_md_path, "r", encoding="utf-8") as f:
                    edited_markdown = f.read()
            except OSError:
                edited_markdown = None

        if edited_markdown is None and os.path.exists(raw_md_path):
            try:
                with open(raw_md_path, "r", encoding="utf-8") as f:
                    edited_markdown = f.read()
            except OSError:
                edited_markdown = None

        result = {
            "markdown_path": f"{base_url}/result.md",
            "pdf_path": f"{base_url}/result.pdf" if os.path.exists(os.path.join(job_dir, "result.pdf")) else None,
            "docx_path": f"{base_url}/result.docx" if os.path.exists(os.path.join(job_dir, "result.docx")) else None,
            "txt_path": f"{base_url}/result.txt" if os.path.exists(os.path.join(job_dir, "result.txt")) else None,
            "html_path": f"{base_url}/result.html" if os.path.exists(os.path.join(job_dir, "result.html")) else None,
            "page_count": status_data.get("page_count"),
            "preview": status_data.get("preview"),
            "raw_markdown": status_data.get("raw_markdown"),
            "edited_markdown": edited_markdown,
            "extracted_images": status_data.get("extracted_images", []),
            "image_count": status_data.get("image_count", 0),
            "ocr_settings": status_data.get("ocr_settings", {}),
            "pages_data": status_data.get("pages_data", []),
        }
    else:
        result = None

    return JobStatus(
        job_id=job_id,
        status=status,
        progress=status_data.get("progress", 0),
        result=result,
        error=status_data.get("error"),
    )


@router.put("/{job_id}/edit")
async def save_edited_markdown(job_id: str, payload: dict):
    if not UUID_RE.match(job_id):
        raise HTTPException(404, "Job not found")

    status_data = _read_status(job_id)
    if status_data.get("status") != "completed":
        raise HTTPException(400, "Job is not completed")

    markdown = payload.get("markdown")
    if not isinstance(markdown, str):
        raise HTTPException(422, "Field 'markdown' is required and must be a string")

    job_dir = os.path.join(settings.upload_dir, job_id)
    edited_md_path = os.path.join(job_dir, "edited.md")
    try:
        with open(edited_md_path, "w", encoding="utf-8") as f:
            f.write(markdown)
    except OSError as exc:
        raise HTTPException(500, f"Failed to save edited markdown: {exc}") from exc

    try:
        export_result = re_export_job(job_id, markdown)
    except Exception as exc:
        raise HTTPException(500, f"Re-export failed: {exc}") from exc

    updated_status = {
        **status_data,
        "markdown_path": export_result["markdown_path"],
        "pdf_path": export_result["pdf_path"],
        "docx_path": export_result["docx_path"],
        "txt_path": export_result["txt_path"],
        "html_path": export_result["html_path"],
        "export_warnings": export_result.get("export_warnings", []),
    }
    update_status(job_dir, updated_status)

    return {
        "job_id": job_id,
        "status": "ok",
        "edited_markdown_path": f"/uploads/{job_id}/edited.md",
        "export_warnings": export_result.get("export_warnings", []),
    }
