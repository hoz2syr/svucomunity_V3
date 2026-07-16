from pydantic import BaseModel, field_validator
from typing import Optional, List, Dict, Any
import re

PAGE_RANGE_RE = re.compile(r'^\d+(-\d+)?$')


class JobStatus(BaseModel):
    job_id: str
    status: str
    progress: int = 0
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class OCRJobSettings(BaseModel):
    pages: Optional[str] = None
    include_header_footer: bool = False
    include_images: bool = True
    table_format: str = "markdown"
    confidence_scores: str = "none"
    preprocess: bool = False
    preprocess_enhance: bool = True
    preprocess_deskew: bool = True

    @field_validator("pages")
    @classmethod
    def validate_pages(cls, v: Optional[str]) -> Optional[str]:
        if v is None or str(v).strip() == "":
            return None
        parts = str(v).split(",")
        for part in parts:
            part = part.strip()
            if not part:
                raise ValueError("Pages format contains empty segment")
            if not PAGE_RANGE_RE.match(part):
                raise ValueError(
                    "Invalid pages format. Use comma-separated page numbers or ranges, e.g. 1,2,3 or 1-3,5"
                )
        return ",".join(p.strip() for p in parts)


class EditMarkdownRequest(BaseModel):
    markdown: str


class EditMarkdownResponse(BaseModel):
    job_id: str
    status: str
    edited_markdown_path: str
    pdf_path: Optional[str] = None
    docx_path: Optional[str] = None
    export_warnings: list[str] = []


class OCRResult(BaseModel):
    job_id: str
    markdown: str
    pages: int
    has_equations: bool
    has_tables: bool
    has_images: List[str]


class UploadResponse(BaseModel):
    job_id: str
    status: str
    message: str
    ocr_settings: OCRJobSettings
