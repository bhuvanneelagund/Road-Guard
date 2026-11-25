import os
import uuid
import re
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from backend.app.config import settings

class StorageService:
    def __init__(self, upload_dir: str = settings.UPLOAD_DIR):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        (self.upload_dir / "images").mkdir(exist_ok=True)
        (self.upload_dir / "videos").mkdir(exist_ok=True)
        (self.upload_dir / "annotated").mkdir(exist_ok=True)
        (self.upload_dir / "verification").mkdir(exist_ok=True)
        (self.upload_dir / "waterlogging").mkdir(exist_ok=True)

    def _sanitize_filename(self, filename: str) -> str:
        # Strip paths to prevent traversal
        base = os.path.basename(filename)
        # Remove dangerous characters
        clean = re.sub(r'[^a-zA-Z0-9_.-]', '_', base)
        ext = os.path.splitext(clean)[1].lower()
        unique_name = f"{uuid.uuid4().hex[:12]}_{clean[:25]}{ext}"
        return unique_name

    async def save_image(self, file: UploadFile) -> str:
        if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported image type '{file.content_type}'. Allowed types: {settings.ALLOWED_IMAGE_TYPES}"
            )
        
        safe_name = self._sanitize_filename(file.filename or "image.jpg")
        target_path = self.upload_dir / "images" / safe_name
        
        # Read with size cap
        content = await file.read()
        max_bytes = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
        if len(content) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Image exceeds maximum size limit of {settings.MAX_IMAGE_SIZE_MB}MB"
            )

        with open(target_path, "wb") as f:
            f.write(content)
        
        return str(target_path)

    async def save_video(self, file: UploadFile) -> str:
        if file.content_type not in settings.ALLOWED_VIDEO_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported video format '{file.content_type}'. Allowed formats: {settings.ALLOWED_VIDEO_TYPES}"
            )
        
        safe_name = self._sanitize_filename(file.filename or "video.mp4")
        target_path = self.upload_dir / "videos" / safe_name
        
        content = await file.read()
        max_bytes = settings.MAX_VIDEO_SIZE_MB * 1024 * 1024
        if len(content) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Video exceeds maximum size limit of {settings.MAX_VIDEO_SIZE_MB}MB"
            )

        with open(target_path, "wb") as f:
            f.write(content)
        
        return str(target_path)

    def get_relative_url(self, file_path: str) -> str:
        """Converts absolute local path to public API relative URL."""
        if not file_path:
            return ""
        norm_path = os.path.normpath(file_path).replace("\\", "/")
        norm_upload = os.path.normpath(str(self.upload_dir)).replace("\\", "/")
        
        if norm_upload in norm_path:
            rel = norm_path.split(norm_upload)[-1].lstrip("/")
            return f"/api/uploads/{rel}"
        return f"/api/uploads/{os.path.basename(norm_path)}"

storage_service = StorageService()
