import os
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2.credentials import Credentials
from dotenv import load_dotenv

load_dotenv()

def upload_file_to_drive(local_path: str, filename: str):
    """
    Uploads a file to a specific Google Drive folder.
    Returns: (file_id, public_url)
    """
    DRIVE_FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
    if not DRIVE_FOLDER_ID:
        raise ValueError("GOOGLE_DRIVE_FOLDER_ID is not set in environment")

    creds = Credentials(
        token=os.getenv("GOOGLE_DRIVE_ACCESS_TOKEN"),
        refresh_token=os.getenv("GOOGLE_DRIVE_REFRESH_TOKEN"),
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
        token_uri="https://oauth2.googleapis.com/token",
    )

    service = build("drive", "v3", credentials=creds)

    file_metadata = {
        "name": filename,
        "parents": [DRIVE_FOLDER_ID],
    }

    media = MediaFileUpload(local_path, mimetype="image/png")

    file = (
        service.files()
        .create(
            body=file_metadata,
            media_body=media,
            fields="id, webViewLink, webContentLink",
        )
        .execute()
    )

    file_id = file.get("id")
    if not file_id:
        raise RuntimeError("Failed to get file ID from Google Drive response")

    # Make file public
    service.permissions().create(
        fileId=file_id,
        body={"role": "reader", "type": "anyone"},
    ).execute()

    # Public direct-view URL
    public_url = f"https://drive.google.com/uc?id={file_id}"

    return file_id, public_url