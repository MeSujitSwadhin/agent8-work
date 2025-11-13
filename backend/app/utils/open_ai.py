import os
import uuid
import base64
from fastapi import HTTPException
from openai import OpenAI
from dotenv import load_dotenv
from app.utils.google_drive import upload_file_to_drive

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_image_and_upload(topic: str, count: int = 2):
    """
    Generate multiple DALL·E 3 images (1 per request) and upload to Google Drive.
    """
    if not topic or not topic.strip():
        raise HTTPException(status_code=400, detail="Topic is required")

    folder = os.path.join("public", "generated_images")
    os.makedirs(folder, exist_ok=True)
    base_url = os.getenv("BASE_URL", "/public/generated_images/").rstrip("/")
    safe_topic = "".join(c if c.isalnum() or c in ("_", "-") else "_" for c in topic.strip())

    image_metadata = []

    for i in range(count):
        try:
            image_result = client.images.generate(
                model="dall-e-3",
                prompt=(
                    f"Generate a clean, high-quality social media banner for the topic: {topic}. "
                    "Modern, minimal, brand-safe, suitable for LinkedIn and other platforms."
                ),
                size="1024x1024",
                response_format="b64_json",
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OpenAI image generation failed: {e}")

        if not image_result.data or len(image_result.data) == 0:
            raise HTTPException(status_code=500, detail="Image generation returned empty data")

        item = image_result.data[0]  # only one image per call
        image_data = base64.b64decode(item.b64_json)

        filename = f"{safe_topic}_{uuid.uuid4().hex}_{i+1}.png"
        local_path = os.path.join(folder, filename)

        with open(local_path, "wb") as f:
            f.write(image_data)

        public_image_url = f"{base_url}/{filename}"

        try:
            file_id, drive_public_url = upload_file_to_drive(local_path, filename)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Google Drive upload failed: {e}")

        image_metadata.append({
            "publicImageUrl": public_image_url,
            "googleDriveImageUrl": drive_public_url,
            "googleDriveFileId": file_id,
        })

    return image_metadata
