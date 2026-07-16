import re
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os
from app.config import settings

router = APIRouter()

UUID_RE = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)


@router.get("/{job_id}/{format}")
async def download_file(job_id: str, format: str):
    if not UUID_RE.match(job_id):
        raise HTTPException(400, "Invalid job ID")

    ext_map = {
        "markdown": "md",
        "pdf": "pdf",
        "docx": "docx",
        "txt": "txt",
        "html": "html",
    }

    if format not in ext_map:
        raise HTTPException(400, "Invalid format")

    file_path = Path(settings.upload_dir).joinpath(job_id, f"result.{ext_map[format]}")
    resolved_path = file_path.resolve()

    upload_dir_resolved = Path(settings.upload_dir).resolve()
    if not str(resolved_path).startswith(str(upload_dir_resolved) + os.sep) and resolved_path != upload_dir_resolved:
        raise HTTPException(400, "Invalid job ID")

    if not resolved_path.exists():
        raise HTTPException(404, "File not found")

    media_types = {
        "markdown": "text/markdown",
        "pdf": "application/pdf",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "txt": "text/plain; charset=utf-8",
        "html": "text/html; charset=utf-8",
    }

    return FileResponse(
        resolved_path,
        media_type=media_types[format],
        filename=f"{job_id}.{ext_map[format]}",
        headers={"Content-Disposition": f"attachment; filename={job_id}.{ext_map[format]}"},
    )
