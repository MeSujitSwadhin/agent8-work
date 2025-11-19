import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
import os, shutil

from app.utils.pdf_reader import parse_pdf
from app.utils.sheet_reader import parse_sheet
from app.utils.calendar_service import create_event


router = APIRouter()
logger = logging.getLogger("upload_agent")
logging.basicConfig(level=logging.INFO)

SUPPORTED_SHEETS = ["xlsx", "xls", "csv"]
SUPPORTED_PDF = ["pdf"]

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Save temporary file
    os.makedirs("temp", exist_ok=True)
    file_path = f"temp/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Detect file extension
    ext = file.filename.split(".")[-1].lower()

    if ext in SUPPORTED_PDF:
        rows = parse_pdf(file_path)

    elif ext in SUPPORTED_SHEETS:
        rows = parse_sheet(file_path)

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: .{ext} (only PDF, XLSX, XLS, CSV allowed)"
        )

    # Create calendar events
    created_event_ids = []
    for row in rows:
        event = create_event(row)
        created_event_ids.append(event["id"])

    return {
        "status": "success",
        "fileType": ext,
        "rowsReceived": len(rows),
        "eventsCreated": created_event_ids
    }