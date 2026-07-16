from fastapi import APIRouter, HTTPException
from app.models.schemas import EditMarkdownRequest, EditMarkdownResponse
from app.services.export import re_export_job
from app.config import settings
import json
import os
import re

router = APIRouter()

UUID_RE = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)


@router.put("/{job_id}", response_model=EditMarkdownResponse)
async def edit_job_markdown(job_id: str, body: EditMarkdownRequest):
    if not UUID_RE.match(job_id):
        raise HTTPException(404, "Job not found")

    job_dir = os.path.join(settings.upload_dir, job_id)
    status_file = os.path.join(job_dir, "status.json")

    if not os.path.exists(status_file):
        raise HTTPException(404, "Job not found")

    try:
        with open(status_file, "r", encoding="utf-8") as f:
            status_data = json.load(f)
    except json.JSONDecodeError:
        raise HTTPException(500, "Job status file is corrupted")

    if status_data.get("status") != "completed":
        raise HTTPException(400, "Job is not completed yet")

    try:
        result = re_export_job(job_id, body.markdown)
    except FileNotFoundError:
        raise HTTPException(404, "Job files not found")
    except Exception as exc:
        raise HTTPException(500, f"Re-export failed: {type(exc).__name__}: {str(exc)}") from exc

    status_data["edited_markdown"] = body.markdown
    status_data["pdf_path"] = result["pdf_path"]
    status_data["docx_path"] = result["docx_path"]
    status_data["export_warnings"] = result["export_warnings"]

    try:
        with open(status_file, "w", encoding="utf-8") as f:
            json.dump(status_data, f, ensure_ascii=False, indent=2)
    except OSError as exc:
        raise HTTPException(500, f"Failed to update job status: {exc}") from exc

    base_url = f"/uploads/{job_id}"
    return EditMarkdownResponse(
        job_id=job_id,
        status="completed",
        edited_markdown_path=f"{base_url}/edited.md",
        pdf_path=f"{base_url}/result.pdf" if result["pdf_path"] else None,
        docx_path=f"{base_url}/result.docx" if result["docx_path"] else None,
        export_warnings=result["export_warnings"],
    )
