import logging
from app.services.ocr_service import OCRService
from app.services.export import save_markdown, export_markdown_async, get_thread_pool
from app.services.preprocess import enhance_image, deskew_image, pdf_to_images
from app.config import settings
from app.models.schemas import OCRJobSettings
import os
import json
import base64
import re
import asyncio

logger = logging.getLogger(__name__)


def update_status(job_dir: str, status_data: dict):
    status_file = os.path.join(job_dir, "status.json")
    with open(status_file, "w", encoding="utf-8") as f:
        json.dump(status_data, f, ensure_ascii=False, indent=2)


def _save_images(job_dir: str, pages: list) -> tuple[list[str], int]:
    images_dir = os.path.join(job_dir, "images")
    os.makedirs(images_dir, exist_ok=True)
    saved_paths = []
    total_count = 0

    def _decode_and_save(page_index: int, img: dict) -> str | None:
        nonlocal total_count
        b64 = img.get("base64", "")
        if not b64:
            return None
        img_id = img.get("id") or f"img-{total_count}"
        ext = "png"
        if ";base64," in b64:
            mime = b64.split(";base64,")[0].split(":")[-1]
            ext = "jpg" if "jpeg" in mime else "png"
        filename = f"page{page_index + 1}_{img_id}.{ext}"
        filepath = os.path.join(images_dir, filename)
        raw_b64 = b64.split(",", 1)[-1] if "," in b64 else b64
        with open(filepath, "wb") as f:
            f.write(base64.b64decode(raw_b64))
        total_count += 1
        return f"images/{filename}"

    futures = []
    thread_pool = get_thread_pool()
    for page in pages:
        for img in page.get("images", []):
            futures.append(thread_pool.submit(_decode_and_save, page["index"], img))

    for future in futures:
        result = future.result()
        if result:
            saved_paths.append(result)

    return saved_paths, total_count


def _clean_markdown(markdown: str) -> str:
    lines = markdown.split("\n")
    cleaned = []
    blank_run = 0
    for line in lines:
        if line.strip() == "":
            blank_run += 1
            if blank_run <= 2:
                cleaned.append(line)
        else:
            blank_run = 0
            cleaned.append(line)
    result = "\n".join(cleaned).strip()
    result = re.sub(r"\n{3,}", "\n\n", result)
    return result


def _inject_images_into_markdown(markdown: str, pages: list) -> str:
    if not pages:
        return markdown

    img_blocks = {}
    for page in pages:
        for img in page.get("images", []):
            b64 = img.get("base64", "")
            if not b64:
                continue
            img_id = img.get("id") or f"img-{len(img_blocks)}"
            ext = "png"
            if ";base64," in b64:
                mime = b64.split(";base64,")[0].split(":")[-1]
                ext = "jpg" if "jpeg" in mime else "png"
            filename = f"images/page{page['index'] + 1}_{img_id}.{ext}"
            img_blocks[img_id] = f"![{img_id}]({filename})"

    if not img_blocks:
        return markdown

    img_ids = set(img_blocks.keys())
    img_references = [img_blocks[img_id] for img_id in sorted(img_ids)]

    def replace_img_ref(match):
        src = match.group(2)
        basename = os.path.splitext(os.path.basename(src))[0]
        for img_id in img_ids:
            if img_id == basename or basename in img_id or img_id in basename:
                return img_blocks[img_id]
        return match.group(0)

    result = re.sub(r"!\[([^\]]*)\]\(([^)]+)\)", replace_img_ref, markdown)

    if img_references:
        result = result.rstrip() + "\n\n## الصور المستخرجة\n\n" + "\n".join(img_references)

    return _clean_markdown(result)


async def _export_formats_async(md_path: str, job_dir: str) -> dict:
    pdf_path = os.path.join(job_dir, "result.pdf")
    docx_path = os.path.join(job_dir, "result.docx")
    txt_path = os.path.join(job_dir, "result.txt")
    html_path = os.path.join(job_dir, "result.html")

    result = await export_markdown_async(
        markdown_path=md_path,
        output_pdf=pdf_path,
        output_docx=docx_path,
        output_txt=txt_path,
        output_html=html_path,
    )
    export_warnings = result.get("export_warnings", [])

    return {
        "pdf_path": pdf_path if os.path.exists(pdf_path) else None,
        "docx_path": docx_path if os.path.exists(docx_path) else None,
        "txt_path": txt_path if os.path.exists(txt_path) else None,
        "html_path": html_path if os.path.exists(html_path) else None,
        "export_warnings": export_warnings,
    }


def _normalize_ocr_settings(ocr_settings: dict | OCRJobSettings) -> OCRJobSettings:
    if isinstance(ocr_settings, OCRJobSettings):
        return ocr_settings
    return OCRJobSettings(**ocr_settings)


def _preprocess_file(job_dir: str, image_path: str, ext: str, ocr_settings: OCRJobSettings) -> str:
    preprocessed_dir = os.path.join(job_dir, "preprocessed")
    os.makedirs(preprocessed_dir, exist_ok=True)

    if not ocr_settings.preprocess:
        return image_path

    if ext == "pdf":
        try:
            image_paths = pdf_to_images(image_path, preprocessed_dir)
            if image_paths:
                return image_paths[0]
        except Exception as exc:
            logger.warning("PDF preprocessing failed, using original: %s", exc)
            return image_path

    output_path = os.path.join(preprocessed_dir, f"preprocessed{ext}")

    if ocr_settings.preprocess_deskew:
        try:
            deskew_image(image_path, output_path)
            image_path = output_path
        except Exception as exc:
            logger.warning("Deskew failed, using previous: %s", exc)

    if ocr_settings.preprocess_enhance:
        try:
            enhance_image(image_path, output_path)
            image_path = output_path
        except Exception as exc:
            logger.warning("Enhance failed, using previous: %s", exc)

    return image_path


def process_image_pipeline(job_id: str, image_path: str, ext: str, ocr_settings: dict | OCRJobSettings = None) -> dict:
    ocr_settings = _normalize_ocr_settings(ocr_settings or {})

    job_dir = os.path.join(settings.upload_dir, job_id)
    os.makedirs(job_dir, exist_ok=True)

    try:
        update_status(job_dir, {"job_id": job_id, "status": "processing", "progress": 10})

        ocr_service = OCRService()
        all_pages = []
        all_markdowns = []

        pages_param = ocr_settings.pages
        include_image_base64 = ocr_settings.include_images

        image_path = _preprocess_file(job_dir, image_path, ext, ocr_settings)

        if ext == "pdf":
            update_status(job_dir, {"job_id": job_id, "status": "processing", "progress": 20})
            pdf_path = os.path.join(job_dir, "original.pdf")
            os.replace(image_path, pdf_path)

            logger.info("Processing PDF: %s for job %s", pdf_path, job_id)
            ocr_result = ocr_service.process_document(
                pdf_path,
                pages=pages_param,
                include_image_base64=include_image_base64,
            )
        else:
            update_status(job_dir, {"job_id": job_id, "status": "processing", "progress": 50})
            logger.info("Processing image: %s for job %s", image_path, job_id)
            ocr_result = ocr_service.process_image(
                image_path,
                include_image_base64=include_image_base64,
            )

        all_pages.extend(ocr_result["pages"])
        all_markdowns.append(ocr_result["markdown"])
        logger.info("OCR completed for job %s: %d pages, %d images",
                    job_id, len(all_pages), sum(len(p.get("images", [])) for p in all_pages))

        saved_image_paths, total_images = _save_images(job_dir, all_pages)

        raw_markdown = "\n\n---\n\n".join(all_markdowns)
        final_markdown = _inject_images_into_markdown(raw_markdown, all_pages)

        debug_raw_path = os.path.join(job_dir, "raw_ocr.md")
        save_markdown(raw_markdown, debug_raw_path)

        update_status(job_dir, {"job_id": job_id, "status": "processing", "progress": 70})

        md_path = os.path.join(job_dir, "result.md")
        save_markdown(final_markdown, md_path)

        export_result = asyncio.run(_export_formats_async(md_path, job_dir))

        result = {
            "job_id": job_id,
            "status": "completed",
            "progress": 100,
            "markdown_path": md_path,
            "pdf_path": export_result["pdf_path"],
            "docx_path": export_result["docx_path"],
            "txt_path": export_result["txt_path"],
            "html_path": export_result["html_path"],
            "page_count": len(all_pages),
            "preview": final_markdown[:500],
            "raw_markdown": final_markdown,
            "extracted_images": saved_image_paths,
            "image_count": total_images,
            "ocr_settings": ocr_settings.model_dump(),
            "pages_data": all_pages,
            "export_warnings": export_result["export_warnings"],
        }

        update_status(job_dir, result)
        return result

    except RuntimeError as e:
        logger.error("OCR stage failed for job %s: %s", job_id, str(e), exc_info=True)
        error_data = {
            "job_id": job_id,
            "status": "failed",
            "progress": 0,
            "error": f"Text extraction failed: {str(e)}",
            "error_type": "RuntimeError",
            "failure_stage": "ocr",
        }
        update_status(job_dir, error_data)
        return error_data
    except OSError as e:
        logger.error("File system stage failed for job %s: %s", job_id, str(e), exc_info=True)
        error_data = {
            "job_id": job_id,
            "status": "failed",
            "progress": 0,
            "error": f"File system error during export: {str(e)}",
            "error_type": "OSError",
            "failure_stage": "filesystem",
        }
        update_status(job_dir, error_data)
        return error_data
    except ValueError as e:
        logger.error("Export stage failed for job %s: %s", job_id, str(e), exc_info=True)
        error_data = {
            "job_id": job_id,
            "status": "failed",
            "progress": 0,
            "error": f"Export failed: {type(e).__name__}: {str(e)}",
            "error_type": type(e).__name__,
            "failure_stage": "export",
        }
        update_status(job_dir, error_data)
        return error_data
    except Exception as e:
        # Catch-all safety net for background task.
        # Does NOT catch KeyboardInterrupt/SystemExit (BaseException).
        logger.error("Unexpected pipeline failure for job %s: %s", job_id, str(e), exc_info=True)
        error_data = {
            "job_id": job_id,
            "status": "failed",
            "progress": 0,
            "error": "An unexpected error occurred during processing",
            "error_type": type(e).__name__,
            "failure_stage": "pipeline",
        }
        update_status(job_dir, error_data)
        return error_data
