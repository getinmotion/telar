"""Extract plain text from uploaded files (.txt, .md, .pdf, .csv, .xlsx)."""

import io
from pathlib import Path

import pandas as pd
import pdfplumber


def extract_text(filename: str, file_bytes: bytes) -> str:
    """Detect file type by extension and extract plain text content."""
    ext = Path(filename).suffix.lower()

    if ext in (".txt", ".md"):
        return _extract_plain_text(file_bytes)
    if ext == ".pdf":
        return _extract_pdf(file_bytes)
    if ext == ".csv":
        return _extract_csv(file_bytes)
    if ext == ".xlsx":
        return _extract_xlsx(file_bytes)

    raise ValueError(f"Unsupported file type: {ext}")


def _extract_plain_text(file_bytes: bytes) -> str:
    try:
        return file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        return file_bytes.decode("latin-1")


def _extract_pdf(file_bytes: bytes) -> str:
    pages_text = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                pages_text.append(text)
    return "\n\n".join(pages_text)


def _extract_csv(file_bytes: bytes) -> str:
    df = pd.read_csv(io.BytesIO(file_bytes))
    return df.to_string(index=False)


def _extract_xlsx(file_bytes: bytes) -> str:
    sheets = pd.read_excel(io.BytesIO(file_bytes), sheet_name=None)
    parts = []
    for sheet_name, df in sheets.items():
        parts.append(f"## {sheet_name}\n\n{df.to_string(index=False)}")
    return "\n\n".join(parts)


FILE_TYPE_MAP = {
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".pdf": "application/pdf",
    ".csv": "text/csv",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}


def get_file_type(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    return FILE_TYPE_MAP.get(ext, "application/octet-stream")
