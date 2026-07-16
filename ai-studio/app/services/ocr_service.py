import os
import tempfile
import logging
from typing import Optional

import httpx
from mistralai import Mistral
from mistralai.utils.retries import RetryConfig, BackoffStrategy
from app.config import settings

logger = logging.getLogger(__name__)

MINIMAL_JPEG = bytes([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
    0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
    0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
    0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x03, 0xff, 0xc4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00,
    0x37, 0xff, 0xd9,
])


class OCRService:
    def __init__(self):
        retry_config = RetryConfig(
            strategy="backoff",
            backoff=BackoffStrategy(
                initial_interval=1000,
                max_interval=30000,
                exponent=2.0,
                max_elapsed_time=300000,
            ),
            retry_connection_errors=True,
        )
        http_client = httpx.Client(
            timeout=httpx.Timeout(300.0, connect=60.0),
            follow_redirects=True,
            http2=False,
        )
        self.client = Mistral(
            api_key=settings.mistral_api_key,
            retry_config=retry_config,
            timeout_ms=300000,
            client=http_client,
        )

    def _run_with_image_patch(self, callback):
        with tempfile.NamedTemporaryFile(suffix=".jpeg", delete=False) as tmp:
            tmp.write(MINIMAL_JPEG)
            tmp_path = tmp.name
        try:
            return callback()
        finally:
            try:
                os.remove(tmp_path)
            except OSError:
                pass

    def process_image(
        self,
        image_path: str,
        include_image_base64: bool = False,
    ) -> dict:
        try:
            with open(image_path, "rb") as f:
                file_content = f.read()

            logger.info("Uploading image to Mistral: %s, size=%d bytes", image_path, len(file_content))
            uploaded_file = self.client.files.upload(
                file={"file_name": image_path, "content": file_content},
                purpose="ocr",
            )
            logger.info("Image uploaded successfully: file_id=%s", uploaded_file.id)

            signed_url = self.client.files.get_signed_url(file_id=uploaded_file.id)
            logger.info("Got signed URL for image")

            document = {
                "type": "image_url",
                "image_url": signed_url.url,
            }

            kwargs = {}
            if include_image_base64:
                kwargs["include_image_base64"] = True
            kwargs["image_min_size"] = 50

            logger.info("Processing OCR for image: model=mistral-ocr-latest")
            response = self._run_with_image_patch(
                lambda: self.client.ocr.process(
                    model="mistral-ocr-latest",
                    document=document,
                    **kwargs,
                )
            )
            logger.info("OCR processing completed for image")

        except Exception as exc:
            logger.error("Failed to process image %s: %s", image_path, exc, exc_info=True)
            raise

        pages = []
        for page in response.pages:
            images = []
            if hasattr(page, "images") and page.images:
                for img in page.images:
                    b64 = None
                    if hasattr(img, "image_base64") and img.image_base64:
                        b64 = img.image_base64
                    elif hasattr(img, "base64") and img.base64:
                        b64 = img.base64
                    if b64:
                        images.append({"id": getattr(img, "id", ""), "base64": b64})
            pages.append(
                {
                    "index": page.index,
                    "markdown": page.markdown,
                    "images": images,
                }
            )

        return {
            "pages": pages,
            "markdown": "\n\n---\n\n".join(p["markdown"] for p in pages),
            "page_count": len(pages),
        }

    def process_document(
        self,
        document_path: str,
        pages: Optional[str] = None,
        include_image_base64: bool = False,
    ) -> dict:
        try:
            with open(document_path, "rb") as f:
                file_content = f.read()

            logger.info("Uploading PDF to Mistral: %s, size=%d bytes", document_path, len(file_content))
            uploaded_file = self.client.files.upload(
                file={"file_name": document_path, "content": file_content},
                purpose="ocr",
            )
            logger.info("PDF uploaded successfully: file_id=%s", uploaded_file.id)

            signed_url = self.client.files.get_signed_url(file_id=uploaded_file.id)
            logger.info("Got signed URL for PDF")

            document = {
                "type": "document_url",
                "document_url": signed_url.url,
            }

            kwargs: dict = {}
            if pages:
                kwargs["pages"] = pages
            if include_image_base64:
                kwargs["include_image_base64"] = True
            kwargs["image_min_size"] = 50

            logger.info("Processing OCR for PDF: model=mistral-ocr-latest, pages=%s", pages or "all")
            response = self._run_with_image_patch(
                lambda: self.client.ocr.process(
                    model="mistral-ocr-latest",
                    document=document,
                    **kwargs,
                )
            )
            logger.info("OCR processing completed for PDF")

        except Exception as exc:
            logger.error("Failed to process PDF %s: %s", document_path, exc, exc_info=True)
            raise

        pages = []
        for page in response.pages:
            images = []
            if hasattr(page, "images") and page.images:
                for img in page.images:
                    b64 = None
                    if hasattr(img, "image_base64") and img.image_base64:
                        b64 = img.image_base64
                    elif hasattr(img, "base64") and img.base64:
                        b64 = img.base64
                    if b64:
                        images.append({"id": getattr(img, "id", ""), "base64": b64})
            pages.append(
                {
                    "index": page.index,
                    "markdown": page.markdown,
                    "images": images,
                }
            )

        return {
            "pages": pages,
            "markdown": "\n\n---\n\n".join(p["markdown"] for p in pages),
            "page_count": len(pages),
        }
