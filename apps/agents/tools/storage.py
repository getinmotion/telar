"""
Storage utilities for agents.
Stores uploaded images on the local filesystem and returns a public URL
based on the BASE_URL / UPLOAD_DIR environment variables.

No Supabase Storage dependency.
"""

import logging
import mimetypes
import os
import uuid

from fastapi import UploadFile

logger = logging.getLogger(__name__)

# Directory where images are persisted (must be served as static files).
# Override with the UPLOAD_DIR env var.  Default: ./uploads/product-photos
UPLOAD_DIR: str = os.getenv(
    "UPLOAD_DIR",
    os.path.join(os.path.dirname(__file__), "..", "uploads", "product-photos"),
)

# Public base URL that resolves to UPLOAD_DIR content.
# E.g. https://api.example.com  →  <BASE_URL>/uploads/product-photos/<filename>
BASE_URL: str = os.getenv("BASE_URL", "http://localhost:8000")

# Max upload size: 10 MB
MAX_UPLOAD_BYTES = 10 * 1024 * 1024

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
}


async def upload_image_to_storage(upload_file: UploadFile) -> str:
    """
    Save an image to the local filesystem and return its public URL.

    Args:
        upload_file: FastAPI UploadFile object

    Returns:
        Public URL of the saved image

    Raises:
        ValueError: If file type is not allowed or file is too large
        RuntimeError: If the write fails
    """
    content = await upload_file.read()

    if len(content) > MAX_UPLOAD_BYTES:
        raise ValueError(
            f"File too large ({len(content)} bytes). Max allowed: {MAX_UPLOAD_BYTES} bytes."
        )

    content_type = upload_file.content_type or "image/jpeg"
    if content_type not in ALLOWED_MIME_TYPES:
        guessed, _ = mimetypes.guess_type(upload_file.filename or "")
        if guessed in ALLOWED_MIME_TYPES:
            content_type = guessed
        else:
            raise ValueError(
                f"Unsupported file type: {content_type}. "
                f"Allowed: {', '.join(sorted(ALLOWED_MIME_TYPES))}"
            )

    ext = content_type.split("/")[-1].replace("jpeg", "jpg")
    filename = f"{uuid.uuid4()}.{ext}"

    # Ensure upload directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    dest_path = os.path.join(UPLOAD_DIR, filename)

    try:
        with open(dest_path, "wb") as f:
            f.write(content)
    except OSError as exc:
        logger.error(f"Failed to write image to {dest_path}: {exc}")
        raise RuntimeError(f"Image upload failed: {exc}") from exc

    public_url = f"{BASE_URL.rstrip('/')}/uploads/product-photos/{filename}"
    logger.info(f"Saved image to {dest_path} — public URL: {public_url}")
    return public_url
