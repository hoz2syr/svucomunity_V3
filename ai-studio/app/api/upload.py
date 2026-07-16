from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Form
from app.config import settings
from app.models.schemas import UploadResponse, OCRJobSettings
from app.services.pipeline import process_image_pipeline
import uuid
import os
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

import shutil

router = APIRouter()

ALLOWED_EXTENSIONS = set(settings.allowed_extensions.split(","))
MAX_FILE_SIZE = settings.max_file_size

MAGIC_SIGNATURES = {
    ".jpg": b"\xff\xd8\xff",
    ".jpeg": b"\xff\xd8\xff",
    ".png": b"\x89PNG\r\n\x1a\n",
    ".bmp": b"BM",
    ".tiff": b"II\x2a\x00",
    ".pdf": b"%PDF",
}


def validate_file(filename: str, file_size: int) -> str:
    if not filename:
        raise HTTPException(400, "اسم الملف مطلوب")

    ext = Path(filename).suffix.lower().lstrip(".")
    if not ext:
        raise HTTPException(400, "الملف ليس له امتداد")

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"نوع الملف .{ext} غير مسموح. الأنواع المسموحة: {', '.join(sorted(ALLOWED_EXTENSIONS))}")

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(400, f"حجم الملف يتجاوز الحد المسموح ({MAX_FILE_SIZE // (1024 * 1024)}MB)")

    return ext


def verify_magic_bytes(file_path: str, expected_ext: str) -> None:
    signature = MAGIC_SIGNATURES.get(f".{expected_ext}")
    if signature is None:
        return

    with open(file_path, "rb") as f:
        header = f.read(len(signature))

    if not header.startswith(signature):
        raise HTTPException(400, "محتوى الملف لا يطابق امتداده. يرجى التأكد من أن الملف غير تالف")


@router.post("/", response_model=UploadResponse)
async def upload_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    pages: Optional[str] = Form(None),
    include_header_footer: bool = Form(False),
    include_images: bool = Form(True),
    table_format: str = Form("markdown"),
    confidence_scores: str = Form("none"),
    preprocess: bool = Form(False),
    preprocess_enhance: bool = Form(True),
    preprocess_deskew: bool = Form(True),
):
    job_id = str(uuid.uuid4())
    file_size = file.size
    if file_size is None:
        raise HTTPException(400, "تعذر تحديد حجم الملف")

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(400, f"حجم الملف يتجاوز الحد المسموح ({MAX_FILE_SIZE // (1024 * 1024)}MB)")

    ext = validate_file(file.filename or "", file_size)

    job_dir = os.path.join(settings.upload_dir, job_id)
    os.makedirs(job_dir, exist_ok=True)

    file_path = os.path.join(job_dir, f"original.{ext}")

    try:
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
    except Exception as exc:
        logger.error("Failed to save uploaded file for job %s: %s", job_id, exc, exc_info=True)
        raise HTTPException(500, "فشل في حفظ الملف. يرجى المحاولة مرة أخرى") from exc

    actual_size = os.path.getsize(file_path)
    if actual_size > MAX_FILE_SIZE:
        os.remove(file_path)
        raise HTTPException(400, f"حجم الملف يتجاوز الحد المسموح ({MAX_FILE_SIZE // (1024 * 1024)}MB)")

    try:
        verify_magic_bytes(file_path, ext)
    except HTTPException:
        os.remove(file_path)
        raise

    ocr_settings = OCRJobSettings(
        pages=pages,
        include_header_footer=include_header_footer,
        include_images=include_images,
        table_format=table_format,
        confidence_scores=confidence_scores,
        preprocess=preprocess,
        preprocess_enhance=preprocess_enhance,
        preprocess_deskew=preprocess_deskew,
    )

    settings_path = os.path.join(job_dir, "settings.json")
    with open(settings_path, "w", encoding="utf-8") as f:
        f.write(ocr_settings.model_dump_json())

    logger.info("File uploaded successfully: job_id=%s, filename=%s, size=%d, type=%s",
                job_id, file.filename, actual_size, ext)
    background_tasks.add_task(process_image_pipeline, job_id, file_path, ext, ocr_settings.model_dump())

    return UploadResponse(
        job_id=job_id,
        status="queued",
        message="تم رفع الملف بنجاح",
        ocr_settings=ocr_settings,
    )
