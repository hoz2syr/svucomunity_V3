from fastapi import APIRouter
from app.api.upload import router as upload_router
from app.api.jobs import router as jobs_router
from app.api.download import router as download_router
from app.api.edit import router as edit_router

api_router = APIRouter()
api_router.include_router(upload_router, prefix="/upload")
api_router.include_router(jobs_router, prefix="/jobs")
api_router.include_router(download_router, prefix="/download")
api_router.include_router(edit_router, prefix="/jobs")

__all__ = ["api_router", "upload_router", "jobs_router", "download_router", "edit_router"]
